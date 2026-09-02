import http from "node:http";
import {createReadStream,existsSync,statSync} from "node:fs";
import {extname,join,normalize,resolve} from "node:path";
import {randomBytes,randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";
import {buildQuestionSet,onlineModes,publicQuestion} from "./src/gameData.js";

const PORT=Number(process.env.PORT||10000),root=fileURLToPath(new URL("./dist/",import.meta.url));
const rooms=new Map(),ROUND_MS=20000,REVEAL_MS=4000,ROOM_TTL=30*60*1000;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".json":"application/json; charset=utf-8",".webmanifest":"application/manifest+json",".map":"application/json"};
const cleanName=value=>String(value||"").trim().replace(/\s+/g," ").slice(0,18);
const code=()=>{let c;do c=randomBytes(4).toString("base64url").replace(/[-_0O1I]/g,"A").slice(0,5).toUpperCase();while(rooms.has(c));return c};
const json=(res,status,data)=>{res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(data))};
const body=req=>new Promise((ok,bad)=>{let raw="";req.on("data",c=>{raw+=c;if(raw.length>10000)req.destroy()});req.on("end",()=>{try{ok(raw?JSON.parse(raw):{})}catch{bad(new Error("JSON non valido"))}});req.on("error",bad)});
const auth=(room,playerId,token)=>room?.players.find(p=>p.id===playerId&&p.token===token);
function snapshot(room){return{code:room.code,status:room.status,hostId:room.hostId,settings:room.settings,round:Math.min(room.round+1,room.settings.rounds),roundEndsAt:room.status==="playing"?room.roundStartedAt+ROUND_MS:null,players:room.players.map(({token,...p})=>p),question:publicQuestion(room.questions[room.round],room.status==="reveal"||room.status==="finished"),answeredPlayerIds:Object.keys(room.answers),answers:room.status==="reveal"?Object.fromEntries(Object.entries(room.answers).map(([id,a])=>[id,{choice:a.choice,correct:a.correct,points:a.points}])):{},expiresAt:room.expiresAt}}
function broadcast(room){const payload=`data: ${JSON.stringify(snapshot(room))}\n\n`;for(const stream of room.streams.values()){try{stream.write(payload)}catch{}}}
function touch(room){room.expiresAt=Date.now()+ROOM_TTL}
function clearTimers(room){if(room.roundTimer)clearTimeout(room.roundTimer);if(room.nextTimer)clearTimeout(room.nextTimer)}
function startRound(room){room.status="playing";room.answers={};room.roundStartedAt=Date.now();touch(room);broadcast(room);room.roundTimer=setTimeout(()=>reveal(room),ROUND_MS)}
function reveal(room){if(room.status!=="playing")return;clearTimeout(room.roundTimer);const q=room.questions[room.round];for(const player of room.players){const a=room.answers[player.id];if(!a)continue;a.correct=a.choice===q.answer;a.points=a.correct?100+Math.max(0,Math.round((ROUND_MS-a.elapsed)/400)):0;player.score+=a.points}room.status="reveal";broadcast(room);room.nextTimer=setTimeout(()=>{room.round++;if(room.round>=room.settings.rounds){room.status="finished";touch(room);broadcast(room)}else startRound(room)},REVEAL_MS)}
function newMatch(room){clearTimers(room);room.questions=buildQuestionSet(room.settings.mode,room.settings.rounds);room.round=0;room.answers={};room.players.forEach(p=>p.score=0);startRound(room)}
function createRoom(name,settings={}){const roomCode=code(),player={id:randomUUID(),token:randomUUID(),name,score:0,connected:true};const room={code:roomCode,hostId:player.id,players:[player],streams:new Map(),status:"lobby",settings:{mode:onlineModes.includes(settings.mode)?settings.mode:"mixed",rounds:[5,10,15].includes(Number(settings.rounds))?Number(settings.rounds):10},questions:[],round:0,answers:{},expiresAt:Date.now()+ROOM_TTL};rooms.set(roomCode,room);return{room,player}}
function session(room,player){return{code:room.code,playerId:player.id,token:player.token,state:snapshot(room)}}

const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,`http://${req.headers.host||"localhost"}`),parts=url.pathname.split("/").filter(Boolean);
 try{
  if(url.pathname==="/api/health")return json(res,200,{ok:true,rooms:rooms.size});
  if(req.method==="POST"&&url.pathname==="/api/rooms"){
   const data=await body(req),name=cleanName(data.name);if(name.length<2)return json(res,400,{error:"Inserisci un nome di almeno 2 caratteri."});
   const {room,player}=createRoom(name,data);return json(res,201,session(room,player));
  }
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
   if(action==="answer"){if(room.status!=="playing")return json(res,409,{error:"Non puoi rispondere ora."});if(room.answers[player.id])return json(res,409,{error:"Hai già risposto."});const q=room.questions[room.round];if(!q.options.includes(data.choice))return json(res,400,{error:"Risposta non valida."});room.answers[player.id]={choice:data.choice,elapsed:Math.min(ROUND_MS,Date.now()-room.roundStartedAt)};broadcast(room);if(Object.keys(room.answers).length===room.players.length)reveal(room);return json(res,200,{ok:true})}
   if(action==="rematch"){if(player.id!==room.hostId)return json(res,403,{error:"Solo chi ha creato la stanza può avviare la rivincita."});if(room.status!=="finished")return json(res,409,{error:"La partita non è ancora finita."});newMatch(room);return json(res,200,{ok:true})}
  }
  if(url.pathname.startsWith("/api/"))return json(res,404,{error:"Operazione non trovata."});
  if(!existsSync(root))return json(res,503,{error:"Applicazione non compilata. Esegui npm run build."});
  const relative=url.pathname==="/"?"index.html":normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/,"").replace(/^\//,"");let file=resolve(join(root,relative));if(!file.startsWith(resolve(root)))return json(res,403,{error:"Accesso negato."});
  if(!existsSync(file)||statSync(file).isDirectory())file=join(root,"index.html");res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":file.endsWith("index.html")?"no-cache":"public, max-age=31536000, immutable"});createReadStream(file).pipe(res);
 }catch(error){console.error(error);if(!res.headersSent)json(res,500,{error:"Qualcosa è andato storto. Riprova."});else res.end()}
});
setInterval(()=>{const now=Date.now();for(const [key,room]of rooms)if(room.expiresAt<now){clearTimers(room);for(const stream of room.streams.values())stream.end();rooms.delete(key)}},60000).unref();
server.listen(PORT,"0.0.0.0",()=>console.log(`Zodiaco Arena attiva sulla porta ${PORT}`));
