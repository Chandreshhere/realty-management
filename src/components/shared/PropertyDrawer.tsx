import { CalendarPlus, Heart, Link2, Wallet } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { Drawer } from './Overlay'
import { Menu } from './Popover'
import { AgentAvatar, BuildingImage, Empty, PropertyStatusPill, ScorePill, VisitPill } from './bits'
import { matchLeads } from '../../lib/selectors'
import { count, fmtDate, fmtDay, fmtTime, inrCompact, inrFull } from '../../lib/format'
import type { PropertyStatus } from '../../data/types'

export function PropertyDrawer({ id }: { id: string }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const p = data.properties.find((x) => x.id === id)
  if (!p) return null
  const agent = data.agents.find((a) => a.id === p.agentId)
  const saved = data.savedPropertyIds.includes(p.id)
  const booking = data.bookings.find((b) => b.propertyId === p.id && b.status !== 'Expired')
  const buyer = booking ? data.leads.find((l) => l.id === booking.leadId) : undefined
  const matches = matchLeads(p, data.leads)
  const visits = data.visits.filter((v) => v.propertyId === p.id).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
  const statuses = (['Available', 'Reserved', 'Sold', 'Rented'] as PropertyStatus[]).filter((s) => s !== p.status && (p.kind === 'Rent' ? s !== 'Sold' : s !== 'Rented'))

  return (
    <Drawer
      title={p.title}
      subtitle={p.address}
      onClose={ui.close}
      footer={
        <>
          <Menu
            label="Change status"
            items={statuses.map((s) => ({
              label: `Mark ${s.toLowerCase()}`,
              onSelect: () => {
                dispatch({ type: 'setPropertyStatus', id: p.id, status: s })
                ui.toast(`${p.title} marked ${s.toLowerCase()}`)
              },
            }))}
            trigger={(tp) => (
              <button type="button" className="ui-btn is-ghost" {...tp}>
                Change status
              </button>
            )}
          />
          <button type="button" className="ui-btn is-primary" onClick={() => ui.open({ kind: 'create', what: 'visit', propertyId: p.id })}>
            <CalendarPlus size={15} strokeWidth={1.7} /> Book site visit
          </button>
        </>
      }
    >
      <div className="dr-hero">
        <BuildingImage asset={p.photo} sky fit="contain" position="50% 100%" className="dr-hero__img" />
        <div className="dr-hero__top">
          <PropertyStatusPill status={p.status} raw />
          <button
            type="button"
            className={`ui-icon-btn${saved ? ' is-dark' : ''}`}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            onClick={() => dispatch({ type: 'toggleSave', id: p.id })}
          >
            <Heart size={15} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <section className="ui-section">
        <dl className="ui-kv">
          <div>
            <dt>{p.kind === 'Rent' ? 'Rent' : 'Price'}</dt>
            <dd className="tnum">
              {inrFull(p.price)}
              {p.kind === 'Rent' ? ' /mo' : ''}
            </dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>
              {p.type} · for {p.kind.toLowerCase()}
            </dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd className="tnum">{count(p.sizeSqft)} sq ft</dd>
          </div>
          <div>
            <dt>Facing</dt>
            <dd>{p.facing}</dd>
          </div>
          {p.type !== 'Plot' && (
            <div>
              <dt>Layout</dt>
              <dd>{p.beds ? `${p.beds} bed · ${p.baths} bath · ${p.parking} parking` : `${p.baths} washroom · ${p.parking} parking`}</dd>
            </div>
          )}
          <div>
            <dt>Project</dt>
            <dd>{p.project}</dd>
          </div>
          <div>
            <dt>Engagement</dt>
            <dd className="tnum">
              {count(p.views)} views · {p.enquiries} enquiries
            </dd>
          </div>
          <div>
            <dt>Listed</dt>
            <dd>{fmtDate(p.listedAt)}</dd>
          </div>
        </dl>
      </section>

      {agent && (
        <section className="ui-section">
          <h3>Assigned agent</h3>
          <div className="ui-row">
            <AgentAvatar agent={agent} size={34} />
            <div className="grow">
              {agent.name}
              <small>
                {agent.role} · {agent.phone}
              </small>
            </div>
          </div>
        </section>
      )}

      <section className="ui-section">
        <h3>
          Booking &amp; payment <small>Reserve, collect, update — one step</small>
        </h3>
        {p.status === 'Available' && (
          <>
            <p className="ui-empty" style={{ paddingTop: 0 }}>
              Reserving marks the unit Reserved everywhere and sends a 5% booking link ({inrCompact(Math.round((p.price * 0.05) / 10000) * 10000)}) on the buyer’s channel.
            </p>
            <Menu
              label="Reserve for buyer"
              header="Matched buyers"
              items={(matches.length ? matches.map((m) => m.lead) : data.leads.filter((l) => l.stage === 'Negotiation' || l.stage === 'Visited').slice(0, 5)).map((l) => ({
                label: l.name,
                hint: `${l.stage} · budget ${inrCompact(l.budget)}`,
                onSelect: () => {
                  dispatch({ type: 'createBooking', propertyId: p.id, leadId: l.id })
                  ui.toast(`Payment link sent to ${l.name}`)
                },
              }))}
              trigger={(tp) => (
                <button type="button" className="ui-btn is-primary" {...tp}>
                  <Link2 size={15} strokeWidth={1.7} /> Reserve &amp; send payment link
                </button>
              )}
            />
          </>
        )}
        {booking && booking.status === 'Link sent' && (
          <div className="ui-row">
            <Wallet size={18} strokeWidth={1.6} />
            <div className="grow">
              Link sent to {buyer?.name ?? 'buyer'} · {inrFull(booking.amount)}
              <small>Sent {fmtDate(booking.createdAt)} — inventory updates when payment clears</small>
            </div>
            <button
              type="button"
              className="ui-btn is-sm is-primary"
              onClick={() => {
                dispatch({ type: 'markBookingPaid', id: booking.id })
                ui.toast('Payment received — property closed')
              }}
            >
              Mark paid
            </button>
          </div>
        )}
        {booking && booking.status === 'Paid' && (
          <div className="ui-row">
            <Wallet size={18} strokeWidth={1.6} />
            <div className="grow">
              Paid by {buyer?.name ?? 'buyer'} · {inrFull(booking.amount)}
              <small>Cleared {booking.paidAt ? fmtDate(booking.paidAt) : ''}</small>
            </div>
          </div>
        )}
        {!booking && p.status !== 'Available' && <Empty>{p.status === 'Reserved' ? 'Held offline — no payment link on record.' : `Closed as ${p.status.toLowerCase()}.`}</Empty>}
      </section>

      <section className="ui-section">
        <h3>
          Matched buyers <small>budget, type, locality &amp; size</small>
        </h3>
        <div className="ui-list">
          {matches.map(({ lead, score }) => (
            <button key={lead.id} type="button" className="ui-row" onClick={() => ui.open({ kind: 'lead', id: lead.id })}>
              <div className="grow">
                {lead.name}
                <small>
                  {lead.stage} · {inrCompact(lead.budget)} · {lead.preferredDistrict}
                </small>
              </div>
              <ScorePill score={lead.score} />
              <span className="tnum" style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                {score}%
              </span>
            </button>
          ))}
          {!matches.length && <Empty>No active lead matches this unit yet — new matching briefs will alert the agent.</Empty>}
        </div>
      </section>

      <section className="ui-section">
        <h3>Site visits</h3>
        <div className="ui-list">
          {visits.map((v) => {
            const l = data.leads.find((x) => x.id === v.leadId)
            return (
              <button key={v.id} type="button" className="ui-row" onClick={() => l && ui.open({ kind: 'lead', id: l.id })}>
                <div className="grow">
                  {l?.name}
                  <small>
                    {fmtDay(v.scheduledAt)} · {fmtTime(v.scheduledAt)} · {v.bookedVia}
                  </small>
                </div>
                <VisitPill status={v.status} />
              </button>
            )
          })}
          {!visits.length && <Empty>No visits booked.</Empty>}
        </div>
      </section>
    </Drawer>
  )
}
