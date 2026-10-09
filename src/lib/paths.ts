import { useLocation } from 'react-router-dom'

export type Module = 'properties' | 'leads' | 'visits' | 'messages' | 'bookings' | 'reports'
export type Theme = 'aurex' | 'raseltate'

export const MODULE_PATHS: Record<Theme, Record<Module, string>> = {
  aurex: {
    properties: '/aurex/listings',
    leads: '/aurex/leads',
    visits: '/aurex/appointments',
    messages: '/aurex/messages',
    bookings: '/aurex/bookings',
    reports: '/aurex/reports',
  },
  raseltate: {
    properties: '/raseltate/properties',
    leads: '/raseltate/leads',
    visits: '/raseltate/visits',
    messages: '/raseltate/conversations',
    bookings: '/raseltate/bookings',
    reports: '/raseltate/reports',
  },
}

export function useTheme(): Theme {
  return useLocation().pathname.includes('raseltate') ? 'raseltate' : 'aurex'
}

/** Module links that stay inside whichever layout is active. */
export function useModulePath() {
  const theme = useTheme()
  return (m: Module, qs?: string) => `${MODULE_PATHS[theme][m]}${qs ? `?${qs}` : ''}`
}
