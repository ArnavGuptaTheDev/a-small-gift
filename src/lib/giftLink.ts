import {
  DEFAULT_FLOWER,
  DEFAULT_ICE_CREAM,
  DEFAULT_OCCASION,
  DEFAULT_THEME,
  FLOWERS,
  ICE_CREAMS,
  OCCASIONS,
  THEMES,
  type FlowerId,
  type IceCreamId,
  type OccasionId,
  type ThemeId,
} from './gifts'

export interface GiftPayload {
  flower: FlowerId
  iceCream: IceCreamId
  theme: ThemeId
  occasion: OccasionId
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
    ...(gift.message ? { m: gift.message } : {}),
    ...(gift.name ? { n: gift.name } : {}),
    ...(gift.from ? { s: gift.from } : {}),
  })
  return bytesToBase64Url(new TextEncoder().encode(json))
}

export function decodeGift(encoded: string | null): GiftPayload | null {
  if (!encoded) return null
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(encoded))
    const raw = JSON.parse(json) as Record<string, unknown>
    if (typeof raw !== 'object' || raw === null) return null

    // Accept both the short keys we write and the long-form keys, so a
    // hand-assembled link still opens.
    const flower = pickId(raw.f ?? raw.flower, FLOWERS, DEFAULT_FLOWER) as FlowerId
    const iceCream = pickId(raw.i ?? raw.iceCream, ICE_CREAMS, DEFAULT_ICE_CREAM) as IceCreamId

    return {
      flower,
      iceCream,
      theme: pickId(raw.t ?? raw.theme, THEMES, DEFAULT_THEME) as ThemeId,
      occasion: pickId(raw.o ?? raw.occasion, OCCASIONS, DEFAULT_OCCASION) as OccasionId,
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

function clampString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

/** Absolute, shareable URL for a gift. */
export function buildGiftUrl(gift: GiftPayload): string {
  const url = new URL(window.location.href)
  url.hash = ''
  url.search = ''
  url.pathname = withBase('gift')
  url.searchParams.set('data', encodeGift(gift))
  return url.toString()
}

/**
 * Vite's BASE_URL always has a trailing slash, so joining is just concat.
 * Keeps the app working if it is ever served from a subpath.
 */
function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export type View = 'composer' | 'reveal'

/**
 * Two views, resolved straight off the URL. We accept the pretty path
 * (/gift?data=...) and a hash form (#/gift?data=...) so the link still works
 * on hosts that do not rewrite unknown paths to index.html.
 */
export function resolveRoute(): { view: View; data: string | null } {
  const { pathname, search, hash } = window.location

  if (hash.startsWith('#/gift')) {
    const query = hash.slice(hash.indexOf('?') + 1)
    const data = hash.includes('?') ? new URLSearchParams(query).get('data') : null
    return { view: 'reveal', data }
  }

  if (/\/gift\/?$/.test(pathname)) {
    return { view: 'reveal', data: new URLSearchParams(search).get('data') }
  }

  // A bare ?data= on the root is treated as a reveal too - some chat apps
  // mangle the path but keep the query.
  const rootData = new URLSearchParams(search).get('data')
  if (rootData) return { view: 'reveal', data: rootData }

  return { view: 'composer', data: null }
}
