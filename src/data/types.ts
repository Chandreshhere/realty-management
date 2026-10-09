import type { AssetKey } from './assetManifest'

export type PropertyType = 'Plot' | 'Villa' | 'Apartment' | 'House' | 'Commercial'
export type PropertyStatus = 'Available' | 'Reserved' | 'Sold' | 'Rented'
export type ListingKind = 'Sale' | 'Rent'
export type Facing = 'North' | 'East' | 'South' | 'West' | 'North-East' | 'South-East'

export interface Property {
  id: string
  title: string
  project: string
  district: string
  address: string
  type: PropertyType
  kind: ListingKind
  /** INR. For rentals this is the monthly rent. */
  price: number
  sizeSqft: number
  beds: number
  baths: number
  parking: number
  facing: Facing
  status: PropertyStatus
  photo: AssetKey
  agentId: string
  views: number
  rating: number
  enquiries: number
  listedAt: string
}

export type LeadStage =
  | 'New Enquiry'
  | 'Contacted'
  | 'Qualified'
  | 'Site Visit Booked'
  | 'Visited'
  | 'Negotiation'
  | 'Won'
  | 'Lost'

export type LeadSource = '99acres' | 'MagicBricks' | 'Housing.com' | 'Meta Ads' | 'Google Ads' | 'Website'
export type LeadScore = 'Hot' | 'Warm' | 'Cold'
export type Channel = 'WhatsApp' | 'Voice' | 'SMS' | 'Email' | 'Instagram' | 'Website'

export interface CallSummary {
  at: string
  durationSec: number
  summary: string
  objections: string[]
  nextSteps: string[]
  handledBy: 'AI agent' | 'Agent'
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: LeadSource
  channel: Channel
  budget: number
  preferredDistrict: string
  preferredType: PropertyType
  preferredSizeSqft: number
  timeline: string
  stage: LeadStage
  score: LeadScore
  ownerId: string
  propertyInterestIds: string[]
  createdAt: string
  lastContactAt: string
  nextFollowUpAt: string | null
  firstResponseSec: number
  duplicatesMerged: number
  call?: CallSummary
}

export interface Agent {
  id: string
  name: string
  initials: string
  role: string
  tint: string
  phone: string
  email: string
  languages: string[]
}

export type VisitStatus = 'Confirmed' | 'Pending' | 'Completed' | 'No-show' | 'Cancelled'

export interface Visit {
  id: string
  leadId: string
  propertyId: string
  agentId: string
  scheduledAt: string
  status: VisitStatus
  bookedVia: 'Self-booked link' | 'AI agent' | 'Agent'
  reminderSent: boolean
  notes: string
}

export type FollowUpType = 'Call' | 'WhatsApp' | 'Email' | 'Visit reminder'

export interface FollowUp {
  id: string
  leadId: string
  agentId: string
  dueAt: string
  type: FollowUpType
  note: string
  done: boolean
  escalated: boolean
}

export type BookingStatus = 'Link sent' | 'Paid' | 'Expired'

export interface Booking {
  id: string
  propertyId: string
  leadId: string
  /** Token / booking amount in INR */
  amount: number
  status: BookingStatus
  createdAt: string
  paidAt: string | null
}

/** A closed transaction. Revenue, deal value and deal counts derive from these. */
export interface Deal {
  id: string
  propertyId: string | null
  leadId: string | null
  agentId: string
  value: number
  kind: ListingKind
  closedAt: string
}

export type ActivityStatus = 'Finished' | 'Pending' | 'Canceled'
export type EntityRef = { kind: 'lead' | 'property'; id: string }

export interface Activity {
  id: string
  at: string
  type: string
  description: string
  status: ActivityStatus
  ref: EntityRef
}

export interface Message {
  id: string
  from: 'lead' | 'agent' | 'ai'
  text: string
  at: string
}

export interface Conversation {
  id: string
  leadId: string
  channel: Channel
  unread: number
  aiHandling: boolean
  messages: Message[]
}

export interface Notification {
  id: string
  at: string
  title: string
  body: string
  read: boolean
  ref?: EntityRef
}

export interface SourceSpend {
  source: LeadSource
  /** Monthly spend, INR */
  spend: number
}

export interface AppData {
  properties: Property[]
  leads: Lead[]
  agents: Agent[]
  visits: Visit[]
  followUps: FollowUp[]
  bookings: Booking[]
  deals: Deal[]
  activities: Activity[]
  conversations: Conversation[]
  notifications: Notification[]
  sourceSpend: SourceSpend[]
  savedPropertyIds: string[]
}
