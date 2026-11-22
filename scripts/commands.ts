import { parseGen, payableWei, splitValueFlag } from "./value.ts";

export type CallArg = string | number | bigint;
export type Write = {
  kind: "write"; command: string; method: string; args: CallArg[]; value: bigint;
  preview: string; previewArgs: (signer: string) => CallArg[]; refusal: RegExp | null;
};

export const USAGE = `OpenWash · Studionet
help | config | stats | pledge-info <id> | claim <id> | claims <pledge_id>
challenge-info <id> | challenges <claim_id> | window <id> | standing <address>
credit <address> | wait <hash> | hf-inspect <org/name> [--sha <revision>]
quote-check <https-url> <quote-file>
deploy --min-challenge-minutes <n>
pledge <name> <payout_GEN> <days> --value <GEN>
top-up <id> --value <GEN>
register <pledge_id> <org/name> <revision> <url> --quote-file <path> --challenge-minutes <n>
challenge <claim_id> --value <GEN> | challenge <claim_id> --expect-refusal
resolve <challenge_id> | expire <challenge_id> | grade <claim_id>
close <pledge_id> [--expect-refusal] | withdraw`;

export function repoId(value: string) {
  const id = value.trim();
  if (!/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(id) || id.includes("..") || id.split("/").includes(".") || id.length > 192)
    throw new Error("Invalid Hugging Face repo id.");
  return id;
}
export function revision(value: string) {
  if (!/^[a-f0-9]{40}$/i.test(value)) throw new Error("Expected a full 40-character SHA.");
  return value.toLowerCase();
}
function integer(value: string) {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error("Expected a non-negative integer.");
  return Number(value);
}
function minutes(value: string) {
  const n = integer(value);
  if (n < 10 || n > 129600) throw new Error("Challenge minutes must be between 10 and 129600.");
  return n;
}

const readIds: Record<string,string> = {
  "pledge-info":"get_pledge", claim:"get_claim", claims:"list_claims",
  "challenge-info":"get_challenge", challenges:"list_challenges", window:"claim_window"
};
export function planCommand(argv: string[], readText: (path: string) => string) {
  const [command = "help", ...rest] = argv;
  const split = splitValueFlag(rest);
  const flags: Record<string,string> = {};
  const args: string[] = [];
  const allowed: Record<string,string[]> = {
    deploy:["--min-challenge-minutes"], register:["--quote-file","--challenge-minutes"],
    "hf-inspect":["--sha"], close:["--expect-refusal"], challenge:["--expect-refusal"]
  };
  for (let i=0; i<split.args.length; i++) {
    const token = split.args[i];
    if (!token.startsWith("--")) { args.push(token); continue; }
    if (!allowed[command]?.includes(token) || token in flags) throw new Error("Invalid or repeated option: " + token);
    if (token === "--expect-refusal") { flags[token] = "yes"; continue; }
    const value = split.args[++i];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + token);
    flags[token] = value;
  }
  const expected = "--expect-refusal" in flags;
  if (expected && split.value !== undefined) throw new Error("An expected refusal must send zero value. Omit --value.");
  const value = expected ? 0n : payableWei(command, split.value);
  function count(n: number) {
    if (args.length !== n) throw new Error(command + " expects " + n + " positional arguments.");
  }
  function flag(key: string) {
    if (!flags[key]) throw new Error("Missing " + key);
    return flags[key];
  }
  function write(method: string, callArgs: CallArg[], preview: string, previewArgs: Write["previewArgs"]): Write {
    const refusal = expected ? (command === "close" ? /^\[EXPECTED\] a claim challenge period is open until / : /^\[EXPECTED\] challenge period ended \(/) : null;
    return {kind:"write", command, method, args:callArgs, value, preview, previewArgs, refusal};
  }
  if (Object.hasOwn(readIds,command)) {
    count(1); return {kind:"read" as const, method:readIds[command], args:[integer(args[0])]};
  }
  switch(command) {
    case "help": case "config":
      count(0); return {kind:command};
    case "stats":
      count(0); return {kind:"read" as const, method:"get_stats", args:[]};
    case "standing": case "credit":
      count(1);
      if (!/^0x[a-f0-9]{40}$/i.test(args[0])) throw new Error("Invalid address.");
      return {kind:"read" as const, method:command === "credit" ? "get_credit" : command, args};
    case "wait":
      count(1);
      if (!/^0x[a-f0-9]{64}$/i.test(args[0])) throw new Error("Invalid transaction hash.");
      return {kind:"wait" as const, hash:args[0] as `0x${string}`};
    case "hf-inspect":
      count(1); return {kind:"inspect" as const, repo:repoId(args[0]), sha:flags["--sha"] && revision(flags["--sha"])};
    case "quote-check":
      count(2); return {kind:"quote" as const, url:args[0], quote:readText(args[1]).trim()};
    case "deploy":
      count(0); return {kind:"deploy" as const, minutes:minutes(flags["--min-challenge-minutes"] ?? "10080")};
    case "pledge": {
      count(3);
      const [name,amount,days] = args;
      const payout = parseGen(amount), duration = integer(days);
      return write("create_pledge",[name,payout,duration],"preview_pledge",s=>[s,name,payout.toString(),duration,value.toString()]);
    }
    case "register": {
      count(4);
      const callArgs = [integer(args[0]),repoId(args[1]),revision(args[2]),args[3],readText(flag("--quote-file")).trim(),minutes(flag("--challenge-minutes"))];
      return write("register_claim",callArgs,"preview_register", s=>[s,...callArgs]);
    }
    case "challenge": case "top-up": {
      count(1); const id = integer(args[0]);
      const method = command.replace("-","_");
      return write(method,[id],"preview_"+method,s=>[s,id,value.toString()]);
    }
    case "resolve": case "expire": case "grade": {
      count(1); const id = integer(args[0]);
      const method = command === "grade" ? "grade_claim" : command;
      return write(method,[id],"preview_"+method,()=>[id]);
    }
    case "close":
      count(1); return write("close_pledge",[integer(args[0])],"preview_close",s=>[s,integer(args[0])]);
    case "withdraw":
      count(0); return write("withdraw",[],"preview_withdraw",s=>[s]);
    default: throw new Error("Unknown command: " + command);
  }
}
