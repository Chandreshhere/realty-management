import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/store'
import { inventoryStats } from '../../lib/selectors'
import { inrParts } from '../../lib/format'

/** "Properties Sold / Properties Rented" summaries with the black, apricot and hatched bar. */
export function KpiBars() {
  const data = useData()
  const navigate = useNavigate()
  const s = inventoryStats(data.properties)
  // bar segments are inventory shares; the label columns follow the segments
  const soldPct = Math.min(Math.max((s.sold / s.total) * 100, 30), 62)
  const rentedPct = Math.max((s.rented / s.total) * 100, 12)
  const sold = inrParts(s.soldValue)
  const rented = inrParts(s.rentedValue)
  return (
    <section className="ax-stats" aria-label="Inventory summary" style={{ ['--sold' as string]: `${soldPct}%`, ['--rented' as string]: `${rentedPct}%` }}>
      <button type="button" className="ax-stat" onClick={() => navigate('/aurex/listings?status=Sold')}>
        <span className="ax-stat__label">Properties Sold</span>
        <span className="ax-stat__value tnum">
          <span className="ax-cur">{sold.symbol}</span> {sold.amount}
        </span>
        <span className="sr-only">{s.sold} units sold</span>
      </button>
      <button type="button" className="ax-stat" onClick={() => navigate('/aurex/listings?status=Rented')}>
        <span className="ax-stat__label">Properties Rented</span>
        <span className="ax-stat__value tnum">
          <span className="ax-cur">{rented.symbol}</span> {rented.amount}
        </span>
        <span className="sr-only">{s.rented} units rented, annual rent roll</span>
      </button>
      <div className="ax-bars" role="img" aria-label={`${s.sold} sold, ${s.rented} rented, ${s.available + s.reserved} still on the market`}>
        <span className="ax-bars__sold" title={`${s.sold} sold`} />
        <span className="ax-bars__rented" title={`${s.rented} rented`} />
        <span className="ax-bars__rest" title={`${s.available} available · ${s.reserved} reserved`} />
      </div>
    </section>
  )
}
