# x402Facilitator — LIVE DEPLOY EVIDENCE (Base mainnet)

Author: dex-exec10 · 2026-11-09 · status: **DEPLOYED, byte-identical to source, chain-verified**.
Chain 8453. Everything below is a live receipt / live byte pin / live readback — not prose.
Part of the 4-product wave fire (exec10, coordinator dex-critic). Nothing else broadcast.

---

## The shipped contract

| field | value |
|---|---|
| address | `0xED79DE434D2a2633EedD95890E35637f0d41AEb3` — **copy this, never retype (GOTCHA #73)** |
| deploy tx | `0x8bd379e60f5e56c3f5239fa3346726100978356e734878a32d94a8a68a031fa9` (block `0x34c9057` = 55349335, status 1, type 2) |
| deployer | `0x9544162daBeB28Ff2D5fa0c5B3fa3bB66056377d` (fresh key, nonce 0 — see `KEY-RECORD.md`) |
| runtime | 1,813 B — **BYTE-IDENTICAL** to the local artifact `out/x402Facilitator.sol/x402Facilitator.json` `.deployedBytecode` (no immutables → no patch needed) |
| code keccak | `0x133859d187054a7b6fcc6e5325e4de16ad60ba9bb37f98781a06046b33be508b` |
| gasUsed | 472,681 (`0x73669`), effGasPrice 5,110,000 wei ⇒ **~0.00000242 ETH** |

Live readbacks (from chain, two fields): `owner()` = `0xe218E382F28A094f9f64E903ee3cb1750A7f204B` (orphan);
`isWriter(deployer)` = `false`; `verify(<unknown>)` = `false`.

## ⚠ POST-DEPLOY STEP — owner must `setWriter(seeder,true)`

> **Superseded by the RELAUNCH section below** (which itself records it SATISFIED on both contracts).
> The `0x9544162d…` instance described here is pre-relaunch.
The facilitator has its OWN writer allow-list and `verify()` reads its OWN `_settled` map. Until the
owner calls `setWriter(<seeder>, true)`, `markPaid` reverts `NotWriter()` and `verify()` can never flip
true. `isWriter(deployer)==false` is *correct* — the deploy key is not a writer.

## Funding + residue
Warchest `0xa3a2b2E9e474F98bC13109F89411c0f4E2E78611` → fresh key, 6e12 wei (tx
`0x3c0d2c2659385afcd9f7477c85d29b7ae7cc32a1614bd17e845f0180df92e0a7`, warchest nonce 56, status 1).
Deployer residue after deploy: 3,573,795,373,979 wei. Deployer nonce now 1.

## Reproduce
```
PRIVATE_KEY=<fresh> OWNER=0xe218E382F28A094f9f64E903ee3cb1750A7f204B forge script \
  script/Deploy.s.sol:Deploy --rpc-url https://mainnet.base.org --broadcast --with-gas-price 6500000
cast code 0xED79DE434D2a2633EedD95890E35637f0d41AEb3 --rpc-url https://mainnet.base.org   # 1,813 B
cast call 0xED79DE434D2a2633EedD95890E35637f0d41AEb3 "owner()(address)" --rpc-url https://mainnet.base.org
```


## RELAUNCH 2026-11-12 (FREEZE->DRAIN->REDEPLOY)

New-line CREATE2 deployment at `0x5849eF6f21fDC21d5194c24ED6c824965A613739` — same address on Base, Optimism and Unichain (chain-invariant, codehash-proven 3-way by dex-critic). The pre-relaunch instance on Base is frozen and superseded; its address is retained above as history.

### Relaunch deploy record (Base, 2026-11-11)

Read off the receipt on two RPCs (tenderly + drpc); the address above is re-derived from the
CREATE2 salt+initcode, and its runtime is byte-identical to the pre-relaunch copy (same keccak).

| field | value |
|---|---|
| address | `0x5849ef6f21fdc21d5194c24ed6c824965a613739` |
| deploy tx | `0x84c1da9f1b4dad486102098238483e529dc23d47ba4e2b0e7474b5965cd0de09` (block `56269468`, status 1, gas 474,062) |
| deployer | `0x75d551ad9dac6646f49c7bd681857e4724cb4900` |

### POST-DEPLOY STEP — SATISFIED (writer granted on all three chains)

The caveat above ("owner must `setWriter(seeder,true)`) is CLOSED for this instance. The writer is the
key `NEWLINE-KEYS.md` designates for it — `x402writer` `0xD85661ED5B26320C75225DF4e3e9531E3d694e63`,
purpose "`setWriter` on x402 **+ settlement**" — not the deploy key and not the owner.
`markPaid` is now callable and `verify()` can flip.

The SAME key needed the twin grant on the SettlementRegistry (`0xdDA0728F…`). The x402 leg fired at
03:11Z on 2026-11-12 and the settlement twin was never fired — so between 03:11Z and 11:35Z the record
read "writer granted" while `markPaid` on the registry still reverted `NotWriter()`. Half a pair is worse
than none. Both legs are now consistent; the x402 rows below are the ones that already existed, the
settlement rows are the ones that did not.

| chain | x402 grant (03:11Z) | settlement grant (11:35Z) |
|---|---|---|
| Base (8453) | `0x32d80ba83d9eb13b5feabf8686253110a84e760b2d747711167f9929f8a69283` blk 56313455 gas 47,798 | `0x7680bb795e6f2f4793ca9c53413a4a51fef44e3a4ecc9917ae1ec0d552ef30ac` blk 56408900 gas 47,806 |
| Optimism (10) | `0x00544fbce6c197eac0c8aac92637a7f3732a52cc9851cdb4291871b02fcd3894` blk 159427147 gas 47,798 | `0x0b2931aa643abb6d06da39aab418dfb7f28f0d11a87ce7c00a30d5f1a69a3653` blk 159436698 gas 47,806 |
| Unichain (130) | `0xe0ae031924dead61482da7c05cbc8eb0175527c35d62613983c24f9237b16d82` blk 63704754 gas 47,798 | `0xed54e78236957b6ef499663d1f3226555004dd2d4b8e771a241de653befc42ca` blk 63723822 gas 47,806 |

Every row above is `from` the owner `0x038d7B3211AbDfa06c4fed7A77AcCD1647331caE`, `status` 1, and was
found by binary-searching the `isWriter` readback (a `cast logs` over a 200k-block range returns nothing
on all three of these endpoints; a bounded range from the flip block does return the tx). Full per-chain
receipt basis is in `products/settlement/DEPLOY-EVIDENCE.md`.

Post-state, read from chain on three chains (2 RPCs on Base): `isWriter(x402writer) == true` everywhere,
`isWriter(owner) == false` everywhere.

The writer was also **unfunded** at grant time (0 wei, nonce 0 on all three chains), so the grant would
still have failed for gas on the first real `markPaid` — a `cast call` simulates clean without charging
gas, so that state is invisible until the write. Funded from owner `0x038d7B32…`, three sends, all
status 1: Base `0xdfb2e4a5…` 1.2e12, OP `0x30562aec…` 1.8e9, Uni `0xfcbb6411…` 0.4e12. Full table and
the cost arithmetic (`markPaid` = 139,663 gas here vs 71,389 on settlement) in
`products/settlement/DEPLOY-EVIDENCE.md` § "Writer funding".

Both legs are now **receipt-verified on all three chains**, including Optimism — publicnode 403s on
archive but `optimism.drpc.org` and `op-pokt.nodies.app` serve the receipt (status 1, gasUsed 47,806,
`WriterSet` with the indexed writer topic `0xd85661ed…4e63`, data `1`). The earlier "log scan only" caveat
was an RPC choice, not a chain limitation.
