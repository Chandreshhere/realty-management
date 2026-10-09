import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CalendarPlus, Download, ListPlus, MoreHorizontal, Plus, RefreshCw, RotateCcw, SlidersHorizontal, UserPlus } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { Menu, Popover } from '../shared/Popover'
import { AgentAvatar } from '../shared/bits'
import { agentPerformance } from '../../lib/selectors'
import { inrCompact, pct, secs } from '../../lib/format'

export function QuickActions({ onRefresh, team, onTeam }: { onRefresh: () => void; team: string; onTeam: (t: string) => void }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  // top five agents by revenue this month
  const top = agentPerformance(data)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const exportCsv = () => {
    const rows = [['Name', 'Phone', 'Source', 'Stage', 'Score', 'Budget', 'Locality'], ...data.leads.map((l) => [l.name, l.phone, l.source, l.stage, l.score, String(l.budget), l.preferredDistrict])]
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'realty-os-leads.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    ui.toast('Leads exported')
  }

  return (
    <div className="rs-actions">
      <Menu
        label="Add new"
        items={[
          { label: 'Property', hint: 'Add a plot or unit to inventory', icon: <Building2 size={14} strokeWidth={1.6} />, onSelect: () => ui.open({ kind: 'create', what: 'property' }) },
          { label: 'Lead', hint: 'Manual enquiry entry', icon: <UserPlus size={14} strokeWidth={1.6} />, onSelect: () => ui.open({ kind: 'create', what: 'lead' }) },
          { label: 'Site Visit', hint: 'Book into the calendar', icon: <CalendarPlus size={14} strokeWidth={1.6} />, onSelect: () => ui.open({ kind: 'create', what: 'visit' }) },
          { label: 'Follow-up', hint: 'Schedule a reminder', icon: <ListPlus size={14} strokeWidth={1.6} />, onSelect: () => ui.open({ kind: 'create', what: 'followUp' }) },
        ]}
        trigger={(p) => (
          <button type="button" className="rs-add" {...p}>
            <Plus size={16} strokeWidth={1.9} /> Add New
          </button>
        )}
      />
      <button
        type="button"
        className={`rs-circle rs-circle--lg${spinning ? ' is-spinning' : ''}`}
        aria-label="Refresh data"
        onClick={() => {
          setSpinning(true)
          onRefresh()
          window.setTimeout(() => setSpinning(false), 700)
        }}
      >
        <RefreshCw size={16} strokeWidth={1.7} />
      </button>
      <Menu
        label="More actions"
        items={[
          { label: 'Export leads (CSV)', icon: <Download size={14} strokeWidth={1.6} />, onSelect: exportCsv },
          { label: 'Open all activity', icon: <ListPlus size={14} strokeWidth={1.6} />, onSelect: () => ui.open({ kind: 'activity' }) },
          {
            label: 'Reset demo data',
            icon: <RotateCcw size={14} strokeWidth={1.6} />,
            onSelect: () => {
              dispatch({ type: 'reset' })
              ui.toast('Demo data restored')
            },
          },
        ]}
        trigger={(p) => (
          <button type="button" className="rs-circle rs-circle--lg" aria-label="More actions" {...p}>
            <MoreHorizontal size={17} strokeWidth={1.7} />
          </button>
        )}
      />
      <span className="rs-actions__sep" aria-hidden="true" />
      <ul className="rs-team" aria-label="Top agents this month">
        {top.map((t) => (
          <li key={t.agent.id}>
            <Popover
              label={t.agent.name}
              trigger={(p) => (
                <button type="button" className="rs-team__btn" aria-label={`${t.agent.name}, ${inrCompact(t.revenue)} this month`} {...p}>
                  <AgentAvatar agent={t.agent} size={44} />
                </button>
              )}
            >
              {(close) => (
                <div className="rs-agentpop">
                  <div className="ui-row" style={{ paddingTop: 4 }}>
                    <AgentAvatar agent={t.agent} size={38} />
                    <div className="grow">
                      <strong>{t.agent.name}</strong>
                      <small>{t.agent.role}</small>
                    </div>
                  </div>
                  <dl className="ui-kv" style={{ padding: '6px 4px 10px' }}>
                    <div>
                      <dt>Revenue (30d)</dt>
                      <dd>{inrCompact(t.revenue)}</dd>
                    </div>
                    <div>
                      <dt>Active leads</dt>
                      <dd>{t.active}</dd>
                    </div>
                    <div>
                      <dt>Response rate</dt>
                      <dd>{pct(t.responseRate, 0)}</dd>
                    </div>
                    <div>
                      <dt>Avg first reply</dt>
                      <dd>{secs(Math.round(t.avgResponse))}</dd>
                    </div>
                  </dl>
                  <button type="button" className="ui-btn is-sm" style={{ width: '100%' }} onClick={() => (navigate(`/raseltate/leads?owner=${t.agent.id}`), close())}>
                    View their leads
                  </button>
                </div>
              )}
            </Popover>
          </li>
        ))}
      </ul>
      <Menu
        label="Team filter"
        radio
        header="Show figures for"
        items={['All teams', 'Plots', 'Residential', 'Leasing'].map((t) => ({ label: t, selected: t === team, onSelect: () => onTeam(t) }))}
        trigger={(p) => (
          <button type="button" className="rs-circle rs-circle--lg" aria-label={`Team filter: ${team}`} {...p}>
            <SlidersHorizontal size={16} strokeWidth={1.7} />
          </button>
        )}
      />
    </div>
  )
}
