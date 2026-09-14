import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bouquet } from '../components/Bouquet'
import { IceCreamCone } from '../components/IceCreamCone'
import { PetalField } from '../components/PetalField'
import { Envelope } from '../components/Envelope'
import { HeartBurst } from '../components/HeartBurst'
import {
  findFlower,
  findIceCream,
  resolveHeadline,
  resolveSeal,
  resolveTheme,
  themeVars,
} from '../lib/gifts'
import type { GiftPayload } from '../lib/giftLink'

interface Props {
  gift: GiftPayload | null
}

/*
 * Reveal timeline (seconds from the tap, not from page load):
 *   0.0  background wash + petals
 *   0.6  bouquet assembles
 *   1.9  ice cream pops in beside it
 *   2.8  the note fades up, hearts drift off it
 */
const T = { background: 0, bouquet: 0.6, iceCream: 1.9, note: 2.8 }

export function Reveal({ gift }: Props) {
  const [opened, setOpened] = useState(false)

  const flower = findFlower(gift?.flower)
  const iceCream = findIceCream(gift?.iceCream)
  const theme = resolveTheme(gift?.theme)
  const headline = gift
    ? resolveHeadline(gift.occasion, gift.headline, gift.name)
    : ''

  useEffect(() => {
    document.title = headline ? `${flower.emoji} ${headline}` : 'GiftLink'
  }, [flower.emoji, headline])

  if (!gift) return <Incomplete />

  return (
    <main
      style={themeVars(theme)}
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12"
    >
      <BackgroundWash petal={flower.palette.petalLight} opened={opened} />
      {opened && <PetalField color={flower.palette.petal} />}

      <AnimatePresence mode="wait">
        {!opened ? (
          <Envelope
            key="envelope"
            name={gift.name}
            seal={resolveSeal(gift.occasion)}
            onOpen={() => setOpened(true)}
          />
        ) : (
          <motion.div key="gift" className="relative z-10 flex w-full max-w-md flex-col items-center">
            {/* Bouquet + cone, side by side, sharing a baseline. */}
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              <motion.div
                className="h-44 w-44 sm:h-52 sm:w-52"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: T.bouquet }}
              >
                <Bouquet flower={flower} delay={T.bouquet} />
              </motion.div>

              <motion.div
                className="h-36 w-24 sm:h-44 sm:w-28"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: T.iceCream }}
              >
                <IceCreamCone iceCream={iceCream} delay={T.iceCream} />
              </motion.div>
            </div>

            <motion.p
              className="mt-5 text-center text-[12px] tracking-[0.18em] text-accent-500 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: T.iceCream + 0.5 }}
            >
              {flower.name} {String.fromCharCode(183)} {iceCream.name}
            </motion.p>

            {/* The note, last and slowest - it is the point of the whole thing. */}
            <motion.div
              className="relative mt-7 w-full"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: T.note, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeartBurst delay={T.note + 0.6} />

              <div className="relative z-10 rounded-[28px] border border-black/5 bg-white/85 px-6 py-7 shadow-[0_18px_50px_-24px_rgba(63,58,61,0.45)] backdrop-blur-sm sm:px-8 sm:py-9">
                <motion.h1
                  className="font-script text-center text-[2rem] leading-tight text-accent-600 sm:text-[2.4rem]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: T.note + 0.2 }}
                >
                  {headline}
                </motion.h1>

                {gift.message && (
                  <motion.p
                    className="font-serif-soft mt-4 text-center text-[17px] leading-[1.75] whitespace-pre-wrap text-ink sm:text-[18px]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: T.note + 0.45 }}
                  >
                    {gift.message}
                  </motion.p>
                )}

                {gift.from && (
                  <motion.p
                    className="font-script mt-5 text-right text-[1.5rem] leading-none text-accent-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: T.note + 0.7 }}
                  >
                    {String.fromCharCode(8212)} {gift.from}
                  </motion.p>
                )}

                <motion.div
                  className="mt-6 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: T.note + 0.9 }}
                >
                  <span className="h-px w-8 bg-accent-200" />
                  <Heart />
                  <span className="h-px w-8 bg-accent-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* Worth being able to watch it again. */}
            <motion.button
              type="button"
              onClick={() => setOpened(false)}
              className="mt-6 rounded-full px-4 py-2 text-[12px] tracking-[0.14em] text-ink-soft uppercase transition-colors hover:text-accent-600 focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: T.note + 1.4 }}
            >
              Play again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/** Soft radial wash. Present behind the envelope too, just quieter. */
function BackgroundWash({ petal, opened }: { petal: string; opened: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, delay: T.background, ease: 'easeOut' }}
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, ${petal}${opened ? '55' : '22'} 0%, transparent 55%),
                     radial-gradient(90% 60% at 80% 100%, #fdf6ea 0%, transparent 60%),
                     linear-gradient(180deg, var(--accent-50) 0%, var(--accent-100) 100%)`,
      }}
    />
  )
}

function Heart() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M12 21s-7.5-4.7-9.6-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.6 12C19.5 16.3 12 21 12 21z"
        fill="var(--accent-400)"
      />
    </svg>
  )
}

/** Shown when the data param is missing or will not decode. */
function Incomplete() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto h-24 w-24 opacity-60">
          <Bouquet flower={findFlower('daisies')} />
        </div>
        <h1 className="font-serif-soft mt-5 text-2xl text-ink">
          This link looks incomplete
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
          The gift inside it did not come through. Ask whoever sent it to share
          the link again, in full.
        </p>
        <a
          href={import.meta.env.BASE_URL}
          className="mt-6 inline-block rounded-full border border-accent-200 px-5 py-2.5 text-[14px] font-medium text-accent-600 transition-colors hover:bg-accent-50"
        >
          Make one of your own
        </a>
      </div>
    </main>
  )
}
