import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Building, ChevronDown, CircleDollarSign, Flag, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { Menu } from '../shared/Popover'
import { BuildingImage, PropertyStatusPill } from '../shared/bits'
import { DISTRICTS, PROPERTY_TYPES } from '../../data/mockData'
import { count, inrParts } from '../../lib/format'
import type { Property, PropertyStatus, PropertyType } from '../../data/types'

export const COST_BANDS = [
  { id: 'lt50', label: 'Under ₹50 L', test: (p: Property) => p.kind === 'Sale' && p.price < 5e6 },
  { id: '50to1', label: '₹50 L – ₹1 Cr', test: (p: Property) => p.kind === 'Sale' && p.price >= 5e6 && p.price < 1e7 },
  { id: '1to3', label: '₹1 Cr – ₹3 Cr', test: (p: Property) => p.kind === 'Sale' && p.price >= 1e7 && p.price < 3e7 },
  { id: 'gt3', label: 'Above ₹3 Cr', test: (p: Property) => p.kind === 'Sale' && p.price >= 3e7 },
  { id: 'rent', label: 'Rentals (per month)', test: (p: Property) => p.kind === 'Rent' },
] as const

const STATUS_LABEL: Record<PropertyStatus, string> = { Available: 'Active', Reserved: 'Pending', Sold: 'Sold', Rented: 'Rented' }
const SORTS = {
  newest: { label: 'Newest listed', fn: (a: Property, b: Property) => b.listedAt.localeCompare(a.listedAt) },
  priceDesc: { label: 'Price: high to low', fn: (a: Property, b: Property) => b.price - a.price },
  priceAsc: { label: 'Price: low to high', fn: (a: Property, b: Property) => a.price - b.price },
  views: { label: 'Most viewed', fn: (a: Property, b: Property) => b.views - a.views },
} as const

interface Props {
  district: string | null
  onDistrict: (d: string | null) => void
}

export function PropertyTable({ district, onDistrict }: Props) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const navigate = useNavigate()
  const [type, setType] = useState<PropertyType | null>(null)
  const [status, setStatus] = useState<PropertyStatus | null>(null)
  const [cost, setCost] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<keyof typeof SORTS>('views')

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    const agentName = (id: string) => data.agents.find((a) => a.id === id)?.name ?? ''
    return data.properties
      .filter((p) => !district || p.district === district)
      .filter((p) => !type || p.type === type)
      .filter((p) => !status || p.status === status)
      .filter((p) => !cost || COST_BANDS.find((b) => b.id === cost)!.test(p))
      .filter((p) => !s || [p.title, p.address, agentName(p.agentId), p.type].some((x) => x.toLowerCase().includes(s)))
      .sort(SORTS[sort].fn)
  }, [data, district, type, status, cost, q, sort])

  const filters = [
    {
      key: 'district',
      icon: <MapIcon size={15} strokeWidth={1.6} />,
      label: district ?? 'District',
      active: !!district,
      items: [{ label: 'All districts', selected: !district, onSelect: () => onDistrict(null) }, ...DISTRICTS.map((d) => ({ label: d, selected: d === district, onSelect: () => onDistrict(d) }))],
    },
    {
      key: 'type',
      icon: <Building size={15} strokeWidth={1.6} />,
      label: type ?? 'Type',
      active: !!type,
      items: [{ label: 'All types', selected: !type, onSelect: () => setType(null) }, ...PROPERTY_TYPES.map((t) => ({ label: t, selected: t === type, onSelect: () => setType(t) }))],
    },
    {
      key: 'status',
      icon: <Flag size={15} strokeWidth={1.6} />,
      label: status ? STATUS_LABEL[status] : 'Status',
      active: !!status,
      items: [
        { label: 'All statuses', selected: !status, onSelect: () => setStatus(null) },
        ...(Object.keys(STATUS_LABEL) as PropertyStatus[]).map((s) => ({ label: STATUS_LABEL[s], hint: s === 'Available' ? 'Available' : s === 'Reserved' ? 'Reserved, payment link sent' : undefined, selected: s === status, onSelect: () => setStatus(s) })),
      ],
    },
    {
      key: 'cost',
      icon: <CircleDollarSign size={15} strokeWidth={1.6} />,
      label: cost ? COST_BANDS.find((b) => b.id === cost)!.label : 'Cost',
      active: !!cost,
      items: [{ label: 'Any cost', selected: !cost, onSelect: () => setCost(null) }, ...COST_BANDS.map((b) => ({ label: b.label, selected: b.id === cost, onSelect: () => setCost(b.id) }))],
    },
  ]

  const openAll = () => {
    const qs = new URLSearchParams()
    if (district) qs.set('district', district)
    if (type) qs.set('type', type)
    if (status) qs.set('status', status)
    if (q) qs.set('q', q)
    navigate(`/aurex/listings?${qs}`)
  }

  return (
    <section className="ax-card ax-table" aria-label="Property inventory">
      <div className="ax-table__bar">
        <div className="ax-table__filters">
          {filters.map((f) => (
            <Menu
              key={f.key}
              label={`Filter by ${f.key}`}
              radio
              items={f.items}
              trigger={(p) => (
                <button type="button" className={`ax-filter${f.active ? ' is-active' : ''}`} {...p}>
                  {f.icon}
                  <span>{f.label}</span>
                  <ChevronDown size={15} strokeWidth={1.6} className="ax-filter__chev" />
                </button>
              )}
            />
          ))}
        </div>
        <div className="ax-table__tools">
          <label className="ax-search">
            <Search size={15} strokeWidth={1.7} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search properties, addresses or agents" />
          </label>
          <Menu
            label="Sort"
            align="end"
            radio
            items={(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((k) => ({ label: SORTS[k].label, selected: k === sort, onSelect: () => setSort(k) }))}
            trigger={(p) => (
              <button type="button" className="ax-arrow" aria-label="Sort" {...p}>
                <SlidersHorizontal size={16} strokeWidth={1.6} />
              </button>
            )}
          />
          <button type="button" className="ax-arrow" aria-label="Open in listings" onClick={openAll}>
            <ArrowUpRight size={17} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div className="ax-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Property name</th>
              <th scope="col">Type</th>
              <th scope="col">Agent name</th>
              <th scope="col">Cost</th>
              <th scope="col" className="is-views">
                Views
              </th>
              <th scope="col">Status</th>
              <th scope="col" className="is-end">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const agent = data.agents.find((a) => a.id === p.agentId)
              const price = inrParts(p.price)
              return (
                <tr key={p.id} onClick={() => ui.open({ kind: 'property', id: p.id })} className="is-clickable">
                  <td>
                    <div className="ax-cell-prop">
                      <BuildingImage asset={p.photo} sky className="ax-thumb" />
                      <div>
                        <button
                          type="button"
                          className="ax-cell-prop__name"
                          onClick={(e) => {
                            e.stopPropagation()
                            ui.open({ kind: 'property', id: p.id })
                          }}
                        >
                          {p.title}
                        </button>
                        <span className="ax-cell-prop__addr">{p.address}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.type}</td>
                  <td>{agent?.name}</td>
                  <td className="tnum">
                    <span className="ax-cur">{price.symbol}</span> {price.amount}
                    {p.kind === 'Rent' && <span className="ax-cur">/mo</span>}
                  </td>
                  <td className="tnum is-views">{count(p.views)} views</td>
                  <td>
                    <PropertyStatusPill status={p.status} />
                  </td>
                  <td className="is-end" onClick={(e) => e.stopPropagation()}>
                    <Menu
                      label={`Actions for ${p.title}`}
                      align="end"
                      items={[
                        { label: 'View details', onSelect: () => ui.open({ kind: 'property', id: p.id }) },
                        { label: 'Book site visit', onSelect: () => ui.open({ kind: 'create', what: 'visit', propertyId: p.id }) },
                        ...(['Available', 'Reserved', 'Sold', 'Rented'] as PropertyStatus[])
                          .filter((s) => s !== p.status && (p.kind === 'Rent' ? s !== 'Sold' : s !== 'Rented'))
                          .map((s) => ({
                            label: `Mark ${s.toLowerCase()}`,
                            onSelect: () => {
                              dispatch({ type: 'setPropertyStatus', id: p.id, status: s })
                              ui.toast(`${p.title} marked ${s.toLowerCase()}`)
                            },
                          })),
                      ]}
                      trigger={(tp) => (
                        <button type="button" className="ax-arrow ax-arrow--row" aria-label={`Actions for ${p.title}`} {...tp}>
                          <SlidersHorizontal size={15} strokeWidth={1.6} />
                        </button>
                      )}
                    />
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="ax-table__empty">
                  No properties match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
