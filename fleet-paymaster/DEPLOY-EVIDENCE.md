# FleetPaymaster — LIVE DEPLOY EVIDENCE (Base mainnet)

Author: dex-exec10 · 2026-11-09 · status: **DEPLOYED, byte-identical to source, chain-verified**.
Chain 8453. Everything below is a live receipt / live byte pin / live readback — not prose.
Part of the 4-product wave fire (exec10, coordinator dex-critic). Nothing else broadcast.

---

## The shipped contract

| field | value |
|---|---|
| address | `0x51B6c98a857E19FBC5C3f85b04D28E8f91c54426` — **copy this, never retype (GOTCHA #73)** |
| deploy tx | `0x90bd10c7914cd2c32e476a6b778e246cc2027ccc83d01b53b95f4db63737aaea` (block `0x34c90df` = 55349471, status 1, type 2) |
| deployer | `0x786df6d18874e218FCE7986c90b672824DA4480D` (fresh key, nonce 0 — see `KEY-RECORD.md`) |
| runtime | 7,343 B |
| code keccak | `0x6614b7896d5dcd188d444c39f886240ef04f187b048f745331d12ba7a706fc76` |
| gasUsed | 1,713,118 (`0x1a23de`), effGasPrice 5,767,049 wei ⇒ **~0.00000988 ETH** |

Ctor binding: `entryPoint` = `0x0000000071727De22E5E9d8BAf0edAc6f37da032` — the real, LIVE ERC-4337
v0.7 EntryPoint. The script requires `ep.code.length > 0` BEFORE deploy; the readback below re-reads it
off the deployed contract.

Live readbacks (from chain): `entryPoint()` = `0x0000000071727De22E5E9d8BAf0edAc6f37da032` ✓;
`owner()` = `0xe218E382F28A094f9f64E903ee3cb1750A7f204B` (orphan).

## BYTE-IDENTITY (this one has an immutable, so the artifact needs the ctor patch)

`FleetPaymaster` has ONE immutable (`IEntryPoint public immutable entryPoint`), so the compiled artifact
holds ZERO placeholders where the ctor writes the live address at deploy time. The check is therefore
*not* naive string-equality but the standard immutable patch:

- artifact keccak (zeros in immutables): `0xe5b145b99117d64b6680f095d8a34a466180ce7d1cb54f0920ed9dc0e2d69a2c`
- **PATCH** the artifact's 7 `immutableReferences` slots (offsets from
  `out/FleetPaymaster.sol/FleetPaymaster.json` `.deployedBytecode.immutableReferences`) with the
  EntryPoint address → keccak `0x6614b7896d5dcd188d444c39f886240ef04f187b048f745331d12ba7a706fc76`
- chain runtime keccak → **the SAME** `0x6614b7896d5dcd188d444c39f886240ef04f187b048f745331d12ba7a706fc76`
- patched artifact bytes == chain bytes: **True** (7,343 B both)

So the only difference between artifact and chain is the immutable, and it is exactly the ctor value.

## Funding + residue
Warchest `0xa3a2b2E9e474F98bC13109F89411c0f4E2E78611` → fresh key, 1.5e13 wei — the largest slice in the
wave, sized for 1.71M gas at the ~10.1e6 EIP-1559 maxFeePerGas (tx
`0xd1c84490733548280c42fd1f595684af27aa6d9be472d08c8c6e40b036715434`, warchest nonce 55, status 1).
Deployer residue after deploy: 5,084,215,277,219 wei. Deployer nonce now 1.

## Reproduce
```
PRIVATE_KEY=<fresh> OWNER=0xe218E382F28A094f9f64E903ee3cb1750A7f204B \
  ENTRY_POINT=0x0000000071727De22E5E9d8BAf0edAc6f37da032 forge script \
  script/Deploy.s.sol:Deploy --rpc-url https://mainnet.base.org --broadcast --with-gas-price 6500000
cast code 0x51B6c98a857E19FBC5C3f85b04D28E8f91c54426 --rpc-url https://mainnet.base.org   # 7,343 B
cast call 0x51B6c98a857E19FBC5C3f85b04D28E8f91c54426 "entryPoint()(address)" --rpc-url https://mainnet.base.org
```


## RELAUNCH 2026-11-12 (FREEZE->DRAIN->REDEPLOY)

New-line CREATE2 deployment at `0x70A615dDc4cd013Cf4D569Ae3394bF4465229B95` — same address on Base, Optimism and Unichain (chain-invariant, codehash-proven 3-way by dex-critic). The pre-relaunch instance on Base is frozen and superseded; its address is retained above as history.

### Relaunch deploy record (Base, 2026-11-11)

Read off the receipt on two RPCs (tenderly + drpc); the address above is re-derived from the
CREATE2 salt+initcode, and its runtime is byte-identical to the pre-relaunch copy (same keccak).

| field | value |
|---|---|
| address | `0x70a615ddc4cd013cf4d569ae3394bf4465229b95` |
| deploy tx | `0xbd1b759f1ed55754c8b897864f8315938d7d2541b3704cf725cd2f5a12506101` (block `56269451`, status 1, gas 1,716,755) |
| deployer | `0x75d551ad9dac6646f49c7bd681857e4724cb4900` |
