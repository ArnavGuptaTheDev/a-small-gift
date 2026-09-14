/**
 * Payload obfuscation.
 *
 * Worth being blunt about what this is: obfuscation, not encryption.
 *
 * The gift has to travel inside the link, because there is no backend, and
 * the recipient's browser has to be able to decode it unaided - so the key
 * necessarily ships in the public JS bundle. Anyone willing to open devtools
 * can recover the message. This cannot be fixed without either a server or a
 * passphrase shared out of band.
 *
 * What it does buy, which is the actual goal:
 *   - the link no longer looks like base64-encoded JSON, so it cannot be
 *     pasted into an online decoder to spoil the surprise;
 *   - the same gift produces a different-looking blob every time;
 *   - what a URL shortener stores on its servers is the blob, not the note.
 */

/** Bumped if the wire format ever changes, so old links can still be read. */
const VERSION = 1

/** Arbitrary, and public by necessity - see the note above. */
const SEED = 0x5f3a7c21

/** xorshift32 - small, fast, and deterministic across engines. */
function keystream(seed: number, length: number): Uint8Array {
  let x = seed >>> 0 || 1
  const out = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    x ^= x << 13
    x >>>= 0
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    out[i] = x & 0xff
  }
  return out
}

function seedFor(nonce: Uint8Array): number {
  return (SEED ^ (nonce[0] << 8) ^ nonce[1]) >>> 0
}

function randomNonce(): Uint8Array {
  const nonce = new Uint8Array(2)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(nonce)
  } else {
    nonce[0] = Math.floor(Math.random() * 256)
    nonce[1] = Math.floor(Math.random() * 256)
  }
  return nonce
}

/** [version][nonce x2][checksum + payload, XORed with the keystream] */
export function pack(plain: Uint8Array): Uint8Array {
  const nonce = randomNonce()
  const ks = keystream(seedFor(nonce), plain.length + 1)

  let sum = 0
  for (const byte of plain) sum = (sum + byte) & 0xff

  const out = new Uint8Array(plain.length + 4)
  out[0] = VERSION
  out[1] = nonce[0]
  out[2] = nonce[1]
  out[3] = sum ^ ks[0]
  for (let i = 0; i < plain.length; i++) out[i + 4] = plain[i] ^ ks[i + 1]
  return out
}

/** Returns null for anything that is not a well-formed, intact blob. */
export function unpack(blob: Uint8Array): Uint8Array | null {
  if (blob.length < 4 || blob[0] !== VERSION) return null

  const nonce = blob.subarray(1, 3)
  const plain = new Uint8Array(blob.length - 4)
  const ks = keystream(seedFor(nonce), plain.length + 1)

  for (let i = 0; i < plain.length; i++) plain[i] = blob[i + 4] ^ ks[i + 1]

  let sum = 0
  for (const byte of plain) sum = (sum + byte) & 0xff
  if (((blob[3] ^ ks[0]) & 0xff) !== sum) return null

  return plain
}
