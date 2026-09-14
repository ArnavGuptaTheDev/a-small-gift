import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  /** Tint the petals to match the chosen flower. */
  color: string
  count?: number
}

/**
 * Slow drifting petals behind the gift. Deliberately low-contrast and
 * low-density - it should read as texture, not as a snow globe.
 */
export function PetalField({ color, count = 14 }: Props) {
  const reduceMotion = useReducedMotion()

  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: (i * 37 + 11) % 100,
        size: 9 + ((i * 13) % 12),
        duration: 16 + ((i * 7) % 12),
        delay: -((i * 5) % 18),
        drift: ((i % 5) - 2) * 22,
        spin: i % 2 ? 220 : -200,
        opacity: 0.16 + ((i % 4) * 0.05),
      })),
    [count],
  )

  if (reduceMotion) {
    // Still give a hint of texture, just without the motion.
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {petals.slice(0, 6).map((p) => (
          <span
            key={p.id}
            className="absolute rounded-[50%_0_50%_0]"
            style={{
              left: `${p.left}%`,
              top: `${(p.id * 17) % 90}%`,
              width: p.size,
              height: p.size,
              background: color,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[50%_0_50%_0]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: p.opacity,
          }}
          initial={{ y: '-12vh', x: 0, rotate: 0 }}
          animate={{ y: '112vh', x: [0, p.drift, -p.drift, 0], rotate: p.spin }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            x: { duration: p.duration / 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}
    </div>
  )
}
