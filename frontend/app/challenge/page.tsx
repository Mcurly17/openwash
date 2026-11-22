"use client";
import { Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { read, claimsForRepo } from "../../lib/read";
import {
  claimId,
  repoFrom,
  gen,
  wei,
  addressPattern,
  statusAt,
  type Claim,
  type Pledge,
} from "../../lib/model";
import { Notice, useRead, useClock } from "../../components/reader";

function Preview({
  id,
  addr,
  amount,
}: {
  id: number;
  addr: string;
  amount: string;
}) {
  const now = useClock();
  const { data, error } = useRead(
    useCallback(async () => {
      if (!addressPattern.test(addr))
        throw Error("Enter your public challenger address.");
      const [message, c] = await Promise.all([
        read<string>("preview_challenge", [addr, id, wei(amount)]),
        read<Claim>("get_claim", [id]),
      ]);
      return { message, c };
    }, [id, addr, amount]),
  );
  if (!data) return <Notice error={error} />;
  if (data.message) return <Notice error={data.message} />;
  if (
    statusAt(data.c, now) !== "LIVE" ||
    now >= Date.parse(data.c.challenge_until)
  )
    return <Notice error="The challenge period has ended." />;
  return (
    <div className="notice">
      <strong>Preview accepted</strong>
      <p>
        Use the CLI keystore for {addr}. The command checks the window again
        before signing.
      </p>
      <pre>
        node --env-file-if-exists=.env scripts/openwash.ts challenge {id}{" "}
        --value {amount}
      </pre>
    </div>
  );
}
function Selected({ id }: { id: number }) {
  const params = useSearchParams();
  const { data, error } = useRead(
    useCallback(async () => {
      const c = await read<Claim>("get_claim", [id]);
      return { c, p: await read<Pledge>("get_pledge", [c.pledge_id]) };
    }, [id]),
  );
  if (!data) return <Notice error={error} />;
  const addr = params.get("addr") ?? "",
    amount = params.get("amount") ?? gen(data.p.min_stake);
  return (
    <section>
      <h2>{data.c.hf_repo}</h2>
      <p>
        Minimum stake {gen(data.p.min_stake)} GEN · Window ends{" "}
        {data.c.challenge_until}
      </p>
      <form action="/openwash/challenge/" method="get">
        <input type="hidden" name="id" value={id} />
        <label>
          Challenger address
          <input
            name="addr"
            required
            pattern="0x[0-9A-Fa-f]{40}"
            placeholder="0x…"
            defaultValue={addr}
          />
        </label>
        <label>
          Stake in GEN
          <input
            name="amount"
            required
            inputMode="decimal"
            defaultValue={amount}
          />
        </label>
        <button>Preview challenge</button>
      </form>
      {addr && <Preview id={id} addr={addr} amount={amount} />}
    </section>
  );
}
function Matches({ query }: { query: string }) {
  const { data, error } = useRead(
    useCallback(() => claimsForRepo(repoFrom(query)), [query]),
  );
  if (!data) return <Notice error={error} />;
  return (
    <section>
      <h2>Matching claims</h2>
      {!data.length && <p>No bonded claim matches this repository.</p>}
      {data.map((c) => (
        <p key={c.id}>
          <Link href={"/challenge?id=" + c.id}>
            Claim {c.id} · {c.hf_repo} · {c.revision_sha.slice(0, 12)}
          </Link>
        </p>
      ))}
    </section>
  );
}
function Lookup() {
  const params = useSearchParams(),
    q = (params.get("id") ?? params.get("q") ?? "").trim();
  let id: number | undefined;
  try {
    if (/^\d+$/.test(q)) id = claimId(q);
  } catch {
    return <Notice error="Invalid claim ID." />;
  }
  return (
    <>
      <p className="eyebrow">Dispute a declaration</p>
      <h1>Challenge a claim</h1>
      <p>
        Find the pinned claim and preview a stake against its publisher’s bond.
      </p>
      <form method="get" action="/openwash/challenge/">
        <label>
          Claim ID or Hugging Face repository
          <input
            name="q"
            defaultValue={q}
            required
            placeholder="e.g. allenai/OLMo-2-1124-7B"
          />
        </label>
        <button>Find claim</button>
      </form>
      {id !== undefined ? (
        <Selected id={id} />
      ) : q ? (
        <Matches query={q} />
      ) : null}
    </>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Lookup />
    </Suspense>
  );
}
