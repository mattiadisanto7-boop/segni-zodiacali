import test from "node:test";
import assert from "node:assert/strict";
import {buildQuestionSet,detectiveQuestions,expertStatements,makeQuestion,onlineModes,progressiveClues,publicQuestion,scoreCipher,signs} from "../src/gameData.js";

const identity=q=>`${q.mode}:${q.prompt}:${q.answer}:${q.view?.rotation??""}:${q.view?.mirror??""}:${q.view?.density??""}`;

for(const mode of onlineModes){
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

test("la versione pubblica nasconde soluzione e metadati rivelatori",()=>{
 const q=makeQuestion("constellation");const hidden=publicQuestion(q,false),revealed=publicQuestion(q,true);
 assert.equal("answer" in hidden,false);assert.equal("explanation" in hidden,false);assert.equal("source" in hidden.constellation,false);assert.equal("myth" in hidden.constellation,false);assert.equal(revealed.answer,q.answer);
});
