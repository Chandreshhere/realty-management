# BUILD PROMPT — Pixel-faithful real estate engagement platform UI

You are an expert frontend engineer, design systems engineer, and pixel-precision UI implementer. Create a fully functional React + TypeScript dashboard using the **TWO supplied screenshot references** and the **existing local `assets/` folder**.

## Deliverable and interpretation of the references

Build **two distinct selectable dashboard views**, with a shared data model and functionality:

1. **`/dashboard/aurex`** — replicate the **first screenshot (Aurex Living)**: property engagement/listings dashboard.
2. **`/dashboard/raseltate`** — replicate the **second screenshot (Raseltate real estate management)**: operational engagement dashboard.

The uploaded screenshots are the visual source of truth. Reference #1 and reference #2 have DIFFERENT layouts, and you must **NOT blend them into one generic dashboard**. Provide a small discreet view switcher to switch between the two designs; keep it outside the screenshot-faithful central composition (e.g., dev-only switcher or URL route, not an intrusive extra header).

Use `real_estate_dashboard_spec.json` provided with this prompt. It contains theme tokens, layout dimensions, relative screenshot bounds, UI composition, asset roles, domain model and acceptance criteria. Prioritize the screenshots whenever the config and screenshot appear inconsistent.

## FIRST: Inspect the asset folder (mandatory)

Scan the available files in `public/assets/` or `src/assets/` recursively **before writing the UI**. Inspect image subject matter, filename, resolution, transparency and aspect ratio. Create `src/data/assetManifest.ts` referencing ACTUAL EXISTING image paths. Map the building in the first screenshot to the best matching exterior asset, and the giant contemporary home in the second screenshot to its matching asset. Also map all available property thumbnails, interiors, map imagery, agent avatars and the logo. Never invent file paths. Never substitute web/Unsplash images. If an asset is unavailable, show a quiet neutral placeholder in the correct physical space and list the missing asset role when handing off.

If assets are transparent cut-outs, use `object-fit: contain` and visually blend them into the parent dashboard background. If assets are photos, use proportionate image framing and crop with `object-position`, while keeping the architecture undistorted. **The building images must be large and compositionally dominant**, not card-sized decorations.

## Visual specification: View A / Aurex

Screen backdrop: off-white / very faint pink-gray. Inside it, a spacious round-corner light-gray dashboard shell with approx. 24px radius and soft separation. Everything lives in a precise, compact 12-column grid, with small 10–14px labels and minimal 1px boundaries. No thick shadows or bold blue colors.

**Header**: small logo and 'EstateFlow' top-left; centered pill nav with selected black filled 'Dashboard' pill, followed by pale gray 'Listings', 'Appointments' and 'Messages'; right side four small round icon actions (search, bell, settings, avatar).

**Top content**: on the left show 'Properties Sold' and 'Properties Rented' as two slim data summaries with a black thick progress bar and muted apricot thick bar beneath; on the right show the wide cropped isolated villa building image. The building sits across the upper-right and visually blends into the flat page background, with no rectangular photo container when source format permits.

**Middle area**: left is a vertical stack of two rounded white cards ('Total Revenue', 'Completed Deals') with large numbers, subdued small captions and tiny vertical barcode marks; center is a taller card ('Average Deal Value') with large metric and fine horizontal black mini-bar chart; right is the 'Featured Properties' panel containing THREE narrow adjacent property cards featuring images, top corner heart + arrow buttons, tiny title, price and property details.

**Bottom**: across about 75% of width there is a property table, with compact filter chips ('District', 'Type', 'Status', 'Cost'), search and control icons, then tiny-image rows with columns: Property, Type, Agent, Cost, Views, Status, Action. Reserve right 25% for softly tinted compact map with a pin and cluster badge. Rounded, low-contrast. Use available map asset if supplied; if none exists, render a neutral SVG/CSS street-grid placeholder rather than external map images.

The first reference's approximate composition at its original 736×552 preview is: dashboard shell x46 y46 w648 h461; top stats x67 y135 w287 h64; building x362 y108 w300 h100; middle left/mid x65 y210 w291 h185; property gallery x362 y211 w312 h183; table x64 y400 w457 h106; map x524 y400 w151 h107. Treat these as **RELATIVE position references, not final tiny CSS dimensions**.

## Visual specification: View B / Raseltate

Canvas background: neutral medium gray. Main shell is a huge slightly lighter warm/light gray rounded card with very restrained shading. Denser, more architectural, minimal design and more open hero space than View A.

**Header**: monochrome logo + EstateFlow top-left; compact icon-first navigation across the top with one CORAL/RED selected circular icon; right-aligned search, alert icons, avatar and small username/email treatment.

**Top hero**: left aligned tiny breadcrumb 'Main Menu / Dashboard', title 'Real estate engagement' in compact medium-weight text, short two-line description. Huge exterior of the supplied modern home floats across center-right, occupying most of the top half. Maintain scale and the illusion that the home emerges directly from the dashboard surface. Its lowest edge is roughly aligned to the row of pills.

**Action row**: coral pill '+ Add New' toward left, next to small refresh and ellipsis buttons. Nearby a group of overlapping circular team avatars and a tiny settings icon.

**Metrics strip**: exactly three long contiguous-looking pills with large circular outlined counters and tiny category labels, e.g. '24 PROPERTIES', '18 AGENTS', '32 DEALS', followed by soft muted descriptions.

**Bottom grid**: three cards aligned at the same top and bottom edges. Left (~23%) is a thin amber semicircle gauge with a central main value and small supporting stats ('Lead Health Overview'). Middle (~23%) is 'Engagement Performance', three very small KPI headlines and narrow vertical gold/orange bars aligned Jan–Aug. Right (~54%) is 'Recent Activity', a compact 4-column activity log with many thin row separators, dated events and tiny status text.

View B approximate reference at 736×552: shell x20 y49 w696 h456; welcome x36 y107 w265 h55; building x345 y100 w352 h158; action row x32 y233; KPI strip x32 y267 w671 h44; bottom grid from y317 to y496 with left x32–184, middle x189–346, right x349–702. Again, use proportions rather than directly copying these very small coordinates to full desktop CSS.

## Actual business context — REAL ESTATE ENGAGEMENT

The product serves sales teams, brokers, developers, and property managers. The UI must be attractive but meaningful. Provide these real workflows and data structures using local mock data now:
- Property inventory, categories, prices, photo, address, assigned agent, listing status.
- Enquiries and lead pipeline: New Enquiry → Contacted → Qualified → Site Visit Booked → Visited → Negotiation → Won/Lost.
- Agent ownership and response rate.
- Site visits, appointments and confirmations.
- Follow-ups, overdue tasks, recent activity feed and message activity.
- Deal conversions, revenue, engagement rates and property views.

Preserve the source screenshot components even when labels are adapted: the source layout is the priority. Make values realistic, visibly demo-only when appropriate; configurable currency `INR`. A separate screen can expose Leads, Conversations, or Appointments if necessary, but **do not cram their full content into the reference dashboard screens**.

## Interactivity — must work, not be decorative

- Header tabs and icons show route/module changes or open logical popovers.
- Search and filter chips operate on mock property data.
- Property gallery heart buttons toggle saved status; property arrow/table row opens details drawer.
- View A 'Daily' chart dropdown changes timeframe.
- View B '+ Add New' opens menu: Property, Lead, Site Visit, Follow-up.
- KPI card clicks navigate to filtered list view or open a details drawer.
- Recent activity rows open related lead/property context.
- Messages may use a minimal inbox panel with sample conversations.
- All dropdowns, overlays, and drawers have keyboard access and escape-to-close behavior.

## Implementation architecture

Use React + TypeScript, Tailwind CSS, Recharts and lucide-react. Componentize it cleanly, e.g.:
`src/pages/AurexDashboard.tsx`, `src/pages/RaseltateDashboard.tsx`, `src/components/shared/DashboardShell.tsx`, `src/components/aurex/{KpiBars,RevenueCard,DealValueChart,PropertyGallery,PropertyTable,MiniMap}.tsx`, `src/components/raseltate/{HeroBuilding,QuickActions,MetricStrip,LeadHealthGauge,EngagementChart,RecentActivityTable}.tsx`, `src/data/{assetManifest,mockData}.ts`, `src/styles/dashboard.css`.

Use CSS Grid for dashboard structure; reserve absolute positioning ONLY for hero building overlap and small decorative/overlay details. Component sizing should flow based on available space. Ensure there is no visible horizontal overflow at 1280–1600px widths. Desktop must preserve screenshot composition; tablet uses 2-column rearrangements, mobile stacks cards and handles the table accessibly.

Type design: Inter/Manrope; concise type scale (section 13–15px, KPI values 25–30px, tiny microcopy 11–12px at normal desktop). Keep accurate visual hierarchy, very light shadows, ~16px cards, neutral pills, and 14–18px thin Lucide icons. Keep View A mostly black + apricot + cream and View B mostly gray + tiny coral + amber. Avoid a generic bright modern analytics-dashboard aesthetic.

## Execution order

1. Inspect BOTH screenshot references and ALL local assets.
2. Create actual-file asset manifest and theme tokens.
3. Build shell and header of View A, then map the content regions with fidelity.
4. Build shell and the architectural hero of View B, then its metric strip and bottom analytics grid.
5. Populate property, leads, agents, site visits, and activity demo data.
6. Implement real interactions and responsive rules.
7. Run and capture desktop visual checks side-by-side against both supplied screenshots; adjust exact gutters, card sizes, font weights, photo scale/crop, overall contrast and chart mark thickness before finalizing.
8. Verify the build, console, asset loading, keyboard access, functional search and click flows.

## Non-negotiable acceptance criteria

- Both reference compositions are recognizable immediately and are not reinterpreted.
- The buildings/photographs are loaded from actual existing assets and have the same dominant scale as screenshots.
- All cards, chart primitives, labels, pills, icons, tables, and spacing are implemented as real HTML/CSS/SVG, never one screenshot used as a single background.
- There are two working routes with a shareable URL for each, and functional property engagement interactions.
- UI looks very close to the supplied images at desktop size and remains useful on tablet/mobile.
- No fabricated assets, broken images, unreachable buttons, placeholder lorem ipsum, or unsolicited new sections.

**Important**: Keep the first screenshot's black pill navigation and property gallery style separate from the second screenshot's coral icon navigation and amber risk/performance panels. Those visual differences are intentional.
