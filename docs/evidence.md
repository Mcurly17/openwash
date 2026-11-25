# Studionet evidence · v1.0.0

Session on 23 November 2026, chain 61999. [Live register](https://mcurly17.github.io/openwash/) · [Contract 0x5F8325BB720F249Cc76BB9d21e014bb36CfE62f7](https://explorer-studio.genlayer.com/address/0x5F8325BB720F249Cc76BB9d21e014bb36CfE62f7)

Publisher timbre-a: `0xf5Fe96d62733d40f25822b20C5E46A0E17483dFF`. Challenger timbre-b: `0x74115084812fc662AaAE47B5Fd4Ef60cd5E7BC56`.

## Outcomes

| Claim | Agreed grade | Outcome | C1 | C2 | C3 | C4 |
|---|---|---|---|---|---|---|
| A · Llama 3.1 8B | Undetermined | Challenge 0 remains OPEN | — | — | — | — |
| B · OLMo 2 7B | OPEN | Assessed without settlement | PASS | PASS | PASS | PASS |
| C · Mistral 7B v0.1 | OPEN_WEIGHTS_ONLY | Challenge 1 UPHELD, claim DEBUNKED | PASS | PASS | FAIL | FAIL |

For A, the leader proposed UPHELD with a RESTRICTED grade. The resolution returned MAJORITY_DISAGREE. The claim has no adopted grade and the reserve remains locked. The original resolution was submitted once.

## Registration evidence

### A · meta-llama/Llama-3.1-8B

Declared `OPEN` at 2026-11-23T09:03:28Z. The 15-minute window ends at 2026-11-23T09:18:28Z.

- Revision: `d04e592bb4f6aa9cfee91e2e20afa771667e1d4b`.
- [Quote source](https://ai.meta.com/blog/meta-llama-3-1/) · HTTP 200 · SHA-256 `4721cbc562d38d9cbdb41c215798605a32cd8eb3c2a0be429e44f3b1fdc9960e`.
- Quote: “True to our commitment to open source, starting today, we’re making these models available to the community for download on llama.meta.com and Hugging Face and available for immediate development on our broad ecosystem of partner platforms.”
### B · allenai/OLMo-2-1124-7B

Declared `OPEN` at 2026-11-23T09:03:39Z. The 10-minute window ends at 2026-11-23T09:13:39Z.

- Revision: `7df9a82518afdecae4e8c026b27adccc8c1f0032`.
- [Quote source](https://mcurly17.github.io/openwash/demo/claims/olmo-2-claim.html) · HTTP 200 · SHA-256 `218ac651c929afb9a1d2b7e28d554dbfcf149df0c842306a8e1e01e1d12c75d1`.
- Quote: “OLMo 2 7B is open source (OSAID-oriented).”
### C · mistralai/Mistral-7B-v0.1

Declared `OPEN` at 2026-11-23T09:03:54Z. The 10-minute window ends at 2026-11-23T09:13:54Z.

- Revision: `27d67f1b5f57dc0953326b2601d68371d40ea8da`.
- [Quote source](https://mcurly17.github.io/openwash/demo/claims/mistral-7b-claim.html) · HTTP 200 · SHA-256 `6275bd13b1820e75da717087a15a6e457a8369916d286dc4ef571e09ead2d240`.
- Quote: “Mistral-7B-v0.1 is open source.”

Registration used the official Meta page for A. B and C use statements from the demo publisher. All three static Pages statement URLs returned HTTP 200 and contained the respective quote. On this Studionet endpoint the ordinary registration preview read errored. Calling the same preview method using the SDK's transaction-free simulation succeeded before each registration.

## Source readings

A lists the leader's evidence from its disputed receipt. B and C list the leaders' readings for agreed decisions. Each exact HF revision returned HTTP 200 with the recorded SHA. No HTTP 429 appears in these traces. This sample does not establish a rate limit. The runner supplied no final redirect URL for these reads.

### A · Disputed leader reading

HF SHA read `d04e592bb4f6aa9cfee91e2e20afa771667e1d4b`. Gate `manual`. Weight files listed: true. C1 FAIL, C2 FAIL, C3 FAIL, C4 UNCLEAR.

| Requested source | HTTP | SHA-256 |
|---|---:|---|
| [Pinned model metadata](https://huggingface.co/api/models/meta-llama/Llama-3.1-8B/revision/d04e592bb4f6aa9cfee91e2e20afa771667e1d4b) | 200 | `fa26a316c0a4ad88f316e291dbb461746331c4167555ebb0d4dc343256d79a16` |
| [raw README.md](https://huggingface.co/meta-llama/Llama-3.1-8B/raw/d04e592bb4f6aa9cfee91e2e20afa771667e1d4b/README.md) | 401 | `7b30115bbad863f439e8bedc2d1c3145732be7ef1e2d46b488942973b116abc4` |
| [resolve README.md](https://huggingface.co/meta-llama/Llama-3.1-8B/resolve/d04e592bb4f6aa9cfee91e2e20afa771667e1d4b/README.md) | 200 | `6615eaa410934067ed31834ab66285acb0dc2d0a36056771601dad47efce194a` |
| [raw LICENSE](https://huggingface.co/meta-llama/Llama-3.1-8B/raw/d04e592bb4f6aa9cfee91e2e20afa771667e1d4b/LICENSE) | 401 | `7b30115bbad863f439e8bedc2d1c3145732be7ef1e2d46b488942973b116abc4` |
| [resolve LICENSE](https://huggingface.co/meta-llama/Llama-3.1-8B/resolve/d04e592bb4f6aa9cfee91e2e20afa771667e1d4b/LICENSE) | 200 | `64e1b2889b7892e6bbe7a7ed5bfe6ff793c61f9d584345f8f41cf9f5cb30a369` |

### B · Agreed criteria

HF SHA read `7df9a82518afdecae4e8c026b27adccc8c1f0032`. Gate `false`. Weight files listed: true. C1 PASS, C2 PASS, C3 PASS, C4 PASS.

| Requested source | HTTP | SHA-256 |
|---|---:|---|
| [Pinned model metadata](https://huggingface.co/api/models/allenai/OLMo-2-1124-7B/revision/7df9a82518afdecae4e8c026b27adccc8c1f0032) | 200 | `d73068b34beda460c2ded867c3268e37b91af5c8e6881edb5f652dd9dac899b9` |
| [raw README.md](https://huggingface.co/allenai/OLMo-2-1124-7B/raw/7df9a82518afdecae4e8c026b27adccc8c1f0032/README.md) | 200 | `a87d5b59422c6040caf0fc62cbcb5f7ace6c71489c1173cf6d9e000777eac962` |
| [raw LICENSE](https://huggingface.co/allenai/OLMo-2-1124-7B/raw/7df9a82518afdecae4e8c026b27adccc8c1f0032/LICENSE) | 404 | `f36668ddf22403a332f978057d527cf285b01468bc3431b04094a7bafa6aba59` |
| [Training repository metadata](https://api.github.com/repos/allenai/OLMo) | 200 | `bc71b029504d6dd00247a332351114ded2c3a3773104aace30febdeec5d575d5` |

### C · Agreed criteria

HF SHA read `27d67f1b5f57dc0953326b2601d68371d40ea8da`. Gate `false`. Weight files listed: true. C1 PASS, C2 PASS, C3 FAIL, C4 FAIL.

| Requested source | HTTP | SHA-256 |
|---|---:|---|
| [Pinned model metadata](https://huggingface.co/api/models/mistralai/Mistral-7B-v0.1/revision/27d67f1b5f57dc0953326b2601d68371d40ea8da) | 200 | `73d99f0aaf0b1b8f65c4372b4fe56146cd073b3768cdf5efa1ccce2c6002ec51` |
| [raw README.md](https://huggingface.co/mistralai/Mistral-7B-v0.1/raw/27d67f1b5f57dc0953326b2601d68371d40ea8da/README.md) | 200 | `418b17bd94d6b448cd5b6f476a4077129b563f447f36bd94e31b259bd6fcba7a` |
| [raw LICENSE](https://huggingface.co/mistralai/Mistral-7B-v0.1/raw/27d67f1b5f57dc0953326b2601d68371d40ea8da/LICENSE) | 404 | `f36668ddf22403a332f978057d527cf285b01468bc3431b04094a7bafa6aba59` |

The OLMo GitHub metadata read succeeded on Studionet. An independent public GitHub API read returned SPDX `Apache-2.0`. The on-chain trace records the response digest; the contract stores C3 PASS.

## Transactions

The table preserves the status observed by the operator when advancing to the next step. The explorer can subsequently report finalization.

| Step | Operation | Transaction hash | Status / consensus / execution | Result |
|---|---|---|---|---|
| P2 | Deploy | [0x3c34d0497da548503770a8b789bdf1a5213ed3eaf106592a5645dcfcc33d775d](https://explorer-studio.genlayer.com/tx/0x3c34d0497da548503770a8b789bdf1a5213ed3eaf106592a5645dcfcc33d775d) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 0x5F8325BB720F249Cc76BB9d21e014bb36CfE62f7 |
| 1 | Create pledge | [0x7b4231a8fe2dd73277220e8d65535a07203a35d049701698add7a22f1e7a2ae3](https://explorer-studio.genlayer.com/tx/0x7b4231a8fe2dd73277220e8d65535a07203a35d049701698add7a22f1e7a2ae3) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 0 |
| 2 | Register A | [0x6be8c8434a2bae9df8fdf4a7313e90ce0881ed77a8d08618059283ea0cb76428](https://explorer-studio.genlayer.com/tx/0x6be8c8434a2bae9df8fdf4a7313e90ce0881ed77a8d08618059283ea0cb76428) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 0 |
| 3 | Register B | [0x912d07062c073c3b18e22d3f837468fa06c0e1c62c12136b3e79c4b5a6b55358](https://explorer-studio.genlayer.com/tx/0x912d07062c073c3b18e22d3f837468fa06c0e1c62c12136b3e79c4b5a6b55358) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 1 |
| 4 | Register C | [0xa48271ffc4fb5bd199ed121f8673ba83fb60bb4a5d08404ee46658484b2d7a32](https://explorer-studio.genlayer.com/tx/0xa48271ffc4fb5bd199ed121f8673ba83fb60bb4a5d08404ee46658484b2d7a32) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 2 |
| 5 | Early close | [0x3c4220266fe70cbeedb92aaecdcb67b8be2946a86447103b92e03b2f5ee8ee08](https://explorer-studio.genlayer.com/tx/0x3c4220266fe70cbeedb92aaecdcb67b8be2946a86447103b92e03b2f5ee8ee08) | ACCEPTED / MAJORITY_AGREE / ERROR | [EXPECTED] a claim challenge period is open until 2026-11-23T09:18:28Z |
| 6 | Challenge A | [0x522f4289d768cfa425f0923588ec9ce3c137ef65db024a64ffacb6b396157e71](https://explorer-studio.genlayer.com/tx/0x522f4289d768cfa425f0923588ec9ce3c137ef65db024a64ffacb6b396157e71) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 0 |
| 7 | Resolve A | [0x4ca617863909b8fe713e11bbd6e0442a9ca368272ffee64792718cf115ac2979](https://explorer-studio.genlayer.com/tx/0x4ca617863909b8fe713e11bbd6e0442a9ca368272ffee64792718cf115ac2979) | UNDETERMINED / MAJORITY_DISAGREE / SUCCESS | Validators did not reach consensus. Check the receipt in the explorer. |
| 8 | Challenge C | [0xb62e148f86d5893396c0104f0cd7d64be4b536f3b391f51cc6660acd12646b50](https://explorer-studio.genlayer.com/tx/0xb62e148f86d5893396c0104f0cd7d64be4b536f3b391f51cc6660acd12646b50) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 1 |
| 9 | Resolve C | [0x1d16022a85d435a1d71af80b0de8c4242fcebf2e576b630ebd8017a8e827bde7](https://explorer-studio.genlayer.com/tx/0x1d16022a85d435a1d71af80b0de8c4242fcebf2e576b630ebd8017a8e827bde7) | ACCEPTED / MAJORITY_AGREE / SUCCESS | UPHELD |
| 10 | Grade B | [0xe44b35c604bc1f336b6b9b58a33e54d89d75294dbf9672e615c6fb177b388c99](https://explorer-studio.genlayer.com/tx/0xe44b35c604bc1f336b6b9b58a33e54d89d75294dbf9672e615c6fb177b388c99) | ACCEPTED / MAJORITY_AGREE / SUCCESS | OPEN |
| 11 | Late challenge B | [0x67f603dfe4b2d75278930e1a87ba9a50b7d93a2475cc9ee7b005322702f32e91](https://explorer-studio.genlayer.com/tx/0x67f603dfe4b2d75278930e1a87ba9a50b7d93a2475cc9ee7b005322702f32e91) | ACCEPTED / MAJORITY_AGREE / ERROR | [EXPECTED] challenge period ended (2026-11-23T09:13:39Z) |
| 12 | Withdraw challenger credit | [0x44c1e05305bfce03e42beee38959e8dcde449cc154793aa08ebca62b12d8c377](https://explorer-studio.genlayer.com/tx/0x44c1e05305bfce03e42beee38959e8dcde449cc154793aa08ebca62b12d8c377) | ACCEPTED / MAJORITY_AGREE / SUCCESS | 0.11 GEN |

## Closing and withdrawal

The late challenge carried zero value. After the refusal, claim B returned `CLOSED` with grade `OPEN` and deadline 2026-11-23T09:13:39Z.

After `locked_until` (2026-11-23T09:18:28Z), the final close preview returned `[EXPECTED] a challenge is still open on this pledge`. The operator did not submit a closing transaction. Challenge 0 remains OPEN with a resolution deadline of 2026-11-26T09:04:34Z.

| Balance in GEN | Before withdrawal | After withdrawal |
|---|---:|---:|
| Publisher credit | 0 | 0 |
| Challenger credit | 0.11 | 0 |
| Available bond | 0 | 0 |
| Reserved bond | 0.1 | 0.1 |

The C payout and returned stake funded the challenger withdrawal. The remaining 0.1 GEN reserve and 0.01 GEN stake belong to unresolved challenge A. The publisher had zero credit. No publisher withdrawal or expiry transaction was submitted.
