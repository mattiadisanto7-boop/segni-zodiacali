export const signs=[
 {name:"Ariete",symbol:"♈",dates:"21 marzo – 19 aprile",sample:"5 aprile",element:"Fuoco",quality:"Cardinale",planet:"Marte",traits:["impulsivo","coraggioso","competitivo"]},
 {name:"Toro",symbol:"♉",dates:"20 aprile – 20 maggio",sample:"28 aprile",element:"Terra",quality:"Fisso",planet:"Venere",traits:["concreto","paziente","tenace"]},
 {name:"Gemelli",symbol:"♊",dates:"21 maggio – 20 giugno",sample:"2 giugno",element:"Aria",quality:"Mutevole",planet:"Mercurio",traits:["curioso","comunicativo","versatile"]},
 {name:"Cancro",symbol:"♋",dates:"21 giugno – 22 luglio",sample:"14 luglio",element:"Acqua",quality:"Cardinale",planet:"Luna",traits:["protettivo","sensibile","intuitivo"]},
 {name:"Leone",symbol:"♌",dates:"23 luglio – 22 agosto",sample:"10 agosto",element:"Fuoco",quality:"Fisso",planet:"Sole",traits:["carismatico","generoso","fiero"]},
 {name:"Vergine",symbol:"♍",dates:"23 agosto – 22 settembre",sample:"9 settembre",element:"Terra",quality:"Mutevole",planet:"Mercurio",traits:["preciso","pratico","osservatore"]},
 {name:"Bilancia",symbol:"♎",dates:"23 settembre – 22 ottobre",sample:"7 ottobre",element:"Aria",quality:"Cardinale",planet:"Venere",traits:["diplomatico","armonioso","socievole"]},
 {name:"Scorpione",symbol:"♏",dates:"23 ottobre – 21 novembre",sample:"8 novembre",element:"Acqua",quality:"Fisso",planet:"Plutone",traits:["intenso","magnetico","determinato"]},
 {name:"Sagittario",symbol:"♐",dates:"22 novembre – 21 dicembre",sample:"5 dicembre",element:"Fuoco",quality:"Mutevole",planet:"Giove",traits:["avventuroso","ottimista","diretto"]},
 {name:"Capricorno",symbol:"♑",dates:"22 dicembre – 19 gennaio",sample:"2 gennaio",element:"Terra",quality:"Cardinale",planet:"Saturno",traits:["ambizioso","disciplinato","affidabile"]},
 {name:"Acquario",symbol:"♒",dates:"20 gennaio – 18 febbraio",sample:"7 febbraio",element:"Aria",quality:"Fisso",planet:"Urano",traits:["originale","indipendente","visionario"]},
 {name:"Pesci",symbol:"♓",dates:"19 febbraio – 20 marzo",sample:"12 marzo",element:"Acqua",quality:"Mutevole",planet:"Nettuno",traits:["empatico","creativo","sognatore"]}
];

export const modeInfo={
 identikit:{title:"Identikit",description:"Carattere, elemento e pianeta"},
 calendar:{title:"Calendario",description:"Indovina dalla data di nascita"},
 element:{title:"Quattro elementi",description:"Fuoco, Terra, Aria o Acqua"},
 truefalse:{title:"Vero o falso",description:"Quanto conosci ogni segno?"},
 intruder:{title:"Trova l’intruso",description:"Uno dei quattro non appartiene al gruppo"},
 symbol:{title:"Simboli",description:"Riconosci i glifi zodiacali"},
 planet:{title:"Pianeti",description:"Abbina il pianeta governatore"},
 mixed:{title:"Percorso misto",description:"Tutte le categorie insieme"},
 blitz:{title:"Blitz 60″",description:"Più risposte possibili in un minuto"}
};

export const soloModes=["identikit","calendar","element","truefalse","intruder","symbol","planet","mixed","blitz"];
export const onlineModes=["mixed","identikit","calendar","element","truefalse","intruder","symbol","planet"];
const shuffle=(items,rng=Math.random)=>[...items].sort(()=>rng()-.5);
const pick=(items,rng=Math.random)=>items[Math.floor(rng()*items.length)];

export function makeQuestion(requestedMode="mixed",rng=Math.random){
 const available=["identikit","calendar","element","truefalse","intruder","symbol","planet"];
 const mode=requestedMode==="mixed"||requestedMode==="blitz"?pick(available,rng):requestedMode;
 const target=pick(signs,rng); let prompt="",answer=target.name,options=[],explanation="";
 if(mode==="identikit"){
  prompt=`Sono ${target.traits.join(", ")}. Appartengo a ${target.element} e mi governa ${target.planet}. Chi sono?`;
  explanation=`${target.symbol} ${target.name} · ${target.dates}`;
 } else if(mode==="calendar"){
  prompt=`Chi nasce il ${target.sample} di che segno è?`;
  explanation=`${target.name}: ${target.dates}.`;
 } else if(mode==="element"){
  prompt=`A quale elemento appartiene ${target.symbol} ${target.name}?`;answer=target.element;
  options=["Fuoco","Terra","Aria","Acqua"];explanation=`${target.name} appartiene all’elemento ${target.element}.`;
 } else if(mode==="truefalse"){
  const field=pick(["element","quality","planet"],rng),truth=rng()>.5;
  const other=pick(signs.filter(s=>s[field]!==target[field]),rng),value=truth?target[field]:other[field];
  const label=field==="element"?"ha come elemento":field==="quality"?"ha modalità":"è governato da";
  prompt=`${target.symbol} ${target.name} ${label} ${value}.`;answer=truth?"Vero":"Falso";options=["Vero","Falso"];
  explanation=`${target.name}: ${target.element}, ${target.quality}, governato da ${target.planet}.`;
 } else if(mode==="intruder"){
  const group=shuffle(signs.filter(s=>s.element===target.element),rng).slice(0,3),outsider=pick(signs.filter(s=>s.element!==target.element),rng);
  prompt=`Tre sono segni di ${target.element}. Qual è l’intruso?`;answer=outsider.name;options=shuffle([...group,outsider],rng).map(s=>s.name);
  explanation=`${outsider.name} è ${outsider.element}; gli altri tre sono ${target.element}.`;
 } else if(mode==="symbol"){
  prompt=`Quale segno è rappresentato dal simbolo ${target.symbol}?`;explanation=`${target.symbol} è il simbolo di ${target.name}.`;
 } else if(mode==="planet"){
  prompt=`Qual è il pianeta governatore di ${target.symbol} ${target.name}?`;answer=target.planet;
  const planets=[...new Set(signs.map(s=>s.planet))];options=shuffle([target.planet,...shuffle(planets.filter(p=>p!==target.planet),rng).slice(0,3)],rng);
  explanation=`${target.name} è governato da ${target.planet}.`;
 }
 if(!options.length)options=shuffle([target,...shuffle(signs.filter(s=>s.name!==target.name),rng).slice(0,3)],rng).map(s=>s.name);
 return{id:`${Date.now()}-${Math.floor(rng()*1e9)}`,mode,prompt,answer,options,explanation,symbol:target.symbol};
}

export function buildQuestionSet(mode,count,rng=Math.random){
 const result=[],seen=new Set();let guard=0;
 while(result.length<count&&guard++<count*20){const q=makeQuestion(mode,rng),key=`${q.mode}:${q.prompt}`;if(!seen.has(key)){seen.add(key);result.push(q)}}
 while(result.length<count)result.push(makeQuestion(mode,rng));return result;
}

export function publicQuestion(q,revealed=false){
 if(!q)return null;const {answer,explanation,...safe}=q;return revealed?{...safe,answer,explanation}:safe;
}
