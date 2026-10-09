import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/store'
import { UIProvider } from './store/ui'
import AurexLayout from './pages/AurexLayout'
import AurexDashboard from './pages/AurexDashboard'
import RaseltateLayout from './pages/RaseltateLayout'

// the reference dashboards load eagerly; Raseltate and the modules pull in Recharts, so they split
const RaseltateDashboard = lazy(() => import('./pages/RaseltateDashboard'))
const PropertiesPage = lazy(() => import('./pages/modules/PropertiesPage'))
const LeadsPage = lazy(() => import('./pages/modules/LeadsPage'))
const VisitsPage = lazy(() => import('./pages/modules/VisitsPage'))
const BookingsPage = lazy(() => import('./pages/modules/BookingsPage'))
const MessagesPage = lazy(() => import('./pages/modules/MessagesPage'))
const ReportsPage = lazy(() => import('./pages/modules/ReportsPage'))

export default function App() {
  return (
    <StoreProvider>
      <UIProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/aurex" replace />} />

          <Route element={<AurexLayout />}>
            <Route path="/dashboard/aurex" element={<AurexDashboard />} />
            <Route path="/aurex/listings" element={<PropertiesPage />} />
            <Route path="/aurex/leads" element={<LeadsPage />} />
            <Route path="/aurex/appointments" element={<VisitsPage />} />
            <Route path="/aurex/messages" element={<MessagesPage />} />
            <Route path="/aurex/bookings" element={<BookingsPage />} />
            <Route path="/aurex/reports" element={<ReportsPage />} />
          </Route>

          <Route element={<RaseltateLayout />}>
            <Route path="/dashboard/raseltate" element={<RaseltateDashboard />} />
            <Route path="/raseltate/properties" element={<PropertiesPage />} />
            <Route path="/raseltate/leads" element={<LeadsPage />} />
            <Route path="/raseltate/visits" element={<VisitsPage />} />
            <Route path="/raseltate/conversations" element={<MessagesPage />} />
            <Route path="/raseltate/bookings" element={<BookingsPage />} />
            <Route path="/raseltate/reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard/aurex" replace />} />
        </Routes>
      </UIProvider>
    </StoreProvider>
  )
}
