import { motion } from 'framer-motion'

interface Props {
  /** Written on the front of the envelope, when we know it. */
  name: string
  onOpen: () => void
}

/**
 * The reveal is a sequence, and a sequence that starts on page load is one
 * the recipient half-misses while the page is still settling. Gating it
 * behind a tap means it always plays to someone who is actually watching -
 * and it makes the thing feel handed over rather than merely loaded.
 */
export function Envelope({ name, onOpen }: Props) {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.4 } }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={name ? `Open the gift for ${name}` : 'Open the gift'}
        className="rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        animate={{ y: [0, -7, 0] }}
        transition={{ y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <svg viewBox="0 0 200 140" className="h-40 w-56 sm:h-48 sm:w-72" role="img" aria-hidden>
          <rect x="8" y="24" width="184" height="108" rx="12" fill="var(--accent-100)" />
          <path d="M 8 36 L 100 96 L 192 36 L 192 46 L 100 106 L 8 46 Z" fill="var(--accent-200)" />
          {/* Flap, still sealed. */}
          <path d="M 8 36 q 0 -12 12 -12 h 160 q 12 0 12 12 L 100 96 Z" fill="var(--accent-300)" />
          {/* Wax seal. */}
          <circle cx="100" cy="72" r="17" fill="var(--accent-500)" />
          <path
            d="M100 82s-5.4-3.4-6.9-6.5a3.8 3.8 0 0 1 6.9-2.2 3.8 3.8 0 0 1 6.9 2.2C105.4 78.6 100 82 100 82z"
            fill="#fff"
            opacity={0.9}
          />
        </svg>
      </motion.button>

      <motion.p
        className="mt-5 text-center text-[13px] tracking-[0.18em] text-accent-500 uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        Tap to open
      </motion.p>

      {name && (
        <p className="font-script mt-2 text-center text-2xl text-ink">For {name}</p>
      )}
    </motion.div>
  )
}
