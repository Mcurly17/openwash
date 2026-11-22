import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { addressPattern, type Claim } from "./model";

export const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const configured =
  addressPattern.test(address) && !/^0x0{39}[01]$/i.test(address);
const client = createClient({ chain: studionet });
export async function read<T>(
  functionName: string,
  args: (string | number)[] = [],
): Promise<T> {
  if (!configured) throw Error("The Studionet deployment is pending.");
  const result = await client.readContract({
    address: address as `0x${string}`,
    functionName,
    args,
    jsonSafeReturn: true,
  });
  if (typeof result !== "string") throw Error("Unreadable contract response.");
  if (functionName.startsWith("preview_")) return result as T;
  return JSON.parse(result) as T;
}
export async function recentClaims(offset: number, limit = 12) {
  const stats = await read<{
    claims: number;
    pledges: number;
    challenges: number;
  }>("get_stats");
  const end = Math.max(0, stats.claims - offset);
  const ids = Array.from(
    { length: Math.min(end, limit) },
    (_, i) => end - 1 - i,
  );
  return {
    stats,
    rows: await Promise.all(ids.map((id) => read<Claim>("get_claim", [id]))),
  };
}
export async function claimsForRepo(repo: string) {
  const hits: Claim[] = [];
  for (let offset = 0; ; offset += 12) {
    const { rows, stats } = await recentClaims(offset);
    hits.push(
      ...rows.filter((c) => c.hf_repo.toLowerCase() === repo.toLowerCase()),
    );
    if (offset + 12 >= stats.claims) return hits;
  }
}
