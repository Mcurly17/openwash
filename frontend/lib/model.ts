export type Status = "LIVE" | "CLOSED" | "DEBUNKED";
export type Grade = "OPEN" | "OPEN_WEIGHTS_ONLY" | "RESTRICTED";
export type Criterion = "PASS" | "FAIL" | "UNCLEAR";
export interface Claim {
  id: number;
  pledge_id: number;
  hf_repo: string;
  revision_sha: string;
  claim_url: string;
  quote: string;
  declared_at: string;
  challenge_until: string;
  declared_grade: Grade;
  status: Status;
  open_challenge: boolean;
  last_grade: Grade | "";
  c1: Criterion | "";
  c2_pass: boolean;
  c2_gated: string;
  c3: Criterion | "";
  c4: Criterion | "";
  claim_page_sha256: string;
  hf_json_sha256: string;
  hf_sha_read: string;
  evidence: {
    readable?: boolean;
    reason?: string;
    sources?: {
      status: number;
      requested: string;
      final: string;
      sha256: string;
    }[];
  };
}
export interface Pledge {
  publisher: string;
  name: string;
  payout: string;
  min_stake: string;
  bond: string;
  locked_until: string;
}
export interface Challenge {
  id: number;
  status: string;
  challenger: string;
  stake: string;
  grade: string;
  reason: string;
  resolve_deadline: string;
}
export const criteria = [
  [
    "C1",
    "License terms",
    "Use, modification and redistribution under unrestricted terms.",
  ],
  [
    "C2",
    "Public weights",
    "Weight files listed at the pinned, ungated revision.",
  ],
  [
    "C3",
    "Training code",
    "Public training code under an OSI-approved license.",
  ],
  [
    "C4",
    "Data information",
    "Enough detail to recreate a substantially equivalent system.",
  ],
] as const;
export function verdict(
  c1: Criterion,
  c2: boolean,
  c3: Criterion,
  c4: Criterion,
): Grade {
  if (c1 !== "PASS" || !c2) return "RESTRICTED";
  return c3 === "PASS" && c4 === "PASS" ? "OPEN" : "OPEN_WEIGHTS_ONLY";
}
export function statusAt(
  c: Pick<Claim, "status" | "challenge_until" | "open_challenge">,
  now = Date.now(),
): Status {
  return c.status === "LIVE" &&
    !c.open_challenge &&
    now >= Date.parse(c.challenge_until)
    ? "CLOSED"
    : c.status;
}
export function repoFrom(raw: string) {
  const id = raw
    .trim()
    .replace(/^https:\/\/huggingface\.co\//, "")
    .replace(/\/$/, "");
  if (
    id.length > 192 ||
    id.includes("..") ||
    id.split("/").includes(".") ||
    !/^[\w.-]+\/[\w.-]+$/.test(id)
  )
    throw Error("Enter a claim ID or a Hugging Face repository.");
  return id;
}
export function sha(raw: string) {
  const pin = raw.trim().toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(pin)) throw Error("Expected a full revision SHA.");
  return pin;
}
export function gen(wei: string) {
  const v = BigInt(wei),
    unit = 10n ** 18n;
  const decimals = (v % unit).toString().padStart(18, "0").replace(/0+$/, "");
  return (v / unit).toString() + (decimals ? "." + decimals : "");
}
export function wei(amount: string) {
  const m = /^(\d+)(?:\.(\d{1,18}))?$/.exec(amount);
  if (!m) throw Error("Enter a GEN amount with up to 18 decimal places.");
  return (
    BigInt(m[1]) * 10n ** 18n +
    BigInt((m[2] ?? "").padEnd(18, "0"))
  ).toString();
}
export function claimId(value: string) {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw Error("Enter a non-negative claim ID.");
  return Number(value);
}
export const EXPLORER = "https://explorer-studio.genlayer.com";
export const addressPattern = /^0x[0-9a-fA-F]{40}$/;
