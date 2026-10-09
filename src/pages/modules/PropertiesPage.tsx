import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Heart, LayoutGrid, List, Map as MapIcon, Plus, Search, Star } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, SelectPill, Tabs } from '../../components/modules/kit'
import { BuildingImage, PropertyStatusPill } from '../../components/shared/bits'
import { DISTRICT_POS, StreetMap } from '../../components/aurex/MiniMap'
import { DISTRICTS, PROPERTY_TYPES } from '../../data/mockData'
import { COST_BANDS } from '../../components/aurex/PropertyTable'
import { count, inrCompact, inrParts } from '../../lib/format'
import type { Facing, Property, PropertyStatus, PropertyType } from '../../data/types'

const STATUSES: (PropertyStatus | 'All')[] = ['All', 'Available', 'Reserved', 'Sold', 'Rented']
const FACINGS: Facing[] = ['North', 'East', 'South', 'West', 'North-East', 'South-East']
type View = 'grid' | 'table' | 'map'

function Card({ p }: { p: Property }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const saved = data.savedPropertyIds.includes(p.id)
  const price = inrParts(p.price)
  return (
    <article className="mod-prop">
      <div className="mod-prop__media">
        <BuildingImage asset={p.photo} sky />
        <div className="mod-prop__tools">
          <button type="button" className={`mod-prop__btn${saved ? ' is-on' : ''}`} aria-pressed={saved} aria-label={saved ? `Unsave ${p.title}` : `Save ${p.title}`} onClick={() => dispatch({ type: 'toggleSave', id: p.id })}>
            <Heart size={14} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="mod-prop__btn is-dark" aria-label={`Open ${p.title}`} onClick={() => ui.open({ kind: 'property', id: p.id })}>
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mod-prop__chips">
          <PropertyStatusPill status={p.status} raw />
          <span className="ui-chip">
            <Star size={10} fill="#F0722E" stroke="none" /> {p.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <button type="button" className="mod-prop__body" onClick={() => ui.open({ kind: 'property', id: p.id })}>
        <span className="mod-prop__row">
          <strong>{p.title}</strong>
          <span className="tnum">
            {price.symbol}
            {price.amount}
            {p.kind === 'Rent' && <small>/mo</small>}
          </span>
        </span>
        <small>{p.address}</small>
        <span className="mod-prop__facts">
          <span>{count(p.sizeSqft)} sq ft</span>
          <span>{p.facing}</span>
          {p.beds > 0 && <span>{p.beds} Beds</span>}
          <span>{count(p.views)} views</span>
        </span>
      </button>
    </article>
  )
}

export default function PropertiesPage() {
  const data = useData()
  const ui = useUI()
  const [sp, setSp] = useSearchParams()
  const get = (k: string) => sp.get(k)
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v)
    else n.delete(k)
    setSp(n, { replace: true })
  }
  const status = (get('status') as PropertyStatus | null) ?? 'All'
  const view = (get('view') as View) ?? 'grid'
  const q = get('q') ?? ''
  const saved = get('saved') === '1'

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    const band = COST_BANDS.find((b) => b.id === get('cost'))
    return data.properties
      .filter((p) => status === 'All' || p.status === status)
      .filter((p) => !get('type') || p.type === get('type'))
      .filter((p) => !get('district') || p.district === get('district'))
      .filter((p) => !get('facing') || p.facing === get('facing'))
      .filter((p) => !band || band.test(p))
      .filter((p) => !saved || data.savedPropertyIds.includes(p.id))
      .filter((p) => !s || [p.title, p.address, p.project].some((x) => x.toLowerCase().includes(s)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sp])

  const counts = (s: PropertyStatus | 'All') => (s === 'All' ? data.properties.length : data.properties.filter((p) => p.status === s).length)

  return (
    <div className="mod">
      <ModuleHeader
        title="Plot & property inventory"
        subtitle="One live inventory — available, reserved, sold or rented — filterable by size, facing and price."
        actions={
          <button type="button" className="ui-btn is-primary" onClick={() => ui.open({ kind: 'create', what: 'property' })}>
            <Plus size={15} strokeWidth={1.8} /> Add property
          </button>
        }
      />
      <div className="mod-bar">
        <Tabs label="Status" value={status} onChange={(v) => set('status', v === 'All' ? null : v)} items={STATUSES.map((s) => ({ value: s, label: s, count: counts(s) }))} />
        <div className="mod-bar__right">
          <div className="mod-seg" role="group" aria-label="View">
            {(
              [
                ['grid', LayoutGrid],
                ['table', List],
                ['map', MapIcon],
              ] as const
            ).map(([v, Icon]) => (
              <button key={v} type="button" aria-pressed={view === v} aria-label={`${v} view`} className={view === v ? 'is-on' : ''} onClick={() => set('view', v === 'grid' ? null : v)}>
                <Icon size={15} strokeWidth={1.7} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mod-filters">
        <SelectPill label="Type" value={get('type') as PropertyType | null} options={PROPERTY_TYPES} onChange={(v) => set('type', v)} />
        <SelectPill label="District" value={get('district')} options={DISTRICTS} onChange={(v) => set('district', v)} />
        <SelectPill label="Facing" value={get('facing') as Facing | null} options={FACINGS} onChange={(v) => set('facing', v)} />
        <SelectPill label="Price" value={COST_BANDS.find((b) => b.id === get('cost'))?.label ?? null} options={COST_BANDS.map((b) => b.label)} onChange={(v) => set('cost', COST_BANDS.find((b) => b.label === v)?.id ?? null)} />
        <button type="button" className={`mod-pill${saved ? ' is-active' : ''}`} aria-pressed={saved} onClick={() => set('saved', saved ? null : '1')}>
          <Heart size={14} strokeWidth={1.7} /> Saved ({data.savedPropertyIds.length})
        </button>
        <label className="mod-search">
          <Search size={15} strokeWidth={1.7} />
          <input value={q} onChange={(e) => set('q', e.target.value || null)} placeholder="Search title, project, address" aria-label="Search inventory" />
        </label>
      </div>

      {view === 'grid' && (
        <div className="mod-grid">
          {rows.map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>
      )}

      {view === 'table' && (
        <div className="mod-card mod-table">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Locality</th>
                <th>Size</th>
                <th>Facing</th>
                <th>Price</th>
                <th>Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="is-clickable" onClick={() => ui.open({ kind: 'property', id: p.id })}>
                  <td>
                    <button type="button" className="mod-link" onClick={(e) => (e.stopPropagation(), ui.open({ kind: 'property', id: p.id }))}>
                      {p.title}
                    </button>
                  </td>
                  <td>{p.type}</td>
                  <td>{p.district}</td>
                  <td className="tnum">{count(p.sizeSqft)} sq ft</td>
                  <td>{p.facing}</td>
                  <td className="tnum">
                    {inrCompact(p.price)}
                    {p.kind === 'Rent' ? '/mo' : ''}
                  </td>
                  <td>{data.agents.find((a) => a.id === p.agentId)?.name}</td>
                  <td>
                    <PropertyStatusPill status={p.status} raw />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'map' && (
        <div className="mod-mapview">
          <div className="mod-card mod-mapview__map">
            <svg viewBox="0 0 300 220" role="group" aria-label="Inventory map" style={{ overflow: 'visible' }}>
              <StreetMap />
              {DISTRICTS.map((d) => {
                const [x, y] = DISTRICT_POS[d]
                const here = rows.filter((p) => p.district === d)
                const on = get('district') === d
                return (
                  <g key={d} className={`mod-mapview__pin${on ? ' is-on' : ''}${here.length ? '' : ' is-empty'}`} role="button" tabIndex={0} aria-label={`${d}: ${here.length} listings`} onClick={() => set('district', on ? null : d)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && set('district', on ? null : d)}>
                    <text x={x} y={y - 13} textAnchor="middle" className="ax-map__label">
                      {d.toUpperCase()}
                    </text>
                    <circle cx={x} cy={y} r={on ? 10 : 8} />
                    <text x={x} y={y + 3} textAnchor="middle" className="mod-mapview__count">
                      {here.length}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mod-card mod-mapview__list">
            {rows.map((p) => (
              <button key={p.id} type="button" className="ui-row" onClick={() => ui.open({ kind: 'property', id: p.id })}>
                <BuildingImage asset={p.photo} sky className="mod-thumb" />
                <span className="grow">
                  {p.title}
                  <small>
                    {p.district} · {inrCompact(p.price)}
                    {p.kind === 'Rent' ? '/mo' : ''}
                  </small>
                </span>
                <PropertyStatusPill status={p.status} raw />
              </button>
            ))}
          </div>
        </div>
      )}
      {!rows.length && <p className="ui-empty">No properties match these filters.</p>}
    </div>
  )
}
