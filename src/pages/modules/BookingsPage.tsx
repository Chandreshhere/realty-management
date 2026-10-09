import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, Stat } from '../../components/modules/kit'
import { BuildingImage } from '../../components/shared/bits'
import { dealStats } from '../../lib/selectors'
import { count, fmtDate, inrCompact, inrFull } from '../../lib/format'

export default function BookingsPage() {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const pending = data.bookings.filter((b) => b.status === 'Link sent')
  const paid = data.bookings.filter((b) => b.status === 'Paid')
  const s = dealStats(data.deals)
  const recentDeals = [...data.deals].sort((a, b) => b.closedAt.localeCompare(a.closedAt)).slice(0, 12)

  return (
    <div className="mod">
      <ModuleHeader title="Bookings & payments" subtitle="Reserve, collect, update — a reserved unit can’t be offered twice, and inventory updates the moment payment clears." />
      <div className="mod-stats">
        <Stat label="Payment links out" value={pending.length} hint={inrCompact(pending.reduce((x, b) => x + b.amount, 0))} />
        <Stat label="Booking amounts collected" value={inrCompact(paid.reduce((x, b) => x + b.amount, 0))} />
        <Stat label="Deals · 30 days" value={count(s.count)} hint={`${s.prevCount} in the 30 days before`} />
        <Stat label="Revenue · 30 days" value={inrCompact(s.revenue)} />
        <Stat label="Average deal" value={inrCompact(s.avg)} />
      </div>

      <div className="mod-split">
        <section className="mod-card">
          <div className="mod-card__head">
            <h2>Awaiting payment</h2>
          </div>
          <div className="ui-list">
            {pending.map((b) => {
              const p = data.properties.find((x) => x.id === b.propertyId)
              const l = data.leads.find((x) => x.id === b.leadId)
              return (
                <div key={b.id} className="ui-row">
                  {p && <BuildingImage asset={p.photo} sky className="mod-thumb" />}
                  <button type="button" className="grow" style={{ textAlign: 'left' }} onClick={() => p && ui.open({ kind: 'property', id: p.id })}>
                    {p?.title}
                    <small>
                      {l?.name} · link sent {fmtDate(b.createdAt)} · {inrFull(b.amount)}
                    </small>
                  </button>
                  <button
                    type="button"
                    className="ui-btn is-sm is-primary"
                    onClick={() => {
                      dispatch({ type: 'markBookingPaid', id: b.id })
                      ui.toast(`${p?.title} closed — inventory updated`)
                    }}
                  >
                    Mark paid
                  </button>
                </div>
              )
            })}
            {!pending.length && <p className="ui-empty">No open payment links. Reserve a unit from its property panel.</p>}
          </div>
        </section>

        <section className="mod-card">
          <div className="mod-card__head">
            <h2>Paid bookings</h2>
          </div>
          <div className="ui-list">
            {paid.map((b) => {
              const p = data.properties.find((x) => x.id === b.propertyId)
              const l = data.leads.find((x) => x.id === b.leadId)
              return (
                <button key={b.id} type="button" className="ui-row" onClick={() => p && ui.open({ kind: 'property', id: p.id })}>
                  {p && <BuildingImage asset={p.photo} sky className="mod-thumb" />}
                  <span className="grow">
                    {p?.title}
                    <small>
                      {l?.name} · cleared {b.paidAt ? fmtDate(b.paidAt) : ''}
                    </small>
                  </span>
                  <span className="tnum">{inrFull(b.amount)}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mod-card mod-table">
        <div className="mod-card__head">
          <h2>Latest closings</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Closed</th>
              <th>Type</th>
              <th>Agent</th>
              <th>Property</th>
              <th className="is-end">Value</th>
            </tr>
          </thead>
          <tbody>
            {recentDeals.map((d) => (
              <tr key={d.id}>
                <td>{fmtDate(d.closedAt)}</td>
                <td>{d.kind === 'Rent' ? 'Lease (annual)' : 'Sale'}</td>
                <td>{data.agents.find((a) => a.id === d.agentId)?.name}</td>
                <td>{d.propertyId ? data.properties.find((p) => p.id === d.propertyId)?.title : '—'}</td>
                <td className="is-end tnum">{inrCompact(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
