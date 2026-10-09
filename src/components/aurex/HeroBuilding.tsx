import { assetRoles, assets } from '../../data/assetManifest'

/** Top-right architectural hero: cut-out building that dissolves into the shell. */
export function HeroBuilding() {
  const a = assets[assetRoles.aurexLargeBuilding]
  return (
    <div className="ax-hero" aria-hidden="true">
      <img src={a.src2x} srcSet={`${a.src} 1x, ${a.src2x} 2x`} alt="" width={a.width} height={a.height} fetchPriority="high" />
    </div>
  )
}
