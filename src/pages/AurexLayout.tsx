import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AurexHeader } from '../components/aurex/AurexHeader'
import { ThemeFrame } from '../components/shared/ThemeFrame'

export default function AurexLayout() {
  return (
    <ThemeFrame theme="aurex">
      <div className="ax-page">
        <div className="ax-shell">
          <AurexHeader />
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
