import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planCommand } from "./commands.ts";
import { quoteMatches } from "./inspect.ts";
import { deployedAddress } from "../deploy/deployScript.ts";

const plan = (...args:string[]) => planCommand(args, () => "Quoted statement");
const signer = "0x"+"1".repeat(40);
const sha = "a".repeat(40);
for (const [cmd,args,method,preview] of [
  ["pledge",["Demo","0.1","7","--value","0.2"],"create_pledge","preview_pledge"],
  ["top-up",["2","--value","0.01"],"top_up","preview_top_up"],
  ["register",["0","org/name",sha,"https://example.org","--quote-file","f","--challenge-minutes","10"],"register_claim","preview_register"],
  ["challenge",["1","--value","0.01"],"challenge","preview_challenge"],
  ["resolve",["1"],"resolve","preview_resolve"],["expire",["1"],"expire","preview_expire"],
  ["close",["3"],"close_pledge","preview_close"],["grade",["2"],"grade_claim","preview_grade_claim"],
  ["withdraw",[],"withdraw","preview_withdraw"],
] as const) test("map " + cmd + " to its preview and write", () => {
  const p = plan(cmd,...args);
  assert.equal(p.kind,"write");
  if (p.kind !== "write") throw Error();
  assert.equal(p.method,method); assert.equal(p.preview,preview);
  if (cmd==="pledge") assert.deepEqual(p.previewArgs(signer),[signer,"Demo","100000000000000000",7,"200000000000000000"]);
  if (cmd==="register") assert.deepEqual(p.previewArgs(signer),[signer,0,"org/name",sha,"https://example.org","Quoted statement",10]);
});
for (const cmd of ["close","challenge"]) test(cmd+" expected refusal sends zero and checks the cause",()=>{
  const p=plan(cmd,"1","--expect-refusal");
  if(p.kind!=="write") throw Error();
  assert.equal(p.value,0n); assert.ok(p.refusal); assert.equal(p.refusal.test("[EXPECTED] unknown claim"),false);
  assert.throws(()=>plan(cmd,"1","--expect-refusal","--value","0.01"));
});
for (const args of [["pledge","x","0.1","7"],["grade","-1"],["deploy","--min-challenge-minutes","9"],["wait","wrong"],["register","0","org/name","main","https://example.com"],["stats","--value","1"],["resolve","0","--expect-refusal"]])
  test("reject invalid command "+args.join(" "),()=>assert.throws(()=>plan(...args)));
test("all demo quotations match their public pages",()=>{
  for (const name of ["llama-3.1","olmo-2","mistral-7b"]) {
    const base = "docs/demo/claims/"+name;
    assert.ok(quoteMatches(readFileSync(base+"-claim.html","utf8"),readFileSync(base+".txt","utf8")));
  }
  assert.equal(quoteMatches("<script>open source</script>","open source"),false);
});
test("read Studio deployment address from receipt data",()=> {
  assert.equal(deployedAddress({data:{contract_address:signer}}),signer);
  assert.throws(()=>deployedAddress({}));
});
