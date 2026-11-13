// lib.js — the ONE shared client the audit (S4-7) asked for: the rpc transport and the keccak
// primitive that every fleet page had inlined ~20 times. build.sh (gen_lib.py) strips the inlined
// copies from the BUNDLE and inserts one <script src="…/lib.js">; the page SOURCES keep their copies
// so a source file still opens standalone (file://, no build) for QA and _render/.
//
// WHY AN IIFE: two classic <script> tags that each declare `const MASK` at TOP LEVEL collide
// ("Identifier 'MASK' has already been declared"). So nothing here is a top-level binding — the whole
// file is one IIFE that publishes its API on globalThis. A page that KEEPS its own copy merely
// re-declares the same name as a top-level function/const in ITS OWN script, which shadows the global
// for that page — same behavior, no collision. A page we STRIPPED calls the identical code via global.
//
// PROVEN, not asserted: verify.mjs §8f loads THIS file in node and runs keccak256 against `cast keccak`
// for fixed vectors — a wrong shared script is worse than 20 right inline ones.
(function () {
  "use strict";

  // ---- _fetchT: fetch with an 8s AbortController so a hung RPC cannot wedge a page forever --------
  globalThis._fetchT = async function _fetchT(url, opts = {}, ms = 8000) {
    const _ac = new AbortController();
    const _to = setTimeout(() => _ac.abort(), ms);
    try { return await fetch(url, Object.assign({}, opts, { signal: _ac.signal })); }
    finally { clearTimeout(_to); }
  };

  // ---- keccak256 (Ethereum) in pure JS — VERIFIED against cast keccak for len 0..600 --------------
  // rate 136, pad 0x01..0x80 (Keccak, NOT SHA3). The fleet DERIVES its selectors with this, never types.
  const MASK = (1n << 64n) - 1n;
  const RC = [
0x0000000000000001n,0x0000000000008082n,0x800000000000808an,0x8000000080008000n,
0x000000000000808bn,0x0000000080000001n,0x8000000080008081n,0x8000000000008009n,
0x000000000000008an,0x0000000000000088n,0x0000000080008009n,0x000000008000000an,
0x000000008000808bn,0x800000000000008bn,0x8000000000008089n,0x8000000000008003n,
0x8000000000008002n,0x8000000000000080n,0x000000000000800an,0x800000008000000an,
0x8000000080008081n,0x8000000000008080n,0x0000000080000001n,0x8000000080008008n];
  const ROT = [[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];
  function rol(x, n) { n %= 64n; return ((x << n) | (x >> (64n - n))) & MASK; }
  function keccakF(A) {
    for (let r = 0; r < 24; r++) {
      const Cc = [0n,0n,0n,0n,0n], D = [0n,0n,0n,0n,0n];
      for (let x = 0; x < 5; x++) Cc[x] = A[x][0] ^ A[x][1] ^ A[x][2] ^ A[x][3] ^ A[x][4];
      for (let x = 0; x < 5; x++) D[x] = Cc[(x + 4) % 5] ^ rol(Cc[(x + 1) % 5], 1n);
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) A[x][y] ^= D[x];
      const B = [[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n]];
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) B[y][(2 * x + 3 * y) % 5] = rol(A[x][y], BigInt(ROT[x][y]));
      for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) A[x][y] = B[x][y] ^ ((~B[(x + 1) % 5][y]) & B[(x + 2) % 5][y] & MASK);
      A[0][0] ^= RC[r];
    }
  }
  function hexToBytes(h) { h = h.replace(/^0x/, ""); const o = new Uint8Array(h.length / 2); for (let i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16); return o; }
  function bytesToHex(b) { return "0x" + [...b].map((x) => x.toString(16).padStart(2, "0")).join(""); }
  // input: "0x…" hex string OR Uint8Array. Preimage may be raw text, so callers hex-encode first.
  function keccak256(input) {
    const msg = typeof input === "string" ? hexToBytes(input) : input;
    const rate = 136, P = 0x01, S = 0x80;
    const padLen = rate - (msg.length % rate);   // 1 when msg fills all but one byte (0x81 fits)
    const pad = new Uint8Array(padLen); pad[0] = P; pad[pad.length - 1] |= S;
    const buf = new Uint8Array(msg.length + pad.length); buf.set(msg); buf.set(pad, msg.length);
    const A = [[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n],[0n,0n,0n,0n,0n]];
    for (let off = 0; off < buf.length; off += rate) {
      for (let i = 0; i < rate / 8; i++) { let lane = 0n; for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(buf[off + i * 8 + b]); A[i % 5][(i / 5) | 0] ^= lane; }
      keccakF(A);
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 4; i++) { let lane = A[i % 5][(i / 5) | 0]; for (let b = 0; b < 8; b++) { out[i * 8 + b] = Number(lane & 0xffn); lane >>= 8n; } }
    return bytesToHex(out);
  }

  globalThis.keccak256 = keccak256;
  globalThis.hexToBytes = hexToBytes;
  globalThis.bytesToHex = bytesToHex;

  // node/CommonJS guard for §8f: verify.mjs `require`s this file. In a browser `module` is undefined.
  if (typeof module !== "undefined" && module.exports) module.exports = { keccak256, hexToBytes, bytesToHex };
})();
