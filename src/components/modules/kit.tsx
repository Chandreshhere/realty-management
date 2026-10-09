import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Menu } from '../shared/Popover'

export function ModuleHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="mod-head">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="mod-head__actions">{actions}</div>}
    </header>
  )
}

export function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="mod-tabs" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={it.value === value} className={it.value === value ? 'is-on' : ''} onClick={() => onChange(it.value)}>
          {it.label}
          {it.count !== undefined && <span className="tnum">{it.count}</span>}
        </button>
      ))}
    </div>
  )
}

/** Pill that opens a radio menu; `null` means "any". */
export function SelectPill<T extends string>({ label, value, options, onChange, icon }: { label: string; value: T | null; options: readonly T[]; onChange: (v: T | null) => void; icon?: ReactNode }) {
  return (
    <Menu
      label={label}
      radio
      items={[{ label: `Any ${label.toLowerCase()}`, selected: value === null, onSelect: () => onChange(null) }, ...options.map((o) => ({ label: o, selected: o === value, onSelect: () => onChange(o) }))]}
      trigger={(p) => (
        <button type="button" className={`mod-pill${value ? ' is-active' : ''}`} {...p}>
          {icon}
          <span>{value ?? label}</span>
          <ChevronDown size={14} strokeWidth={1.7} />
        </button>
      )}
    />
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="mod-stat" title={hint}>
      <span>{label}</span>
      <strong className="tnum">{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  )
}
