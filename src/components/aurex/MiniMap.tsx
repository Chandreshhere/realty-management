import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Maximize2 } from 'lucide-react'
import { useData } from '../../store/store'
import { isActiveLead } from '../../lib/selectors'
import { inrCompact } from '../../lib/format'

/** Schematic (not-to-scale) positions on the 300×220 map canvas. */
export const DISTRICT_POS: Record<string, [number, number]> = {
  'MG Road': [52, 62],
  Indiranagar: [128, 64],
  Hebbal: [150, 22],
  Devanahalli: [236, 22],
  Whitefield: [254, 80],
  Jayanagar: [50, 186],
  Koramangala: [222, 110],
  'HSR Layout': [258, 196],
  'Sarjapur Road': [262, 152],
}

/**
 * The two busiest localities are drawn in the reference's two highlight slots
 * (white haze centre-left, apricot heat at the bottom), whichever they are.
 */
const SLOT_WARM: [number, number] = [100, 132]
const SLOT_HOT: [number, number] = [160, 210]

/** Where the haze, price pill and label sit relative to each highlighted cluster (reference layout). */
const HOT = { glow: [26, -44, 64], pill: [-6, -66], label: [30, -8] } as const
const WARM = { glow: [-8, -28, 40], pill: [4, -30], label: [0, 18] } as const

const MINOR = Array.from({ length: 44 }, (_, i) => i * 18 - 420)
const MAJOR = [-300, -220, -130, -40, 40, 130, 230, 320, 410]

/** Street grid drawn in SVG; no map image was supplied. */
export function StreetMap() {
  return (
    <g aria-hidden="true">
      {/* streets run past the frame so the map fills any card shape */}
      <rect x="-300" y="-200" width="900" height="620" fill="#EEEBE6" />
      <ellipse cx="226" cy="118" rx="22" ry="12" fill="#D5E1E8" />
      <ellipse cx="70" cy="140" rx="14" ry="8" fill="#D5E1E8" />
      <path d="M48 92 l30 -8 l12 18 l-28 10z" fill="#DCE6D2" />
      <rect x="196" y="40" width="26" height="16" rx="3" fill="#DCE6D2" transform="rotate(-24 209 48)" />
      <rect x="120" y="150" width="18" height="12" rx="3" fill="#DCE6D2" transform="rotate(-24 129 156)" />
      <g stroke="#FFFFFF" strokeWidth="1.3" opacity="0.95">
        {MINOR.map((o) => (
          <line key={`a${o}`} x1={o - 70} y1="380" x2={o + 210} y2="-140" />
        ))}
        {MINOR.map((o) => (
          <line key={`b${o}`} x1="-300" y1={o + 40 - 148} x2="600" y2={o + 40 + 328} />
        ))}
      </g>
      <g stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round">
        {MAJOR.map((o) => (
          <line key={`m${o}`} x1={o - 70} y1="380" x2={o + 210} y2="-140" />
        ))}
        <path d="M-300 70 C -100 50, 80 70, 150 40 S 400 110, 600 80" fill="none" />
        <path d="M-300 150 C -100 170, 90 150, 190 190 S 420 160, 600 190" fill="none" />
      </g>
      <g stroke="#E6DED2" strokeWidth="1.6" fill="none">
        <path d="M-300 70 C -100 50, 80 70, 150 40 S 400 110, 600 80" />
        <path d="M-300 150 C -100 170, 90 150, 190 190 S 420 160, 600 190" />
      </g>
      <text x="58" y="108" className="ax-map__park">
        Cubbon Park
      </text>
    </g>
  )
}

interface Props {
  district: string | null
  onDistrict: (d: string | null) => void
}

export function MiniMap({ district, onDistrict }: Props) {
  const data = useData()
  const navigate = useNavigate()
  const clusters = useMemo(() => {
    return Object.entries(DISTRICT_POS)
      .map(([name, [x, y]]) => {
        const props = data.properties.filter((p) => p.district === name && p.kind === 'Sale')
        const prices = props.map((p) => p.price)
        const demand = data.leads.filter((l) => isActiveLead(l) && l.preferredDistrict === name).length
        const range = prices.length ? (Math.min(...prices) === Math.max(...prices) ? inrCompact(prices[0]) : `${inrCompact(Math.min(...prices))} – ${inrCompact(Math.max(...prices)).slice(1)}`) : 'Rentals only'
        return { name, x, y, demand, range, listings: data.properties.filter((p) => p.district === name).length }
      })
      .sort((a, b) => b.demand - a.demand)
  }, [data])

  const [top1, top2, ...rest] = clusters
  const first = top1 && { ...top1, x: SLOT_HOT[0], y: SLOT_HOT[1] }
  const second = top2 && { ...top2, x: SLOT_WARM[0], y: SLOT_WARM[1] }
  const toggle = (name: string) => onDistrict(district === name ? null : name)

  return (
    <section className="ax-card ax-map" aria-labelledby="ax-map-title">
      <svg className="ax-map__svg" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Demand by locality">
        <defs>
          <radialGradient id="ax-glow-white">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.65" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ax-glow-apricot" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F2E3C7" stopOpacity="0.4" />
            <stop offset="0.72" stopColor="#E3BE7F" stopOpacity="0.75" />
            <stop offset="0.96" stopColor="#D9AC66" stopOpacity="0.9" />
            <stop offset="1" stopColor="#D9AC66" stopOpacity="0" />
          </radialGradient>
        </defs>
        <StreetMap />
        {rest.map((c) => (
          <text key={`l-${c.name}`} x={c.x} y={c.y - 12} className="ax-map__label" textAnchor="middle">
            {c.name.toUpperCase()}
          </text>
        ))}
        {/* busiest locality: apricot heat; runner-up: white haze */}
        {second && <circle cx={second.x + WARM.glow[0]} cy={second.y + WARM.glow[1]} r={WARM.glow[2]} fill="url(#ax-glow-white)" />}
        {first && <circle cx={first.x + HOT.glow[0]} cy={first.y + HOT.glow[1]} r={HOT.glow[2]} fill="url(#ax-glow-apricot)" />}
        {first && (
          <text x={first.x + HOT.label[0]} y={first.y + HOT.label[1]} className="ax-map__label" textAnchor="start">
            {first.name.toUpperCase()}
          </text>
        )}
        {second && (
          <text x={second.x + WARM.label[0]} y={second.y + WARM.label[1]} className="ax-map__park" textAnchor="middle">
            {second.name}
          </text>
        )}

        {rest.map((c) => (
          <g key={c.name} className={`ax-map__pin${district === c.name ? ' is-selected' : ''}`} onClick={() => toggle(c.name)} role="button" tabIndex={0} aria-label={`${c.name}: ${c.demand} active leads, ${c.listings} listings`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(c.name)}>
            <title>{`${c.name} · ${c.demand} active leads · ${c.range}`}</title>
            <circle cx={c.x} cy={c.y} r="6.5" />
            <text x={c.x} y={c.y + 2.4} textAnchor="middle">
              {c.demand}
            </text>
          </g>
        ))}

        {[second, first].filter(Boolean).map((c, i) => {
          const hot = i === 1
          const o = hot ? HOT : WARM
          const pillW = Math.max(c.range.length * 4.3 + 14, 52)
          const px = c.x + o.pill[0]
          const py = c.y + o.pill[1]
          return (
            <g key={c.name} className={`ax-map__cluster${hot ? ' is-hot' : ''}${district === c.name ? ' is-selected' : ''}`} onClick={() => toggle(c.name)} role="button" tabIndex={0} aria-label={`${c.name}: ${c.demand} active leads, ${c.range}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(c.name)}>
              <title>{`${c.name} · ${c.demand} active leads · ${c.listings} listings`}</title>
              <rect x={px - pillW / 2} y={py - 7.5} width={pillW} height="15" rx="7.5" className="ax-map__pill" />
              <text x={px} y={py + 2.3} textAnchor="middle" className="ax-map__pilltext">
                {c.range}
              </text>
              <circle cx={c.x} cy={c.y} r="9" className="ax-map__badge" />
              <text x={c.x} y={c.y + 2.3} textAnchor="middle" className="ax-map__badgetext">
                {c.demand}
              </text>
            </g>
          )
        })}
      </svg>
      <header className="ax-card__head ax-map__head">
        <h2 id="ax-map-title">Map</h2>
        <button type="button" className="ax-arrow" aria-label="Open map view of listings" onClick={() => navigate(`/aurex/listings?view=map${district ? `&district=${encodeURIComponent(district)}` : ''}`)}>
          <Maximize2 size={14} strokeWidth={1.7} />
        </button>
      </header>
      {district && (
        <button type="button" className="ax-map__clear" onClick={() => onDistrict(null)}>
          {district} · clear
        </button>
      )}
    </section>
  )
}
