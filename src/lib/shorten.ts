/**
 * Link shortening via free, keyless services.
 *
 * All three are used anonymously - no account, no API key - because the key
 * would have to ship in the bundle to be usable from a static page, which
 * means publishing it. Each was checked for CORS support and for preserving
 * the URL fragment through the redirect, since that is where the gift lives.
 *
 * None of this is load-bearing: if every provider fails, is rate-limited, or
 * is blocked, the caller keeps the long link, which is already unreadable on
 * its own. Shortening is tidiness, not secrecy.
 */

const TIMEOUT_MS = 6000

interface Provider {
  name: string
  shorten: (url: string, signal: AbortSignal) => Promise<string>
}

const PROVIDERS: Provider[] = [
  {
    name: 'TinyURL',
    shorten: async (url, signal) => {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
        { signal },
      )
      if (!res.ok) throw new Error(`TinyURL ${res.status}`)
      return (await res.text()).trim()
    },
  },
  {
    name: 'da.gd',
    shorten: async (url, signal) => {
      const res = await fetch(`https://da.gd/shorten?url=${encodeURIComponent(url)}`, {
        signal,
      })
      if (!res.ok) throw new Error(`da.gd ${res.status}`)
      return (await res.text()).trim()
    },
  },
  {
    name: 'spoo.me',
    shorten: async (url, signal) => {
      const res = await fetch('https://spoo.me/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url }),
        signal,
      })
      if (!res.ok) throw new Error(`spoo.me ${res.status}`)
      const data = (await res.json()) as { short_url?: string }
      if (!data.short_url) throw new Error('spoo.me: no short_url')
      // It hands back http://; the https form is the same link, one hop fewer.
      return data.short_url.replace(/^http:\/\//, 'https://')
    },
  },
]

export interface ShortenResult {
  url: string
  /** Which service produced it, or null when we fell back to the long link. */
  provider: string | null
}

function looksLikeUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Tries each provider in turn, returning the long URL unchanged if they all
 * fail. Never rejects - a failed shortening is not a failed gift.
 */
export async function shortenUrl(longUrl: string): Promise<ShortenResult> {
  for (const provider of PROVIDERS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const short = await provider.shorten(longUrl, controller.signal)
      // Some services answer 200 with an error string in the body, so check
      // that what came back is actually a URL, and actually shorter.
      if (looksLikeUrl(short) && short.length < longUrl.length) {
        return { url: short, provider: provider.name }
      }
    } catch {
      // Offline, blocked, rate-limited, CORS - all the same to us: try the
      // next one, and fall through to the long link if there is no next one.
    } finally {
      clearTimeout(timer)
    }
  }
  return { url: longUrl, provider: null }
}
