# ShieldQuest

A mobile-first youth crime-prevention PWA scaffold based on the supplied Claude brief. Original SVG/CSS artwork gives the city board a playful 2.5D presentation.

## Run locally

Requires Node.js **22.12+** (Node 24 recommended) and npm. Dependencies are already installed in this workspace.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. This starts Vite and Express together. The UI works without PostgreSQL. API health: **http://localhost:3001/api/health**. Stop with Ctrl+C.

If the development page is blank and the browser reports `504 (Outdated Optimize Dep)`, stop and restart `npm run dev`, then reload the tab. Vite’s dependency cache can become stale during setup or dependency changes. `npm run test:dev` checks the actual development URL, React module loading, mission opening and reloads; it uses the same Playwright browser setup as the production checks below.

## What is ready

| Feature              | Scaffold / preview behavior                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| City board           | Responsive SVG island, three selectable districts, mission cards                           |
| Squads               | Zustand state, session-code form, QR entry link, five empty player slots; no live joins    |
| Scenarios            | Three fictional samples and a six-phase local walkthrough; shared branching-node contracts |
| Think–Vote–Explain   | Local choice UI and squad-comparison placeholder; no server submission                     |
| Delayed consequences | Typed events and a tested scheduling helper; sample walkthrough reflections                |
| Guardians            | All six characters and skill labels; three missions award demo badges locally              |
| Scenario portal      | Local create/edit/delete/archive/status preview; no publishing or authentication           |
| Pre/post assessment  | One sample confidence question per phase; no storage or analytics                          |

All UI state is in memory and resets on reload. Portal edits and assessment answers also reset when leaving those screens. Sample choices affect the reflection shown. A full branching engine, multiplayer synchronization, delayed session events and skill-based award rules are intentionally left for later. Fictional scenarios need educator review before a pilot. Guardian emoji are temporary character placeholders.

## Project map

```text
src/
  App.tsx                      Navigation and page composition
  components/                  Dialog, install/update/offline status
  features/
    city-board/                SVG board and district definitions
    squad/                     Code-entry and QR preview
    scenarios/                 Six-phase sample mission player
    voting/                    Private-choice UI and squad dashboard placeholder
    consequences/              Pure scheduler and reflection component
    guardians/                 Collection and skill labels
    admin/                     Local scenario management preview
    assessment/                Pre/post sample questionnaire
  stores/                      Zustand demo session state
  lib/api.ts                   Future API integration points
  styles.css                   Tailwind v4 and responsive styles
server/
  app.ts                       Express app and error handling
  index.ts                     API entry point
  routes/                      Sessions, scenarios and votes
  services/                    Explicit placeholder handlers
  prisma/schema.prisma         PostgreSQL model stubs
  generated/                   Generated Prisma client (gitignored)
  tests/                       API contract tests
types/                         Shared contracts and demo scenarios
public/                        Original app icon and install icons
tests/e2e/                     Browser, mobile and offline checks
prisma.config.ts               Prisma CLI configuration
vite.config.ts                 React, Tailwind, PWA and local proxy
compose.yaml                   Optional local PostgreSQL container
```

## PostgreSQL and Prisma

Models: **Session, Squad, Participant, Scenario, Choice, GuardianProgress**. Participant records use random UUIDs and contain no name, NRIC, phone or email fields.

Optional local database setup, with Docker installed (PowerShell):

```powershell
Copy-Item .env.example .env
docker compose up -d db
npm run db:generate
npm run db:migrate -- --name init
```

The supplied credentials are for local development only. Replace `DATABASE_URL` for another database. Prisma 7 reads it from `prisma.config.ts`; client output is `server/generated/prisma`. The server does not instantiate a client yet. Add `@prisma/adapter-pg` and `pg` when implementing persistence, then connect repository services to the routes. No migration has been applied by this scaffold.

The future join service must enforce at most five players per squad transactionally, and at least four to start. Add participant-token authentication, expiry, data retention/deletion and facilitator authorization before pilot data collection. Session codes are entry codes, not admin credentials. Enforce vote privacy and reveal timing on the server. Do not log individual choices or add unrestricted personal-text collection.

## API contract

| Method        | Route                        | Current behavior                               |
| ------------- | ---------------------------- | ---------------------------------------------- |
| GET           | `/api/health`                | 200; scaffold mode and disconnected database   |
| GET           | `/api/scenarios`             | 200; bundled fictional examples                |
| GET           | `/api/scenarios/:id`         | 200 demo or 404                                |
| POST          | `/api/sessions`              | 501 placeholder                                |
| GET           | `/api/sessions/:code`        | 501 placeholder                                |
| POST          | `/api/sessions/:code/join`   | 501 placeholder                                |
| POST          | `/api/votes`                 | 400 invalid payload, otherwise 501 placeholder |
| POST          | `/api/scenarios`             | 501 placeholder                                |
| PATCH, DELETE | `/api/scenarios/:id`         | 501 placeholder                                |
| POST          | `/api/scenarios/:id/publish` | 501 placeholder                                |

Write routes return structured `NOT_IMPLEMENTED` errors, never fake success. No admin authentication exists yet, so writes must stay disabled. The frontend uses bundled examples; `src/lib/api.ts` is the future integration seam.

## PWA, phone previews and QR codes

```sh
npm run build
npm run preview
```

Open **http://localhost:4173** once online. The production build generates `manifest.json`, a service worker and 192/512px install icons. The manifest uses **ShieldQuest**, standalone display and portrait orientation. The cached app shell and bundled missions then work offline. API data and votes are **not cached**. Offline multiplayer and vote synchronization are not implemented. Service workers are disabled during `npm run dev` to avoid stale builds.

An **Install ShieldQuest** button appears when the browser offers installation. On iOS, use Share → Add to Home Screen. Updates prompt before reloading because demo progress is in memory. Installation and orientation support vary by browser.

For a phone on the same Wi-Fi, use Vite’s Network URL, such as `http://192.168.1.10:5173`. Open that URL on the computer before sharing its QR link. `localhost` on a phone refers to the phone. Windows firewall access may need enabling. Network HTTP supports the UI preview; service workers require HTTPS except on localhost. A hosted HTTPS URL is needed for a shareable pilot QR.

Entry links look like `/?session=DEMO01`. The QR encodes the current origin and a 6–8 character code, opening a labelled preview without joining a live session.

## Checks

```sh
npm run typecheck
npm test
npm run db:validate
npm run db:generate
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

Build before the browser checks. These cover mission progression, QR entry, portal edits, phone layout, keyboard focus and offline reloads. To use installed Chrome on Windows instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

Screenshots go to `.local/` (gitignored). Use `npm run icons` after changing the icon SVG. Commit the lockfile. Targeted overrides upgrade Prisma tooling’s `deepmerge-ts` and `mysql2` transitive dependencies to patched versions; re-evaluate them when upgrading Prisma. Schema validation and generation are checked with these overrides.

## Next feature order

1. PostgreSQL repositories, facilitator authentication and session lifecycle.
2. Pseudonymous join tokens and squad capacity checks.
3. Branching scenario graph validation and authoring.
4. Private vote rounds, gated squad reveal and shared events.
5. Delayed consequences, skill-based Guardians and assessment reporting.
6. Educator review and HTTPS testing on pilot phones.

Frontend output: `dist/`. Backend output: `dist-server/`, launched with `npm run start:server`. Production hosting must serve the frontend, proxy `/api` to Express and provide HTTPS. Vite’s proxy is for local development/preview. This scaffold has not been published.

References: [Vite PWA guide](https://vite-pwa-org.netlify.app/guide/) and [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).
