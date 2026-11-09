# ShieldQuest

**Choose Right. Protect Together.**  
*Experience the consequence. Understand the pressure. Protect someone else.*

ShieldQuest is an interactive, scenario-based youth crime-prevention game designed to help young people recognise manipulation, navigate high-pressure dilemmas, and practise stepping in safely when a peer is at risk.

Developed by **Team SecurePi** from **Nanyang Polytechnic**, ShieldQuest transforms crime-prevention education from passive memorisation into an engaging simulation where decisions carry immediate and delayed consequences.

> [!NOTE]
> **Project Notice**  
> ShieldQuest is an independent student project created by Team SecurePi. It is not an official product or service of the Singapore Police Force (SPF), the National Crime Prevention Council (NCPC), the National Youth Council (NYC), or any Government agency. All characters, organisations, phone numbers, and web domains featured in the scenarios are entirely fictional and designed solely for educational gameplay.

---

## Contents

- [Project Overview](#project-overview)
- [The Problem](#the-problem)
- [Core USP](#core-usp)
- [How the Game Works](#how-the-game-works)
- [Core Features](#core-features)
- [The Six Guardians](#the-six-guardians)
- [The S.H.I.E.L.D. Framework](#the-shield-framework)
- [Technology and Architecture](#technology-and-architecture)
- [Development Roadmap](#development-roadmap)
- [Development Setup](#development-setup)
- [Prototypes and Demonstrations](#prototypes-and-demonstrations)
- [Contributing, Security and Licence](#contributing-security-and-licence)

---

## Project Overview

Most young people understand intellectually that scams, theft, and unlawful online activities are wrong. However, real-life lapses often happen in social, high-pressure moments—such as when friends offer a dare, an urgent message demands immediate action, or an online offer promises quick financial reward.

ShieldQuest provides a safe digital sandbox where players can encounter these pressures, explore the grey areas of digital and social influence, and practise making responsible choices before facing similar risks in real life.

---

## The Problem

Traditional crime-prevention awareness often relies on static posters, lectures, and informational talks. While useful for imparting basic facts, passive instruction struggles to prepare youths for high-pressure situations:

- **Urgency and Coercion:** Scammers and manipulators use manufactured panic, artificial scarcity, or authority intimidation to force quick decisions.
- **Peer Dynamics:** Youths often encounter risky situations through friends, classmates, or gaming groups, where refusing can feel socially awkward or confrontational.
- **Self-Effected Action:** Modern cyber-enabled crimes and scams frequently manipulate the victim into performing the transaction or sharing credentials voluntarily.
- **Delayed Visibility:** Dangerous choices rarely announce their full fallout immediately; consequences often unfold over time, long after the initial reward.

ShieldQuest addresses this gap by making the decision itself the learning mechanic.

---

## Core USP

ShieldQuest is built around a distinct educational principle:

> **Experience the consequence. Understand the pressure. Protect someone else.**

Three core gameplay mechanics bring this approach to life:

### 1. Delayed Consequence Engine
In real-world scams and offences, risky actions frequently produce immediate perks (such as fast cash or peer validation), while the fallout (frozen accounts, police investigations, or damaged trust) surfaces later. The **Delayed Consequence Engine** simulates this latency: short-term gains can trigger unexpected complications in subsequent stages, teaching players that immediate reward does not equal safety.

### 2. Peer Shield Mode
Crime prevention is not just about personal self-defence; it is about community resilience. In **Peer Shield Mode**, players step into situations where an in-game friend or squad mate is on the verge of making an unsafe decision. Players practise supportive, non-confrontational intervention strategies to steer their peer out of harm's way without escalating conflict.

### 3. Think–Vote–Explain
In group or squad play, members encounter ambiguous evidence, cast private individual votes, and view the aggregated squad distribution without revealing who voted for what. Squads then deliberate differing viewpoints, unpack manipulation tactics together, and reach consensus on a safer path forward.

---

## How the Game Works

The core gameplay loop is structured around a multi-stage investigative flow:

```
┌─────────────────┐     ┌─────────────────┐     ┌───────────────────────┐
│ 1. Enter Board  │ ──> │ 2. Investigate  │ ──> │ 3. Think-Vote-Explain │
│  Select Mission │     │ Evidence Clues  │     │  Squad Deliberation   │
└─────────────────┘     └─────────────────┘     └───────────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌─────────────────┐     ┌───────────────────────┐
│ 6. Peer Shield  │ <── │ 5. Consequences │ <── │   4. Make Decision    │
│ Protect a Friend│     │Immediate+Delayed│     │   Action Selection    │
└─────────────────┘     └─────────────────┘     └───────────────────────┘
```

1. **Enter City Board:** The player navigates an urban district map and selects an active mission hotspot.
2. **Investigate Scenario:** The player reviews interactive evidence, such as chat logs, fake transaction slips, social media profiles, and permission requests.
3. **Think–Vote–Explain:** In squad play, members independently review clues, submit private choices, and discuss the revealed aggregate distribution.
4. **Make Decision:** The player commits to an action from multi-branching choices under simulated constraints.
5. **Experience Consequences:** The game reveals immediate feedback followed by second-order consequences that alter district trust and player security over time.
6. **Peer Shield & Progression:** Players apply their insights to protect a friend facing an escalating risk, earning skill-based Guardian progress.

---

## Core Features

- **Interactive City Board:** An urban map with distinct districts (School Street, Retail District, Digi-District, Community Hub) representing common settings where youths encounter risks.
- **Branching Scenarios:** Non-linear storylines with realistic dilemmas, ambiguous evidence, and multiple outcome paths.
- **Delayed Consequence Simulation:** Dynamic state tracking where decisions produce cascading effects across multi-turn gameplay.
- **Peer Shield Challenges:** Dedicated bystander scenarios requiring supportive, non-confrontational peer redirection.
- **Think–Vote–Explain Mechanics:** Facilitated squad voting system featuring secret individual ballots and anonymised aggregate displays.
- **The Six Guardians:** An achievement and skill system where characters are unlocked through demonstrated protective reasoning, never random chance or loot boxes.
- **Scenario Management Portal:** Planned administrative tools for educators to browse, configure, and schedule mission playlists.
- **Youth-Created Mission Review:** A templated scenario-authoring pipeline allowing youth ideas to be reviewed and approved by moderators before entering gameplay.
- **Accessible Design:** Planned support for high-contrast palettes, scalable typography, keyboard navigation, and lightweight performance on low-spec mobile devices.
- **Offline Companion Activities:** Complementary offline materials (cards and printable scenario boards) to support low-tech or classroom settings.

---

## The Six Guardians

Guardians represent core crime-prevention competencies. Each Guardian embodies a distinct protective skill and provides in-game tools to assist players during investigations:

| Guardian | Discipline | In-Game Role | Reinforced Behaviour |
|---|---|---|---|
| **VeriFox** | **Verification** | Validates claims against trusted sources; checks URLs and identities. | Pause and verify information through trusted channels before taking action. |
| **Echo** | **Consultation** | Prompts consultation with friends, teachers, or trusted adults. | Overcome hesitation or embarrassment; seek advice when things seem unusual. |
| **Beacon** | **Reporting** | Identifies confidential, official reporting channels and escalation paths. | Know when, how, and where to report suspicious activity safely. |
| **Shieldfin** | **Peer Protection** | Deploys calm refusal responses and shields peers from social pressure. | Resist dares, coercion, and manipulation from friends or acquaintances. |
| **Cluepaw** | **Situational Awareness** | Highlights subtle inconsistencies and overlooked details in evidence. | Pay attention to context, fine print, and anomalies in digital communication. |
| **ByteBuddy** | **Digital Hygiene** | Inspects app permissions, credential requests, and multi-factor security. | Protect personal logins, passwords, Singpass credentials, and device access. |

---

## The S.H.I.E.L.D. Framework

ShieldQuest structures its learning outcomes around the transferable **S.H.I.E.L.D.** behavioural model. Rather than teaching narrow scam scripts that quickly become outdated, the framework instils a repeatable habit of mind:

- **S — Spot the Risk:** Recognise subtle warning signs, suspicious requests, and unusual pressure.
- **H — Hold Before Acting:** Pause before reacting to artificial urgency, excitement, or fear.
- **I — Identify the Influence:** Recognise the manipulation levers being used (e.g. social proof, authority, scarcity, or dares).
- **E — Evaluate the Consequences:** Look beyond short-term perks and anticipate delayed personal, social, and legal liabilities.
- **L — Lead the Right Choice:** Choose a safe, proportionate, and lawful response for oneself.
- **D — Defend Your Community:** Support and protect friends through positive bystander intervention and safe escalation.

The platform aims to evaluate these six skills independently, ensuring that each behavioural competency is supported by distinct scenario challenges.

---

## Technology and Architecture

The planned rebuild of ShieldQuest is structured as a modern, privacy-first **Progressive Web Application (PWA)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (PWA)                              │
│                                                                             │
│   ┌───────────────────────────┐           ┌─────────────────────────────┐   │
│   │   Mobile-First Player     │           │   Facilitator / Educator    │   │
│   │   Experience (PWA)        │           │   Dashboard (Web Console)   │   │
│   └─────────────┬─────────────┘           └──────────────┬──────────────┘   │
└─────────────────┼────────────────────────────────────────┼──────────────────┘
                  │                                        │
                  ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & API SERVICES                         │
│                                                                             │
│   ┌───────────────────────────┐           ┌─────────────────────────────┐   │
│   │  Scenario & Branching     │           │  Anonymous Squad Voting &   │   │
│   │  Consequence Engine       │           │  Session Synchronisation    │   │
│   └─────────────┬─────────────┘           └──────────────┬──────────────┘   │
└─────────────────┼────────────────────────────────────────┼──────────────────┘
                  │                                        │
                  ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA & STORAGE LAYER                             │
│                                                                             │
│   ┌───────────────────────────┐           ┌─────────────────────────────┐   │
│   │  Reviewed Scenario DB     │           │  Temporary Room State &     │   │
│   │  (Structured JSON)        │           │  Anonymised Telemetry       │   │
│   └───────────────────────────┘           └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architectural Principles

- **Mobile-First Accessibility:** Fast loading, responsive layout, and touch-friendly interaction targets (at least 48 px) tailored for student smartphones.
- **Data Minimisation Goal:** Designed to avoid collecting unnecessary personal data (no names, phone numbers, national IDs, or emails required for basic gameplay).
- **Lightweight Session Management:** Aiming for temporary room codes for squad synchronisation, keeping group play decoupled from permanent player accounts.
- **Resilient Delivery:** Service-worker caching for assets and scenario payloads to enable smooth operation on low-bandwidth school or community networks.

---

## Development Roadmap

The project's planned software evolution follows six core milestones:

```
[Phase 1] Requirements & Prototype Review
    │
    ▼
[Phase 2] Core Gameplay Engine (Board, Decisions, Consequence State)
    │
    ▼
[Phase 3] Guardians & Scenario Library Expansion
    │
    ▼
[Phase 4] Facilitator Console & Content Moderation Tools
    │
    ▼
[Phase 5] Accessibility, Performance & Usability Refinement
    │
    ▼
[Phase 6] Production Packaging & Deployment
```

1. **Phase 1: Requirements & Prototype Review** — Review earlier exploratory codebases, consolidate scenario schemas, and define core technical specifications.
2. **Phase 2: Core Gameplay Engine** — Build the district board navigation, branching decision logic, Delayed Consequence state engine, and local squad voting.
3. **Phase 3: Guardians & Scenario System** — Implement Guardian skill progression, tool abilities, and a broader library of vetted scenarios.
4. **Phase 4: Facilitator Console & Moderation** — Develop educator room controls, live aggregate vote displays, and the scenario submission pipeline.
5. **Phase 5: Accessibility & Refinement** — Execute WCAG 2.1 AA audits, optimize mobile rendering performance, and conduct usability testing.
6. **Phase 6: Production Packaging** — Prepare deployment pipelines, containerisation, documentation, and facilitator guides.

---

## Development Setup

> [!NOTE]
> This repository currently contains project documentation, design specifications, and architecture planning files. Application source code will be integrated during the upcoming rebuild phases.

Once code scaffolding begins, environment prerequisites and setup commands will be documented here. In the meantime, review [CONTRIBUTING.md](CONTRIBUTING.md) for workflow standards and [SECURITY.md](SECURITY.md) for planned privacy controls.

---

## Prototypes and Demonstrations

Earlier iterations and design references developed during the concept phase:

- **Competition Prototype:** [feliciatanxl/SecurePi_SPF](https://github.com/feliciatanxl/SecurePi_SPF)  
  *Next.js front-end demonstrator built for competition concept presentation.*
- **Prototype V1:** [feliciatanxl/ShieldQuest-V1](https://github.com/feliciatanxl/ShieldQuest-V1)  
  *First-generation architectural test evaluating SVG district maps, Guardian assets, and early scenario flow.*
- **Prototype V2 (Railway):** [feliciatanxl/ShieldQuest-V2](https://github.com/feliciatanxl/ShieldQuest-V2)  
  *Second-generation prototype exploring dynamic multiplayer room states and squad voting mechanics.*
- **Visual Demo:** [shieldquest-sigma.vercel.app](https://shieldquest-sigma.vercel.app/)  
  *Early static web demonstrator showcasing initial UI styling and screen flow.*

*(These links represent historical proofs of concept and design references; they do not represent the final production codebase.)*

---

## Contributing, Security and Licence

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Workflow, branching, coding conventions, and scenario review guidelines.
- **[SECURITY.md](SECURITY.md)** — Security policies, vulnerability reporting channels, and privacy architecture.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Standards for respectful, youth-safe project collaboration.
- **[LICENSE](LICENSE)** — Proprietary licence terms; all rights reserved by Team SecurePi.

---

*ShieldQuest is developed by Team SecurePi (Nanyang Polytechnic, Singapore). Copyright © 2026 Team SecurePi. All rights reserved.*
