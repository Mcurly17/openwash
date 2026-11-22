"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRead, useClock, Notice } from "../components/reader";
import { configured, recentClaims } from "../lib/read";
import { criteria, statusAt } from "../lib/model";

function Register() {
  const [offset, setOffset] = useState(0);
  const { data, error } = useRead(
    useCallback(() => recentClaims(offset), [offset]),
  );
  const now = useClock();
  if (!data) return <Notice error={error} />;
  return (
    <>
      <p>
        {data.stats.claims} claims · {data.stats.pledges} pledges ·{" "}
        {data.stats.challenges} challenges
      </p>
      <div className="rows">
        {data.rows.map((c) => (
          <Link className="resultrow" key={c.id} href={"/claim?id=" + c.id}>
            <span>
              <small>CLAIM {c.id}</small>
              <strong>{c.hf_repo}</strong>
              <code>{c.revision_sha.slice(0, 12)}</code>
            </span>
            <span>
              {c.last_grade || "Awaiting assessment"}{" "}
              <b className="pill">{statusAt(c, now)}</b>
            </span>
          </Link>
        ))}
      </div>
      {!data.rows.length && <p>No claims have been registered.</p>}
      <div className="actions">
        {offset > 0 && (
          <button onClick={() => setOffset(offset - 12)}>Newer claims</button>
        )}
        {offset + 12 < data.stats.claims && (
          <button onClick={() => setOffset(offset + 12)}>Older claims</button>
        )}
      </div>
    </>
  );
}
export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">GenLayer / Studionet</p>
          <h1>
            Open-source
            <br />
            <em>claim register.</em>
          </h1>
          <p>
            A publisher bonds a claim about a model. Anyone can challenge it
            against the same four criteria.
          </p>
          <Link className="button" href="/rules">
            Read the rule <span>↗</span>
          </Link>
        </div>
        <aside className="rubric">
          <h2>Grading criteria</h2>
          {criteria.map(([id, name]) => (
            <div key={id}>
              <code>{id}</code>
              <strong>{name}</strong>
            </div>
          ))}
        </aside>
      </section>
      <section>
        <div className="sectiontitle">
          <h2>Bonded claims</h2>
          <span className="network">
            <i />
            Studionet
          </span>
        </div>
        {configured ? (
          <Register />
        ) : (
          <div className="notice">
            <strong>Deployment pending</strong>
            <p>
              Bonded claims will appear here once the contract address is
              published.
            </p>
          </div>
        )}
      </section>
      <section>
        <h2>Demo sources</h2>
        <p>Publisher statements prepared for the Studionet demonstration.</p>
        <div className="cards">
          {[
            ["Llama 3.1 8B", "Meta", "llama-3.1"],
            ["OLMo 2 7B", "Allen Institute for AI", "olmo-2"],
            ["Mistral 7B v0.1", "Mistral AI", "mistral-7b"],
          ].map(([name, org, slug]) => (
            <a
              key={slug}
              href={"/openwash/demo/claims/" + slug + "-claim.html"}
            >
              <small>{org}</small>
              <h3>{name}</h3>
              <span>Read statement ↗</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
