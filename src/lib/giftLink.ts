import {
  DEFAULT_FLOWER,
  DEFAULT_ICE_CREAM,
  DEFAULT_OCCASION,
  DEFAULT_THEME,
  FLOWERS,
  HEADLINE_MAX,
  ICE_CREAMS,
  isHexColor,
  isValidOccasion,
  THEMES,
  type FlowerId,
  type IceCreamId,
} from './gifts'
import { pack, unpack } from './obfuscate'

export interface GiftPayload {
  flower: FlowerId
  iceCream: IceCreamId
  /** A preset theme id, or a `#rrggbb` colour of their own. */
  theme: string
  /** A preset occasion id, or `custom` - see `headline`. */
  occasion: string
  /** Used as the headline when `occasion` is `custom`. */
  headline: string
  message: string
  name: string
  /** Who it is from - shown as a signature under the note. */
  from: string
}

export const MESSAGE_MAX = 500
export const NAME_MAX = 40
export const FROM_MAX = 40

/* -------------------------------------------------------------------------
 * base64url <-> UTF-8
 *
 * btoa/atob are latin1-only, so anything she might actually type (accents,
 * emoji, curly quotes) has to go through TextEncoder first. We also use the
 * URL-safe alphabet and strip padding so the link never needs escaping.
 * ---------------------------------------------------------------------- */

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  // Chunked to avoid blowing the argument limit on large inputs.
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  let normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  while (normalized.length % 4 !== 0) normalized += '='
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeGift(gift: GiftPayload): string {
  // Short keys, and anything left at its default is omitted entirely - it
  // keeps the shared link noticeably shorter.
  const json = JSON.stringify({
    f: gift.flower,
    i: gift.iceCream,
    ...(gift.theme === DEFAULT_THEME ? {} : { t: gift.theme }),
    ...(gift.occasion === DEFAULT_OCCASION ? {} : { o: gift.occasion }),
    ...(gift.headline ? { h: gift.headline } : {}),
    ...(gift.message ? { m: gift.message } : {}),
    ...(gift.name ? { n: gift.name } : {}),
    ...(gift.from ? { s: gift.from } : {}),
  })
  return bytesToBase64Url(pack(new TextEncoder().encode(json)))
}

export function decodeGift(encoded: string | null): GiftPayload | null {
  if (!encoded) return null
  try {
    const bytes = base64UrlToBytes(encoded)
    // Links made before payloads were obfuscated are plain JSON, and should
    // keep working - anything already sent is out of our hands.
    const plain = unpack(bytes) ?? bytes
    const json = new TextDecoder().decode(plain)
    const raw = JSON.parse(json) as Record<string, unknown>
    if (typeof raw !== 'object' || raw === null) return null

    // Accept both the short keys we write and the long-form keys, so a
    // hand-assembled link still opens.
    const flower = pickId(raw.f ?? raw.flower, FLOWERS, DEFAULT_FLOWER) as FlowerId
    const iceCream = pickId(raw.i ?? raw.iceCream, ICE_CREAMS, DEFAULT_ICE_CREAM) as IceCreamId

    return {
      flower,
      iceCream,
      theme: pickTheme(raw.t ?? raw.theme),
      occasion: isValidOccasion(raw.o ?? raw.occasion)
        ? ((raw.o ?? raw.occasion) as string)
        : DEFAULT_OCCASION,
      headline: clampString(raw.h ?? raw.headline, HEADLINE_MAX),
      message: clampString(raw.m ?? raw.message, MESSAGE_MAX),
      name: clampString(raw.n ?? raw.name, NAME_MAX),
      from: clampString(raw.s ?? raw.from, FROM_MAX),
    }
  } catch {
    return null
  }
}

function pickId(value: unknown, list: { id: string }[], fallback: string): string {
  return typeof value === 'string' && list.some((item) => item.id === value)
    ? value
    : fallback
}

/** A preset theme id, or any valid `#rrggbb` colour. */
function pickTheme(value: unknown): string {
  if (typeof value === 'string' && isHexColor(value)) return value.toLowerCase()
  return pickId(value, THEMES, DEFAULT_THEME)
}

function clampString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

/**
 * Absolute, shareable URL for a gift.
 *
 * Two deliberate choices here, both learned the hard way:
 *
 * 1. The payload goes in the fragment, not the query string. Fragments are
 *    never sent in an HTTP request, so the gift stays out of the host's
 *    access logs, out of Referer headers, and out of any proxy in between.
 *
 * 2. The link points at the *root* path, with the route itself inside the
 *    fragment. A pretty `/gift#...` URL needs the host to rewrite unknown
 *    paths to index.html, and when that is not configured the shared link
 *    404s - which is exactly what happened on App Platform, because creating
 *    an app through its UI does not read `.do/app.yaml`. The root path always
 *    resolves, on every static host, with no configuration at all.
 */
export function buildGiftUrl(gift: GiftPayload): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.pathname = import.meta.env.BASE_URL
  url.hash = `/gift/${encodeGift(gift)}`
  return url.toString()
}

export type View = 'composer' | 'reveal'

/**
 * Two views, resolved straight off the URL.
 *
 * Current links look like `/#/gift/<blob>` - root path, route in the
 * fragment, so no host rewrite rules are needed. Every earlier shape is
 * still accepted, because links already sent cannot be recalled:
 *   - `/gift#<blob>`        pretty path, needs a catchall on the host
 *   - `/gift?data=<blob>`   the original query form
 *   - `/#/gift?data=<blob>` the first hash-routed form
 *   - `/?data=<blob>`       some chat apps drop the path but keep the query
 */
export function resolveRoute(): { view: View; data: string | null } {
  const { pathname, search, hash } = window.location
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash

  // Current form: the route and the payload both live in the fragment.
  const routed = fragment.match(/^\/gift\/(.+)$/)
  if (routed) return { view: 'reveal', data: routed[1] }

  // Earlier hash-routed form, where the payload was a query parameter.
  if (fragment.startsWith('/gift')) {
    const query = fragment.slice(fragment.indexOf('?') + 1)
    const data = fragment.includes('?') ? new URLSearchParams(query).get('data') : null
    return { view: 'reveal', data }
  }

  const onGiftPath = /\/gift\/?$/.test(pathname)

  // Pretty-path form: the whole fragment is the payload.
  if (onGiftPath && fragment && !fragment.startsWith('/')) {
    return { view: 'reveal', data: fragment }
  }

  const queryData = new URLSearchParams(search).get('data')
  if (onGiftPath || queryData) {
    return { view: 'reveal', data: queryData }
  }

  return { view: 'composer', data: null }
}
