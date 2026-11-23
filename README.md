# OpenWash

OpenWash puts a GEN bond behind a publisher’s claim that a particular model revision is open source. Anyone except the publisher can stake a challenge during the claim window. GenLayer validators examine the pinned evidence. The contract computes the grade and settles the bond.

**Live demo** · Studionet deployment pending. The [evidence ledger](docs/evidence.md) will hold the address, receipts, actual grades and observed refusals. The frontend displays this pending state until a real contract address is configured.

## Review the project

1. Read a [demo statement](docs/demo/claims/llama-3.1-claim.html) and follow its source. On the register, open a bonded claim to see its quote, revision, payout and deadline.
2. Inspect the four criteria and source fingerprints. A claim can be declared OPEN before it has a computed grade.
3. Open **Challenge**, enter the claim ID or Hugging Face repository, your public address and stake. The public preview checks eligibility. Sign using the encrypted CLI keystore.
4. Inspect the challenge outcome, available bond and withdrawal credit. The publisher can close after the last claim window ends and all open challenges settle.

| Criterion | Admitted evidence | Decision |
|---|---|---|
| C1 · License | Pinned card metadata and license text, including extra commercial terms or AUP | PASS / FAIL / UNCLEAR |
| C2 · Weights | Exact revision API response, matching SHA and repository, ungated and listed weight files | Boolean, computed in code |
| C3 · Training code | Public training code and an OSI-approved license, with optional GitHub SPDX corroboration | PASS / FAIL / UNCLEAR |
| C4 · Data information | Documentation sufficient to recreate a substantially equivalent system | PASS / FAIL / UNCLEAR |

**Rule in the contract**

> OPENWASH_OSAID_GRADE. A publisher may declare that a named AI model, pinned to a Hugging Face repo id and a 40-character revision SHA, is OPEN. OPEN requires all four fixed criteria: (C1) the license imposes no extra restriction of use, field, user-cap or acceptable-use policy beyond a standard OSI-approved software license; (C2) model weights are publicly listed and the Hugging Face API reports the repo as not gated, at that exact revision; (C3) training code is publicly available under an OSI-approved license; (C4) training-data information is detailed enough that a skilled person could, in principle, recreate a substantially equivalent system using the same or similar data (OSAID 1.0). If C2 and C1 hold but C3 or C4 fail, the grade is OPEN_WEIGHTS_ONLY. If C1 or C2 fail, the grade is RESTRICTED. A challenge against a declared OPEN claim is UPHELD when the computed grade is not OPEN. This is a technical grade, not legal advice and not an official OSAID or AI Act certification. Article 53(2) of Regulation (EU) 2024/1689 is cited only as context for why public weights and an unrestricted license matter.

## Demo cases

| Claim | Recorded source observation on 22 Nov 2026 | Expected demonstration |
|---|---|---|
| A · Llama 3.1 8B | Manual gate, listed shards, Llama 3.1 commercial terms | RESTRICTED, challenge upheld |
| B · OLMo 2 7B | Public weights, Apache-2.0 metadata, linked code and two named datasets | OPEN candidate. Record the actual grade. Show CLOSED at the deadline |
| C · Mistral 7B v0.1 | Ungated Apache-2.0 weights, short card without training or data details | OPEN_WEIGHTS_ONLY, challenge upheld |

A quotes Meta’s announcement. B and C use statements by the demo publisher. Read the current API immediately before registration and pin its returned SHA. The reduced fixtures preserve source fields observed on the date above. The local tests use controlled semantic answers.

## Run locally

Use Python 3.12, Node 24 and PowerShell. From the repository root:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
$env:PYTHONIOENCODING = 'utf-8'
.\.venv\Scripts\genvm-lint.exe check contracts/open_wash.py
.\.venv\Scripts\python.exe -m pytest tests/direct -v
npm ci
npm run test:scripts
npm run typecheck:scripts
npm run lint
npm run test:frontend
$env:NEXT_PUBLIC_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001'
npm run build
npm run dev --workspace openwash-frontend
```

Open `http://localhost:3000/openwash/`. A missing address or the build-only address above displays the pending deployment. The public frontend and CLI views need no account. The CLI help lists read-only inspection commands and the preview-protected writes.

## Scope and limits

**Not legal advice.** This is a technical, documentary grade. OSAID 1.0 informs the rubric. Article 53(2) supplies context for unrestricted licensing and public parameters, with its own conditions and scope. A model’s training history, full reproducibility and legal status require separate evidence. [Open Source Initiative](https://opensource.org/ai/open-source-ai-definition) · [Article 53](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-53)

The HF API can report repository-level access settings at a revision. The contract records the gate observed at judgment time. Weight listings establish file presence, not the contents of a download. External pages can change, validators can disagree, and a bond can be exhausted. See [architecture and threat model](ARCHITECTURE.md) and the [operator runbook](DEPLOY.md).

## Related work

A public Explorer review recorded on 22 November 2026 covered 212 verified projects. Its coverage was partial. OpenWash focuses on a contestable, revision-pinned openness declaration with financial settlement.

| Project | Question addressed |
|---|---|
| [Model Card Conformance Gate](https://github.com/Fan-Yu0/genlayer-model-card-gate) | Card completeness for procurement |
| [AI Act Risk Gate](https://github.com/Fan-Yu0/genlayer-ai-act-risk-gate) | Deployment risk classification |
| [ModelUseGate](https://github.com/jasonmirza1/genlayer-modelusegate) | Model deployment under a usage policy |
| [TunePact](https://github.com/123Cryp/tunepact) | Delivery of a fine-tuned model |
| [LicenseLens](https://github.com/MehdiELL/licenselens) | Software repository license risk |
| [LicenseCheck](https://portal.genlayer.foundation/explorer/licensecheck-2) | Professional licenses |
| [PoisonGuardAI](https://github.com/Naseer32/PoisonGuardAI) | Training-data integrity |

Other projects using the OpenWash name concern washing machines or water and sanitation. This repository concerns model openness. [MIT license](LICENSE)
