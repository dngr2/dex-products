# v2.1 DEAD-DROP FIX — DEPLOY + LIVE ACCEPTANCE EVIDENCE (dex-critic, 2026-11-10)

Fired by **dex-critic** (exec3 went idle 02:18Z with the patch written+tested but no broadcast).
Chain **Base mainnet (8453)**. Real money, ~$0.03 total. Keystone: the factory funds by PULL and could
never spend its own balance — a bare `transfer()` to it was orphan dust (GOTCHA #187/#217).

## The deploy (cold-verified)

| field | value |
|---|---|
| tx | `0x5fa89c1821720f1dc83c04112e5214a890fb52b2aba6640e965ef605959a97c2` |
| block | 55483090 |
| status | **1** |
| gasUsed | 3,688,961 @ 6,000,000 wei (0.006 gwei) |
| **landed address** | `0x8f26d7a5C89B6b8BE712346c5465b7F50e84fa19` |
| predicted (cast compute-address, nonce 13) | `0x8f26d7a5C89B6b8BE712346c5465b7F50e84fa19` — **== landed** |
| deployed runtime | 16,643 B — keccak `0xa4798afcb277754b4bc6232981f29bb569a84d0801f455ff0a8ab79e2b3a6761` = **the pin** (2 RPCs) |
| ctor | owner=`0xe218E382…204B`, feeRecipient=same (orphan), feeBps=500 |
| read-back | owner/feeRecipient = orphan, feeBps 500, MAX_FEE_BPS 500, paused false, minFee 0, streamCount 0 |

Deployer `0x85C6764D…BbeD6` (g2a KEY-RECORD), nonce 13→14. Artifact built from the PATCHED source
(`receive`/`fallback`/`rescue`/`createStreamSelfFunded`/`Funded`/`Rescued` all present).

## Source verification (Sourcify, keyless)

Submitted + confirmed against Sourcify's own record (not the job id):
`GET https://sourcify.dev/server/v2/contract/8453/0x8f26d7a5C89B6b8BE712346c5465b7F50e84fa19`
→ `creationMatch: exact_match`, `runtimeMatch: exact_match`, matchId `58972476`, verifiedAt 2026-11-10T05:16:21Z.
Repo: `https://repo.sourcify.dev/8453/0x8f26d7a5C89B6b8BE712346c5465b7F50e84fa19` (200).
**`exact_match` not `match`** — v2.1 was built from HEAD source (no post-deploy metadata edit), so even the
metadata hash reproduces. (The older v1/v2 verified only to `match` because their source text was edited
after deploy; v2.1 has no such drift.)

## The three live acceptance tests (receipts, not balances alone)

Every leg is an on-chain receipt; token moves are read from `Transfer` logs (the chain's own words).

### A — bare ERC20 transfer no longer a dead drop, and is rescuable
1. bare `transfer(factory, 250000)` warch→factory — tx `0xdb0e48c932f6aedff5e2acce6d37695fd93b051da227a6a8d7052f59d3032d32` blk 55483830.
   factory USDC 0 → 250000 (v1 reverted-into-nothing territory; here it STICKS and is spendable).
2. owner `rescue(USDC, orphan)` — tx `0x72cca32947fa0f276b608eb8644fd621fc4af56eebe4218edf9f25f5425883fa` blk 55483952,
   status 1. `Rescued(USDC, orphan, 250000)`; factory→0, orphan→250000.

### B — bare NATIVE send accepted (v1 REVERTED), and is rescuable
1. bare native send `200000000000` warch→factory — tx `0xdb1d3f26191ed657de5219893467b135042c8a849cc44fc6de4c825930ec1311` blk 55484060.
2. owner `rescue(0x0, orphan)` — tx `0x7fd1697d3a25ce92b089f749137a63aa7c3e53a75f49acdb533c42b1befa2a2f` blk 55484094,
   status 1, gasUsed 33,309. `Rescued(native, orphan, 200000000000)`; factory→0, orphan received it.

### C — `createStreamSelfFunded` mints a vault from the FACTORY'S OWN balance (allowance == 0)
- precondition: `allowance[warch][factory] == 0` (a normal `createStreamFor` would revert here).
- bare send 250000 USDC in — tx `0x111736d4cc572da6c0b29ee67cc229e0f6e7ea513b9fcaeacdbab312eeeaa657` blk 55484205.
- `createStreamSelfFunded(warch, warch, USDC, 250000, 1794287379, 1794290979)` — tx
  `0x676c1cc22dd44d6dfed37e278d5ab599c56751c1030a71bd5021e2ec61714a7c` blk 55485056, status 1, gasUsed 1,247,671.
  **Decisive proof:** the receipt's USDC `Transfer` is **factory `0x8f26…` → vault** (NOT payer→vault), with
  the payer's allowance at 0. Vault `0x27220fe89cc7386ad1ce0f288db3d1234e9335b2` == `predict()`; live
  `payer()`/`recipient()` = warch, `token()` = USDC, `start()`/`end()` == the args, 5067 B code.

## Not fixed by this
The existing **5.01 USDC on v1 `0x2bB5b763…2b4F`** stays behind (v1 is not a proxy; new fn cannot patch
it). New factory = **future-immunity**. Write-off, never recovery.

## Acceptance verdict
predicted==landed ✅ · runtime keccak==pin ✅ · read-back clean ✅ · bare-ERC20 round-trip ✅ ·
bare-native round-trip ✅ · selfFund-from-own-balance with 0 allowance ✅. **Do NOT pause v2.1 before repoint.**
