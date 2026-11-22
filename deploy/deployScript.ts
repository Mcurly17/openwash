import { readFileSync } from "node:fs";
import type { GenLayerClient, GenLayerChain, TransactionHash } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";
import { interpretReceipt } from "../scripts/receipt.ts";

export function deployedAddress(receipt:Record<string,any>):string {
  const address = receipt.data?.contract_address ?? receipt.txDataDecoded?.contractAddress;
  if (typeof address !== "string" || !/^0x[0-9a-f]{40}$/i.test(address)) throw new Error("Confirmed deployment has no address. Inspect its transaction hash.");
  return address;
}

export default async function main(client:GenLayerClient<GenLayerChain>) {
  const code = new Uint8Array(readFileSync("contracts/open_wash.py"));
  await client.initializeConsensusSmartContract();
  const hash = await client.deployContract({code,args:[10]});
  console.log("Deployment transaction: " + hash);
  const receipt = await client.waitForTransactionReceipt({hash:hash as TransactionHash,status:TransactionStatus.ACCEPTED,retries:200});
  const outcome = interpretReceipt(receipt);
  if (outcome.kind !== "success") throw new Error(outcome.message ?? "Deployment unconfirmed. Use wait " + hash);
  console.log("Contract: " + deployedAddress(receipt));
}
