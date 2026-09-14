import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { Composer } from './views/Composer'
import { Reveal } from './views/Reveal'
import { decodeGift, resolveRoute } from './lib/giftLink'

export default function App() {
  const [route, setRoute] = useState(resolveRoute)

  // Keep the view in sync with back/forward and hash changes.
  useEffect(() => {
    const sync = () => setRoute(resolveRoute())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  // reducedMotion="user" makes every motion component below honour the OS
  // setting - the CSS media query alone does not reach Framer's JS animations.
  return (
    <MotionConfig reducedMotion="user">
      {route.view === 'reveal' ? (
        <Reveal gift={decodeGift(route.data)} />
      ) : (
        <Composer />
      )}
    </MotionConfig>
  )
}
