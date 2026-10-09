import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bot,
  Building2,
  CalendarDays,
  ChartColumnBig,
  ChevronsLeft,
  ChevronsRight,
  KeyRound,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  RotateCcw,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useData } from '../../store/store'
import { useUI } from '../../store/ui'
import { MODULE_PATHS, type Theme } from '../../lib/paths'
import { dormantLeads, isActiveLead } from '../../lib/selectors'
import { BRAND, CITY } from '../../data/mockData'
import { RoofMark, StripeMark } from './Logo'

interface Item {
  label: string
  icon: LucideIcon
  to: string
  count?: number
  alert?: boolean
}

/** Is `to` (path + optional ?tab / #hash) the current location? */
function useIsActive() {
  const { pathname, search, hash } = useLocation()
  const tab = new URLSearchParams(search).get('tab')
  return (to: string) => {
    const [pathAndQuery, toHash] = to.split('#')
    const [toPath, toQuery] = pathAndQuery.split('?')
    if (toPath !== pathname) return false
    const toTab = new URLSearchParams(toQuery ?? '').get('tab')
    if (toHash) return hash === `#${toHash}`
    if (toTab) return tab === toTab
    // the plain module link is active unless a sibling entry (tab / anchor) is
    return !(tab === 'followups' || tab === 'reactivation') && !hash
  }
}

export function Sidebar({ theme }: { theme: Theme }) {
  const data = useData()
  const ui = useUI()
  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  const isActive = useIsActive()
  const p = MODULE_PATHS[theme]
  const now = Date.now()
  const today = new Date().toDateString()

  // close the mobile drawer whenever the route changes
  useEffect(() => {
    ui.setMenuOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search, hash])

  useEffect(() => {
    if (!ui.menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && ui.setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ui])

  const groups: { label: string; items: Item[] }[] = [
    { label: 'Overview', items: [{ label: 'Dashboard', icon: LayoutGrid, to: `/dashboard/${theme}` }] },
    {
      label: 'Sales',
      items: [
        { label: 'Properties', icon: Building2, to: p.properties, count: data.properties.filter((x) => x.status === 'Available').length },
        { label: 'Leads', icon: Users, to: p.leads, count: data.leads.filter(isActiveLead).length },
        {
          label: 'Follow-ups',
          icon: ListChecks,
          to: `${p.leads}?tab=followups`,
          count: data.followUps.filter((f) => !f.done && new Date(f.dueAt).getTime() < now).length,
          alert: true,
        },
        { label: 'Site visits', icon: CalendarDays, to: p.visits, count: data.visits.filter((v) => new Date(v.scheduledAt).toDateString() === today).length },
        { label: 'Bookings', icon: KeyRound, to: p.bookings, count: data.bookings.filter((b) => b.status === 'Link sent').length },
      ],
    },
    {
      label: 'Engage',
      items: [
        { label: 'Conversations', icon: MessageCircle, to: p.messages, count: data.conversations.reduce((s, c) => s + c.unread, 0), alert: true },
        { label: 'Reactivation', icon: RotateCcw, to: `${p.leads}?tab=reactivation`, count: dormantLeads(data.leads).length },
      ],
    },
    {
      label: 'Insights',
      items: [
        { label: 'Reports', icon: ChartColumnBig, to: p.reports },
        { label: 'Agents', icon: UserRound, to: `${p.reports}#agents`, count: data.agents.length },
      ],
    },
  ]
  const aiThreads = data.conversations.filter((c) => c.aiHandling).length

  return (
    <>
      <div className={`side-scrim${ui.menuOpen ? ' is-open' : ''}`} onClick={() => ui.setMenuOpen(false)} aria-hidden="true" />
      <aside className={`side${ui.menuOpen ? ' is-open' : ''}`} aria-label="Sidebar">
        <div className="side__top">
          <Link to={`/dashboard/${theme}`} className="side__brand" aria-label={`${BRAND} workspace`}>
            <span className="side__mark">{theme === 'aurex' ? <RoofMark size={17} /> : <StripeMark size={20} />}</span>
            <span className="side__label side__ws">
              <strong>{CITY} workspace</strong>
              <small>
                {new Set(data.properties.map((x) => x.project)).size} projects · {data.agents.length} agents
              </small>
            </span>
          </Link>
          <button type="button" className="side__close" onClick={() => ui.setMenuOpen(false)} aria-label="Close menu">
            <X size={17} strokeWidth={1.7} />
          </button>
        </div>

        <nav className="side__nav" aria-label="Sections">
          {groups.map((g) => (
            <div key={g.label} className="side__group">
              <p className="side__heading">{g.label}</p>
              <ul>
                {g.items.map((it) => {
                  const active = isActive(it.to)
                  const Icon = it.icon
                  return (
                    <li key={it.label}>
                      <Link to={it.to} className={`side__item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} title={ui.collapsed ? it.label : undefined}>
                        <span className="side__icon">
                          <Icon size={17} strokeWidth={1.6} />
                          {!!it.count && it.alert && <i className="side__ping" />}
                        </span>
                        <span className="side__label">{it.label}</span>
                        {!!it.count && <span className={`side__count tnum${it.alert ? ' is-alert' : ''}`}>{it.count}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="side__foot">
          <button type="button" className="side__ai" onClick={() => navigate(p.messages)} title="AI sales agent">
            <span className="side__icon">
              <Bot size={17} strokeWidth={1.6} />
              <i className="side__live" />
            </span>
            <span className="side__label">
              <strong>AI agent live</strong>
              <small>
                Answering {aiThreads} thread{aiThreads === 1 ? '' : 's'} · 24/7
              </small>
            </span>
          </button>
          <div className="side__switch side__label" role="group" aria-label="Dashboard layout">
            <Link to="/dashboard/aurex" className={theme === 'aurex' ? 'is-on' : ''}>
              Aurex
            </Link>
            <Link to="/dashboard/raseltate" className={theme === 'raseltate' ? 'is-on' : ''}>
              Raseltate
            </Link>
          </div>
          <button type="button" className="side__collapse" onClick={() => ui.setCollapsed(!ui.collapsed)} aria-label={ui.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!ui.collapsed}>
            {ui.collapsed ? <ChevronsRight size={16} strokeWidth={1.7} /> : <ChevronsLeft size={16} strokeWidth={1.7} />}
            <span className="side__label">Collapse</span>
          </button>
        </div>
      </aside>
    </>
  )
}

/** Hamburger shown in the top bar below 1024px. */
export function MenuButton({ className = '' }: { className?: string }) {
  const ui = useUI()
  return (
    <button type="button" className={`side-toggle ${className}`} onClick={() => ui.setMenuOpen(true)} aria-label="Open menu" aria-expanded={ui.menuOpen}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </button>
  )
}
