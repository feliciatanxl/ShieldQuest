# PROJECT SHIELD: SHIELDQUEST CONSOLIDATION PLAN (MERGE_PLAN.md)

**Generated:** September 2026  
**Target Repository:** `ShieldQuest` (`c:\Users\felth\Downloads\ShieldQuest`)  
**Core Stack:** React 19, Vite 8, TypeScript 5.8, Tailwind CSS v4, Zustand 5, Express 5, Prisma 7, PWA  

---

## 1. Executive Summary & Source Package Audit

We audited four distinct project packages to consolidate them into one canonical, production-ready, highly credible repository for youth crime prevention, school deployments, and grant evaluations (SPF / MHA / NCPC / NYC Young ChangeMakers).

### Source Package Analysis

| Package | Strengths / Assets Identified | Gaps / Conflicts / Anti-Patterns to Avoid |
| :--- | :--- | :--- |
| **1. ShieldQuest-main (TARGET)** | • Strong production architecture: React 19, Vite 8, Tailwind v4, Express 5, Prisma.<br>• 2.5D Isometric Diamond Grid board (`CityTrack.tsx`, `SpaceMark.tsx`).<br>• Fully tested state stores (`sessionStore`, `cityBoardStore`), comprehensive unit tests (38 passing).<br>• Fast PWA service worker build (905ms). | • Mode switching was state-based rather than real URL-routed.<br>• Missing dedicated standalone routes for Shield Central subpages and mini-games. |
| **2. Follow Markdown Instructions (3)** | • Complete `react-router-dom` page routing structure.<br>• Clean UI styling for `PeerShield.tsx` ("Friend in Trouble" chat dilemma & bystander reflection).<br>• Dedicated Admin Layout (`AdminLayout.tsx`) with nested subroutes.<br>• Accessibility Modal (`AccessibilityModal.tsx`). | • Flat board mockup (must NOT replace the 2.5D isometric board).<br>• Mock-only state without backend integration or comprehensive stores. |
| **3. SecurePi_SPF-main** | • 6 rich playable mini-games (*Risk or Safe?*, *Clue Match*, *Decode the Clue*, *What Happens Next?*, *Who Can Help?*, *Word Search*).<br>• Shield Central secondary hub architecture (Casebook, Rewards, Achievements, Skills, Trusted Help, Settings, Check-in).<br>• Pilot evaluation metrics and learning-check models.<br>• High-depth Singapore institutional context (SPF 1799 hotline, ScamShield, NCPC). | • Next.js App Router structure (Next 15) incompatible with Vite single-SPA / PWA without porting.<br>• Heavy code fragmentation across legacy directories. |
| **4. NYC Project / Submission Documents** | • Precise project facts: Team SecurePi (Felicia Tan & Charlisa Tan, Nanyang Polytechnic).<br>• Grant alignment: NYC Young ChangeMakers (YCM S$4,850), SPF Delta Challenge 2026 Track B.<br>• Standard 90-minute workshop model (20–30 youths per cohort).<br>• RAMS safety principles (non-victim blaming, anonymous pseudonyms, opt-out triggers). | • Document formats only (PDF, DOCX, XLSX); content must be reflected accurately across public website, facilitator portal, and player flows. |

---

## 2. Unification Architecture

### A. Routing Architecture (`react-router-dom`)
Replace mode-based tab rendering with real browser URL routing supporting deep linking, history, and evaluation reviews:
- **Public Institutional Site**:
  - `/` (Home / Hero / 3 Pillars / 9-Step Flow / 6 Guardians / Scenarios / Pilot Model / FAQ)
  - `/about`
  - `/how-it-works`
  - `/for-schools`
  - `/safety`
  - `/accessibility`
  - `/faq`
- **Player PWA Experience**:
  - `/join` (Room code entry / Squad lobby)
  - `/welcome` & `/onboarding` (7-step onboarding flow)
  - `/board` (2.5D Isometric Diamond Grid board with 16 perimeter tiles, upright pawns, and landmark)
  - `/scenario/:id` (Think-Vote-Explain scenario runner & consequence simulator)
  - `/minigame/:id` (All 6 playable mini-games inside `MiniGameShell`)
  - `/peer-shield` (Interactive "Friend in Trouble" dilemma simulation)
  - `/guardians` (6 Guardians framework & skill progression)
  - `/progress` (Player stats, badges, and learning analytics)
  - `/shield-central` (Hub overview)
    - `/shield-central/casebook` (Scam profiles & solved cases)
    - `/shield-central/rewards` (Cosmetics, frames, aura, tokens)
    - `/shield-central/achievements` (Earned milestones)
    - `/shield-central/skills` (Core youth defense competencies)
    - `/shield-central/trusted-help` (Institutional hotlines: SPF 1799, ScamShield, SOS)
    - `/shield-central/settings` (Reduced motion, audio, contrast, pseudonym)
    - `/shield-central/check-in` & `/evaluation` (Post-session reflection)
  - `/session-complete` (Mission complete celebration & certificate)
- **Facilitator & Admin Portal**:
  - `/admin/login` (Secure evaluator / facilitator credentials login)
  - `/admin` (Command dashboard & quick actions)
  - `/admin/sessions` (Active sessions list)
  - `/admin/sessions/new` (Launch new cohort / generate QR code)
  - `/admin/sessions/:id` & `/admin/sessions/:id/live` (Live attendance & voting monitor)
  - `/admin/scenarios` (Curated scenario library & filters)
  - `/admin/scenarios/:id` (Scenario deep dive & debrief questions)
  - `/admin/builder` (8-step Scenario Authoring Wizard)
  - `/admin/youth-missions` (Youth Mission Queue & Flash Mission dispatch)
  - `/admin/analytics` (Pilot Evaluation Framework & Group Decision signals)
  - `/admin/resources` (Facilitator guides, debrief slides, printable RAMS kit)
  - `/admin/settings` (Portal configuration)
- **Fallback**:
  - `*` (Accessible 404 page with breadcrumbs)

### B. Database & Schema Alignment (`server/prisma/schema.prisma`)
- `District`: `SCHOOL`, `RETAIL`, `DIGITAL`, `COMMUNITY`
- `ScenarioStatus`: `DRAFT`, `UNDER_REVIEW`, `NEEDS_CHANGES`, `APPROVED`, `PUBLISHED`, `ARCHIVED`
- `LearnerBand`: `PRIMARY`, `SECONDARY`, `TERTIARY`, `GENERAL`

### C. Prototype Integrity & Transparency
All simulated data, mock metrics, and demo attendance sheets must display clear `ILLUSTRATIVE PROTOTYPE DATA` badges to maintain institutional trust with evaluators.
