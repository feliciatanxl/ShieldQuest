# ShieldQuest

**Choose Right. Protect Together.**  
*Experience the consequence. Understand the pressure. Protect someone else.*

ShieldQuest is an interactive, scenario-based youth crime-prevention game designed to help young people recognise manipulation, navigate high-pressure dilemmas, and practise stepping in safely when a peer is at risk.

Developed by **Team SecurePi** from **Nanyang Polytechnic**, ShieldQuest transforms crime-prevention education from passive memorisation into an engaging simulation where decisions carry immediate and delayed consequences.

> [!NOTE]
> **Project Notice**  
> ShieldQuest is an independent student project created by Team SecurePi. It is not an official product or service of the Singapore Police Force (SPF), the National Crime Prevention Council (NCPC), the National Youth Council (NYC), or any Government agency. All characters, organisations, phone numbers, and web domains featured in the scenarios are entirely fictional and designed solely for educational gameplay.

---

## Run the Phase 1 prototype

Use Node.js 22 or newer and run these commands from the checkout.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Create an avatar and explore Sunshine Estate with WASD or the arrow keys. Hold Shift to run and press E to interact. On touch layouts, drag the bottom-left joystick to walk. Push past the dashed ring to run, or release to stop. The bottom-right action button appears when you can talk, inspect an object, or enter or leave a location.

The prototype saves your avatar, position, settings, and tutorial progress in this browser. The wardrobe, pocket guide, and area map are available from the in-game HUD. To build and verify the app, run `npm run typecheck` and `npm run build`.

Open `src/game/maps/neighbourhood.tmj` in Tiled to edit the 64×32 isometric ground and scenery footprints. Phaser draws the original scenery from the map's object types.

## Sunshine Estate: Singapore Neighbourhood Authenticity

Sunshine Estate is an authentic, distinctly Singaporean 2D/2.5D life-simulation neighbourhood rendered on an isometric $38 \times 32$ tile grid:

- **HDB Blocks 101–105:** Residential high-rise blocks featuring:
  - Open void-deck breezeways with load-bearing pillars.
  - Stainless steel letterbox banks and glass-encased community noticeboards.
  - Concrete void-deck chess tables with cylindrical stools.
  - Singapore bamboo laundry poles extending from upper-floor brackets with colorful clothes.
  - Air-conditioner outdoor compressor units mounted on facade brackets.
  - Rooftop lift motor machine rooms fitted with pulsing red aircraft warning beacons.
  - Dual prominent block numbers painted in contrasting regional tones.
- **Commercial & Community Spaces:**
  - **Sunshine Minimart:** Neighbourhood sundry shop with slanted fruit crates, ice-cream freezer chest, and green welcome mat.
  - **Kopi Corner:** Traditional kopitiam with outdoor green-rimmed round marble tables, red plastic stools, and striped canvas awnings.
  - **Bus Stop:** LTA-style bus shelter with routes 14, 65, and 111, timetables, and orange bus stop signpost.
- **Singapore Streetscape Infrastructure:**
  - **Sheltered Linkways:** Signature emerald-green curved covered walkways with white support stanchions connecting HDB blocks to amenities.
  - **Public Sanitation:** NParks/NEA dual dark-green public litter and yellow-lidded recycling bins.
  - **Street Signage:** Singapore green street nameboards on black posts (*Sunshine Ave*, *South Blvd*, *Central Rd*).
  - **Traffic Safety:** Zebra crossings with solid white pedestrian stop lines and pedestrian signal poles with yellow audio push-button buzzer boxes.
  - **Tropical Flora & Urban Farming:** Vibrant bougainvillea flowering shrubs with magenta blooms and community timber herb gardens planted with pandan and chili.
- **Dedicated Locations:**
  - **The Mysterious House:** Black & White colonial bungalow with terracotta hipped roof, Peranakan tiled veranda, timber louvers, and the "Missing Evidence" solo/co-op escape room.
  - **House H (Freeze Frame Observation Studio):** Modernized heritage observation studio with surveillance CCTV dome, acoustic interior, and pausable timeline minimart investigation.
  - **House I (Whisper Network Detective Bureau):** Warm amber Peranakan detective residence with mahogany double doors, brass emblem, witness interrogation desks, and tactical influence pinboard.

## Explore Sunshine Minimart

Find the teal minimart beside Kopi Corner. Approach its door and press E or select **Enter Sunshine Minimart**. Inside, look for gold floor markers to inspect five clues, check the **Evidence board** from your Pack, and speak to Jun and the cashier. Follow the green mat to the **Leave Sunshine Minimart** prompt to return to the estate.

Continue restores your saved location, clues, and response to Jun. Existing Phase 1 and Phase 2 saves migrate automatically.

## Spot the Risk

Inspect all five minimart clues, then select **Begin Spot the Risk** from the objective card or Evidence Board. Each of the five clue cards pairs one verified observation with one assumption so the challenge measures both missed facts and false alarms. A pass requires identifying at least four of the five verified cues and classifying at most one assumption as verified. The total correct count covers all ten classifications. The response to Jun, XP, and coins are independent of the competency result.

Submit once to complete S and unlock **Hold Before Acting**. The saved result is available to review after continuing from the title screen.

## Hold Before Acting & Interactive Mini-Game: Freeze Frame

After submitting Spot the Risk, select **Begin Hold Before Acting** in the objective card. Select an immediate response to Jun, review it, and confirm. Only declining calmly and suggesting normal shopping meets the safe boundary criterion. Any submitted response completes H and unlocks **Identify the Influence**. The H record is independent of the S score and the story response to Jun.

### Interactive Mini-Game: Freeze Frame (H Practice)
Launch **Freeze Frame** from the H challenge, dialogue with Jun in Sunshine Minimart, House H, or **Quick Menu → Practice H (Freeze Frame)**.
- **Gameplay concept:** Inspired by *Papers, Please*, *The Case of the Golden Idol*, and time-manipulation puzzle games, players experience a pausable real-time scenario inside Sunshine Minimart with dynamic NPC routines, environmental puzzles, and visible in-world consequences.
- **Controls & mechanics:**
  - **Dynamic In-World NPCs:** Jun and Mr. Tan follow physical walking paths across 5 scenario stages with real-time positional updates and reactive speech bubbles.
  - **True Time Freeze (Spacebar / HUD Button):** Freezes NPC routines and environmental events while allowing the player to walk freely around the minimart to inspect clues frozen in time.
  - **CCTV Security Console Puzzle:** Interactive 3-channel surveillance monitor (Register, Electronics Aisle, Entrance) with 1x/2x zoom, night-vision filter, stage scrubber, and physical clue discovery.
  - **Store Manifest & Inventory Verifier Puzzle:** Audit incoming supplier invoices against customer receipts and barcodes to spot discrepancies (e.g. unbilled \$45.00 Powerbank SN-8821).
  - **In-World Branching Consequences:**
    - *Calm Boundary Refusal:* Jun stops, de-escalates, and returns merchandise with zero store alert.
    - *Comply as Lookout:* Jun attempts theft, triggering store alarm buzzers and cashier confrontation.
    - *Public Accusation:* Jun panics, drops items, and flees into the estate while the cashier investigates.
    - *Staff Inquiry:* Player discreetly alerts Mr. Tan, leading to a peaceful inventory resolution.
  - **Replayable Scenarios:** Switch between Scenario A (*Snack Dare & Unbilled Device*) and Scenario B (*Delivery Parcel Mixup*).
  - **Synthesized Audio:** Retro zero-dependency Web Audio effects for time freezing, unfreezing, evidence discovery, alarms, and branch outcomes.

## Identify the Influence & Interactive Mini-Game: Whisper Network

Select **Begin Identify the Influence** after submitting H. Identify the pressure tactic and requested role in Jun’s words, then review and confirm both answers. A pass requires both parts to be correct. Any submission completes I and advances the objective to **Evaluate Consequences**.

### Interactive Mini-Game: Whisper Network (I Practice)
Launch **Whisper Network** from the I challenge, dialogue with Auntie May / Amir, House I, or **Quick Menu → Practice I (Whisper Network)**.
- **Gameplay concept:** Inspired by *Suspects: Mystery Mansion*, *Among Us*, and detective investigation games, players investigate how peer pressure, rumors, and manipulative persuasion spread across Sunshine Estate.
- **Controls & mechanics:**
  - **Dynamic NPC Routines:** Amir, Auntie May, and Jun patrol between desks and interview stations inside House I, reacting dynamically when approached.
  - **Interactive Detective Cork Pinboard:** Reconstruct cases using wooden pinboard UI featuring draggable yarn connection strings, suspect polaroids, and influence tactic pushpins.
  - **Rumour Propagation Timeline:** Sequence 5 narrative steps from initial objective truth through group chat exaggeration to targeted coercive peer pressure.
  - **Yarn String Connection Mechanics:** Draw and connect evidence statement cards to tactical psychological pushpins (*Artificial Urgency*, *Social Proof*, *Friendship Appeal*, *Ego Dare*, *False Authority*, *Fast Reward*, *Secrecy/Isolation*).
  - **In-World Solved Celebration:** Solving the pinboard triggers triumphant audio chimes and in-world congratulatory reactions from all House I detectives.
  - **Replayable Cases:** Support for Case 1 (*The Minimart Snack Dare*) and Case 2 (*The Fast-Cash Account Scheme*).

## Mobile Virtual Joystick: Run Lock & Speed Modulation

On touch devices, drag the bottom-left virtual joystick:
- **Walk:** Drag within the inner dashed circle to walk at normal speed.
- **Run:** Push past the dashed ring toward the perimeter to run.
- **Run Lock (Auto-Run):** Push up into the top lock notch or past the run threshold to lock into full sprint speed. The character continues running even when the finger is lifted.
- **Speed Modulation / Unlock:** Touch the joystick and bring the stick into the normal walking circle (`strength <= 0.78`) to immediately cancel the run lock and transition to normal walking speed. Quick-tapping or dragging to the center stops movement completely.

The challenges use immediate feedback by default. Set `VITE_SHIELD_FEEDBACK=after-post-test` at build time to delay detailed review. H and I show neutral receipts in this mode. A future post-test flow can release the review. Browser-local results and bundled answer keys are suitable for practice rather than controlled assessment.

## Evaluate Consequences

Submit Identify the Influence, then select **Begin Evaluate Consequences**. Open each slot and choose from the shuffled immediate or later consequences. Each card can be assigned only once in its category. Selecting an assigned card moves it into an empty slot or swaps it with the card already there.

A chain is correct when both links match. The proposed threshold is at least two of three correct chains. With one-use matching, two correct chains force the last chain to be correct too. The result also records the number of correct links out of six. The version and threshold live in `CONSEQUENCE_RULE`. Earlier completed E results retain their original rules and remain reviewable. E stays independent of previous assessments and Jun’s story choice. Any submission advances to **Lead the Right Choice**. Delayed feedback shows only a submission receipt.

## Lead the Right Choice

After submitting Evaluate Consequences, select **Begin Lead the Right Choice**. Pick an opening, a constructive alternative, and a positive next action for Jun. The speech bubble updates as you choose. Review your message, change any fragment if needed, then confirm.

Each criterion earns one point. The default pass threshold is all three criteria, configured in `LEAD_RULE`. Every completed submission advances to **Defend Your Community**. L saves separately from prior results and Jun’s story decision. Delayed feedback shows a neutral receipt.

## Defend Your Community

After submitting Lead the Right Choice, select **Begin Defend Your Community**. Choose who to approach, what to communicate, and what to do next. The Help Channel Builder previews your plan as you make choices. You can revise it before confirming.

The help channel, objective communication, and safe follow-up each earn one point. The default pass threshold is 3 of 3, configured in `DEFEND_RULE`. The save records D separately and keeps submitted plans read-only. Delayed feedback shows a neutral receipt. Submitting all six challenges marks the framework challenges complete and advances the objective to **Continue the Story** regardless of individual scores.

## Guardian collection

Open **Quick Menu → Guardians** to view all six characters. Each SHIELD challenge submission makes its paired Guardian available to collect. Previously submitted challenges count, and claimed Guardians are saved with the current browser checkpoint.

The six origami SVGs and challenge pairings come from Team SecurePi’s ShieldQuest V2 archive. The SVGs were rendered from `apps/web/src/world/flat/GuardianIcon.tsx` using the original Guardian palette and registry. The archive’s MIT notice ships with the artwork in [public/assets/guardians/LICENSE.txt](public/assets/guardians/LICENSE.txt).

## Escape Room Adventure

Visit **The Mysterious House** on the east side of Sunshine Estate and choose **Play Solo**. Explore the living room, study, kitchen and entrance hall. Inspect gold floor markers with **E** or the touch prompt and reopen your finds from **House Inventory**.

**The Missing Evidence** is a supervised fictional mystery. Reconstruct the letter, decipher the study bookshelf, unlock the drawer, and order the incident timeline. Finish reviewing the evidence board, then follow the code shown above the keypad to open the safe and recover the exit key. Each stage offers up to three optional hints.

House progress and completion are saved in the browser. The completion screen provides evidence review, replay, and return to the neighbourhood. The quick menu also lets players leave an unfinished run and resume later.

When the WebSocket endpoint is configured, two players can create or join a private room at the house entrance. The multiplayer session screen confirms a shared start while co-op gameplay is in development. See the [multiplayer guide](infra/multiplayer/README.md) for local testing and AWS deployment.

The monorepo setup and API descriptions below refer to earlier repository history.

---

## Contents

- [Run the Phase 1 prototype](#run-the-phase-1-prototype)
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

## Repository Architecture

ShieldQuest is organized as a unified, client-first game application with a modular serverless multiplayer backend:

```
ShieldQuest/
├── public/
│   └── assets/
│       └── guardians/           # SVG vector art for the six Guardians
├── src/
│   ├── components/              # React UI (HUD, Menus, Challenges, Puzzles, Friends, Lobby)
│   │   ├── CharacterCustomizer.tsx  # Character creation & wardrobe customiser
│   │   ├── EscapeRoomPanels.tsx     # House inspection, inventory & completion modals
│   │   ├── EvidenceBoard.tsx        # Minimart clue inspection & evidence board
│   │   ├── FriendsPanel.tsx         # Player friend codes, list & status prototype
│   │   ├── GameCanvas.tsx           # Phaser game viewport container
│   │   ├── GameHUD.tsx              # Overlay HUD, touch joystick, objective bar & tools
│   │   ├── GamePanels.tsx           # Area map, dialogue box, pack & controls
│   │   ├── GuardianCollection.tsx   # Six skill Guardians collection view
│   │   ├── HousePuzzles.tsx         # Sequence puzzles, hints, pinboard & safe documents
│   │   ├── MainMenu.tsx             # Title screen with resume/start prompts
│   │   ├── MultiplayerLobby.tsx     # 2-player room lobby, ready state & session view
│   │   ├── NumericKeypad.tsx        # Interactive PIN keypad for safe & drawer
│   │   ├── QuickMenu.tsx            # Pause quick menu with shortcuts & checkpointing
│   │   ├── SpotTheRiskChallenge.tsx # S: Observation vs assumption classification
│   │   ├── HoldBeforeActingChallenge.tsx # H: De-escalation & pause response
│   │   ├── IdentifyTheInfluenceChallenge.tsx # I: Tactic & role identification
│   │   ├── EvaluateConsequencesChallenge.tsx # E: Immediate & delayed consequence matching
│   │   ├── LeadTheRightChoiceChallenge.tsx   # L: Constructive response builder
│   │   ├── DefendYourCommunityChallenge.tsx  # D: Safe bystander help channel builder
│   │   └── ui.tsx                   # Reusable modal dialogs, buttons & marks
│   ├── game/                    # Phaser 3.90 isometric engine & world layout
│   │   ├── entities/Actor.ts    # Player and NPC isometric actor rendering
│   │   ├── scenes/              # Neighbourhood, Minimart, and House game scenes
│   │   ├── maps/                # Ground tileset and Tiled JSON map
│   │   └── worldArt.ts          # Procedural isometric geometry (HDB blocks, trees, shops)
│   ├── multiplayer/             # Client WebSocket connection, protocol, and state sync
│   ├── state/                   # Game state, save migration, and competency scoring
│   └── styles/                  # Cohesive Singapore heartland palette and pixel styles
├── infra/
│   └── multiplayer/             # Optional AWS CDK & local WebSocket multiplayer server
│       ├── src/                 # DynamoDB / memory store, connection handlers, service
│       └── test/                # Automated lobby and game systems test suites
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite build configuration
└── package.json                 # Project scripts and dependencies
```

---

## Development Setup

### Prerequisites

- **Node.js:** `>= 20.0.0` (Tested on Node.js v24)
- **npm:** `>= 10.0.0`

### Installation

Clone the repository and install dependencies from the root:

```bash
npm install
```

### Development Commands

Run the game locally in development mode:

```bash
# Start the Vite React development server (http://localhost:5173)
npm run dev

# Run strict TypeScript typechecking
npm run typecheck

# Build the production bundle into dist/
npm run build

# Run the complete test suite (includes multiplayer protocol and game system tests)
npm test

# Preview the production build locally
npm run preview
```

### Local Multiplayer Server (Optional)

To test 2-player multiplayer room matchmaking locally:

```bash
# In terminal 1: Start the local WebSocket lobby server (port 8787)
npm run local --prefix infra/multiplayer

# In terminal 2: Start the frontend connected to the local lobby
$env:VITE_SHIELDQUEST_LOBBY_URL = "ws://127.0.0.1:8787"  # PowerShell
# or for bash: export VITE_SHIELDQUEST_LOBBY_URL="ws://127.0.0.1:8787"
npm run dev
```

Open two browser profiles or private windows at `http://localhost:5173`. Walk to the Mysterious House on the east side of Sunshine Estate, select **Create Multiplayer Room** on one profile, and **Join Multiplayer Room** with the 6-character room code on the second profile.

---

## Current Game Systems & Content

The current version of ShieldQuest includes full playable environments, assessments, and adventure modes:

- **Sunshine Estate:** An isometric heartland neighbourhood featuring void decks, sheltered walkways, HDB blocks 101–103, Kopi Corner, a playground, bus stops, and residents (Auntie May, Amir).
- **Character Customiser & Wardrobe:** Customise skin tones, hairstyles, shirts, shorts, shoes, and accessories with instant 4-directional live sprite preview.
- **Sunshine Minimart Dilemma:** Step into the teal grocery store, inspect 5 physical clues, talk to Jun and the cashier, and navigate the initial dilemma of Jun asking you to "watch the door".
- **The S.H.I.E.L.D. Assessment Suite:** Six standalone competency challenges directly assessing critical protective behaviours:
  - **S — Spot the Risk:** Classify ten statements into verified facts vs ungrounded assumptions.
  - **H — Hold Before Acting:** Pause before reacting to peer pressure and select a calm boundary.
  - **I — Identify the Influence:** Identify persuasion tactics (urgency, social proof, authority, dares) and the role requested.
  - **E — Evaluate Consequences:** Match choices to both immediate perks and delayed liabilities.
  - **L — Lead the Right Choice:** Construct a constructive peer de-escalation message.
  - **D — Defend Your Community:** Formulate a safe bystander intervention and reporting plan.
- **The Six Guardians Collection:** Collect origami-inspired Guardians (Cluepaw, Echo, VeriFox, ByteBuddy, Beacon, Shieldfin) as you demonstrate protective competencies.
- **The Mysterious House (Escape Room Level 1 — The Missing Evidence):**
  - Supervised mystery room with living room, study, kitchen, and entrance hall.
  - Puzzles: Letter reconstruction, book spine cipher, locked desk drawer, incident timeline ordering, pinboard evidence review, and 4-digit safe keypad.
  - Complete with hint progression system, house inventory viewer, and completion replay.
- **Quick Menu & Friends System:** Pause menu with active objectives, fast checkpoint saving, help & controls, area map, and a dedicated Friends panel with unique friend codes, local search, and presence display.
- **Multiplayer Lobby:** Real-time WebSocket room matchmaking supporting private 6-character room codes, host/guest roles, connection heartbeats, and readiness confirmation.
- **Accessibility & Persistence:** Supports touch controls, on-screen virtual joystick, keyboard navigation, `prefers-reduced-motion` detection, and persistent browser storage across sessions.

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


## Credits and licences

See [CREDITS.md](CREDITS.md) for map data attribution, artwork credits, weather sources and third-party licences.
