import { motion } from 'framer-motion'
import type { Flower } from '../lib/gifts'
import { Bloom } from './art/Bloom'

interface Props {
  flower: Flower
  /** Delay before the bouquet starts assembling, in seconds. */
  delay?: number
}

/** Where each bloom sits, and how far it leans. */
const STEMS = [
  { x: 100, y: 74, scale: 1, rotate: 0, stemEnd: 190 },
  { x: 62, y: 92, scale: 0.82, rotate: -14, stemEnd: 192 },
  { x: 138, y: 92, scale: 0.82, rotate: 14, stemEnd: 192 },
  { x: 78, y: 122, scale: 0.66, rotate: -7, stemEnd: 194 },
  { x: 122, y: 122, scale: 0.66, rotate: 7, stemEnd: 194 },
]

export function Bouquet({ flower, delay = 0 }: Props) {
  const { petal, petalLight, center, stem } = flower.palette

  return (
    <svg
      viewBox="0 0 200 210"
      role="img"
      aria-label={`A small bouquet of ${flower.name.toLowerCase()}`}
      className="h-full w-full overflow-visible"
    >
      {/* Stems first, drawn upward from the wrap. */}
      {STEMS.map((s, i) => (
        <motion.path
          key={`stem-${i}`}
          d={`M ${s.x} ${s.y} Q ${(s.x + 100) / 2} ${(s.y + s.stemEnd) / 2} 100 ${s.stemEnd}`}
          stroke={stem}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}

      {/* A couple of leaves for weight. */}
      {[
        { d: 'M 100 150 Q 74 138 64 154 Q 84 168 100 150', rot: 0 },
        { d: 'M 100 156 Q 126 144 136 160 Q 116 174 100 156', rot: 0 },
      ].map((leaf, i) => (
        <motion.path
          key={`leaf-${i}`}
          d={leaf.d}
          fill={stem}
          opacity={0.75}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          style={{ transformOrigin: '100px 152px' }}
          transition={{ duration: 0.5, delay: delay + 0.45 + i * 0.08, ease: 'backOut' }}
        />
      ))}

      {/* Blooms pop in from the outside of the arrangement inward. */}
      {STEMS.map((s, i) => (
        <motion.g
          key={`bloom-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: s.scale, opacity: 1 }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 14,
            delay: delay + 0.35 + i * 0.09,
          }}
        >
          <g transform={`rotate(${s.rotate} ${s.x} ${s.y})`}>
            <Bloom id={flower.id} x={s.x} y={s.y} petal={petal} petalLight={petalLight} center={center} />
          </g>
        </motion.g>
      ))}

      {/* Paper wrap, last, tying it together. */}
      <motion.g
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: '100px 186px' }}
        transition={{ duration: 0.5, delay: delay + 0.9, ease: 'backOut' }}
      >
        <path d="M 72 172 L 100 206 L 128 172 Q 100 186 72 172 Z" fill="#f7e3ea" />
        <path d="M 72 172 L 100 206 L 100 186 Q 84 182 72 172 Z" fill="#eccdd9" />
        <rect x="88" y="176" width="24" height="9" rx="4.5" fill="#d99bb2" />
      </motion.g>
    </svg>
  )
}
