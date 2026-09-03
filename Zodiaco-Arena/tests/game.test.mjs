import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildQuestionSet,detectiveQuestions,expertStatements,makeQuestion,onlineModes,progressiveClues,publicQuestion,scoreCipher,signs} from "../src/gameData.js";
import {betOptions,championshipPhases,phaseForRound,resolveTileBattle,shuffledTiles,speedPoints,tileCategories,zodiacTiles} from "../src/competitiveData.js";
import {buildPortrait,portraitCountForSign,portraitStageNames,portraitVariantCount} from "../src/personalityData.js";
import {extraPortraitScenes} from "../src/personalityExpansion.js";
import {APP_VERSION} from "../src/version.js";
import {calculateNatalChart,placementInterpretation} from "../src/astrologyEngine.js";

const identity=q=>`${q.mode}:${q.prompt}:${q.answer}:${q.view?.rotation??""}:${q.view?.mirror??""}:${q.view?.density??""}`;

for(const mode of onlineModes.filter(mode=>!["tiles","guesswho-online"].includes(mode))){
 test(`${mode}: genera una prova difficile ma risolvibile`,()=>{
  const q=makeQuestion(mode,()=>0.42);assert.ok(q.prompt.length>15);assert.ok(q.options.includes(q.answer));assert.ok(q.options.length>=8);assert.ok(q.explanation.length>5);
 });
 test(`${mode}: crea 15 prove senza duplicati`,()=>{
  const deck=buildQuestionSet(mode,15);assert.equal(new Set(deck.map(identity)).size,15);
 });
}

test("gli indizi progressivi non regalano il segno con la casa",()=>{
 for(const sign of signs){const clues=progressiveClues(sign);assert.equal(clues.length,6);assert.equal(clues.some(c=>/casa|numero/i.test(c)),false);assert.equal(clues[0].includes(sign.dates),false)}
});
test("l’archivio varia il numero delle verità",()=>{
 const one=expertStatements(signs[0],()=>0),five=expertStatements(signs[0],()=>.99);
 assert.equal(one.length,6);assert.equal(five.length,6);assert.equal(one.filter(i=>i.truth).length,1);assert.equal(five.filter(i=>i.truth).length,5);
});

test("Indovina Chi offre un vero catalogo di domande sì/no",()=>{
 const bank=detectiveQuestions();assert.equal(bank.length,64);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 assert.equal(bank.some(q=>/opposto|precedente|seguente/i.test(q.text)),false);
 assert.equal(bank.filter(q=>/periodo convenzionale/i.test(q.text)).length,40);
 for(const q of bank)for(const sign of signs)assert.equal(typeof q.test(sign),"boolean");
});

test("il punteggio del Codice Astrale distingue posizione e presenza",()=>{
 assert.deepEqual(scoreCipher(["Ariete","Toro","Gemelli","Cancro"],["Ariete","Gemelli","Toro","Leone"]),{exact:1,misplaced:2});
 assert.deepEqual(scoreCipher(["Ariete","Toro","Gemelli","Cancro"],["Ariete","Toro","Gemelli","Cancro"]),{exact:4,misplaced:0});
});

test("le costellazioni usano coordinate, magnitudini e campi stellari validi",()=>{
 for(const sign of signs){const c=sign.constellation;assert.ok(c.source);assert.ok(c.stars.length>=4);assert.ok(c.field.length>=20);for(const star of [...c.stars,...c.field]){assert.equal(star.length,3);assert.ok(star[0]>=0&&star[0]<=100);assert.ok(star[1]>=0&&star[1]<=100);assert.ok(Number.isFinite(star[2]))}for(const [a,b] of c.edges){assert.ok(c.stars[a]);assert.ok(c.stars[b])}}
 const rotations=Array.from({length:80},()=>makeQuestion("constellation").view.rotation);assert.ok(rotations.every(value=>Number.isInteger(value)&&value>=0&&value<360));assert.ok(new Set(rotations).size>20);
});

test("cento prove miste mantengono identità uniche",()=>{const deck=buildQuestionSet("mixed",100);assert.equal(new Set(deck.map(identity)).size,100)});

test("i dossier procedurali superano ampiamente una singola sessione",()=>{
 for(const mode of ["logic","opposite","planet"]){const deck=buildQuestionSet(mode,250);assert.equal(new Set(deck.map(identity)).size,250)}
});

test("la versione pubblica nasconde soluzione e metadati rivelatori",()=>{
 const q=makeQuestion("constellation");const hidden=publicQuestion(q,false),revealed=publicQuestion(q,true);
 assert.equal("answer" in hidden,false);assert.equal("explanation" in hidden,false);assert.equal("source" in hidden.constellation,false);assert.equal("myth" in hidden.constellation,false);assert.equal(revealed.answer,q.answer);
});

test("Maestro dello Zodiaco non usa mai il simbolo della soluzione come decorazione",()=>{
 for(let i=0;i<100;i++){const q=makeQuestion("mixed");assert.equal(signs.some(sign=>sign.symbol===q.symbol),false)}
});

test("Profilo Vivente dispone di 264 scene concrete e 22 situazioni per segno",()=>{
 assert.equal(portraitVariantCount(),264);
 assert.deepEqual(portraitStageNames,["Vita quotidiana","Legami","Sotto pressione","Firma profonda"]);
 for(const sign of signs){assert.equal(portraitCountForSign(sign.name),22);assert.equal(extraPortraitScenes[sign.name].length,10);assert.equal(new Set(extraPortraitScenes[sign.name].map(scene=>scene[0])).size,10);for(const[,text]of extraPortraitScenes[sign.name])assert.ok(text.length>90);const profile=buildPortrait(sign.name,()=>0);assert.equal(profile.length,4);assert.equal(new Set(profile.map(scene=>scene.stage)).size,4);for(const scene of profile)assert.ok(scene.text.length>90)}
});

test("il Campionato ha quattro blocchi completi e punteggi davvero sensibili al tempo",()=>{
 assert.deepEqual(betOptions,[50,100,200,350]);assert.equal(championshipPhases.length,16);
 for(let round=0;round<16;round++)assert.equal(phaseForRound(round),championshipPhases[round]);
 for(const phase of ["hot","bet","slow","steal"])assert.equal(championshipPhases.filter(item=>item===phase).length,4);
 assert.ok(speedPoints(250)<speedPoints(0));assert.ok(speedPoints(19999)>0);
});

test("le dodici tessere condividono cinque categorie e valori validi",()=>{
 assert.equal(zodiacTiles.length,12);assert.equal(new Set(zodiacTiles.map(tile=>tile.name)).size,12);assert.equal(tileCategories.length,5);
 const expected={Ariete:[92,62,53,82,71],Toro:[52,94,74,68,72],Gemelli:[78,55,65,82,80],Cancro:[58,81,92,74,55],Leone:[88,84,56,92,40],Vergine:[58,88,76,60,78],Bilancia:[65,60,75,88,72],Scorpione:[66,92,94,67,41],Sagittario:[91,52,57,77,83],Capricorno:[62,95,64,83,56],Acquario:[68,72,74,56,90],Pesci:[50,58,92,64,96]};
 for(const tile of zodiacTiles){assert.deepEqual(Object.keys(tile.values),tileCategories.map(category=>category.id));assert.deepEqual(Object.values(tile.values),expected[tile.name]);assert.equal(Object.values(tile.values).reduce((sum,value)=>sum+value,0),360);assert.ok(tile.signature.length>80);for(const value of Object.values(tile.values))assert.ok(Number.isInteger(value)&&value>=1&&value<=100)}
 for(const one of zodiacTiles)for(const other of zodiacTiles)if(one!==other)assert.equal(tileCategories.every(category=>one.values[category.id]>=other.values[category.id])&&tileCategories.some(category=>one.values[category.id]>other.values[category.id]),false,`${one.name} non deve dominare ${other.name} in tutto`);
 const deck=shuffledTiles(()=>0.42);assert.equal(deck.length,12);assert.notEqual(deck[0],zodiacTiles[0]);
 const result=resolveTileBattle(zodiacTiles[0],zodiacTiles[1],"slancio");assert.deepEqual(result,{attack:92,defense:52,winner:"attacker"});
});

test("Indovina Chi lascia l’eliminazione interamente al giocatore",()=>{
 const source=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
 assert.match(source,/Le risposte non modificano il tabellone/);assert.match(source,/Mostra altre domande/);assert.match(source,/POSSIBILE/);assert.match(source,/ESCLUSO/);assert.match(source,/toggle\(s\.name\)/);assert.doesNotMatch(source,/setRemaining/);
});

test("le prove difficili hanno formulazioni complete e prive del testo ambiguo segnalato",()=>{
 for(const mode of ["logic","opposite","planet","mixed"])for(const question of buildQuestionSet(mode,80)){assert.ok(question.prompt.length>40);assert.doesNotMatch(question.prompt,/non (?:c’è|c'e|c'è) punto di partenza|punto di partenza/i)}
 const source=readFileSync(new URL("../src/gameData.js",import.meta.url),"utf8");assert.doesNotMatch(source,/opposto è governato|predecessore è governato|successore è governato/i);
});

test("Indovina Chi vocale è una modalità online distinta senza banca domande nell’interfaccia",()=>{
 assert.ok(onlineModes.includes("guesswho-online"));const source=readFileSync(new URL("../src/advancedGames.jsx",import.meta.url),"utf8");assert.match(source,/L’app non propone domande/);assert.match(source,/guesswho-secret/);assert.match(source,/guesswho-pass/);assert.match(source,/guesswho-accuse/);assert.match(source,/Puoi modificare il tabellone anche adesso/);
});

test("l’Atlante calcola un tema completo e interpretazioni leggibili",()=>{
 const chart=calculateNatalChart({name:"Test",date:"2000-01-01",time:"12:00",place:"Trieste",latitude:45.6495,longitude:13.7768,zodiac:"tropical",houseSystem:"placidus"});
 assert.deepEqual(chart.bigThree.map(point=>point.sign),["Capricorno","Scorpione","Ariete"]);assert.equal(chart.profile.timezone,"Europe/Rome");assert.equal(chart.bodies.filter(body=>["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].includes(body.key)).length,10);assert.equal(chart.houses.length,12);assert.ok(chart.aspects.length>=20);assert.equal(Object.values(chart.elementCounts).reduce((a,b)=>a+b,0),10);assert.ok(chart.lunarPhase.name);assert.ok(chart.lunarPhase.angle>=0&&chart.lunarPhase.angle<360);assert.equal(Object.values(chart.quadrantCounts).reduce((a,b)=>a+b,0),10);assert.ok(Array.isArray(chart.retrogrades));assert.ok(Array.isArray(chart.stelliums));assert.match(placementInterpretation(chart.bodies[0]),/casa 10/i);
 const sidereal=calculateNatalChart({...chart.profile,date:"2000-01-01",time:"12:00",zodiac:"sidereal",houseSystem:"whole-sign"});assert.notEqual(sidereal.bigThree[0].sign,chart.bigThree[0].sign);
 const source=readFileSync(new URL("../src/AstrologyAtlas.jsx",import.meta.url),"utf8");assert.match(source,/non è un metodo scientificamente validato/i);assert.match(source,/Nodi, Lilith, Chirone/);assert.match(source,/Stampa \/ PDF/);
});

test("tornare alla home conserva credenziali e stanza online",()=>{
 const source=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");assert.match(source,/function returnHome\(\)\{setScreen\("home"\)\}/);assert.doesNotMatch(source,/removeItem\("zodiac-session"\)/);assert.match(source,/Rientra nella stanza conservata/);
});

test("la build espone una versione nuova e riconoscibile",()=>{
 assert.equal(APP_VERSION,"6.3.0");
 const source=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
 assert.match(source,/VERSIONE \{APP_VERSION\}/);assert.match(source,/<small>v\{APP_VERSION\}<\/small>/);
});

test("timer, audio e segretezza delle tessere sono vincoli espliciti della release",()=>{
 const server=readFileSync(new URL("../server.mjs",import.meta.url),"utf8"),tiles=readFileSync(new URL("../src/advancedGames.jsx",import.meta.url),"utf8"),audio=readFileSync(new URL("../src/audio.js",import.meta.url),"utf8");
 assert.match(server,/ZODIAC_ROUND_MS\|\|60000/);assert.match(server,/ZODIAC_PROGRESSIVE_REVEAL_MS\|\|30000/);assert.match(server,/categoryVisible=viewerId===activeId\|\|game\.phase==="reveal"/);
 assert.match(tiles,/Categoria sigillata/);assert.match(tiles,/Categoria nascosta fino allo scontro/);assert.doesNotMatch(tiles,/ha scelto \{category\.label\}/);
 assert.match(audio,/ambientNotes/);assert.match(audio,/createOscillator/);assert.match(audio,/startAmbient/);
});
