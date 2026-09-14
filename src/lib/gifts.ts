export type FlowerId =
  | 'roses'
  | 'tulips'
  | 'sunflowers'
  | 'peonies'
  | 'orchids'
  | 'daisies'

export type IceCreamId =
  | 'choco-brownie'
  | 'vanilla'
  | 'strawberry'
  | 'mint-choco-chip'
  | 'cookies-cream'

export interface Flower {
  id: FlowerId
  name: string
  emoji: string
  /** Petal colour, petal highlight, centre, stem. */
  palette: { petal: string; petalLight: string; center: string; stem: string }
}

export interface IceCream {
  id: IceCreamId
  name: string
  emoji: string
  /** Scoop colour, scoop highlight, cone colour, optional speck colour. */
  palette: { scoop: string; scoopLight: string; cone: string; speck?: string }
}

// Emoji are written as escapes so every source file stays pure ASCII.
export const FLOWERS: Flower[] = [
  {
    id: 'roses',
    name: 'Roses',
    emoji: '\u{1F339}',
    palette: { petal: '#d9536f', petalLight: '#ef889f', center: '#a8324c', stem: '#6f9a6b' },
  },
  {
    id: 'tulips',
    name: 'Tulips',
    emoji: '\u{1F337}',
    palette: { petal: '#e4739a', petalLight: '#f5a3bd', center: '#fbd9a5', stem: '#7aa874' },
  },
  {
    id: 'sunflowers',
    name: 'Sunflowers',
    emoji: '\u{1F33B}',
    palette: { petal: '#f3bb3f', petalLight: '#fbd97a', center: '#8a5a2b', stem: '#6f9a4f' },
  },
  {
    id: 'peonies',
    name: 'Peonies',
    emoji: '\u{1FAB7}',
    palette: { petal: '#ef9ab5', petalLight: '#fbc9d8', center: '#f6e3b8', stem: '#7fa87b' },
  },
  {
    id: 'orchids',
    name: 'Orchids',
    emoji: '\u{1F338}',
    palette: { petal: '#b98cd6', petalLight: '#d9b9ec', center: '#f7d98e', stem: '#78a082' },
  },
  {
    id: 'daisies',
    name: 'Daisies',
    emoji: '\u{1F33C}',
    palette: { petal: '#fdfaf3', petalLight: '#ffffff', center: '#f6c343', stem: '#7fae7a' },
  },
]

// Choco Brownie is featured, so it leads the list and is the default.
export const ICE_CREAMS: IceCream[] = [
  {
    id: 'choco-brownie',
    name: 'Choco Brownie',
    emoji: '\u{1F366}',
    palette: { scoop: '#6b4230', scoopLight: '#8f5c42', cone: '#e0ab6b', speck: '#3d2318' },
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    emoji: '\u{1F368}',
    palette: { scoop: '#f5e6c8', scoopLight: '#fdf5e4', cone: '#e0ab6b', speck: '#d9c092' },
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '\u{1F353}',
    palette: { scoop: '#f2a0b5', scoopLight: '#f9c6d4', cone: '#e0ab6b', speck: '#d4667f' },
  },
  {
    id: 'mint-choco-chip',
    name: 'Mint Choco Chip',
    emoji: '\u{1F33F}',
    palette: { scoop: '#a8ddc4', scoopLight: '#c9ecdc', cone: '#e0ab6b', speck: '#40302a' },
  },
  {
    id: 'cookies-cream',
    name: 'Cookies & Cream',
    emoji: '\u{1F36A}',
    palette: { scoop: '#efe7e0', scoopLight: '#fbf6f2', cone: '#e0ab6b', speck: '#43363a' },
  },
]

export const DEFAULT_FLOWER: FlowerId = 'roses'
export const DEFAULT_ICE_CREAM: IceCreamId = 'choco-brownie'

export function findFlower(id: string | undefined): Flower {
  return FLOWERS.find((f) => f.id === id) ?? FLOWERS[0]
}

export function findIceCream(id: string | undefined): IceCream {
  return ICE_CREAMS.find((i) => i.id === id) ?? ICE_CREAMS[0]
}

/* ------------------------------------------------------------------------
 * Themes
 *
 * The palette is the main thing that decides who a gift feels "for", so it
 * is a choice rather than a fixed pink. Each theme is a small accent ramp;
 * components reference it through CSS variables (see index.css).
 * --------------------------------------------------------------------- */

export type ThemeId = 'blush' | 'sky' | 'sage' | 'lilac' | 'amber'

export interface Theme {
  id: ThemeId
  name: string
  /** 50 -> 600, light to saturated. */
  ramp: [string, string, string, string, string, string, string]
}

export const THEMES: Theme[] = [
  {
    id: 'blush',
    name: 'Blush',
    ramp: ['#fdf4f7', '#fbe8ee', '#f7d1dd', '#f0adc2', '#e4809f', '#d15c80', '#b8436a'],
  },
  {
    id: 'sky',
    name: 'Sky',
    ramp: ['#f1f7fd', '#e2eefb', '#c5dcf5', '#9cc4ea', '#6aa3dc', '#4682c4', '#33669e'],
  },
  {
    id: 'sage',
    name: 'Sage',
    ramp: ['#f3f8f2', '#e4f0e2', '#c9e0c5', '#a3c99d', '#7cae74', '#5d9155', '#477341'],
  },
  {
    id: 'lilac',
    name: 'Lilac',
    ramp: ['#f7f4fd', '#efe8fa', '#ded1f4', '#c4afe8', '#a487d8', '#8865c2', '#6e4da6'],
  },
  {
    id: 'amber',
    name: 'Amber',
    ramp: ['#fdf7ef', '#fbedd9', '#f6dbb0', '#eec07c', '#e0a24f', '#c8832f', '#a46722'],
  },
]

export const DEFAULT_THEME: ThemeId = 'blush'

export function findTheme(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

/** Theme ramp as the CSS custom properties the components read. */
export function themeVars(theme: Theme): Record<string, string> {
  const steps = ['50', '100', '200', '300', '400', '500', '600']
  return Object.fromEntries(
    theme.ramp.map((color, i) => [`--accent-${steps[i]}`, color]),
  ) as Record<string, string>
}

/* ------------------------------------------------------------------------
 * Occasions
 *
 * Sets the headline on the reveal. Kept deliberately broad - a gift like
 * this is just as often for a friend or a parent as for a partner.
 * --------------------------------------------------------------------- */

export type OccasionId =
  | 'just-because'
  | 'birthday'
  | 'congrats'
  | 'thank-you'
  | 'thinking-of-you'
  | 'sorry'

export interface Occasion {
  id: OccasionId
  label: string
  /** Falls back to a name-less phrasing when no name was given. */
  headline: (name: string) => string
  /** Stamped on the envelope seal - a heart does not suit every occasion. */
  seal: 'heart' | 'star'
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'just-because',
    seal: 'heart',
    label: 'Just because',
    headline: (n) => (n ? `For ${n}` : 'For you'),
  },
  {
    id: 'birthday',
    seal: 'star',
    label: 'Birthday',
    headline: (n) => (n ? `Happy Birthday, ${n}` : 'Happy Birthday'),
  },
  {
    id: 'congrats',
    seal: 'star',
    label: 'Congrats',
    headline: (n) => (n ? `Congratulations, ${n}` : 'Congratulations'),
  },
  {
    id: 'thank-you',
    seal: 'heart',
    label: 'Thank you',
    headline: (n) => (n ? `Thank you, ${n}` : 'Thank you'),
  },
  {
    id: 'thinking-of-you',
    seal: 'heart',
    label: 'Thinking of you',
    headline: (n) => (n ? `Thinking of you, ${n}` : 'Thinking of you'),
  },
  {
    id: 'sorry',
    seal: 'heart',
    label: 'Sorry',
    headline: (n) => (n ? `I'm sorry, ${n}` : "I'm sorry"),
  },
]

export const DEFAULT_OCCASION: OccasionId = 'just-because'

export function findOccasion(id: string | undefined): Occasion {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0]
}

/* ------------------------------------------------------------------------
 * Custom colours
 *
 * A picked colour supplies the hue and roughly the saturation; the lightness
 * curve is imposed. That is deliberate - it is what keeps a custom ramp
 * looking like it belongs with the presets, and it guarantees the 500/600
 * steps stay dark enough to carry white button text and to read as body
 * copy, whatever someone picks. The curve below is measured from the five
 * presets rather than invented.
 * --------------------------------------------------------------------- */

const LIGHTNESS = [97, 93, 86, 76, 64, 52, 42]
const SATURATION_SCALE = [1.0, 1.02, 0.97, 0.92, 0.86, 0.75, 0.72]

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value)
}

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return [0, 0, l * 100]

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let h: number
  if (max === r) h = (g - b) / delta + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / delta + 2
  else h = (r - g) / delta + 4

  return [h * 60, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2

  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x]

  const hex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** WCAG contrast ratio against white. */
function contrastOnWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05)
}

/*
 * A fixed lightness curve is not enough on its own: luminance depends on hue,
 * so yellow at L=52% is far brighter than blue at the same L. Left unchecked,
 * picking yellow produced white-on-button contrast of 1.57, which is
 * unreadable. The two dark steps are therefore solved for a contrast floor
 * rather than taken from the curve.
 *
 * The floors match what the five presets already achieve, so custom colours
 * sit alongside them rather than looking conspicuously darker. Note that 3.0
 * is the AA bar for UI surfaces and large text, not for normal-size text -
 * raise MIN_CONTRAST_500 to 4.5 to hold the buttons to the stricter bar.
 */
const MIN_CONTRAST_500 = 3.0
const MIN_CONTRAST_600 = 4.5

/** Largest lightness at or below `maxL` that still meets `target`. */
function darkenToContrast(h: number, s: number, maxL: number, target: number): number {
  if (contrastOnWhite(hslToHex(h, s, maxL)) >= target) return maxL
  let lo = 0
  let hi = maxL
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (contrastOnWhite(hslToHex(h, s, mid)) >= target) lo = mid
    else hi = mid
  }
  return lo
}

/** Builds a full 50-600 ramp from a single picked colour. */
export function rampFromHex(hex: string): Theme['ramp'] {
  const [h, rawS] = hexToHsl(hex)

  // Below this there is no meaningful hue, so treat it as a deliberate grey
  // rather than snapping to red.
  const base = rawS < 8 ? 0 : Math.min(88, Math.max(28, rawS * 1.15))
  const satAt = (i: number) => base * SATURATION_SCALE[i]

  const l500 = darkenToContrast(h, satAt(5), LIGHTNESS[5], MIN_CONTRAST_500)
  // Keep 600 clearly darker than 500 as well as meeting its own floor.
  const l600 = Math.min(
    darkenToContrast(h, satAt(6), LIGHTNESS[6], MIN_CONTRAST_600),
    Math.max(0, l500 - 8),
  )

  const lightness = [...LIGHTNESS.slice(0, 5), l500, l600]
  return lightness.map((l, i) => hslToHex(h, satAt(i), l)) as Theme['ramp']
}

/** Accepts a preset id or a `#rrggbb` colour. */
export function resolveTheme(value: string | undefined): Theme {
  if (value && isHexColor(value)) {
    return { id: value as ThemeId, name: 'Custom', ramp: rampFromHex(value) }
  }
  return findTheme(value)
}

export const DEFAULT_CUSTOM_COLOR = '#7c9cd6'

/* ------------------------------------------------------------------------
 * Custom occasions
 *
 * A typed occasion is treated as a headline in its own right, and the name
 * is appended the same way the presets do it, so "Happy Graduation" reads
 * "Happy Graduation, Sam". The composer previews the result rather than
 * asking anyone to guess at the rule.
 * --------------------------------------------------------------------- */

export const CUSTOM_OCCASION = 'custom'

export const HEADLINE_MAX = 60

/** Preset ids plus the custom marker. */
export function isValidOccasion(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    (value === CUSTOM_OCCASION || OCCASIONS.some((o) => o.id === value))
  )
}

export function resolveHeadline(
  occasion: string,
  customHeadline: string,
  name: string,
): string {
  if (occasion !== CUSTOM_OCCASION) {
    return findOccasion(occasion).headline(name)
  }
  const text = customHeadline.trim()
  // An empty custom headline should still produce something warm.
  if (!text) return name ? `For ${name}` : 'For you'
  return name ? `${text}, ${name}` : text
}

export function resolveSeal(occasion: string): 'heart' | 'star' {
  if (occasion === CUSTOM_OCCASION) return 'heart'
  return findOccasion(occasion).seal
}
