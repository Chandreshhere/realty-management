# Realty OS — real estate engagement CRM

React + Vite + TypeScript build of the two reference dashboards, wired to a working CRM with demo data.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run assets     # re-cut building images from /assets (macOS)
```

## Routes

| Layout | Route | What it is |
| --- | --- | --- |
| Aurex (reference 1) | `/dashboard/aurex` | Property & engagement dashboard |
| | `/aurex/listings` · `/aurex/appointments` · `/aurex/messages` | Header pills |
| | `/aurex/leads` · `/aurex/bookings` · `/aurex/reports` | Reached from KPI arrows and drawers |
| Raseltate (reference 2) | `/dashboard/raseltate` | Operational engagement dashboard |
| | `/raseltate/leads` · `visits` · `bookings` · `properties` · `conversations` · `reports` | Icon nav, left to right |

Both layouts run full-screen. A left sidebar (Dashboard, Properties, Leads, Follow-ups, Site visits, Bookings, Conversations, Reactivation, Reports, Agents) sits next to each layout's own top menu and shows live counts. It collapses to an icon rail, which is the default below 1440px and is remembered once you toggle it, and becomes a slide-in drawer below 1024px. The Aurex / Raseltate switch is at the bottom of the sidebar. Breakpoints are container queries on the main column, so the layout responds to the space beside the sidebar. Page scrolling is smooth.

## How the deck's eleven modules map to the app

| Module | Where |
| --- | --- |
| Plot inventory | Listings / Properties: status tabs, type, locality, facing and price filters, grid / table / map views |
| Lead capture | Leads: six sources (99acres, MagicBricks, Housing.com, Meta, Google, Website), duplicates-merged count |
| Instant response | First-reply time on every lead, plus the “answered < 1 min” rate |
| AI qualification | Lead drawer: budget, location, size and timeline, scored Hot / Warm / Cold |
| Assignment & follow-up | Round-robin default on new leads; follow-up queue with overdue escalation and reassignment |
| Site visits | Appointments / Visits: day strip, confirm / complete / no-show / reschedule; a no-show creates a follow-up |
| Property matching | Matched properties per lead, and matched buyers per property |
| Call intelligence | Call summary, objection and next step on qualified leads; log a call from the drawer |
| Old lead reactivation | Leads → Reactivation: select dormant leads and send a WhatsApp campaign |
| Booking & payments | Reserve & send a payment link (unit → Reserved); mark paid (unit → Sold, deal recorded, notification) |
| Management dashboard | Reports: funnel, monthly revenue, source-wise ROI, salesperson performance |

All figures derive from one local data set (`src/data/mockData.ts`, read through `src/lib/selectors.ts`), so filters, KPIs and charts always agree. Changes persist in `localStorage`. Demo dates move forward with the calendar, and **Settings → Reset demo data** restores the seed. Currency is INR.

## Images

`/assets` holds the originals and is never modified. `npm run assets` cuts each building out of its background with macOS Vision subject lifting (`tools/lift-subject.swift`). Images with a baked-in fake-transparency checkerboard are then cleaned against the fitted checker grid (`tools/refine-checker.py`). Output goes to `public/assets/buildings/` as lossless PNG plus the WebP the app serves; the two hero images also get a sharper @2x. Roles are mapped in `src/data/assetManifest.ts`.

| Slot | File |
| --- | --- |
| Aurex hero | `modern-house` |
| Raseltate hero | `white-villa` |
| Featured cards | `apartment`, `white-villa`, `residential-tower` |
| Plots / commercial | `skyline-green`, `skyline-glass`, `highrise-dusk` |

No asset was supplied for the following, so each uses a quiet placeholder:

- **Agent and user portraits:** tinted initials.
- **Map:** drawn SVG street grid.
- **Logo:** drawn marks.

To use a new image, drop it into `/assets`, run `npm run assets`, and point the role at it in `assetManifest.ts`. To give it a short name, add it to `tools/asset-names.json`.

## Structure

```
src/
  pages/            AurexDashboard, RaseltateDashboard, layouts, modules/*
  components/aurex  KpiBars, HeroBuilding, RevenueCard, DealValueChart, PropertyGallery, PropertyTable, MiniMap
  components/raseltate  HeroBuilding, QuickActions, MetricStrip, LeadHealthGauge, EngagementChart, RecentActivityTable
  components/shared Sidebar, ThemeFrame (full-screen frame), Popover/Menu, Drawer/Modal, property & lead drawers, create forms, header widgets
  data/             types, mockData, assetManifest
  lib/              selectors (derived metrics), format (INR), paths
  store/            reducer store + UI state (drawers, modals, toasts)
  styles/           index (tokens), app (frame + sidebar), aurex, raseltate, modules
```
