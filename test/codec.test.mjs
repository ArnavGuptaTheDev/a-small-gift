import { build } from 'rolldown'
import { writeFileSync, readFileSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// Bundle the real module, stubbing only the browser globals it touches.
const out = mkdtempSync(join(tmpdir(), 'gl-'))
const bundle = join(out, 'b.mjs')
await build({
  // Paths resolve from the project root, where npm runs this.
  input: 'src/lib/giftLink.ts',
  output: { file: bundle, format: 'esm' },
})
// Stand in for Vite's compile-time env substitution.
writeFileSync(
  bundle,
  readFileSync(bundle, 'utf8').replaceAll('import.meta.env.BASE_URL', JSON.stringify('/')),
)

globalThis.window = { location: { href: 'https://giftlink.example.com/' } }
const { encodeGift, decodeGift, buildGiftUrl } = await import('file://' + bundle)

let failures = 0
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) console.log(`   expected ${JSON.stringify(expected)}\n   actual   ${JSON.stringify(actual)}`)
}

// 1. Plain ASCII round-trip.
const plain = { flower: 'tulips', iceCream: 'vanilla', message: 'I love you.', name: 'Ana' }
check('ascii round-trip', decodeGift(encodeGift(plain)), plain)

// 2. Unicode: accents, emoji, curly quotes, newlines.
const fancy = {
  flower: 'peonies',
  iceCream: 'choco-brownie',
  message: 'Te quiero, Renée — “always” \u{1F495}\nLine two.',
  name: 'Renée',
}
check('unicode round-trip', decodeGift(encodeGift(fancy)), fancy)

// 3. base64url alphabet only (no +, /, = to break the URL).
const enc = encodeGift(fancy)
check('base64url alphabet', /^[A-Za-z0-9_-]+$/.test(enc), true)

// 4. Invalid input degrades to the fallback, never throws.
check('null data', decodeGift(null), null)
check('garbage data', decodeGift('!!!not-base64!!!'), null)
check('valid b64, not json', decodeGift(Buffer.from('hello').toString('base64url')), null)

// 5. Unknown ids fall back to defaults instead of rendering nothing.
const weird = Buffer.from(JSON.stringify({ f: 'cactus', i: 'durian', m: 'hi', n: 'A' })).toString('base64url')
check('unknown ids -> defaults', decodeGift(weird), {
  flower: 'roses', iceCream: 'choco-brownie', message: 'hi', name: 'A',
})

// 6. Long-form keys still work.
const longform = Buffer.from(JSON.stringify({ flower: 'daisies', iceCream: 'vanilla', message: 'hey', name: 'B' })).toString('base64url')
check('long-form keys', decodeGift(longform), {
  flower: 'daisies', iceCream: 'vanilla', message: 'hey', name: 'B',
})

// 7. The generated URL is well-formed and survives a parse.
const url = buildGiftUrl(fancy)
const parsed = new URL(url)
check('url path', parsed.pathname, '/gift')
check('url survives parse', decodeGift(parsed.searchParams.get('data')), fancy)
console.log('\nURL length for a 60-char message:', url.length)

// 8. A max-length message still produces a usable URL.
const big = { flower: 'roses', iceCream: 'vanilla', message: 'x'.repeat(500), name: 'Anastasia' }
const bigUrl = buildGiftUrl(big)
console.log('URL length at MESSAGE_MAX (500):', bigUrl.length)
check('max-length round-trip', decodeGift(new URL(bigUrl).searchParams.get('data')), big)

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
