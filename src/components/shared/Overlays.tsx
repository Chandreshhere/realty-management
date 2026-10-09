import { useState } from 'react'
import { useData } from '../../store/store'
import { useUI } from '../../store/ui'
import { Drawer } from './Overlay'
import { PropertyDrawer } from './PropertyDrawer'
import { LeadDrawer } from './LeadDrawer'
import { CreateModal } from './CreateModal'
import { fmtDate, fmtTime } from '../../lib/format'

function ActivityDrawer() {
  const data = useData()
  const ui = useUI()
  const types = Array.from(new Set(data.activities.map((a) => a.type)))
  const [type, setType] = useState<string | null>(null)
  const rows = data.activities.filter((a) => !type || a.type === type)
  return (
    <Drawer title="All activity" subtitle={`${data.activities.length} events across leads and inventory`} onClose={ui.close} wide>
      <div className="dr-tags" role="group" aria-label="Filter by type">
        <button type="button" className={`ui-chip${!type ? ' is-on' : ' is-outline'}`} aria-pressed={!type} onClick={() => setType(null)}>
          All
        </button>
        {types.map((t) => (
          <button key={t} type="button" className={`ui-chip${type === t ? ' is-on' : ' is-outline'}`} aria-pressed={type === t} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>
      <section className="ui-section">
        <div className="ui-list">
          {rows.map((a) => (
            <button key={a.id} type="button" className="ui-row" onClick={() => ui.open(a.ref.kind === 'lead' ? { kind: 'lead', id: a.ref.id } : { kind: 'property', id: a.ref.id })}>
              <div className="grow">
                {a.type}
                <small>{a.description}</small>
              </div>
              <small style={{ textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--muted)' }}>
                {fmtDate(a.at)}
                <br />
                {fmtTime(a.at)} · {a.status}
              </small>
            </button>
          ))}
        </div>
      </section>
    </Drawer>
  )
}

/** Renders whichever drawer / modal is open, plus toasts. */
export function Overlays() {
  const ui = useUI()
  const p = ui.panel
  return (
    <>
      {p?.kind === 'property' && <PropertyDrawer key={p.id} id={p.id} />}
      {p?.kind === 'lead' && <LeadDrawer key={p.id} id={p.id} />}
      {p?.kind === 'activity' && <ActivityDrawer />}
      {p?.kind === 'create' && <CreateModal key={p.what + (p.leadId ?? '') + (p.propertyId ?? '')} what={p.what} leadId={p.leadId} propertyId={p.propertyId} />}
      <div className="ui-toasts" role="status" aria-live="polite">
        {ui.toasts.map((t) => (
          <div key={t.id} className="ui-toast">
            {t.text}
          </div>
        ))}
      </div>
    </>
  )
}
