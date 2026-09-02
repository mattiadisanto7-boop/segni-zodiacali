import test from "node:test";
import assert from "node:assert/strict";
import {buildQuestionSet,makeQuestion,publicQuestion,soloModes} from "../src/gameData.js";

for(const mode of soloModes){
 test(`${mode}: genera domande risolvibili`,()=>{
  const q=makeQuestion(mode,()=>0.42);
  assert.ok(q.prompt.length>10);assert.ok(q.options.includes(q.answer));assert.ok(q.explanation.length>5);
 });
}
test("la versione pubblica nasconde la risposta",()=>{
 const q=makeQuestion("mixed");const safe=publicQuestion(q,false);assert.equal("answer" in safe,false);assert.equal(publicQuestion(q,true).answer,q.answer);
});
test("il set contiene il numero richiesto",()=>assert.equal(buildQuestionSet("mixed",15).length,15));
