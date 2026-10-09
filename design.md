Real Estate Engagement Platform — UI Design Specification
Your two references use a premium, minimalist real estate dashboard style. The goal is to recreate both layouts as functional web interfaces, using the original property/building images from your assets folder.
The important distinction is that these are two different dashboard compositions, so they should be implemented as two selectable layouts rather than combining everything into one crowded screen.
1. Design analysis









Reference 1 — Property and engagement dashboard
A cool, light-grey interface with pill-shaped navigation, a large residential building image, financial KPI cards, miniature property listings, charts, a property table, and a compact map.












Reference 2 — Management and performance dashboard
A warm-grey, almost monochromatic interface with an oversized architectural hero, orange action buttons, horizontal KPI pills, a semicircular gauge, narrow performance charts, and a recent-activity table.



2. How the interface is constructed
Design element	Implementation
Overall background	Soft-grey full-screen canvas
Main dashboard	Large rounded container with generous outer spacing
Navigation	Compact horizontal menu, circular icon buttons
Building images	Local assets, carefully positioned and cropped
KPI cards	White/off-white rounded panels
Charts	Recharts with thin bars and minimal axes
Typography	Inter or Manrope, tight line heights
Property cards	Three-column image gallery with compact details
Tables	Small typography, subtle separators, status pills
Interactions	Search, filters, property selection, navigation, and detail drawers
For your real estate engagement platform, I would preserve these exact visual patterns while adapting the functional modules to Properties, Leads, Enquiries, Site Visits, Follow-ups, Agents, Conversations, and Deals.
3. JSON design code
I've prepared the complete configuration for both dashboards, including dimensions, positioning, colors, typography, asset mapping, components, and functional requirements. 


Design specification

Complete JSON configuration for both references.Download JSON

AI build prompt

Detailed implementation instructions for your coding tool.Download prompt


Here is a simplified version of the JSON structure:

{
  "project": {
    "name": "EstateFlow",
    "type": "Real Estate Engagement Platform",
    "framework": "React + TypeScript",
    "styling": "Tailwind CSS",
    "charts": "Recharts",
    "icons": "Lucide React",
    "assetsDirectory": "public/assets"
  },
  "theme": {
    "aurex": {
      "background": "#F6F4F5",
      "dashboard": "#E9E6E7",
      "card": "#F6F4F5",
      "text": "#191919",
      "accent": "#E6B884",
      "radius": "16px"
    },
    "raseltate": {
      "background": "#ADADAD",
      "dashboard": "#DEDEDE",
      "card": "#E9E9E9",
      "text": "#202020",
      "accent": "#FF543D",
      "chartAccent": "#CC833E"
    }
  },
  "screens": {
    "aurex": {
      "route": "/dashboard/aurex",
      "layout": "12-column grid",
      "sections": [
        "Top Navigation",
        "Property Sales and Rentals",
        "Architectural Hero Image",
        "Revenue KPI Cards",
        "Average Deal Value Chart",
        "Featured Property Gallery",
        "Property Management Table",
        "Mini Map"
      ]
    },
    "raseltate": {
      "route": "/dashboard/raseltate",
      "layout": "Hero + Metrics + Analytics",
      "sections": [
        "Icon Navigation",
        "Welcome Heading",
        "Large Building Hero",
        "Quick Action Toolbar",
        "Property Agent and Sales KPIs",
        "Lead Health Overview",
        "Engagement Performance",
        "Recent Activity Table"
      ]
    }
  },
  "assetRules": {
    "scanFolder": true,
    "useExistingFilesOnly": true,
    "doNotInventFilenames": true,
    "preserveAspectRatio": true,
    "preventImageDistortion": true
  },
  "responsive": {
    "desktop": "Original grid composition",
    "tablet": "Two-column arrangement",
    "mobile": "Single-column layout"
  }
}



4. Copy-paste implementation prompt
Use this prompt in Cursor, Claude Code, Lovable, Bolt, or another AI coding environment. The downloadable prompt above contains the more comprehensive, section-by-section instructions.

Build a premium, pixel-faithful Real Estate Engagement
Platform using the two attached dashboard screenshots
as the PRIMARY visual references.

PROJECT:
EstateFlow — Real Estate Engagement Platform

TECH STACK:
React, TypeScript, Tailwind CSS, Lucide React,
Recharts, and reusable components.

REFERENCE REQUIREMENTS:

Create TWO dashboard views.

VIEW 1 — AUREX LIVING REFERENCE

Match the first screenshot's visual layout:
- Soft off-white page background.
- Large light-grey rounded dashboard container.
- Small logo at top left.
- Centered pill-style navigation.
- Black selected Dashboard tab.
- Compact icon buttons on the right.
- Property sold/rented summary at upper left.
- Large modern building image at upper right.
- Two stacked KPI cards beneath the summaries.
- Tall average sale value chart in the middle.
- Three featured property cards on the right.
- Full-width lower property data table.
- Small map at bottom right.

Preserve the overall geometry, spacing, typography,
image proportions, borders, radii, and visual hierarchy.

VIEW 2 — RASELTATE REFERENCE

Match the second screenshot:
- Medium grey surrounding page.
- Large warm-grey dashboard shell.
- Very minimal top icon navigation.
- One coral-red selected navigation icon.
- Small breadcrumb, title and description on left.
- Huge architectural property image at upper right.
- Coral '+ Add New' button.
- Small action controls and overlapping agent avatars.
- Three horizontal metric pills.
- Lower-left semicircular analytics gauge.
- Lower-middle vertical amber performance chart.
- Lower-right recent activity table.

Match the screenshot layout rather than creating
a conventional dashboard.

ASSET HANDLING:

All property images, building images and other visual
assets will be available in the existing assets folder.

FIRST inspect the assets folder recursively.

Identify which image belongs in each visual position.

Create an asset manifest using the ACTUAL filenames.

Use these local assets directly.

DO NOT generate new building images.
DO NOT fetch property photos from the internet.
DO NOT invent image paths.
DO NOT stretch or distort supplied images.
DO NOT replace architectural photography with icons.

If transparency exists, blend the building naturally
with the dashboard background.

FUNCTIONAL PLATFORM:

The platform should support:
- Property inventory
- Lead and enquiry tracking
- Site visit scheduling
- Agent management
- Customer follow-ups
- Deal management
- Sales analytics
- Engagement analytics
- Recent activity
- Conversations

Keep the reference dashboard layout unchanged while
adapting content to real estate engagement workflows.

INTERACTIONS:

All menu items should be interactive.
Property cards should open detail drawers.
Search and filters should work.
Charts should use real data-driven components.
Add New should open a working dropdown.
Recent activities should be clickable.
KPI cards should provide relevant drilldowns.

Use sample data for demonstration.

DESIGN SYSTEM:

Inter or Manrope typography.
Very small, precise dashboard labels.
Neutral grey surfaces.
Low-contrast dividers.
No heavy drop shadows.
Pill-shaped buttons.
Rounded 16px to 24px cards.
Minimal thin-stroke icons.
Subtle transitions.

IMPORTANT:

Do not combine both references into a single generic UI.
Create two separate routes:
  /dashboard/aurex
  /dashboard/raseltate

Use CSS Grid for primary structure.
Use absolute positioning only where needed for
building image layering and small overlays.

Make the dashboard responsive without sacrificing
desktop visual accuracy.

The final result must resemble the references at
first glance and must contain real HTML, CSS, and
interactive React elements rather than displaying
the reference screenshots as backgrounds.

IMPLEMENTATION ORDER:

1. Analyze references and scan all supplied assets.
2. Map image files to visual roles.
3. Build dashboard shells and navigation.
4. Match hero image positioning and scale.
5. Recreate KPI cards and charts.
6. Recreate property gallery, table and map.
7. Add functional interactions.
8. Implement responsive behavior.
9. Compare screenshots side by side and refine.
10. Test asset loading and UI functionality.

Do not stop after creating a static mockup.
Deliver a working frontend.



5. How to place the images
Your project should have a structure similar to this:
project/
├── public/
│   └── assets/
│       ├── [your building images]
│       ├── [your property photos]
│       ├── [your interior photos]
│       └── [other supplied assets]
├── src/
│   ├── components/
│   │   ├── aurex/
│   │   ├── raseltate/
│   │   └── shared/
│   ├── data/
│   │   ├── assetManifest.ts
│   │   └── mockData.ts
│   ├── pages/
│   │   ├── AurexDashboard.tsx
│   │   └── RaseltateDashboard.tsx
│   └── styles/
│       └── dashboard.css
└── package.json

The developer tool should identify the actual asset filenames. You do not need to rename all the images manually.
Important for an exact visual match: The original dashboard references are low-resolution previews, so some spacing and typography values are approximate. The best result will come from first reproducing the structure and then comparing rendered screenshots against your references at the same viewport size.
Recommended workflow: Upload both reference screenshots, the JSON file, and the implementation prompt to your coding tool, and keep your building/property images inside public/assets. This gives the developer tool the visual references, layout instructions, and actual media required to build the dashboard.

