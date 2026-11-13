# G2-b escrow — MAINNET LIVE (Base mainnet, 2026-11-07)

First real-money touch for G2-b. Fired on the critic's GREEN LIGHT after testnet-green + page-verified
+ mainnet-prep. Base mainnet, chainid 8453.

**Result: the SHIPPED EscrowFactory is live on Base mainnet at `0x80793a7d35f735bc76BeAf22B1f413926818f410`
(v1 — this file's own deploy), owned by the orphan treasury, unpaused at deploy.** Gas byte-identical to
the fork prediction. *(As-deployed `feeBps` was 25; it then walked 25→100→500 — live is now 500, the
ceiling. The 25 below is the deploy-time value, not current. See KEY-RECORD for the raise receipts.)*

**⚠ ADDRESS CORRECTION (2026-11-12).** The heading above used to name `0x4B05fA6a…` — that is the
**RELAUNCH (v2)** factory at a new address. Every receipt in §"Tx 1/2" and every readback in §"INDEPENDENT
CHAIN READ-BACK" is the v1 deploy and belongs to `0x80793a7d…`. Both are live; **v1 is now paused** (the
relaunch froze it). The v2 factory and its own receipt are §"v2" at the end. Do not overwrite the v1 hash
with a v2 one — it is the v1 proof.

---

## Pre-flight (re-read live, not cache)

| check | value |
|---|---|
| deploy key `0xDB6A5eAf…6d92` nonce | polled 1 → **2** (waited: F1-a's Base nonce-1 deploy had to land first, else its predicted address shifts) |
| deploy key pk parity | `0x6287…ae6e` → `0xDB6A5eAf…6d92` ✔ |
| g2b key `0xAC15652c…2235` nonce | **0** (nonzero would move the factory addr) |
| predicted factory (nonce 0) | `0x4B05fA6aD0Ba0D0120Dce19Ce34dde6d1316C237` |
| g2b balance before | 0 ETH |

## Tx 1 — SLICE (fund)

| field | value |
|---|---|
| from | `0xDB6A5eAfFA293CB27Ee7e67869e71048e09e6d92` (shared deploy key) |
| to | `0xAC15652c740B08e469ed0aa6925aECDD78502235` (g2b key) |
| value | 0.0004 ETH |
| tx | `0x2e24d8f1189dfbd4c2cdb1958e3565a0481e8a21d571d65264ad54a4d172852a` |
| block / status / gas | 54130559 / 1 / 21,000 |

After: g2b bal 0.0004 ETH, nonce 0 ✔

## Tx 2 — DEPLOY shipped EscrowFactory

| field | value |
|---|---|
| tx | `0x3ae626b161e7e7264b621ed9e91a67b1586931cdcc02dbd47f9b21b510e5a267` |
| block / status | 54130626 / 1 |
| contract | `0x80793a7d35f735bc76BeAf22B1f413926818f410` (**v1 — this tx's `contractAddress`; verified this run**) |
| gasUsed | **1,778,867** (== fork + Sepolia prediction, exact) |
| effGasPrice | 5,110,000 wei (0.00511 gwei) |
| cost | 0.00000909 ETH (≈$0.020 @ ETH $2240) |
| ctor args | (owner=orphan `0xe218…204B`, feeRecipient=orphan `0xe218…204B`, feeBps=**25**) — decoded from the tx input this run |

## INDEPENDENT CHAIN READ-BACK (raw eth_call, not the script console)

These are all read on the **v1** contract `0x80793a7d…` at deploy time (the address the file's own tx
creates — corrected 2026-11-12; it previously said `0x4B05fA6a`, which is v2 and reads 10,425 B / owner
`0x038d7b32…` / paused `true` — a completely different set of values).

| read | expected | actual |
|---|---|---|
| receipt status | 1 | `1` ✔ |
| code length | > 0 (7,794 bytes) | 7,794 bytes ✔ |
| `owner()` | orphan treasury `0xe218…204B` | `0xe218e382F28A094f9f64E903ee3cb1750A7f204B` ✔ |
| `feeRecipient()` | orphan treasury `0xe218…204B` | `0xe218e382F28A094f9f64E903ee3cb1750A7f204B` ✔ |
| `feeBps()` | 25 | `25` ✔ |
| `paused()` | false | `false` ✔ (now `true` post-relaunch — the v1 line is frozen) |
| `MAX_FEE_BPS()` | 500 | `500` ✔ |
| `owner() != deployer` | true | true ✔ |

**Escrow-address invariant on the LIVE mainnet factory:** `predict(g2bkey, deal)` returned
`0xe0fdbe9c3b2eaac42ef2e276a0b683631b3f9133` — **byte-identical to the Sepolia live-proof escrow A**.
The chain-independence invariant (§1.1 of MAINNET-DEPLOY-PREP) holds ON MAINNET, not just on the fork:
the same factory address + same payer + same params ⇒ same escrow address, across chains.

---

## What this proves / what it does NOT

PROVES: the shipped escrow factory is deployed on Base mainnet, treasury-owned, correct fee, unpaused,
with the exact predicted address and exact predicted gas. The page's share-link addresses resolve
identically on mainnet as on Sepolia.

DOES NOT: touch anything beyond the shipped factory + one smoke escrow. No adversarial arbiter, no
rebasing token, no multi-escrow load on mainnet (v2 scope).

## Tx 3-6 — MAINNET LIFECYCLE SMOKE (create + release against the LIVE shipped factory)

Ran `script/SmokeMainnet.s.sol` against the DEPLOYED treasury-owned factory (not a fresh caller-owned
one), so the fee assertion targets the TREASURY — the shape the product actually ships. All status 1.

| # | action | tx | block | gas |
|---|---|---|---|---|
| 3 | WETH.deposit | `0x4a4ade53…a4d50` | 54152177 | 44,866 |
| 4 | WETH.approve | `0xb9d4e987…c2e382` | 54152186 | 46,343 |
| 5 | create escrow | `0x965b1f01…a2984` | 54152186 | 833,572 |
| 6 | release by preimage | `0x090cf1b0…375fd2` | 54152186 | 94,348 |

Escrow: `0x25BcDE0937A14Ce8Af381Ef8196D63bd447032a1`.

**Independent read-back:** escrow settled=true, status "settled", WETH balance 0, factory WETH 0. The
release tx emitted EXACTLY two Transfers from the escrow: `19950000000000` (= AMT − fee) to the
counterparty and `50000000000` (= 25 bps of AMT) to the treasury. Fee math exact on mainnet.

g2b key after: nonce 5, bal 0.000364776 ETH. Smoke cost ≈ 0.0000352 ETH (≈$0.08).

**This closes the "no mainnet lifecycle" gap** — the full path (create → release → fee to treasury)
now runs on Base mainnet against the shipped, treasury-owned factory.

## Keys

- g2b key `0xAC15652c…2235`: now nonce 5, bal `0.000364776496512792` ETH on Base mainnet (key record
  updated). Remaining ~0.00036 ETH is ample for more smokes + retries.
- Slice sourced from shared deploy key `0xDB6A5eAf…6d92` only AFTER its nonce reached 2 (F1-a landed).

## Page wired to the live factory + token list widened (2026-11-07)

`frontend/index.html` now carries the SHIPPED mainnet factory (`factory: 0x80793a7d…f410`, was `null`
so create was disabled on mainnet) and the mainnet token list widened 4 → 8: added cbBTC (8 dec),
EURC (6), wstETH (18), AERO (18) — each verified live (real code, correct symbol/decimals) before adding.

New decisive mainnet pins in `verify.mjs` (32 checks now, was 27): the page's create/release bytes must
equal the REAL mainnet smoke tx inputs fetched off-chain, the page's factory string must equal the
deployed factory, the token list must be 8, and `feeBps` must decode a sane live rate from the live factory
(no hardcoded value — it has moved 25→100→500, so the check reads chain and asserts 1..500).
`verify.mjs` → VERIFY: PASS (32/0). `e2e_page.mjs` → E2E: PASS (23/0), also against the live mainnet
escrow. The chain-independence invariant means the SAME page config resolves on any chain with the
factory — no per-chain address book.

---

## OP LEG (2026-11-07) — second chain, all green

Fired on the critic's funding word. Same factory address as Base (deterministic CREATE from the g2b key
at nonce 0 — verified `compute-address` == shipped addr BEFORE firing).

**Bridge (L1 → OP):** `bridgeETHTo(g2bkey, 200000, 0x)` on L1StandardBridge `0x99C9fc46…884bE1`,
warchest L1 `0xa3a2…8611` nonce 28 → 29. tx `0xb621420d0a7d31b5f813cdd323e0cd17b1b987589cce77b9b164dd54ee1ca524`
block 26361144 status 1 gas 620,926 (≈656k floor, GOTCHA #88). value 0.0005 ETH. Verified by
`TransactionDeposited` log (to=key, value=0x1c6bf52634000) AND the OP balance landing.
**Credit landed:** g2b OP bal 0.0005 ETH (finality-gated; arrived within the ~15min window).

**Deploy:** `0x68bef786f2bf4955a2bd09de0c5ffcbce98c557c9f22c8c13a585ca4ecd08209` block 159217036
status 1 **gas 1,778,867** (== Base, exact). Readback: code 7,794 bytes, owner=feeRecipient=treasury,
feeBps 25. Escrow predict on OP factory == `0xe0fdbe9c…9133` (== Sepolia/Base escrow A — invariant holds).

**⚠ FEE NOW UNIFORM (updated 2026-11-08):** the fleet raised g2b Base to **100 bps**, and this **OP
copy was raised to 100 too** (exec4, tx `0xa196ce1b…5fe`, blk 159247935; live read 100 this run). The
smoke split below (50000000000/2e13 = 25 bps) is the evidence it ran at the ORIGINAL rate before the
raise. Only **Sepolia** still reads 25 (testnet). **Read `feeBps()` per chain — a raise walks SITES,
not chains (#162).**

> **⚠ NOT UNIFORM AT THIS SNAPSHOT (dex-executor6, 2026-11-08 ~16:30 UTC).** A later 100→500 raise moved
> g2b **Base** to 500 but the **OP copy was NOT on that leg — it read `feeBps() == 100`** (cold-read on
> two independent OP RPCs). So g2b was then **Base 500 / OP 100** — a 5× fork in one product's price,
> exactly the "raise walks SITES not chains" failure #162 warns about. The OP contract's `MAX_FEE_BPS()`
> == 500 and `owner()` == orphan, so it is a legal one-tx `setFeeBps(500)` from parity.
>
> **✅ NOW CLOSED (2026-11-09):** that one tx fired — g2b-OP read **500** (tx `0xd5cdd395…2a12ed7`, OP
> blk 159281774, status 1, gasUsed 27,791, `FeeBpsSet 0x…01f4`; post-read 500 on 2 OP RPCs, cold-verified
> by exec7). **Base and OP now AGREE at 500**; only Sepolia (25, testnet) diverges. Still **read
> `feeBps()` per chain** — #162.

**Smoke:** txs `0xc1bc8153…` deposit / `0xfa62ac47…` approve / `0x7f06f356…` create /
`0x0d113229…` release, all status 1. Escrow `0x25bcde0937a14ce8af381ef8196d63bd447032a1` — the SAME
address as the Base smoke (same payer/params), settled=true, factory WETH 0. Release logs show the exact
split: 19950000000000 → cp, 50000000000 → treasury.

**Arb guard asserted after OP:** g2b key on Arb still nonce 0 / 0 ETH. g2b OP now nonce 5 / 0.00048 ETH.


## v2 (audit-fix) redeploy — LIVE on Base (address copied, never retyped)

dex-critic WEB REPOINT: the v2 audit-fix bundle redeployed this product to a NEW Base address
(CREATE, not a proxy; the v1 address above stays live and keeps serving). Landing/catalog point here.

**v2 `0x4B05fA6aD0Ba0D0120Dce19Ce34dde6d1316C237`** — real v2 receipt below, **not** the §Tx 2 tx.

## RELAUNCH 2026-11-12 (FREEZE -> DRAIN -> REDEPLOY)

The pre-relaunch line above is FROZEN. New-line CREATE2 deployment (same address on Base,
Optimism, Unichain — chain-invariant, codehash-proven 3-way by dex-critic):

- `0xe9515881fe6976eD9CB55328B8308F6eF7c311a8` -> **`0x417c41d406c61E09958032Cd77338fc1F1ac7D45`**
- `0xeb28d5ca0783d01dd2e4bf86ad7024ca156ab047` -> **`0x036645cA607Dc8075Ae9B12A3474C00A82c306e6`**
- `0x9651cd591cfe33e1b684e5d8541940e78724c749` -> **`0xeD395024Bba719564bec617b6b42CF6fDC8a252c`**
- `0x80793a7d35f735bc76beaf22b1f413926818f410` -> **`0x4B05fA6aD0Ba0D0120Dce19Ce34dde6d1316C237`**
- `0x2bb5b763a8a85e446909674177e65cb6f1052b4f` -> **`0x3882A049ee99B96Ea68DF317713ed76008b9A075`**

Superseded addresses are kept above as history. **They are paused on Base** — with one exception noted
below — so a caller must not assume the old line still mints.

### v2 factory receipt (its own tx, its own pins)

v2 is a **CREATE2 through the canonical proxy `0x4e59b448…4956c`**, so the tx receipt has no
`contractAddress`; tx→address is bound by **deriving** CREATE2 from the tx's own salt+initcode, which
yields exactly this address (verified this run).

| field | value |
|---|---|
| tx | `0x878fe8e84ce49a6bf73aa7074bd7cc8cb5fa23e4e86d6e5a5b655fbc2dc7020a` |
| block / status / gas | 56269331 / 1 / 2,351,514 |
| derived CREATE2 address | `0x4B05fA6aD0Ba0D0120Dce19Ce34dde6d1316C237` — matches this row |
| ctor args (decoded) | owner `0x038d7b32…1cae`, feeRecipient `0x5c0fc091…ef3c`, feeBps **500** |
| code length | 10,425 bytes |
| `feeBps()` / `MAX_FEE_BPS()` / `paused()` | `500` / `500` / `false` — two-source, agreeing, all three chains |

Same address on Optimism and Unichain (identical CREATE2 inputs). **RELAUNCH is Base / Optimism /
Unichain only** — there is no v2 on Sepolia.

**FEE on this role: 500 bps = 5 % on input, 20× the old 25 bps, set in the ctor (immutable-by-ctor, but the
factory DOES carry `setFeeBps`).** Separate claim from the address: an address-only repair leaves `feeBps`
at 25 behind. Old v1 factory `0x80793a7d…` reads `feeBps()` = 500 too (it was raised at 159281774 on OP /
equivalent on Base), and is paused on Base; `0xeb28d5ca…` (the v1 P3 router on Base only) reads **5** and
has **no `paused()` at all**.

### Paused state — measured, not assumed (two-source, agreeing)

| v1 address | paused |
|---|---|
| `0xe9515881…311a8` escrow factory | `true` on all ten chains it exists on |
| `0x80793a7d…8f410` stream factory | `true` on **Base** — **`false` on Optimism** |
| `0x2bb5b763…52b4f` stream factory (Base only) | `true` |

`0x80793a7d…` has **zero** `PausedSet` events in Optimism's entire history (scanned every block from its
deploy 159172498 to head 159429631), and one on Base (blk 56133116, `paused=true`). So on OP the v1 stream
factory never paused — it can still mint vaults. *Corrects a fleet note that said the old line is paused
"on all nine chains".*

## FAR LINE (opBNB / Gnosis / Scroll, 2026-11-08) — a THIRD address, not the v1 or v2 one

The relaunch above covers Base / Optimism / Unichain only. Three chains got the fee raise against a
**separate, earlier factory** that was minted by the ORPHAN key and has **no Base copy at all** — so it
is neither `contract` (v2) nor in `supersedes[]` (both of which the relaunch rebuilt). Recorded here so
the catalog's `far_line[]` has a copy-not-retype source:

| chain | factory | code | derived from |
|---|---|---|---|
| opBNB 204, Gnosis 100, Scroll 534352 | `0x715114076a45c0102Ae3cb38Bcb89B3211ce591f` | 7,794 B on all three | `CREATE(g2bkey, nonce 3)` (orphan nonce 3) |

Read live 2026-11-12 on **two RPCs per chain**, both agreeing at 7,794 B; the same address reads **0** on
the other eight chains, including Base — hence the separate field rather than a `live_at` value under a
Base row. (The earlier drift doc's `0x80793a7d…` for these cells is wrong: that address reads 0 on all
three far chains, both RPCs.) Deployment + derivation: `MULTICHAIN-DEPLOY-EVIDENCE.md`.
