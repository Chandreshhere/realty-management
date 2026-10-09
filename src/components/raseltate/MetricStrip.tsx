import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/store'
import { dealStats } from '../../lib/selectors'

/** Three long pills: outlined counter, label, muted description. Each drills into a filtered list. */
export function MetricStrip() {
  const data = useData()
  const navigate = useNavigate()
  const items = [
    {
      value: data.properties.length,
      label: 'Properties',
      desc: 'Portfolio tracking and listing performance',
      to: '/raseltate/properties',
    },
    {
      value: data.agents.length,
      label: 'Agents',
      desc: 'Agent activity and response monitoring',
      to: '/raseltate/reports#agents',
    },
    {
      value: dealStats(data.deals).count,
      label: 'Deals',
      desc: 'Closed transactions and deal outcomes',
      to: '/raseltate/bookings',
    },
  ]
  return (
    <section className="rs-metrics" aria-label="Key counts">
      {items.map((m) => (
        <button key={m.label} type="button" className="rs-metric" onClick={() => navigate(m.to)}>
          <span className="rs-metric__ring tnum">{m.value}</span>
          <span className="rs-metric__label">{m.label}</span>
          <span className="rs-metric__desc">{m.desc}</span>
        </button>
      ))}
    </section>
  )
}
