import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/store'
import { dailyBarcode, dealStats } from '../../lib/selectors'
import { count, fmtShort, inrCompact, inrParts, pct } from '../../lib/format'

interface Bar {
  v: number
  strong: boolean
  label: string
}

/** Thin vertical "barcode" marks: past days light, the last week dark, projected closings light. */
function Barcode({ bars, label }: { bars: Bar[]; label: string }) {
  const max = Math.max(...bars.map((b) => b.v), 1)
  return (
    <div className="ax-barcode" role="img" aria-label={label}>
      {bars.map((b, i) => (
        <span
          key={i}
          className={b.strong ? 'is-strong' : ''}
          style={{ height: b.strong ? `${84 + (b.v / max) * 16}%` : `${40 + (b.v / max) * 12}%` }}
          title={b.label}
        />
      ))}
    </div>
  )
}

function useBars(metric: 'value' | 'count'): Bar[] {
  const data = useData()
  const past = dailyBarcode(data.deals, metric, 16, 8)
  const DAY = 86400000
  const pastBars = past.map((d) => ({
    v: d.v,
    strong: d.strong,
    label: `${fmtShort(new Date(Date.now() + d.day * DAY).toISOString())} · ${metric === 'value' ? inrCompact(d.v) : `${d.v} deal${d.v === 1 ? '' : 's'}`}`,
  }))
  // projected closings from the negotiation pipeline
  const pipeline = data.leads.filter((l) => l.stage === 'Negotiation')
  const ahead = Array.from({ length: 8 }, (_, i) => {
    const l = pipeline[i % Math.max(pipeline.length, 1)]
    const v = metric === 'value' ? (l?.budget ?? 0) * (0.5 + ((i * 7) % 5) / 10) : 1 + (i % 2)
    return { v, strong: false, label: `Projected · ${fmtShort(new Date(Date.now() + (i + 1) * DAY).toISOString())}` }
  })
  return [...pastBars, ...ahead]
}

export function RevenueCard() {
  const data = useData()
  const navigate = useNavigate()
  const s = dealStats(data.deals)
  const v = inrParts(s.revenue)
  const bars = useBars('value')
  const change = s.prevRevenue ? ((s.revenue - s.prevRevenue) / s.prevRevenue) * 100 : 0
  return (
    <article className="ax-card ax-kpi">
      <header className="ax-card__head">
        <h2>Total Revenue</h2>
        <button type="button" className="ax-arrow" onClick={() => navigate('/aurex/listings?status=Sold')} aria-label="Open sold inventory">
          <ArrowUpRight size={17} strokeWidth={1.7} />
        </button>
      </header>
      <div className="ax-kpi__foot">
        <div>
          <p className="ax-kpi__value tnum" title={`${change >= 0 ? '+' : ''}${pct(change)} vs previous 30 days`}>
            <span className="ax-cur">{v.symbol}</span> {v.amount}
          </p>
          <p className="ax-kpi__cap">This month</p>
        </div>
        <Barcode bars={bars} label="Daily closing value: past 16 days and 8 projected days" />
      </div>
    </article>
  )
}

export function DealsCard() {
  const data = useData()
  const navigate = useNavigate()
  const s = dealStats(data.deals)
  const bars = useBars('count')
  return (
    <article className="ax-card ax-kpi">
      <header className="ax-card__head">
        <h2>Completed Deals</h2>
        <button type="button" className="ax-arrow" onClick={() => navigate('/aurex/leads?stage=Won')} aria-label="Open won leads">
          <ArrowUpRight size={17} strokeWidth={1.7} />
        </button>
      </header>
      <div className="ax-kpi__foot">
        <div>
          <p className="ax-kpi__value tnum" title={`${s.prevCount} in the previous 30 days`}>
            {count(s.count)}
          </p>
          <p className="ax-kpi__cap">This month</p>
        </div>
        <Barcode bars={bars} label="Daily closings: past 16 days and 8 projected days" />
      </div>
    </article>
  )
}
