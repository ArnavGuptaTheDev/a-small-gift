import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PickerCard } from '../components/PickerCard'
import { ThemePicker } from '../components/ThemePicker'
import { Bouquet } from '../components/Bouquet'
import { IceCreamCone } from '../components/IceCreamCone'
import { FlowerIcon, IceCreamIcon } from '../components/art/GiftIcons'
import {
  DEFAULT_FLOWER,
  DEFAULT_ICE_CREAM,
  CUSTOM_OCCASION,
  DEFAULT_OCCASION,
  DEFAULT_THEME,
  FLOWERS,
  HEADLINE_MAX,
  ICE_CREAMS,
  OCCASIONS,
  THEMES,
  findFlower,
  findIceCream,
  resolveHeadline,
  resolveTheme,
  themeVars,
  type FlowerId,
  type IceCreamId,
} from '../lib/gifts'
import { FROM_MAX, MESSAGE_MAX, NAME_MAX, buildGiftUrl } from '../lib/giftLink'
import { shortenUrl } from '../lib/shorten'

/** Picks a random entry, avoiding the one already selected where it can. */
function shuffle<T extends { id: string }>(list: T[], current: string): string {
  const options = list.filter((item) => item.id !== current)
  const pool = options.length ? options : list
  return pool[Math.floor(Math.random() * pool.length)].id
}

export function Composer() {
  const [flower, setFlower] = useState<FlowerId>(DEFAULT_FLOWER)
  const [iceCream, setIceCream] = useState<IceCreamId>(DEFAULT_ICE_CREAM)
  const [theme, setTheme] = useState<string>(DEFAULT_THEME)
  const [occasion, setOccasion] = useState<string>(DEFAULT_OCCASION)
  const [headline, setHeadline] = useState('')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [link, setLink] = useState<string | null>(null)
  const [shortening, setShortening] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // navigator.share is mobile-mostly, so the button only appears where it works.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const gift = useMemo(
    () => ({
      flower,
      iceCream,
      theme,
      occasion,
      headline: headline.trim(),
      message: message.trim(),
      name: name.trim(),
      from: from.trim(),
    }),
    [flower, iceCream, theme, occasion, headline, message, name, from],
  )

  async function handleCreate() {
    // Show the long link straight away - it works on its own, and shortening
    // is a network call that may be slow, blocked, or rate-limited.
    const longUrl = buildGiftUrl(gift)
    setLink(longUrl)
    setProvider(null)
    setCopied(false)
    setShortening(true)
    requestAnimationFrame(() => {
      document
        .getElementById('gift-link')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    const result = await shortenUrl(longUrl)
    // Guard against an edit having invalidated this link while we waited.
    setLink((current) => (current === longUrl ? result.url : current))
    setProvider(result.provider)
    setShortening(false)
  }

  async function handleCopy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Clipboard API needs a secure context; fall back to selecting the text.
      const input = document.getElementById('gift-link-input') as HTMLInputElement | null
      input?.select()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!link) return
    try {
      await navigator.share({ title: 'A little gift for you', url: link })
    } catch {
      // Dismissing the share sheet rejects; nothing to recover from.
    }
  }

  function handleSurprise() {
    setFlower(shuffle(FLOWERS, flower) as FlowerId)
    setIceCream(shuffle(ICE_CREAMS, iceCream) as IceCreamId)
    setTheme(shuffle(THEMES, theme))
    setLink(null)
    setProvider(null)
    setShortening(false)
  }

  // Any edit invalidates a previously generated link.
  function invalidate<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setLink(null)
      setProvider(null)
      setShortening(false)
    }
  }

  return (
    <main
      style={themeVars(resolveTheme(theme))}
      className="mx-auto w-full max-w-xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14"
    >
      <header className="mb-8 text-center">
        <p className="text-[11px] font-medium tracking-[0.22em] text-accent-500 uppercase">
          GiftLink
        </p>
        <h1 className="font-serif-soft mt-2 text-3xl leading-tight text-ink sm:text-4xl">
          Send someone something sweet
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Pick the flowers and the ice cream, write a note, then send the link.
        </p>
      </header>

      {/* Live preview, tinted by the chosen theme. */}
      <div
        className="mb-4 flex items-end justify-center gap-3 rounded-3xl border border-black/5 px-4 py-5"
        style={{
          background: `linear-gradient(180deg, var(--accent-50) 0%, var(--accent-100) 100%)`,
        }}
      >
        <div className="h-28 w-28 sm:h-32 sm:w-32">
          <Bouquet key={flower} flower={findFlower(flower)} />
        </div>
        <div className="h-24 w-16 sm:h-28 sm:w-20">
          <IceCreamCone key={iceCream} iceCream={findIceCream(iceCream)} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSurprise}
        className="mb-9 w-full rounded-full border border-black/5 bg-white/70 py-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Surprise me
      </button>

      <Section title="Flowers" step={1}>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {FLOWERS.map((f) => (
            <PickerCard
              key={f.id}
              groupId="flower"
              name={f.name}
              icon={<FlowerIcon flower={f} />}
              selected={flower === f.id}
              onSelect={() => invalidate(setFlower)(f.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Ice cream" step={2}>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {ICE_CREAMS.map((i) => (
            <PickerCard
              key={i.id}
              groupId="ice-cream"
              name={i.name}
              icon={<IceCreamIcon iceCream={i} />}
              featured={i.id === DEFAULT_ICE_CREAM}
              selected={iceCream === i.id}
              onSelect={() => invalidate(setIceCream)(i.id)}
            />
          ))}
        </div>
      </Section>

      <Section title="Colour" step={3}>
        <ThemePicker value={theme} onChange={invalidate(setTheme)} />
      </Section>

      <Section title="Occasion" step={4}>
        <div className="flex flex-wrap gap-2">
          {[...OCCASIONS, { id: CUSTOM_OCCASION, label: 'Write my own' }].map((o) => {
            const selected = o.id === occasion
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => invalidate(setOccasion)(o.id)}
                aria-pressed={selected}
                className={[
                  'rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none',
                  selected
                    ? 'border-accent-300 bg-accent-100 text-accent-600'
                    : 'border-black/5 bg-white/60 text-ink-soft hover:bg-white',
                ].join(' ')}
              >
                {o.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence initial={false}>
          {occasion === CUSTOM_OCCASION && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <label htmlFor="headline" className="sr-only">
                Your own occasion
              </label>
              <input
                id="headline"
                value={headline}
                onChange={(e) => invalidate(setHeadline)(e.target.value.slice(0, HEADLINE_MAX))}
                placeholder="e.g. Happy Graduation"
                className="mt-3 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 focus:border-accent-300 focus:ring-2 focus:ring-accent-200 focus:outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Showing the result beats explaining how the name gets attached. */}
        <p className="mt-3 text-[12px] text-ink-soft">
          They will see:{' '}
          <span className="font-script text-[1.15rem] text-accent-600">
            {resolveHeadline(occasion, headline, name.trim())}
          </span>
        </p>
      </Section>

      <Section title="Your note" step={5}>
        <label className="sr-only" htmlFor="message">
          Personal message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => invalidate(setMessage)(e.target.value.slice(0, MESSAGE_MAX))}
          placeholder="Write something sweet..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-black/5 bg-white px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-soft/50 focus:border-accent-300 focus:ring-2 focus:ring-accent-200 focus:outline-none"
        />
        <div className="mt-1 text-right text-[11px] text-ink-soft/70">
          {message.length}/{MESSAGE_MAX}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              Their name <span className="font-normal text-ink-soft/60">(optional)</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => invalidate(setName)(e.target.value.slice(0, NAME_MAX))}
              placeholder="e.g. Sam"
              className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 focus:border-accent-300 focus:ring-2 focus:ring-accent-200 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="from" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
              From <span className="font-normal text-ink-soft/60">(optional)</span>
            </label>
            <input
              id="from"
              value={from}
              onChange={(e) => invalidate(setFrom)(e.target.value.slice(0, FROM_MAX))}
              placeholder="your name"
              className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 focus:border-accent-300 focus:ring-2 focus:ring-accent-200 focus:outline-none"
            />
          </div>
        </div>
      </Section>

      <motion.button
        type="button"
        onClick={handleCreate}
        whileTap={{ scale: 0.98 }}
        className="mt-8 w-full rounded-full bg-accent-500 px-6 py-4 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_var(--accent-400)] transition-colors hover:bg-accent-600 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Create Gift
      </motion.button>

      <AnimatePresence>
        {link && (
          <motion.section
            id="gift-link"
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border border-accent-200 bg-white p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-[13px] font-medium text-ink">
                Your link is ready
                {shortening && (
                  <motion.span
                    className="text-[11px] font-normal text-ink-soft"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    shortening...
                  </motion.span>
                )}
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                The note is scrambled inside the link, so it cannot be read by
                looking at it.{' '}
                {shortening
                  ? 'Trying to shorten it too.'
                  : provider
                    ? `Shortened with ${provider}.`
                    : 'Shortening was unavailable, so this is the full link.'}
              </p>

              <input
                id="gift-link-input"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-3 w-full rounded-xl border border-black/5 bg-accent-50 px-3 py-2.5 font-mono text-[11px] text-ink-soft focus:outline-none"
              />

              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-w-28 flex-1 rounded-full bg-accent-500 px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-accent-600 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                {canShare && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="min-w-28 flex-1 rounded-full border border-accent-200 px-4 py-3 text-[14px] font-medium text-accent-600 transition-colors hover:bg-accent-50 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    Share
                  </button>
                )}
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-28 flex-1 rounded-full border border-accent-200 px-4 py-3 text-center text-[14px] font-medium text-accent-600 transition-colors hover:bg-accent-50 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Preview
                </a>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

function Section({
  title,
  step,
  children,
}: {
  title: string
  step: number
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-medium tracking-wide text-ink-soft">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-100 text-[11px] text-accent-600">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
