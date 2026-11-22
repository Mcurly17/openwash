"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { read, address } from "../../lib/read";
import {
  claimId,
  criteria,
  gen,
  statusAt,
  EXPLORER,
  type Claim,
  type Pledge,
  type Challenge,
} from "../../lib/model";
import { Notice, useRead, useClock } from "../../components/reader";

function Detail() {
  const raw = useSearchParams().get("id") ?? "";
  const { data, error } = useRead(
    useCallback(async () => {
      const id = claimId(raw);
      const c = await read<Claim>("get_claim", [id]);
      const [p, challenges] = await Promise.all([
        read<Pledge>("get_pledge", [c.pledge_id]),
        read<Challenge[]>("list_challenges", [id]),
      ]);
      return { c, p, challenges };
    }, [raw]),
  );
  const now = useClock();
  if (!data)
    return (
      <>
        <h1>Claim record</h1>
        <Notice error={error} />
      </>
    );
  const { c, p, challenges } = data;
  const status = statusAt(c, now),
    until = Date.parse(c.challenge_until),
    start = Date.parse(c.declared_at);
  const values = [
    c.c1,
    c.evidence.readable ? (c.c2_pass ? "PASS" : "FAIL") : "",
    c.c3,
    c.c4,
  ];
  return (
    <>
      <p className="eyebrow">
        Claim {c.id} / Pledge {c.pledge_id}
      </p>
      <h1>{c.hf_repo}</h1>
      <span className="pill">{status}</span>
      <p>
        Declared OPEN by{" "}
        <Link href={"/publisher?addr=" + p.publisher}>{p.name}</Link> ·{" "}
        {gen(p.payout)} GEN payout
      </p>
      <blockquote>{c.quote}</blockquote>
      <a href={c.claim_url}>Claim source ↗</a>
      <section>
        <h2>Challenge window</h2>
        <progress
          aria-label="Elapsed challenge period"
          value={Math.max(0, Math.min(1, (now - start) / (until - start)))}
          max={1}
        />
        <div className="timeline">
          <time>{c.declared_at}</time>
          <time>{c.challenge_until}</time>
        </div>
        {status === "CLOSED" ? (
          <p>
            The challenge period ended at {c.challenge_until}: this claim can no
            longer be challenged.
          </p>
        ) : c.open_challenge ? (
          <p>A challenge is awaiting settlement.</p>
        ) : status === "LIVE" && now < until ? (
          <Link className="button" href={"/challenge?id=" + c.id}>
            Challenge this claim ↗
          </Link>
        ) : null}
      </section>
      <section>
        <h2>{c.last_grade || "Awaiting assessment"}</h2>
        <div className="rows">
          {criteria.map(([id, title, desc], i) => (
            <div className="resultrow" key={id}>
              <span>
                <small>{id}</small>
                <strong>{title}</strong>
                {desc}
              </span>
              <b className="pill">{values[i] || "Unassessed"}</b>
            </div>
          ))}
        </div>
        <p>
          Revision{" "}
          <a
            href={`https://huggingface.co/${c.hf_repo}/tree/${c.revision_sha}`}
          >
            <code>{c.revision_sha}</code>
          </a>
        </p>
        <details>
          <summary>Evidence and hashes</summary>
          <p>
            Claim page SHA-256 <code>{c.claim_page_sha256}</code>
          </p>
          {c.evidence.reason && <p>{c.evidence.reason}</p>}
          {c.evidence.sources?.map((s, i) => (
            <p key={i}>
              <b>HTTP {s.status}</b> · <code>{s.requested}</code>
              {s.final && (
                <>
                  <br />
                  Final URL <code>{s.final}</code>
                </>
              )}
              <br />
              <code>{s.sha256}</code>
            </p>
          ))}
        </details>
      </section>
      <section>
        <h2>Challenges and transactions</h2>
        {challenges.length ? (
          challenges.map((ch) => (
            <div className="resultrow" key={ch.id}>
              <span>
                <strong>
                  Challenge {ch.id} · {ch.status}
                </strong>
                {ch.reason || "Resolution due " + ch.resolve_deadline}
              </span>
              <span>{gen(ch.stake)} GEN</span>
            </div>
          ))
        ) : (
          <p>No challenge recorded.</p>
        )}
        <a href={EXPLORER + "/address/" + address}>Contract transactions ↗</a>{" "}
        ·{" "}
        <a href="https://github.com/Mcurly17/openwash/blob/main/docs/evidence.md">
          Demo receipts ↗
        </a>
      </section>
    </>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Detail />
    </Suspense>
  );
}
