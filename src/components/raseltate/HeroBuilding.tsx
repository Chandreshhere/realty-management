import { assetRoles, assets } from '../../data/assetManifest'

/** The oversized home that rises out of the shell; its base meets the metrics row. */
export function HeroBuilding() {
  const a = assets[assetRoles.raseltateLargeBuilding]
  return (
    <div className="rs-hero__building" aria-hidden="true">
      <img src={a.src2x} srcSet={`${a.src} 1x, ${a.src2x} 2x`} alt="" width={a.width} height={a.height} fetchPriority="high" />
    </div>
  )
}
