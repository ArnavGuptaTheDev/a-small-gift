import { Bloom } from './Bloom'
import type { Flower, IceCream } from '../../lib/gifts'

/** Single bloom on a short stem - the picker-card version of a bouquet. */
export function FlowerIcon({ flower }: { flower: Flower }) {
  const { petal, petalLight, center, stem } = flower.palette
  return (
    <svg viewBox="0 0 60 60" aria-hidden className="h-9 w-9 sm:h-10 sm:w-10">
      <path d="M 30 30 v 24" stroke={stem} strokeWidth={3} strokeLinecap="round" />
      <path d="M 30 44 q -9 -5 -13 1 q 7 5 13 -1 Z" fill={stem} opacity={0.8} />
      <g transform="translate(0 -4)">
        <Bloom id={flower.id} x={30} y={26} petal={petal} petalLight={petalLight} center={center} />
      </g>
    </svg>
  )
}

/** Static cone, matching the animated one on the reveal. */
export function IceCreamIcon({ iceCream }: { iceCream: IceCream }) {
  const { scoop, scoopLight, cone, speck } = iceCream.palette
  return (
    <svg viewBox="0 0 60 60" aria-hidden className="h-9 w-9 sm:h-10 sm:w-10">
      <path d="M 21 32 L 30 56 L 39 32 Z" fill={cone} />
      <path d="M 21 32 L 30 56 L 30 32 Z" fill="#000" opacity={0.07} />
      <g stroke="#c98f52" strokeWidth={1} opacity={0.5}>
        <path d="M 24 39 L 34 36 M 26 46 L 36 43" />
        <path d="M 25 35 L 29 48" />
      </g>
      <ellipse cx="30" cy="32" rx="9" ry="2.4" fill="#d79a5c" />
      <circle cx="30" cy="23" r="13" fill={scoop} />
      <path d="M 17 23 a 13 13 0 0 1 13 -13 a 13 13 0 0 0 -9.5 21 Z" fill={scoopLight} opacity={0.55} />
      {speck && (
        <g fill={speck} opacity={0.85}>
          <circle cx="25" cy="20" r="1.7" />
          <circle cx="33" cy="17" r="1.4" />
          <circle cx="32" cy="27" r="1.8" />
          <circle cx="22" cy="28" r="1.3" />
        </g>
      )}
      <ellipse cx="24" cy="16" rx="3.6" ry="2.4" fill="#fff" opacity={0.3} transform="rotate(-28 24 16)" />
      <circle cx="30" cy="8" r="3" fill="#d9506b" />
      <path d="M 31 6 q 2 -4 5 -4.5" stroke="#6f9a4f" strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </svg>
  )
}
