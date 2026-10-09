import { useMemo, useState } from 'react'
import { CalendarPlus, MoreHorizontal } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, Stat, Tabs } from '../../components/modules/kit'
import { AgentAvatar, BuildingImage, VisitPill } from '../../components/shared/bits'
import { Menu } from '../../components/shared/Popover'
import { fmtDay, fmtTime, pct } from '../../lib/format'
import type { Visit, VisitStatus } from '../../data/types'

const DAY = 86400000
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export default function VisitsPage() {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [day, setDay] = useState<string | null>(null)

  const week = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const d = new Date(Date.now() + (i - 2) * DAY)
        return { key: dayKey(d), date: d, count: data.visits.filter((v) => dayKey(new Date(v.scheduledAt)) === dayKey(d)).length }
      }),
    [data.visits],
  )

  const now = Date.now()
  const rows = data.visits
    .filter((v) => (day ? dayKey(new Date(v.scheduledAt)) === day : filter === 'all' ? true : filter === 'upcoming' ? new Date(v.scheduledAt).getTime() >= now - 3 * 3600000 : new Date(v.scheduledAt).getTime() < now))
    .sort((a, b) => (filter === 'past' && !day ? b.scheduledAt.localeCompare(a.scheduledAt) : a.scheduledAt.localeCompare(b.scheduledAt)))

  const done = data.visits.filter((v) => v.status === 'Completed' || v.status === 'No-show')
  const noShow = data.visits.filter((v) => v.status === 'No-show').length
  const selfBooked = data.visits.filter((v) => v.bookedVia !== 'Agent').length

  const act = (v: Visit, status: VisitStatus) => {
    dispatch({ type: 'setVisitStatus', id: v.id, status })
    ui.toast(status === 'No-show' ? 'Marked no-show — reschedule follow-up created' : `Visit ${status.toLowerCase()}`)
  }

  return (
    <div className="mod">
      <ModuleHeader
        title="Site visits"
        subtitle="Buyers self-book from real availability, reminders go out on their own, and no-shows get a reschedule link."
        actions={
          <button type="button" className="ui-btn is-primary" onClick={() => ui.open({ kind: 'create', what: 'visit' })}>
            <CalendarPlus size={15} strokeWidth={1.8} /> Book visit
          </button>
        }
      />
      <div className="mod-stats">
        <Stat label="Upcoming" value={data.visits.filter((v) => new Date(v.scheduledAt).getTime() >= now && v.status !== 'Cancelled').length} />
        <Stat label="Self-booked" value={pct((selfBooked / Math.max(data.visits.length, 1)) * 100, 0)} hint="Booking link or AI agent" />
        <Stat label="Completed" value={data.visits.filter((v) => v.status === 'Completed').length} />
        <Stat label="No-show rate" value={pct((noShow / Math.max(done.length, 1)) * 100, 0)} />
        <Stat label="Reminders sent" value={data.visits.filter((v) => v.reminderSent).length} />
      </div>

      <div className="mod-week" role="group" aria-label="Pick a day">
        {week.map((d) => (
          <button key={d.key} type="button" aria-pressed={day === d.key} className={`${day === d.key ? 'is-on' : ''}${dayKey(new Date()) === d.key ? ' is-today' : ''}`} onClick={() => setDay(day === d.key ? null : d.key)}>
            <span>{d.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <strong className="tnum">{d.date.getDate()}</strong>
            <small>{d.count ? `${d.count} visit${d.count > 1 ? 's' : ''}` : '—'}</small>
          </button>
        ))}
      </div>

      <div className="mod-bar">
        <Tabs
          label="Range"
          value={day ? ('all' as const) : filter}
          onChange={(v) => {
            setDay(null)
            setFilter(v)
          }}
          items={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
            { value: 'all', label: 'All' },
          ]}
        />
      </div>

      <div className="mod-card">
        <div className="ui-list">
          {rows.map((v) => {
            const l = data.leads.find((x) => x.id === v.leadId)
            const p = data.properties.find((x) => x.id === v.propertyId)
            const a = data.agents.find((x) => x.id === v.agentId)
            return (
              <div key={v.id} className="ui-row mod-visit">
                <div className="mod-visit__when">
                  <strong>{fmtTime(v.scheduledAt)}</strong>
                  <small>{fmtDay(v.scheduledAt)}</small>
                </div>
                {p && <BuildingImage asset={p.photo} sky className="mod-thumb" />}
                <button type="button" className="grow" style={{ textAlign: 'left' }} onClick={() => l && ui.open({ kind: 'lead', id: l.id })}>
                  {l?.name} · {p?.title}
                  <small>
                    {v.bookedVia}
                    {v.reminderSent ? ' · reminder sent' : ''}
                    {v.notes ? ` · ${v.notes}` : ''}
                  </small>
                </button>
                {a && <AgentAvatar agent={a} size={28} />}
                <VisitPill status={v.status} />
                <Menu
                  label="Visit actions"
                  align="end"
                  items={[
                    ...(v.status === 'Pending' ? [{ label: 'Confirm', onSelect: () => act(v, 'Confirmed') }] : []),
                    { label: 'Mark completed', onSelect: () => act(v, 'Completed') },
                    { label: 'Mark no-show', onSelect: () => act(v, 'No-show') },
                    {
                      label: 'Reschedule +2 days',
                      onSelect: () => {
                        dispatch({ type: 'rescheduleVisit', id: v.id, at: new Date(new Date(v.scheduledAt).getTime() + 2 * DAY).toISOString() })
                        ui.toast('Reschedule link sent to buyer')
                      },
                    },
                    { label: 'Send reminder now', onSelect: () => ui.toast(`Reminder sent to ${l?.name} on ${l?.channel}`) },
                    { label: 'Cancel visit', danger: true, onSelect: () => act(v, 'Cancelled') },
                  ]}
                  trigger={(tp) => (
                    <button type="button" className="ui-icon-btn" aria-label="Visit actions" {...tp}>
                      <MoreHorizontal size={16} strokeWidth={1.7} />
                    </button>
                  )}
                />
              </div>
            )
          })}
          {!rows.length && <p className="ui-empty">No visits in this range.</p>}
        </div>
      </div>
    </div>
  )
}
