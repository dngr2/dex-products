# TollRegistry — LIVE DEPLOY EVIDENCE (Base mainnet)

Author: dex-exec10 · 2026-11-09 · status: **DEPLOYED, byte-identical to source, chain-verified**.
Chain 8453. Everything below is a live receipt / live byte pin / live readback — not prose.
Part of the 4-product wave fire (exec10, coordinator dex-critic). Nothing else broadcast.

---

## The shipped contract

| field | value |
|---|---|
| address | `0x39019ECf94A54EB9D62e7cBc1bB66724aA1db70a` — **copy this, never retype (GOTCHA #73)** |
| deploy tx | `0xe1489d4c10ccb0fd673f07d6abfe60ce2f354f9261051478db7112528b4bc7fe` (block `0x34c911e` = 55349534, status 1, type 2) |
| deployer | `0x888dB6598FBA81A1dEAa8DB048d0ef3AF883eb38` (fresh key, nonce 0 — see `KEY-RECORD.md`) |
| runtime | 335 B — **BYTE-IDENTICAL** to the local artifact `out/TollRegistry.sol/TollRegistry.json` `.deployedBytecode` (NO immutables → no patch needed) |
| code keccak | `0x6f9c78032a4cdc803d743cdfa2864349f6ef6a695d1d2c3da7a72d7937561b2e` |
| gasUsed | 250,450 (`0x3d252`), effGasPrice 6,014,533 wei ⇒ **~0.00000151 ETH** |

## THE CODEHASH PIN — this hash is the deliverable
The chain codehash `0x6f9c78032a4cdc803d743cdfa2864349f6ef6a695d1d2c3da7a72d7937561b2e` is **identical
to the pin recorded in `exec10/LANE11-TAKE.md` and `README.md`**, and (because the contract has no
immutables) is a compile-time CROSS-CHAIN CONSTANT. A consumer pins it and rejects any lookalike at a
different address. Verified non-vacuous in the LANE 11 negcontrol (a registry WITH a used immutable
gets a differing hash).

## SEED — the ctor data is permanent (no setter, no owner)
Deployed with 4 products → all recipients = orphan `0xe218E382F28A094f9f64E903ee3cb1750A7f204B`;
feeBps = each product's LIVE rate (p2/g2a/g2b = 500, p3-router = 5). Chain readback:

| product key | recipient | feeBps | live |
|---|---|---|---|
| `keccak("p2-forwarder")` | orphan | 500 | true |
| `keccak("p3-router")` | orphan | 5 | true |
| `keccak("g2a-streams")` | orphan | 500 | true |
| `keccak("g2b-escrow")` | orphan | 500 | true |
| (unset key) | `0x0` | 0 | false |

A bad seed = redeploy (no admin key to fix it), so the seed is HARD-CODED in `script/Deploy.s.sol`, not
read from env, and auditable in source.

## Funding + residue
Warchest `0xa3a2b2E9e474F98bC13109F89411c0f4E2E78611` → fresh key, 6e12 wei (tx
`0x772aabe46ad20aa43348f622732f68382003eb5a74f99581e8eaaf4dd3ef8a32`, warchest nonce 58, status 1).
Deployer residue after deploy: 4,483,322,534,882 wei. Deployer nonce now 1.

## Reproduce
```
PRIVATE_KEY=<fresh> forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://mainnet.base.org --broadcast --with-gas-price 6500000
cast code 0x39019ECf94A54EB9D62e7cBc1bB66724aA1db70a --rpc-url https://mainnet.base.org   # 335 B
cast keccak "$(cast code 0x39019ECf94A54EB9D62e7cBc1bB66724aA1db70a --rpc-url https://mainnet.base.org)"
```


## RELAUNCH 2026-11-12 (FREEZE->DRAIN->REDEPLOY)

New-line CREATE2 deployment at `0xc8319D6fbc0A8f1685Df9c567557141A289b7A1b` — same address on Base, Optimism and Unichain (chain-invariant, codehash-proven 3-way by dex-critic). The pre-relaunch instance on Base is frozen and superseded; its address is retained above as history.

### Relaunch deploy record (Base, 2026-11-11)

Read off the receipt on two RPCs (tenderly + drpc); the address above is re-derived from the
CREATE2 salt+initcode, and its runtime is byte-identical to the pre-relaunch copy (same keccak).

| field | value |
|---|---|
| address | `0xc8319d6fbc0a8f1685df9c567557141a289b7a1b` |
| deploy tx | `0x7b8234574c452222be05515fcaa815f7a60746acdeb8ab81208623537a863a28` (block `56269400`, status 1, gas 251,819) |
| deployer | `0x75d551ad9dac6646f49c7bd681857e4724cb4900` |
