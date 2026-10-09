const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('en-IN')

/** ₹2.76 Cr · ₹34.6 L · ₹48,500 */
export function inrCompact(value: number, digits?: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e7) return `₹${trim((value / 1e7).toFixed(digits ?? 2))} Cr`
  if (abs >= 1e5) return `₹${trim((value / 1e5).toFixed(digits ?? 1))} L`
  return `₹${inr.format(value)}`
}

/** Same as inrCompact, split so the ₹ sign can be styled separately. */
export function inrParts(value: number, digits?: number): { symbol: string; amount: string } {
  const s = inrCompact(value, digits)
  return { symbol: '₹', amount: s.slice(1) }
}

export function inrFull(value: number): string {
  return `₹${inr.format(value)}`
}

export function count(value: number): string {
  return num.format(value)
}

export function pct(value: number, digits = 1): string {
  return `${trim(value.toFixed(digits))}%`
}

function trim(s: string) {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** Nov 29, 2025 */
export const fmtDate = (iso: string) => dateFmt.format(new Date(iso))
/** Thu, 09 Oct */
export const fmtDay = (iso: string) => dayFmt.format(new Date(iso))
/** 4:30 PM */
export const fmtTime = (iso: string) => timeFmt.format(new Date(iso))
/** Oct 9 */
export const fmtShort = (iso: string) => shortDate.format(new Date(iso))

export function relTime(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  const abs = Math.abs(diff)
  const m = Math.round(abs / 60000)
  const h = Math.round(abs / 3600000)
  const d = Math.round(abs / 86400000)
  const unit = m < 60 ? `${Math.max(m, 1)}m` : h < 24 ? `${h}h` : `${d}d`
  if (m < 1) return 'just now'
  return diff < 0 ? `${unit} ago` : `in ${unit}`
}

export function secs(n: number): string {
  if (n < 60) return `${n}s`
  const m = Math.floor(n / 60)
  const s = n % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
