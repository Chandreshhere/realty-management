import { Link, NavLink } from 'react-router-dom'
import { Bell, Search, Settings } from 'lucide-react'
import { NotificationsPopover, SearchPopover, SettingsMenu, UserMenu, unreadCount } from '../shared/HeaderWidgets'
import { RoofMark } from '../shared/Logo'
import { MenuButton } from '../shared/Sidebar'
import { Avatar } from '../shared/bits'
import { BRAND, currentUser } from '../../data/mockData'
import { useData } from '../../store/store'

const nav = [
  { to: '/dashboard/aurex', label: 'Dashboard', end: true },
  { to: '/aurex/listings', label: 'Listings' },
  { to: '/aurex/appointments', label: 'Appointments' },
  { to: '/aurex/messages', label: 'Messages' },
]

export function AurexHeader() {
  const data = useData()
  const unread = unreadCount(data.notifications)
  return (
    <header className="ax-head">
      <div className="ax-head__start">
        <MenuButton className="ax-menu" />
        <Link to="/dashboard/aurex" className="ax-brand" aria-label={`${BRAND} home`}>
          <span className="ax-logo">
            <RoofMark size={19} />
          </span>
          <span className="ax-brand__name">{BRAND}</span>
        </Link>
      </div>

      <nav className="ax-nav" aria-label="Main">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `ax-nav__pill${isActive ? ' is-active' : ''}`}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="ax-actions">
        <SearchPopover
          trigger={(p) => (
            <button type="button" className="ax-circle" aria-label="Search" {...p}>
              <Search size={17} strokeWidth={1.6} />
            </button>
          )}
        />
        <NotificationsPopover
          trigger={(p) => (
            <button type="button" className="ax-circle" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} {...p}>
              <Bell size={17} strokeWidth={1.6} />
              {unread > 0 && <span className="ax-dot" />}
            </button>
          )}
        />
        <SettingsMenu
          otherView={{ label: 'Switch to Raseltate layout', to: '/dashboard/raseltate' }}
          trigger={(p) => (
            <button type="button" className="ax-circle" aria-label="Settings" {...p}>
              <Settings size={17} strokeWidth={1.6} />
            </button>
          )}
        />
        <UserMenu
          trigger={(p) => (
            <button type="button" className="ax-avatar-btn" aria-label="Account" {...p}>
              <Avatar name={currentUser.name} initials={currentUser.initials} tint={currentUser.tint} size={46} />
            </button>
          )}
        />
      </div>
    </header>
  )
}
