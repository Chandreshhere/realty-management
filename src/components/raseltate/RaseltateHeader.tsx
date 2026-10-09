import { Link, NavLink } from 'react-router-dom'
import { Bell, Building2, CalendarDays, ChartColumnBig, History, KeyRound, LayoutGrid, MessageCircle, Search, Workflow } from 'lucide-react'
import { NotificationsPopover, SearchPopover, UserMenu, unreadCount } from '../shared/HeaderWidgets'
import { Popover } from '../shared/Popover'
import { StripeMark } from '../shared/Logo'
import { MenuButton } from '../shared/Sidebar'
import { Avatar } from '../shared/bits'
import { BRAND, currentUser } from '../../data/mockData'
import { useData } from '../../store/store'
import { useUI } from '../../store/ui'
import { relTime } from '../../lib/format'

const nav = [
  { to: '/dashboard/raseltate', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/raseltate/leads', label: 'Leads & pipeline', icon: Workflow },
  { to: '/raseltate/visits', label: 'Site visits', icon: CalendarDays },
  { to: '/raseltate/bookings', label: 'Bookings & payments', icon: KeyRound },
  { to: '/raseltate/properties', label: 'Plot & property inventory', icon: Building2 },
  { to: '/raseltate/conversations', label: 'Conversations', icon: MessageCircle },
  { to: '/raseltate/reports', label: 'Reports', icon: ChartColumnBig },
]

export function RaseltateHeader() {
  const data = useData()
  const ui = useUI()
  const unread = unreadCount(data.notifications)
  return (
    <header className="rs-head">
      <div className="rs-head__left">
        <MenuButton className="rs-menu" />
        <Link to="/dashboard/raseltate" className="rs-brand" aria-label={`${BRAND} home`}>
          <StripeMark size={24} />
          <span>{BRAND}</span>
        </Link>
        <nav className="rs-nav" aria-label="Modules">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `rs-circle${isActive ? ' is-active' : ''}`} aria-label={label} title={label}>
              <Icon size={16} strokeWidth={1.6} />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rs-head__right">
        <SearchPopover
          trigger={(p) => (
            <button type="button" className="rs-circle" aria-label="Search" {...p}>
              <Search size={16} strokeWidth={1.6} />
            </button>
          )}
        />
        <NotificationsPopover
          trigger={(p) => (
            <button type="button" className="rs-circle" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} {...p}>
              <Bell size={16} strokeWidth={1.6} />
              {unread > 0 && <span className="rs-dot" />}
            </button>
          )}
        />
        <Popover
          label="Recent activity"
          align="end"
          className="ui-notes"
          trigger={(p) => (
            <button type="button" className="rs-circle" aria-label="Recent activity" {...p}>
              <History size={16} strokeWidth={1.6} />
            </button>
          )}
        >
          {(close) => (
            <div>
              <div className="ui-notes__head">
                <strong>Recent activity</strong>
                <button type="button" className="ui-btn is-sm is-ghost" onClick={() => (ui.open({ kind: 'activity' }), close())}>
                  View all
                </button>
              </div>
              {data.activities.slice(0, 6).map((a) => (
                <button key={a.id} type="button" className="ui-menu__item ui-note" onClick={() => (ui.open(a.ref.kind === 'lead' ? { kind: 'lead', id: a.ref.id } : { kind: 'property', id: a.ref.id }), close())}>
                  <span className="ui-menu__label">
                    {a.type}
                    <small>{a.description}</small>
                  </span>
                  <small className="ui-note__time">{relTime(a.at)}</small>
                </button>
              ))}
            </div>
          )}
        </Popover>
        <span className="rs-head__sep" aria-hidden="true" />
        <UserMenu
          trigger={(p) => (
            <button type="button" className="rs-user" aria-label="Account" {...p}>
              <Avatar name={currentUser.name} initials={currentUser.initials} tint={currentUser.tint} size={40} />
              <span className="rs-user__text">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.email}</span>
              </span>
            </button>
          )}
        />
      </div>
    </header>
  )
}
