# GiftLink

A tiny, static web app for sending someone flowers and ice cream as a link.

You build the gift on `/`, it gets encoded into a URL, and whoever opens that
URL gets an animated reveal. There is no backend and no database — the whole
gift lives inside the link itself.

## How it works

Two views, switched on the URL by [`resolveRoute`](src/lib/giftLink.ts):

| URL | View |
| --- | --- |
| `/` | **Composer** — pick flowers, pick ice cream, write a note, get a link |
| `/gift?data=...` | **Reveal** — the animated page you send her |

`data` is the gift object (`{flower, iceCream, message, name}`) as JSON, UTF-8
encoded, then base64url encoded. base64url rather than plain base64 so the
link never needs escaping, and UTF-8 first so accents and emoji survive —
`btoa` alone is latin1-only and would mangle them.

Decoding is defensive: a missing, truncated, or corrupted `data` param shows a
friendly "this link looks incomplete" page instead of a blank screen, and
unrecognised flower/ice-cream ids fall back to defaults rather than rendering
nothing.

A 500-character message produces a URL of roughly 770 characters, which is
comfortably inside what messaging apps and browsers accept.

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

1. Push this project to a GitHub repo.
2. In [`.do/app.yaml`](.do/app.yaml), change `repo:` to `your-user/your-repo`.
3. Create the app, either way round:

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
link you send will 404 on her phone, even though it works locally.

Pushes to `main` redeploy automatically (`deploy_on_push: true`).

## Notes on the build

- **Illustrations are inline SVG**, drawn from a per-flower palette in
  [`src/lib/gifts.ts`](src/lib/gifts.ts). No image hosting, no external
  requests — the bundle is entirely self-contained.
- **Fonts are system stacks** (`--font-serif-soft`, `--font-script` in
  [`src/index.css`](src/index.css)) rather than Google Fonts, to keep the
  no-external-requests promise. If you would rather have a specific script
  face, self-host the `.woff2` in `public/` and add an `@font-face`.
- **Reduced motion is respected** — the drifting petals stop and transitions
  collapse for anyone with that preference set.
- The reveal is **mobile-first**; it is laid out for a phone and scales up.

## Layout

```
src/
  App.tsx                  view switch
  lib/
    gifts.ts               flower + ice cream catalogue and palettes
    giftLink.ts            encode / decode / routing
  views/
    Composer.tsx           the builder
    Reveal.tsx             the animated reveal
  components/
    Bouquet.tsx            assembling bouquet
    IceCreamCone.tsx       popping cone
    PetalField.tsx         drifting background petals
    PickerCard.tsx         selectable card
    art/
      Bloom.tsx            per-flower petal geometry
      GiftIcons.tsx        small static icons for the picker cards
```
