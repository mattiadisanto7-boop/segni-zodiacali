import test from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {setTimeout as wait} from "node:timers/promises";

const port=18000+Math.floor(Math.random()*8000),base=`http://127.0.0.1:${port}`;
let processHandle,serverLog="";

async function request(path,data,allowError=false){
 const response=await fetch(`${base}${path}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)}),value=await response.json();
 if(!response.ok&&!allowError)throw new Error(`${response.status}: ${value.error}`);
 return{status:response.status,...value};
}
const credentials=(session,extra={})=>({playerId:session.playerId,token:session.token,...extra});
async function snapshot(session){
 const controller=new AbortController(),response=await fetch(`${base}/api/events?code=${session.code}&playerId=${session.playerId}&token=${session.token}`,{signal:controller.signal}),reader=response.body.getReader(),decoder=new TextDecoder();let buffer="";
 try{for(;;){const{done,value}=await reader.read();if(done)throw new Error("Stream SSE terminato");buffer+=decoder.decode(value,{stream:true});const match=buffer.match(/(?:^|\n)data: ([^\n]+)\n/);if(match)return JSON.parse(match[1])}}finally{controller.abort();reader.cancel().catch(()=>{})}
}
async function until(session,predicate,label,timeout=2500){const start=Date.now();while(Date.now()-start<timeout){const state=await snapshot(session);if(predicate(state))return state;await wait(12)}throw new Error(`Timeout: ${label}\n${serverLog}`)}

test.before(async()=>{
 processHandle=spawn(process.execPath,["server.mjs"],{cwd:new URL("..",import.meta.url),env:{...process.env,PORT:String(port),ZODIAC_ROUND_MS:"900",ZODIAC_PROGRESSIVE_REVEAL_MS:"250",ZODIAC_BET_MS:"900",ZODIAC_REVEAL_MS:"35",ZODIAC_TILE_REVEAL_MS:"1200"},stdio:["ignore","pipe","pipe"]});
 processHandle.stdout.on("data",chunk=>serverLog+=chunk);processHandle.stderr.on("data",chunk=>serverLog+=chunk);
 for(let attempt=0;attempt<80;attempt++){try{const response=await fetch(`${base}/api/health`);if(response.ok)return}catch{}await wait(25)}
 throw new Error(`Server di test non avviato\n${serverLog}`);
});
test.after(()=>{processHandle?.kill("SIGTERM")});

test("l’health check identifica senza ambiguità la versione distribuita",async()=>{
 const response=await fetch(`${base}/api/health`),health=await response.json();
 assert.equal(response.status,200);assert.equal(health.ok,true);assert.equal(health.version,"6.2.0");assert.equal(health.roundSeconds,.9);assert.equal(health.progressiveRevealSeconds,.25);
 assert.deepEqual(health.features,["guesswho-online-vocale","profilo-264-scene","tessere-valori-ricalibrati","stanza-online-conservata","domande-60-secondi","audio-celeste","costellazioni-rotazione-360"]);
});

test("il protocollo online attraversa le quattro fasi senza rivelare le risposte",async()=>{
 const host=await request("/api/rooms",{name:"Aurora",mode:"championship",rounds:5}),guest=await request(`/api/rooms/${host.code}/join`,{name:"Orione"});
 await request(`/api/rooms/${host.code}/start`,credentials(host));
 const expected=[...Array(4).fill("hot"),...Array(4).fill("bet"),...Array(4).fill("slow"),"steal"];
 for(let index=0;index<expected.length;index++){
  const phase=expected[index],initialStatus=phase==="bet"?"betting":"playing";
  let state=await until(host,value=>value.round===index+1&&value.status===initialStatus,`inizio turno ${index+1}`);
  assert.equal(state.settings.rounds,16);assert.equal(state.phase,phase);
  if(index===12){assert.equal(state.phaseInfo.title,"Ruba i punti");break}
  if(phase==="bet"){
   assert.equal(state.question,null);assert.equal(state.myBet,null);
   await request(`/api/rooms/${host.code}/bet`,credentials(host,{amount:350}));
   const guestWaiting=await until(guest,value=>value.status==="betting"&&value.betPlayerIds.includes(host.playerId),"puntata privata");
   assert.equal(guestWaiting.myBet,null);
   await request(`/api/rooms/${host.code}/bet`,credentials(guest,{amount:100}));
   state=await until(host,value=>value.status==="playing"&&value.round===index+1,"domanda dopo le puntate");assert.equal(state.myBet,350);
  }
  assert.ok(state.question);assert.equal("answer" in state.question,false);assert.equal("explanation" in state.question,false);
  const progressive=phase==="slow"?state.question:null;
  if(progressive){
   assert.ok(progressive.visibleWords>=1);assert.ok(progressive.visibleWords<progressive.totalWords);
   assert.match(progressive.prompt,/…$/);
  }
  if(phase==="bet"&&index===4){
   const scoreBefore=state.players.find(player=>player.id===host.playerId).score;
   await request(`/api/rooms/${host.code}/answer`,credentials(guest,{choice:state.question.options[0]}));
   const reveal=await until(host,value=>value.status==="reveal"&&value.round===index+1,"penalità scommessa senza risposta");
   assert.equal(reveal.answers[host.playerId].choice,null);assert.equal(reveal.answers[host.playerId].timedOut,true);assert.equal(reveal.answers[host.playerId].points,-350);
   assert.equal(reveal.players.find(player=>player.id===host.playerId).score,scoreBefore-350);continue;
  }
  if(phase==="slow"&&index===8){
   state=await until(host,value=>value.status==="playing"&&value.round===index+1&&value.question?.visibleWords===value.question?.totalWords,"testo completo prima della scadenza");
   assert.doesNotMatch(state.question.prompt,/…$/);assert.ok(state.roundEndsAt-Date.now()>250);
  }
  const first=state.question.options[0],second=state.question.options[1];
  await request(`/api/rooms/${host.code}/answer`,credentials(host,{choice:first}));
  await request(`/api/rooms/${host.code}/answer`,credentials(guest,{choice:second}),phase==="slow");
  const reveal=await until(host,value=>value.status==="reveal"&&value.round===index+1,`risultato turno ${index+1}`);
  assert.ok(reveal.question.answer);assert.ok(reveal.question.explanation);assert.ok(Object.keys(reveal.answers).length>=1);
  if(progressive){assert.doesNotMatch(reveal.question.prompt,/…$/);assert.ok(reveal.question.prompt.split(/\s+/).length>=progressive.totalWords)}
 }
});

test("il server mostra la carta d’attacco ma sigilla la categoria al difensore",async()=>{
 const host=await request("/api/rooms",{name:"Lyra",mode:"tiles"}),guest=await request(`/api/rooms/${host.code}/join`,{name:"Vega"});
 await request(`/api/rooms/${host.code}/start`,credentials(host));
 const hostView=await until(host,value=>value.status==="tile-playing"&&value.tile?.phase==="category","mazzo tessere host"),guestView=await until(guest,value=>value.status==="tile-playing"&&value.tile?.phase==="category","mazzo tessere guest");
 assert.equal(hostView.tile.myCount,6);assert.equal(guestView.tile.myCount,6);assert.equal(hostView.tile.opponentChoices.length,2);assert.equal("values" in hostView.tile.opponentChoices[0],false);
 const active=hostView.tile.activePlayerId===host.playerId?host:guest,defender=active===host?guest:host,activeView=active===host?hostView:guestView,defenderView=defender===host?hostView:guestView,category=Object.keys(activeView.tile.myTop[0].values)[0];
 assert.deepEqual(defenderView.tile.attackerCard.values,activeView.tile.myTop[0].values);assert.equal(defenderView.tile.category,null);
  await request(`/api/rooms/${host.code}/tile-category`,credentials(active,{category}));
  const defenseView=await until(defender,value=>value.tile?.phase==="defense","scelta difensore");
 const attackView=await until(active,value=>value.tile?.phase==="defense","categoria privata dell’attaccante");
 assert.ok(defenseView.tile.myTop[0].values);assert.ok(defenseView.tile.attackerCard.values);assert.equal(defenseView.tile.category,null);assert.equal(defenseView.tile.categoryLocked,true);assert.equal("values" in defenseView.tile.opponentChoices[0],false);
 assert.equal(attackView.tile.category,category);
 await request(`/api/rooms/${host.code}/tile-defense`,credentials(defender,{index:0}));
 const reveal=await until(active,value=>value.tile?.phase==="reveal","rivelazione tessere");
 assert.equal(reveal.tile.category,category);assert.ok(reveal.tile.lastBattle.attacker.values);assert.ok(reveal.tile.lastBattle.defender.values);assert.ok(["attacker","defender","tie"].includes(reveal.tile.lastBattle.result.winner));
 assert.equal(reveal.players.reduce((sum,player)=>sum+player.score,0),12);
});

test("Indovina Chi online assegna segreti privati, alterna i turni e riusa la stanza",async()=>{
 const host=await request("/api/rooms",{name:"Selene",mode:"guesswho-online"}),guest=await request(`/api/rooms/${host.code}/join`,{name:"Atlas"});
 await request(`/api/rooms/${host.code}/start`,credentials(host));
 const hostView=await until(host,value=>value.status==="guesswho-playing"&&value.guessWho?.mySecret,"identità host"),guestView=await until(guest,value=>value.status==="guesswho-playing"&&value.guessWho?.mySecret,"identità guest");
 assert.equal(hostView.question,null);assert.equal(guestView.question,null);assert.equal(hostView.guessWho.opponentSecret,null);assert.equal(guestView.guessWho.opponentSecret,null);assert.notEqual(hostView.guessWho.mySecret.name,guestView.guessWho.mySecret.name);
 const matchId=hostView.guessWho.matchId,active=hostView.guessWho.turnPlayerId===host.playerId?host:guest,defender=active===host?guest:host,opponentSecret=active===host?guestView.guessWho.mySecret.name:hostView.guessWho.mySecret.name,wrong=["Ariete","Toro","Gemelli"].find(name=>name!==opponentSecret);
 const failed=await request(`/api/rooms/${host.code}/guesswho-accuse`,credentials(active,{sign:wrong}));assert.equal(failed.correct,false);
 const switched=await until(defender,value=>value.guessWho?.turnPlayerId===defender.playerId&&value.guessWho?.lastAccusation?.correct===false,"turno dopo accusa errata");assert.equal(switched.guessWho.lastAccusation.sign,wrong);
 const correctSecret=defender===host?guestView.guessWho.mySecret.name:hostView.guessWho.mySecret.name,won=await request(`/api/rooms/${host.code}/guesswho-accuse`,credentials(defender,{sign:correctSecret}));assert.equal(won.correct,true);
 const finish=await until(host,value=>value.status==="finished"&&value.guessWho?.winnerId===defender.playerId,"vittoria Indovina Chi");assert.equal(finish.guessWho.opponentSecret.name,guestView.guessWho.mySecret.name);assert.equal(finish.players.length,2);
 await request(`/api/rooms/${host.code}/rematch`,credentials(host));
 const rematch=await until(host,value=>value.status==="guesswho-playing"&&value.guessWho?.matchId!==matchId,"rivincita nella stessa stanza");assert.equal(rematch.code,host.code);assert.deepEqual(rematch.players.map(player=>player.id).sort(),[host.playerId,guest.playerId].sort());assert.equal(rematch.question,null);
 const passing=rematch.guessWho.turnPlayerId===host.playerId?host:guest,receiving=passing===host?guest:host;await request(`/api/rooms/${host.code}/guesswho-pass`,credentials(passing));await until(receiving,value=>value.guessWho?.turnPlayerId===receiving.playerId,"passaggio volontario del turno");
});
