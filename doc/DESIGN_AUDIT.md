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

# SHIELDQUEST — DESIGN SYSTEM AUDIT (DESIGN_AUDIT.md)

**Audit Date:** September 2026  
**Status:** In Progress / Unification Pass  
**Scope:** Public Website, Admin Portal, Player PWA, Shared Design Primitives & Stylesheets  

---

## 1. Executive Summary

ShieldQuest currently contains three distinct user journeys (Public Institutional Website, Facilitator Admin Portal, and Player PWA). Due to rapid prototype merging, components have inherited styles from different design eras:
1. **Legacy Forest-Green / Cream System:** Early prototype styling (`#245b48`, `#285e48`, `#f7f9f2`, `#fffefa`, `#eaf0df`, `Trebuchet MS`, pseudo-3D button drop shadows).
2. **Newer Civic Blue / Deep Navy Tokens:** Modern civic system in `city-board.css` and `AdminChrome.tsx` (`#0A1128`, `#0F1C3F`, `#2563EB`, `#3B82F6`, `#F6F8FB`).
3. **Disconnected Dark UI:** The Scenario Builder Wizard (`ScenarioBuilderWizard.tsx`), Facilitator Resources (`FacilitatorResources.tsx`), and Facilitator Login (`FacilitatorLogin.tsx`) used hardcoded `slate-900`/`slate-950` dark treatments that broke continuity with the light Admin Portal.
4. **Public Site Presentation Variances:** Public landing pages used `slate-50` with bespoke section widths and illustrative percentage statistics that looked like premature claims.

---

## 2. Style & File Inventory

### 2.1 CSS Files
| File Path | Description | Classification | Action Plan |
| :--- | :--- | :--- | :--- |
| `src/styles.css` | Main CSS file. Contains `@import 'tailwindcss'`, `@theme` blocks, `@layer base` resets, and ~1,500 lines of legacy prototype CSS. | **REPLACE & REFINE** | Modernize `@layer base` to canonical typography and `#F6F8FB` neutral canvas; introduce `--sq-*` semantic tokens; eliminate legacy 3D button drop shadows; map legacy classes (`.primary-button`, `.surface`, `.brand-mark`) to canonical tokens. |
| `src/features/city-board/city-board.css` | Board animations, diamond grid transforms, HUD styles, and civic/navy `@theme` tokens. | **KEEP & MERGE** | Keep diamond grid transforms and isometric animations; align neutral and accent tokens with `--sq-*` tokens. |
| `src/features/guardians/guardians.css` | Guardian aura and preview note styles. | **REFINE** | Ensure consistency with canonical radii and shadows. |

### 2.2 Hardcoded Legacy vs Canonical Colors
| Colour / Usage | Found In | Categorisation | Resolution |
| :--- | :--- | :--- | :--- |
| `#245b48`, `#285e48` (Forest Green) | `src/styles.css` (`.primary-button`, `.brand-mark`) | **REPLACE** | Replace with Civic Blue `#2563EB` for primary buttons and Navy `#0A1128` for brand containers. Reserve green purely for success states (`#059669`) and Community Hub district accent. |
| `#f7f9f2`, `#fffefa`, `#fffdf2` (Cream / Off-white) | `src/styles.css` (root background, `.surface`) | **REPLACE** | Replace with Canvas `#F6F8FB` and crisp white `#FFFFFF` for cards. |
| `#eaf0df`, `#edf1e6` (Muted Sage Green) | `src/styles.css` (`.badge`, `.desktop-nav button.active`) | **REPLACE** | Replace with Civic 50 (`#EFF6FF`) and Slate 100 (`#F1F5F9`). |
| `#315e47`, `#2a5d46` (Dark Forest Green) | `src/styles.css` (`.join-button`, `.text-button`) | **REPLACE** | Replace with Civic Blue `#2563EB` and Navy `#0A1128`. |
| `bg-slate-900`, `bg-slate-950` (Dark Slate Blocks) | `ScenarioBuilderWizard.tsx`, `FacilitatorResources.tsx` | **REPLACE** | Convert to light institutional Admin Portal canvas (`#F6F8FB`) with white cards and clean borders. |
| `Trebuchet MS` | `src/styles.css` (`--font-sans`) | **REPLACE** | Replace with modern sans-serif stack: `'Inter', 'Segoe UI', Arial, sans-serif`. |
| `box-shadow: 0 3px 0 #17452f` (Pseudo-3D button shadow) | `src/styles.css` (`.primary-button`, `.brand-mark`) | **REMOVE** | Remove heavy offset shadows; use modern subtle elevation (`shadow-sm`, `shadow-md`). |

---

## 3. Component Duplication & Inconsistencies

### 3.1 Buttons
- **Legacy:** `.primary-button` (green `#285e48`, 3D shadow, 10px radius), `.join-button` (green `#2a5d46`), `.secondary-button` (cream/green border).
- **Admin:** Tailwind utility buttons (`bg-civic-600 px-4 text-white shadow-sm hover:bg-civic-700`).
- **Scenario Builder:** Dark slate button (`bg-slate-800 border-slate-700`).
- **Action:** **MERGE & REPLACE** with a unified `<Button />` component in `src/design-system/Button.tsx`.

### 3.2 Cards
- **Legacy:** `.surface` (beige `#fffefa`, 19px border radius, `#e1e6da` border).
- **Admin:** `rounded-xl border border-line bg-surface p-5`.
- **Resources:** `rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-white`.
- **Public Site:** `rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm`.
- **Action:** **MERGE & REPLACE** with canonical `<Card>` primitives in `src/design-system/Card.tsx` (16px radius, `#E2E8F0` border, `#FFFFFF` background).

### 3.3 Page Headers
- **Admin:** Mixed headers in `ScenarioPortal.tsx` and child sections.
- **Player:** `.page-heading` in `PlayerExperience.tsx` with arbitrary margin `31px 0 29px`.
- **Public:** Custom h1/h2 sections.
- **Action:** **MERGE** with a unified `<PageHeader />` supporting eyebrow, title, description, actions, and badges.

### 3.4 Brand Mark
- **Legacy:** `.brand-mark` (green square `#285e48` with gold star and 13px radius).
- **Admin:** Shield icon inside navy circle/square.
- **Public:** Shield icon with gradient background.
- **Action:** **MERGE & STANDARDIZE** into `<BrandMark />` supporting light and dark surfaces.

---

## 4. Controlled Experience Alignment Matrix

| Experience | Background Canvas | Surface / Cards | Primary Action | Heading Color | Radius System |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Website** | `#FFFFFF` / `#F6F8FB` | White `#FFFFFF` | Civic Blue `#2563EB` | Navy `#0A1128` | 10px (btn), 16px (card), 20px (panel) |
| **Admin Portal** | Canvas `#F6F8FB` | White `#FFFFFF` | Civic Blue `#2563EB` | Navy `#0A1128` | 10px (btn), 16px (card), 10px (input) |
| **Player PWA (Board)** | Deep Navy `#0A1128` / `#0F1C3F` | Navy / District Glass | Gold `#F59E0B` / Civic Blue | White / Gold | 10px (btn), 16px (card) |
| **Player PWA (Utility)**| Canvas `#F6F8FB` | White `#FFFFFF` | Civic Blue `#2563EB` | Navy `#0A1128` | 10px (btn), 16px (card), 10px (input) |

---

## 5. Execution Summary Table

| Subsystem / Page | Pre-Refactor Status | Target State | Migration Category |
| :--- | :--- | :--- | :--- |
| Global Tokens & CSS | Legacy green/cream mixed with civic theme | Clean `--sq-*` tokens, Inter font, #F6F8FB canvas | **REPLACE & MERGE** |
| Button Primitives | 4+ conflicting implementations | Single `<Button />` with 6 semantic variants | **REPLACE** |
| Card Primitives | Inconsistent radii (14px, 17px, 19px, 21px, 24px) | Single `<Card>` primitive with 12–16px radii | **MERGE** |
| Scenario Builder | Dark slate-900 detached modal | Light institutional Admin layout with white cards | **REFINE & MERGE** |
| Facilitator Resources | Dark charcoal cards (`slate-900`) | Clean white resource cards with category badges | **REFINE** |
| Facilitator Login | Dark screen with non-standard labels | Canonical Deep Navy, Civic Blue CTA, Gold accent | **REFINE** |
| Player Experience Shell | Legacy green header, nav, and brand mark | Canonical BrandMark, Civic active nav tabs | **REFINE** |
| Squad Lobby & Join | Legacy `.surface .padded` green styling | Clean white Card, Civic Blue primary buttons | **REFINE** |
| Assessment & Reflection| Legacy green styling & 3D button | Clean Card, Civic Blue buttons, unified radio pills | **REFINE** |
| Public Website | Mixed container widths & illustrative percentages | 11-section flow, 1280px max-width, pedagogical metrics | **REFINE** |
