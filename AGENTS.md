# OpenWash repository rules

Work locally in English. Use the root specification for the rule, storage,
windows, evidence, grading, settlement, public interfaces and release checks.
Keep the specification and the dated working briefs out of version control.

## History

Use Mcurly17 <9095525+Mcurly17@users.noreply.github.com> as both author and
committer. Use imperative English subjects of at most 72 characters. The first
commit must read "Add project rules for this repository". Make one local commit
per green phase. Never amend, rebase or force an existing commit. Omit
co-author trailers, generation notices and assistant or generator names from
messages, tags, code and documentation. Install and exercise the local
commit-message hook before the first commit.

## Accounts and network

Never inspect environment files except the public example or inspect the CLI
account directory. Never accept, suggest, print or persist signing material,
recovery phrases or unlock credentials. Use only the encrypted GenLayer CLI
keystore. The operator selects an account with `npx genlayer account use <name>`,
unlocks it with `npx genlayer account unlock --account <name>` and locks it
afterwards. Publisher timbre-a is 0xf5Fe96d62733d40f25822b20C5E46A0E17483dFF.
Challenger timbre-b is 0x74115084812fc662AaAE47B5Fd4Ef60cd5E7BC56.

Repository creation and pushes require P1. Deployment requires P2. Every
on-chain write requires P3. Leave those actions and the submission portal
to the operator. Send each authorized transaction once. Recover a timeout
with `wait <hash>`. Verify every write with its corresponding preview before
signing. Refused payables on Studionet retain value.

## Implementation

Pin the contract's first line exactly:

```
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

Use the pinned runner and genlayer-js 1.1.8. Reuse verified WasPrice patterns
for keystore use, receipts, previews, withdrawals, direct tests and Pages.
Check uncertain interfaces against official documentation or record
TODO(verify) at the relevant site. Avoid CLI positional serialization of string
contract arguments. In PowerShell use flags and quote files, without empty
arguments or nested quotes. Send GEN amounts with the script's --value flag.

For C2 fetch the exact Hugging Face revision, record the HTTP status and revision
actually read, and fail closed on a non-200 or SHA mismatch without a prompt.
Raw documents can return 401 while metadata and resolve at the same pin are
available. Record which source was read. Keep each claim window strictly
inside pledge coverage. Refuse late challenges and expose CLOSED after the
window when no challenge is open, preserving DEBUNKED. Closing waits for all
windows and all open challenges. Support expected refusals on close and
challenge. Run the specification's lint, test, build, size, history and content
checks before each phase commit as applicable.
