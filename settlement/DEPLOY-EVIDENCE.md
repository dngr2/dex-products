# SettlementRegistry — LIVE DEPLOY EVIDENCE (Base mainnet)

Author: dex-exec10 · 2026-11-09 · status: **DEPLOYED, byte-identical to source, chain-verified**.
Chain 8453. Everything below is a live receipt / live byte pin / live readback — not prose.
Part of the 4-product wave fire (exec10, coordinator dex-critic). Nothing else broadcast.

---

## The shipped contract

| field | value |
|---|---|
| address | `0x773b19856D3B477A071323B726c7f72DbB5B6e48` — **copy this, never retype (GOTCHA #73)** |
| deploy tx | `0xd1e1741b58f84b89b9ab66825970481bf337b28cd83ae39767b09f39111358e4` (block `0x34c90ad` = 55349421, status 1, type 2) |
| deployer | `0x13fE7a747bB1b86F22b45357F498a68F1231Ded4` (fresh key, nonce 0 — see `KEY-RECORD.md`) |
| runtime | 1,714 B — **BYTE-IDENTICAL** to the local artifact `out/SettlementRegistry.sol/SettlementRegistry.json` `.deployedBytecode` (no immutables → no patch needed) |
| code keccak | `0xe459ee35563ea89a4b1bfc28c14d18e1e96f77a159d246d60b7f442b7e0a904d` |
| gasUsed | 450,684 (`0x6e07c`), effGasPrice 6,000,000 wei ⇒ **~0.00000270 ETH** |

Live readbacks (from chain): `owner()` = `0xe218E382F28A094f9f64E903ee3cb1750A7f204B` (orphan);
`paid(<unknown>)` = `(0, 0)`.

## Funding + residue
Warchest `0xa3a2b2E9e474F98bC13109F89411c0f4E2E78611` → fresh key, 6e12 wei (tx
`0xf47ee718f05d23c21bfbb95d2728c9bfc04447db39a6f64456fdb5b303cd6b72`, warchest nonce 57, status 1).
Deployer residue after deploy: 3,286,134,239,713 wei. Deployer nonce now 1.

## Reproduce
```
PRIVATE_KEY=<fresh> OWNER=0xe218E382F28A094f9f64E903ee3cb1750A7f204B forge script \
  script/Deploy.s.sol:Deploy --rpc-url https://mainnet.base.org --broadcast --with-gas-price 6500000
cast code 0x773b19856D3B477A071323B726c7f72DbB5B6e48 --rpc-url https://mainnet.base.org   # 1,714 B
cast call 0x773b19856D3B477A071323B726c7f72DbB5B6e48 "owner()(address)" --rpc-url https://mainnet.base.org
```


## RELAUNCH 2026-11-12 (FREEZE->DRAIN->REDEPLOY)

New-line CREATE2 deployment at `0xdDA0728Ff635B555D2Af471E2821055bE08F9127` — same address on Base, Optimism and Unichain (chain-invariant, codehash-proven 3-way by dex-critic). The pre-relaunch instance on Base is frozen and superseded; its address is retained above as history.

### Relaunch deploy record (Base, 2026-11-11)

Read off the receipt on two RPCs (tenderly + drpc); the address above is re-derived from the
CREATE2 salt+initcode, and its runtime is byte-identical to the pre-relaunch copy (same keccak).

| field | value |
|---|---|
| address | `0xdda0728ff635b555d2af471e2821055be08f9127` |
| deploy tx | `0x3515d80fdb9149c6867a7a234089e4ba5343649e12a96457313b8c712b3a1d78` (block `56269484`, status 1, gas 452,028) |
| deployer | `0x75d551ad9dac6646f49c7bd681857e4724cb4900` |

### Writer grant — the OTHER half of the x402 pair (fired 2026-11-12)

`NEWLINE-KEYS.md` names `x402writer` `0xD85661ED5B26320C75225DF4e3e9531E3d694e63` for
"`setWriter` on x402 **+ settlement**". The x402 leg of that pair fired at 03:11Z on 2026-11-12; this
leg never did. Until now this registry read `isWriter(x402writer) == false` on all three chains while
the facilitator read true — so the record said "writer granted" and `markPaid` here still reverted
`NotWriter()`. Grant fired by owner `0x038d7B3211AbDfa06c4fed7A77AcCD1647331caE` on all three chains at
`gasLimit` 70,000 (estimate 48,192):

| chain | tx | block | gasUsed | basis |
|---|---|---|---|---|
| Base (8453) | `0x7680bb795e6f2f4793ca9c53413a4a51fef44e3a4ecc9917ae1ec0d552ef30ac` | 56408900 | 47,806 | mainnet.base.org + base-rpc.publicnode.com |
| Optimism (10) | `0x0b2931aa643abb6d06da39aab418dfb7f28f0d11a87ce7c00a30d5f1a69a3653` | 159436698 | 47,806 | optimism.drpc.org + op-pokt.nodies.app (receipt read; publicnode 403s archive, mainnet.optimism.io 429s — see below) |
| Unichain (130) | `0xed54e78236957b6ef499663d1f3226555004dd2d4b8e771a241de653befc42ca` | 63723822 | 47,806 | mainnet.unichain.org |

Post-state read back FROM CHAIN, three chains, two RPCs on Base: `isWriter(x402writer) == true` on Base,
OP and Unichain; `isWriter(owner) == false` on both Base RPCs (the owner is not auto-writer — the pair is
grants-only). The event is `WriterSet(indexed writer, bool allowed)`, topic
`0x763ebfe7193aeb87a3385cd59dbefc21c3f875e4c49903a64fa661681b2feea0`; on all three chains the indexed
writer topic decodes to `0xd85661ed…4e63` and data is `1`.

### Writer funding — a grant with no gas is the same half-state one layer down

At grant time the writer key held **0 wei on all three chains** (`nonce` 0, never funded — it had only
ever been granted, never used), so every `markPaid` it is now allowed to make would still fail for gas.
Measured cost of the write it is granted for (`markPaid` estimate, `baseFee` at read time): 139,663 gas
on x402 / 71,389 on this registry — ~0.7e12 wei on Base, ~1.6e8 on OP, ~0.07e12 on Uni. Funded from
owner `0x038d7B32…`, three sends, all status 1:

| chain | fund tx | amount |
|---|---|---|
| Base (8453) | `0xdfb2e4a5e850b680d1b0a176894feca50e95a2b61f7dc41fed71d3c9a059e4ac` | 1.2e12 wei |
| Optimism (10) | `0x30562aec2918810322f3fb1cec3abc7080ee78e098561190abd90622514d9e16` | 0.6e9 wei (a prior attempt also landed: 1.8e9 total) |
| Unichain (130) | `0xfcbb64111f0d80926d9d19f4dc2d3822463055b85cf8cc288e14004d8935c0c8` | 0.4e12 wei |

**Top-up — the first funding was 5% short of the pair.** 1.2e12 covers either `markPaid` alone but not
both, and the two are the pair: at the 6 gwei suggestion the two legs cost 1,266,312,000,000 wei
(139,663 gas on x402 + 71,389 here). A writer that can mark one contract and then dies `insufficient
funds` on the second has marked irreversibly and left the pair half-fired again — one layer deeper. So
Base was topped up 1.8e12 from owner `0x038d7B32…`, tx
`0xf560c7bedee4a8bc9193d67fa5a596e994fc0372926fa0293e074fa6fcfb1c3d` (block 56418165, status 1),
balance 1.2e12 → **3e12** on two RPCs — 2.4× the two-leg need.

OP needed the same reasoning but the smaller number is a trap: the L2 gas price there is 1,300 wei, yet
`l1Fee` is a separate receipt field of ~6.4e8 wei per tx of this size (measured on a real tick tx at
block 159437342, #149). Two legs ≈ 211,052 × 1,300 + 2 × 6.4e8 ≈ **1.6e9**, against 1.8e9 held — barely
one leg of headroom. Topped up 1.2e9 → **3e9**, tx
`0xba1c3632081d8e716fef1f944d0d86107c30ad744f2aa13069992414989c2791` (block 159437636, status 1,
`l1Fee` 6.33e8 on the top-up itself). Unichain is the generous one: effective price 500,001 wei and
`l1Fee` 4.7e8 (read off the grant receipt `0xed54e782…`) put the two legs at ≈1.07e11 against 4e11 held
— 3.7× — so no send there.

Balance read back on three RPCs each. The OP send 403'd on its first re-read (publicnode archive gate,
"Archive requests require a personal token") while the receipt was already status 1 at block 159437342 —
a transport fault, not a failed send (#147).

**RPC note (resolved).** OP receipts are not archive-gated everywhere: `publicnode` returns 403
"archive requests require a personal token" and `mainnet.optimism.io` 429s, but `optimism.drpc.org` and
`op-pokt.nodies.app` both serve the full receipt — status 1, gasUsed 47,806, to `0xdDA0728F…`. So OP is
receipt-verified, not merely log-scanned.
