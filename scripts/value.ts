export function parseGen(text: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,18}))?$/.exec(text.trim());
  if (!match) {
    throw new Error("Amount must be a GEN decimal with at most 18 fractional digits.");
  }
  const frac = (match[2] ?? "").padEnd(18, "0");
  return BigInt(match[1]) * 10n ** 18n + BigInt(frac || "0");
}

export function formatGen(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return frac === "" ? whole.toString() : `${whole}.${frac}`;
}

