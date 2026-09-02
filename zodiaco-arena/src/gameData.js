const charts={
 Ariete:{stars:[[16,50,3],[32,34,5],[47,38,3],[61,52,4],[76,49,2]],edges:[[0,1],[1,2],[2,3],[3,4]],myth:"Una linea breve e curva che richiama le corna dell’ariete."},
 Toro:{stars:[[12,20,2],[35,42,4],[51,55,5],[67,42,4],[88,18,2],[49,78,3],[28,88,2]],edges:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]],myth:"La forma a V delle Iadi disegna il volto del toro; le estremità suggeriscono le corna."},
 Gemelli:{stars:[[27,13,5],[70,16,5],[31,37,3],[67,39,3],[25,64,3],[72,65,3],[18,88,4],[79,87,4],[49,48,2]],edges:[[0,2],[2,4],[4,6],[1,3],[3,5],[5,7],[2,8],[8,3]],myth:"Due catene quasi parallele rappresentano i gemelli Castore e Polluce."},
 Cancro:{stars:[[48,12,3],[45,39,5],[24,58,3],[66,61,4],[82,84,2],[36,86,2]],edges:[[0,1],[1,2],[1,3],[3,4],[1,5]],myth:"È una costellazione tenue: una Y irregolare è più difficile da riconoscere."},
 Leone:{stars:[[13,59,3],[28,35,4],[40,18,3],[52,31,5],[46,54,3],[65,70,4],[87,62,3],[77,85,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,1],[4,5],[5,6],[6,7],[7,5]],myth:"La falce del Leone forma testa e criniera, seguita da un triangolo posteriore."},
 Vergine:{stars:[[9,51,2],[29,45,3],[46,55,5],[62,39,3],[84,29,2],[59,66,4],[71,87,5],[36,82,2],[22,65,2]],edges:[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[5,7],[2,8]],myth:"Un disegno ampio e ramificato; Spica è la stella più brillante dello schema."},
 Bilancia:{stars:[[23,23,4],[69,20,3],[82,56,4],[54,81,3],[19,67,3],[47,49,5]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[0,5],[5,2]],myth:"Un quadrilatero inclinato richiama i due piatti e il giogo di una bilancia."},
 Scorpione:{stars:[[14,14,2],[25,26,3],[36,42,5],[48,54,4],[59,66,3],[68,80,4],[80,88,3],[91,78,2],[84,68,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],myth:"Una lunga curva termina in un uncino: la coda dello scorpione."},
 Sagittario:{stars:[[20,30,3],[39,22,4],[58,34,4],[73,21,2],[79,50,3],[60,62,5],[39,55,3],[25,72,3],[66,87,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1],[6,7],[5,8]],myth:"Le stelle principali formano il celebre asterismo della teiera."},
 Capricorno:{stars:[[12,31,3],[31,43,4],[48,64,3],[68,78,4],[87,53,3],[73,28,2],[51,39,2],[29,72,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1],[2,7]],myth:"Una figura triangolare e poco luminosa, legata al capro marino."},
 Acquario:{stars:[[12,25,3],[29,34,4],[43,25,3],[54,43,5],[70,36,3],[83,51,2],[63,64,3],[48,77,2],[75,87,3],[28,67,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[6,8],[7,9]],myth:"Molti segmenti a zig-zag suggeriscono l’acqua versata da un’anfora."},
 Pesci:{stars:[[10,27,2],[23,17,3],[36,27,2],[30,43,3],[16,45,2],[45,51,2],[57,57,2],[69,65,3],[83,56,2],[92,69,3],[82,82,2],[66,80,2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[3,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,7]],myth:"Due piccoli gruppi di stelle sono uniti da una lunga corda celeste."}
};

export const signs=[
 ["Ariete","♈","21 marzo – 19 aprile",["2 aprile","11 aprile","18 aprile"],"Fuoco","Cardinale","Marte","Positiva","Bilancia",1,["audace","reattivo","pioniere"]],
 ["Toro","♉","20 aprile – 20 maggio",["24 aprile","6 maggio","17 maggio"],"Terra","Fisso","Venere","Negativa","Scorpione",2,["costante","sensoriale","concreto"]],
 ["Gemelli","♊","21 maggio – 20 giugno",["25 maggio","4 giugno","19 giugno"],"Aria","Mutevole","Mercurio","Positiva","Sagittario",3,["dialettico","curioso","adattabile"]],
 ["Cancro","♋","21 giugno – 22 luglio",["25 giugno","8 luglio","21 luglio"],"Acqua","Cardinale","Luna","Negativa","Capricorno",4,["ricettivo","protettivo","memore"]],
 ["Leone","♌","23 luglio – 22 agosto",["28 luglio","9 agosto","20 agosto"],"Fuoco","Fisso","Sole","Positiva","Acquario",5,["espressivo","fiero","creativo"]],
 ["Vergine","♍","23 agosto – 22 settembre",["27 agosto","5 settembre","20 settembre"],"Terra","Mutevole","Mercurio","Negativa","Pesci",6,["analitico","selettivo","metodico"]],
 ["Bilancia","♎","23 settembre – 22 ottobre",["27 settembre","8 ottobre","19 ottobre"],"Aria","Cardinale","Venere","Positiva","Ariete",7,["mediatore","estetico","relazionale"]],
 ["Scorpione","♏","23 ottobre – 21 novembre",["26 ottobre","7 novembre","19 novembre"],"Acqua","Fisso","Plutone","Negativa","Toro",8,["penetrante","riservato","trasformativo"]],
 ["Sagittario","♐","22 novembre – 21 dicembre",["25 novembre","8 dicembre","19 dicembre"],"Fuoco","Mutevole","Giove","Positiva","Gemelli",9,["esploratore","franco","idealista"]],
 ["Capricorno","♑","22 dicembre – 19 gennaio",["26 dicembre","7 gennaio","17 gennaio"],"Terra","Cardinale","Saturno","Negativa","Cancro",10,["strategico","sobrio","perseverante"]],
 ["Acquario","♒","20 gennaio – 18 febbraio",["24 gennaio","6 febbraio","16 febbraio"],"Aria","Fisso","Urano","Positiva","Leone",11,["anticonformista","sistemico","indipendente"]],
 ["Pesci","♓","19 febbraio – 20 marzo",["23 febbraio","7 marzo","18 marzo"],"Acqua","Mutevole","Nettuno","Negativa","Vergine",12,["permeabile","immaginativo","compassionevole"]]
].map(([name,symbol,dates,samples,element,quality,planet,polarity,opposite,house,traits],index)=>({name,symbol,dates,samples,element,quality,planet,polarity,opposite,house,traits,index,constellation:charts[name]}));

export const modeInfo={
 guesswho:{title:"Indovina Chi",description:"Elimina i sospetti e accusa il segno giusto"},clues:{title:"Rivelazione",description:"Un indizio alla volta, punti sempre più bassi"},constellation:{title:"Osservatorio",description:"Riconosci le costellazioni nel cielo profondo"},order:{title:"Ruota spezzata",description:"Ricostruisci sequenze della ruota zodiacale"},dossier:{title:"Dossier astrale",description:"Completa un profilo senza risposte preconfezionate"},expert:{title:"Archivio vero/falso",description:"Seleziona tutte e sole le affermazioni corrette"},logic:{title:"Codice zodiacale",description:"Deduzioni incrociate da indizi tecnici"},mixed:{title:"Maestro dello Zodiaco",description:"Una prova completa con domande da esperti"},blitz:{title:"Blitz estremo 60″",description:"Dodici opzioni e pochissimo tempo"},calendar:{title:"Date al confine",description:"Date difficili vicino ai cambi di segno"},opposite:{title:"Assi opposti",description:"Ricostruisci le coppie della ruota"},planet:{title:"Governatori",description:"Pianeti e luminari dello Zodiaco"}
};
export const soloModes=["guesswho","clues","constellation","order","dossier","expert","logic","mixed","blitz"];
export const onlineModes=["mixed","logic","constellation","calendar","opposite","planet"];
export const shuffle=(items,rng=Math.random)=>[...items].sort(()=>rng()-.5);
export const pick=(items,rng=Math.random)=>items[Math.floor(rng()*items.length)];

export function progressiveClues(sign){return[
 `Nella ruota occupo la casa numero ${sign.house}.`,
 `Il segno sul mio asse opposto è ${sign.opposite}.`,
 `La mia modalità è ${sign.quality.toLowerCase()} e la mia polarità è ${sign.polarity.toLowerCase()}.`,
 `Il mio governatore moderno è ${sign.planet}.`,
 `Appartengo all’elemento ${sign.element}.`,
 `Il mio periodo convenzionale è ${sign.dates}.`
]}

export function expertStatements(sign,rng=Math.random){
 const other=pick(signs.filter(s=>s.name!==sign.name),rng),wrongElement=pick(signs.filter(s=>s.element!==sign.element),rng).element,wrongQuality=pick(signs.filter(s=>s.quality!==sign.quality),rng).quality,wrongPlanet=pick(signs.filter(s=>s.planet!==sign.planet),rng).planet;
 const truths=[`È un segno di ${sign.element}.`,`Ha modalità ${sign.quality.toLowerCase()}.`,`È governato da ${sign.planet}.`,`Il suo opposto è ${sign.opposite}.`,`È associato alla casa ${sign.house}.`,`Ha polarità ${sign.polarity.toLowerCase()}.`];
 const falsehoods=[`È un segno di ${wrongElement}.`,`Ha modalità ${wrongQuality.toLowerCase()}.`,`È governato da ${wrongPlanet}.`,`Il suo opposto è ${other.name}.`,`È associato alla casa ${other.house}.`,`Ha polarità ${sign.polarity==="Positiva"?"negativa":"positiva"}.`];
 return shuffle([...shuffle(truths,rng).slice(0,3).map((text,i)=>({id:`t${i}`,text,truth:true})),...shuffle(falsehoods,rng).slice(0,3).map((text,i)=>({id:`f${i}`,text,truth:false}))],rng);
}

export function makeQuestion(requestedMode="mixed",rng=Math.random){
 const pool=["logic","calendar","opposite","planet","constellation"],mode=requestedMode==="mixed"||requestedMode==="blitz"?pick(pool,rng):requestedMode,target=pick(signs,rng);let prompt="",answer=target.name,options=[],explanation="",constellation=null;
 if(mode==="logic"){
  const variants=[`Sono ${target.quality.toLowerCase()}, di polarità ${target.polarity.toLowerCase()} e il mio opposto è ${target.opposite}. Chi sono?`,`Occupo la casa ${target.house}, appartengo a ${target.element} e sono governato da ${target.planet}. Identificami.`,`Condivido la modalità ${target.quality.toLowerCase()} con altri segni, ma il mio elemento è ${target.element} e il mio asse porta a ${target.opposite}.`];
  prompt=pick(variants,rng);explanation=`${target.symbol} ${target.name}: ${target.element}, ${target.quality}, casa ${target.house}, opposto ${target.opposite}.`;options=shuffle(signs,rng).map(s=>s.name);
 }else if(mode==="calendar"){
  const sample=pick(target.samples,rng);prompt=`Una persona nata il ${sample} appartiene a quale segno?`;explanation=`${target.name}: ${target.dates}.`;options=shuffle(signs,rng).map(s=>s.name);
 }else if(mode==="opposite"){
  prompt=pick([`Quale segno si trova esattamente sull’asse opposto a ${target.symbol} ${target.name}?`,`Completa l’asse zodiacale: ${target.name} ↔ ?`,`Spostandoti di sei segni da ${target.name}, dove arrivi?`],rng);answer=target.opposite;explanation=`L’asse è ${target.name}–${target.opposite}, a 180° sulla ruota.`;options=shuffle(signs,rng).map(s=>s.name);
 }else if(mode==="planet"){
  prompt=pick([`Qual è il governatore moderno di ${target.symbol} ${target.name}?`,`A quale pianeta o luminare è associato ${target.name}?`,`Completa il dossier di ${target.name}: governatore = ?`],rng);answer=target.planet;explanation=`Il governatore moderno di ${target.name} è ${target.planet}.`;options=shuffle([...new Set(signs.map(s=>s.planet))],rng);
 }else if(mode==="constellation"){
  prompt=pick(["Riconosci la costellazione dallo schema stellare.","Identifica questo disegno celeste ruotato.","Quale costellazione zodiacale è nel telescopio?"],rng);answer=target.name;explanation=target.constellation.myth;options=shuffle(signs,rng).map(s=>s.name);constellation=target.constellation;
 }
 return{id:`${Date.now()}-${Math.floor(rng()*1e9)}`,mode,prompt,answer,options,explanation,symbol:mode==="constellation"?"✦":target.symbol,constellation};
}

export function buildQuestionSet(mode,count,rng=Math.random){const result=[],seen=new Set();let guard=0;while(result.length<count&&guard++<count*60){const q=makeQuestion(mode,rng),key=`${q.mode}:${q.prompt}:${q.answer}`;if(!seen.has(key)){seen.add(key);result.push(q)}}if(result.length<count)throw new Error(`Domande uniche insufficienti per ${mode}`);return result}
export function publicQuestion(q,revealed=false){if(!q)return null;const{answer,explanation,...safe}=q;return revealed?{...safe,answer,explanation}:safe}
