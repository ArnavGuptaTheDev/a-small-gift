/**
 * Petal geometry for each flower type, shared by the full bouquet and the
 * small picker icons so the two never drift apart.
 */
interface BloomProps {
  id: string
  x: number
  y: number
  petal: string
  petalLight: string
  center: string
}

/** Each flower gets its own petal geometry so the types read differently. */
export function Bloom({ id, x, y, petal, petalLight, center }: BloomProps) {
  switch (id) {
    case 'roses':
      return (
        <g>
          <circle cx={x} cy={y} r={17} fill={petal} />
          <circle cx={x} cy={y} r={17} fill={petalLight} opacity={0.35} />
          <path d={`M ${x} ${y - 11} a 11 11 0 1 1 -7.8 18.8`} fill="none" stroke={center} strokeWidth={2.6} strokeLinecap="round" />
          <path d={`M ${x} ${y - 5.5} a 5.5 5.5 0 1 1 -3.9 9.4`} fill="none" stroke={center} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      )

    case 'tulips':
      return (
        <g>
          <path
            d={`M ${x - 12} ${y - 10} Q ${x - 13} ${y + 6} ${x} ${y + 15} Q ${x + 13} ${y + 6} ${x + 12} ${y - 10} L ${x + 6} ${y - 4} L ${x + 3.5} ${y - 16} L ${x} ${y - 5} L ${x - 3.5} ${y - 16} L ${x - 6} ${y - 4} Z`}
            fill={petal}
          />
          <path
            d={`M ${x - 12} ${y - 10} Q ${x - 13} ${y + 6} ${x} ${y + 15} L ${x} ${y - 5} L ${x - 3.5} ${y - 16} L ${x - 6} ${y - 4} Z`}
            fill={petalLight}
            opacity={0.7}
          />
          <path d={`M ${x} ${y - 4} v 14`} stroke={center} strokeWidth={1.6} opacity={0.7} strokeLinecap="round" />
        </g>
      )

    case 'sunflowers':
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y - 13}
              rx={4.4}
              ry={9}
              fill={i % 2 ? petal : petalLight}
              transform={`rotate(${i * 30} ${x} ${y})`}
            />
          ))}
          <circle cx={x} cy={y} r={7.5} fill={center} />
          <circle cx={x - 2} cy={y - 2} r={2.6} fill="#a9743b" opacity={0.6} />
        </g>
      )

    case 'peonies':
      return (
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={`outer-${i}`}
              cx={x}
              cy={y - 10}
              r={7.5}
              fill={petal}
              transform={`rotate(${i * 45} ${x} ${y})`}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={`inner-${i}`}
              cx={x}
              cy={y - 5.5}
              r={5.5}
              fill={petalLight}
              transform={`rotate(${i * 60 + 20} ${x} ${y})`}
            />
          ))}
          <circle cx={x} cy={y} r={4.5} fill={center} />
        </g>
      )

    case 'orchids':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={x}
              cy={y - 11}
              rx={7}
              ry={10}
              fill={petal}
              transform={`rotate(${deg} ${x} ${y})`}
            />
          ))}
          <ellipse cx={x} cy={y + 2} rx={6} ry={7} fill={petalLight} />
          <circle cx={x} cy={y} r={3.4} fill={center} />
          <path d={`M ${x - 2.6} ${y + 1} h 5.2`} stroke="#8a5fa8" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )

    case 'daisies':
    default:
      return (
        <g>
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={i}
              cx={x}
              cy={y - 11}
              rx={3.8}
              ry={8.5}
              fill={i % 2 ? petal : petalLight}
              stroke="#e3d6c6"
              strokeWidth={0.8}
              transform={`rotate(${i * 36} ${x} ${y})`}
            />
          ))}
          <circle cx={x} cy={y} r={5.6} fill={center} />
        </g>
      )
  }
}
