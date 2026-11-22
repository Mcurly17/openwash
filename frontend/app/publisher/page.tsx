"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { read } from "../../lib/read";
import { addressPattern, gen } from "../../lib/model";
import { Notice, useRead } from "../../components/reader";
type Standing = {
  pledges: number;
  claims: number;
  debunked: number;
  rejected: number;
  bonded_now: string;
};
function Record({ addr }: { addr: string }) {
  const { data, error } = useRead(
    useCallback(async () => {
      if (!addressPattern.test(addr)) throw Error("Invalid publisher address.");
      return read<Standing>("standing", [addr]);
    }, [addr]),
  );
  if (!data) return <Notice error={error} />;
  return (
    <section>
      <h2>Publisher standing</h2>
      <div className="cards">
        {Object.entries(data).map(([key, val]) => (
          <div key={key}>
            <small>{key.replace("_", " ")}</small>
            <h3>{key === "bonded_now" ? gen(String(val)) + " GEN" : val}</h3>
          </div>
        ))}
      </div>
      <h3>Publisher badge</h3>
      <p>Embed a link to this publisher’s current standing.</p>
      <pre>{`<a href="https://mcurly17.github.io/openwash/publisher/?addr=${addr}">Bonded open-source grade – OpenWash</a>`}</pre>
    </section>
  );
}
function Lookup() {
  const addr = useSearchParams().get("addr") ?? "";
  return (
    <>
      <p className="eyebrow">Bonded declarations</p>
      <h1>Publisher standing</h1>
      <form action="/openwash/publisher/" method="get">
        <label>
          Publisher address
          <input
            name="addr"
            placeholder="0x…"
            defaultValue={addr}
            required
            pattern="0x[0-9A-Fa-f]{40}"
          />
        </label>
        <button>Look up publisher</button>
      </form>
      {addr && <Record addr={addr} />}
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
