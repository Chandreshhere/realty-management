import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bot, Camera, Globe, Mail, MessageCircle, MessageSquareText, Phone, Send, UserRound } from 'lucide-react'
import { useData, useDispatch } from '../../store/store'
import { useUI } from '../../store/ui'
import { ModuleHeader, Tabs } from '../../components/modules/kit'
import { ScorePill } from '../../components/shared/bits'
import { CHANNELS } from '../../data/mockData'
import { fmtTime, inrCompact, relTime } from '../../lib/format'
import type { Channel } from '../../data/types'

const CHANNEL_ICON: Record<Channel, typeof MessageCircle> = {
  WhatsApp: MessageCircle,
  Voice: Phone,
  SMS: MessageSquareText,
  Email: Mail,
  Instagram: Camera,
  Website: Globe,
}

export default function MessagesPage() {
  const data = useData()
  const dispatch = useDispatch()
  const ui = useUI()
  const [sp, setSp] = useSearchParams()
  const [channel, setChannel] = useState<Channel | 'All'>('All')
  const [draft, setDraft] = useState('')
  const threadRef = useRef<HTMLDivElement | null>(null)

  const list = useMemo(
    () =>
      data.conversations
        .filter((c) => channel === 'All' || c.channel === channel)
        .sort((a, b) => (b.messages.at(-1)?.at ?? '').localeCompare(a.messages.at(-1)?.at ?? '')),
    [data.conversations, channel],
  )
  const leadParam = sp.get('lead')
  const selected = data.conversations.find((c) => c.leadId === leadParam) ?? list[0]
  const lead = selected ? data.leads.find((l) => l.id === selected.leadId) : undefined

  useEffect(() => {
    if (selected?.unread) dispatch({ type: 'markConversationRead', id: selected.id })
  }, [selected?.id, selected?.unread, dispatch])
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [selected?.id, selected?.messages.length])

  const send = () => {
    if (!selected || !draft.trim()) return
    dispatch({ type: 'sendMessage', conversationId: selected.id, text: draft.trim(), from: 'agent' })
    setDraft('')
  }

  return (
    <div className="mod">
      <ModuleHeader title="Conversations" subtitle="One inbox across WhatsApp, voice, SMS, email, Instagram and the website widget — the AI agent answers first and hands over mid-thread." />
      <div className="mod-bar">
        <Tabs
          label="Channel"
          value={channel}
          onChange={setChannel}
          items={[{ value: 'All' as const, label: 'All', count: data.conversations.length }, ...CHANNELS.map((c) => ({ value: c, label: c, count: data.conversations.filter((x) => x.channel === c).length }))]}
        />
      </div>
      <div className="mod-inbox">
        <aside className="mod-card mod-inbox__list" aria-label="Conversations">
          {list.map((c) => {
            const l = data.leads.find((x) => x.id === c.leadId)
            const last = c.messages.at(-1)
            const Icon = CHANNEL_ICON[c.channel]
            return (
              <button key={c.id} type="button" className={`mod-thread${selected?.id === c.id ? ' is-on' : ''}`} onClick={() => setSp({ lead: c.leadId }, { replace: true })}>
                <span className="mod-thread__icon">
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <span className="grow">
                  <span className="mod-thread__top">
                    <strong>{l?.name}</strong>
                    <small>{last ? relTime(last.at) : 'new'}</small>
                  </span>
                  <small className="mod-thread__last">
                    {last ? `${last.from === 'ai' ? 'AI: ' : last.from === 'agent' ? 'You: ' : ''}${last.text}` : 'No messages yet'}
                  </small>
                </span>
                {c.unread > 0 && <span className="mod-thread__badge tnum">{c.unread}</span>}
              </button>
            )
          })}
          {!list.length && <p className="ui-empty" style={{ padding: 16 }}>No conversations on this channel.</p>}
        </aside>

        {selected && lead ? (
          <section className="mod-card mod-inbox__thread" aria-label={`Conversation with ${lead.name}`}>
            <header className="mod-inbox__head">
              <button type="button" className="grow" style={{ textAlign: 'left' }} onClick={() => ui.open({ kind: 'lead', id: lead.id })}>
                <strong>{lead.name}</strong>
                <small>
                  {selected.channel} · {lead.phone} · {lead.stage}
                </small>
              </button>
              <ScorePill score={lead.score} />
              <button
                type="button"
                className={`ui-btn is-sm${selected.aiHandling ? ' is-primary' : ' is-ghost'}`}
                aria-pressed={selected.aiHandling}
                onClick={() => {
                  dispatch({ type: 'toggleAi', id: selected.id })
                  ui.toast(selected.aiHandling ? 'You took over — AI agent paused' : 'AI agent resumed on this thread')
                }}
              >
                <Bot size={14} strokeWidth={1.8} /> {selected.aiHandling ? 'AI handling' : 'You’re handling'}
              </button>
            </header>
            <div className="mod-inbox__msgs" ref={threadRef}>
              {selected.messages.map((m) => (
                <div key={m.id} className={`mod-msg is-${m.from}`}>
                  <span className="mod-msg__who">
                    {m.from === 'ai' ? <Bot size={12} strokeWidth={1.8} /> : m.from === 'agent' ? <UserRound size={12} strokeWidth={1.8} /> : null}
                    {m.from === 'ai' ? 'AI agent' : m.from === 'agent' ? 'Agent' : lead.name.split(' ')[0]} · {fmtTime(m.at)}
                  </span>
                  <p>{m.text}</p>
                </div>
              ))}
              {!selected.messages.length && <p className="ui-empty">Start the conversation — it’s logged on {lead.name}’s record.</p>}
            </div>
            <form
              className="mod-inbox__compose"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Reply on ${selected.channel}…`} aria-label="Message" />
              <button type="submit" className="ui-btn is-primary" disabled={!draft.trim()}>
                <Send size={14} strokeWidth={1.8} /> Send
              </button>
            </form>
          </section>
        ) : (
          <section className="mod-card mod-inbox__thread">
            <p className="ui-empty" style={{ padding: 24 }}>
              Pick a conversation.
            </p>
          </section>
        )}

        {lead && (
          <aside className="mod-card mod-inbox__side" aria-label="Lead details">
            <h2>Captured by AI</h2>
            <dl className="ui-kv" style={{ gridTemplateColumns: '1fr' }}>
              <div>
                <dt>Budget</dt>
                <dd>{inrCompact(lead.budget)}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{lead.preferredDistrict}</dd>
              </div>
              <div>
                <dt>Looking for</dt>
                <dd>
                  {lead.preferredType} · {lead.preferredSizeSqft} sq ft
                </dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>{lead.timeline}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{lead.source}</dd>
              </div>
            </dl>
            <button type="button" className="ui-btn is-sm" style={{ width: '100%', marginTop: 14 }} onClick={() => ui.open({ kind: 'create', what: 'visit', leadId: lead.id })}>
              Book site visit
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}
