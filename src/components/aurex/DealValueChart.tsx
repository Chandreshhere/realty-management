import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useData } from '../../store/store'
import { avgDealSeries, dealStats, type Timeframe } from '../../lib/selectors'
import { inrCompact, inrParts } from '../../lib/format'
import { Menu } from '../shared/Popover'

const frames: Timeframe[] = ['Daily', 'Weekly', 'Monthly']

/** "Average Deal Value" — white bars with a black change pill, on a 0–N lakh axis. */
export function DealValueChart() {
  const data = useData()
  const [tf, setTf] = useState<Timeframe>('Daily')
  const series = avgDealSeries(data.deals, tf)
  const avg = inrParts(dealStats(data.deals).avg)
  // six even steps in lakhs, sized so the longest bar reaches ~90% of the axis
  const maxL = Math.max(...series.map((s) => s.value / 1e5), 1)
  const rawStep = (maxL * 1.08) / 6
  const mag = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => m * mag).find((m) => m >= rawStep) ?? rawStep
  const top = step * 6
  const ticks = Array.from({ length: 7 }, (_, i) => i * step)

  return (
    <article className="ax-card ax-dv">
      <header className="ax-card__head">
        <h2>Average Deal Value</h2>
        <Menu
          label="Timeframe"
          align="end"
          radio
          items={frames.map((f) => ({ label: f, selected: f === tf, onSelect: () => setTf(f) }))}
          trigger={(p) => (
            <button type="button" className="ax-select" {...p}>
              {tf}
              <ChevronDown size={14} strokeWidth={1.7} />
            </button>
          )}
        />
      </header>
      <p className="ax-kpi__value tnum">
        <span className="ax-cur">{avg.symbol}</span> {avg.amount}
      </p>
      <p className="ax-kpi__cap">This month</p>

      <div className="ax-dv__chart" role="img" aria-label={`Average sale value by ${tf.toLowerCase()} period, axis in ₹ lakh`}>
        <div className="ax-dv__grid" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${(t / top) * 100}%` }} />
          ))}
        </div>
        <ul className="ax-dv__rows">
          {series.map((s) => {
            const w = Math.max((s.value / 1e5 / top) * 100, 52)
            const up = s.change >= 0
            return (
              <li key={s.label} title={`${s.label}: ${inrCompact(s.value)} (${up ? '+' : ''}${s.change.toFixed(1)}%)`}>
                <span className="ax-dv__bar" style={{ width: `${w}%` }}>
                  <span className="ax-dv__label tnum">
                    <span className="sr-only">{s.label}: </span>
                    {inrCompact(s.value)}
                  </span>
                  <span className="ax-dv__chg tnum">
                    {up ? '+' : '−'}
                    {Math.abs(Math.round(s.change))}%
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="ax-dv__axis tnum" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${(t / top) * 100}%` }}>
              {t === 0 ? '00' : Number.isInteger(t) ? t : t.toFixed(1)}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
