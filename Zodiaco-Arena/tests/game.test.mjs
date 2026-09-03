import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildQuestionSet,detectiveQuestions,expertStatements,makeQuestion,onlineModes,progressiveClues,publicQuestion,scoreCipher,signs} from "../src/gameData.js";
import {betOptions,championshipPhases,phaseForRound,resolveTileBattle,shuffledTiles,speedPoints,tileCategories,zodiacTiles} from "../src/competitiveData.js";
import {buildPortrait,portraitStageNames,portraitVariantCount} from "../src/personalityData.js";
import {APP_VERSION} from "../src/version.js";

const identity=q=>`${q.mode}:${q.prompt}:${q.answer}:${q.view?.rotation??""}:${q.view?.mirror??""}:${q.view?.density??""}`;

for(const mode of onlineModes.filter(mode=>mode!=="tiles")){
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
 const bank=detectiveQuestions();assert.ok(bank.length>=30);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 for(const q of bank)for(const sign of signs)assert.equal(typeof q.test(sign),"boolean");
});

test("il punteggio del Codice Astrale distingue posizione e presenza",()=>{
 assert.deepEqual(scoreCipher(["Ariete","Toro","Gemelli","Cancro"],["Ariete","Gemelli","Toro","Leone"]),{exact:1,misplaced:2});
 assert.deepEqual(scoreCipher(["Ariete","Toro","Gemelli","Cancro"],["Ariete","Toro","Gemelli","Cancro"]),{exact:4,misplaced:0});
});

test("le costellazioni usano coordinate, magnitudini e campi stellari validi",()=>{
 for(const sign of signs){const c=sign.constellation;assert.ok(c.source);assert.ok(c.stars.length>=4);assert.ok(c.field.length>=20);for(const star of [...c.stars,...c.field]){assert.equal(star.length,3);assert.ok(star[0]>=0&&star[0]<=100);assert.ok(star[1]>=0&&star[1]<=100);assert.ok(Number.isFinite(star[2]))}for(const [a,b] of c.edges){assert.ok(c.stars[a]);assert.ok(c.stars[b])}}
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

test("Profilo Vivente dispone di 144 scene concrete e quattro contesti per segno",()=>{
 assert.equal(portraitVariantCount(),144);
 assert.deepEqual(portraitStageNames,["Vita quotidiana","Legami","Sotto pressione","Firma profonda"]);
 for(const sign of signs){const profile=buildPortrait(sign.name,()=>0);assert.equal(profile.length,4);assert.equal(new Set(profile.map(scene=>scene.stage)).size,4);for(const scene of profile)assert.ok(scene.text.length>90)}
});

test("il Campionato ha quattro blocchi completi e punteggi davvero sensibili al tempo",()=>{
 assert.deepEqual(betOptions,[50,100,200,350]);assert.equal(championshipPhases.length,16);
 for(let round=0;round<16;round++)assert.equal(phaseForRound(round),championshipPhases[round]);
 for(const phase of ["hot","bet","slow","steal"])assert.equal(championshipPhases.filter(item=>item===phase).length,4);
 assert.ok(speedPoints(250)<speedPoints(0));assert.ok(speedPoints(19999)>0);
});

test("le dodici tessere condividono cinque categorie e valori validi",()=>{
 assert.equal(zodiacTiles.length,12);assert.equal(new Set(zodiacTiles.map(tile=>tile.name)).size,12);assert.equal(tileCategories.length,5);
 for(const tile of zodiacTiles){assert.deepEqual(Object.keys(tile.values),tileCategories.map(category=>category.id));for(const value of Object.values(tile.values))assert.ok(Number.isInteger(value)&&value>=1&&value<=100)}
 const deck=shuffledTiles(()=>0.42);assert.equal(deck.length,12);assert.notEqual(deck[0],zodiacTiles[0]);
 const result=resolveTileBattle(zodiacTiles[0],zodiacTiles[1],"slancio");assert.deepEqual(result,{attack:94,defense:45,winner:"attacker"});
});

test("Indovina Chi lascia l’eliminazione interamente al giocatore",()=>{
 const source=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
 assert.match(source,/Le risposte non modificano il tabellone/);assert.match(source,/POSSIBILE/);assert.match(source,/ESCLUSO/);assert.match(source,/toggle\(s\.name\)/);assert.doesNotMatch(source,/setRemaining/);
});

test("la build espone una versione nuova e riconoscibile",()=>{
 assert.equal(APP_VERSION,"6.0.0");
 const source=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
 assert.match(source,/VERSIONE \{APP_VERSION\}/);assert.match(source,/<small>v\{APP_VERSION\}<\/small>/);
});
