import { ArrowUpRight, Heart, Maximize2, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { assetRoles } from '../../data/assetManifest'
import { BuildingImage } from '../shared/bits'
import { inrParts } from '../../lib/format'
import type { Property } from '../../data/types'

/** Three featured listings — the asset roles from the spec pick which ones. */
function useFeatured(): Property[] {
  const data = useData()
  const roles = [assetRoles.aurexPropertyCard1, assetRoles.aurexPropertyCard2, assetRoles.aurexPropertyCard3]
  const pool = data.properties.filter((p) => p.status === 'Available' && p.type !== 'Plot')
  const picked: Property[] = []
  for (const r of roles) {
    const p = pool.find((x) => x.photo === r && !picked.includes(x))
    if (p) picked.push(p)
  }
  for (const p of pool) if (picked.length < 3 && !picked.includes(p)) picked.push(p)
  return picked.slice(0, 3)
}

export function PropertyCard({ p }: { p: Property }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const saved = data.savedPropertyIds.includes(p.id)
  const price = inrParts(p.price)
  const facts =
    p.type === 'Plot'
      ? [`${p.sizeSqft} sq ft`, `${p.facing} facing`]
      : p.type === 'Commercial'
        ? [`${p.sizeSqft} sq ft`, `${p.baths} Washroom`, `${p.parking} Parking`]
        : [`${p.sizeSqft} sqft`, `${p.beds} Bed`, `${p.baths} Bath`, `${p.parking} Car`]
  return (
    <article className="ax-prop">
      <div className="ax-prop__media">
        <BuildingImage asset={p.photo} sky className="ax-prop__img" />
        <div className="ax-prop__tools">
          <button
            type="button"
            className={`ax-prop__heart${saved ? ' is-on' : ''}`}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${p.title} from saved` : `Save ${p.title}`}
            onClick={() => dispatch({ type: 'toggleSave', id: p.id })}
          >
            <Heart size={14} strokeWidth={1.8} />
          </button>
          <button type="button" className="ax-prop__go" aria-label={`Open ${p.title}`} onClick={() => ui.open({ kind: 'property', id: p.id })}>
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </button>
        </div>
        <div className="ax-prop__chips">
          <span className="ax-chip">
            <i className="ax-chip__dot" /> For {p.kind}
          </span>
          <span className="ax-chip">
            <Star size={9} fill="#F0722E" stroke="none" /> {p.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="ax-prop__body">
        <div className="ax-prop__row">
          <h3>{p.title}</h3>
          <p className="ax-prop__price tnum">
            <span className="ax-cur">{price.symbol}</span>
            {price.amount}
            {p.kind === 'Rent' && <small>/mo</small>}
          </p>
        </div>
        <p className="ax-prop__addr">{p.address}</p>
        <ul className="ax-prop__facts">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function PropertyGallery() {
  const featured = useFeatured()
  const navigate = useNavigate()
  return (
    <section className="ax-card ax-gallery" aria-labelledby="ax-gallery-title">
      <header className="ax-card__head">
        <h2 id="ax-gallery-title">Featured Properties</h2>
        <button type="button" className="ax-arrow" aria-label="Open all listings" onClick={() => navigate('/aurex/listings')}>
          <Maximize2 size={15} strokeWidth={1.7} />
        </button>
      </header>
      <div className="ax-gallery__grid">
        {featured.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}
