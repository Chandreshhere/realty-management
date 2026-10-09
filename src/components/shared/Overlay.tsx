import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

function useFocusReturn(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const first = panelRef.current?.querySelector<HTMLElement>('[data-autofocus],input,select,textarea,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) closeRef.current()
      if (e.key === 'Tab' && panelRef.current) {
        // keep focus inside the overlay
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        if (!f.length) return
        const a = f[0]
        const z = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          z.focus()
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [])
  return panelRef
}

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Drawer({ title, subtitle, onClose, children, footer, wide }: Props) {
  const ref = useFocusReturn(onClose)
  const id = useId()
  return createPortal(
    <div className="ui-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`ui-drawer${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id}>
        <header className="ui-drawer__head">
          <div>
            <h2 id={id}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="ui-icon-btn" onClick={onClose} aria-label="Close panel">
            <X size={16} strokeWidth={1.7} />
          </button>
        </header>
        <div className="ui-drawer__body">{children}</div>
        {footer && <footer className="ui-drawer__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

export function Modal({ title, subtitle, onClose, children, footer }: Props) {
  const ref = useFocusReturn(onClose)
  const id = useId()
  return createPortal(
    <div className="ui-scrim is-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="ui-modal" role="dialog" aria-modal="true" aria-labelledby={id}>
        <header className="ui-drawer__head">
          <div>
            <h2 id={id}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="ui-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={16} strokeWidth={1.7} />
          </button>
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-drawer__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
