import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ChartNoAxesColumn } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../../store/store'
import { isActiveLead, monthlyEngagement } from '../../lib/selectors'
import { pct } from '../../lib/format'

type Metric = 'conversion' | 'visitRate' | 'enquiries'

/** Three KPI headlines that double as the chart's metric switch, over thin amber monthly bars. */
export function EngagementChart() {
  const data = useData()
  const navigate = useNavigate()
  const [metric, setMetric] = useState<Metric>('conversion')
  const months = monthlyEngagement(data)
  const totals = months.reduce((s, m) => ({ e: s.e + m.enquiries, v: s.v + m.visits, d: s.d + m.deals }), { e: 0, v: 0, d: 0 })
  const kpis: { key: Metric; value: string; label: string }[] = [
    { key: 'conversion', value: pct((totals.d / totals.e) * 100), label: 'Avg Conversion' },
    { key: 'visitRate', value: pct((totals.v / totals.e) * 100), label: 'Visit Rate' },
    { key: 'enquiries', value: String(data.leads.filter(isActiveLead).length), label: 'Active Leads' },
  ]
  const fmt = (v: number) => (metric === 'enquiries' ? `${v} enquiries` : pct(v))

  return (
    <article className="rs-card rs-eng">
      <header className="rs-card__head">
        <h2>
          <ChartNoAxesColumn size={16} strokeWidth={1.6} /> Engagement Performance
        </h2>
        <button type="button" className="rs-arrow" aria-label="Open reports" onClick={() => navigate('/raseltate/reports')}>
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </button>
      </header>
      <div className="rs-eng__kpis" role="tablist" aria-label="Chart metric">
        {kpis.map((k) => (
          <button key={k.key} type="button" role="tab" aria-selected={metric === k.key} className={metric === k.key ? 'is-on' : ''} onClick={() => setMetric(k.key)}>
            <strong className="tnum">{k.value}</strong>
            <span>{k.label}</span>
          </button>
        ))}
      </div>
      <div className="rs-eng__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} margin={{ top: 6, right: 4, bottom: 0, left: 4 }} barCategoryGap="38%">
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12.5, fill: '#2c2c2c', fontFamily: 'Urbanist' }} interval={0} dy={6} />
            <YAxis hide domain={[0, (max: number) => max * 1.18]} />
            <Tooltip
              cursor={false}
              formatter={(v) => [fmt(Number(v)), kpis.find((k) => k.key === metric)?.label]}
              contentStyle={{ borderRadius: 12, border: 0, boxShadow: '0 10px 30px rgba(0,0,0,.12)', fontFamily: 'Urbanist', fontSize: 12 }}
            />
            <Bar dataKey={metric} fill="#CC833E" barSize={5} radius={[3, 3, 3, 3]} background={{ fill: '#ECECEC', radius: 3 }} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
