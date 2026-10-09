import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { seedData } from '../data/mockData'
import type {
  Activity,
  ActivityStatus,
  AppData,
  Conversation,
  EntityRef,
  FollowUp,
  Lead,
  LeadStage,
  Message,
  Property,
  PropertyStatus,
  Visit,
  VisitStatus,
} from '../data/types'

const STORAGE_KEY = 'realty-os:data:v2'

export type Action =
  | { type: 'toggleSave'; id: string }
  | { type: 'setPropertyStatus'; id: string; status: PropertyStatus }
  | { type: 'addProperty'; property: Property }
  | { type: 'addLead'; lead: Lead }
  | { type: 'setLeadStage'; id: string; stage: LeadStage }
  | { type: 'assignLead'; id: string; agentId: string }
  | { type: 'addVisit'; visit: Visit }
  | { type: 'setVisitStatus'; id: string; status: VisitStatus }
  | { type: 'rescheduleVisit'; id: string; at: string }
  | { type: 'addFollowUp'; followUp: FollowUp }
  | { type: 'completeFollowUp'; id: string }
  | { type: 'escalateFollowUp'; id: string }
  | { type: 'createBooking'; propertyId: string; leadId: string }
  | { type: 'markBookingPaid'; id: string }
  | { type: 'sendMessage'; conversationId: string; text: string; from: Message['from'] }
  | { type: 'startConversation'; leadId: string }
  | { type: 'markConversationRead'; id: string }
  | { type: 'toggleAi'; id: string }
  | { type: 'markNotificationsRead' }
  | { type: 'reactivate'; ids: string[] }
  | { type: 'logCall'; leadId: string; note: string }
  | { type: 'reset' }

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const nowIso = () => new Date().toISOString()

function log(state: AppData, type: string, description: string, status: ActivityStatus, ref: EntityRef): AppData {
  const a: Activity = { id: uid('act'), at: nowIso(), type, description, status, ref }
  return { ...state, activities: [a, ...state.activities] }
}

const nameOf = (s: AppData, leadId: string) => s.leads.find((l) => l.id === leadId)?.name ?? 'Lead'
const titleOf = (s: AppData, propertyId: string) => s.properties.find((p) => p.id === propertyId)?.title ?? 'Property'

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'toggleSave': {
      const saved = state.savedPropertyIds.includes(action.id)
      return {
        ...state,
        savedPropertyIds: saved ? state.savedPropertyIds.filter((x) => x !== action.id) : [...state.savedPropertyIds, action.id],
      }
    }
    case 'setPropertyStatus': {
      const next = { ...state, properties: state.properties.map((p) => (p.id === action.id ? { ...p, status: action.status } : p)) }
      return log(next, 'Inventory Updated', `${titleOf(state, action.id)} marked ${action.status}`, 'Finished', { kind: 'property', id: action.id })
    }
    case 'addProperty': {
      const next = { ...state, properties: [action.property, ...state.properties] }
      return log(next, 'Property Listed', `${action.property.title} added to inventory`, 'Finished', { kind: 'property', id: action.property.id })
    }
    case 'addLead': {
      const next = { ...state, leads: [action.lead, ...state.leads] }
      return log(next, 'New Property Enquiry', `${action.lead.name} added manually · ${action.lead.source}`, 'Pending', { kind: 'lead', id: action.lead.id })
    }
    case 'setLeadStage': {
      const next = {
        ...state,
        leads: state.leads.map((l) => (l.id === action.id ? { ...l, stage: action.stage, lastContactAt: nowIso(), nextFollowUpAt: action.stage === 'Won' || action.stage === 'Lost' ? null : l.nextFollowUpAt } : l)),
      }
      const status: ActivityStatus = action.stage === 'Lost' ? 'Canceled' : action.stage === 'Won' ? 'Finished' : 'Pending'
      return log(next, action.stage === 'Won' ? 'Deal Confirmed' : 'Stage Changed', `${nameOf(state, action.id)} moved to ${action.stage}`, status, { kind: 'lead', id: action.id })
    }
    case 'assignLead': {
      const agent = state.agents.find((a) => a.id === action.agentId)
      const next = { ...state, leads: state.leads.map((l) => (l.id === action.id ? { ...l, ownerId: action.agentId } : l)) }
      return log(next, 'Agent Assigned', `${nameOf(state, action.id)} assigned to ${agent?.name}`, 'Finished', { kind: 'lead', id: action.id })
    }
    case 'addVisit': {
      const next = {
        ...state,
        visits: [action.visit, ...state.visits],
        leads: state.leads.map((l) =>
          l.id === action.visit.leadId && ['New Enquiry', 'Contacted', 'Qualified'].includes(l.stage) ? { ...l, stage: 'Site Visit Booked' as const } : l,
        ),
      }
      return log(next, 'Site Visit Scheduled', `${nameOf(state, action.visit.leadId)} · ${titleOf(state, action.visit.propertyId)}`, 'Pending', { kind: 'lead', id: action.visit.leadId })
    }
    case 'setVisitStatus': {
      const v = state.visits.find((x) => x.id === action.id)
      if (!v) return state
      let next: AppData = { ...state, visits: state.visits.map((x) => (x.id === action.id ? { ...x, status: action.status } : x)) }
      if (action.status === 'Completed') {
        next = { ...next, leads: next.leads.map((l) => (l.id === v.leadId && l.stage === 'Site Visit Booked' ? { ...l, stage: 'Visited' } : l)) }
      }
      if (action.status === 'No-show') {
        const fu: FollowUp = { id: uid('f'), leadId: v.leadId, agentId: v.agentId, dueAt: nowIso(), type: 'WhatsApp', note: 'Missed visit — send reschedule link', done: false, escalated: false }
        next = { ...next, followUps: [fu, ...next.followUps] }
      }
      const status: ActivityStatus = action.status === 'Completed' ? 'Finished' : action.status === 'Cancelled' || action.status === 'No-show' ? 'Canceled' : 'Pending'
      return log(next, `Visit ${action.status}`, `${nameOf(state, v.leadId)} · ${titleOf(state, v.propertyId)}`, status, { kind: 'lead', id: v.leadId })
    }
    case 'rescheduleVisit': {
      const v = state.visits.find((x) => x.id === action.id)
      if (!v) return state
      const next = { ...state, visits: state.visits.map((x) => (x.id === action.id ? { ...x, scheduledAt: action.at, status: 'Pending' as const, reminderSent: false } : x)) }
      return log(next, 'Visit Rescheduled', `${nameOf(state, v.leadId)} · reschedule link sent`, 'Pending', { kind: 'lead', id: v.leadId })
    }
    case 'addFollowUp': {
      const next = { ...state, followUps: [action.followUp, ...state.followUps], leads: state.leads.map((l) => (l.id === action.followUp.leadId ? { ...l, nextFollowUpAt: action.followUp.dueAt } : l)) }
      return log(next, 'Follow-up Reminder', `${action.followUp.type} with ${nameOf(state, action.followUp.leadId)} scheduled`, 'Pending', { kind: 'lead', id: action.followUp.leadId })
    }
    case 'completeFollowUp': {
      const f = state.followUps.find((x) => x.id === action.id)
      if (!f) return state
      const next = {
        ...state,
        followUps: state.followUps.map((x) => (x.id === action.id ? { ...x, done: true } : x)),
        leads: state.leads.map((l) => (l.id === f.leadId ? { ...l, lastContactAt: nowIso() } : l)),
      }
      return log(next, 'Follow-up Done', `${f.type} with ${nameOf(state, f.leadId)} completed`, 'Finished', { kind: 'lead', id: f.leadId })
    }
    case 'escalateFollowUp': {
      const f = state.followUps.find((x) => x.id === action.id)
      if (!f) return state
      // reassign to the next agent in rotation
      const idx = state.agents.findIndex((a) => a.id === f.agentId)
      const nextAgent = state.agents[(idx + 1) % state.agents.length]
      const next = {
        ...state,
        followUps: state.followUps.map((x) => (x.id === action.id ? { ...x, escalated: true, agentId: nextAgent.id } : x)),
        leads: state.leads.map((l) => (l.id === f.leadId ? { ...l, ownerId: nextAgent.id } : l)),
      }
      return log(next, 'Lead Escalated', `${nameOf(state, f.leadId)} reassigned to ${nextAgent.name}`, 'Pending', { kind: 'lead', id: f.leadId })
    }
    case 'createBooking': {
      const p = state.properties.find((x) => x.id === action.propertyId)
      if (!p) return state
      const booking = { id: uid('b'), propertyId: p.id, leadId: action.leadId, amount: Math.round((p.price * 0.05) / 10000) * 10000, status: 'Link sent' as const, createdAt: nowIso(), paidAt: null }
      const next = {
        ...state,
        bookings: [booking, ...state.bookings],
        properties: state.properties.map((x) => (x.id === p.id ? { ...x, status: 'Reserved' as const } : x)),
        leads: state.leads.map((l) => (l.id === action.leadId ? { ...l, stage: 'Negotiation' as const } : l)),
      }
      return log(next, 'Payment Link Sent', `${p.title} reserved for ${nameOf(state, action.leadId)}`, 'Pending', { kind: 'property', id: p.id })
    }
    case 'markBookingPaid': {
      const b = state.bookings.find((x) => x.id === action.id)
      if (!b) return state
      const p = state.properties.find((x) => x.id === b.propertyId)
      if (!p) return state
      const soldStatus: PropertyStatus = p.kind === 'Rent' ? 'Rented' : 'Sold'
      const next: AppData = {
        ...state,
        bookings: state.bookings.map((x) => (x.id === b.id ? { ...x, status: 'Paid', paidAt: nowIso() } : x)),
        properties: state.properties.map((x) => (x.id === p.id ? { ...x, status: soldStatus } : x)),
        leads: state.leads.map((l) => (l.id === b.leadId ? { ...l, stage: 'Won' as const, nextFollowUpAt: null } : l)),
        deals: [...state.deals, { id: uid('d'), propertyId: p.id, leadId: b.leadId, agentId: p.agentId, value: p.kind === 'Rent' ? p.price * 12 : p.price, kind: p.kind, closedAt: nowIso() }],
        notifications: [{ id: uid('n'), at: nowIso(), title: 'Payment cleared', body: `${p.title} marked ${soldStatus} automatically`, read: false, ref: { kind: 'property', id: p.id } }, ...state.notifications],
      }
      return log(next, 'Deal Confirmed', `${p.title} — payment cleared, inventory updated`, 'Finished', { kind: 'property', id: p.id })
    }
    case 'sendMessage': {
      const msg: Message = { id: uid('m'), from: action.from, text: action.text, at: nowIso() }
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      return {
        ...state,
        conversations: state.conversations.map((c) => (c.id === action.conversationId ? { ...c, messages: [...c.messages, msg] } : c)),
        leads: conv ? state.leads.map((l) => (l.id === conv.leadId ? { ...l, lastContactAt: nowIso() } : l)) : state.leads,
      }
    }
    case 'startConversation': {
      const existing = state.conversations.find((c) => c.leadId === action.leadId)
      if (existing) return state
      const lead = state.leads.find((l) => l.id === action.leadId)
      if (!lead) return state
      const c: Conversation = { id: `c-${lead.id}`, leadId: lead.id, channel: lead.channel === 'Voice' ? 'WhatsApp' : lead.channel, unread: 0, aiHandling: false, messages: [] }
      return { ...state, conversations: [c, ...state.conversations] }
    }
    case 'markConversationRead':
      return { ...state, conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, unread: 0 } : c)) }
    case 'toggleAi':
      return { ...state, conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, aiHandling: !c.aiHandling } : c)) }
    case 'markNotificationsRead':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'reactivate': {
      const ids = new Set(action.ids)
      const next = { ...state, leads: state.leads.map((l) => (ids.has(l.id) ? { ...l, stage: 'Contacted' as const, score: 'Warm' as const, lastContactAt: nowIso() } : l)) }
      return log(next, 'Lead Reactivated', `WhatsApp reactivation sent to ${action.ids.length} dormant lead${action.ids.length === 1 ? '' : 's'}`, 'Pending', { kind: 'lead', id: action.ids[0] })
    }
    case 'logCall': {
      const next = { ...state, leads: state.leads.map((l) => (l.id === action.leadId ? { ...l, lastContactAt: nowIso(), stage: l.stage === 'New Enquiry' ? ('Contacted' as const) : l.stage } : l)) }
      return log(next, 'Call Logged', `${nameOf(state, action.leadId)} — ${action.note}`, 'Finished', { kind: 'lead', id: action.leadId })
    }
    case 'reset':
      return seedData()
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

/** Demo dates are relative to first load; shift saved ones forward so "this month" stays current. */
function shiftDates<T>(value: T, delta: number): T {
  if (typeof value === 'string') return (ISO.test(value) ? new Date(new Date(value).getTime() + delta).toISOString() : value) as T
  if (Array.isArray(value)) return value.map((v) => shiftDates(v, delta)) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = shiftDates(v, delta)
    return out as T
  }
  return value
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as { savedAt: number; data: AppData }
      const delta = Date.now() - saved.savedAt
      return delta > 3600000 ? shiftDates(saved.data, delta) : saved.data
    }
  } catch {
    // storage unavailable or corrupt; fall back to seed
  }
  return seedData()
}

const DataCtx = createContext<AppData | null>(null)
const DispatchCtx = createContext<Dispatch<Action> | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data: state }))
    } catch {
      // ignore quota / private mode
    }
  }, [state])
  return (
    <DataCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </DataCtx.Provider>
  )
}

export function useData() {
  const v = useContext(DataCtx)
  if (!v) throw new Error('useData outside StoreProvider')
  return v
}

export function useDispatch() {
  const v = useContext(DispatchCtx)
  if (!v) throw new Error('useDispatch outside StoreProvider')
  return v
}

export { uid }

/** Provide a filtered view of the data to a subtree (e.g. a team scope on a dashboard). */
export function ScopedData({ scope, children }: { scope: (d: AppData) => AppData; children: ReactNode }) {
  const data = useData()
  const value = useMemo(() => scope(data), [scope, data])
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
