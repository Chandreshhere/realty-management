import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'

export interface TriggerProps {
  ref: RefObject<HTMLButtonElement | null>
  onClick: () => void
  onKeyDown: (e: KeyboardEvent) => void
  'aria-haspopup': 'menu' | 'dialog'
  'aria-expanded': boolean
  'aria-controls': string
}

interface PopoverProps {
  trigger: (p: TriggerProps, open: boolean) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'start' | 'end'
  role?: 'menu' | 'dialog'
  label: string
  className?: string
  onOpenChange?: (open: boolean) => void
}

/** Anchored floating panel, portalled to <body>, closes on Escape / outside click. */
export function Popover({ trigger, children, align = 'start', role = 'dialog', label, className = '', onOpenChange }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const id = useId()

  const setOpenState = useCallback(
    (v: boolean) => {
      setOpen(v)
      onOpenChange?.(v)
    },
    [onOpenChange],
  )
  const close = useCallback(() => {
    setOpenState(false)
    triggerRef.current?.focus()
  }, [setOpenState])
  useDismiss(open, close, [triggerRef, panelRef])

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const top = r.bottom + 8
    if (align === 'end') setPos({ top, right: Math.max(window.innerWidth - r.right, 8) })
    else setPos({ top, left: Math.min(Math.max(r.left, 8), window.innerWidth - 260) })
  }, [align])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  // move focus into the panel when it opens
  useEffect(() => {
    if (!open) return
    const el = panelRef.current?.querySelector<HTMLElement>('[role=menuitem],[role=menuitemradio],button,input,select,textarea,a[href]')
    el?.focus()
  }, [open])

  const triggerProps: TriggerProps = {
    ref: triggerRef,
    onClick: () => (open ? close() : setOpenState(true)),
    onKeyDown: (e) => {
      if (e.key === 'ArrowDown' && !open) {
        e.preventDefault()
        setOpenState(true)
      }
    },
    'aria-haspopup': role,
    'aria-expanded': open,
    'aria-controls': id,
  }

  return (
    <>
      {trigger(triggerProps, open)}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role={role}
            aria-label={label}
            className={`ui-pop ${className}`}
            style={{ top: pos.top, left: pos.left, right: pos.right }}
            onKeyDown={role === 'menu' ? (e) => menuKeys(e, panelRef.current) : undefined}
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  )
}

function menuKeys(e: KeyboardEvent, panel: HTMLElement | null) {
  if (!panel) return
  const items = Array.from(panel.querySelectorAll<HTMLElement>('[role=menuitem],[role=menuitemradio]'))
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(i + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(i - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Home') {
    e.preventDefault()
    items[0]?.focus()
  } else if (e.key === 'End') {
    e.preventDefault()
    items[items.length - 1]?.focus()
  } else if (e.key === 'Tab') {
    e.preventDefault()
  }
}

export interface MenuItem {
  label: string
  hint?: string
  icon?: ReactNode
  selected?: boolean
  danger?: boolean
  onSelect: () => void
}

interface MenuProps {
  trigger: (p: TriggerProps, open: boolean) => ReactNode
  items: MenuItem[]
  label: string
  align?: 'start' | 'end'
  /** radio menus show a check on the selected item */
  radio?: boolean
  header?: ReactNode
}

export function Menu({ trigger, items, label, align, radio, header }: MenuProps) {
  return (
    <Popover trigger={trigger} role="menu" label={label} align={align} className="ui-menu">
      {(close) => (
        <>
          {header && <div className="ui-menu__head">{header}</div>}
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role={radio ? 'menuitemradio' : 'menuitem'}
              aria-checked={radio ? !!it.selected : undefined}
              className={`ui-menu__item${it.selected ? ' is-selected' : ''}${it.danger ? ' is-danger' : ''}`}
              onClick={() => {
                it.onSelect()
                close()
              }}
            >
              {it.icon && <span className="ui-menu__icon">{it.icon}</span>}
              <span className="ui-menu__label">
                {it.label}
                {it.hint && <small>{it.hint}</small>}
              </span>
              {radio && it.selected && <Check size={14} strokeWidth={2} className="ui-menu__check" />}
            </button>
          ))}
        </>
      )}
    </Popover>
  )
}
