import { useState } from 'react'
import { KpiBars } from '../components/aurex/KpiBars'
import { HeroBuilding } from '../components/aurex/HeroBuilding'
import { DealsCard, RevenueCard } from '../components/aurex/RevenueCard'
import { DealValueChart } from '../components/aurex/DealValueChart'
import { PropertyGallery } from '../components/aurex/PropertyGallery'
import { PropertyTable } from '../components/aurex/PropertyTable'
import { MiniMap } from '../components/aurex/MiniMap'

/** Reference 1 — property & engagement dashboard. */
export default function AurexDashboard() {
  // the map and the table share one locality filter
  const [district, setDistrict] = useState<string | null>(null)
  return (
    <div className="ax-grid">
      <KpiBars />
      <HeroBuilding />
      <div className="ax-kpis">
        <RevenueCard />
        <DealsCard />
      </div>
      <DealValueChart />
      <PropertyGallery />
      <PropertyTable district={district} onDistrict={setDistrict} />
      <MiniMap district={district} onDistrict={setDistrict} />
    </div>
  )
}
