import test from "node:test";
import assert from "node:assert/strict";
import {buildQuestionSet,expertStatements,makeQuestion,onlineModes,progressiveClues,publicQuestion,signs} from "../src/gameData.js";

for(const mode of onlineModes){
 test(`${mode}: genera una domanda difficile ma risolvibile`,()=>{
  const q=makeQuestion(mode,()=>0.42);assert.ok(q.prompt.length>15);assert.ok(q.options.includes(q.answer));assert.ok(q.options.length>=8);assert.ok(q.explanation.length>5);
 });
 test(`${mode}: crea 15 domande senza duplicati`,()=>{
  const deck=buildQuestionSet(mode,15);const keys=deck.map(q=>`${q.mode}:${q.prompt}:${q.answer}`);assert.equal(new Set(keys).size,15);
 });
}
test("ogni segno possiede sei indizi progressivi",()=>{for(const sign of signs)assert.equal(progressiveClues(sign).length,6)});
test("l’archivio contiene tre verità e tre falsità",()=>{const items=expertStatements(signs[0]);assert.equal(items.length,6);assert.equal(items.filter(i=>i.truth).length,3)});
test("tutte le costellazioni hanno stelle e collegamenti validi",()=>{for(const sign of signs){const c=sign.constellation;assert.ok(c.stars.length>=5);for(const [a,b] of c.edges){assert.ok(c.stars[a]);assert.ok(c.stars[b])}}});
test("la versione pubblica nasconde la soluzione fino alla rivelazione",()=>{const q=makeQuestion("mixed");assert.equal("answer" in publicQuestion(q,false),false);assert.equal(publicQuestion(q,true).answer,q.answer)});
