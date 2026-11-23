# Operator runbook

Run each group in the same PowerShell session, from the project root. Check the receipt and returned ID after each transaction before executing the next command. The numbered steps assume a fresh contract, no competing registrations and the two named accounts. If a returned ID differs, substitute that actual ID in subsequent commands. Allow time for your own interactive unlock and signing prompts. Start the short windows only after the public pages and both funded accounts are ready.

P1 authorizes publication. P2 authorizes a single deployment. P3 authorizes the ordered demo transactions. These commands are for the operator after the relevant gate.

## Local session

Use Node 24, the packages from `npm ci`, Git and the GitHub CLI. Install the lockfile once before starting the timed demonstration.

```powershell
Set-Location 'C:\Users\Al\Desktop\Projets\GenLayer\OpenWash'
$env:GENLAYER_NETWORK = 'studionet'
function ow {
    node --env-file-if-exists=.env scripts/openwash.ts @args
    if ($LASTEXITCODE -ne 0) { throw 'Inspect the output before continuing.' }
}
function Wait-WindowEnd($Deadline) {
    $seconds = [Math]::Ceiling((([DateTimeOffset]$Deadline) - [DateTimeOffset]::UtcNow).TotalSeconds)
    if ($seconds -gt 0) { Start-Sleep -Seconds ($seconds + 2) }
}
```

At any timeout after a hash appears, stop the sequence and run the following read on the **original** hash. Never resend. For expected refusals, `wait` displays the failed execution and contract message. Verify it against the expected reason. If the client loses contact before printing a hash, inspect the active account’s transaction history before taking further action.

```powershell
$txHash = Read-Host 'Transaction hash'
ow wait $txHash
```

## P1 · Publish the repository and annotated tag

```powershell
gh repo create Mcurly17/openwash --public --source . --remote origin
git push --set-upstream origin main
gh api --method POST repos/Mcurly17/openwash/pages -f build_type=workflow
gh workflow run pages.yml --ref main
git push origin v1.0.0
```

Expect a public repository with the six local commits, an upstream main, a Pages workflow and the annotated v1.0.0 tag. A fresh project uses the Pages create endpoint once. If Pages already exists, inspect its build type before changing settings. Wait for the Pages deployment to succeed. Quote checks below verify that the statements are reachable. [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)

## P2 · Deploy once

```powershell
npx genlayer account use timbre-a
npx genlayer account unlock --account timbre-a
ow deploy --min-challenge-minutes 10
```

Check the displayed signer is timbre-a, 0xf5Fe96d62733d40f25822b20C5E46A0E17483dFF. Unlock and later lock both accounts yourself. Type the interactive unlock credential only into the masked prompt. The signing client opens the selected encrypted CLI keystore and also prompts for each signature. Record the transaction hash immediately. A successful Studio receipt has ACCEPTED or FINALIZED status, agreement and successful execution. The deploy path extracts `data.contract_address`.

```powershell
$env:OPENWASH_CONTRACT = Read-Host 'Confirmed contract address'
if ($env:OPENWASH_CONTRACT -notmatch '^0x[0-9a-fA-F]{40}$') { throw 'Invalid address' }
ow stats
gh variable set NEXT_PUBLIC_CONTRACT_ADDRESS --body $env:OPENWASH_CONTRACT
gh workflow run pages.yml --ref main
```

Verify zero pledge, claim and challenge counts and a 10-minute deployment floor. The variable and workflow update the P1 website to use the real contract. Wait for a successful Pages build.

## Read-only preparation

```powershell
$publisher = '0xf5Fe96d62733d40f25822b20C5E46A0E17483dFF'
$challenger = '0x74115084812fc662AaAE47B5Fd4Ef60cd5E7BC56'
$a = 'meta-llama/Llama-3.1-8B'
$b = 'allenai/OLMo-2-1124-7B'
$c = 'mistralai/Mistral-7B-v0.1'
$pinA = (ow hf-inspect $a | ConvertFrom-Json).sha
$pinB = (ow hf-inspect $b | ConvertFrom-Json).sha
$pinC = (ow hf-inspect $c | ConvertFrom-Json).sha
$base = 'https://mcurly17.github.io/openwash/demo/claims'
$urlA = 'https://ai.meta.com/blog/meta-llama-3-1/'
$urlB = "$base/olmo-2-claim.html"
$urlC = "$base/mistral-7b-claim.html"
$qA = 'docs/demo/claims/llama-3.1.txt'
$qB = 'docs/demo/claims/olmo-2.txt'
$qC = 'docs/demo/claims/mistral-7b.txt'
try { ow quote-check $urlA $qA } catch {
    $urlA = "$base/llama-3.1-claim.html"
    ow quote-check $urlA $qA
}
ow quote-check $urlB $qB
ow quote-check $urlC $qC
$stats = ow stats | ConvertFrom-Json
if (($stats.pledges -ne 0) -or ($stats.claims -ne 0) -or ($stats.challenges -ne 0)) { throw 'Use IDs from actual receipts on a populated contract.' }
```

The inspection command discovers the current SHA, re-reads that exact revision and reports HTTP statuses, SHA-256, license, gate and listed weights. Keep the three SHAs and the actual inspection results. Check that each quote matches. A uses the official announcement first. If the registration preview later rejects A’s source **before signing**, select `$urlA = "$base/llama-3.1-claim.html"`, run `ow quote-check $urlA $qA`, and use that URL for step 2. Record the source actually used. B and C are explicit demo-publisher declarations. Their wording belongs to the demo publisher.

## P3 · One call at a time

### 1 · Create the pledge

```powershell
ow pledge OpenWashDemo '0.1' 7 --value '0.2'
```

Expect pledge 0, a 0.2 GEN available bond, 0.1 GEN payout, seven days of coverage and a minimum stake of 0.01 GEN.

### 2–4 · Register A, then B, then C

```powershell
ow register 0 $a $pinA $urlA --quote-file $qA --challenge-minutes 15
ow register 0 $b $pinB $urlB --quote-file $qB --challenge-minutes 10
ow register 0 $c $pinC $urlC --quote-file $qC --challenge-minutes 10
```

Expect claim IDs 0, 1 and 2. A receives a 15-minute window. B and C receive ten minutes each. Check the UTC deadlines, the quote hash and the pinned revisions in `ow claim 0`, `ow claim 1` and `ow claim 2`. Both ordinary challenges must be filed before their respective deadlines. Do not pause for the end of any window yet.

### 5 · Record the early close refusal

```powershell
ow close 0 --expect-refusal
```

The preview must report `[EXPECTED] a claim challenge period is open until …Z`. The CLI sends zero value, waits for agreement and checks the receipt’s exact message. The pledge stays active.

### 6–7 · Challenge and resolve A

```powershell
npx genlayer account use timbre-b
npx genlayer account unlock --account timbre-b
ow challenge 0 --value '0.01'
ow resolve 0
ow claim 0
```

Check the displayed challenger address is 0x74115084812fc662AaAE47B5Fd4Ef60cd5E7BC56. Expect challenge 0, then UPHELD and RESTRICTED if the observed gate and license terms hold. Record the outcome actually returned.

### 8–9 · Challenge and resolve C

```powershell
ow challenge 2 --value '0.01'
ow resolve 1
ow claim 2
```

Expect challenge 1, then UPHELD and OPEN_WEIGHTS_ONLY if the four criteria match the fixture scenario. At this point two upheld payouts consume the full bond.

### 10 · Optionally grade B

```powershell
ow grade 1
ow claim 1
```

Run this optional read-and-grade transaction during B’s window if time permits. It moves no funds and leaves challenge state unchanged. Keep the actual grade. OPEN is a candidate result. If the window has already elapsed, skip the optional step and record that fact.

### 11 · Record the late challenge refusal

```powershell
$windowB = ow window 1 | ConvertFrom-Json
Wait-WindowEnd $windowB.challenge_until
ow challenge 1 --expect-refusal
ow window 1
```

Expect `[EXPECTED] challenge period ended (…Z)` with zero value attached. The B window reports CLOSED. If the preview node still reports a live window, the CLI stops before signing. Wait for the node’s clock to reach the deadline.

### 12 · Close and withdraw funded credit

```powershell
$pledge = ow pledge-info 0 | ConvertFrom-Json
Wait-WindowEnd $pledge.locked_until
npx genlayer account use timbre-a
ow close 0
ow credit $publisher
ow credit $challenger
npx genlayer account use timbre-b
ow withdraw
ow credit $challenger
npx genlayer account lock --account timbre-b
npx genlayer account lock --account timbre-a
```

In the expected two-UPHELD scenario, closing returns zero to timbre-a. Its credit view shows zero. The two 0.1 GEN payouts plus the two returned 0.01 GEN stakes credit timbre-b with 0.22 GEN. Its withdrawal returns that credit to zero. For a different outcome, inspect both credit views first and withdraw only positive credits using their respective accounts. Lock both accounts afterwards, also if the session is interrupted.

## Evidence

Complete `docs/evidence.md` with actual addresses, receipts, refusal messages, revisions, hashes, grades and balances. Record any different outcome as observed. Only after filling the ledger, commit it locally:

```powershell
git add -- docs/evidence.md
git commit -m 'Record the Studionet demo'
```

The release tag stays on the original local release commit. Portal submission and any subsequent push require a separate operator action.
