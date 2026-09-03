import http from "node:http";
import {createReadStream,existsSync,statSync} from "node:fs";
import {extname,join,normalize,resolve} from "node:path";
import {randomBytes,randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";
import {buildQuestionSet,onlineModes,publicQuestion,signs} from "./src/gameData.js";
import {betOptions,phaseForRound,phaseInfo,resolveTileBattle,shuffledTiles,speedPoints,tileCategories} from "./src/competitiveData.js";
import {APP_VERSION} from "./src/version.js";

const PORT=Number(process.env.PORT||10000),root=fileURLToPath(new URL("./dist/",import.meta.url));
const rooms=new Map(),ROUND_MS=Number(process.env.ZODIAC_ROUND_MS||60000),PROGRESSIVE_REVEAL_MS=Math.min(ROUND_MS,Number(process.env.ZODIAC_PROGRESSIVE_REVEAL_MS||30000)),BET_MS=Number(process.env.ZODIAC_BET_MS||15000),REVEAL_MS=Number(process.env.ZODIAC_REVEAL_MS||4000),TILE_REVEAL_MS=Number(process.env.ZODIAC_TILE_REVEAL_MS||2600),ROOM_TTL=30*60*1000;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".json":"application/json; charset=utf-8",".webmanifest":"application/manifest+json",".map":"application/json"};
const cleanName=value=>String(value||"").trim().replace(/\s+/g," ").slice(0,18);
const code=()=>{let c;do c=randomBytes(4).toString("base64url").replace(/[-_0O1I]/g,"A").slice(0,5).toUpperCase();while(rooms.has(c));return c};
const json=(res,status,data)=>{res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(data))};
const body=req=>new Promise((ok,bad)=>{let raw="";req.on("data",chunk=>{raw+=chunk;if(raw.length>10000)req.destroy()});req.on("end",()=>{try{ok(raw?JSON.parse(raw):{})}catch{bad(new Error("JSON non valido"))}});req.on("error",bad)});
const auth=(room,playerId,token)=>room?.players.find(player=>player.id===playerId&&player.token===token);
const publicTile=tile=>tile?{name:tile.name,symbol:tile.symbol}:null;

function tileSnapshot(room,viewerId){
 const game=room.tile;if(!game)return null;
 const opponentId=room.players.find(player=>player.id!==viewerId)?.id,activeId=game.activePlayerId,defenderId=room.players.find(player=>player.id!==activeId)?.id,myDeck=game.decks[viewerId]||[],opponentDeck=game.decks[opponentId]||[];
 const categoryVisible=viewerId===activeId||game.phase==="reveal";
 return{phase:game.phase,category:categoryVisible?game.category:null,categoryLocked:game.phase!=="category",battle:game.battle,activePlayerId:activeId,defenderId,myCount:myDeck.length,opponentCount:opponentDeck.length,myTop:myDeck.slice(0,2),opponentChoices:opponentDeck.slice(0,2).map(publicTile),attackerCard:game.decks[activeId]?.[0]||null,lastBattle:game.lastBattle};
}

function guessWhoSnapshot(room,viewerId){
 const game=room.guessWho;if(!game)return null;
 const opponentId=room.players.find(player=>player.id!==viewerId)?.id,toPublic=name=>{const sign=signs.find(item=>item.name===name);return sign?{name:sign.name,symbol:sign.symbol}:null};
 return{matchId:game.matchId,turnPlayerId:game.turnPlayerId,winnerId:game.winnerId,lastAccusation:game.lastAccusation,chosenPlayerIds:Object.keys(game.secrets),mySecret:toPublic(game.secrets[viewerId]),opponentSecret:room.status==="finished"?toPublic(game.secrets[opponentId]):null};
}

function questionSnapshot(room,question,revealed){
 const visible=publicQuestion(question,revealed);if(!visible||revealed||question.phase!=="slow"||room.status!=="playing")return visible;
 const words=visible.prompt.split(/\s+/),elapsed=Math.max(0,Date.now()-room.roundStartedAt),count=Math.max(1,Math.min(words.length,Math.floor(elapsed/PROGRESSIVE_REVEAL_MS*words.length)+1));
 return{...visible,prompt:`${words.slice(0,count).join(" ")}${count<words.length?" …":""}`,visibleWords:count,totalWords:words.length};
}

function snapshot(room,viewerId){
 const q=room.questions[room.round],revealed=room.status==="reveal"||room.status==="finished",showQuestion=!["lobby","betting"].includes(room.status)&&room.settings.mode!=="tiles";
 return{version:APP_VERSION,code:room.code,status:room.status,hostId:room.hostId,settings:room.settings,round:Math.min(room.round+1,room.settings.rounds||1),roundEndsAt:room.status==="playing"?room.roundStartedAt+ROUND_MS:room.status==="betting"?room.betStartedAt+BET_MS:null,phase:q?.phase||null,phaseInfo:q?.phase?phaseInfo[q.phase]:null,phaseNumber:q?.phase?Math.floor(room.round/4)+1:null,players:room.players.map(({token,...player})=>player),question:showQuestion?questionSnapshot(room,q,revealed):null,answeredPlayerIds:Object.keys(room.answers||{}),betPlayerIds:Object.keys(room.bets||{}),myBet:room.bets?.[viewerId]||null,answers:room.status==="reveal"?Object.fromEntries(Object.entries(room.answers).map(([id,a])=>[id,{choice:a.choice,correct:a.correct,points:a.points||0,timedOut:!!a.timedOut}])):{},roundOutcome:revealed?room.roundOutcome:null,tile:tileSnapshot(room,viewerId),guessWho:guessWhoSnapshot(room,viewerId),expiresAt:room.expiresAt};
}
function broadcast(room){for(const [id,stream] of room.streams){try{stream.write(`data: ${JSON.stringify(snapshot(room,id))}\n\n`)}catch{}}}
function touch(room){room.expiresAt=Date.now()+ROOM_TTL}
function clearTimers(room){if(room.roundTimer)clearTimeout(room.roundTimer);if(room.nextTimer)clearTimeout(room.nextTimer);if(room.progressTimer)clearInterval(room.progressTimer);room.roundTimer=null;room.nextTimer=null;room.progressTimer=null}
function scheduleNext(room,delay=REVEAL_MS){room.nextTimer=setTimeout(()=>{room.round++;if(room.round>=room.settings.rounds){room.status="finished";touch(room);broadcast(room)}else startQuestionRound(room)},delay)}

function beginQuestion(room){
 room.status="playing";room.roundStartedAt=Date.now();clearTimeout(room.roundTimer);if(room.progressTimer)clearInterval(room.progressTimer);touch(room);broadcast(room);room.roundTimer=setTimeout(()=>revealQuestion(room),ROUND_MS);if(room.questions[room.round]?.phase==="slow")room.progressTimer=setInterval(()=>{broadcast(room);if(Date.now()-room.roundStartedAt>=PROGRESSIVE_REVEAL_MS){clearInterval(room.progressTimer);room.progressTimer=null}},250);
}
function beginBetting(room){
 room.status="betting";room.betStartedAt=Date.now();touch(room);broadcast(room);room.roundTimer=setTimeout(()=>{for(const player of room.players)if(!room.bets[player.id])room.bets[player.id]=betOptions[0];beginQuestion(room)},BET_MS);
}
function startQuestionRound(room){
 clearTimers(room);room.answers={};room.bets={};room.roundOutcome=null;
 if(room.questions[room.round]?.phase==="bet")beginBetting(room);else beginQuestion(room);
}

function scoreQuestion(room){
 const q=room.questions[room.round],phase=q.phase||"normal";
 if(phase==="bet")for(const player of room.players)if(!room.answers[player.id])room.answers[player.id]={choice:null,elapsed:ROUND_MS,timedOut:true};
 const answers=Object.entries(room.answers).map(([id,a])=>({id,...a}));for(const answer of answers)answer.correct=answer.choice===q.answer;
 if(phase==="hot"){
  const correct=answers.filter(a=>a.correct).sort((a,b)=>a.elapsed-b.elapsed);
  correct.forEach((answer,index)=>answer.points=index===0?speedPoints(answer.elapsed,420,280,ROUND_MS):170);
 }else if(phase==="bet"){
  for(const answer of answers)answer.points=answer.correct?(room.bets[answer.id]||50):-(room.bets[answer.id]||50);
 }else if(phase==="slow"){
  const winner=answers.filter(a=>a.correct).sort((a,b)=>a.elapsed-b.elapsed)[0];if(winner)winner.points=speedPoints(winner.elapsed,520,190,ROUND_MS);
 }else if(phase==="steal"){
  const winner=answers.filter(a=>a.correct).sort((a,b)=>a.elapsed-b.elapsed)[0];
  if(winner){const loser=room.players.find(player=>player.id!==winner.id),amount=Math.min(Math.max(0,loser.score),speedPoints(winner.elapsed,360,100,ROUND_MS));winner.points=amount;loser.score-=amount;room.roundOutcome={winnerId:winner.id,stolen:amount}}
 }else{
  for(const answer of answers)answer.points=answer.correct?100+Math.max(0,Math.round((ROUND_MS-answer.elapsed)/400)):0;
 }
 for(const answer of answers){const stored=room.answers[answer.id];stored.correct=answer.correct;stored.points=answer.points||0;room.players.find(player=>player.id===answer.id).score+=stored.points}
 if(phase==="hot"){const winner=answers.filter(a=>a.correct).sort((a,b)=>a.elapsed-b.elapsed)[0];room.roundOutcome={winnerId:winner?.id||null}}
 if(phase==="slow"){const winner=answers.filter(a=>a.correct).sort((a,b)=>a.elapsed-b.elapsed)[0];room.roundOutcome={winnerId:winner?.id||null}}
 if(phase==="bet")room.roundOutcome={bets:{...room.bets},timedOutPlayerIds:answers.filter(answer=>answer.timedOut).map(answer=>answer.id)};
}
function revealQuestion(room){
 if(room.status!=="playing")return;clearTimeout(room.roundTimer);if(room.progressTimer)clearInterval(room.progressTimer);room.progressTimer=null;scoreQuestion(room);room.status="reveal";touch(room);broadcast(room);scheduleNext(room);
}
function answerQuestion(room,player,choice){
 if(room.status!=="playing")return{status:409,error:"Non puoi rispondere ora."};
 if(room.answers[player.id])return{status:409,error:"Hai già risposto."};
 const q=room.questions[room.round];if(!q.options.includes(choice))return{status:400,error:"Risposta non valida."};
 const elapsed=Math.min(ROUND_MS,Date.now()-room.roundStartedAt);room.answers[player.id]={choice,elapsed};const instant=["slow","steal"].includes(q.phase)&&choice===q.answer;
 if(instant||Object.keys(room.answers).length===room.players.length)revealQuestion(room);else broadcast(room);
 return{status:200,data:{ok:true}};
}

function newQuestionMatch(room){
 const championship=room.settings.mode==="championship",count=championship?16:room.settings.rounds;room.settings.rounds=count;room.questions=buildQuestionSet(championship?"mixed":room.settings.mode,count).map((question,index)=>championship?{...question,phase:phaseForRound(index)}:question);room.tile=null;room.round=0;room.answers={};room.bets={};room.players.forEach(player=>player.score=0);startQuestionRound(room);
}
function newTileMatch(room){
 clearTimers(room);const deck=shuffledTiles(),first=room.players[0].id,second=room.players[1].id;room.questions=[];room.round=0;room.settings.rounds=0;room.answers={};room.bets={};room.tile={decks:{[first]:deck.slice(0,6),[second]:deck.slice(6)},activePlayerId:Math.random()>.5?first:second,phase:"category",category:null,lastBattle:null,battle:1};room.players.forEach(player=>player.score=6);room.status="tile-playing";touch(room);broadcast(room);
}
function newGuessWhoMatch(room){
 clearTimers(room);room.questions=[];room.round=0;room.settings.rounds=1;room.answers={};room.bets={};room.tile=null;room.guessWho={matchId:randomUUID(),secrets:{},turnPlayerId:null,winnerId:null,lastAccusation:null};room.players.forEach(player=>player.score=0);room.status="guesswho-choosing";touch(room);broadcast(room);
}
function newMatch(room){clearTimers(room);room.guessWho=null;if(room.settings.mode==="tiles")newTileMatch(room);else if(room.settings.mode==="guesswho-online")newGuessWhoMatch(room);else newQuestionMatch(room)}
function returnToLobby(room){clearTimers(room);room.status="lobby";room.questions=[];room.round=0;room.answers={};room.bets={};room.tile=null;room.guessWho=null;room.roundOutcome=null;room.players.forEach(player=>player.score=0);touch(room);broadcast(room)}

function resolveOnlineTile(room,defenseIndex){
 const game=room.tile,attackerId=game.activePlayerId,defenderId=room.players.find(player=>player.id!==attackerId).id,attackerDeck=[...game.decks[attackerId]],defenderDeck=[...game.decks[defenderId]],attacker=attackerDeck.shift(),defender=defenderDeck.splice(defenseIndex,1)[0],result=resolveTileBattle(attacker,defender,game.category);let nextActive,winnerId=null;
 if(result.winner==="attacker"){attackerDeck.push(attacker,defender);nextActive=attackerId;winnerId=attackerId}else if(result.winner==="defender"){defenderDeck.push(defender,attacker);nextActive=defenderId;winnerId=defenderId}else{attackerDeck.push(attacker);defenderDeck.push(defender);nextActive=defenderId}
 game.decks[attackerId]=attackerDeck;game.decks[defenderId]=defenderDeck;game.activePlayerId=nextActive;game.phase="reveal";game.lastBattle={attacker,defender,result,category:game.category,attackerId,defenderId,winnerId};
 room.players.find(player=>player.id===attackerId).score=attackerDeck.length;room.players.find(player=>player.id===defenderId).score=defenderDeck.length;broadcast(room);
 if(!attackerDeck.length||!defenderDeck.length){room.nextTimer=setTimeout(()=>{room.status="finished";touch(room);broadcast(room)},TILE_REVEAL_MS);return}
 room.nextTimer=setTimeout(()=>{game.phase="category";game.category=null;game.lastBattle=null;game.battle++;touch(room);broadcast(room)},TILE_REVEAL_MS);
}

function createRoom(name,settings={}){
 const roomCode=code(),player={id:randomUUID(),token:randomUUID(),name,score:0,connected:true},mode=onlineModes.includes(settings.mode)?settings.mode:"championship",rounds=mode==="championship"?16:mode==="tiles"?0:mode==="guesswho-online"?1:[5,10,15].includes(Number(settings.rounds))?Number(settings.rounds):10;
 const room={code:roomCode,hostId:player.id,players:[player],streams:new Map(),status:"lobby",settings:{mode,rounds},questions:[],round:0,answers:{},bets:{},tile:null,guessWho:null,roundOutcome:null,expiresAt:Date.now()+ROOM_TTL};rooms.set(roomCode,room);return{room,player};
}
function session(room,player){return{code:room.code,playerId:player.id,token:player.token,state:snapshot(room,player.id)}}

const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,`http://${req.headers.host||"localhost"}`),parts=url.pathname.split("/").filter(Boolean);
 try{
  if(url.pathname==="/api/health")return json(res,200,{ok:true,version:APP_VERSION,rooms:rooms.size,roundSeconds:ROUND_MS/1000,progressiveRevealSeconds:PROGRESSIVE_REVEAL_MS/1000,features:["guesswho-scelta-privata","lobby-online-persistente","atlante-tema-natale","tessere-totale-360","profilo-264-scene","domande-60-secondi","audio-celeste","costellazioni-rotazione-360"]});
  if(req.method==="POST"&&url.pathname==="/api/rooms"){const data=await body(req),name=cleanName(data.name);if(name.length<2)return json(res,400,{error:"Inserisci un nome di almeno 2 caratteri."});const{room,player}=createRoom(name,data);return json(res,201,session(room,player))}
  if(req.method==="POST"&&parts[0]==="api"&&parts[1]==="rooms"&&parts[3]==="join"){
   const room=rooms.get(parts[2]?.toUpperCase()),data=await body(req),name=cleanName(data.name);if(!room)return json(res,404,{error:"Stanza non trovata."});if(room.status!=="lobby")return json(res,409,{error:"La partita è già iniziata."});if(room.players.length>=2)return json(res,409,{error:"La stanza è già piena."});if(name.length<2)return json(res,400,{error:"Inserisci un nome di almeno 2 caratteri."});
   const player={id:randomUUID(),token:randomUUID(),name,score:0,connected:true};room.players.push(player);touch(room);broadcast(room);return json(res,200,session(room,player));
  }
  if(req.method==="GET"&&url.pathname==="/api/events"){
   const room=rooms.get((url.searchParams.get("code")||"").toUpperCase()),player=auth(room,url.searchParams.get("playerId"),url.searchParams.get("token"));if(!room||!player)return json(res,401,{error:"Sessione non valida."});
   res.writeHead(200,{"content-type":"text/event-stream","cache-control":"no-cache, no-transform","connection":"keep-alive","x-accel-buffering":"no"});res.write(": connected\n\n");room.streams.set(player.id,res);player.connected=true;touch(room);broadcast(room);
   const pulse=setInterval(()=>{try{res.write(": ping\n\n")}catch{}},20000);req.on("close",()=>{clearInterval(pulse);if(room.streams.get(player.id)===res){room.streams.delete(player.id);player.connected=false;broadcast(room)}});return;
  }
  if(req.method==="POST"&&parts[0]==="api"&&parts[1]==="rooms"&&parts.length===4){
   const room=rooms.get(parts[2]?.toUpperCase()),action=parts[3],data=await body(req),player=auth(room,data.playerId,data.token);if(!room||!player)return json(res,401,{error:"Sessione non valida."});touch(room);
   if(action==="start"){if(player.id!==room.hostId)return json(res,403,{error:"Solo chi ha creato la stanza può iniziare."});if(room.players.length!==2)return json(res,409,{error:"Servono due giocatori."});newMatch(room);return json(res,200,{ok:true})}
   if(action==="answer"){const result=answerQuestion(room,player,data.choice);return json(res,result.status,result.data||{error:result.error})}
   if(action==="bet"){if(room.status!=="betting")return json(res,409,{error:"Le scommesse non sono aperte."});if(room.bets[player.id])return json(res,409,{error:"Hai già scommesso."});if(!betOptions.includes(Number(data.amount)))return json(res,400,{error:"Scommessa non valida."});room.bets[player.id]=Number(data.amount);if(Object.keys(room.bets).length===room.players.length){clearTimeout(room.roundTimer);beginQuestion(room)}else broadcast(room);return json(res,200,{ok:true})}
   if(action==="guesswho-secret"){
    const game=room.guessWho,sign=String(data.sign||"");if(room.status!=="guesswho-choosing"||!game)return json(res,409,{error:"La scelta delle identità non è aperta."});if(game.secrets[player.id])return json(res,409,{error:"Hai già confermato la tua identità."});if(!signs.some(item=>item.name===sign))return json(res,400,{error:"Segno non valido."});
    game.secrets[player.id]=sign;if(Object.keys(game.secrets).length===room.players.length){const[first,second]=room.players;game.turnPlayerId=Math.random()>.5?first.id:second.id;room.status="guesswho-playing"}touch(room);broadcast(room);return json(res,200,{ok:true});
   }
   if(action==="guesswho-pass"){
    const game=room.guessWho;if(room.status!=="guesswho-playing"||!game||game.turnPlayerId!==player.id)return json(res,409,{error:"Non puoi passare il turno ora."});
    game.turnPlayerId=room.players.find(item=>item.id!==player.id).id;game.lastAccusation=null;touch(room);broadcast(room);return json(res,200,{ok:true});
   }
   if(action==="guesswho-accuse"){
    const game=room.guessWho,sign=String(data.sign||""),opponent=room.players.find(item=>item.id!==player.id);if(room.status!=="guesswho-playing"||!game||game.turnPlayerId!==player.id)return json(res,409,{error:"Non puoi accusare ora."});if(!signs.some(item=>item.name===sign))return json(res,400,{error:"Segno non valido."});
    const correct=game.secrets[opponent.id]===sign;game.lastAccusation={playerId:player.id,sign,correct};if(correct){game.winnerId=player.id;player.score=1;room.status="finished"}else game.turnPlayerId=opponent.id;touch(room);broadcast(room);return json(res,200,{ok:true,correct});
   }
   if(action==="tile-category"){const game=room.tile;if(room.status!=="tile-playing"||game?.phase!=="category"||game.activePlayerId!==player.id)return json(res,409,{error:"Non puoi scegliere la categoria ora."});if(!tileCategories.some(category=>category.id===data.category))return json(res,400,{error:"Categoria non valida."});game.category=data.category;game.phase="defense";broadcast(room);return json(res,200,{ok:true})}
   if(action==="tile-defense"){const game=room.tile,defenderId=room.players.find(item=>item.id!==game?.activePlayerId)?.id,index=Number(data.index);if(room.status!=="tile-playing"||game?.phase!=="defense"||defenderId!==player.id)return json(res,409,{error:"Non puoi scegliere la tessera ora."});if(!Number.isInteger(index)||index<0||index>=Math.min(2,game.decks[player.id].length))return json(res,400,{error:"Tessera non valida."});resolveOnlineTile(room,index);return json(res,200,{ok:true})}
   if(action==="return-lobby"){if(room.status!=="finished")return json(res,409,{error:"La partita non è ancora terminata."});returnToLobby(room);return json(res,200,{ok:true})}
   if(action==="rematch"){if(player.id!==room.hostId)return json(res,403,{error:"Solo chi ha creato la stanza può avviare la rivincita."});if(room.status!=="finished")return json(res,409,{error:"La partita non è ancora finita."});newMatch(room);return json(res,200,{ok:true})}
  }
  if(url.pathname.startsWith("/api/"))return json(res,404,{error:"Operazione non trovata."});
  if(!existsSync(root))return json(res,503,{error:"Applicazione non compilata. Esegui npm run build."});
  const relative=url.pathname==="/"?"index.html":normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/,"").replace(/^\//,"");let file=resolve(join(root,relative));if(!file.startsWith(resolve(root)))return json(res,403,{error:"Accesso negato."});if(!existsSync(file)||statSync(file).isDirectory())file=join(root,"index.html");res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":file.endsWith("index.html")?"no-cache":"public, max-age=31536000, immutable"});createReadStream(file).pipe(res);
 }catch(error){console.error(error);if(!res.headersSent)json(res,500,{error:"Qualcosa è andato storto. Riprova."});else res.end()}
});
setInterval(()=>{const now=Date.now();for(const[key,room]of rooms)if(room.expiresAt<now){clearTimers(room);for(const stream of room.streams.values())stream.end();rooms.delete(key)}},60000).unref();
server.listen(PORT,"0.0.0.0",()=>console.log(`Zodiaco Arena attiva sulla porta ${PORT}`));
