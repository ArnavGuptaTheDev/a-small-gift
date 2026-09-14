import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PickerCard } from '../components/PickerCard'
import { ThemePicker } from '../components/ThemePicker'
import { Bouquet } from '../components/Bouquet'
import { IceCreamCone } from '../components/IceCreamCone'
import { FlowerIcon, IceCreamIcon } from '../components/art/GiftIcons'
import {
  DEFAULT_FLOWER,
  DEFAULT_ICE_CREAM,
  DEFAULT_OCCASION,
  DEFAULT_THEME,
  FLOWERS,
  ICE_CREAMS,
  OCCASIONS,
  THEMES,
  findFlower,
  findIceCream,
  findTheme,
  themeVars,
  type FlowerId,
  type IceCreamId,
  type OccasionId,
  type ThemeId,
} from '../lib/gifts'
import { FROM_MAX, MESSAGE_MAX, NAME_MAX, buildGiftUrl } from '../lib/giftLink'

/** Picks a random entry, avoiding the one already selected where it can. */
function shuffle<T extends { id: string }>(list: T[], current: string): string {
  const options = list.filter((item) => item.id !== current)
  const pool = options.length ? options : list
  return pool[Math.floor(Math.random() * pool.length)].id
}

export function Composer() {
  const [flower, setFlower] = useState<FlowerId>(DEFAULT_FLOWER)
  const [iceCream, setIceCream] = useState<IceCreamId>(DEFAULT_ICE_CREAM)
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME)
  const [occasion, setOccasion] = useState<OccasionId>(DEFAULT_OCCASION)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // navigator.share is mobile-mostly, so the button only appears where it works.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const gift = useMemo(
    () => ({
      flower,
      iceCream,
      theme,
      occasion,
      message: message.trim(),
      name: name.trim(),
      from: from.trim(),
    }),
    [flower, iceCream, theme, occasion, message, name, from],
  )

  function handleCreate() {
    setLink(buildGiftUrl(gift))
    setCopied(false)
    requestAnimationFrame(() => {
      document
        .getElementById('gift-link')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  async function handleCopy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // Clipboard API needs a secure context; fall back to selecting the text.
      const input = document.getElementById('gift-link-input') as HTMLInputElement | null
      input?.select()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!link) return
    try {
      await navigator.share({ title: 'A little gift for you', url: link })
    } catch {
      // Dismissing the share sheet rejects; nothing to recover from.
    }
  }

  function handleSurprise() {
    setFlower(shuffle(FLOWERS, flower) as FlowerId)
    setIceCream(shuffle(ICE_CREAMS, iceCream) as IceCreamId)
    setTheme(shuffle(THEMES, theme) as ThemeId)
    setLink(null)
  }

  // Any edit invalidates a previously generated link.
  function invalidate<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setLink(null)
    }
  }
