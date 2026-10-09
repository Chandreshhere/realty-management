import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, Stat } from '../../components/modules/kit'
import { AgentAvatar } from '../../components/shared/bits'
import { SPEND_MONTHS, agentPerformance, dealStats, funnel, isActiveLead, monthlyEngagement, sourceROI } from '../../lib/selectors'
import { inrCompact, pct, secs } from '../../lib/format'
import { useTheme } from '../../lib/paths'

export default function ReportsPage() {
  const data = useData()
  const ui = useUI()
  const theme = useTheme()
  const { hash } = useLocation()
  const ink = theme === 'aurex' ? '#151515' : '#CC833E'
  const soft = theme === 'aurex' ? '#E8BB86' : '#E3C29E'
  const font = theme === 'aurex' ? 'Inter' : 'Urbanist'
  const s = dealStats(data.deals)
  const f = funnel(data.leads)
  const roi = sourceROI(data)
  const agents = agentPerformance(data).sort((a, b) => b.revenue - a.revenue)
  const months = monthlyEngagement(data, 12).map((m) => ({
    ...m,
    revenue:
      data.deals
        .filter((d) => {
          const t = new Date(d.closedAt)
          return `${t.getFullYear()}-${t.getMonth()}` === m.key
        })
        .reduce((x, d) => x + d.value, 0) / 1e7,
  }))

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const tooltip = { contentStyle: { borderRadius: 12, border: 0, boxShadow: '0 10px 30px rgba(0,0,0,.12)', fontFamily: font, fontSize: 12 } }
  const tick = { fontSize: 11.5, fill: '#8a8788', fontFamily: font }

  return (
    <div className="mod">
      <ModuleHeader title="Management reports" subtitle="Leads, visits, bookings, salesperson performance and source-wise ROI — current today, not rebuilt the night before a review." />
      <div className="mod-stats">
        <Stat label="Revenue · 30 days" value={inrCompact(s.revenue)} hint={`${inrCompact(s.prevRevenue)} the 30 days before`} />
        <Stat label="Deals · 30 days" value={s.count} />
        <Stat label="Active leads" value={data.leads.filter(isActiveLead).length} />
        <Stat label="Site visits" value={data.visits.length} />
        <Stat label="Won / lost" value={`${data.leads.filter((l) => l.stage === 'Won').length} / ${data.leads.filter((l) => l.stage === 'Lost').length}`} />
      </div>

      <div className="mod-split">
        <section className="mod-card">
          <div className="mod-card__head">
            <h2>Funnel</h2>
            <small className="mod-card__sub">Leads that reached each stage</small>
          </div>
          <div className="mod-funnel">
            {f.map((row) => (
              <div key={row.stage} className="mod-funnel__row">
                <span>{row.stage}</span>
                <span className="mod-funnel__bar">
                  <span style={{ width: `${(row.count / Math.max(f[0].count, 1)) * 100}%`, background: ink }} />
                </span>
                <strong className="tnum">{row.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mod-card">
          <div className="mod-card__head">
            <h2>Revenue by month</h2>
            <small className="mod-card__sub">₹ crore, closed deals</small>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,.06)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={tick} />
                <YAxis tickLine={false} axisLine={false} tick={tick} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,.03)' }} formatter={(v) => [`₹${Number(v).toFixed(2)} Cr`, 'Revenue']} {...tooltip} />
                <Bar dataKey="revenue" fill={ink} radius={[6, 6, 6, 6]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mod-card mod-table">
        <div className="mod-card__head">
          <h2>Source-wise ROI</h2>
          <small className="mod-card__sub">What each portal and campaign returned against what it cost — 2% brokerage on won deals vs {SPEND_MONTHS} months of spend</small>
        </div>
        <div className="mod-roi">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roi} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,.06)" />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tick={tick} interval={0} />
                <YAxis tickLine={false} axisLine={false} tick={tick} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,.03)' }} {...tooltip} />
                <Bar dataKey="leads" name="Leads" fill={soft} radius={[5, 5, 5, 5]} barSize={12} />
                <Bar dataKey="visits" name="Visits+" fill={ink} radius={[5, 5, 5, 5]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Leads</th>
                <th>Won</th>
                <th>Spend</th>
                <th>Cost / lead</th>
                <th>Brokerage</th>
                <th className="is-end">ROI</th>
              </tr>
            </thead>
            <tbody>
              {roi.map((r) => (
                <tr key={r.source}>
                  <td>{r.source}</td>
                  <td className="tnum">{r.leads}</td>
                  <td className="tnum">{r.won}</td>
                  <td className="tnum">{inrCompact(r.spend)}</td>
                  <td className="tnum">{inrCompact(Math.round(r.cpl))}</td>
                  <td className="tnum">{r.revenue ? inrCompact(r.revenue) : '—'}</td>
                  <td className="is-end tnum">{r.roi ? `${r.roi.toFixed(1)}×` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mod-card mod-table" id="agents">
        <div className="mod-card__head">
          <h2>Salesperson performance</h2>
          <small className="mod-card__sub">Who is responding, who is converting, and where leads are going cold</small>
        </div>
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Active</th>
              <th>Won</th>
              <th>Response rate</th>
              <th>Avg first reply</th>
              <th>Visits</th>
              <th>Overdue</th>
              <th className="is-end">Revenue · 30d</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.agent.id} className="is-clickable" onClick={() => ui.toast(`${a.agent.name} · ${a.agent.phone}`)}>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <AgentAvatar agent={a.agent} size={26} />
                    <span>
                      {a.agent.name}
                      <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>{a.agent.role}</small>
                    </span>
                  </span>
                </td>
                <td className="tnum">{a.active}</td>
                <td className="tnum">{a.won}</td>
                <td className="tnum">{pct(a.responseRate, 0)}</td>
                <td className="tnum">{secs(Math.round(a.avgResponse))}</td>
                <td className="tnum">{a.visits}</td>
                <td className="tnum" style={a.overdue ? { color: 'var(--hot-ink)' } : undefined}>
                  {a.overdue}
                </td>
                <td className="is-end tnum">{inrCompact(a.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
