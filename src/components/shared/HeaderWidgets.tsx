import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Building2, LayoutGrid, LogOut, RotateCcw, Search, Settings, UserRound, Users } from 'lucide-react'
import { Popover, Menu, type TriggerProps } from './Popover'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { currentUser } from '../../data/mockData'
import { inrCompact, relTime } from '../../lib/format'
import { Avatar } from './bits'

type TriggerRender = (p: TriggerProps, open: boolean) => ReactNode

/** Global search across properties, leads and agents. Enter opens the first hit. */
export function SearchPopover({ trigger }: { trigger: TriggerRender }) {
  const data = useData()
  const ui = useUI()
  const [q, setQ] = useState('')
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return { properties: data.properties.slice(0, 3), leads: data.leads.slice(0, 3), agents: [] as typeof data.agents }
    const has = (...xs: string[]) => xs.some((x) => x.toLowerCase().includes(s))
    return {
      properties: data.properties.filter((p) => has(p.title, p.address, p.type, p.project)).slice(0, 5),
      leads: data.leads.filter((l) => has(l.name, l.phone, l.email, l.source, l.preferredDistrict)).slice(0, 5),
      agents: data.agents.filter((a) => has(a.name, a.role)).slice(0, 3),
    }
  }, [q, data])

  return (
    <Popover trigger={trigger} label="Search" align="end" className="ui-search">
      {(close) => {
        const openFirst = () => {
          const p = hits.properties[0]
          const l = hits.leads[0]
          if (p) ui.open({ kind: 'property', id: p.id })
          else if (l) ui.open({ kind: 'lead', id: l.id })
          close()
        }
        return (
          <div className="ui-search__wrap">
            <label className="ui-search__field">
              <Search size={15} strokeWidth={1.7} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && openFirst()}
                placeholder="Search properties, leads, agents…"
                aria-label="Search properties, leads and agents"
              />
            </label>
            {!q && <p className="ui-menu__head">Recent</p>}
            {hits.properties.map((p) => (
              <button key={p.id} type="button" className="ui-menu__item" onClick={() => (ui.open({ kind: 'property', id: p.id }), close())}>
                <span className="ui-menu__icon">
                  <Building2 size={14} strokeWidth={1.6} />
                </span>
                <span className="ui-menu__label">
                  {p.title}
                  <small>
                    {p.district} · {inrCompact(p.price)}
                    {p.kind === 'Rent' ? '/mo' : ''}
                  </small>
                </span>
              </button>
            ))}
            {hits.leads.map((l) => (
              <button key={l.id} type="button" className="ui-menu__item" onClick={() => (ui.open({ kind: 'lead', id: l.id }), close())}>
                <span className="ui-menu__icon">
                  <UserRound size={14} strokeWidth={1.6} />
                </span>
                <span className="ui-menu__label">
                  {l.name}
                  <small>
                    {l.stage} · {l.source}
                  </small>
                </span>
              </button>
            ))}
            {hits.agents.map((a) => (
              <div key={a.id} className="ui-menu__item">
                <span className="ui-menu__icon">
                  <Users size={14} strokeWidth={1.6} />
                </span>
                <span className="ui-menu__label">
                  {a.name}
                  <small>{a.role}</small>
                </span>
              </div>
            ))}
            {q && !hits.properties.length && !hits.leads.length && !hits.agents.length && <p className="ui-empty" style={{ padding: '8px 10px' }}>No matches for “{q}”.</p>}
          </div>
        )
      }}
    </Popover>
  )
}

export function NotificationsPopover({ trigger }: { trigger: TriggerRender }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  return (
    <Popover trigger={trigger} label="Notifications" align="end" className="ui-notes">
      {(close) => (
        <div>
          <div className="ui-notes__head">
            <strong>Notifications</strong>
            <button type="button" className="ui-btn is-sm is-ghost" onClick={() => dispatch({ type: 'markNotificationsRead' })}>
              Mark all read
            </button>
          </div>
          {data.notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`ui-menu__item ui-note${n.read ? '' : ' is-unread'}`}
              onClick={() => {
                if (n.ref) ui.open(n.ref.kind === 'lead' ? { kind: 'lead', id: n.ref.id } : { kind: 'property', id: n.ref.id })
                close()
              }}
            >
              <span className="ui-menu__label">
                {n.title}
                <small>{n.body}</small>
              </span>
              <small className="ui-note__time">{relTime(n.at)}</small>
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

export const unreadCount = (n: { read: boolean }[]) => n.filter((x) => !x.read).length

/** Settings: switch layouts, reset demo data. */
export function SettingsMenu({ trigger, otherView }: { trigger: TriggerRender; otherView: { label: string; to: string } }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const ui = useUI()
  return (
    <Menu
      label="Settings"
      align="end"
      trigger={trigger}
      header="Workspace · demo data · currency INR (₹)"
      items={[
        { label: otherView.label, icon: <LayoutGrid size={14} strokeWidth={1.6} />, onSelect: () => navigate(otherView.to) },
        {
          label: 'Reset demo data',
          hint: 'Restore the original sample records',
          icon: <RotateCcw size={14} strokeWidth={1.6} />,
          onSelect: () => {
            dispatch({ type: 'reset' })
            ui.toast('Demo data restored')
          },
        },
      ]}
    />
  )
}

export function UserMenu({ trigger }: { trigger: TriggerRender }) {
  const ui = useUI()
  return (
    <Menu
      label="Account"
      align="end"
      trigger={trigger}
      header={
        <span style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--ink)' }}>
          <Avatar name={currentUser.name} initials={currentUser.initials} tint={currentUser.tint} size={30} />
          <span>
            <strong style={{ display: 'block', fontSize: 13 }}>{currentUser.name}</strong>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {currentUser.role} · {currentUser.email}
            </span>
          </span>
        </span>
      }
      items={[
        { label: 'Workspace settings', icon: <Settings size={14} strokeWidth={1.6} />, onSelect: () => ui.toast('Settings are read-only in the demo') },
        { label: 'Sign out', icon: <LogOut size={14} strokeWidth={1.6} />, onSelect: () => ui.toast('Signed out (demo)') },
      ]}
    />
  )
}

export { Bell, Search, Settings }
