> [!WARNING]
> **SUPERSEDED — kept for history, not for reference.**
>
> This document describes the design system as it stood before the September
> 2026 token consolidation. It still lists the `--sq-brand-*` variables (since
> removed as dead) and the pre-consolidation values `#0a1128`, `#2563eb` and
> `#3b82f6` — which were resolved in favour of the contrast-checked palette
> `#061527`, `#1a66bc` and `#2a7dd8`. It also describes three experiences where
> the product settled on **two skins, one spine**.
>
> **Source of truth:** `src/design-system/tokens.css`
> **Start here instead:** [`doc/HANDOVER.md`](./HANDOVER.md)

---

# SHIELDQUEST DESIGN SYSTEM (DESIGN_SYSTEM.md)

**Version:** 1.0.0  
**Foundation:** ShieldQuest Canonical Brand System  
**Design Philosophy:** One ShieldQuest brand system, three controlled experiences.

```
                    SHIELDQUEST BRAND
                   (#0A1128 Navy + #2563EB Civic Blue + #F59E0B Gold)
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
   PUBLIC SITE             ADMIN PORTAL            PLAYER PWA
   (Light & Clean)       (Light & Civic)       (Immersive Game + Light Utility)
  • Canvas: #FFFFFF/#F6F8FB• Canvas: #F6F8FB     • Board: #0A1128 / #0F1C3F
  • Max width: 1280px     • Max width: 1440px    • Utility screens: #F6F8FB
  • Persuasive, polished  • White cards & sidebar • Shared buttons, cards & type
```

---

## 1. Brand Palette & Color Tokens

### 1.1 Primary Brand
- **ShieldQuest Navy:** `#0A1128` — Dominant brand surface, high-contrast headings, dark mode shells.
- **Deep Navy:** `#0F1C3F` — Secondary dark layer, board background, modal backdrops.
- **Civic Blue:** `#2563EB` — Primary interactive action, focused states, primary links.
- **Bright Civic Blue:** `#3B82F6` — Highlights, hover states, active indicators.

### 1.2 Supporting Accents
- **Shield Gold:** `#F59E0B` — Badges, star ratings, primary player game actions (`ROLL`, `CONTINUE`).
- **Teal:** `#0F766E` — Peer Shield, bystander support, secondary emphasis.
- **Emerald:** `#059669` — Success states, verified items, Community Hub district accent.
- **Coral / Risk:** `#E11D48` — High risk warnings, urgent alerts, Retail District accent.

### 1.3 Neutrals
- **Canvas:** `#F6F8FB` — Standard light page background for Admin, Public subpages, and Player utility screens.
- **Surface:** `#FFFFFF` — Cards, modals, sidebars, sheets, interactive containers.
- **Surface Muted / Subtle:** `#F1F5F9` — Input backgrounds, table headers, inactive tabs.
- **Border Default:** `#E2E8F0` — Subtle neutral dividing lines and card outlines.
- **Border Strong:** `#CBD5E1` — Input outlines and active container borders.
- **Text Primary:** `#172033` — Default body text and headings on light surfaces.
- **Text Secondary:** `#64748B` — Subtitles, descriptions, captions.
- **Text Muted:** `#94A3B8` — Eyebrows, timestamps, metadata labels.
- **Text Inverse:** `#FFFFFF` — Text on navy surfaces and primary buttons.

### 1.4 Semantic CSS Variables (`--sq-*`)
```css
:root {
  --sq-brand-navy: #0a1128;
  --sq-brand-deep-navy: #0f1c3f;
  --sq-brand-blue: #2563eb;
  --sq-brand-blue-bright: #3b82f6;
  --sq-brand-gold: #f59e0b;

  --sq-bg-canvas: #f6f8fb;
  --sq-bg-surface: #ffffff;
  --sq-bg-subtle: #f1f5f9;
  --sq-bg-inverse: #0a1128;

  --sq-text-primary: #172033;
  --sq-text-secondary: #64748b;
  --sq-text-muted: #94a3b8;
  --sq-text-inverse: #ffffff;

  --sq-border-default: #e2e8f0;
  --sq-border-strong: #cbd5e1;

  --sq-action-primary: #2563eb;
  --sq-action-primary-hover: #1d4ed8;
  --sq-action-secondary: #ffffff;

  --sq-success: #059669;
  --sq-warning: #d97706;
  --sq-danger: #e11d48;
  --sq-info: #2563eb;

  --sq-radius-sm: 8px;
  --sq-radius-md: 10px;
  --sq-radius-lg: 16px;
  --sq-radius-xl: 20px;

  --sq-shadow-sm: 0 1px 2px 0 rgba(10, 17, 40, 0.05);
  --sq-shadow-md: 0 4px 6px -1px rgba(10, 17, 40, 0.08), 0 2px 4px -2px rgba(10, 17, 40, 0.06);
  --sq-shadow-lg: 0 10px 15px -3px rgba(10, 17, 40, 0.1), 0 4px 6px -4px rgba(10, 17, 40, 0.08);
}
```

---

## 2. Typography Scale

**Font Stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
*(Trebuchet MS is completely removed from the primary UI).*

| Role | Size (Desktop) | Size (Mobile) | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 48px–56px | 30px–34px | 1.15 | 800 (ExtraBold) | -0.025em |
| **H1** | 36px–40px | 26px–30px | 1.2 | 800 (ExtraBold) | -0.02em |
| **H2** | 28px–32px | 22px–24px | 1.25 | 800 (ExtraBold) | -0.015em |
| **H3** | 20px–24px | 18px–20px | 1.3 | 700 (Bold) | -0.01em |
| **Body Large** | 17px–18px | 16px | 1.6 | 400 / 600 | 0 |
| **Body** | 15px–16px | 14px–15px | 1.55 | 400 / 500 | 0 |
| **Small** | 13px–14px | 12px–13px | 1.45 | 500 / 600 | 0 |
| **Caption / Eyebrow** | 11px–12px | 10px–11px | 1.4 | 700 / 800 | 0.08em–0.15em (uppercase) |

---

## 3. Spacing Scale

`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `96px`  
Arbitrary values like `13px`, `17px`, `21px`, `27px`, `31px` are replaced with scale multiples.

**Page Structure Spacing:**
- Top Nav to Page Header: `32px–48px`
- Page Header to Primary Content: `24px–32px`
- Primary to Secondary Content: `32px–48px`

---

## 4. Reusable Primitives

### 4.1 Button (`<Button />`)
- **Variants:**
  - `primary`: Background Civic Blue `#2563EB`, text white, hover `#1D4ED8`.
  - `secondary`: Background white `#FFFFFF`, border `#E2E8F0`, text `#172033`, hover `#F1F5F9`.
  - `tertiary` / `ghost`: Background transparent, text `#64748B`, hover `#F1F5F9` / `#172033`.
  - `destructive`: Background Rose/Red `#E11D48`, text white, hover `#BE123C`.
  - `gold`: Special player action button (`ROLL`, `CONTINUE`, `CONFIRM CHOICE`).
- **Sizes:** `sm` (36px min height), `md` (44px touch height, default), `lg` (48px height).
- **Corner Radius:** `10px` canonical radius.
- **Touch Target:** Minimum 44px on interactive edges.

### 4.2 Card (`<Card />`)
- **Default Card:** `#FFFFFF` background, 1px solid `#E2E8F0` border, `16px` border radius, subtle elevation.
- **Subtle Card:** `#F1F5F9` background, 1px solid `#E2E8F0`.
- **Interactive Card:** Transitions on hover (`hover:border-civic-400 hover:shadow-md hover:-translate-y-0.5`).
- **Featured Card:** Subtle Civic Blue/Gold tint border and glow.

### 4.3 Page Header (`<PageHeader />`)
Unified header accepting:
- `eyebrow`: Small uppercase category tracker (e.g. `YOUR S.H.I.E.L.D. SKILLS`).
- `title`: Primary H1.
- `description`: 1–2 line clear explanatory paragraph.
- `badge`: Optional status or progress indicator.
- `actions`: Optional CTA buttons.

### 4.4 Form Elements
- Standard height: 42px.
- Border radius: 8px–10px.
- Focus ring: 2px solid `#3B82F6` with 2px offset.
- Surface: `#FFFFFF` (light mode).
- Typography: Body Small (14px).

---

## 5. Controlled Experience Themes

### 5.1 Public Institutional Website
- **Atmosphere:** Persuasive, trustworthy, institutional, clear.
- **Canvas:** `#FFFFFF` with `#F6F8FB` alternate section bands.
- **Max Content Width:** `1280px` centered.
- **Hero & Primary Action:** Civic Blue `#2563EB` CTA.
- **Metrics Presentation:** Clear pedagogical goals ("What We Measure") rather than exaggerated percentage claims.

### 5.2 Admin Portal
- **Atmosphere:** Operational, structured, data-driven, clean.
- **Canvas:** `#F6F8FB`.
- **Sidebar:** `#FFFFFF` with 1px `#E2E8F0` border, 272px fixed desktop width.
- **Scenario Builder:** Cohesive light form panels and steppers inside the Admin Portal shell.
- **Resources:** Clean white resource cards with category badges and print/download actions.

### 5.3 Player PWA
- **Atmosphere:** Playful, immersive, empowering, focused.
- **Gameplay Mode (City Board):** Deep Navy `#0A1128`/`#0F1C3F` shell, 2.5D board, district accents, gold dice roller.
- **Utility Screens (Squad Lobby, Guardians, Reflection, Casebook, Rewards):**
  - Canonical light canvas `#F6F8FB` with white cards `#FFFFFF`.
  - Shared typography, button forms, and radii.
  - Seamless, intentional continuity between board and utility screens.
