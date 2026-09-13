# ShieldQuest

**Project SHIELD — Team SecurePi (Felicia Tan, Charlisa Tan), Nanyang Polytechnic**
_Choose right. Protect together._

A mobile-first Progressive Web App: a 3D roll-and-move board game where youths
practise the decisions that crime prevention actually turns on. You roll, you
land, you choose — and some choices pay immediately and charge you three days
later.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 28 engine tests
npm run build    # typecheck + production bundle
```

## Three front doors

| Route    | Surface            | Audience                                              | Skin          |
| -------- | ------------------ | ----------------------------------------------------- | ------------- |
| `/`      | Public site        | Educators, schools, youth partners, grant assessors   | Light "civic" |
| `/play`  | Player PWA         | Youths 10–24, arriving from a QR code                 | Dark "game"   |
| `/admin` | Facilitator portal | The person running the session, and content reviewers | Light "civic" |

All three are lazy-loaded, so none pays for the others: an assessor reading the
landing page does not download the game engine or Three.js, a participant
scanning a QR code does not download a landing page they will never see, and
neither of them downloads the portal's tables and review queues (a 40KB gzipped
chunk that only `/admin` asks for). QR codes point at `/play`, which is also the
installed app's `start_url`.

Routing is ~50 lines in `src/router.ts` rather than a library — see the header
of that file for why, and for when to replace it. It does create one hosting
requirement: **every path must serve `index.html`.** Vite's dev server does that
by default, the service worker does it offline, and `vercel.json` does it in
production.

---

## What this is

ShieldQuest is the platform for a funded youth crime-prevention pilot. The
proposal is already submitted, which means **the code has commitments to
honour**. They are listed in §"Commitments" below and most of them are enforced
by tests rather than by good intentions.

The source documents are **not in this repo**. They are in `SecurePi-*.zip` in
the owner's Downloads, under `SecurePi/NYC/`:

- `SecurePi Proposal.pdf` — the submitted proposal
- `ShieldQuest Implementation.pdf` — pilot phases, session structure, evaluation

Read them before making product, content or schema decisions. Inferring intent
from the code alone gets the constraints wrong.

## The game

Twenty-eight spaces: four district gates on the corners, six spaces along each
side. Roll two dice, move, and play whatever you land on.

| District            | Themes                                                      |
| ------------------- | ----------------------------------------------------------- |
| **School Street**   | Peer pressure, risky dares, holding things for other people |
| **Retail District** | Shop theft dares, e-commerce scams, filmed challenges       |
| **Digi-District**   | Job scams, money-mule recruitment, phishing, account misuse |
| **Community Hub**   | Peer intervention, safe reporting, supporting a friend      |

Each district carries two decision spaces, a clue space, a situation card, a
Guardian checkpoint and a community-works space — so a player who never leaves
one side of the board still meets the whole loop.

### The two named hooks

**The Delayed Consequence Engine.** A risky choice pays the biggest immediate
reward on the board. Two turns later — after you have made other decisions, and
possibly spent the money — the bill arrives as a full-screen takeover: what you
got then, what it cost later, the signals that were there, and what works
instead. The delay is measured in **turns, not milliseconds**, because the point
is that you did other things in between.

If you have already spent the reward, the reversal can only take what is left
and the shortfall is charged to the city's Trust Meter instead. That is the
sharpest version of the lesson, and it is modelled rather than ignored.

**Peer Shield Mode.** Scenarios where the risky choice is not yours. You are the
witness, and the skill being practised is stepping in privately, without
escalating or shaming anyone.

### Guardians are earned

Six Guardians, one per S.H.I.E.L.D. competency:

| Competency                    | Guardian  | Skill                 |
| ----------------------------- | --------- | --------------------- |
| **S**pot the Risk             | VeriFox   | Verification          |
| **H**old Before Acting        | Echo      | Consultation          |
| **I**dentify the Influence    | Cluepaw   | Situational awareness |
| **E**valuate the Consequences | ByteBuddy | Cyber hygiene         |
| **L**ead the Right Choice     | Beacon    | Safe reporting        |
| **D**efend Your Community     | Shieldfin | Peer support          |

A Guardian strengthens **only** when a decision demonstrates its skill. There is
a test asserting that rolling dice, crossing gates and buying every upgrade in
the city cannot move a single one. No loot boxes, no purchases, no chance.

### What the dice decide

Movement. Nothing else. A roll cannot make a decision safe, pay for an upgrade,
strengthen a Guardian or declare a winner. It chooses which situation you meet
next; what you learn is decided entirely by the choice you make inside it.

There is no property, ownership, rent, money taken from other players, chance or
community pile, jail, free parking, railways or utilities, and no board layout,
colour banding or trade dress from any existing commercial game. The only thing
borrowed from tabletop games is the rhythm of roll, move, land, play.

---

## Architecture

```
src/
  router.ts      Three routes, no library. `/`, `/play` and `/admin`.

  game/          The rules. No React, no Three.js, no DOM.
    types.ts       Every shape in the game.
    board.ts       The 28-space track and the four districts.
    geometry.ts    Where each space sits — shared by BOTH renderers.
    engine.ts      Pure functions: roll, move, decide, consequence, upgrade.
    engine.test.ts 28 tests, several of which encode proposal commitments.
    content/       Scenarios, Guardians, situation and clue cards.

  three/
    BoardScene.ts  The 3D board. Told what to show; never reads game state.

  state/
    store.ts       Zustand. Wires the engine to React and to localStorage.

  ui/
    Board3D.tsx    Canvas + a focusable DOM button per space, projected on top.
    FlatBoard.tsx  The same 28 spaces as a grid, for devices without the above.
    Hud.tsx        Stats, Guardians, the roll button, flashes, confetti.
    Overlays.tsx   Every sheet: scenario, card, debrief, consequence, award…
    Onboarding.tsx Codename, age band, run length.

  site/          The public site. Light "civic" skin, no game code.
    PublicSite.tsx       Header, footer, page composition.
    parts.tsx            Section, SectionHeading, Stat, buttons, links.
    ProgrammeSections.tsx  What it is: hero, evidence, the loop, framework, missions.
    DeliverySections.tsx   What running it costs you: schools, safety, FAQ, closing.
    EnquiryDialog.tsx      Session request, composed for the visitor to send.

  portal/        The facilitator portal. Light "civic" skin, no game code.
    PortalApp.tsx        Route ⇄ section, both directions. Sign-in lives here.
    ScenarioPortal.tsx   The shell: header, sidebar, the eight sections, drawers.
    types.ts             The facilitator vocabulary. Content-level, never per-youth.
    data.ts              The authored demonstration set. Simulated, and labelled so.
    parts.tsx            Button, Modal, the portal mark.
    portal.test.ts       8 tests. Like the engine's, they pin commitments.
    …                    One file per panel: table, filters, queues, wizard, KPIs.

  styles/
    tokens.css     The ONLY @theme. Two skins, one spine.
    app.css        Base layer, motion, board furniture.
```

### The public site

The landing page is the grant-assessor-facing surface, so its claims have to
hold up:

- **Every statistic carries its source on the card itself.** Assessors check
  numbers, and an unattributed crime statistic on a crime-prevention site does
  more harm than leaving it out.
- **The SPF is a statistics source, not a backer.** The footer says so
  explicitly. Never imply MHA/SPF endorsement, and never present Delta Challenge
  as a sponsor — it is a competition this was submitted to.
- **Scenarios are described by the offender's tactic, not the victim's
  mistake.** The no-victim-blaming rule applies to marketing copy as much as to
  in-game feedback.
- **The framework section renders from the same constants the game reads.** In
  v1 the site, the player's skills panel and the type definitions each carried
  their own wording and had drifted far enough that two Guardians' abilities
  were swapped relative to the proposal.
- **The board preview is built from `TRACK`**, not from a screenshot, so it
  cannot go stale.

**Before the site goes live:** set `CONTACT_EMAIL` in
`src/site/EnquiryDialog.tsx`. Until it is set the request form still works — it
composes the enquiry and hands it to the visitor to send — but it deliberately
never shows a "thanks, we'll be in touch" screen, because there is no backend to
receive a submission and a school that believes it has contacted you when it has
not is worse than no form at all.

### The facilitator portal

`/admin`. Ported from v1, where it was the only implementation of a proposal
deliverable: the Scenario Management Portal. Eight sections — Dashboard, Live
Sessions, Scenario Library, Scenario Builder, Content Review, Youth-Created
Missions, Insights, Resources — each with its own URL, so a reviewer can be sent
a link to a queue rather than to a front page with instructions.

Four rules hold it to the proposal, and the tests in `portal.test.ts` pin three
of them:

- **Every figure is content-level.** `safeDecisionRate` measures how clearly a
  _scenario_ teaches, and the copy says so wherever it appears. There is no
  per-participant record anywhere in `portal/`, and there must never be one.
- **A youth submission can only become a DRAFT.** The strongest decision in the
  moderation queue is "convert", which produces an unpublished draft that still
  has to go through the same review as everything else. There is no shortcut to
  LIVE out of that queue.
- **The numbers say what they are.** The pilot has not run, so the KPI panel
  marks each of the six as demonstrated, simulated or planned, and every
  analytics panel carries a note saying the session data behind it is authored.
- **The AI drafting assistant has no publish path.** It proposes wording to a
  human author; it cannot write to the library.

What changed in the port: the portal is client-only (v1 merged rows from the
Express API — v2 has no server), a "local drafts" shelf that existed only to
satisfy a v1 Playwright test is gone, and section changes now write the URL.
State lives for the session; the Insights section has a "Reset demo storage"
control that returns every panel to the authored set.

### Why the engine is separate

The same rules have to hold in three places: the 3D board, the flat DOM board,
and the **printable offline board-game kit** the proposal commits to delivering.
A rule that lives inside a component cannot be printed on card.

### Two renderers, one board

The 3D scene is the _presentation_ of the board, not the board itself. Every
space it draws also exists as a real `<button>` in a transparent DOM layer,
positioned each frame by projecting the same tile geometry the meshes are built
from. Tab order follows the track, so tabbing walks the board in playing order,
and every button carries a full spoken description of its space.

The flat board replaces the scene entirely — same spaces, same order, same rules
— and is chosen automatically when the device has no WebGL2, is in data-saver
mode, reports two cores or fewer, or the player has asked for reduced motion. It
can also be picked by hand from the in-game menu. This is what makes
"low-bandwidth access" and "common phones, tablets and laptops" true rather than
aspirational.

### Design system

**Two skins, one spine**, carried over from v1 and unchanged:

> **Tokens are declared in `src/styles/tokens.css` and nowhere else.**

Do not add a second `@theme`. In v1, two files declared the same token names
with different values and import order silently decided a contrast-checked
palette. Feature styles consume tokens; they never define them.

Traps that have already cost time are documented in the header of `tokens.css`:
a role colour cannot be both a fill and text; `[data-skin]` must set `color`,
not only variables; never take a colour from a `light | dark` prop; only use
ramp steps that exist; four radii only.

---

## Commitments

From the proposal and the implementation plan. Several are asserted in
`engine.test.ts` — the test name says which.

| Commitment                      | How the code honours it                                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile-first PWA, no install    | One screen to start, one to play. No router, no account, no sign-up.                                                                                                              |
| Data minimisation               | A self-chosen codename and a random six-character session code. No names, NRICs, phone numbers or banking data — not in a form, and not as something a scenario asks you to type. |
| Pseudonymous pre/post linking   | `makeSessionCode()`. Vowel-free so it cannot spell anything. Generated on device.                                                                                                 |
| Aggregate reporting only        | `sessionReport()` reports the run, never the person. A test asserts the codename cannot reach it.                                                                                 |
| Guardians earned, never granted | `progressFor()` moves a Guardian only on a decision. Tested against rolls, stipends and purchases.                                                                                |
| Age-banded content (§4)         | Every scenario and card declares its bands; `resolveLanding()` will not serve out-of-band content. Tested.                                                                        |
| No victim-blaming               | Every debrief describes the offender's tactic and a stronger response. No line implies a player should have known better.                                                         |
| Accessibility                   | Real buttons, full focus trap in sheets, a live region announcing every state change, status never carried by colour alone, complete reduced-motion path.                         |
| No official endorsement         | The SPF is a **statistics source**, not a backer. Never imply MHA/SPF endorsement.                                                                                                |
| Offline                         | Hand-written service worker; the whole game — every scenario, every Guardian — works with no network, because there is no server to lose.                                         |

### Who the audience is

Youths aged 10–24, in facilitated squads of 4–5, in a 90-minute workshop:
15 minutes onboarding, 45 gameplay, 20 debrief, 10 evaluation. The default run
length (24 turns) is tuned to fill the gameplay segment so a facilitator gets a
hard stop they did not have to enforce.

---

## Notes for whoever picks this up

**The service worker is hand-written** (`public/sw.js`) rather than generated.
`vite-plugin-pwa` runs workbox at build time, which loads a native rollup
binary, which a Windows Application Control policy blocks on the team's own
machine. A build that only works on some computers is worse than a service
worker you can read. The header of that file explains the caching strategy.

**v1 is archived**, not deleted — `git show v1-archive`, or `ShieldQuest V1.zip`.
It still contains the Express + Prisma API and the Playwright suite, which have
not been ported into v2. The public site and the Scenario Management Portal
have been. See "Not yet ported" below.

### Not yet ported from v1

- **Pre/post assessment forms** and the Think–Vote–Explain multi-device flow.
  (The portal shows the _aggregate_ Think–Vote–Explain signals; what is missing
  is the live multi-device question flow that would produce them.)
- **Express + Prisma API** — v2 is currently client-only, which is correct for a
  no-accounts PWA but does not yet support cross-device squad play.
- **Playwright end-to-end tests.**

### Content

Eight authored scenarios ship here — the reviewed seed set. The proposal commits
to 30–40 by the end of the project. The header of `content/scenarios.ts` states
the four rules every added scenario must follow; the tests enforce three of them
mechanically.
