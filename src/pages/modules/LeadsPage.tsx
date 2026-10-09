import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check, Plus, Search, Send, UserPlus } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, SelectPill, Stat, Tabs } from '../../components/modules/kit'
import { AgentAvatar, ScorePill } from '../../components/shared/bits'
import { LEAD_SOURCES, LEAD_STAGES } from '../../data/mockData'
import { dormantLeads, isActiveLead } from '../../lib/selectors'
import { fmtDay, fmtTime, inrCompact, pct, relTime, secs } from '../../lib/format'
import type { Lead, LeadScore, LeadSource, LeadStage } from '../../data/types'

type Tab = 'pipeline' | 'list' | 'followups' | 'reactivation'

function LeadCard({ l }: { l: Lead }) {
  const data = useData()
  const ui = useUI()
  const owner = data.agents.find((a) => a.id === l.ownerId)
  return (
    <button type="button" className="mod-lead" onClick={() => ui.open({ kind: 'lead', id: l.id })}>
      <span className="mod-lead__top">
        <strong>{l.name}</strong>
        <ScorePill score={l.score} />
      </span>
      <small>
        {l.preferredType} · {l.preferredDistrict} · {inrCompact(l.budget)}
      </small>
      <span className="mod-lead__foot">
        <span className="ui-chip">{l.source}</span>
        {owner && <AgentAvatar agent={owner} size={22} />}
      </span>
    </button>
  )
}

export default function LeadsPage() {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const [sp, setSp] = useSearchParams()
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v)
    else n.delete(k)
    setSp(n, { replace: true })
  }
  const tab = (sp.get('tab') as Tab) ?? (sp.get('stage') ? 'list' : 'pipeline')
  const source = sp.get('source') as LeadSource | null
  const score = sp.get('score') as LeadScore | null
  const owner = sp.get('owner')
  const stage = sp.get('stage') as LeadStage | null
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const leads = useMemo(() => {
    const s = q.toLowerCase()
    return data.leads
      .filter((l) => !source || l.source === source)
      .filter((l) => !score || l.score === score)
      .filter((l) => !owner || l.ownerId === owner)
      .filter((l) => !stage || l.stage === stage)
      .filter((l) => !s || [l.name, l.phone, l.email, l.preferredDistrict].some((x) => x.toLowerCase().includes(s)))
  }, [data, source, score, owner, stage, q])

  const active = data.leads.filter(isActiveLead)
  const fastReplies = data.leads.filter((l) => l.firstResponseSec <= 60).length
  const avgReply = data.leads.reduce((s, l) => s + l.firstResponseSec, 0) / Math.max(data.leads.length, 1)
  const dormant = dormantLeads(data.leads)
  const openFus = data.followUps.filter((f) => !f.done).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const overdue = openFus.filter((f) => new Date(f.dueAt).getTime() < Date.now())
  const ownerAgent = owner ? data.agents.find((a) => a.id === owner) : null

  return (
    <div className="mod">
      <ModuleHeader
        title="Leads & pipeline"
        subtitle="Every portal, ad and form lands here — duplicates merged, answered in under a minute, scored hot, warm or cold."
        actions={
          <button type="button" className="ui-btn is-primary" onClick={() => ui.open({ kind: 'create', what: 'lead' })}>
            <UserPlus size={15} strokeWidth={1.8} /> Add lead
          </button>
        }
      />
      <div className="mod-stats">
        <Stat label="Active leads" value={active.length} />
        <Stat label="Answered < 1 min" value={pct((fastReplies / Math.max(data.leads.length, 1)) * 100, 0)} hint="Instant WhatsApp / SMS response" />
        <Stat label="Avg first reply" value={secs(Math.round(avgReply))} />
        <Stat label="Hot leads" value={active.filter((l) => l.score === 'Hot').length} />
        <Stat label="Follow-ups overdue" value={overdue.length} hint="Escalate or reassign" />
        <Stat label="Duplicates merged" value={data.leads.reduce((s, l) => s + l.duplicatesMerged, 0)} />
      </div>

      <div className="mod-bar">
        <Tabs
          label="View"
          value={tab}
          onChange={(v) => set('tab', v)}
          items={[
            { value: 'pipeline', label: 'Pipeline' },
            { value: 'list', label: 'All leads', count: leads.length },
            { value: 'followups', label: 'Follow-ups', count: openFus.length },
            { value: 'reactivation', label: 'Reactivation', count: dormant.length },
          ]}
        />
      </div>

      {(tab === 'pipeline' || tab === 'list') && (
        <div className="mod-filters">
          <SelectPill label="Source" value={source} options={LEAD_SOURCES} onChange={(v) => set('source', v)} />
          <SelectPill label="Score" value={score} options={['Hot', 'Warm', 'Cold'] as const} onChange={(v) => set('score', v)} />
          {tab === 'list' && <SelectPill label="Stage" value={stage} options={LEAD_STAGES} onChange={(v) => set('stage', v)} />}
          <SelectPill label="Owner" value={ownerAgent?.name ?? null} options={data.agents.map((a) => a.name)} onChange={(v) => set('owner', data.agents.find((a) => a.name === v)?.id ?? null)} />
          <label className="mod-search">
            <Search size={15} strokeWidth={1.7} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, locality" aria-label="Search leads" />
          </label>
        </div>
      )}

      {tab === 'pipeline' && (
        <div className="mod-kanban">
          {LEAD_STAGES.map((s) => {
            const col = leads.filter((l) => l.stage === s)
            return (
              <section key={s} className="mod-kanban__col" aria-label={s}>
                <header>
                  <span>{s}</span>
                  <span className="tnum">{col.length}</span>
                </header>
                <div className="mod-kanban__list">
                  {col.map((l) => (
                    <LeadCard key={l.id} l={l} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {tab === 'list' && (
        <div className="mod-card mod-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Budget</th>
                <th>Locality</th>
                <th>First reply</th>
                <th>Owner</th>
                <th>Last contact</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="is-clickable" onClick={() => ui.open({ kind: 'lead', id: l.id })}>
                  <td>
                    <button type="button" className="mod-link" onClick={(e) => (e.stopPropagation(), ui.open({ kind: 'lead', id: l.id }))}>
                      {l.name}
                    </button>
                  </td>
                  <td>{l.source}</td>
                  <td>{l.stage}</td>
                  <td>
                    <ScorePill score={l.score} />
                  </td>
                  <td className="tnum">{inrCompact(l.budget)}</td>
                  <td>{l.preferredDistrict}</td>
                  <td className="tnum">{secs(l.firstResponseSec)}</td>
                  <td>{data.agents.find((a) => a.id === l.ownerId)?.name}</td>
                  <td>{relTime(l.lastContactAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'followups' && (
        <div className="mod-card">
          <div className="mod-card__head">
            <h2>Follow-up queue</h2>
            <button type="button" className="ui-btn is-sm" onClick={() => ui.open({ kind: 'create', what: 'followUp' })}>
              <Plus size={14} strokeWidth={1.8} /> Add follow-up
            </button>
          </div>
          <div className="ui-list">
            {openFus.map((f) => {
              const l = data.leads.find((x) => x.id === f.leadId)
              const a = data.agents.find((x) => x.id === f.agentId)
              const late = new Date(f.dueAt).getTime() < Date.now()
              return (
                <div key={f.id} className="ui-row mod-fu">
                  {a && <AgentAvatar agent={a} size={30} />}
                  <button type="button" className="grow" onClick={() => l && ui.open({ kind: 'lead', id: l.id })} style={{ textAlign: 'left' }}>
                    {l?.name} · {f.type}
                    <small>
                      {f.note} · {a?.name}
                      {f.escalated ? ' · escalated' : ''}
                    </small>
                  </button>
                  <span className={`mod-due${late ? ' is-late' : ''}`}>
                    {late && <AlertTriangle size={12} strokeWidth={2} />}
                    {fmtDay(f.dueAt)} · {fmtTime(f.dueAt)}
                  </span>
                  {late && !f.escalated && (
                    <button
                      type="button"
                      className="ui-btn is-sm is-ghost"
                      onClick={() => {
                        dispatch({ type: 'escalateFollowUp', id: f.id })
                        ui.toast(`${l?.name} reassigned`)
                      }}
                    >
                      Escalate
                    </button>
                  )}
                  <button
                    type="button"
                    className="ui-icon-btn"
                    aria-label="Mark done"
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
            {!openFus.length && <p className="ui-empty">Queue clear.</p>}
          </div>
        </div>
      )}

      {tab === 'reactivation' && (
        <div className="mod-card">
          <div className="mod-card__head">
            <div>
              <h2>Dormant leads</h2>
              <p className="mod-card__sub">No contact for 45+ days. A WhatsApp campaign re-approaches them; only replies reach the desk.</p>
            </div>
            <button
              type="button"
              className="ui-btn is-primary"
              disabled={!picked.size}
              onClick={() => {
                dispatch({ type: 'reactivate', ids: [...picked] })
                ui.toast(`Campaign sent to ${picked.size} lead${picked.size === 1 ? '' : 's'}`)
                setPicked(new Set())
              }}
            >
              <Send size={14} strokeWidth={1.8} /> Send WhatsApp campaign ({picked.size})
            </button>
          </div>
          <div className="ui-list">
            <label className="ui-row">
              <input type="checkbox" checked={picked.size === dormant.length && dormant.length > 0} onChange={(e) => setPicked(e.target.checked ? new Set(dormant.map((l) => l.id)) : new Set())} />
              <span className="grow">Select all ({dormant.length})</span>
            </label>
            {dormant.map((l) => (
              <label key={l.id} className="ui-row">
                <input
                  type="checkbox"
                  checked={picked.has(l.id)}
                  onChange={(e) => {
                    const n = new Set(picked)
                    if (e.target.checked) n.add(l.id)
                    else n.delete(l.id)
                    setPicked(n)
                  }}
                />
                <span className="grow">
                  {l.name}
                  <small>
                    {l.stage} · {l.source} · {inrCompact(l.budget)} · last contact {relTime(l.lastContactAt)}
                  </small>
                </span>
                <ScorePill score={l.score} />
              </label>
            ))}
            {!dormant.length && <p className="ui-empty">No dormant leads — everyone has been contacted recently.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
