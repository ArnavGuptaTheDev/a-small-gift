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
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'just-because',
    label: 'Just because',
    headline: (n) => (n ? `For ${n}` : 'For you'),
  },
  {
    id: 'birthday',
    label: 'Birthday',
    headline: (n) => (n ? `Happy Birthday, ${n}` : 'Happy Birthday'),
  },
  {
    id: 'congrats',
    label: 'Congrats',
    headline: (n) => (n ? `Congratulations, ${n}` : 'Congratulations'),
  },
  {
    id: 'thank-you',
    label: 'Thank you',
    headline: (n) => (n ? `Thank you, ${n}` : 'Thank you'),
  },
  {
    id: 'thinking-of-you',
    label: 'Thinking of you',
    headline: (n) => (n ? `Thinking of you, ${n}` : 'Thinking of you'),
  },
  {
    id: 'sorry',
    label: 'Sorry',
    headline: (n) => (n ? `I'm sorry, ${n}` : "I'm sorry"),
  },
]

export const DEFAULT_OCCASION: OccasionId = 'just-because'

export function findOccasion(id: string | undefined): Occasion {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0]
}
