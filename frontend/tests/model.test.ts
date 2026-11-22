import test from "node:test";
import assert from "node:assert/strict";
import {
  repoFrom,
  sha,
  verdict,
  statusAt,
  wei,
  gen,
  type Criterion,
} from "../lib/model.ts";
test("normalize HF links and repo IDs", () => {
  assert.equal(repoFrom(" https://huggingface.co/Org/Name/ "), "Org/Name");
  for (const bad of [
    "org/..",
    "https://other.example/org/name",
    "org/name/tree/main",
  ])
    assert.throws(() => repoFrom(bad));
});
test("normalize full SHA", () => {
  assert.equal(sha("A".repeat(40)), "a".repeat(40));
  assert.throws(() => sha("main"));
});
const enums: Criterion[] = ["PASS", "FAIL", "UNCLEAR"];
for (const c1 of enums)
  for (const c2 of [false, true])
    for (const c3 of enums)
      for (const c4 of enums)
        test([c1, c2, c3, c4].join(" "), () =>
          assert.equal(
            verdict(c1, c2, c3, c4),
            c2 && c1 === "PASS"
              ? c3 === "PASS" && c4 === "PASS"
                ? "OPEN"
                : "OPEN_WEIGHTS_ONLY"
              : "RESTRICTED",
          ),
        );
test("show CLOSED at the boundary and preserve DEBUNKED", () => {
  const c = {
    challenge_until: "2026-11-22T12:10:00Z",
    status: "LIVE" as const,
    open_challenge: false,
  };
  const t = Date.parse(c.challenge_until);
  assert.equal(statusAt(c, t - 1), "LIVE");
  assert.equal(statusAt(c, t), "CLOSED");
  assert.equal(statusAt({ ...c, status: "DEBUNKED" }, t), "DEBUNKED");
  assert.equal(statusAt({ ...c, open_challenge: true }, t), "LIVE");
});
test("keep wei precision in previews", () =>
  assert.equal(gen(wei("0.100000000000000001")), "0.100000000000000001"));
