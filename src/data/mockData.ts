/**
 * Illustrative demo data — not live. Every dashboard figure is derived from
 * these collections (see src/lib/selectors.ts), so filters and summaries agree.
 * Dates are generated relative to the moment the app loads.
 */
import type {
  Activity,
  Agent,
  AppData,
  Booking,
  Channel,
  Conversation,
  Deal,
  FollowUp,
  FollowUpType,
  Lead,
  LeadScore,
  LeadSource,
  LeadStage,
  Notification,
  Property,
  PropertyType,
  Visit,
  VisitStatus,
} from './types'

export const BRAND = 'Realty OS'
export const CITY = 'Bengaluru'
export const currentUser = { name: 'Karan Shah', email: 'karan@realtyos.demo', role: 'Sales Head', initials: 'KS', tint: '#B7C3A1' }

export const LEAD_STAGES: LeadStage[] = [
  'New Enquiry',
  'Contacted',
  'Qualified',
  'Site Visit Booked',
  'Visited',
  'Negotiation',
  'Won',
  'Lost',
]
export const LEAD_SOURCES: LeadSource[] = ['99acres', 'MagicBricks', 'Housing.com', 'Meta Ads', 'Google Ads', 'Website']
export const CHANNELS: Channel[] = ['WhatsApp', 'Voice', 'SMS', 'Email', 'Instagram', 'Website']
export const PROPERTY_TYPES: PropertyType[] = ['Plot', 'Villa', 'Apartment', 'House', 'Commercial']
export const DISTRICTS = [
  'Indiranagar',
  'Koramangala',
  'HSR Layout',
  'Whitefield',
  'Sarjapur Road',
  'Hebbal',
  'Jayanagar',
  'MG Road',
  'Devanahalli',
] as const

// ---------------------------------------------------------------- helpers
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NOW = new Date()
const DAY = 86400000
function at(daysFromNow: number, hour = 10, minute = 0): string {
  const d = new Date(NOW.getTime() + daysFromNow * DAY)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------- agents
const agentSeed: [string, string, string, string[]][] = [
  ['Aarav Mehta', 'Senior Sales Manager', '#B9BFA6', ['English', 'Hindi']],
  ['Priya Sharma', 'Sales Executive', '#C9A27E', ['English', 'Hindi', 'Kannada']],
  ['Rohan Iyer', 'Site Visit Lead', '#D8C3AE', ['English', 'Tamil']],
  ['Ananya Rao', 'Sales Executive', '#D96C7E', ['English', 'Kannada', 'Telugu']],
  ['Kabir Khan', 'Channel Partner Manager', '#E39C8C', ['English', 'Hindi', 'Urdu']],
  ['Sneha Kulkarni', 'Sales Executive', '#A9B8C9', ['English', 'Marathi']],
  ['Vikram Nair', 'Plot Specialist', '#C4B59A', ['English', 'Malayalam']],
  ['Meera Pillai', 'Leasing Manager', '#BFA8C6', ['English', 'Malayalam', 'Tamil']],
  ['Arjun Reddy', 'Sales Executive', '#9FB7A8', ['English', 'Telugu']],
  ['Ishita Bose', 'Pre-sales Lead', '#D6B48E', ['English', 'Bengali', 'Hindi']],
  ['Karan Malhotra', 'Sales Executive', '#B3A79C', ['English', 'Punjabi', 'Hindi']],
  ['Neha Joshi', 'Relationship Manager', '#C7C0A0', ['English', 'Hindi']],
  ['Siddharth Menon', 'Commercial Leasing', '#A6B0B9', ['English', 'Malayalam']],
  ['Tanvi Desai', 'Sales Executive', '#D5A6A0', ['English', 'Gujarati']],
  ['Rahul Verma', 'Sales Executive', '#ACB89B', ['English', 'Hindi']],
  ['Pooja Shetty', 'Customer Success', '#CDB4A4', ['English', 'Kannada', 'Tulu']],
  ['Aditya Kapoor', 'Sales Executive', '#B8AFC4', ['English', 'Hindi']],
  ['Divya Krishnan', 'Pre-sales Executive', '#BFC7B4', ['English', 'Tamil']],
]

export const agents: Agent[] = agentSeed.map(([name, role, tint, languages], i) => ({
  id: `a${i + 1}`,
  name,
  role,
  tint,
  languages,
  initials: name
    .split(' ')
    .map((p) => p[0])
    .join(''),
  phone: `+91 98${String(450000 + i * 7919).padStart(6, '0').slice(0, 3)} ${String(10000 + i * 3571).slice(0, 5)}`,
  email: `${name.split(' ')[0].toLowerCase()}@realtyos.demo`,
}))

// ---------------------------------------------------------------- properties
type P = Omit<Property, 'id' | 'listedAt' | 'views' | 'enquiries' | 'address'> & { street: string; views?: number }
const propertySeed: P[] = [
  { title: 'Skyline Residences 4B', project: 'Skyline Residences', district: 'Indiranagar', street: '12th Main, HAL 2nd Stage', type: 'Apartment', kind: 'Sale', price: 14500000, sizeSqft: 1650, beds: 3, baths: 3, parking: 1, facing: 'East', status: 'Available', photo: 'apartment', agentId: 'a1', rating: 4.8, views: 1251 },
  { title: 'Palm Grove Villa', project: 'Palm Grove', district: 'Whitefield', street: 'Varthur Main Road', type: 'Villa', kind: 'Sale', price: 32000000, sizeSqft: 3400, beds: 4, baths: 4, parking: 2, facing: 'North-East', status: 'Available', photo: 'whiteVilla', agentId: 'a2', rating: 4.9, views: 1488 },
  { title: 'Lakeview Heights 12A', project: 'Lakeview Heights', district: 'Hebbal', street: 'Outer Ring Road, Kempapura', type: 'Apartment', kind: 'Rent', price: 85000, sizeSqft: 1850, beds: 3, baths: 3, parking: 1, facing: 'North', status: 'Available', photo: 'residentialTower', agentId: 'a8', rating: 4.7, views: 976 },
  { title: 'Cedar Court House', project: 'Cedar Court', district: 'Jayanagar', street: '9th Block, 30th Cross', type: 'House', kind: 'Sale', price: 23500000, sizeSqft: 2600, beds: 4, baths: 3, parking: 2, facing: 'East', status: 'Sold', photo: 'modernHouse', agentId: 'a3', rating: 4.6 },
  { title: 'Plot 42, Sunrise Enclave', project: 'Sunrise Enclave', district: 'Devanahalli', street: 'Airport Road, Phase 2', type: 'Plot', kind: 'Sale', price: 4800000, sizeSqft: 2400, beds: 0, baths: 0, parking: 0, facing: 'East', status: 'Sold', photo: 'skylineGreen', agentId: 'a7', rating: 4.5 },
  { title: 'Plot 17, Sunrise Enclave', project: 'Sunrise Enclave', district: 'Devanahalli', street: 'Airport Road, Phase 2', type: 'Plot', kind: 'Sale', price: 5200000, sizeSqft: 2400, beds: 0, baths: 0, parking: 0, facing: 'North-East', status: 'Reserved', photo: 'skylineGreen', agentId: 'a7', rating: 4.6 },
  { title: 'Plot 8, Green Acres', project: 'Green Acres', district: 'Sarjapur Road', street: 'Dommasandra Circle', type: 'Plot', kind: 'Sale', price: 6400000, sizeSqft: 3000, beds: 0, baths: 0, parking: 0, facing: 'East', status: 'Available', photo: 'skylineGreen', agentId: 'a7', rating: 4.4 },
  { title: 'Onyx Business Tower L9', project: 'Onyx Business Tower', district: 'MG Road', street: 'Residency Road', type: 'Commercial', kind: 'Rent', price: 180000, sizeSqft: 4200, beds: 0, baths: 2, parking: 4, facing: 'North', status: 'Rented', photo: 'highriseDusk', agentId: 'a13', rating: 4.7 },
  { title: 'Orchid Apartments 7A', project: 'Orchid Apartments', district: 'Koramangala', street: '5th Block, 17th Main', type: 'Apartment', kind: 'Sale', price: 11200000, sizeSqft: 1280, beds: 2, baths: 2, parking: 1, facing: 'South-East', status: 'Sold', photo: 'apartment', agentId: 'a4', rating: 4.6 },
  { title: 'Maple Row House', project: 'Maple Row', district: 'HSR Layout', street: 'Sector 2, 27th Main', type: 'House', kind: 'Sale', price: 19500000, sizeSqft: 2200, beds: 3, baths: 3, parking: 2, facing: 'West', status: 'Available', photo: 'modernHouse', agentId: 'a5', rating: 4.5 },
  { title: 'Azure Towers 15C', project: 'Azure Towers', district: 'Hebbal', street: 'Bellary Road', type: 'Apartment', kind: 'Sale', price: 9800000, sizeSqft: 1150, beds: 2, baths: 2, parking: 1, facing: 'North', status: 'Sold', photo: 'residentialTower', agentId: 'a6', rating: 4.3 },
  { title: 'Glasshouse Offices', project: 'Glasshouse', district: 'Whitefield', street: 'ITPL Main Road', type: 'Commercial', kind: 'Sale', price: 64000000, sizeSqft: 9800, beds: 0, baths: 4, parking: 10, facing: 'East', status: 'Available', photo: 'skylineGlass', agentId: 'a13', rating: 4.8 },
  { title: 'Whispering Pines 12B', project: 'Whispering Pines', district: 'Sarjapur Road', street: 'Kaikondrahalli', type: 'Apartment', kind: 'Rent', price: 48000, sizeSqft: 1350, beds: 2, baths: 2, parking: 1, facing: 'East', status: 'Rented', photo: 'apartment', agentId: 'a8', rating: 4.4 },
  { title: 'Emerald Villa 3', project: 'Emerald Villas', district: 'Devanahalli', street: 'Nandi Hills Road', type: 'Villa', kind: 'Sale', price: 28500000, sizeSqft: 3100, beds: 4, baths: 4, parking: 2, facing: 'North-East', status: 'Reserved', photo: 'whiteVilla', agentId: 'a2', rating: 4.8 },
  { title: 'Plot 23, Green Acres', project: 'Green Acres', district: 'Sarjapur Road', street: 'Dommasandra Circle', type: 'Plot', kind: 'Sale', price: 5800000, sizeSqft: 2700, beds: 0, baths: 0, parking: 0, facing: 'North', status: 'Sold', photo: 'skylineGreen', agentId: 'a9', rating: 4.3 },
  { title: 'Cubbon View Penthouse', project: 'Cubbon View', district: 'MG Road', street: 'Kasturba Road', type: 'Apartment', kind: 'Sale', price: 46000000, sizeSqft: 3600, beds: 4, baths: 5, parking: 3, facing: 'East', status: 'Available', photo: 'highriseDusk', agentId: 'a1', rating: 4.9 },
  { title: 'Banyan Courtyard House', project: 'Banyan Courtyard', district: 'Koramangala', street: '3rd Block, 8th Cross', type: 'House', kind: 'Rent', price: 120000, sizeSqft: 2900, beds: 4, baths: 4, parking: 2, facing: 'North', status: 'Rented', photo: 'modernHouse', agentId: 'a8', rating: 4.7 },
  { title: 'Plot 5, Riverstone Layout', project: 'Riverstone Layout', district: 'Hebbal', street: 'Thanisandra Main Road', type: 'Plot', kind: 'Sale', price: 11500000, sizeSqft: 4000, beds: 0, baths: 0, parking: 0, facing: 'East', status: 'Sold', photo: 'skylineGreen', agentId: 'a7', rating: 4.5 },
  { title: 'Indigo Heights 9D', project: 'Indigo Heights', district: 'Indiranagar', street: '100 Feet Road', type: 'Apartment', kind: 'Sale', price: 16800000, sizeSqft: 1720, beds: 3, baths: 3, parking: 2, facing: 'South-East', status: 'Sold', photo: 'residentialTower', agentId: 'a10', rating: 4.6 },
  { title: 'Sunset Terrace Villa', project: 'Sunset Terrace', district: 'HSR Layout', street: 'Sector 6, Agara Lake Road', type: 'Villa', kind: 'Sale', price: 37500000, sizeSqft: 3250, beds: 4, baths: 5, parking: 2, facing: 'West', status: 'Sold', photo: 'whiteVilla', agentId: 'a2', rating: 4.8 },
  { title: 'Metro Square Shop 4', project: 'Metro Square', district: 'Jayanagar', street: '4th Block, 11th Main', type: 'Commercial', kind: 'Rent', price: 95000, sizeSqft: 1100, beds: 0, baths: 1, parking: 1, facing: 'North', status: 'Rented', photo: 'skylineGlass', agentId: 'a13', rating: 4.2 },
  { title: 'Plot 31, Riverstone Layout', project: 'Riverstone Layout', district: 'Hebbal', street: 'Thanisandra Main Road', type: 'Plot', kind: 'Sale', price: 10500000, sizeSqft: 3600, beds: 0, baths: 0, parking: 0, facing: 'North-East', status: 'Reserved', photo: 'skylineGreen', agentId: 'a7', rating: 4.5 },
  { title: 'Cedar Lane Duplex', project: 'Cedar Lane', district: 'Whitefield', street: 'Hope Farm Junction', type: 'House', kind: 'Sale', price: 21000000, sizeSqft: 2450, beds: 3, baths: 4, parking: 2, facing: 'East', status: 'Sold', photo: 'modernHouse', agentId: 'a11', rating: 4.6 },
  { title: 'Orchid Apartments 11B', project: 'Orchid Apartments', district: 'Koramangala', street: '5th Block, 17th Main', type: 'Apartment', kind: 'Sale', price: 12400000, sizeSqft: 1350, beds: 3, baths: 2, parking: 1, facing: 'East', status: 'Available', photo: 'apartment', agentId: 'a4', rating: 4.5 },
]

const rnd = mulberry32(20261009)
export const properties: Property[] = propertySeed.map(({ street, views, ...p }, i) => ({
  ...p,
  id: `p${i + 1}`,
  address: `${street}, ${p.district}, ${CITY}`,
  views: views ?? 320 + Math.round(rnd() * 1400),
  enquiries: 4 + Math.round(rnd() * 30),
  listedAt: at(-(8 + Math.round(rnd() * 160))),
}))

// ---------------------------------------------------------------- leads
const firstNames = ['Aditi', 'Rajesh', 'Fatima', 'Harish', 'Lakshmi', 'Nikhil', 'Sana', 'Varun', 'Gayatri', 'Imran', 'Kavya', 'Manoj', 'Nandini', 'Omkar', 'Pallavi', 'Qasim', 'Ritu', 'Sameer', 'Trisha', 'Uday', 'Vandana', 'Yash', 'Zoya', 'Abhinav', 'Bhavna', 'Chetan', 'Deepa', 'Eshan', 'Farhan', 'Geeta', 'Hemant', 'Irfan']
const lastNames = ['Agarwal', 'Bhat', 'Chopra', 'Dutta', 'Gowda', 'Hussain', 'Jain', 'Kamath', 'Lobo', 'Mishra', 'Narayan', 'Patil', 'Qureshi', 'Rangan', 'Saxena', 'Thomas', 'Upadhyay', 'Venkatesh']
const timelines = ['Immediate', 'Within 1 month', '1–3 months', '3–6 months', '6+ months']
const stagePlan: [LeadStage, number][] = [
  ['New Enquiry', 10],
  ['Contacted', 9],
  ['Qualified', 10],
  ['Site Visit Booked', 8],
  ['Visited', 7],
  ['Negotiation', 6],
  ['Won', 8],
  ['Lost', 6],
]
const sourceWeights: [LeadSource, number][] = [
  ['99acres', 14],
  ['MagicBricks', 11],
  ['Housing.com', 9],
  ['Meta Ads', 13],
  ['Google Ads', 10],
  ['Website', 7],
]
const districtWeights: [string, number][] = [
  ['Koramangala', 17],
  ['Indiranagar', 12],
  ['Whitefield', 7],
  ['Devanahalli', 8],
  ['HSR Layout', 7],
  ['Sarjapur Road', 6],
  ['Hebbal', 5],
  ['MG Road', 3],
  ['Jayanagar', 2],
]

function pickWeighted<T>(items: [T, number][], r: number): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let x = r * total
  for (const [v, w] of items) {
    x -= w
    if (x <= 0) return v
  }
  return items[items.length - 1][0]
}

const sourceChannel: Record<LeadSource, Channel> = {
  '99acres': 'WhatsApp',
  MagicBricks: 'WhatsApp',
  'Housing.com': 'SMS',
  'Meta Ads': 'Instagram',
  'Google Ads': 'Voice',
  Website: 'Website',
}

const leadRnd = mulberry32(42)
let leadIndex = 0
export const leads: Lead[] = stagePlan.flatMap(([stage, n]) =>
  Array.from({ length: n }, () => {
    const i = leadIndex++
    const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 7) % lastNames.length]}`
    const source = pickWeighted(sourceWeights, leadRnd())
    const district = pickWeighted(districtWeights, leadRnd())
    const inDistrict = properties.filter((p) => p.district === district)
    const preferredType: PropertyType = inDistrict.length ? inDistrict[i % inDistrict.length].type : 'Plot'
    const budgetBase = { Plot: 6000000, Villa: 30000000, Apartment: 13000000, House: 21000000, Commercial: 45000000 }[preferredType]
    const budget = Math.round((budgetBase * (0.8 + leadRnd() * 0.5)) / 100000) * 100000
    const created = -(1 + Math.round(leadRnd() * (stage === 'Lost' ? 120 : stage === 'New Enquiry' ? 3 : 45)))
    const lastContact = stage === 'Lost' ? created + 4 : Math.min(0, created + Math.round(leadRnd() * Math.abs(created)))
    const score: LeadScore =
      stage === 'Lost' || (stage === 'New Enquiry' && leadRnd() < 0.3)
        ? 'Cold'
        : ['Negotiation', 'Won', 'Site Visit Booked', 'Visited'].includes(stage)
          ? 'Hot'
          : leadRnd() < 0.45
            ? 'Hot'
            : 'Warm'
    const interest = inDistrict.length ? [inDistrict[i % inDistrict.length].id] : []
    const followUp = stage === 'Won' || stage === 'Lost' ? null : at(Math.round(leadRnd() * 6) - 2, 9 + (i % 8), (i * 13) % 60)
    const lead: Lead = {
      id: `l${i + 1}`,
      name,
      phone: `+91 9${String(8000 + ((i * 7907) % 1999)).padStart(4, '0')} ${String(10000 + ((i * 3343) % 89999)).padStart(5, '0')}`,
      email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}@mail.demo`,
      source,
      channel: sourceChannel[source],
      budget,
      preferredDistrict: district,
      preferredType,
      preferredSizeSqft: preferredType === 'Plot' ? 2400 + (i % 4) * 600 : 1200 + (i % 6) * 300,
      timeline: timelines[i % timelines.length],
      stage,
      score,
      ownerId: agents[i % agents.length].id,
      propertyInterestIds: interest,
      createdAt: at(created, 9 + (i % 9), (i * 17) % 60),
      lastContactAt: at(lastContact, 11 + (i % 7), (i * 11) % 60),
      nextFollowUpAt: followUp,
      firstResponseSec: i % 11 === 0 ? 74 + (i % 40) : 18 + Math.round(leadRnd() * 38),
      duplicatesMerged: i % 6 === 0 ? 1 + (i % 2) : 0,
    }
    if (['Qualified', 'Site Visit Booked', 'Visited', 'Negotiation', 'Won'].includes(stage)) {
      lead.call = {
        at: at(lastContact, 12, 20),
        durationSec: 180 + ((i * 37) % 420),
        handledBy: i % 3 === 0 ? 'Agent' : 'AI agent',
        summary: `${name.split(' ')[0]} is looking for a ${preferredType.toLowerCase()} in ${district} around ${(budget / 100000).toFixed(0)} L, ${timelines[i % timelines.length].toLowerCase()}. Prefers ${['east', 'north-east', 'north'][i % 3]} facing and asked about loan tie-ups.`,
        objections: [['Price is above budget by ~8%', 'Wants a corner unit', 'Concerned about possession date', 'Comparing with a project in Hennur'][i % 4]],
        nextSteps: [['Share revised price sheet on WhatsApp', 'Book a Saturday site visit', 'Send bank pre-approval contacts', 'Call back after family discussion'][i % 4]],
      }
    }
    return lead
  }),
)

// ---------------------------------------------------------------- visits
const visitStatuses: VisitStatus[] = ['Completed', 'Completed', 'No-show', 'Completed', 'Confirmed', 'Confirmed', 'Pending', 'Confirmed', 'Pending', 'Confirmed', 'Cancelled', 'Confirmed']
const visitLeads = leads.filter((l) => ['Site Visit Booked', 'Visited', 'Negotiation', 'Qualified'].includes(l.stage))
export const visits: Visit[] = visitLeads.slice(0, 22).map((l, i) => {
  const offset = i - 9 // spread from 9 days ago to ~12 days ahead
  const status: VisitStatus =
    offset < 0 ? (l.stage === 'Visited' || l.stage === 'Negotiation' ? 'Completed' : visitStatuses[i % 4]) : offset === 0 ? 'Confirmed' : visitStatuses[4 + (i % 8)]
  const property = properties.find((p) => p.id === l.propertyInterestIds[0]) ?? properties[i % properties.length]
  return {
    id: `v${i + 1}`,
    leadId: l.id,
    propertyId: property.id,
    agentId: property.agentId,
    scheduledAt: at(Math.round(offset * 0.6), 10 + (i % 7), i % 2 ? 30 : 0),
    status,
    bookedVia: (['Self-booked link', 'AI agent', 'Agent'] as const)[i % 3],
    reminderSent: offset >= 0 && status !== 'Pending',
    notes: ['Wants to see the clubhouse too', 'Bringing parents along', 'Needs parking for two cars', 'Check corner plot availability', ''][i % 5],
  }
})

// ---------------------------------------------------------------- follow-ups
const fuTypes: FollowUpType[] = ['Call', 'WhatsApp', 'Email', 'Visit reminder']
const fuNotes = ['Day-3 follow-up after brochure', 'Share revised payment plan', 'Confirm Saturday visit slot', 'Check on loan pre-approval', 'Send floor plan + price sheet', 'Day-7 nudge, no reply yet']
export const followUps: FollowUp[] = leads
  .filter((l) => l.nextFollowUpAt)
  .slice(0, 26)
  .map((l, i) => ({
    id: `f${i + 1}`,
    leadId: l.id,
    agentId: l.ownerId,
    dueAt: l.nextFollowUpAt as string,
    type: fuTypes[i % fuTypes.length],
    note: fuNotes[i % fuNotes.length],
    done: i % 9 === 4,
    escalated: i % 7 === 3,
  }))

// ---------------------------------------------------------------- bookings
const wonLeads = leads.filter((l) => l.stage === 'Won' || l.stage === 'Negotiation')
export const bookings: Booking[] = [
  ...properties
    .filter((p) => p.status === 'Reserved')
    .map((p, i) => ({
      id: `b${i + 1}`,
      propertyId: p.id,
      leadId: wonLeads[i].id,
      amount: Math.round((p.price * 0.05) / 10000) * 10000,
      status: 'Link sent' as const,
      createdAt: at(-1 - i, 15, 10),
      paidAt: null,
    })),
  ...properties
    .filter((p) => p.status === 'Sold')
    .slice(0, 4)
    .map((p, i) => ({
      id: `b${10 + i}`,
      propertyId: p.id,
      leadId: wonLeads[3 + i].id,
      amount: Math.round((p.price * 0.05) / 10000) * 10000,
      status: 'Paid' as const,
      createdAt: at(-6 - i * 4, 11, 0),
      paidAt: at(-5 - i * 4, 16, 40),
    })),
]

// ---------------------------------------------------------------- deals (12 months of closings)
const dealRnd = mulberry32(7)
export const deals: Deal[] = []
for (let d = 364; d >= 0; d--) {
  // ~1 closing per day, a little busier at weekends; last 30 days tuned to 32
  const base = d < 30 ? (d % 15 === 0 ? 2 : d % 7 === 0 ? 2 : 1) : dealRnd() < 0.92 ? 1 : dealRnd() < 0.5 ? 2 : 0
  for (let k = 0; k < base; k++) {
    const r = dealRnd()
    const isRent = r < 0.18
    const value = isRent
      ? Math.round((40000 + dealRnd() * 140000) * 12 / 1000) * 1000
      : r < 0.62
        ? Math.round((3800000 + dealRnd() * 5200000) / 10000) * 10000
        : Math.round((8500000 + dealRnd() * 30000000) / 10000) * 10000
    deals.push({
      id: `d${deals.length + 1}`,
      propertyId: null,
      leadId: null,
      agentId: agents[Math.floor(dealRnd() * agents.length)].id,
      value,
      kind: isRent ? 'Rent' : 'Sale',
      closedAt: at(-d, 11 + (k * 3) % 8, (k * 23) % 60),
    })
  }
}

// ---------------------------------------------------------------- activity feed
const leadBy = (stage: LeadStage, n = 0) => leads.filter((l) => l.stage === stage)[n]
export const activities: Activity[] = (
  [
    [0, 9, 'New Property Enquiry', `${leadBy('New Enquiry').name} enquired on Skyline Residences 4B via 99acres`, 'Pending', { kind: 'lead', id: leadBy('New Enquiry').id }],
    [0, 8, 'AI Qualification', `AI agent scored ${leadBy('Contacted').name} Hot — budget ₹1.4 Cr, Indiranagar`, 'Finished', { kind: 'lead', id: leadBy('Contacted').id }],
    [-1, 17, 'Site Visit Scheduled', `${leadBy('Site Visit Booked').name} self-booked a visit to Palm Grove Villa`, 'Pending', { kind: 'lead', id: leadBy('Site Visit Booked').id }],
    [-1, 15, 'Payment Link Sent', 'Booking link sent for Plot 17, Sunrise Enclave', 'Pending', { kind: 'property', id: 'p6' }],
    [-2, 13, 'Deal Confirmed', 'Sunset Terrace Villa sold — payment cleared, inventory updated', 'Finished', { kind: 'property', id: 'p20' }],
    [-2, 11, 'Follow-up Reminder', `Day-3 follow-up due for ${leadBy('Qualified', 1).name}`, 'Pending', { kind: 'lead', id: leadBy('Qualified', 1).id }],
    [-3, 16, 'Proposal Viewed', `${leadBy('Negotiation').name} opened the Emerald Villa 3 price sheet`, 'Finished', { kind: 'lead', id: leadBy('Negotiation').id }],
    [-3, 10, 'Agent Assigned', `${leadBy('Qualified', 2).name} assigned to ${agents[2].name} by round robin`, 'Finished', { kind: 'lead', id: leadBy('Qualified', 2).id }],
    [-4, 18, 'Site Visit No-show', `${leadBy('Site Visit Booked', 1).name} missed the visit — reschedule link sent`, 'Canceled', { kind: 'lead', id: leadBy('Site Visit Booked', 1).id }],
    [-5, 12, 'Lead Reactivated', `${leadBy('Lost').name} replied to the WhatsApp reactivation campaign`, 'Finished', { kind: 'lead', id: leadBy('Lost').id }],
    [-5, 9, 'Call Summarised', `Call with ${leadBy('Visited').name} transcribed — objection: possession date`, 'Finished', { kind: 'lead', id: leadBy('Visited').id }],
    [-6, 14, 'Proposal Declined', `${leadBy('Lost', 1).name} chose another builder`, 'Canceled', { kind: 'lead', id: leadBy('Lost', 1).id }],
    [-7, 11, 'Deal Confirmed', 'Indigo Heights 9D sold to a Housing.com lead', 'Finished', { kind: 'property', id: 'p19' }],
  ] as const
).map(([d, h, type, description, status, ref], i) => ({ id: `act${i + 1}`, at: at(d, h, (i * 7) % 60), type, description, status, ref: { ...ref } }))

// ---------------------------------------------------------------- conversations
function convo(leadIdx: number, channel: Channel, aiHandling: boolean, unread: number, lines: [Conversation['messages'][number]['from'], string, number][]): Conversation {
  const lead = leads[leadIdx]
  return {
    id: `c${leadIdx}`,
    leadId: lead.id,
    channel,
    unread,
    aiHandling,
    messages: lines.map(([from, text, minsAgo], i) => ({ id: `m${leadIdx}-${i}`, from, text, at: new Date(NOW.getTime() - minsAgo * 60000).toISOString() })),
  }
}
export const conversations: Conversation[] = [
  convo(0, 'WhatsApp', true, 2, [
    ['lead', 'Hi, saw Skyline Residences on 99acres. Is the 3BHK still available?', 42],
    ['ai', 'Hi! Yes — 4B (1,650 sq ft, east facing) is available at ₹1.45 Cr. Sharing the brochure and price sheet now 📎', 41],
    ['lead', 'What is the possession date? And is car parking included?', 18],
    ['ai', 'Ready to move, with one covered parking included. Would you like to visit this Saturday? I can book 11 AM or 4 PM.', 17],
    ['lead', '4 PM works. My wife will come too.', 6],
  ]),
  convo(12, 'Voice', false, 0, [
    ['ai', 'Call transcript · 6m 12s · AI qualification call', 300],
    ['lead', 'Looking for a corner plot, east facing, 2,400 sq ft or bigger. Budget about 60 lakhs.', 299],
    ['ai', 'Captured: budget ₹60 L · Devanahalli/Sarjapur · 2,400+ sq ft · 1–3 months. Scored Hot and handed to Vikram.', 296],
    ['agent', 'Vikram here — Plot 8, Green Acres fits your brief. Sharing the layout map now.', 120],
  ]),
  convo(5, 'Instagram', true, 1, [
    ['lead', 'Price for the villa in your reel?', 95],
    ['ai', 'That’s Palm Grove Villa in Whitefield — 4 BHK, 3,400 sq ft, ₹3.2 Cr. Want the walkthrough video?', 94],
    ['lead', 'Yes please', 30],
  ]),
  convo(21, 'Email', false, 0, [
    ['lead', 'Could you send the payment schedule for Emerald Villa 3?', 1500],
    ['agent', 'Attached the schedule. The booking amount is ₹14.25 L; the payment link is in the same mail.', 1380],
  ]),
  convo(33, 'SMS', true, 0, [
    ['ai', 'Reminder: your site visit to Maple Row House is tomorrow at 11:00 AM. Reply 1 to confirm, 2 to reschedule.', 240],
    ['lead', '1', 232],
    ['ai', 'Confirmed ✅ Rohan will meet you at the gate. Location: maps.demo/maple-row', 231],
  ]),
  convo(40, 'Website', true, 3, [
    ['lead', 'Do you have rentals in Koramangala under 1.3L?', 14],
    ['ai', 'Banyan Courtyard House just got rented, but I can alert you when a match opens. Want me to share two options in HSR Layout?', 13],
    ['lead', 'Sure, and can someone call me?', 4],
  ]),
  convo(58, 'WhatsApp', false, 0, [
    ['ai', 'Hi Trisha, it’s been a while! New plots opened at Riverstone Layout from ₹1.05 Cr — interested in a look?', 4300],
    ['lead', 'Actually yes, we’re looking again. Send details.', 2900],
    ['agent', 'Great to hear from you! Sending the layout and price sheet now.', 2850],
  ]),
]

// ---------------------------------------------------------------- notifications
export const notifications: Notification[] = [
  { id: 'n1', at: at(0, 9, 12), title: 'New hot lead', body: `${leads[2].name} · ${leads[2].source} · scored Hot by AI`, read: false, ref: { kind: 'lead', id: leads[2].id } },
  { id: 'n2', at: at(0, 8, 40), title: 'Follow-up overdue', body: `${followUps[1] ? leads.find((l) => l.id === followUps[1].leadId)?.name : ''} — escalated to team lead`, read: false, ref: { kind: 'lead', id: followUps[1].leadId } },
  { id: 'n3', at: at(-1, 17, 5), title: 'Visit self-booked', body: 'Palm Grove Villa · Saturday 11:00 AM', read: false, ref: { kind: 'property', id: 'p2' } },
  { id: 'n4', at: at(-2, 13, 30), title: 'Payment cleared', body: 'Sunset Terrace Villa marked Sold automatically', read: true, ref: { kind: 'property', id: 'p20' } },
  { id: 'n5', at: at(-3, 10, 0), title: 'Reactivation campaign', body: '14 dormant leads replied to the WhatsApp campaign', read: true },
]

export const sourceSpend = [
  { source: '99acres' as const, spend: 185000 },
  { source: 'MagicBricks' as const, spend: 160000 },
  { source: 'Housing.com' as const, spend: 120000 },
  { source: 'Meta Ads' as const, spend: 240000 },
  { source: 'Google Ads' as const, spend: 210000 },
  { source: 'Website' as const, spend: 35000 },
]

export function seedData(): AppData {
  return structuredClone({
    properties,
    leads,
    agents,
    visits,
    followUps,
    bookings,
    deals,
    activities,
    conversations,
    notifications,
    sourceSpend,
    savedPropertyIds: ['p2'],
  })
}
