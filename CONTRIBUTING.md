# Contributing to ShieldQuest

Thank you for your interest in contributing to **ShieldQuest**. Our mission is to provide young people with an engaging, safe space to practise critical crime- and scam-prevention decisions.

ShieldQuest is developed and maintained by **Team SecurePi** (Nanyang Polytechnic). Because ShieldQuest is designed for youth education and handles sensitive crime-prevention topics, contributions are managed by invitation, academic collaboration, or prior agreement with the maintainers.

Before contributing, please review our [Code of Conduct](CODE_OF_CONDUCT.md), [Security Policy](SECURITY.md), and [Licence](LICENSE).

---

## Ways to Contribute

We welcome contributions across several key domains:

1. **Scenario Content & Curriculum Review:** Review draft scenarios across our four districts (School Street, Retail District, Digi-District, Community Hub) for factual accuracy, age-appropriate language, emotional tone, and strict avoidance of victim-blaming. We especially welcome inputs from educators, youth workers, and crime-prevention specialists.
2. **Youth Co-Design & Feedback:** Participate in youth feedback sessions to help ensure scenarios reflect the genuine social pressures, digital platforms, and slang encountered by youths in Singapore.
3. **Accessibility & Usability Audits:** Test interfaces against WCAG 2.1 Level AA standards, specifically evaluating keyboard navigation, screen-reader compatibility, scalable typography, colour-blind accessibility, and performance on low-end mobile devices.
4. **Technical Implementation:** Assist with planned application rebuild tasks (front-end PWA components, anonymous session management, state logic for the Delayed Consequence Engine, Guardian abilities, and the Scenario Management Portal) that have been agreed upon in an open issue.

---

## Core Standards

Every contribution—whether code, scenario text, or documentation—must satisfy these core requirements:

### 1. Privacy and Data Minimisation

- **Data Minimisation:** Avoid introducing fields, forms, or logging that request, collect, or store personal data (e.g. real names, national ID numbers, phone numbers, email addresses, student IDs, birthdates, addresses, photos, Singpass credentials, or financial accounts).
- **Session Privacy:** Gameplay and learning feedback should rely on temporary, randomly generated room codes rather than individual personal accounts.
- **Vote Secrecy:** Mechanics for the Think–Vote–Explain squad mode must strictly preserve vote privacy. Individual voting choices must never be exposed to other squad members, facilitators, or client logs.
- **No Third-Party Trackers:** Pull requests must not introduce external tracking pixels, ad networks, commercial telemetry, or third-party tracking cookies.

### 2. Safeguarding and Content Safety

- **Fictionalised Identifiers Only:** All business names, URLs, usernames, and contact numbers in scenarios must be strictly fictional. Use `.test` or `.example` top-level domains, and format phone numbers exclusively within the fictional `8XXX XXXX` block.
- **Offender-Centric Framing (Anti-Victim-Blaming):** Feedback must place responsibility squarely on the deceptive tactics, manipulation, and coercion of the perpetrator. Never shame, belittle, or lecture the player. Every risky decision path must provide an educational recovery route.
- **Non-Instructional and Non-Graphic Content:** Scenarios must illustrate risk without offering operational "how-to" instructions for committing crimes (e.g. no actionable tutorials on shoplifting methods, bypassing digital locks, or acquiring illegal credentials). Depictions of sexual violence, intimate images, exploitation of minors, or self-harm are categorically prohibited.
- **Citations and Legal Accuracy:** References to legal consequences must use conditional phrasing ("may be liable to", "up to"). Crime statistics and legal definitions must cite official Singapore sources (e.g. SPF Annual Crime Brief, ScamShield) with dated attributions.
- **Content Review Gate:** All scenarios must undergo editorial review for content accuracy, age-appropriateness, and pedagogical alignment before being marked ready for gameplay.

### 3. Accessibility and Device Performance

- **Touch & Tap Target Size:** All interactive buttons and touch targets should measure at least 48 × 48 pixels with adequate physical spacing.
- **Keyboard Operability:** All game decisions, evidence reviews, and voting actions must be fully operable via keyboard inputs with clearly visible focus indicators.
- **Multi-Modal Cues:** Never rely on colour alone to communicate state, warnings, or feedback. Combine colour with icons, patterns, and clear text labels.
- **Motion & Audio:** Respect `prefers-reduced-motion`. Audio cues must be optional and accompanied by closed captions or visual indicators.
- **Low-Bandwidth Optimisation:** The core game loop must remain fully functional on entry-level smartphones and constrained network environments without requiring heavy 3D WebGL assets or large video downloads.

---

## Development Workflow

### Feature Specification

Before writing code for any major new feature, gameplay mechanic, or data service:

1. Open an issue describing the proposed functionality, its user story, and its S.H.I.E.L.D. behavioural alignment.
2. Discuss the technical approach and UI/UX impact with the maintainers.
3. Once aligned, proceed with implementation in a feature branch.

### Branch Naming Conventions

Branches should be cut from `main` using descriptive prefix conventions:

- `feat/` — New feature implementation (e.g. `feat/squad-vote-sync`)
- `fix/` — Bug or accessibility fix (e.g. `fix/touch-target-contrast`)
- `content/` — Scenario additions or edits (e.g. `content/easy-money-scenario`)
- `docs/` — Documentation updates (e.g. `docs/roadmap-refresh`)
- `refactor/` — Code refactoring without behavioral change

### Commit Message Guidelines

Write commit messages in the imperative mood, concise and informative:

```
feat: implement aggregate vote distribution display in squad console

- Add server-side aggregation for Think-Vote-Explain ballots
- Ensure individual ballots cannot be inspected via client state
- Add unit tests for anonymous tallying
```

### Pull Request Checklist

When opening a Pull Request (PR), ensure the description provides:

1. **Summary:** What was changed and why.
2. **Linked Issue:** Reference to the relevant issue.
3. **Safeguarding & Privacy Check:** Confirmation that no unnecessary personal data is requested and fictional identifiers are used.
4. **Testing Evidence:**
   - Testing details across device viewports (mobile, tablet, desktop).
   - Keyboard navigation verification.
   - Screen-reader smoke test results.
   - Privacy-safe screenshots or screen captures (**must not contain real participant names, schools, API keys, or live credentials**).

---

## Testing Expectations

Contributions touching core application mechanics should include automated or reproducible manual test plans:

- **Anonymous Squad Voting:** Tests should verify that individual ballots are aggregated on the server and that client-bound payloads do not expose individual identifiers.
- **Delayed Consequence Logic:** Unit tests should confirm that state changes (e.g. district trust adjustments, flagged account alerts) trigger deterministically across subsequent scenario turns.
- **Content Moderation Gate:** Tests should verify that scenarios marked as draft or unreviewed cannot be queried or rendered by public player clients.

---

## Reporting Issues

- **General Bugs & Suggestions:** Open an issue on GitHub detailing expected behavior, actual behavior, browser/device environment, and reproduction steps.
- **Security & Privacy Vulnerabilities:** **Do not file public issues for security or privacy concerns.** Follow the private reporting protocols detailed in [SECURITY.md](SECURITY.md).

---

## Contribution Ownership and Intellectual Property

ShieldQuest is proprietary software owned by Team SecurePi.

By submitting a contribution (including code, scenario scripts, character designs, or documentation) via pull requests, issues, or workshops, you:

1. Agree that Team SecurePi may use, modify, reproduce, and distribute your contribution as part of ShieldQuest under the terms of our [Licence](LICENSE).
2. Warrant that the contribution is your original work and does not infringe upon any third-party intellectual property, copyright, or confidentiality agreements.

For questions regarding collaborations or educator toolkits, contact Team SecurePi via GitHub: [@feliciatanxl](https://github.com/feliciatanxl).
