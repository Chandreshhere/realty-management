import type { AppData, Deal, Lead, LeadSource, Property } from '../data/types'
import { LEAD_SOURCES } from '../data/mockData'

const DAY = 86400000
const now = () => Date.now()
const inLast = (iso: string, days: number, offsetDays = 0) => {
  const t = new Date(iso).getTime()
  const end = now() - offsetDays * DAY
  return t <= end && t > end - days * DAY
}
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export const isActiveLead = (l: Lead) => l.stage !== 'Won' && l.stage !== 'Lost'

// ---------------------------------------------------------------- inventory
export function inventoryStats(properties: Property[]) {
  const by = (s: Property['status']) => properties.filter((p) => p.status === s)
  const sold = by('Sold')
  const rented = by('Rented')
  return {
    total: properties.length,
    available: by('Available').length,
    reserved: by('Reserved').length,
    sold: sold.length,
    rented: rented.length,
    soldValue: sum(sold.filter((p) => p.kind === 'Sale').map((p) => p.price)),
    /** Annualised rent roll of rented units */
    rentedValue: sum(rented.map((p) => p.price * 12)),
  }
}

// ---------------------------------------------------------------- deals & revenue
export function dealStats(deals: Deal[], days = 30) {
  const cur = deals.filter((d) => inLast(d.closedAt, days))
  const prev = deals.filter((d) => inLast(d.closedAt, days, days))
  const revenue = sum(cur.map((d) => d.value))
  const prevRevenue = sum(prev.map((d) => d.value))
  return {
    count: cur.length,
    prevCount: prev.length,
    revenue,
    prevRevenue,
    avg: cur.length ? revenue / cur.length : 0,
    prevAvg: prev.length ? prevRevenue / prev.length : 0,
  }
}

/** Per-day values for the barcode marks: `past` days of closings then `ahead` days of scheduled closings. */
export function dailyBarcode(deals: Deal[], metric: 'value' | 'count', past = 16, highlight = 7) {
  const out: { day: number; v: number; strong: boolean }[] = []
  for (let i = past - 1; i >= 0; i--) {
    const ds = deals.filter((d) => {
      const age = (now() - new Date(d.closedAt).getTime()) / DAY
      return age >= i && age < i + 1
    })
    out.push({ day: -i, v: metric === 'value' ? sum(ds.map((d) => d.value)) : ds.length, strong: i < highlight })
  }
  return out
}

export type Timeframe = 'Daily' | 'Weekly' | 'Monthly'
const periodDays: Record<Timeframe, number> = { Daily: 1, Weekly: 7, Monthly: 30 }

/** Four most recent periods: average deal value and change vs the period before it. */
export function avgDealSeries(deals: Deal[], tf: Timeframe) {
  const days = periodDays[tf]
  // daily closings are sparse, so a "day" averages a rolling 3-day window
  const window = tf === 'Daily' ? 3 : days
  const avgAt = (k: number) => {
    const ds = deals.filter((d) => d.kind === 'Sale' && inLast(d.closedAt, window, k * days))
    return ds.length ? sum(ds.map((d) => d.value)) / ds.length : 0
  }
  return [0, 1, 2, 3].map((k) => {
    const v = avgAt(k)
    const prev = avgAt(k + 1)
    const end = new Date(now() - k * days * DAY)
    const label =
      tf === 'Daily'
        ? end.toLocaleDateString('en-US', { weekday: 'short' })
        : tf === 'Weekly'
          ? `Wk ${weekOfYear(end)}`
          : end.toLocaleDateString('en-US', { month: 'short' })
    return { label, value: v, change: prev ? ((v - prev) / prev) * 100 : 0 }
  })
}

function weekOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - start.getTime()) / DAY + start.getDay() + 1) / 7)
}

// ---------------------------------------------------------------- engagement history
/**
 * Monthly enquiry volume isn't stored per lead for the full year, so history is
 * derived from closings with a fixed conversion profile (demo-only).
 */
export function monthlyEngagement(data: AppData, months = 8) {
  const out: { month: string; key: string; enquiries: number; visits: number; deals: number; conversion: number; visitRate: number }[] = []
  const today = new Date(now())
  for (let i = months - 1; i >= 0; i--) {
    const m = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const next = new Date(today.getFullYear(), today.getMonth() - i + 1, 1)
    const ds = data.deals.filter((d) => {
      const t = new Date(d.closedAt)
      return t >= m && t < next
    }).length
    const wobble = ((m.getMonth() * 37) % 23) - 11
    const enquiries = Math.max(ds * 10 + wobble * 9 + 40, 1)
    const visits = Math.round(enquiries * (0.034 + ((m.getMonth() * 13) % 9) / 1000))
    out.push({
      month: m.toLocaleDateString('en-US', { month: 'short' }),
      key: `${m.getFullYear()}-${m.getMonth()}`,
      enquiries,
      visits,
      deals: ds,
      conversion: (ds / enquiries) * 100,
      visitRate: (visits / enquiries) * 100,
    })
  }
  return out
}

/** Weekly closings for the last 52 weeks, grouped into quarters Q1–Q4 (oldest first). */
export function weeklyPulse(deals: Deal[]) {
  const weeks: number[] = []
  for (let w = 51; w >= 0; w--) {
    weeks.push(deals.filter((d) => inLast(d.closedAt, 7, w * 7)).length)
  }
  const quarters = [0, 1, 2, 3].map((q) => {
    const slice = weeks.slice(q * 13, q * 13 + 13)
    const closings = sum(slice)
    const enquiries = Math.round(closings * [11.4, 10.2, 9.6, 10.8][q]) + 30
    return { label: `Q${q + 1}`, start: q * 13, end: q * 13 + 13, rate: (closings / enquiries) * 100 }
  })
  return { weeks, quarters }
}

// ---------------------------------------------------------------- lead health
export function leadHealth(data: AppData) {
  const active = data.leads.filter(isActiveLead)
  const responded = data.leads.filter((l) => l.firstResponseSec <= 60).length
  const touched = active.filter((l) => inLast(l.lastContactAt, 7)).length
  const progressed = data.leads.filter((l) => !['New Enquiry', 'Contacted', 'Lost'].includes(l.stage)).length
  const responseRate = (responded / Math.max(data.leads.length, 1)) * 100
  const engagement = (touched / Math.max(active.length, 1)) * 100
  const conversion = (progressed / Math.max(data.leads.length, 1)) * 100
  const score = responseRate * 0.4 + engagement * 0.3 + conversion * 0.3
  return {
    score,
    label: score >= 80 ? 'Healthy pipeline' : score >= 60 ? 'Moderate risk' : 'At risk',
    parts: [
      { label: 'Response rate', value: responseRate, hint: 'Leads answered in under a minute' },
      { label: 'Engagement score', value: engagement, hint: 'Active leads touched in the last 7 days' },
      { label: 'Conversion', value: conversion, hint: 'Leads qualified or further down the funnel' },
    ],
  }
}

// ---------------------------------------------------------------- sources & agents
/** Brokerage earned on a closed sale, used for source ROI. */
export const COMMISSION_RATE = 0.02
/** Months of spend the current lead set represents. */
export const SPEND_MONTHS = 4

export function sourceROI(data: AppData) {
  return LEAD_SOURCES.map((source: LeadSource) => {
    const ls = data.leads.filter((l) => l.source === source)
    const won = ls.filter((l) => l.stage === 'Won')
    const spend = (data.sourceSpend.find((s) => s.source === source)?.spend ?? 0) * SPEND_MONTHS
    const revenue = sum(won.map((l) => l.budget)) * COMMISSION_RATE
    return {
      source,
      leads: ls.length,
      won: won.length,
      visits: ls.filter((l) => ['Site Visit Booked', 'Visited', 'Negotiation', 'Won'].includes(l.stage)).length,
      spend,
      revenue,
      cpl: ls.length ? spend / ls.length : 0,
      roi: spend ? revenue / spend : 0,
    }
  })
}

export function agentPerformance(data: AppData) {
  const nowT = now()
  return data.agents.map((a) => {
    const mine = data.leads.filter((l) => l.ownerId === a.id)
    const fus = data.followUps.filter((f) => f.agentId === a.id && !f.done)
    return {
      agent: a,
      active: mine.filter(isActiveLead).length,
      won: mine.filter((l) => l.stage === 'Won').length,
      lost: mine.filter((l) => l.stage === 'Lost').length,
      avgResponse: mine.length ? sum(mine.map((l) => l.firstResponseSec)) / mine.length : 0,
      responseRate: mine.length ? (mine.filter((l) => l.firstResponseSec <= 60).length / mine.length) * 100 : 0,
      overdue: fus.filter((f) => new Date(f.dueAt).getTime() < nowT).length,
      due: fus.length,
      visits: data.visits.filter((v) => v.agentId === a.id).length,
      revenue: sum(data.deals.filter((d) => d.agentId === a.id && inLast(d.closedAt, 30)).map((d) => d.value)),
    }
  })
}

// ---------------------------------------------------------------- matching
export function matchProperties(lead: Lead, properties: Property[]) {
  return properties
    .filter((p) => p.status === 'Available' || p.status === 'Reserved')
    .map((p) => {
      let score = 0
      if (p.type === lead.preferredType) score += 40
      if (p.district === lead.preferredDistrict) score += 25
      const ratio = p.price / lead.budget
      if (ratio <= 1.1 && ratio >= 0.7) score += 25
      else if (ratio <= 1.25) score += 10
      if (Math.abs(p.sizeSqft - lead.preferredSizeSqft) / lead.preferredSizeSqft < 0.25) score += 10
      return { property: p, score }
    })
    .filter((m) => m.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

export function matchLeads(property: Property, leads: Lead[]) {
  return leads
    .filter(isActiveLead)
    .map((l) => ({ lead: l, score: matchProperties(l, [property])[0]?.score ?? 0 }))
    .filter((m) => m.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

/** Leads with no contact for 45+ days that never closed: reactivation targets. */
export const dormantLeads = (leads: Lead[]) =>
  leads.filter((l) => l.stage !== 'Won' && now() - new Date(l.lastContactAt).getTime() > 45 * DAY)

export function funnel(leads: Lead[]) {
  const order = ['New Enquiry', 'Contacted', 'Qualified', 'Site Visit Booked', 'Visited', 'Negotiation', 'Won'] as const
  // cumulative: a lead at stage N has passed through every stage before it
  return order.map((stage, i) => ({
    stage,
    count: leads.filter((l) => l.stage !== 'Lost' && order.indexOf(l.stage as (typeof order)[number]) >= i).length + (i < 3 ? leads.filter((l) => l.stage === 'Lost').length : 0),
  }))
}
