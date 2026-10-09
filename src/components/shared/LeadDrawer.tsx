import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, CalendarPlus, Check, ListPlus, MessageCircle, PhoneCall, Zap } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { Drawer } from './Overlay'
import { Menu } from './Popover'
import { AgentAvatar, Empty, PropertyStatusPill, ScorePill, VisitPill } from './bits'
import { LEAD_STAGES } from '../../data/mockData'
import { matchProperties } from '../../lib/selectors'
import { count, fmtDay, fmtTime, inrCompact, relTime, secs } from '../../lib/format'
import { useModulePath } from '../../lib/paths'

export function LeadDrawer({ id }: { id: string }) {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const navigate = useNavigate()
  const path = useModulePath()
  const [note, setNote] = useState('')
  const l = data.leads.find((x) => x.id === id)
  if (!l) return null
  const owner = data.agents.find((a) => a.id === l.ownerId)
  const matches = matchProperties(l, data.properties)
  const visits = data.visits.filter((v) => v.leadId === l.id)
  const fus = data.followUps.filter((f) => f.leadId === l.id && !f.done)
  const timeline = data.activities.filter((a) => a.ref.kind === 'lead' && a.ref.id === l.id).slice(0, 8)
  const stageIdx = LEAD_STAGES.indexOf(l.stage)

  const message = () => {
    dispatch({ type: 'startConversation', leadId: l.id })
    ui.close()
    navigate(path('messages', `lead=${l.id}`))
  }

  return (
    <Drawer
      title={l.name}
      subtitle={`${l.phone} · ${l.email}`}
      onClose={ui.close}
      footer={
        <>
          <button type="button" className="ui-btn is-ghost" onClick={message}>
            <MessageCircle size={15} strokeWidth={1.7} /> Message
          </button>
          <button type="button" className="ui-btn is-ghost" onClick={() => ui.open({ kind: 'create', what: 'followUp', leadId: l.id })}>
            <ListPlus size={15} strokeWidth={1.7} /> Follow-up
          </button>
          <button type="button" className="ui-btn is-primary" onClick={() => ui.open({ kind: 'create', what: 'visit', leadId: l.id })}>
            <CalendarPlus size={15} strokeWidth={1.7} /> Book visit
          </button>
        </>
      }
    >
      <div className="dr-tags">
        <ScorePill score={l.score} />
        <span className="ui-chip">{l.source}</span>
        <span className="ui-chip">via {l.channel}</span>
        {l.duplicatesMerged > 0 && <span className="ui-chip is-outline">{l.duplicatesMerged} duplicate{l.duplicatesMerged > 1 ? 's' : ''} merged</span>}
      </div>

      <section className="ui-section">
        <h3>
          Pipeline stage <small>click to move</small>
        </h3>
        <div className="ui-stepper" role="group" aria-label="Lead stage">
          {LEAD_STAGES.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === l.stage}
              className={s === l.stage ? 'is-current' : i < stageIdx && l.stage !== 'Lost' ? 'is-done' : ''}
              onClick={() => {
                if (s === l.stage) return
                dispatch({ type: 'setLeadStage', id: l.id, stage: s })
                ui.toast(`${l.name} → ${s}`)
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="ui-section">
        <h3>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <Bot size={15} strokeWidth={1.7} /> AI qualification
          </span>
          <small>captured on the first conversation</small>
        </h3>
        <dl className="ui-kv">
          <div>
            <dt>Budget</dt>
            <dd className="tnum">{inrCompact(l.budget)}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{l.preferredDistrict}</dd>
          </div>
          <div>
            <dt>Looking for</dt>
            <dd className="tnum">
              {l.preferredType} · {count(l.preferredSizeSqft)} sq ft
            </dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{l.timeline}</dd>
          </div>
          <div>
            <dt>First response</dt>
            <dd>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Zap size={12} strokeWidth={2} /> {secs(l.firstResponseSec)} on {l.channel}
              </span>
            </dd>
          </div>
          <div>
            <dt>Last contact</dt>
            <dd>{relTime(l.lastContactAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="ui-section">
        <h3>Owner</h3>
        <div className="ui-row">
          {owner && <AgentAvatar agent={owner} size={34} />}
          <div className="grow">
            {owner?.name}
            <small>
              {owner?.role} · speaks {owner?.languages.join(', ')}
            </small>
          </div>
          <Menu
            label="Reassign lead"
            align="end"
            items={data.agents
              .filter((a) => a.id !== l.ownerId)
              .map((a) => ({
                label: a.name,
                hint: a.role,
                onSelect: () => {
                  dispatch({ type: 'assignLead', id: l.id, agentId: a.id })
                  ui.toast(`Reassigned to ${a.name}`)
                },
              }))}
            trigger={(tp) => (
              <button type="button" className="ui-btn is-sm is-ghost" {...tp}>
                Reassign
              </button>
            )}
          />
        </div>
      </section>

      {l.call && (
        <section className="ui-section">
          <h3>
            Call intelligence <small>{l.call.handledBy} · {secs(l.call.durationSec)}</small>
          </h3>
          <p style={{ fontSize: 12.5, lineHeight: 1.55 }}>{l.call.summary}</p>
          <dl className="ui-kv" style={{ marginTop: 10 }}>
            <div>
              <dt>Objection</dt>
              <dd>{l.call.objections.join(', ')}</dd>
            </div>
            <div>
              <dt>Next step</dt>
              <dd>{l.call.nextSteps.join(', ')}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="ui-section">
        <h3>
          Matched properties <small>from live inventory</small>
        </h3>
        <div className="ui-list">
          {matches.map(({ property: p, score }) => (
            <button key={p.id} type="button" className="ui-row" onClick={() => ui.open({ kind: 'property', id: p.id })}>
              <div className="grow">
                {p.title}
                <small>
                  {p.district} · {inrCompact(p.price)}
                  {p.kind === 'Rent' ? '/mo' : ''} · {count(p.sizeSqft)} sq ft
                </small>
              </div>
              <PropertyStatusPill status={p.status} />
              <span className="tnum" style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                {score}%
              </span>
            </button>
          ))}
          {!matches.length && <Empty>Nothing in inventory fits this brief right now.</Empty>}
        </div>
      </section>

      <section className="ui-section">
        <h3>Follow-ups &amp; visits</h3>
        <div className="ui-list">
          {fus.map((f) => {
            const overdue = new Date(f.dueAt).getTime() < Date.now()
            return (
              <div key={f.id} className="ui-row">
                <div className="grow">
                  {f.type} · {f.note}
                  <small style={overdue ? { color: 'var(--hot-ink)' } : undefined}>
                    {overdue ? 'Overdue · ' : 'Due '}
                    {relTime(f.dueAt)}
                    {f.escalated ? ' · escalated' : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className="ui-icon-btn"
                  aria-label="Mark follow-up done"
                  onClick={() => {
                    dispatch({ type: 'completeFollowUp', id: f.id })
                    ui.toast('Follow-up done')
                  }}
                >
                  <Check size={15} strokeWidth={1.8} />
                </button>
              </div>
            )
          })}
          {visits.map((v) => {
            const p = data.properties.find((x) => x.id === v.propertyId)
            return (
              <button key={v.id} type="button" className="ui-row" onClick={() => p && ui.open({ kind: 'property', id: p.id })}>
                <div className="grow">
                  Visit · {p?.title}
                  <small>
                    {fmtDay(v.scheduledAt)} · {fmtTime(v.scheduledAt)}
                  </small>
                </div>
                <VisitPill status={v.status} />
              </button>
            )
          })}
          {!fus.length && !visits.length && <Empty>Nothing scheduled.</Empty>}
        </div>
      </section>

      <section className="ui-section">
        <h3>Log a call</h3>
        <form
          className="dr-log"
          onSubmit={(e) => {
            e.preventDefault()
            if (!note.trim()) return
            dispatch({ type: 'logCall', leadId: l.id, note: note.trim() })
            setNote('')
            ui.toast('Call logged')
          }}
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was discussed?" aria-label="Call note" />
          <button type="submit" className="ui-btn is-sm is-primary" disabled={!note.trim()}>
            <PhoneCall size={13} strokeWidth={1.8} /> Log
          </button>
        </form>
      </section>

      <section className="ui-section">
        <h3>Timeline</h3>
        <div className="ui-list">
          {timeline.map((a) => (
            <div key={a.id} className="ui-row">
              <div className="grow">
                {a.type}
                <small>{a.description}</small>
              </div>
              <small style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{relTime(a.at)}</small>
            </div>
          ))}
          {!timeline.length && <Empty>No recorded activity yet.</Empty>}
        </div>
      </section>
    </Drawer>
  )
}
