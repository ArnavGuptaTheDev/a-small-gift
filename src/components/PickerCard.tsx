import { motion } from 'framer-motion'

interface Props {
  /** Scopes the sliding selection ring to one picker group. */
  groupId: string
  name: string
  icon: React.ReactNode
  selected: boolean
  featured?: boolean
  onSelect: () => void
}

export function PickerCard({ groupId, name, icon, selected, featured, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileTap={{ scale: 0.96 }}
      className={[
        'relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3.5',
        'transition-colors duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-accent-50',
        selected
          ? 'border-accent-300 bg-white shadow-[0_4px_20px_-6px_rgba(209,92,128,0.45)]'
          : 'border-accent-100 bg-white/60 hover:border-accent-200 hover:bg-white/90',
      ].join(' ')}
    >
      {featured && !selected && (
        <span className="absolute -top-2 right-2 rounded-full bg-accent-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent-600">
          favourite
        </span>
      )}
      {icon}
      <span
        className={[
          'text-center text-[13px] leading-tight font-medium',
          selected ? 'text-accent-600' : 'text-ink-soft',
        ].join(' ')}
      >
        {name}
      </span>
      {selected && (
        <motion.span
          layoutId={`picker-selected-${groupId}`}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent-400"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
    </motion.button>
  )
}
