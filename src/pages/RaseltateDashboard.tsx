import { useCallback, useState } from 'react'
import { ScopedData } from '../store/store'
import { useUI } from '../store/ui'
import { HeroBuilding } from '../components/raseltate/HeroBuilding'
import { QuickActions } from '../components/raseltate/QuickActions'
import { MetricStrip } from '../components/raseltate/MetricStrip'
import { LeadHealthGauge } from '../components/raseltate/LeadHealthGauge'
import { EngagementChart } from '../components/raseltate/EngagementChart'
import { RecentActivityTable } from '../components/raseltate/RecentActivityTable'
import type { AppData, Property, PropertyType } from '../data/types'

const TEAM_TYPES: Record<string, PropertyType[] | 'rent' | null> = {
  'All teams': null,
  Plots: ['Plot'],
  Residential: ['Villa', 'Apartment', 'House'],
  Leasing: 'rent',
}

function scopeFor(team: string) {
  const rule = TEAM_TYPES[team]
  if (!rule) return (d: AppData) => d
  const keep = (p: Property) => (rule === 'rent' ? p.kind === 'Rent' : rule.includes(p.type))
  return (d: AppData): AppData => {
    const props = d.properties.filter(keep)
    const ids = new Set(props.map((p) => p.id))
    const leads = d.leads.filter((l) => (rule === 'rent' ? l.preferredType !== 'Plot' && l.budget < 3e6 : rule.includes(l.preferredType)))
    const leadIds = new Set(leads.map((l) => l.id))
    return {
      ...d,
      properties: props,
      leads,
      deals: d.deals.filter((x) => (rule === 'rent' ? x.kind === 'Rent' : x.kind === 'Sale')),
      activities: d.activities.filter((a) => (a.ref.kind === 'lead' ? leadIds.has(a.ref.id) : ids.has(a.ref.id))),
    }
  }
}

/** Reference 2 — operational engagement dashboard. */
export default function RaseltateDashboard() {
  const ui = useUI()
  const [team, setTeam] = useState('All teams')
  const scope = useCallback((d: AppData) => scopeFor(team)(d), [team])
  return (
    <ScopedData scope={scope}>
      <section className="rs-hero">
        <div className="rs-hero__copy">
          <p className="rs-crumbs">
            <span>Main Menu</span> <b>/</b> <span>Dashboard</span>
          </p>
          <h1>Real estate engagement</h1>
          <p className="rs-hero__desc">
            A smart dashboard providing lead engagement insights, performance metrics, and portfolio monitoring{team !== 'All teams' ? ` · ${team}` : ''}.
          </p>
        </div>
        <HeroBuilding />
        <QuickActions team={team} onTeam={setTeam} onRefresh={() => ui.toast('Synced — every lead source is up to date')} />
      </section>
      <MetricStrip />
      <section className="rs-bottom">
        <LeadHealthGauge />
        <EngagementChart />
        <RecentActivityTable />
      </section>
    </ScopedData>
  )
}
