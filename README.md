# GiftLink

A tiny, static web app for sending someone flowers and ice cream as a link.

You build the gift on `/`, it gets encoded into a URL, and whoever opens that
URL taps an envelope and gets an animated reveal. There is no backend and no
database — the whole gift lives inside the link itself.

It is deliberately not just a Valentine's card: five colour themes and six
occasions mean the same app works for a partner, a friend, a sibling, or a
colleague who had a rough week.

## How it works

Two views, switched on the URL by [`resolveRoute`](src/lib/giftLink.ts):

| URL | View |
| --- | --- |
| `/` | **Composer** — pick flowers, pick ice cream, write a note, get a link |
| `/gift#...` | **Reveal** — the animated page you send |

The gift object (`{flower, iceCream, theme, occasion, message, name, from}`)
is serialised to JSON, UTF-8 encoded, scrambled (see below), then base64url
encoded. base64url rather than plain base64 so the link never needs escaping,
and UTF-8 first so accents and emoji survive — `btoa` alone is latin1-only and
would mangle them.

The payload rides in the **fragment**, not the query string. Fragments are
never sent in an HTTP request, so the gift stays out of the host's access
logs, out of `Referer` headers, and out of any proxy in between.

Decoding is defensive: a missing, truncated, or corrupted `data` param shows a
friendly "this link looks incomplete" page instead of a blank screen, and
unrecognised flower/ice-cream ids fall back to defaults rather than rendering
nothing.

Anything left at its default is dropped from the payload before encoding, so a
plain gift is only a 44-character blob. A 500-character message produces a URL
of roughly 770 characters, comfortably inside what messaging apps and browsers
accept.

## Hiding the message, and the limits of it

**Read this bit before relying on it.**

The message is scrambled before it goes into the link, so the link no longer
looks like base64-encoded JSON and cannot be pasted into an online decoder to
spoil the surprise. The same gift produces a different-looking blob every
time.

**This is obfuscation, not encryption.** There is no backend, so the gift has
to travel inside the link, and the recipient's browser has to decode it
unaided — which means the key ships in the public JS bundle. Anyone willing to
open devtools can recover the message. That is not a bug that can be fixed
while the app stays static and keyless; it would need either a server holding
the gift, or a passphrase shared out of band.

So: it reliably stops a message being *read by accident or at a glance*. It
will not stop someone determined.

### Shortening

`Create Gift` shows the full link immediately, then tries to shorten it in the
background. Three free, keyless services are tried in order — **TinyURL**,
**da.gd**, **spoo.me** — each picked because it needs no account, sends CORS
headers (so it is callable from a static page), and preserves the URL fragment
through the redirect, which is where the gift lives.

If all three fail, are rate-limited, or are blocked, the long link stays and
the UI says so. Nothing breaks; the long link is already unreadable on its
own. Shortening is tidiness, not secrecy — **a short link can always be
expanded back to the long one**, so it hides nothing by itself. The scrambling
is what does the work.

Two trade-offs worth knowing:

- Shortening is the **only external network call** the app makes. It sends the
  link to a third party, which stores it. What they store is the scrambled
  blob, not readable text — but it is no longer true that nothing leaves the
  browser.
- Short links from free services are **not guaranteed to live forever**. For
  something you want to keep, hold on to the long link.

To turn shortening off entirely, drop the `shortenUrl` call in
[`src/views/Composer.tsx`](src/views/Composer.tsx) — everything else works
unchanged.

## What you can put in a gift

| | |
| --- | --- |
| **Flowers** | Roses, Tulips, Sunflowers, Peonies, Orchids, Daisies |
| **Ice cream** | Choco Brownie, Vanilla, Strawberry, Mint Choco Chip, Cookies & Cream |
| **Colour** | Blush, Sky, Sage, Lilac, Amber — or any colour you pick |
| **Occasion** | Just because, Birthday, Congrats, Thank you, Thinking of you, Sorry — or write your own |
| **Note** | Up to 500 characters, plus optional *their name* and *from* |

### Custom colours

Picking your own colour supplies the hue and roughly the saturation; the
lightness curve is imposed, measured from the five presets. That is what keeps
a custom palette looking like it belongs beside the built-in ones.

The two dark steps are **solved for a contrast floor** rather than taken from
the curve, because luminance depends on hue: a fixed curve let yellow through
at **1.57:1** against white, which is unreadable. Every hue now clears 3.0:1
for `accent-500` and 4.5:1 for `accent-600`.

Those floors match what the presets themselves achieve, so custom colours are
consistent with them. Worth knowing: the presets sit at **3.11–4.48:1** for
white-on-`accent-500`, which is the AA bar for UI surfaces and large text but
*below* the 4.5:1 required for normal-size text — and the `Create Gift` and
`Copy Link` labels are normal-size. Raising `MIN_CONTRAST_500` to `4.5` in
[`src/lib/gifts.ts`](src/lib/gifts.ts) holds custom colours to the stricter
bar; the five presets are hardcoded and would need darkening by hand to match.

### Custom occasions

"Write my own" takes a headline and attaches the name the same way the presets
do, so `Happy Graduation` + `Sam` reads *"Happy Graduation, Sam"*. The composer
previews the assembled result live rather than asking you to guess the rule.
Leaving it blank still falls back to something warm rather than rendering an
empty heading.

Other bits:

- **Tap to open.** The reveal waits behind a sealed envelope. A sequence that
  starts on page load is one the recipient half-misses while the page settles;
  gating it behind a tap means it always plays to someone who is watching.
  The wax seal is a heart or a star depending on the occasion.
- **Surprise me** shuffles the flowers, ice cream and theme in one click.
- **Share** uses the native share sheet where the browser has it, falling back
  to plain copy where it does not.
- **Play again** replays the reveal from the envelope.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production bundle into dist/
npm run preview    # serve the built bundle locally
npm run typecheck  # tsc --noEmit
npm test           # round-trip tests for the link codec
```

## Deploying to DigitalOcean App Platform

This is a static site, so it runs on the **free Starter tier**.

[`.do/app.yaml`](.do/app.yaml) is already pointed at
[`ClusterOffice/a-small-gift`](https://github.com/ClusterOffice/a-small-gift)
on `main`. If you fork or rename the repo, update `repo:` to match.

1. Push this project to that repo.
2. Create the app, either way round:

   **From the CLI**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

   **From the UI** — *Apps → Create App → GitHub*, pick the repo, and App
   Platform will detect the spec. If you would rather fill it in by hand, the
   only settings that matter are:

   | Setting | Value |
   | --- | --- |
   | Resource type | Static Site |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Catchall document | `index.html` |

The catchall is the one easy thing to get wrong. Both views are served by the
same bundle, so `/gift` has to fall through to `index.html` — without it the
link you send will 404 on their phone, even though it works locally.

Pushes to `main` redeploy automatically (`deploy_on_push: true`).

## Notes on the build

- **Illustrations are inline SVG**, drawn from a per-flower palette in
  [`src/lib/gifts.ts`](src/lib/gifts.ts). No image hosting — the bundle is
  self-contained apart from the optional shortener call described above.
- **Fonts are system stacks** (`--font-serif-soft`, `--font-script` in
  [`src/index.css`](src/index.css)) rather than Google Fonts, to keep the
  no-external-requests promise. If you would rather have a specific script
  face, self-host the `.woff2` in `public/` and add an `@font-face`.
- **Reduced motion is respected** — the drifting petals stop and transitions
  collapse for anyone with that preference set.
- **Theming is runtime, not build-time.** The accent ramp lives in CSS custom
  properties that each theme overrides on a wrapper element, which is why
  `@theme inline` is used in [`src/index.css`](src/index.css) — it emits
  `var()` references rather than resolved colours.
- The reveal is **mobile-first**; it is laid out for a phone and scales up.

## Layout

```
src/
  App.tsx                  view switch
  lib/
    gifts.ts               flower + ice cream catalogue and palettes
    giftLink.ts            encode / decode / routing
    obfuscate.ts           payload scrambling (and its limits)
    shorten.ts             free keyless shortener chain
  views/
    Composer.tsx           the builder
    Reveal.tsx             the animated reveal
  components/
    Bouquet.tsx            assembling bouquet
    IceCreamCone.tsx       popping cone
    Envelope.tsx           the tap-to-open gate
    HeartBurst.tsx         hearts drifting off the note
    PetalField.tsx         drifting background petals
    PickerCard.tsx         selectable card
    ThemePicker.tsx        colour swatches
    art/
      Bloom.tsx            per-flower petal geometry
      GiftIcons.tsx        small static icons for the picker cards
```
