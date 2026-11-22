import { criteria } from "../../lib/model";
export default function Rules() {
  return (
    <article className="prose">
      <p className="eyebrow">OPENWASH_OSAID_GRADE</p>
      <h1>Grading rule</h1>
      <p>
        One declaration, four fixed criteria and three possible grades. Not
        legal advice.
      </p>
      <section>
        <h2>The criteria</h2>
        {criteria.map(([id, title, desc]) => (
          <div className="resultrow" key={id}>
            <small>{id}</small>
            <span>
              <strong>{title}</strong>
              {desc}
            </span>
          </div>
        ))}
      </section>
      <section>
        <h2>Grade and settlement</h2>
        <p>
          All four criteria must pass for OPEN. Passing C1 and C2 yields
          OPEN_WEIGHTS_ONLY when either remaining criterion fails or is unclear.
          A C1 or C2 failure yields RESTRICTED, as does an unclear C1.
        </p>
        <p>
          An upheld challenge pays the challenger the reserved payout and
          returns the stake. A rejected challenge adds the stake to the bond. An
          unreadable revision or expired challenge returns the stake and
          releases the reserve.
        </p>
        <details>
          <summary>Full contract rule</summary>
          <p>
            OPENWASH_OSAID_GRADE. A publisher may declare that a named AI model,
            pinned to a Hugging Face repo id and a 40-character revision SHA, is
            OPEN. OPEN requires all four fixed criteria: (C1) the license
            imposes no extra restriction of use, field, user-cap or
            acceptable-use policy beyond a standard OSI-approved software
            license; (C2) model weights are publicly listed and the Hugging Face
            API reports the repo as not gated, at that exact revision; (C3)
            training code is publicly available under an OSI-approved license;
            (C4) training-data information is detailed enough that a skilled
            person could, in principle, recreate a substantially equivalent
            system using the same or similar data (OSAID 1.0). If C2 and C1 hold
            but C3 or C4 fail, the grade is OPEN_WEIGHTS_ONLY. If C1 or C2 fail,
            the grade is RESTRICTED. A challenge against a declared OPEN claim
            is UPHELD when the computed grade is not OPEN. This is a technical
            grade, not legal advice and not an official OSAID or AI Act
            certification. Article 53(2) of Regulation (EU) 2024/1689 is cited
            only as context for why public weights and an unrestricted license
            matter.
          </p>
        </details>
      </section>
      <section>
        <h2>Sources and limits</h2>
        <p>
          The weight check uses the public file listing and gated flag at the
          exact Hugging Face revision. Validators interpret licenses, training
          code and data documentation. Listings do not prove reproducibility.
          The linked GitHub repository can change after registration.
        </p>
        <p>
          OSAID 1.0 informs the data-information criterion. Article 53(2)
          provides context for public weights and licensing. This technical
          grade carries no official certification.
        </p>
        <a href="https://opensource.org/ai/open-source-ai-definition">
          OSAID 1.0 ↗
        </a>{" "}
        ·{" "}
        <a href="https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-53">
          Article 53 ↗
        </a>
      </section>
      <section>
        <h2>Related work</h2>
        <ul>
          <li>
            Card completeness for procurement ·{" "}
            <a href="https://github.com/Fan-Yu0/genlayer-model-card-gate">
              Model Card Conformance Gate
            </a>
          </li>
          <li>
            Deployment risk classification ·{" "}
            <a href="https://github.com/Fan-Yu0/genlayer-ai-act-risk-gate">
              AI Act Risk Gate
            </a>
          </li>
          <li>
            Model deployment under a usage policy ·{" "}
            <a href="https://github.com/jasonmirza1/genlayer-modelusegate">
              ModelUseGate
            </a>
          </li>
          <li>
            Delivery of a fine-tuned model ·{" "}
            <a href="https://github.com/123Cryp/tunepact">TunePact</a>
          </li>
          <li>
            Software repository license risk ·{" "}
            <a href="https://github.com/MehdiELL/licenselens">LicenseLens</a>
          </li>
          <li>
            Professional licenses ·{" "}
            <a href="https://portal.genlayer.foundation/explorer/licensecheck-2">
              LicenseCheck
            </a>
          </li>
          <li>
            Training-data integrity ·{" "}
            <a href="https://github.com/Naseer32/PoisonGuardAI">
              PoisonGuardAI
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
