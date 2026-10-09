import { useState, type FormEvent } from 'react'
import { useData, useDispatch, uid } from '../../store/store'
import { useUI, type CreateKind } from '../../store/ui'
import { Modal } from './Overlay'
import { Field } from './bits'
import { CITY, DISTRICTS, LEAD_SOURCES, PROPERTY_TYPES } from '../../data/mockData'
import { isActiveLead } from '../../lib/selectors'
import type { AssetKey } from '../../data/assetManifest'
import type { Facing, FollowUpType, LeadSource, ListingKind, PropertyType } from '../../data/types'

const TITLES: Record<CreateKind, [string, string]> = {
  property: ['Add property', 'List a unit in live inventory'],
  lead: ['Add lead', 'Manual entry — portal and ad leads arrive on their own'],
  visit: ['Book site visit', 'The buyer gets a confirmation and a reminder before the visit'],
  followUp: ['Add follow-up', 'Reminders fire on schedule; unanswered ones escalate'],
}

const photoFor: Record<PropertyType, AssetKey> = {
  Plot: 'skylineGreen',
  Villa: 'whiteVilla',
  Apartment: 'apartment',
  House: 'modernHouse',
  Commercial: 'skylineGlass',
}

/** "YYYY-MM-DDTHH:mm" for datetime-local, n days from now at the given hour. */
function localInput(days: number, hour: number) {
  const d = new Date(Date.now() + days * 86400000)
  d.setHours(hour, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreateModal({ what, leadId, propertyId }: { what: CreateKind; leadId?: string; propertyId?: string }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const [title, subtitle] = TITLES[what]
  const activeLeads = data.leads.filter(isActiveLead)
  // round robin: the agent with the fewest active leads gets the next one
  const nextAgent = [...data.agents].sort((a, b) => data.leads.filter((l) => l.ownerId === a.id && isActiveLead(l)).length - data.leads.filter((l) => l.ownerId === b.id && isActiveLead(l)).length)[0]

  const [f, setF] = useState<Record<string, string>>({
    title: '',
    district: DISTRICTS[0],
    type: 'Apartment',
    kind: 'Sale',
    price: '',
    size: '',
    beds: '2',
    facing: 'East',
    name: '',
    phone: '',
    email: '',
    source: '99acres',
    budget: '',
    timeline: '1–3 months',
    agentId: nextAgent.id,
    leadId: leadId ?? activeLeads[0]?.id ?? '',
    propertyId: propertyId ?? data.properties.find((p) => p.status === 'Available')?.id ?? '',
    at: localInput(2, 11),
    fuType: 'Call',
    note: '',
  })
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (what === 'property') {
      const type = f.type as PropertyType
      dispatch({
        type: 'addProperty',
        property: {
          id: uid('p'),
          title: f.title,
          project: f.title.split(/[,\d]/)[0].trim() || f.title,
          district: f.district,
          address: `${f.district}, ${CITY}`,
          type,
          kind: f.kind as ListingKind,
          price: Number(f.price),
          sizeSqft: Number(f.size) || 0,
          beds: type === 'Plot' || type === 'Commercial' ? 0 : Number(f.beds),
          baths: type === 'Plot' ? 0 : Math.max(Number(f.beds) - 0, 1),
          parking: type === 'Plot' ? 0 : 1,
          facing: f.facing as Facing,
          status: 'Available',
          photo: photoFor[type],
          agentId: f.agentId,
          views: 0,
          rating: 4.5,
          enquiries: 0,
          listedAt: now,
        },
      })
      ui.toast(`${f.title} added to inventory`)
    }
    if (what === 'lead') {
      const src = f.source as LeadSource
      dispatch({
        type: 'addLead',
        lead: {
          id: uid('l'),
          name: f.name,
          phone: f.phone,
          email: f.email,
          source: src,
          channel: 'WhatsApp',
          budget: Number(f.budget),
          preferredDistrict: f.district,
          preferredType: f.type as PropertyType,
          preferredSizeSqft: Number(f.size) || 1200,
          timeline: f.timeline,
          stage: 'New Enquiry',
          score: 'Warm',
          ownerId: f.agentId,
          propertyInterestIds: [],
          createdAt: now,
          lastContactAt: now,
          nextFollowUpAt: null,
          firstResponseSec: 0,
          duplicatesMerged: 0,
        },
      })
      ui.toast(`${f.name} added — instant WhatsApp reply queued`)
    }
    if (what === 'visit') {
      const p = data.properties.find((x) => x.id === f.propertyId)
      dispatch({
        type: 'addVisit',
        visit: { id: uid('v'), leadId: f.leadId, propertyId: f.propertyId, agentId: p?.agentId ?? f.agentId, scheduledAt: new Date(f.at).toISOString(), status: 'Confirmed', bookedVia: 'Agent', reminderSent: false, notes: f.note },
      })
      ui.toast('Site visit booked · confirmation sent')
    }
    if (what === 'followUp') {
      const lead = data.leads.find((l) => l.id === f.leadId)
      dispatch({
        type: 'addFollowUp',
        followUp: { id: uid('f'), leadId: f.leadId, agentId: lead?.ownerId ?? f.agentId, dueAt: new Date(f.at).toISOString(), type: f.fuType as FollowUpType, note: f.note || 'Follow-up', done: false, escalated: false },
      })
      ui.toast('Follow-up scheduled')
    }
    ui.close()
  }

  const valid =
    what === 'property' ? !!f.title.trim() && Number(f.price) > 0 : what === 'lead' ? !!f.name.trim() && !!f.phone.trim() && Number(f.budget) > 0 : !!f.leadId && (what === 'followUp' || !!f.propertyId) && !!f.at

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={ui.close}
      footer={
        <>
          <button type="button" className="ui-btn is-ghost" onClick={ui.close}>
            Cancel
          </button>
          <button type="submit" form="create-form" className="ui-btn is-primary" disabled={!valid}>
            {title}
          </button>
        </>
      }
    >
      <form id="create-form" onSubmit={submit} className="ui-modal__form">
        {what === 'property' && (
          <>
            <Field label="Title">
              <input data-autofocus required value={f.title} onChange={set('title')} placeholder="e.g. Plot 12, Green Acres" />
            </Field>
            <div className="ui-grid-2">
              <Field label="Type">
                <select value={f.type} onChange={set('type')}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Listing">
                <select value={f.kind} onChange={set('kind')}>
                  <option value="Sale">For sale</option>
                  <option value="Rent">For rent</option>
                </select>
              </Field>
              <Field label={f.kind === 'Rent' ? 'Monthly rent (₹)' : 'Price (₹)'}>
                <input required inputMode="numeric" value={f.price} onChange={set('price')} placeholder={f.kind === 'Rent' ? '65000' : '8500000'} />
              </Field>
              <Field label="Size (sq ft)">
                <input inputMode="numeric" value={f.size} onChange={set('size')} placeholder="2400" />
              </Field>
              <Field label="Locality">
                <select value={f.district} onChange={set('district')}>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Facing">
                <select value={f.facing} onChange={set('facing')}>
                  {['North', 'East', 'South', 'West', 'North-East', 'South-East'].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              {f.type !== 'Plot' && f.type !== 'Commercial' && (
                <Field label="Bedrooms">
                  <select value={f.beds} onChange={set('beds')}>
                    {['1', '2', '3', '4', '5'].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Agent">
                <select value={f.agentId} onChange={set('agentId')}>
                  {data.agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </>
        )}

        {what === 'lead' && (
          <>
            <Field label="Full name">
              <input data-autofocus required value={f.name} onChange={set('name')} placeholder="Buyer name" />
            </Field>
            <div className="ui-grid-2">
              <Field label="Phone">
                <input required type="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98xxx xxxxx" />
              </Field>
              <Field label="Email">
                <input type="email" value={f.email} onChange={set('email')} placeholder="name@mail.com" />
              </Field>
              <Field label="Source">
                <select value={f.source} onChange={set('source')}>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Budget (₹)">
                <input required inputMode="numeric" value={f.budget} onChange={set('budget')} placeholder="6000000" />
              </Field>
              <Field label="Preferred locality">
                <select value={f.district} onChange={set('district')}>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Looking for">
                <select value={f.type} onChange={set('type')}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Timeline">
                <select value={f.timeline} onChange={set('timeline')}>
                  {['Immediate', 'Within 1 month', '1–3 months', '3–6 months', '6+ months'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Assign to (round robin)">
                <select value={f.agentId} onChange={set('agentId')}>
                  {data.agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </>
        )}

        {(what === 'visit' || what === 'followUp') && (
          <>
            <Field label="Lead">
              <select data-autofocus value={f.leadId} onChange={set('leadId')}>
                {activeLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.stage}
                  </option>
                ))}
              </select>
            </Field>
            {what === 'visit' && (
              <Field label="Property">
                <select value={f.propertyId} onChange={set('propertyId')}>
                  {data.properties
                    .filter((p) => p.status === 'Available' || p.status === 'Reserved')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} · {p.district}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <div className="ui-grid-2">
              <Field label={what === 'visit' ? 'Date & time' : 'Due'}>
                <input type="datetime-local" required value={f.at} onChange={set('at')} />
              </Field>
              {what === 'followUp' && (
                <Field label="Type">
                  <select value={f.fuType} onChange={set('fuType')}>
                    {['Call', 'WhatsApp', 'Email', 'Visit reminder'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            <Field label="Note">
              <textarea value={f.note} onChange={set('note')} placeholder={what === 'visit' ? 'Anything the agent should know' : 'What to cover'} />
            </Field>
          </>
        )}
      </form>
    </Modal>
  )
}
