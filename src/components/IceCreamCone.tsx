import { motion } from 'framer-motion'
import type { IceCream } from '../lib/gifts'

interface Props {
  iceCream: IceCream
  delay?: number
}

/** Fixed speck positions so the art is stable between renders. */
const SPECKS = [
  { cx: 44, cy: 46, r: 3.2, rot: 12 },
  { cx: 62, cy: 38, r: 2.6, rot: -20 },
  { cx: 56, cy: 58, r: 3.6, rot: 34 },
  { cx: 36, cy: 62, r: 2.4, rot: -8 },
  { cx: 70, cy: 58, r: 2.9, rot: 22 },
  { cx: 50, cy: 30, r: 2.2, rot: 5 },
]

export function IceCreamCone({ iceCream, delay = 0 }: Props) {
  const { scoop, scoopLight, cone, speck } = iceCream.palette

  return (
    <svg
      viewBox="0 0 104 150"
      role="img"
      aria-label={`A ${iceCream.name.toLowerCase()} ice cream cone`}
      className="h-full w-full overflow-visible"
    >
      {/* Cone slides up from below. */}
      <motion.g
        initial={{ y: 26, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <path d="M 30 76 L 52 142 L 74 76 Z" fill={cone} />
        <path d="M 30 76 L 52 142 L 52 76 Z" fill="#000" opacity={0.07} />
        {/* Waffle lattice. */}
        <g stroke="#c98f52" strokeWidth={1.4} opacity={0.55}>
          <path d="M 36 92 L 60 84 M 40 106 L 64 98 M 45 120 L 68 112" />
          <path d="M 38 84 L 48 116 M 50 80 L 58 104" />
        </g>
        <ellipse cx="52" cy="77" rx="22" ry="5" fill="#d79a5c" />
      </motion.g>

      {/* Scoop pops in with a bounce. */}
      <motion.g
        initial={{ scale: 0, y: -14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        style={{ transformOrigin: '52px 70px' }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 12,
          delay: delay + 0.18,
        }}
      >
        <circle cx="52" cy="50" r="30" fill={scoop} />
        <path d="M 22 50 a 30 30 0 0 1 30 -30 a 30 30 0 0 0 -22 48 Z" fill={scoopLight} opacity={0.55} />
        {/* A soft melt drip over the cone lip. */}
        <path d="M 26 66 q 6 16 14 12 q -4 -8 -2 -16 Z" fill={scoop} />
        <path d="M 72 62 q -4 18 -12 14 q 5 -9 3 -18 Z" fill={scoop} />

        {speck &&
          SPECKS.map((s, i) => (
            <motion.ellipse
              key={i}
              cx={s.cx}
              cy={s.cy}
              rx={s.r}
              ry={s.r * 0.72}
              fill={speck}
              opacity={0.85}
              transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.42 + i * 0.05 }}
            />
          ))}

        {/* Highlight. */}
        <ellipse cx="41" cy="36" rx="8" ry="5.5" fill="#fff" opacity={0.28} transform="rotate(-28 41 36)" />
      </motion.g>

      {/* Cherry on top. */}
      <motion.g
        initial={{ scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        style={{ transformOrigin: '52px 20px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 11, delay: delay + 0.5 }}
      >
        <path d="M 53 16 q 4 -9 11 -10" stroke="#6f9a4f" strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx="52" cy="18" r="6.5" fill="#d9506b" />
        <circle cx="50" cy="16" r="2" fill="#fff" opacity={0.4} />
      </motion.g>
    </svg>
  )
}
