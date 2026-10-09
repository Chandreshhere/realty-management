import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Overlays } from './Overlays'
import { Sidebar } from './Sidebar'
import { useUI } from '../../store/ui'

/**
 * Full-screen app frame: left sidebar + the reference layout in the main column.
 * Sets the theme on <html> so portalled popovers and drawers share its tokens.
 */
export function ThemeFrame({ theme, children }: { theme: 'aurex' | 'raseltate'; children: ReactNode }) {
  const ui = useUI()
  const { pathname, hash } = useLocation()
  const first = useRef(true)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // new page → glide back to the top (anchors like #agents scroll themselves)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!hash) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname, hash])

  return (
    <div className={`app app--${theme}${ui.collapsed ? ' is-collapsed' : ''}`}>
      <Sidebar theme={theme} />
      <div className="app__main">{children}</div>
      <Overlays />
    </div>
  )
}
