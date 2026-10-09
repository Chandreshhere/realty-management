import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { RaseltateHeader } from '../components/raseltate/RaseltateHeader'
import { ThemeFrame } from '../components/shared/ThemeFrame'

export default function RaseltateLayout() {
  return (
    <ThemeFrame theme="raseltate">
      <div className="rs-page">
        <div className="rs-shell">
          <RaseltateHeader />
          <main>
            <Suspense fallback={<div className="mod-loading" aria-busy="true" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </ThemeFrame>
  )
}
