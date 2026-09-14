import { motion } from 'framer-motion'
import { THEMES, type ThemeId } from '../lib/gifts'

interface Props {
  value: ThemeId
  onChange: (id: ThemeId) => void
}

/** Colour swatches - the quickest way to change who the gift feels like. */
export function ThemePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {THEMES.map((theme) => {
        const selected = theme.id === value
        return (
          <motion.button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            aria-pressed={selected}
            aria-label={theme.name}
            title={theme.name}
            whileTap={{ scale: 0.94 }}
            className={[
              'relative flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 transition-colors',
              'focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:outline-none',
              selected
                ? 'border-accent-300 bg-white shadow-[0_3px_14px_-6px_rgba(0,0,0,0.3)]'
                : 'border-black/5 bg-white/60 hover:bg-white',
            ].join(' ')}
          >
            <span
              className="h-6 w-6 rounded-full ring-1 ring-black/5"
              style={{
                background: `linear-gradient(135deg, ${theme.ramp[2]} 0%, ${theme.ramp[5]} 100%)`,
              }}
            />
            <span
              className={[
                'text-[12.5px] font-medium',
                selected ? 'text-ink' : 'text-ink-soft',
              ].join(' ')}
            >
              {theme.name}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
