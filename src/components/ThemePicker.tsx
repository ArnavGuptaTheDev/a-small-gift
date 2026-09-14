import { motion } from 'framer-motion'
import { DEFAULT_CUSTOM_COLOR, THEMES, isHexColor, rampFromHex } from '../lib/gifts'

interface Props {
  /** A preset theme id, or a `#rrggbb` colour. */
  value: string
  onChange: (value: string) => void
}

/** Colour swatches - the quickest way to change who the gift feels like. */
export function ThemePicker({ value, onChange }: Props) {
  const custom = isHexColor(value)
  const customColor = custom ? value : DEFAULT_CUSTOM_COLOR
  const customRamp = rampFromHex(customColor)

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

      {/* Anything else they like. The native picker is the right tool here:
          no dependency, and it is the control people already know. */}
      <motion.label
        whileTap={{ scale: 0.94 }}
        title="Pick your own colour"
        className={[
          'relative flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 transition-colors',
          'focus-within:ring-2 focus-within:ring-accent-400 focus-within:ring-offset-2',
          custom
            ? 'border-accent-300 bg-white shadow-[0_3px_14px_-6px_rgba(0,0,0,0.3)]'
            : 'border-black/5 bg-white/60 hover:bg-white',
        ].join(' ')}
      >
        <span
          className="h-6 w-6 rounded-full ring-1 ring-black/5"
          style={{
            background: custom
              ? `linear-gradient(135deg, ${customRamp[2]} 0%, ${customRamp[5]} 100%)`
              : 'conic-gradient(#e4809f, #e0a24f, #7cae74, #6aa3dc, #a487d8, #e4809f)',
          }}
        />
        <span
          className={[
            'text-[12.5px] font-medium',
            custom ? 'text-ink' : 'text-ink-soft',
          ].join(' ')}
        >
          {custom ? customColor.toUpperCase() : 'Custom'}
        </span>
        <input
          type="color"
          value={customColor}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          aria-label="Pick your own colour"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </motion.label>
    </div>
  )
}
