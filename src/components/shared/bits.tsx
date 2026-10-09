import type { CSSProperties, ReactNode } from 'react'
import { assets, cardFocus, type AssetKey } from '../../data/assetManifest'
import type { Agent, LeadScore, PropertyStatus, VisitStatus } from '../../data/types'

export function Avatar({ name, initials, tint, size = 32, ring }: { name: string; initials: string; tint: string; size?: number; ring?: boolean }) {
  return (
    <span
      className={`ui-avatar${ring ? ' has-ring' : ''}`}
      style={{ width: size, height: size, background: tint, fontSize: Math.max(size * 0.34, 9) }}
      role="img"
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  )
}

export const AgentAvatar = ({ agent, size }: { agent: Agent; size?: number }) => (
  <Avatar name={agent.name} initials={agent.initials} tint={agent.tint} size={size} />
)

/**
 * A background-free building cut-out. `sky` places it on a soft daylight
 * gradient (property cards/thumbnails); without it, it sits on the surface.
 */
export function BuildingImage({
  asset,
  sky,
  fit = 'cover',
  className = '',
  style,
  position,
  eager,
}: {
  asset: AssetKey
  sky?: boolean
  fit?: 'cover' | 'contain'
  className?: string
  style?: CSSProperties
  position?: string
  eager?: boolean
}) {
  const a = assets[asset]
  return (
    <span className={`ui-building${sky ? ' has-sky' : ''} ${className}`} style={style}>
      <img
        src={a.src}
        alt={a.alt}
        width={a.width}
        height={a.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectFit: fit, objectPosition: position ?? cardFocus[asset] }}
      />
    </span>
  )
}

const statusTone: Record<PropertyStatus, string> = {
  Available: 'ok',
  Reserved: 'warn',
  Sold: 'dark',
  Rented: 'info',
}
const statusLabel: Record<PropertyStatus, string> = {
  Available: 'Active',
  Reserved: 'Pending',
  Sold: 'Sold',
  Rented: 'Rented',
}
export const PropertyStatusPill = ({ status, raw }: { status: PropertyStatus; raw?: boolean }) => (
  <span className={`ui-status is-${statusTone[status]}`}>{raw ? status : statusLabel[status]}</span>
)

const scoreTone: Record<LeadScore, string> = { Hot: 'hot', Warm: 'warn', Cold: 'cold' }
export const ScorePill = ({ score }: { score: LeadScore }) => <span className={`ui-status is-${scoreTone[score]}`}>{score}</span>

const visitTone: Record<VisitStatus, string> = { Confirmed: 'ok', Pending: 'warn', Completed: 'dark', 'No-show': 'hot', Cancelled: 'muted' }
export const VisitPill = ({ status }: { status: VisitStatus }) => <span className={`ui-status is-${visitTone[status]}`}>{status}</span>

export function Empty({ children }: { children: ReactNode }) {
  return <p className="ui-empty">{children}</p>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ui-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
