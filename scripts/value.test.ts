import assert from "node:assert/strict";
import test from "node:test";
import { formatGen, parseGen, splitValueFlag } from "./value.ts";

test("preserve a single wei when formatting GEN", () => {
  const amount = "0.200000000000000001";
  assert.equal(parseGen(amount), 200000000000000001n);
  assert.equal(formatGen(parseGen(amount)), amount);
});

test("reject amounts smaller than one wei", () => {
  assert.throws(() => parseGen("0.0000000000000000001"));
});

test("refuse signing credentials in arguments",()=>assert.throws(()=>splitValueFlag(["--private-key"]),/Refused signing options/));
