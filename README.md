# Project SHIELD — ShieldQuest

> **Choose Right. Protect Together.**  
> A youth-focused interactive crime-prevention and scam-awareness learning platform that combines an interactive 2.5D city board, scenario-based deliberation, peer discussion, delayed consequences, and bystander intervention to empower youths to make safer decisions.

[![Tests](https://img.shields.io/badge/tests-38%20passing-brightgreen.svg)](<>)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](<>)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](<>)
[![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)](<>)

---

## 1. Institutional Context & Partnerships

- **Project Lead:** Team SecurePi — Felicia Tan & Charlisa Tan (Nanyang Polytechnic)
- **Grant Alignment:** National Youth Council (NYC) Young ChangeMakers (YCM) Grant (S$4,850)
- **Programme Track:** Singapore Police Force (SPF) / NCPC Delta Challenge 2026 Track B
- **Workshop Model:** Standard 90-minute facilitated session for cohorts of 20–30 youths (Secondary, Post-Secondary/ITE/Polytechnic, Tertiary)
- **Safety Framework:** RAMS-compliant (Risk Assessment Method Statement), non-victim blaming, privacy-by-design (zero PII, anonymous pseudonyms)

---

## 2. Core Pillars & Architecture

1. **Credible Public Institutional Website** (`/`, `/about`, `/how-it-works`, `/for-schools`, `/safety`, `/faq`):
   - Clear institutional messaging for schools, government agencies (SPF, MHA, NCPC), and grant evaluators.
   - Transparent workshop deployment model, RAMS safety guidelines, and "Request a Session" enquiry modal.
2. **Hybrid 2.5D and 3D Player PWA** (`/board`, `/join`, `/onboarding`, `/scenario/:id`, `/minigame/:id`):
   - Accessible 2.5D CSS board remains the interaction layer and low-power fallback.
   - A lazy-loaded procedural Three.js skyline adds genuine 3D depth on capable devices without using third-party Monopoly artwork.
   - 16 perimeter tiles on a 5x5 grid with upright billboarded pawns and district landmarks.
   - Pinned bottom dice roller, floating HUD, and unblocked canvas.
3. **Peer Shield Mode** (`/peer-shield`):
   - Interactive "Friend in Trouble" chat dilemma where players practice bystander intervention when a friend is targeted by a money mule or phishing scheme.
4. **Shield Central Operations Hub** (`/shield-central`):
   - 7 dedicated sub-destinations: Casebook (10 real-world scam dossiers), Rewards (ethical cosmetics), Achievements (7 practice milestones), S.H.I.E.L.D. Skills (6 core competencies), Trusted Help (SPF 1799, ScamShield, SOS), Settings (accessibility/motion toggles), and Check-In (pre/post evaluation).
5. **Secure Facilitator & Admin Portal** (`/admin`, `/admin/login`, `/admin/sessions`, `/admin/scenarios`, `/admin/builder`, `/admin/youth-missions`, `/admin/analytics`, `/admin/resources`):
   - Session manager with room code (`SQ-7842`) and QR code launcher.
   - Live Attendance and Think–Vote–Explain debrief monitor.
   - 8-step Scenario Authoring Wizard with mobile preview.
   - Youth Mission Review Queue & Flash Mission dispatch.
   - Pilot Evaluation Framework (6 KPIs) & Group Decision signals.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript 5.8, Vite 8, Tailwind CSS v4, `react-router-dom`
- **State Management:** Zustand 5 (`sessionStore`, `cityBoardStore`)
- **Backend & Database:** Node.js, Express 5, Prisma 7, PostgreSQL schema
- **Mobile/PWA:** Service Worker via `vite-plugin-pwa` (Workbox)
- **Testing:** Node.js native test runner (`tsx --test`), Supertest, Playwright

---

## 4. Complete Application Routes

| Path                           | Description                                                                 | Target Audience                   |
| :----------------------------- | :-------------------------------------------------------------------------- | :-------------------------------- |
| `/`                            | Public Institutional Website (Hero, 3 Pillars, 9-Step Flow, Guardians, FAQ) | Public, Schools, Grant Evaluators |
| `/about`                       | Project background, SecurePi team, and NYC YCM alignment                    | Public & Educators                |
| `/how-it-works`                | The 4-phase pedagogical loop & Think–Vote–Explain methodology               | Educators & Facilitators          |
| `/for-schools`                 | 90-minute workshop structure & booking request modal                        | School Leaders & Teachers         |
| `/safety`                      | RAMS safety principles & Privacy-by-Design policies                         | Compliance & Parents              |
| `/board`                       | 2.5D Isometric Diamond Grid City Board experience                           | Players                           |
| `/join`                        | Room session code entry and Squad lobby                                     | Players                           |
| `/onboarding`                  | 7-step player orientation briefing and pawn token selection                 | Players                           |
| `/scenario/:id`                | Interactive scenario investigation & consequence simulation                 | Players                           |
| `/minigame/:id`                | Dedicated runner for all 6 playable mini-games                              | Players                           |
| `/peer-shield`                 | Interactive "Friend in Trouble" bystander dilemma simulation                | Players                           |
| `/shield-central`              | Operations Hub (overview of all secondary features)                         | Players                           |
| `/shield-central/casebook`     | 10 forensic threat dossiers and scam breakdown cards                        | Players                           |
| `/shield-central/rewards`      | Ethical cosmetics (auras, frames, badges) for tokens                        | Players                           |
| `/shield-central/achievements` | Personal decision milestones (zero competitive ranking)                     | Players                           |
| `/shield-central/skills`       | S.H.I.E.L.D. 6 competencies overview and practice counts                    | Players                           |
| `/shield-central/trusted-help` | Singapore hotlines (SPF 1799, ScamShield, SOS) & advice                     | Players                           |
| `/shield-central/settings`     | Accessibility controls, reduced motion, and pseudonym                       | Players                           |
| `/shield-central/check-in`     | Pre- and post-workshop evaluation survey                                    | Players & Facilitators            |
| `/session-complete`            | Post-session certificate & completion celebration                           | Players                           |
| `/admin/login`                 | Evaluator credentials login (`facilitator@shieldquest.sg`)                  | Facilitators                      |
| `/admin`                       | Portal command dashboard and quick actions                                  | Facilitators                      |
| `/admin/sessions`              | Active sessions list & live attendance monitor                              | Facilitators                      |
| `/admin/scenarios`             | Curated scenario library with multi-faceted filters                         | Facilitators                      |
| `/admin/builder`               | 8-step Scenario Authoring Wizard with live preview                          | Facilitators                      |
| `/admin/youth-missions`        | Youth proposal review queue & Flash Mission dispatch                        | Facilitators                      |
| `/admin/analytics`             | Pilot Evaluation Framework (6 KPIs) & Group Signals                         | Facilitators & Evaluators         |
| `/admin/resources`             | Facilitator guides, debrief slides, printable RAMS kit                      | Facilitators                      |

---

## 5. Quick Start & Development

### Prerequisites

- Node.js **22.12+** (Node 24 recommended)
- npm

### Installation & Run

```sh
npm install
npm run dev
```

- Web App: **http://localhost:5173**
- Backend API: **http://localhost:3001/api/health**

### Verification Commands

```sh
npm run typecheck    # 0 errors across client and server
npm test             # 38 unit & integration tests passing
npm run build        # Production PWA bundle built in <1s
```

---

## 6. Privacy & Educational Safeguards

1. **Zero Personally Identifiable Information (PII):** No names, NRICs, phone numbers, or emails are collected.
2. **Non-Victim Blaming Tone:** Scams are framed as engineered criminal syndicates exploiting normal human heuristics; guidance never blames victims.
3. **Safe Bystander Escalation:** Teaches youths how to de-escalate peer situations privately without escalating conflict.
4. **Transparent Prototype Notice:** All simulated cohort metrics and attendance sheets clearly indicate `ILLUSTRATIVE PROTOTYPE DATA`.
