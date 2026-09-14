import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  delay?: number
  color?: string
}

/** A handful of hearts drifting up as the note lands. Fires once. */
export function HeartBurst({ delay = 0, color = 'var(--accent-400)' }: Props) {
  const reduceMotion = useReducedMotion()

  const hearts = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        id: i,
        x: (i - 3) * 26 + (i % 2 ? 8 : -8),
        size: 11 + ((i * 5) % 9),
        rise: 110 + ((i * 23) % 60),
        duration: 2.2 + (i % 3) * 0.5,
        delay: delay + i * 0.12,
        tilt: (i % 2 ? 1 : -1) * (10 + (i % 3) * 8),
      })),
    [delay],
  )

  if (reduceMotion) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0">
      {hearts.map((h) => (
        <motion.svg
          key={h.id}
          viewBox="0 0 24 24"
          className="absolute top-0 left-1/2"
          style={{ width: h.size, height: h.size }}
          initial={{ opacity: 0, x: h.x, y: 0, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: [0, 0.85, 0.85, 0],
            y: -h.rise,
            scale: [0.4, 1, 1, 0.9],
            rotate: h.tilt,
          }}
          transition={{ duration: h.duration, delay: h.delay, ease: 'easeOut' }}
        >
          <path
            d="M12 21s-7.5-4.7-9.6-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.6 12C19.5 16.3 12 21 12 21z"
            fill={color}
          />
        </motion.svg>
      ))}
    </div>
  )
}
