# ShieldQuest — Handover

**For:** whoever picks this up next — a teammate, or an AI assistant in a new session.
**Last updated:** 9 September 2026

Read this before changing anything visual. It is written to save you the three
days it would take to rediscover why the code is shaped the way it is.

---

## 1. What this project is

ShieldQuest is the platform for **Project SHIELD**, Team SecurePi's youth
crime-prevention pilot (Felicia Tan, Charlisa Tan — Nanyang Polytechnic).

It is a funded proposal with commitments the code has to honour. **The
proposal PDFs are not in this repo** — they are in `SecurePi-*.zip` in the
owner's Downloads, under `SecurePi/NYC/`:

- `SecurePi Proposal.pdf` — the submitted proposal
- `ShieldQuest Implementation.pdf` — pilot phases, session structure, evaluation

Read them before making product, content or schema decisions. Inferring intent
from the code alone will get the constraints wrong.

### Commitments that constrain the code

| Commitment | What it means in practice |
|---|---|
| Mobile-first PWA, no install, no accounts | Participants join by QR or a 6-digit code. Never add a sign-up. |
| Data minimisation | No names, NRICs, phone numbers or banking data. Pre/post linked only by a random pseudonymous session code. |
| Aggregate analytics only | No individual profiling anywhere. The response panels are cohort totals by construction, not by policy. |
| Mandatory educator review | Nothing reaches a participant without human approval. The AI assistant has **no publish path** for this reason. |
| No victim-blaming | Feedback describes the offender's tactic, never what the participant should have known. |
| Guardians are earned | Never randomised, never sold. Amber marks earned progress only. |
| Accessibility | Readable language, colour-independent status, keyboard operation, low-bandwidth. |
| No official endorsement | The SPF is a **statistics source**, not a backer. Never imply MHA/SPF endorsement. Every figure traces to a named SPF brief. |

**Who actually uses the portal:** educators, school counsellors, student
development officers and youth workers, plus Team SecurePi during the pilot.
Not police officers. This has drifted twice already — an MHA/SPF endorsement
line in the portal footer, and the user being labelled "Duty Officer" (a police
watch role, hence the "DO" avatar). Both corrected. Watch for it: designing for
an operations team builds the wrong portal.

---

## 2. The design system

**Two skins, one spine.** Confirmed by the owner, 8 September 2026.

- **Light "civic" skin** (default) — public site + facilitator portal. Audience is educators and grant assessors.
- **Dark "game" skin** — the player PWA. Audience is youths 10–24. Switched by `data-skin="game"` on a route's root element.

Both share type scale, spacing, radii, elevation, motion and component APIs.
Only the surface/ink/accent ramps swap.

### The one rule

> **Tokens are declared in `src/design-system/tokens.css` and nowhere else.**

Before consolidation, `styles.css` *and* the feature file
`features/city-board/city-board.css` each declared a `@theme` block with the
**same token names and different values**. Import order decided the winner, and
it silently discarded a contrast-checked palette. Do not reintroduce a second
`@theme`.

### Two token tiers

| Tier | Example | Use |
|---|---|---|
| Semantic roles | `--sq-action`, `--sq-ink`, `--sq-safe` | **Prefer these.** They say what a colour is *for*. |
| Legacy aliases | `--color-surface`, `--color-ink`, `--color-line` | ~800 pre-existing usages. Re-pointed inside the game skin so they resolve correctly under both. Do not add new ones. |

### Traps that already cost time

1. **A role colour cannot be both a fill and text.** Measured on dark: white
   text needs `civic-600` or darker (5.72:1); action-coloured *text* needs
   `civic-400` or lighter (5.99:1). No overlap. Hence `--sq-action` (fill) and
   `--sq-action-text` are separate, plus `--sq-earned-text`, `--sq-safe-fill`,
   `--sq-risk-fill`. Amber is the only role needing a separate text value on
   the **light** skin too (`amber-500` on white is 2.52:1).

2. **`[data-skin]` must set `color`, not just variables.** Anything relying on
   inheritance otherwise gets the light ink from `:root` — 1.12:1 on navy.

3. **Never take a colour from a `light | dark` prop.** That pattern made
   `BrandMark`'s wordmark invisible and `SkillBadge` unreadable. Read the skin.
   The one legitimate escape hatch is `overDark`, for a panel deliberately
   darker than its own skin (the consequence takeover).

4. **Only use ramp steps that exist.** `amber-900`, `teal-950`, `navy-850` and
   friends silently fall back to Tailwind's oklch defaults — a different colour
   space. `navy-850` resolves to nothing at all. Check `tokens.css` first.

5. **Four radii only** — 6 / 10 / 16 / 24px. Board tiles, the logo and
   illustration are deliberately exempt: a board space is art, not a card.

### Aligning cards

Use `subgrid`, not fixed heights or line clamps:

```jsx
<ol className="grid lg:grid-cols-3">
  <li className="row-span-3 grid grid-rows-subgrid">…</li>
</ol>
```

The card must be a **direct grid child** — a wrapper div breaks the chain — and
the grid must not set `items-start`, or rows will not stretch. Both mistakes
were made and fixed; see `Framework.tsx` and `GuardianCard.tsx`.

---

## 3. Where things live

```
src/
  design-system/     tokens.css ← the only @theme. Button, Card, Section,
                     BrandMark, ScrollToTop, Stat, StatusBadge.
  lib/
    shield-framework.ts   The S.H.I.E.L.D. six, defined ONCE. Public site,
                          player Skills page and portal coverage all read it.
  features/
    public-site/     Composed sections. PublicWebsite.tsx is assembly only.
    admin/           Facilitator portal. Light skin.
    player/          PlayerExperience — sets data-skin="game".
    city-board/      The 2.5D board. See §5.
    shield-central/  Player hub. Each page sets its own data-skin.
styles.css           Base layer + what remains of the legacy player-shell CSS.
                     Do not add to it; new UI goes in design-system.
```

---

## 4. How to verify visual work

Typecheck and tests do not catch contrast or layout regressions. **Measure in
the running app.** This caught five real bugs that grep could not:

```bash
npm run build && npm run preview   # serves the production build on :4173
```

Then, in the browser console, walk the routes and compute contrast against
*composited* backgrounds. The audit must:

- skip `aria-hidden` elements (decorative numerals are exempt)
- skip `oklch` / `oklab` colours it cannot parse. These are **normal**: Tailwind
  v4 compiles the opacity modifier (`bg-[var(--sq-surface)]/95`,
  `border-white/40`) through `color-mix(in oklab, …)`, so any token with an
  alpha lands here. They are not a symptom of anything. To find genuinely
  undefined ramp steps, grep the codebase against the steps declared in
  `tokens.css` instead — see trap 4 above
- treat a gradient background as unmeasurable rather than guessing
- check `display:none` on **ancestors**, not just the element

Current state: **25/25 routes, zero AA failures.**

Two environment quirks that are not bugs in the app:
- `behavior: 'smooth'` is a no-op in the automated browser. `ScrollToTop` has a
  verified fallback because of it.
- `window.scrollTo()` from the console does not always fire a `scroll` event;
  dispatch one manually when testing scroll-driven UI.

---

## 5. The board

**Confirmed direction:** polished CSS 2.5D with a decorative Three.js depth
layer. *Not* a WebGL-primary board — gameplay must stay in focusable DOM to
keep the accessibility and low-bandwidth commitments.

Three layers:

| Layer | What | Notes |
|---|---|---|
| HUD | Upright DOM | Dice, scenario cards, district status |
| Board | CSS 2.5D, real DOM | 16 focusable spaces. **This is the gameplay.** |
| Depth | Three.js | `pointer-events:none`, `aria-hidden`, capability-gated, 30fps cap. Remove it and the game still plays. |

The stage is `rotateX(60deg) rotateZ(-45deg)`. **Anything that must stay legible
counter-rotates with `rotateZ(45deg) rotateX(-60deg)`.** Tiles were the one
thing that did not, which is why every space label came out crooked.

Space shape carries category — place 16px, card 6px, activity 10px, person
round — so the board survives greyscale and a projector.

---

## 6. Status

**Done:** token consolidation · public site rebuilt · facilitator portal
migrated · player interior migrated · board legibility · brand identity ·
review split into Responses + Review · AI drafting assistant · back-to-top.

**Next, in order:**

1. **The database.** This is the real remaining task and it is unblocked. The
   schema must hold the line on data minimisation — no names, NRICs or phone
   numbers; pre/post linked only by a random pseudonymous session code. Prisma
   is already a dependency and `prisma.config.ts` exists.
2. **Wire a real model** behind `draftSuggestions` in
   `features/admin/AiAssist.tsx`. It is a local deterministic stand-in; the
   guardrails and interaction around it are built and nothing else needs to
   change. See `doc/` and the `claude-api` guidance for model choice.
3. **Board polish** — animated token hops, per-district skylines in the
   Three.js layer. Cosmetic.

**Known gaps:**

- `doc/DESIGN_SYSTEM.md` and `doc/DESIGN_AUDIT.md` describe the *superseded*
  system. They carry a banner saying so. `tokens.css` is the source of truth.
- Git flags LF→CRLF on Windows. A `.gitattributes` with `* text=auto eol=lf`
  would settle it if the team is cross-platform.
- The portal runs on mock data (`features/admin/data.ts`). Response
  breakdowns are derived deterministically in `scenario-insights.ts` so the
  figures reconcile with the table they were opened from.

---

## 7. Working agreements

- **Commit to `main`** — the owner's preference, stated explicitly.
- **Verify before claiming.** Run typecheck, tests, build and the contrast
  audit. Say what actually passed.
- **Measure, do not eyeball.** Several "obvious" fixes here were wrong on the
  first attempt and only the measurement caught it.
- The owner takes UI/UX seriously and reviews carefully. Precision about what
  changed and why is worth more than volume.
