/**
 * Every image the UI uses, mapped to a real file under public/assets.
 *
 * The originals live in /assets. Each was cut out of its background with
 * `npm run assets` (macOS Vision subject lifting, plus a checker-grid cleanup
 * for the images that had a fake transparency pattern baked in). The app
 * serves the WebP copies; lossless PNG masters sit next to them. The two hero
 * images also get a Lanczos @2x so they stay crisp at hero size.
 *
 * To swap in a closer match for a reference slot, drop the image into /assets,
 * run `npm run assets`, and point the role below at the new file.
 */

const base = `${import.meta.env.BASE_URL}assets/buildings/`

export const assets = {
  modernHouse: {
    src: `${base}modern-house.webp`,
    src2x: `${base}modern-house@2x.webp`,
    width: 736,
    height: 698,
    alt: 'Two-storey modern house with timber soffit and glass balcony',
    source: 'assets/Modern house design isolated on a clean white background _ Premium AI-generated PSD.jpeg',
  },
  whiteVilla: {
    src: `${base}white-villa.webp`,
    src2x: `${base}white-villa@2x.webp`,
    width: 527,
    height: 278,
    alt: 'White contemporary villa with glass balconies and garage',
    source: 'assets/🔑 Unlock Your Dream Home_ Top Real Estate Tips.jpeg',
  },
  apartment: {
    src: `${base}apartment.webp`,
    width: 471,
    height: 476,
    alt: 'Six-storey apartment block with glazed corner and trees',
    source: 'assets/Apartment building isolated on a transparent background _ Premium AI-generated PSD.jpeg',
  },
  residentialTower: {
    src: `${base}residential-tower.webp`,
    width: 379,
    height: 669,
    alt: 'High-rise residential tower with balconies',
    source: 'assets/Residential Building on Transparent Background.jpeg',
  },
  highriseDusk: {
    src: `${base}highrise-dusk.webp`,
    width: 511,
    height: 943,
    alt: 'Dark glass commercial tower lit at dusk',
    source: 'assets/Download premium png of PNG Exterior of highrise building at dusk … 14495050.jpeg',
  },
  skylineGlass: {
    src: `${base}skyline-glass.webp`,
    width: 597,
    height: 281,
    alt: 'Cluster of glass towers above a band of trees',
    source: 'assets/Download free image of Realistic modern cityscape architecture skyscrapers … 15386718.jpeg',
  },
  skylineGreen: {
    src: `${base}skyline-green.webp`,
    width: 700,
    height: 426,
    alt: 'City skyline rising from greenery and low-rise homes',
    source: 'assets/Download free png of PNG Modern urban skyline with greenery … 15043226.jpeg',
  },
} as const

export type AssetKey = keyof typeof assets

/** Visual roles from real_estate_dashboard_spec.json → actual files. */
export const assetRoles = {
  aurexLargeBuilding: 'modernHouse',
  aurexPropertyCard1: 'apartment',
  aurexPropertyCard2: 'whiteVilla',
  aurexPropertyCard3: 'residentialTower',
  aurexTableThumbnail1: 'whiteVilla',
  aurexTableThumbnail2: 'apartment',
  raseltateLargeBuilding: 'whiteVilla',
} as const satisfies Record<string, AssetKey>

/**
 * Roles with no supplied asset. They render as quiet neutral placeholders:
 * initials for people, an SVG street grid for the map, a drawn mark for the logo.
 */
export const missingAssetRoles = ['avatarImages', 'mapImage', 'logo'] as const

/** Object-position per asset when shown cropped inside a card or thumbnail. */
export const cardFocus: Record<AssetKey, string> = {
  modernHouse: '50% 40%',
  whiteVilla: '50% 45%',
  apartment: '50% 30%',
  residentialTower: '50% 22%',
  highriseDusk: '50% 18%',
  skylineGlass: '50% 40%',
  skylineGreen: '50% 35%',
}
