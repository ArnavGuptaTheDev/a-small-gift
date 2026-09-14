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
const { encodeGift, decodeGift, buildGiftUrl, resolveRoute } = await import('file://' + bundle)

const obfBundle = join(out, 'o.mjs')
await build({ input: 'src/lib/obfuscate.ts', output: { file: obfBundle, format: 'esm' } })
const { unpack } = await import('file://' + obfBundle)

const giftsBundle = join(out, 'g.mjs')
await build({ input: 'src/lib/gifts.ts', output: { file: giftsBundle, format: 'esm' } })
const { rampFromHex, resolveHeadline, resolveSeal } = await import('file://' + giftsBundle)

/** Links are `/#/gift/<blob>`, so strip the route prefix off the fragment. */
const payloadOf = (url) => new URL(url).hash.replace(/^#\/gift\//, '')
const decodeBlob = (blob) =>
  JSON.parse(Buffer.from(unpack(Buffer.from(blob, 'base64url'))).toString('utf8'))

let failures = 0

// Key order is an implementation detail of the decoder, not part of the
// contract, so compare with keys sorted.
const stable = (v) =>
  JSON.stringify(v, (_, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val).sort(([a], [b]) => a.localeCompare(b)))
      : val,
  )

const check = (label, actual, expected) => {
  const ok = stable(actual) === stable(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) console.log(`   expected ${JSON.stringify(expected)}\n   actual   ${JSON.stringify(actual)}`)
}

const base = { theme: 'blush', occasion: 'just-because', headline: '', from: '' }

// 1. Plain ASCII round-trip.
const plain = { ...base, flower: 'tulips', iceCream: 'vanilla', message: 'I love you.', name: 'Ana' }
check('ascii round-trip', decodeGift(encodeGift(plain)), plain)

// 2. Unicode: accents, emoji, curly quotes, newlines.
const fancy = {
  ...base,
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
  ...base, flower: 'roses', iceCream: 'choco-brownie', message: 'hi', name: 'A',
})

// 6. Long-form keys still work.
const longform = Buffer.from(JSON.stringify({ flower: 'daisies', iceCream: 'vanilla', message: 'hey', name: 'B' })).toString('base64url')
check('long-form keys', decodeGift(longform), {
  ...base, flower: 'daisies', iceCream: 'vanilla', message: 'hey', name: 'B',
})

// 7. The generated URL is well-formed and survives a parse.
const url = buildGiftUrl(fancy)
const parsed = new URL(url)
check('url uses the root path', parsed.pathname, '/')
check('route lives in the fragment', parsed.hash.startsWith('#/gift/'), true)
check('url survives parse', decodeGift(payloadOf(url)), fancy)
console.log('\nURL length for a 60-char message:', url.length)

// 8. A max-length message still produces a usable URL.
const big = { ...base, flower: 'roses', iceCream: 'vanilla', message: 'x'.repeat(500), name: 'Anastasia' }
const bigUrl = buildGiftUrl(big)
console.log('URL length at MESSAGE_MAX (500):', bigUrl.length)
check('max-length round-trip', decodeGift(payloadOf(bigUrl)), big)

// 9. Theme, occasion and signature survive the trip.
const full = {
  flower: 'sunflowers', iceCream: 'mint-choco-chip', theme: 'sage',
  occasion: 'birthday', headline: '', message: 'Have a good one',
  name: 'Sam', from: 'Alex',
}
check('theme/occasion/from round-trip', decodeGift(encodeGift(full)), full)

// 10. Unknown theme/occasion fall back rather than breaking the render.
const badTheme = Buffer.from(
  JSON.stringify({ f: 'roses', i: 'vanilla', t: 'neon', o: 'promotion' }),
).toString('base64url')
check('unknown theme/occasion -> defaults', decodeGift(badTheme), {
  ...base, flower: 'roses', iceCream: 'vanilla', message: '', name: '',
})

// 11. Anything left at its default is dropped, so the link stays short.
const minimal = { ...base, flower: 'roses', iceCream: 'choco-brownie', message: '', name: '' }
const minimalEnc = encodeGift(minimal)
check('defaults omitted from payload', decodeBlob(minimalEnc), {
  f: 'roses', i: 'choco-brownie',
})
check('minimal payload still decodes', decodeGift(minimalEnc), minimal)
console.log('shortest possible payload:', minimalEnc.length, 'chars')

// 12. The encoded blob must not be readable as base64 JSON any more.
const secret = {
  ...base, flower: 'roses', iceCream: 'vanilla',
  message: 'MEET ME AT SEVEN', name: 'Sam',
}
const blob = encodeGift(secret)
let leaked = false
let parseable = false
for (let i = 0; i < 200; i++) {
  const raw = Buffer.from(encodeGift(secret), 'base64url').toString('utf8')
  if (raw.includes('MEET ME AT SEVEN') || raw.includes('message')) leaked = true
  try {
    JSON.parse(raw)
    parseable = true
  } catch {
    // Expected: the blob must not be readable as JSON.
  }
}
check('blob never leaks the message (200 nonces)', leaked, false)
check('blob never parses as JSON (200 nonces)', parseable, false)
check('scrambled blob still decodes', decodeGift(blob), secret)

// 13. Same gift, different blob each time - no fingerprinting by eye.
check('nonce varies output', encodeGift(secret) === encodeGift(secret), false)

// 14. Corrupted blobs are rejected rather than half-decoded.
const flipped = Buffer.from(blob, 'base64url')
flipped[flipped.length - 2] ^= 0xff
check('corrupt blob rejected', decodeGift(flipped.toString('base64url')), null)

// 15. Links sent before obfuscation existed still open.
const legacy = Buffer.from(
  JSON.stringify({ f: 'tulips', i: 'vanilla', m: 'old link', n: 'Sam' }),
).toString('base64url')
check('legacy plain-JSON link still decodes', decodeGift(legacy), {
  ...base, flower: 'tulips', iceCream: 'vanilla', message: 'old link', name: 'Sam',
})

// 16. The gift rides in the fragment, never the query string.
const shareUrl = buildGiftUrl(secret)
const parsedShare = new URL(shareUrl)
check('payload is in the fragment', parsedShare.hash.startsWith('#/gift/'), true)
check('query string is empty', parsedShare.search, '')
check('fragment round-trips', decodeGift(payloadOf(shareUrl)), secret)
console.log('share URL:', shareUrl.length, 'chars')

// 17. A custom colour survives as a colour, not as a rejected theme id.
const custom = {
  ...base, flower: 'roses', iceCream: 'vanilla', theme: '#7c3aed',
  message: 'hi', name: 'Sam',
}
check('custom hex theme round-trips', decodeGift(encodeGift(custom)), custom)
check('hex theme normalised to lower case',
  decodeGift(encodeGift({ ...custom, theme: '#7C3AED' })).theme, '#7c3aed')
check('malformed hex falls back to default',
  decodeGift(encodeGift({ ...custom, theme: '#12345' })).theme, 'blush')

// 18. A written-in occasion survives with its headline.
const written = {
  ...base, flower: 'daisies', iceCream: 'vanilla', occasion: 'custom',
  headline: 'Happy Graduation', message: 'Proud of you', name: 'Sam',
}
check('custom occasion round-trips', decodeGift(encodeGift(written)), written)

// 19. Headline assembly, including the empty and name-less cases.
check('custom headline takes the name',
  resolveHeadline('custom', 'Happy Graduation', 'Sam'), 'Happy Graduation, Sam')
check('custom headline without a name',
  resolveHeadline('custom', 'Happy Graduation', ''), 'Happy Graduation')
check('empty custom headline still warm',
  resolveHeadline('custom', '   ', 'Sam'), 'For Sam')
check('preset headline unaffected',
  resolveHeadline('birthday', 'ignored', 'Sam'), 'Happy Birthday, Sam')
check('custom occasion seals with a heart', resolveSeal('custom'), 'heart')

// 20. Generated ramps must stay legible whatever colour is picked - a fixed
//     lightness curve alone let yellow through at 1.57:1 against white.
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
const onWhite = (hex) => 1.05 / (luminance(hex) + 0.05)

let worst500 = Infinity
let worst600 = Infinity
let monotonic = true
for (let h = 0; h < 360; h += 10) {
  for (const [sat, light] of [[100, 50], [45, 50], [100, 90], [15, 20]]) {
    const hex = `#${[0, 8, 4].map((k) => {
      const f = (k + h / 30) % 12
      const a = (sat / 100) * Math.min(light / 100, 1 - light / 100)
      const v = light / 100 - a * Math.max(-1, Math.min(Math.min(f - 3, 9 - f), 1))
      return Math.round(v * 255).toString(16).padStart(2, '0')
    }).join('')}`
    const ramp = rampFromHex(hex)
    worst500 = Math.min(worst500, onWhite(ramp[5]))
    worst600 = Math.min(worst600, onWhite(ramp[6]))
    if (luminance(ramp[6]) >= luminance(ramp[5])) monotonic = false
  }
}
check('every hue: white on 500 >= 3.0', worst500 >= 2.99, true)
check('every hue: 600 on white >= 4.5', worst600 >= 4.49, true)
check('600 always darker than 500', monotonic, true)
console.log(`ramp contrast floor: 500=${worst500.toFixed(2)} 600=${worst600.toFixed(2)}`)

// 21. Route resolution for every link shape we have ever emitted. This is
//     the bug that reached production: /gift#<blob> needs the host to rewrite
//     unknown paths to index.html, and without that the shared link 404s.
const at = (href) => {
  window.location = Object.assign(new URL(href), { href })
  return resolveRoute()
}
const BLOB = encodeGift(secret)

const routes = [
  ['root composer',        'https://g.example.com/',                              'composer', null],
  ['current /#/gift/blob', `https://g.example.com/#/gift/${BLOB}`,                 'reveal',   BLOB],
  ['pretty /gift#blob',    `https://g.example.com/gift#${BLOB}`,                   'reveal',   BLOB],
  ['legacy /gift?data=',   `https://g.example.com/gift?data=${BLOB}`,              'reveal',   BLOB],
  ['legacy /#/gift?data=', `https://g.example.com/#/gift?data=${BLOB}`,            'reveal',   BLOB],
  ['legacy /?data=',       `https://g.example.com/?data=${BLOB}`,                  'reveal',   BLOB],
  ['bare /gift',           'https://g.example.com/gift',                           'reveal',   null],
]
for (const [label, href, view, data] of routes) {
  const r = at(href)
  check(`route: ${label}`, { view: r.view, data: r.data }, { view, data })
}
check('current shape decodes end to end', decodeGift(at(`https://g.example.com/#/gift/${BLOB}`).data), secret)

// Restore the origin the earlier tests assumed.
window.location = { href: 'https://giftlink.example.com/' }

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
