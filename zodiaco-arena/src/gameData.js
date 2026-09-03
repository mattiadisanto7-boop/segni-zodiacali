import {constellationCharts} from "./constellations.js";

export const signs=[
 ["Ariete","♈","21 marzo – 19 aprile",["21 marzo","2 aprile","19 aprile"],"Fuoco","Cardinale","Marte","Positiva","Bilancia",1,["audace","reattivo","pioniere"]],
 ["Toro","♉","20 aprile – 20 maggio",["20 aprile","6 maggio","20 maggio"],"Terra","Fisso","Venere","Negativa","Scorpione",2,["costante","sensoriale","concreto"]],
 ["Gemelli","♊","21 maggio – 20 giugno",["21 maggio","4 giugno","20 giugno"],"Aria","Mutevole","Mercurio","Positiva","Sagittario",3,["dialettico","curioso","adattabile"]],
 ["Cancro","♋","21 giugno – 22 luglio",["21 giugno","8 luglio","22 luglio"],"Acqua","Cardinale","Luna","Negativa","Capricorno",4,["ricettivo","protettivo","memore"]],
 ["Leone","♌","23 luglio – 22 agosto",["23 luglio","9 agosto","22 agosto"],"Fuoco","Fisso","Sole","Positiva","Acquario",5,["espressivo","fiero","creativo"]],
 ["Vergine","♍","23 agosto – 22 settembre",["23 agosto","5 settembre","22 settembre"],"Terra","Mutevole","Mercurio","Negativa","Pesci",6,["analitico","selettivo","metodico"]],
 ["Bilancia","♎","23 settembre – 22 ottobre",["23 settembre","8 ottobre","22 ottobre"],"Aria","Cardinale","Venere","Positiva","Ariete",7,["mediatore","estetico","relazionale"]],
 ["Scorpione","♏","23 ottobre – 21 novembre",["23 ottobre","7 novembre","21 novembre"],"Acqua","Fisso","Plutone","Negativa","Toro",8,["penetrante","riservato","trasformativo"]],
 ["Sagittario","♐","22 novembre – 21 dicembre",["22 novembre","8 dicembre","21 dicembre"],"Fuoco","Mutevole","Giove","Positiva","Gemelli",9,["esploratore","franco","idealista"]],
 ["Capricorno","♑","22 dicembre – 19 gennaio",["22 dicembre","7 gennaio","19 gennaio"],"Terra","Cardinale","Saturno","Negativa","Cancro",10,["strategico","sobrio","perseverante"]],
 ["Acquario","♒","20 gennaio – 18 febbraio",["20 gennaio","6 febbraio","18 febbraio"],"Aria","Fisso","Urano","Positiva","Leone",11,["anticonformista","sistemico","indipendente"]],
 ["Pesci","♓","19 febbraio – 20 marzo",["19 febbraio","7 marzo","20 marzo"],"Acqua","Mutevole","Nettuno","Negativa","Vergine",12,["permeabile","immaginativo","compassionevole"]]
].map(([name,symbol,dates,samples,element,quality,planet,polarity,opposite,house,traits],index)=>({name,symbol,dates,samples,element,quality,planet,polarity,opposite,house,traits,index,constellation:constellationCharts[name]}));

export const modeInfo={
 guesswho:{title:"Indovina Chi: interrogatorio",description:"Scegli domande sì/no e restringi davvero i sospetti"},
 clues:{title:"Rivelazione",description:"Indizi relazionali: sbagliare sblocca il successivo"},
 constellation:{title:"Osservatorio J2000",description:"Campi stellari reali, luminosità e ottica variabile"},
 cipher:{title:"Codice Astrale",description:"Mastermind zodiacale: 11.880 codici possibili"},
 dossier:{title:"Dossier astrale",description:"Ricostruisci un profilo tecnico a sei variabili"},
 expert:{title:"Archivio vero/falso",description:"Verità in numero ignoto e relazioni incrociate"},
 logic:{title:"Deduzione astrale",description:"Incrocia modalità, assi, governatori e vicini"},
 mixed:{title:"Maestro dello Zodiaco",description:"Un percorso procedurale ad alta difficoltà"},
 blitz:{title:"Blitz estremo 60″",description:"Dodici opzioni, memoria e pochissimo tempo"},
 calendar:{title:"Date al confine",description:"Giorni insidiosi all’inizio e alla fine dei periodi"},
 opposite:{title:"Assi e relazioni",description:"Deduzioni a 180° con più proprietà incrociate"},
 planet:{title:"Governatori",description:"Identifica segno o governatore da dossier incompleti"}
};
export const soloModes=["guesswho","clues","constellation","cipher","dossier","expert","logic","mixed","blitz"];
export const onlineModes=["mixed","logic","constellation","calendar","opposite","planet"];

export function shuffle(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export const pick=(items,rng=Math.random)=>items[Math.floor(rng()*items.length)];
const previous=sign=>signs[(sign.index+11)%12],next=sign=>signs[(sign.index+1)%12],opposite=sign=>signs.find(s=>s.name===sign.opposite);

export function progressiveClues(sign,rng=Math.random){
 const family=pick([
  `Il segno sul mio asse opposto appartiene all’elemento ${opposite(sign).element}.`,
  `Il segno che mi segue appartiene all’elemento ${next(sign).element}.`,
  `La mia polarità è ${sign.polarity.toLowerCase()}.`
 ],rng);
 const structure=pick([`Il segno che mi precede nella ruota ha modalità ${previous(sign).quality.toLowerCase()}.`,`Condivido la modalità con il mio opposto: entrambi siamo ${sign.quality.toLowerCase()}.`],rng);
 return[family,structure,`Combino modalità ${sign.quality.toLowerCase()} e polarità ${sign.polarity.toLowerCase()}.`,`Il mio elemento è ${sign.element}, ma il segno precedente è di ${previous(sign).element}.`,`Il mio governatore è ${sign.planet}; il mio opposto è governato da ${opposite(sign).planet}.`,`Solo come ultimo indizio: il mio periodo convenzionale è ${sign.dates}.`];
}

export function detectiveQuestions(){
 const elements=["Fuoco","Terra","Aria","Acqua"],qualities=["Cardinale","Fisso","Mutevole"],polarities=["Positiva","Negativa"],planets=[...new Set(signs.map(s=>s.planet))];
 return[
  ...elements.map(value=>({id:`el-${value}`,text:`È un segno di ${value}?`,test:s=>s.element===value})),
  ...qualities.map(value=>({id:`qu-${value}`,text:`Ha modalità ${value.toLowerCase()}?`,test:s=>s.quality===value})),
  ...polarities.map(value=>({id:`po-${value}`,text:`Ha polarità ${value.toLowerCase()}?`,test:s=>s.polarity===value})),
  ...planets.map(value=>({id:`pl-${value}`,text:`È governato da ${value}?`,test:s=>s.planet===value})),
  ...elements.map(value=>({id:`oe-${value}`,text:`Il suo opposto è di ${value}?`,test:s=>opposite(s).element===value})),
  ...qualities.map(value=>({id:`pq-${value}`,text:`Il segno precedente è ${value.toLowerCase()}?`,test:s=>previous(s).quality===value})),
  ...elements.map(value=>({id:`ne-${value}`,text:`Il segno seguente è di ${value}?`,test:s=>next(s).element===value})),
  {id:"half-a",text:"Si trova nella prima metà della ruota?",test:s=>s.index<6}
 ];
}

export function expertStatements(sign,rng=Math.random){
 const wrongOpposite=pick(signs.filter(s=>s.name!==sign.opposite),rng).name,wrongElement=pick(signs.filter(s=>s.element!==sign.element),rng).element,wrongQuality=pick(signs.filter(s=>s.quality!==sign.quality),rng).quality,wrongPlanet=pick(signs.filter(s=>s.planet!==sign.planet),rng).planet,wrongOppositePlanet=pick([...new Set(signs.map(s=>s.planet))].filter(p=>p!==opposite(sign).planet),rng);
 const truths=[`È un segno di ${sign.element}.`,`Ha modalità ${sign.quality.toLowerCase()}.`,`È governato da ${sign.planet}.`,`Il suo opposto è ${sign.opposite}.`,`Ha polarità ${sign.polarity.toLowerCase()}.`,`È preceduto da un segno di ${previous(sign).element}.`,`È seguito da un segno ${next(sign).quality.toLowerCase()}.`,`Il suo opposto è governato da ${opposite(sign).planet}.`];
 const falsehoods=[`È un segno di ${wrongElement}.`,`Ha modalità ${wrongQuality.toLowerCase()}.`,`È governato da ${wrongPlanet}.`,`Il suo opposto è ${wrongOpposite}.`,`Ha polarità ${sign.polarity==="Positiva"?"negativa":"positiva"}.`,`È preceduto da un segno di ${next(sign).element}.`,`È seguito da un segno ${previous(sign).quality.toLowerCase()}.`,`Il suo opposto è governato da ${wrongOppositePlanet}.`];
 const trueCount=1+Math.floor(rng()*5),chosen=[...shuffle(truths,rng).slice(0,trueCount).map((text,i)=>({id:`t${i}`,text,truth:true})),...shuffle(falsehoods,rng).slice(0,6-trueCount).map((text,i)=>({id:`f${i}`,text,truth:false}))];
 return shuffle(chosen,rng);
}

export function scoreCipher(secret,guess){
 let exact=0;const remainingSecret=[],remainingGuess=[];
 secret.forEach((value,i)=>{if(value===guess[i])exact++;else{remainingSecret.push(value);remainingGuess.push(guess[i])}});
 let misplaced=0;for(const value of remainingGuess){const at=remainingSecret.indexOf(value);if(at>=0){misplaced++;remainingSecret.splice(at,1)}}
 return{exact,misplaced};
}

function logicQuestion(target,rng){
 const variants=[
  `Cerco un segno ${target.quality.toLowerCase()}: il suo opposto è di ${opposite(target).element} e il segno precedente è di ${previous(target).element}. Qual è?`,
  `Ha polarità ${target.polarity.toLowerCase()}, è governato da ${target.planet} e dopo di lui viene un segno ${next(target).quality.toLowerCase()}. Identificalo.`,
  `Non basta l’elemento ${target.element}: incrocia modalità ${target.quality.toLowerCase()} e governatore ${target.planet}. Di quale segno si tratta?`,
  `Il suo opposto è ${target.opposite}; il predecessore è di ${previous(target).element} e la sua polarità è ${target.polarity.toLowerCase()}. Chi è?`,
  `È seguito da un segno di ${next(target).element}; è ${target.quality.toLowerCase()} e il suo opposto è governato da ${opposite(target).planet}. Risolvi il dossier.`
 ];
 return{prompt:pick(variants,rng),answer:target.name,options:shuffle(signs,rng).map(s=>s.name),explanation:`${target.symbol} ${target.name}: ${target.element}, ${target.quality}, ${target.polarity}; opposto ${target.opposite}, governatore ${target.planet}.`};
}

export function makeQuestion(requestedMode="mixed",rng=Math.random){
 const pool=["logic","calendar","opposite","planet","constellation"],mode=requestedMode==="mixed"||requestedMode==="blitz"?pick(pool,rng):requestedMode,target=pick(signs,rng);let prompt="",answer=target.name,options=[],explanation="",constellation=null,view=null;
 if(mode==="logic")({prompt,answer,options,explanation}=logicQuestion(target,rng));
 else if(mode==="calendar"){
  const sample=pick(target.samples,rng);prompt=pick([`Data di confine: una persona nata il ${sample}, secondo le date convenzionali usate nel gioco, di che segno è?`,`Archivio anagrafico: assegna il ${sample} al corretto intervallo zodiacale.`,`Il calendario segnala ${sample}. Quale periodo zodiacale lo contiene?`],rng);explanation=`L’intervallo convenzionale di ${target.name} è ${target.dates}.`;options=shuffle(signs,rng).map(s=>s.name);
 }else if(mode==="opposite"){
  prompt=pick([`Un segno ${target.quality.toLowerCase()} di ${target.element} si trova a 180° da quale segno?`,`Completa l’asse che parte da ${target.symbol} ${target.name}; il punto d’arrivo mantiene la modalità ma cambia polarità.`,`Dal segno governato da ${target.planet} e chiamato ${target.name}, compi uno spostamento di sei posizioni: dove arrivi?`,`Quale segno opposto a ${target.name} è di ${opposite(target).element} e governato da ${opposite(target).planet}?`],rng);answer=target.opposite;explanation=`L’asse è ${target.name}–${target.opposite}, a 180° sulla ruota.`;options=shuffle(signs,rng).map(s=>s.name);
 }else if(mode==="planet"){
  const reverse=rng()>.45;if(reverse){prompt=pick([`Dossier incompleto: governatore ${target.planet}, modalità ${target.quality.toLowerCase()}, opposto di ${target.opposite}. Quale segno combacia con tutti i dati?`,`Incrocia governatore ${target.planet}, elemento ${target.element} e asse con ${target.opposite}: quale identità rimane?`,`Il soggetto è ${target.polarity.toLowerCase()}, governato da ${target.planet}; il suo successore è di ${next(target).element}. Identificalo.`],rng);answer=target.name;options=shuffle(signs,rng).map(s=>s.name)}else{prompt=pick([`Quale governatore completa il profilo: ${target.element}, modalità ${target.quality.toLowerCase()}, asse opposto a ${target.opposite}?`,`Dossier di ${target.name}: quale governatore concorda con l’opposto ${target.opposite} e la modalità ${target.quality.toLowerCase()}?`,`Trova il pianeta o luminare associato al segno ${target.polarity.toLowerCase()} di ${target.element} chiamato ${target.name}.`],rng);answer=target.planet;options=shuffle([...new Set(signs.map(s=>s.planet))],rng)}explanation=`Il governatore moderno di ${target.name} è ${target.planet}.`;
 }else if(mode==="constellation"){
  view={rotation:pick([0,45,90,135,180,225,270,315],rng),mirror:rng()>.5,density:pick([.55,.72,1],rng)};prompt=pick(["Riconosci il campo J2000 usando solo geometria e luminosità.","Il telescopio ha ruotato e forse specchiato il campo: identifica la costellazione.","Nessun simbolo e nessun nome: quale costellazione zodiacale è nel sensore?","Confronta distanze e stelle dominanti di questo campo reale."],rng);answer=target.name;explanation=target.constellation.myth;options=shuffle(signs,rng).map(s=>s.name);constellation=target.constellation;
 }
 return{id:`${Date.now()}-${Math.floor(rng()*1e9)}`,mode,prompt,answer,options,explanation,symbol:mode==="constellation"?"✦":target.symbol,constellation,view};
}

export function buildQuestionSet(mode,count,rng=Math.random){const result=[],seen=new Set();let guard=0;while(result.length<count&&guard++<count*250){const q=makeQuestion(mode,rng),key=`${q.mode}:${q.prompt}:${q.answer}:${q.view?.rotation??""}:${q.view?.mirror??""}:${q.view?.density??""}`;if(!seen.has(key)){seen.add(key);result.push(q)}}if(result.length<count)throw new Error(`Domande uniche insufficienti per ${mode}`);return result}
export function publicQuestion(q,revealed=false){if(!q)return null;const{answer,explanation,constellation,...safe}=q;const publicChart=constellation?(({source,myth,...chart})=>chart)(constellation):null;return revealed?{...safe,constellation,answer,explanation}:{...safe,constellation:publicChart}}
