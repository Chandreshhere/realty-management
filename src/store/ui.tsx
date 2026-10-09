import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type CreateKind = 'property' | 'lead' | 'visit' | 'followUp'
export type Panel =
  | { kind: 'property'; id: string }
  | { kind: 'lead'; id: string }
  | { kind: 'activity' }
  | { kind: 'create'; what: CreateKind; leadId?: string; propertyId?: string }
  | null

export interface Toast {
  id: number
  text: string
}

interface UI {
  panel: Panel
  open: (p: Panel) => void
  close: () => void
  toasts: Toast[]
  toast: (text: string) => void
  /** desktop: icon-rail vs full sidebar */
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  /** below 1024px the sidebar is an off-canvas drawer */
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
}

const Ctx = createContext<UI | null>(null)
const COLLAPSE_KEY = 'realty-os:sidebar-collapsed'

function initialCollapsed() {
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY)
    if (saved !== null) return saved === '1'
  } catch {
    // storage unavailable
  }
  // narrow desktops start with the icon rail so the reference grid keeps its width
  return typeof window !== 'undefined' && window.innerWidth < 1440
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [collapsed, setCollapsedState] = useState(initialCollapsed)
  const [menuOpen, setMenuOpen] = useState(false)
  const toast = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v)
    try {
      localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
    } catch {
      // ignore
    }
  }, [])
  const value = useMemo<UI>(
    () => ({ panel, open: setPanel, close: () => setPanel(null), toasts, toast, collapsed, setCollapsed, menuOpen, setMenuOpen }),
    [panel, toasts, toast, collapsed, setCollapsed, menuOpen],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUI outside UIProvider')
  return v
}
