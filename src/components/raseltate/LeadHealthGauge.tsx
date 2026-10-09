import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useData } from '../../store/store'
import { leadHealth, weeklyPulse } from '../../lib/selectors'
import { pct } from '../../lib/format'

const R = 120
const CX = 140
const CY = 132
const arc = (from: number, to: number) => {
  // angles in degrees, 180 = left, 0 = right
  const p = (a: number) => [CX + R * Math.cos((a * Math.PI) / 180), CY - R * Math.sin((a * Math.PI) / 180)]
  const [x1, y1] = p(from)
  const [x2, y2] = p(to)
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`
}

/** Thin amber semicircle; each third is one health component with its own tooltip. */
export function LeadHealthGauge() {
  const data = useData()
  const navigate = useNavigate()
  const h = leadHealth(data)
  const pulse = weeklyPulse(data.deals)
  const [q, setQ] = useState(3)
  const quarter = pulse.quarters[q]
  const prev = pulse.quarters[q - 1]
  const delta = prev ? quarter.rate - prev.rate : 0
  const maxW = Math.max(...pulse.weeks, 1)
  const [hover, setHover] = useState<number | null>(null)

  // three equal segments with small gaps: 180→120, 120→60, 60→0
  const segs = [
    [178, 121],
    [119, 61],
    [59, 2],
  ]
  return (
    <article className="rs-card rs-gauge">
      <header className="rs-card__head">
        <h2>
          <ShieldCheck size={16} strokeWidth={1.6} /> Lead Health Overview
        </h2>
        <button type="button" className="rs-arrow" aria-label="Open leads" onClick={() => navigate('/raseltate/leads')}>
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </button>
      </header>

      <div className="rs-gauge__dial">
        <svg viewBox="0 0 280 140" role="img" aria-label={`Lead health ${Math.round(h.score)} percent, ${h.label}`}>
          <defs>
            <linearGradient id="rs-gauge-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#D27C34" />
              <stop offset="0.5" stopColor="#B8CC3A" />
              <stop offset="1" stopColor="#D27C34" />
            </linearGradient>
          </defs>
          <path d={arc(180, 0)} stroke="url(#rs-gauge-grad)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.28" />
          {segs.map(([a, b], i) => {
            const part = h.parts[i]
            const fillTo = a - ((a - b) * Math.min(part.value, 100)) / 100
            return (
              <g key={part.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} role="img" aria-label={`${part.label} ${pct(part.value, 0)}`}>
                <path d={arc(a, b)} stroke="transparent" strokeWidth="22" fill="none" />
                <path d={arc(a, fillTo)} stroke="url(#rs-gauge-grad)" strokeWidth={hover === i ? 8 : 6} fill="none" strokeLinecap="round" className="rs-gauge__seg" />
              </g>
            )
          })}
        </svg>
        <div className="rs-gauge__center">
          {hover === null ? (
            <>
              <p className="rs-gauge__cap">Lead health score</p>
              <p className="rs-gauge__value tnum">{Math.round(h.score)}%</p>
              <p className="rs-gauge__sub">{h.label}</p>
            </>
          ) : (
            <>
              <p className="rs-gauge__cap">{h.parts[hover].label}</p>
              <p className="rs-gauge__value tnum">{pct(h.parts[hover].value, 0)}</p>
              <p className="rs-gauge__sub">{h.parts[hover].hint}</p>
            </>
          )}
        </div>
      </div>

      <dl className="rs-gauge__stats">
        {h.parts.map((p) => (
          <div key={p.label} title={p.hint}>
            <dt>{p.label}</dt>
            <dd className="tnum">{pct(p.value, 0)}</dd>
          </div>
        ))}
      </dl>

      <div className="rs-pulse">
        <div className="rs-pulse__num">
          <strong className="tnum">{pct(quarter.rate)}</strong>
          <span className={`tnum ${delta < 0 ? 'is-down' : 'is-up'}`}>
            {delta >= 0 ? '+' : '−'}
            {Math.abs(delta).toFixed(1)}% {delta < 0 ? '▾' : '▴'}
          </span>
        </div>
        <div className="rs-pulse__chart">
          <div className="rs-pulse__q" role="tablist" aria-label="Quarter">
            {pulse.quarters.map((qq, i) => (
              <button key={qq.label} type="button" role="tab" aria-selected={i === q} className={i === q ? 'is-on' : ''} onClick={() => setQ(i)}>
                {qq.label}
              </button>
            ))}
          </div>
          <div className="rs-pulse__bars" aria-label={`Weekly closings, ${quarter.label} highlighted`} role="img">
            {pulse.weeks.map((w, i) => (
              <span key={i} className={i >= quarter.start && i < quarter.end ? 'is-on' : ''} style={{ height: `${30 + (w / maxW) * 70}%` }} />
            ))}
          </div>
          <div className="rs-pulse__range" style={{ left: `${(quarter.start / 52) * 100}%`, width: `${(13 / 52) * 100}%` }} />
        </div>
      </div>
    </article>
  )
}
