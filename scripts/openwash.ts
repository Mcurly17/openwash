import { readFileSync } from "node:fs";
import type { Address, GenLayerChain, TransactionHash } from "genlayer-js/types";
import { planCommand, USAGE, type CallArg } from "./commands.ts";
import { decryptKeystore, KeystoreError, promptPassword, readActiveKeystore } from "./keystore.ts";
import { interpretReceipt, isDecidedStatus, receiptStatus } from "./receipt.ts";
import { WAIT_INTERVAL_MS, waitRetries } from "./value.ts";
import { inspect, quoteCheck } from "./inspect.ts";
import { deployedAddress } from "../deploy/deployScript.ts";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const NETWORKS: Record<string, string> = { studionet: "studionet", localnet: "localnet" };

class CliError extends Error {}

function print(value: unknown): void {
  console.log(JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2));
}

function contractAddress(): Address {
  const value = process.env.OPENWASH_CONTRACT ?? "";
  if (!ADDRESS_RE.test(value)) {
    throw new CliError("OPENWASH_CONTRACT is not set to a 0x address. Put the deployed contract address in .env (see .env.example).");
  }
  return value as Address;
}

function networkName(): string {
  const name = process.env.GENLAYER_NETWORK || "studionet";
  if (!NETWORKS[name]) throw new CliError(`Unknown GENLAYER_NETWORK: ${name} (${Object.keys(NETWORKS).join(", ")})`);
  return name;
}

async function sdk() {
  const { createAccount, createClient } = await import("genlayer-js");
  const chains = (await import("genlayer-js/chains")) as unknown as Record<string, GenLayerChain>;
  return { createAccount, createClient, chain: chains[NETWORKS[networkName()]] };
}

async function readClient() {
  const { createClient, chain } = await sdk();
  return createClient({ chain });
}

async function call(functionName: string, args: CallArg[]): Promise<unknown> {
  const client = await readClient();
  return client.readContract({ address: contractAddress(), functionName, args, jsonSafeReturn: true });
}

/** Views return JSON in a str (Studio's read decoder mishandles dicts). */
async function readJson(functionName: string, args: CallArg[]): Promise<any> {
  const raw = await call(functionName, args);
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/** Unlocks the active CLI keystore with a hidden password prompt and checks its address. */
async function signingClient(stored: ReturnType<typeof readActiveKeystore>) {
  const { createAccount, createClient, chain } = await sdk();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const password = await promptPassword(`Keystore password for ${stored.name}: `);
    try {
      const account = createAccount(decryptKeystore(stored.json, password));
      if (account.address.toLowerCase() !== stored.address) {
        throw new KeystoreError("The unlocked key does not match the keystore address.");
      }
      return createClient({ chain, account });
    } catch (err) {
      const wrong = err instanceof KeystoreError && err.message === "Wrong keystore password.";
      if (!wrong || attempt === 3) throw err;
      console.error(`${err.message} (${3 - attempt} attempt(s) left)`);
    }
  }
  throw new KeystoreError("Wrong keystore password.");
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Polls an already sent transaction until it reaches a final state. It only reads: a gateway
 * error or a not-yet-indexed hash is retried, the transaction is never re-sent. Success means
 * ACCEPTED or FINALIZED, MAJORITY_AGREE and SUCCESS.
 */
async function settle(hash: TransactionHash, command: string, expectedMessage?: string): Promise<Record<string, any> | null> {
  console.log(`Transaction: ${hash}\nExplorer: https://explorer-studio.genlayer.com/tx/${hash}`);
  const client = await readClient();
  for (let attempt = 0; attempt < waitRetries(command); attempt++) {
    try {
      const tx = await client.getTransaction({ hash });
      if (isDecidedStatus(receiptStatus(tx))) {
        const outcome = interpretReceipt(tx);
        print({
          hash,
          status: outcome.status,
          consensus: outcome.consensus,
          execution: outcome.execution,
          result: outcome.returnValue,
          ...(outcome.message ? { message: outcome.message } : {}),
          ...(outcome.keptValue ? { keptValueWei: outcome.keptValue } : {}),
        });
        if (expectedMessage) {
          const refused = outcome.kind === "failed" && outcome.failure === "execution" && outcome.errorCode === "EXPECTED" && outcome.message === expectedMessage && ["AGREE", "MAJORITY_AGREE"].includes(outcome.consensus ?? "");
          console.log(refused ? "Refused on-chain, as expected." : "Expected an [EXPECTED] refusal, got another outcome.");
          if (!refused) process.exitCode = 1;
        } else if (outcome.kind !== "success") {
          process.exitCode = 1;
        }
        return tx as Record<string, any>;
      }
    } catch {
      // Not indexed yet or a gateway hiccup: keep polling the same hash.
    }
    await sleep(WAIT_INTERVAL_MS);
  }
  process.exitCode = 1;
  console.error(`No final result yet for ${hash}. Nothing was re-sent. Re-run with: wait ${hash}`);
  return null;
}


async function main() {
  const plan = planCommand(process.argv.slice(2), path => readFileSync(path, "utf8"));
  switch (plan.kind) {
    case "help": console.log(USAGE); return;
    case "config": print({network:networkName(), contract:process.env.OPENWASH_CONTRACT ?? null}); return;
    case "read": print(await readJson(plan.method,plan.args)); return;
    case "inspect": print(await inspect(plan.repo,plan.sha)); return;
    case "quote": {
      const result = await quoteCheck(plan.url,plan.quote);
      print(result);
      if (!result.match) process.exitCode = 1;
      return;
    }
    case "wait": {
      const tx = await settle(plan.hash as TransactionHash,"wait");
      if (tx && process.exitCode !== 1 && tx.data?.contract_address) print({contract:tx.data.contract_address});
      return;
    }
    case "deploy": {
      const stored = readActiveKeystore();
      console.log(`From ${stored.name} ${stored.address}`);
      const client = await signingClient(stored);
      const code = new Uint8Array(readFileSync("contracts/open_wash.py"));
      const hash = await client.deployContract({code,args:[plan.minutes]});
      const tx = await settle(hash as TransactionHash,"deploy");
      if (tx && process.exitCode !== 1) console.log("Contract: " + deployedAddress(tx));
      return;
    }
    case "write": {
      const address = contractAddress();
      const stored = readActiveKeystore();
      console.log(`From ${stored.name} ${stored.address}`);
      const message = await call(plan.preview, plan.previewArgs(stored.address));
      if (typeof message !== "string") throw new CliError("Unreadable preview. Transaction stopped.");
      if (plan.refusal) {
        if (!plan.refusal.test(message) || plan.value !== 0n) throw new CliError("Preview did not return the requested refusal: " + message);
        console.log(message + " (preview, sending zero value)");
      } else if (message !== "") throw new CliError(message);
      const client = await signingClient(stored);
      const hash = await client.writeContract({address,functionName:plan.method,args:plan.args,value:plan.value});
      await settle(hash,plan.command,plan.refusal ? message : undefined);
    }
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
