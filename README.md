# ShieldQuest

**Choose Right. Protect Together.**  
*Experience the consequence. Understand the pressure. Protect someone else.*

ShieldQuest is a mobile-first Progressive Web Application (PWA) designed to empower youths in Singapore to recognise, evaluate, and navigate realistic crime- and scam-prevention dilemmas. Rather than delivering passive lectures or multiple-choice trivia, ShieldQuest places players inside interactive branching scenarios where they investigate suspicious cues, debate choices in squad play, experience immediate and delayed consequences, and practise stepping in safely when a friend is at risk.

ShieldQuest is the youth-facing platform of **Project SHIELD**, an initiative conceptualised by **Team SecurePi** from **Nanyang Polytechnic**. It was submitted as a digital crime-prevention intervention and youth pilot under the **National Youth Council (NYC) Young ChangeMakers (YCM)** grant scheme (Application Reference: **260866HC**), following concept development in Track B (Crime Prevention) of the SPF / NCPC Delta Challenge 2026.

> [!IMPORTANT]
> **Project Identity and Non-Government Notice**  
> ShieldQuest is an independent student project conceived and maintained by Team SecurePi (Nanyang Polytechnic). It is **not** an official product, service, or endorsed publication of the Singapore Police Force (SPF), the National Crime Prevention Council (NCPC), the National Youth Council (NYC), or any Government ministry or statutory board. All scenarios, business names, characters, contact numbers, and website addresses featured in the game are entirely fictional simulations designed solely for educational role-play.

---

## Contents

1. [Project Introduction and Tagline](#1-project-introduction-and-tagline)
2. [Current Project Status](#2-current-project-status)
3. [Problem Being Addressed](#3-problem-being-addressed)
4. [ShieldQuest's Unique Educational Proposition (USP)](#4-shieldquests-unique-educational-proposition-usp)
5. [S.H.I.E.L.D. Behavioural Framework](#5-shield-behavioural-framework)
6. [Core Gameplay Loop](#6-core-gameplay-loop)
7. [Feature Overview and Six Guardians](#7-feature-overview-and-six-guardians)
8. [Intended Platform Architecture](#8-intended-platform-architecture)
9. [Age-Banded User Groups](#9-age-banded-user-groups)
10. [First Playable Milestone and Delivery Roadmap](#10-first-playable-milestone-and-delivery-roadmap)
11. [Scenario Development and Review Pipeline](#11-scenario-development-and-review-pipeline)
12. [Proposed Six-Month Programme Timeline](#12-proposed-six-month-programme-timeline)
13. [Pilot Delivery and Intended Participation](#13-pilot-delivery-and-intended-participation)
14. [Six Independent Impact KPIs](#14-six-independent-impact-kpis)
15. [Privacy, Safeguarding and Accessibility](#15-privacy-safeguarding-and-accessibility)
16. [Previous Prototypes and Pitch References](#16-previous-prototypes-and-pitch-references)
17. [Team Responsibilities](#17-team-responsibilities)
18. [Contributing, Security and Licensing Information](#18-contributing-security-and-licensing-information)
19. [Outstanding Team Decisions](#19-outstanding-team-decisions)

---

## 1. Project Introduction and Tagline

- **Initiative:** Project SHIELD
- **Product Name:** ShieldQuest
- **Team:** SecurePi (Felicia Tan & Charlisa Tan)
- **Institution:** Nanyang Polytechnic (Singapore)
- **Tagline:** *Choose Right. Protect Together.*
- **Educational Proposition:** *Experience the consequence. Understand the pressure. Protect someone else.*
- **Secondary Subtitle:** *Recognise the Risk. Make the Choice. Protect Your People.*
- **Format:** Mobile-first Progressive Web Application (PWA) with facilitated squad play and an optional printable board-game kit (20 kits budgeted)
- **NYC YCM Application Reference:** 260866HC
- **Funding Request Submitted:** S$4,850 (with an approved S$3,000 Lean Implementation contingency plan)

ShieldQuest addresses youth vulnerability to scams, cybercrime, and theft by transforming crime prevention from passive rule memorisation into an active, social, and consequential simulation. Players explore four thematic urban districts, inspect simulated social media messages, bank alerts, and peer communications, discuss critical choices with their squad, and observe how their decisions ripple forward into both immediate and delayed consequences.

---

## 2. Current Project Status

As of **9 November 2026**, the administrative and technical status of ShieldQuest is as follows:

| Dimension | Current Standing | Verification Source & Details |
|---|---|---|
| **NYC Grant Status** | **Pending Review** | Application reference `260866HC` submitted to the NYC Young ChangeMakers programme via OurSG Grants. No formal letter of offer has been executed to date. |
| **Submitted Funding Request** | **S$4,850 (Definitive)** | Confirmed via `SecurePi Proposal.pdf` (Page 1 & 8) and `YCM Budget Proposal.xlsx`. A contingency S$3,000 Lean Implementation Plan is included in the proposal if standard-tier funding is awarded. The earlier S$4,450 figure from the competition pitch deck represents a preliminary draft. |
| **Project Implementation Window** | **Proposed (Unconfirmed)** | The submitted timeframe of November 2026 to April 2027 represents a planning schedule. The official six-month implementation clock (Weeks 1–24 / Months 1–6) will anchor strictly to the formal start date confirmed by NYC upon award. |
| **Institutional Testing Venues** | **Intended / Subject to Confirmation** | Nanyang Polytechnic (NYP) is the intended primary testing environment (based on informal feasibility discussions with an NYP lecturer). ITE College Central is a prospective secondary site (selected for geographical proximity to NYP to facilitate iterative testing; not yet approached). |
| **Agency Feedback** | **Consultative Guidance** | Feedback from the NYC YCM Open Mic session on 31 October 2026 reflects consultative advice from SPF and NCPC representatives regarding construct independence, rubric design, and measurable indicators. They do not constitute formal endorsement, accreditation, or agency approval of the final game design. |
| **Repository State** | **Documentation and Governance Only** | This repository currently houses governance standards, technical specifications, safeguarding protocols, and planning documentation. It does not yet contain the rebuilt production application codebase. |
| **Rebuild Direction** | **Planned Full Rebuild** | Team SecurePi is planning a full application rebuild. Earlier exploratory repositories (including the [SecurePi_SPF](https://github.com/feliciatanxl/SecurePi_SPF) pitch prototype, [ShieldQuest-V1](https://github.com/feliciatanxl/ShieldQuest-V1), and the [ShieldQuest-V2](https://github.com/feliciatanxl/ShieldQuest-V2) Railway prototype) serve as reference proofs of concept pending a complete source-code audit. |
| **Youth Pilot Evidence** | **Not Yet Conducted** | No youth workshops have taken place under this grant cycle. All learning improvements and behavioural impact indicators describe evaluative targets rather than proven historical outcomes. |

### Status Layer Categorisation

To maintain strict fidelity to grant governance and public transparency, Project SHIELD assets are categorised into four distinct status layers:

1. **Existing Proof-of-Concept Work:** Self-funded prototype iterations (e.g. ShieldQuest V1, V2/Railway, and the Vercel static demo) created by Team SecurePi as an in-kind contribution to test gameplay mechanics, district layouts, and narrative prompts prior to grant submission. These have not been deployed in youth pilots.
2. **Submitted Grant Commitments:** Core deliverables committed in NYC application `260866HC`—including the Interactive City Board (4 districts), six Guardians, Peer Shield Mode, Think–Vote–Explain squad mechanics with rotating roles, 30–40 vetted scenarios, educator Scenario Management Portal, optional printable board-game companion kit (20 kits), and outreach to approximately 200 youths (140 in-person / 60 digital QR).
3. **Planned Rebuild Features:** The target technical architecture for the production PWA, featuring a privacy-preserving session engine, educator portal, anonymous aggregation service, and offline asset caching.
4. **Future Validation Work:** The staged evaluation process comprising co-design validation (Weeks 1–3), facilitator training, controlled pilot sessions (Weeks 13–18), community rollouts (Weeks 19–22), and independent pre/post KPI analysis (Weeks 23–24).

---

## 3. Problem Being Addressed

### The Youth Vulnerability and Engagement Gap

Traditional crime-prevention outreach relies extensively on school assemblies, static informational posters, flyers, and didactic lectures. While these methods impart factual awareness—youths almost universally understand that scams, unauthorized account transfers, and theft are unlawful—they fail to build emotional and social resistance. In real-life crises, youths do not make decisions in calm isolation; they face intense social pressure, fear of missing out (FOMO), artificial urgency, perceived authority, and the promise of immediate financial reward.

When faced with sophisticated social engineering or peer-driven dares, abstract warnings are quickly overridden.

### Singapore National Crime Context

Official data from the Singapore Police Force highlights an escalating challenge among digitally connected populations:

- In 2025, Singapore recorded **41,974 scam and cybercrime cases**, with victim losses amounting to approximately **S$913.1 million**.
- Crucially, **81.8%** of scam cases involved **self-effected transfers**, where victims were manipulated through deception, urgency, or authority into executing the transactions themselves.
- Youths aged 19 and below made up **5.6%** of scam victims; among this group, **36.6%** fell prey to e-commerce scams, **15.1%** to phishing scams, and **12.8%** to job scams.
- Shop theft (4,109 cases recorded in 2025) and youth recruitment into unlicensed money-lending or money-mule activities remain persistent operational concerns for community policing.  
*(Sources: Singapore Police Force, Annual Crime Brief 2025; Annual Scam and Cybercrime Brief 2025).*

ShieldQuest bridges this gap by replacing passive lectures with active experiential learning: young people feel the dilemma, make decisions under realistic constraints, face the consequences, unpack the manipulators' psychological levers, and practise intervening when their friends are targeted.

---

## 4. ShieldQuest's Unique Educational Proposition (USP)

ShieldQuest is fundamentally distinct from conventional quiz platforms, gamified trivia, and flashcard tools. Its unique educational proposition is encapsulated in three core tenets:

$$\text{\textbf{Experience the consequence. Understand the pressure. Protect someone else.}}$$

### 1. The Delayed Consequence Engine

In conventional gamified learning, wrong answers trigger immediate deductions or "game over" screens, creating an artificial environment where danger is immediately transparent. In real-world offences and scams, dangerous choices often produce **immediate rewards** (e.g. receiving a \$200 commission for a bank transfer or gaining social validation from peers), while the catastrophic consequences (e.g. frozen bank accounts, police investigations, loss of reputation, or compromised personal safety) unfold days or weeks later.

ShieldQuest's **Delayed Consequence Engine** simulates this realistic temporal latency:
- Players who accept a suspicious transaction experience a momentary bump in resources or social standing.
- In subsequent game turns or stages, second-order consequences materialise: the district Trust Meter collapses, bank accounts are flagged by simulated anti-fraud monitoring, or mutual friends report being victimised.
- Crucially, consequences are presented as **probabilistic and conditional risks** rather than absolute legal certainties, teaching nuanced risk assessment without heavy-handed fatalism.

### 2. Peer Shield Mode

Individual self-protection is insufficient; youth risk behaviour is deeply communal. Many young victims enter scam or theft situations because they were introduced by a classmate, teammate, or online gaming peer.

**Peer Shield Mode** shifts the player's perspective from self-preservation to bystander intervention:
- Players are presented with scenarios where an in-game friend or squad mate is on the verge of making a dangerous choice (e.g. sharing Singpass credentials, taking a shoplifting dare, or transferring funds for an unverifiable job).
- Players practise supportive, non-confrontational intervention strategies: asking clarifying questions, offering an exit ramp, suggesting trusted verification channels, or reporting to a trusted adult.
- This builds actionable bystander confidence, empowering young people to protect their immediate social circles.

### 3. Think–Vote–Explain Facilitated Squad Play

In facilitated workshops, ShieldQuest harnesses positive peer dynamics through the **Think–Vote–Explain** protocol:
- **Think:** Players independently inspect conflicting pieces of evidence (chat screenshots, payment proofs, suspicious URLs).
- **Vote:** Each squad member casts a private, uncoerced vote on their personal device.
- **Explain:** The platform reveals the **aggregated squad distribution** without ever displaying individual names or votes. A designated squad member or workshop facilitator invites players to explain their competing rationales.
- **Reflect:** The squad discovers differing perspectives, uncovers manipulative tricks (e.g. false urgency, manufactured social proof), and collaboratively identifies the protective course of action.

---

## 5. S.H.I.E.L.D. Behavioural Framework

Every scenario in ShieldQuest is mapped directly to the official six-element **S.H.I.E.L.D.** framework. Rather than teaching narrow scam typologies that quickly become obsolete as criminal methods evolve, S.H.I.E.L.D. instils a transferable cognitive framework:

| Letter | Behavioural Skill | Core Focus | Proposed Distinct Evidence & Measurement Method |
|:---:|---|---|---|
| **S** | **Spot the Risk** | Identifying warning signs, subtle irregularities, and unverified claims. | **Objective cue identification:** Correctly highlighting suspicious red flags (e.g. mismatched URLs, unusual payment methods, unearned commissions) in evidence packets. |
| **H** | **Hold Before Acting** | Pausing before responding to urgency, fear, or excitement. | **Latency and verification actions:** Choosing to delay immediate execution in favour of checking sources, consulting official registries, or seeking secondary confirmation. |
| **I** | **Identify the Influence** | Recognising the underlying manipulation tactics deployed by offenders. | **Tactic categorisation:** Accurately naming the psychological pressure mechanism (e.g. artificial scarcity, authority intimidation, social proof, isolation). |
| **E** | **Evaluate the Consequences** | Forecasting short-term gains against delayed personal, legal, and social liabilities. | **Trade-off mapping:** Identifying second-order risks (e.g. account freezing, criminal record, loss of personal trust) across branching choice paths. |
| **L** | **Lead the Right Choice** | Selecting a safe, lawful, and proportionate protective action for oneself. | **Protective decision selection:** Choosing the optimal defensive action (e.g. blocking the contact, refusing transfer, using official channels) under simulated constraints. |
| **D** | **Defend Your Community** | Taking safe, constructive action to assist and protect peers. | **Bystander intervention execution:** Selecting appropriate peer-support dialogues, non-confrontational defusal tactics, or safe escalation pathways in Peer Shield Mode. |

### Alignment with SPF Open Mic Feedback (31 October 2026)

During the NYC YCM Open Mic engagement on 31 October 2026, representatives from the Singapore Police Force and the National Crime Prevention Council provided consultative guidance on assessment design. Team SecurePi has embedded this feedback into the project's measurement architecture:

- **Construct Independence:** Each of the six S.H.I.E.L.D. components must represent an independently identifiable, non-overlapping learning outcome.
- **Elimination of Double-Counting:** A single player action, decision node, or survey question must never be scored across multiple S.H.I.E.L.D. letters simultaneously.
- **Defined Baselines:** All percentage-based improvement metrics must specify rigorous pre-intervention baselines, clear numerators, and verified denominators rather than subjective estimates.
- **Rubric Validation:** Assessment rubrics, scenario scoring weightings, and pre/post test items must be submitted to educational and domain advisers for review prior to pilot deployment.
- **Distinction from SPF Endorsement:** This guidance reflects recorded consultative meeting notes and must not be represented as an officially approved or accredited SPF assessment framework.

---

## 6. Core Gameplay Loop

ShieldQuest structures each mission through a six-stage pedagogical flow:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  1. Explore  │ ──> │2. Investigate│ ──> │3. Think-Vote-Explain │
│  City Board  │     │   Evidence   │     │  Squad Deliberation  │
└──────────────┘     └──────────────┘     └──────────────────────┘
                                                     │
                                                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  6. Protect  │ <── │5. Experience │ <── │      4. Decide       │
│ Peer Shield  │     │Delayed Conseq│     │   Committed Action   │
└──────────────┘     └──────────────┘     └──────────────────────┘
```

1. **Explore:** Players navigate an interactive map of Shield City, selecting an active hotspot in one of four thematic districts:
   - *School Street:* Peer social dynamics, exam cheating offers, campus theft, dares.
   - *Retail District:* E-commerce deals, impulse buying, counterfeit goods, unattended item theft.
   - *Digi-District:* Social media phishing, game account trading, unlicensed financial platforms, deepfakes.
   - *Community Hub:* Job recruitment, unsolicited friend requests, impersonation schemes, money-mule offers.
2. **Investigate:** Players review in-game clues—such as mobile chat logs, banking notifications, social media profiles, or suspicious links—using investigative Guardian tools.
3. **Discuss (Think–Vote–Explain):** In facilitated squad play, members independently review the facts, cast private individual votes, view the aggregated distribution, and debate conflicting views using rotating squad roles.
4. **Decide:** The player or squad selects a course of action from multi-branching options under realistic constraints.
5. **Experience:** The game delivers immediate situational feedback, followed by the **Delayed Consequence Engine** revealing how the decision affects personal security, peer trust, and district safety over time.
6. **Protect:** In **Peer Shield Mode**, players are challenged to guide a friend who is facing a parallel or escalating dilemma, applying their learning in a safe bystander context.

### Detailed Scenario Walkthrough: "Easy Money"

1. **Context:** While waiting for classes, a polytechnic student receives a Telegram message from an acquaintance offering S$200 for "temporarily receiving an urgent fund transfer from an overseas cousin" and passing it forward via PayNow.
2. **Investigation:** The player can inspect the sender's account age, request proof of transaction (which returns a polished but unverified screenshot), or consult their squad's **VeriFox** Guardian.
3. **Temptation and Pressure:** A mutual friend in the chat messages: *"Bro, I did it yesterday and got paid instantly. It's totally safe, just help him out."*
4. **The Immediate Consequence:** If the player accepts the transfer, their virtual wallet immediately credits S$200. The player feels a sense of immediate reward.
5. **The Delayed Consequence:** Two game stages later, the student's simulated bank account is frozen by the bank's Anti-Money Laundering unit. A formal notice informs the student that the funds originated from an e-commerce scam victim. The student faces a potential police inquiry under the Corruption, Drug Trafficking and Other Serious Crimes (Confiscation of Benefits) Act, their credit rating drops, and the district Trust Meter falls by 35 points.
6. **Peer Shield Recovery:** In the follow-up stage, the player spots another classmate preparing to accept a similar S$500 offer. Having experienced the delayed trap, the player must select the most effective, supportive peer intervention to stop the classmate without alienating them.

---

## 7. Feature Overview and Six Guardians

### Committed Product Features

- **Interactive City Board:** Dynamic 2D vector map rendering four distinct districts (School Street, Retail District, Digi-District, Community Hub), responsive across mobile, tablet, and desktop viewports.
- **Branching Decision Trees:** Non-linear scenario paths with branching intermediate stages, ensuring choices are rarely trivial or binary.
- **Delayed Consequence Engine:** Persistent state system that tracks decisions and triggers delayed events across multiple turns.
- **Peer Shield Mode:** Dedicated bystander scenarios requiring non-confrontational peer redirection and protective interventions.
- **Think–Vote–Explain System:** Facilitated multi-user voting interface ensuring private individual ballots and real-time aggregate squad visualisation.
- **Rotating Squad Roles:** Structured roles for facilitated sessions:
  - *Safety Lead:* Guides squad discussion and ensures everyone has a chance to speak.
  - *Evidence Checker:* Interrogates source credibility, links, and transaction records.
  - *Peer Supporter:* Focuses on relationship dynamics, psychological pressure, and bystander safety.
- **Scenario Management Portal:** Dedicated administrative and educator interface for reviewing, editing, and publishing scenarios.
- **Moderated Youth-Created Missions:** Structured template builder enabling youths to design scenarios, subject to mandatory human moderation.
- **Content Library:** Target delivery of **30–40 reviewed, age-banded scenarios** covering theft, scams, cybercrime, and digital hygiene.
- **Facilitator Guide and Workshop Toolkit:** Comprehensive documentation, run-sheets, discussion prompts, and debriefing rubrics for educators.
- **Optional Printable Offline Board-Game Kit:** Budgeted for 20 physical companion kits (S$30/kit = S$600) comprising game boards, Guardian cards, scenario decks, and facilitator guidebooks for environments with limited internet connectivity.
- **Privacy-Conscious Assessment Engine:** Lightweight pre/post evaluation service operating on anonymous session tokens.

### The Six Guardians

Guardians represent core crime-prevention competencies. They are **earned exclusively through demonstrated in-game mastery** of S.H.I.E.L.D. principles—never via randomised loot boxes, microtransactions, or arbitrary chance.

| Guardian | Core Competency | In-Game Ability / Tool | Prevention Behaviour Reinforced |
|---|---|---|---|
| **VeriFox** | **Verification** | Inspects sender identities, validates domain URLs, and verifies claims against trusted databases. | Pause and verify information before taking action; check credentials via official sources. |
| **Echo** | **Consultation** | Prompts consultation with trusted adults, teachers, or squad mates to break emotional isolation. | Help-seeking behaviour; overcoming shame or fear of admitting uncertainty. |
| **Beacon** | **Reporting & Escalation** | Identifies official, confidential reporting channels (e.g. SPF, ScamShield, school counsellor). | Knowing when and how to escalate threats without fear of personal retribution. |
| **Shieldfin** | **Refusal & Peer Support** | Deploys calm, assertive refusal scripts and shields squad members from peer pressure. | Resisting social coercion, dares, and manipulative peer dares. |
| **Cluepaw** | **Situational Awareness** | Highlights subtle, overlooked contextual anomalies in chats, images, and physical settings. | Developing keen observation for deceptive tactics and environmental red flags. |
| **ByteBuddy** | **Digital Hygiene** | Scans app permissions, flags credential-harvesting requests, and checks 2FA status. | Safe digital habits, strong password hygiene, and protection of Singpass / banking data. |

---

## 8. Intended Platform Architecture

The proposed application rebuild is designed as a **modern, privacy-preserving Progressive Web Application (PWA)** optimised for low-latency delivery across diverse mobile devices.

> [!NOTE]
> The architectural specification below represents the planned rebuild design. The current repository contains documentation and governance frameworks; the application layers described here are planned for staged development.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (PWA)                              │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │  Student PWA Client   │  │  Facilitator Console  │  │ Scenario Portal │  │
│  │ (Mobile-First / Next) │  │ (Desktop/Tablet View) │  │ (Author/Review) │  │
│  └──────────┬────────────┘  └───────────┬───────────┘  └────────┬────────┘  │
└─────────────┼───────────────────────────┼───────────────────────┼───────────┘
              │                           │                       │
              ▼                           ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & API SERVICES                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  API Gateway & Security Middleware                                     │  │
│  │  - Rate limiting, CSRF protection, input validation (Zod)             │  │
│  │  - Ephemeral Session Manager (zero PII, cryptographically random IDs) │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│         ┌───────────────────────────┼───────────────────────────┐           │
│         ▼                           ▼                           ▼           │
│  ┌───────────────┐           ┌───────────────┐           ┌───────────────┐  │
│  │ Scenario &    │           │ Squad Sync &  │           │ Anonymous     │  │
│  │ Consequence   │           │ Think-Vote-   │           │ Assessment &  │  │
│  │ Engine        │           │ Explain Svc   │           │ Analytics     │  │
│  └──────┬────────┘           └──────┬────────┘           └──────┬────────┘  │
└─────────┼───────────────────────────┼───────────────────────────┼───────────┘
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE & STORAGE                             │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ Scenario Content DB   │  │ Ephemeral Cache / Sync│  │ Aggregate Stats │  │
│  │ (Vetted Scenarios)    │  │ (In-memory session)   │  │ (Zero PII Store)│  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Proposed Architectural Specifications

1. **Client Layer:**
   - Framework: Mobile-first Progressive Web Application built with React / Next.js.
   - Offline & Low-Bandwidth: Service worker caching of game assets, vector graphics (SVG), and scenario JSON payloads to ensure responsiveness in low-connectivity environments.
   - Device Compatibility: Fully responsive across legacy and modern mobile viewports (minimum 320px width), with accessible touch targets ($\ge 48\text{ px}$).
2. **Session and Squad State Management:**
   - Ephemeral squad coordination for Think–Vote–Explain powered by lightweight WebSocket or Server-Sent Events (SSE).
   - Anonymous session tokens: Participants join using a 6-character room code; no accounts, passwords, or personal credentials are required.
3. **Data Persistence and Privacy Controls:**
   - Strict data minimisation: Zero collection of Personally Identifiable Information (PII).
   - Pre/post assessment linking via cryptographically random pairing tokens, disassociated from IP addresses or device fingerprints.
   - Ephemeral session expiry: Session logs and temporary squad states are automatically expunged following workshop conclusion.
4. **Scope Boundaries:**
   - Unmoderated peer-to-peer text chat, heavy 3D rendering engines (e.g. WebGL three.js worlds), and generative AI runtimes are explicitly excluded from the MVP scope to ensure safeguarding, deterministic content quality, and rapid loading.

---

## 9. Age-Banded User Groups

### Target Outreach Structure

In accordance with the submitted outreach breakdown (`YCM Project Team Members Particulars & Outreach Breakdown.xlsx` and `YCM Budget Proposal.xlsx`), ShieldQuest targets **200 youth participants** aged 10–24:
- **100 Pre-IHL Youths:** Secondary School and Junior College students (~Ages 12–18).
- **100 IHL Youths:** Polytechnic, ITE, and University students (~Ages 17–24).
- **Delivery Modality Breakdown:**
  - **140 in-person workshop participants** attending facilitated interactive sessions across 2–3 pilot groups (with refreshments budgeted at $5/pax).
  - **60 remote / community participants** reached through QR-based digital activations and partner youth programmes.

### Educational Complexity Tiers

Because cognitive maturity, financial autonomy, and legal exposure differ significantly across this broad range, scenarios are designed in three distinct complexity tiers:

| Segment | Age Band | Cognitive & Social Design | Representative Dilemmas & Scenarios | Safeguarding & Consent Framework |
|---|---|---|---|---|
| **Tier 1: Early Youth** | **10–13** (Upper Pri / Lower Sec) | - Concrete, visual storytelling<br>- 2–3 clear choices<br>- Focus on direct consequences and immediate help-seeking | - In-game currency trading & cheat scams<br>- Cyberbullying and griefing<br>- Impersonation by online "friends"<br>- Minor retail dares and unattended item theft | Minor assent with institutional / educator host administrative consent protocol. |
| **Tier 2: Mid Youth** | **14–16** (Upper Sec) | - Branching social narratives<br>- Peer pressure and group dared dynamics<br>- Introduction of delayed consequences | - Shoplifting dares and receipt tampering<br>- Phishing links in student chat groups<br>- Social media extortion / impersonation<br>- Carousell buying and selling scams | Minor assent with school / programme host administrative consent. |
| **Tier 3: Young Adults** | **17–24** (Poly / ITE / JC / Uni) | - Complex, ambiguous evidence<br>- Competing financial incentives (FOMO)<br>- Serious legal liabilities (money laundering, unlicensed money-lending) | - Job scams & easy money commissions<br>- Bank account / Singpass credential rental<br>- Investment & fake trading syndicates<br>- Parcel delivery phishing & OTP theft | Participant direct consent; adult privacy rights; voluntary participation. |

---

## 10. First Playable Milestone and Delivery Roadmap

Development follows a disciplined, staged rollout. Staging allows technical risk to be retired early without reducing the committed scope of the submitted grant proposal.

```
┌─────────────────────────────────┐
│ Milestone 1: First Playable MVP │ ──> Core Loop, 1 District, 3 Scenarios, Basic Voting
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ Milestone 2: Guardian Progression│ ──> All 6 Guardians, 4 Districts, 15 Scenarios
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ Milestone 3: Facilitator Portal │ ──> Educator Dashboard, Moderation Engine, Offline Kit
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│ Milestone 4: Full Scope Delivery│ ──> 30–40 Scenarios, Pilot Deployment, Full Evaluation
└─────────────────────────────────┘
```

### Staged Milestone Specifications

- **Milestone 1: First Playable Milestone (Alpha Core Loop)**
  - *Target Scope:* Single playable district (School Street or Digi-District) demonstrating the end-to-end loop: Explore $\rightarrow$ Investigate $\rightarrow$ Think-Vote-Explain $\rightarrow$ Decide $\rightarrow$ Delayed Consequence $\rightarrow$ Peer Shield.
  - *Content:* 3 complete, fully tested scenarios (including "Easy Money").
  - *Technical Capabilities:* Local/ephemeral squad voting, baseline telemetry recording for the six S.H.I.E.L.D. metrics, responsive mobile layout.
- **Milestone 2: Guardian Expansion & Narrative Breadth**
  - *Target Scope:* Activation of all four city districts; full implementation of the six Guardian progression tracks.
  - *Content:* Expansion to 15 vetted scenarios spanning Tiers 1, 2, and 3.
  - *Technical Capabilities:* Enhanced Delayed Consequence Engine tracking multi-turn city metrics (Trust Meter, Security Index); Guardian tool activations.
- **Milestone 3: Facilitator Console & Scenario Management Portal**
  - *Target Scope:* Administrative tools for workshop delivery and community authoring.
  - *Technical Capabilities:* Live Facilitator Dashboard for monitoring squad votes; Scenario Management Portal with role-based access; youth scenario submission template builder; printable offline board-game kit assets (PDF).
- **Milestone 4: Full Committed Scope & Pilot Readiness**
  - *Target Scope:* Full library of **30–40 reviewed scenarios**; WCAG 2.1 AA accessibility sign-off; performance audit on low-spec mobile hardware; validated pre/post survey instrument.

---

## 11. Scenario Development and Review Pipeline

Every scenario featured in ShieldQuest passes through an uncompromising four-stage review pipeline before reaching youth participants:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  1. Drafting │ ──> │2. Verification│ ──> │ 3. Two-Person Sign-off│ ──> │4. Deployment │
│Schema Template│    │  Legal/Stats │     │Content + Safeguarding│     │Locked to Prod│
└──────────────┘     └──────────────┘     └──────────────────────┘     └──────────────┘
```

1. **Drafting (Structured Schema):** Scenarios are authored using a standardised schema defining context, evidence items, branching nodes, immediate feedback, delayed consequence triggers, and discrete S.H.I.E.L.D. metric tags.
2. **Verification and Fact-Checking:**
   - All legal references and penalties must use conditional phrasing (e.g. "may be liable to", "up to") rather than absolute claims.
   - All crime statistics, helpline numbers, and advisory procedures must cite current official Singapore sources (e.g. SPF Annual Crime Brief 2025, ScamShield) with explicit as-of dates.
   - All external web links and phone numbers must be strictly fictional (`.test` / `.example` domains, `8XXX XXXX` placeholder numbers). Real scam URLs, genuine bank links, or functioning phone numbers are strictly prohibited.
3. **Mandatory Two-Person Sign-off:**
   - **Sign-off A (Educational & Factual Review):** Verification of scenario logic, narrative realism, and pedagogical alignment.
   - **Sign-off B (Youth Safeguarding & Ethics):** Verification of age-appropriateness, absence of victim-blaming language, exclusion of graphic or instructional details (no "how-to" scam or shoplifting tutorials), and inclusion of emotional safety exit routes.
4. **Staging and Deployment:** Only scenarios bearing both documented sign-offs are compiled into production releases or enabled in the Scenario Management Portal.

---

## 12. Proposed Six-Month Programme Timeline

The programme is structured as a six-month execution cycle (Weeks 1–24), confirmed via `YCM Supplementary Questions.docx` and `SecurePi Proposal.pdf`. The calendar dates represent the **proposed schedule**; the operational timeline will anchor to the confirmed commencement date upon NYC approval:

| Relative Timing | Proposed Calendar | Key Phase | Deliverables and Operational Milestones |
|:---:|:---:|---|---|
| **Weeks 1–3** (Month 1) | Nov 2026 | **Co-Design & Research** | - Youth validation focus groups to finalize learning outcomes baseline and priority scenarios.<br>- Technical audit of reference prototypes (V1, V2/Railway).<br>- Establish institutional ethics, safeguarding, and assent protocols. |
| **Weeks 4–9** (Months 1–2) | Nov–Dec 2026 | **Develop & Expand MVP** | - Refine existing prototype into pilot-ready PWA.<br>- Build core City Board map, branching logic, and Think–Vote–Explain voting flow.<br>- Author and expand scenario library toward 30–40 reviewed scenarios.<br>- Develop Scenario Management Portal and 20 offline printable board-game companion kits. |
| **Weeks 10–12** (Month 3) | Jan 2027 | **Test & Refine** | - Conduct usability testing and accessibility fixes (WCAG 2.1 AA).<br>- Finalise facilitator toolkits, debrief prompts, and rubrics.<br>- Internal pilot dry-runs with student volunteers. |
| **Weeks 13–18** (Months 4–5) | Feb–Mar 2027 | **Controlled Youth Pilot (Phase 1)** | - Deploy controlled facilitated pilot sessions (2–3 groups, 20–30 youths/session).<br>- Host initial testing at Nanyang Polytechnic (NYP student networks).<br>- Collect baseline and post-session impact data for KPIs 1–4 and 6.<br>- Execute rapid UI/UX and scenario difficulty refinements. |
| **Weeks 19–22** (Months 5–6) | Mar–Apr 2027 | **Refined Community Pilot (Phase 2)** | - Wider pilot deployment using QR-based facilitated sessions at partner youth/community organisations (approaching prospective site at ITE College Central).<br>- Deploy offline board-game kits to youth centres.<br>- Administer 2–4 week optional retention follow-up assessments (KPI 5). |
| **Weeks 23–24** (Month 6) | Apr 2027 | **Evaluation & Handover** | - Consolidate quantitative and qualitative data across all 200 participants.<br>- Finalise formal Project SHIELD Impact Report for NYC and stakeholders.<br>- Package reusable Facilitator Toolkit and outline long-term scale-up plan. |

---

## 13. Pilot Delivery and Intended Participation

### Participant Cohort Breakdown

The project committed outreach target comprises **200 youth participants**:
- **100 Secondary School / Junior College Youths (Ages ~12–18)**
- **100 Polytechnic / ITE Youths (Ages ~17–24)**
- **In-Person Component:** Up to **140 participants** across 2–3 facilitated pilot groups (with refreshments budgeted at $5/pax).
- **Digital / Community Component:** Remaining **~60 participants** reached via QR-code community activations and digital sessions.

### Workshop Delivery Format

Controlled pilot sessions are structured as **90-minute facilitated interactive workshops**, conducted in cohorts of **20–30 participants** organised into small squads of **4–5 players**:

| Time Window | Duration | Workshop Stage | Activity and Learning Process |
|:---:|:---:|---|---|
| **00:00 – 00:15** | 15 min | **Segment 1: Onboarding & Briefing** | - Welcome, youth assent, and safety briefing.<br>- Facilitators introduce the S.H.I.E.L.D. Behavioural Framework.<br>- Assignment of anonymous 6-character session codes; squad formation (4–5 per squad).<br>- Pre-activity assessment questionnaire (KPI 1: Risk Recognition baseline). |
| **00:15 – 01:00** | 45 min | **Segment 2: Core Gameplay & Scenarios** | - Squads navigate **two core interactive scenarios** (with a third scenario if time permits), covering themes such as "Easy Money" (money-mule recruitment) and e-commerce scams.<br>- Think–Vote–Explain deliberation with rotating squad roles (Safety Lead, Evidence Checker, Peer Supporter).<br>- Delayed consequence simulation and Peer Shield bystander challenges. |
| **01:00 – 01:20** | 20 min | **Segment 3: Facilitated Debrief** | - Facilitator-led reflection on immediate vs delayed consequences.<br>- Deconstruction of manipulation levers (urgency, FOMO, authority).<br>- Squad discussion on safe bystander intervention and Peer Intervention Confidence. |
| **01:20 – 01:30** | 10 min | **Segment 4: Evaluation & Wrap-up** | - Post-activity evaluation questionnaire (KPIs 1, 2, 3, 4, and 6) covering scenario clarity, usability, decision accuracy, and consequence awareness.<br>- Distribution of digital takeaways and support resources (helpline info). |

### Staged Venue Progression

1. **Intended Primary Testing Venue:** Nanyang Polytechnic (NYP). An informal discussion was held with an NYP lecturer, confirming student-led pilot feasibility subject to room booking and scheduling.
2. **Prospective Secondary Venue:** ITE College Central. Selected for its geographic proximity to NYP, facilitating rapid evaluation-and-refinement cycles. (Unconfirmed; institution has not yet been approached).
3. **Subsequent Community Venues:** Identified in partnership with community youth organisations during Weeks 19–22.

---

## 14. Six Independent Impact KPIs

In accordance with grant evaluation standards and feedback from domain advisers, Project SHIELD evaluates impact using **six distinct, independently measurable Key Performance Indicators (KPIs)**. These KPIs are distinct from the six S.H.I.E.L.D. behavioural skills:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PROJECT SHIELD EVALUATION FRAMEWORK                   │
│                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────┐  │
│  │ 1. Risk Recognition    │  │ 2. Decision Accuracy    │  │3.Consequence│  │
│  │ (Objective Pre/Post)    │  │ (Objective Transfer)    │  │   Awareness │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────┘  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────┐  │
│  │ 4. Peer Intervention   │  │ 5. Knowledge Retention  │  │6.Engagement │  │
│  │    Confidence (Survey)  │  │ (Optional Follow-up)    │  │& Completion │  │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

| KPI | Metric Name | Measurement Methodology | Evidence Source & Evaluation Rigour | Target Proposal |
|:---:|---|---|---|---|
| **1** | **Risk Recognition** | Objective pre- and post-test comparison | Identification of scam cues, phishing markers, and manipulation tactics across paired, comparable question items. | Statistically significant percentage improvement over baseline across the pilot cohort. |
| **2** | **Decision Accuracy** | Objective transfer evaluation | Selection of safe, lawful choices when encountering novel, unfamiliar scenarios not encountered during guided play. | High proportion of safe decisions in post-session transfer challenges. |
| **3** | **Consequence Awareness** | Objective / scenario-based scoring | Accurate identification of delayed legal, financial, and personal consequences resulting from high-risk actions. | Accurate identification of second-order and delayed consequences in debrief assessments. |
| **4** | **Peer Intervention Confidence** | Self-reported psychometric survey | 5-point Likert scale assessing participant confidence in safely advising, redirecting, or escalating help for an at-risk friend. | Measurable positive shift in mean confidence score between pre- and post-session instruments. |
| **5** | **Knowledge Retention** | Longitudinal follow-up survey (Optional / Feasible) | A brief digital follow-up assessment administered 2–4 weeks post-workshop to a voluntary sub-cohort. | Retention of key risk recognition and decision principles above initial pre-test baseline. |
| **6** | **Engagement & Completion** | System telemetry & observation | Objective tracking of mission completion rates, squad vote participation, voluntary replay rates, and qualitative feedback. | High workshop completion rate; positive qualitative participant satisfaction ratings. |

> [!WARNING]
> **Scientific Integrity Notice**  
> In-game score improvements and post-workshop survey gains measure educational comprehension and simulated decision confidence within controlled environments. They do **not** constitute empirical proof of reduced national crime rates, nor do they guarantee that players will never fall victim to real-world scams. Team SecurePi prohibits the fabrication of evaluation results or premature claims of crime reduction.

---

## 15. Privacy, Safeguarding and Accessibility

### Privacy by Design

ShieldQuest is engineered from the ground up for youth privacy and adheres to Singapore's **Personal Data Protection Act (PDPA)** principles:

- **Zero Personally Identifiable Information (PII):** The application does not collect, request, or store names, NRIC / FIN numbers, phone numbers, email addresses, home addresses, school registrations, photos, or banking details.
- **Anonymous Session Architecture:** Players access missions using temporary, pseudonymous 6-character room codes. Pre- and post-survey responses are paired using cryptographically generated random tokens that expire automatically.
- **Aggregate Reporting Only:** Data from Think–Vote–Explain squad votes and post-workshop analytics are stored and reported strictly in aggregate. To prevent small-group re-identification, individual voting choices are never displayed or linked to specific device seats.
- **No Third-Party Trackers:** The platform incorporates zero commercial advertising networks, social tracking pixels, or third-party behavioral analytics.

### Safeguarding and Emotional Safety

- **No Victim-Blaming:** Scenarios strictly attribute culpability to the deceptive tactics of the perpetrator. Feedback focuses on deconstructing the manipulator's strategy rather than mocking the target's credulity. Every risky decision path contains a constructive recovery and learning route.
- **Non-Graphic, Non-Instructional Content:** Scenarios illustrate risks without providing operational "how-to" tutorials for committing offences (e.g. detailed methods for shoplifting, hacking tools, or dark web purchasing are strictly excluded). Content depicting self-harm, sexual violence, or intimate image exploitation is barred.
- **Voluntary Participation & Distress Support:** No participant is ever pressured to disclose personal experiences with crime, bullying, or scams. Prominent, clickable support links to verified Singapore helplines are accessible on every screen:
  - **Police Emergency:** `999` | **Police SMS:** `70999`
  - **ScamShield Helpline:** `1799`
  - **Police Hotline:** `1800-255-0000`
  - **National Mindline (Youth Support):** `1771`
  - **Samaritans of Singapore (SOS 24/7):** `1767`
  - **Tinkle Friend (Children Helpline):** `1800-274-4788`

### Accessibility Standards

- Target compliance with **WCAG 2.1 Level AA**.
- Minimum touch target sizing of $48 \times 48\text{ pixels}$ for all interactive elements.
- Full keyboard navigability with visible focus indicators across all desktop and tablet interfaces.
- High-contrast text options, scalable typography, and reduced-motion mode respecting operating system preferences.
- Multi-modal status indication: information is never conveyed through colour alone (utilising icons, text labels, and structural cues).
- Performance optimisation ensuring smooth execution on entry-level Android smartphones and restricted school Wi-Fi networks.

---

## 16. Previous Prototypes and Pitch References

Team SecurePi developed several preliminary prototypes and presentation decks to demonstrate proof of concept prior to the current rebuild phase. These repositories and reference artifacts represent key milestones in the project's design and technical evolution:

### Reference Prototype Repositories

- **Proposal Demonstrator:** [feliciatanxl/SecurePi_SPF](https://github.com/feliciatanxl/SecurePi_SPF)  
  *Next.js front-end prototype developed for the SPF / NCPC Delta Challenge 2026 (Track B) competition presentation and grant pitch.*
- **Prototype V1:** [feliciatanxl/ShieldQuest-V1](https://github.com/feliciatanxl/ShieldQuest-V1)  
  *First-generation architectural proof-of-concept testing vector-based interactive district mapping (SVG), Guardian status vault, early scenario branching logic, and initial game layout.*
- **Prototype V2 (Railway):** [feliciatanxl/ShieldQuest-V2](https://github.com/feliciatanxl/ShieldQuest-V2)  
  *Second-generation dynamic prototype evaluating multi-user session state, squad Think–Vote–Explain voting synchronization, Delayed Consequence Engine logic, and backend coordination.*

### Summary of Project Reference Artifacts

| Artifact / Milestone | Format / Source Reference | Purpose and Scope | Reference Status |
|---|---|---|---|
| **Proposal Prototype (SPF Pitch)** | [GitHub: feliciatanxl/SecurePi_SPF](https://github.com/feliciatanxl/SecurePi_SPF) | Next.js front-end prototype developed for competition pitch demonstration. | Proof of concept; front-end reference for UI patterns. |
| **ShieldQuest V1 Prototype** | [GitHub: feliciatanxl/ShieldQuest-V1](https://github.com/feliciatanxl/ShieldQuest-V1) | First-generation architectural prototype testing SVG district rendering, Guardian plate assets, and early scenario logic. | Legacy reference codebase. |
| **ShieldQuest V2 Prototype (Railway)** | [GitHub: feliciatanxl/ShieldQuest-V2](https://github.com/feliciatanxl/ShieldQuest-V2) | Second-generation dynamic prototype testing backend session coordination and voting flows. | Primary reference for rebuild architecture pending full code audit. |
| **Live Vercel Demonstrator** | [shieldquest-sigma.vercel.app](https://shieldquest-sigma.vercel.app/) | Early static web demonstrator showcasing basic layout and UI components. | Visual demonstrator only; does not contain production backend or data services. |
| **Delta Challenge YCM Pitch Deck** | [Canva Presentation](https://canva.link/47bhfcvx3givmt2) / `Delta Challenge - SecurePi YCM Pitch Deck.pdf` | Core competition pitch deck detailing problem statement, gameplay loop, S.H.I.E.L.D. framework, and early S$4,450 budget estimate. | Communicated presentation narrative; superseded by proposal S$4,850 submission. |
| **Brainstorming Whiteboard** | [Canva Whiteboard](https://canva.link/jmi6kqulxnsltv5) | Collaborative design board capturing character concepts, district themes, and squad role ideas. | Design thinking reference; provisional feature plans. |
| **Alternate Pitch Deck** | [Canva Presentation](https://canva.link/1rm6p0k7njc80yv) | Secondary pitch exploration focusing on community outreach and youth engagement strategy. | Supporting presentation reference. |

---

## 17. Team Responsibilities

Project SHIELD is developed and led by **Team SecurePi**, based at **Nanyang Polytechnic**, Singapore. The team previously collaborated on technical innovations including **FlowGuard** (an AI/IoT smart-factory monitoring platform):

| Team Member | Role | Core Areas of Responsibility |
|---|---|---|
| **Felicia Tan** | **Lead Product Architect & Technical Lead** | Product architecture, UI/UX systems design, front-end and PWA engineering, game mechanics implementation, security architecture, and technical documentation. (Poly Student, Nanyang Polytechnic). |
| **Charlisa Tan** | **Lead Content Strategist & Pilot Lead** | Crime-prevention curriculum research, scenario authoring, youth co-design coordination, safeguarding compliance, pilot workshop delivery, and impact evaluation. (Poly Student, Nanyang Polytechnic). |

Both team members jointly govern core game design, grant milestone compliance, stakeholder engagement, and repository maintenance.

---

## 18. Contributing, Security and Licensing Information

- **Contributing Guidelines:** ShieldQuest is an invitation-only project maintained by Team SecurePi. Review [CONTRIBUTING.md](CONTRIBUTING.md) for branch workflows, documentation standards, accessibility requirements, and mandatory scenario review protocols.
- **Vulnerability Disclosure:** We treat youth privacy and data protection as paramount. Review [SECURITY.md](SECURITY.md) for our coordinated vulnerability disclosure policy and private reporting channels.
- **Code of Conduct:** All contributors, workshop facilitators, and co-design participants must abide by our youth safeguarding and anti-harassment standards detailed in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- **Proprietary Licence:** All rights are reserved by Team SecurePi. Review [LICENSE](LICENSE) for terms governing viewing, evaluation, and contribution ownership.

---

## 19. Outstanding Team Decisions

The following items are actively tracked for team resolution, verification, and external confirmation:

1. **Funding Request Status (Resolved in Application, Pending NYC Award):**  
   - Audit of source materials confirms that the definitive submitted grant request in `SecurePi Proposal.pdf` (Page 1 & 8) and `YCM Budget Proposal.xlsx` is **S$4,850** (with a documented S$3,000 Lean Implementation alternative).
   - The S$4,450 figure in `Delta Challenge - SecurePi YCM Pitch Deck.pdf` (Slide 11) is established as an earlier preliminary pitch draft.
   - *Status:* Resolved in documentation as S$4,850 submitted; final grant amount remains subject to the official NYC Letter of Offer.
2. **NYC Grant Outcome Confirmation:**  
   Formal grant approval and the executed Letter of Offer remain pending. All milestone dates (Weeks 1–24 / Months 1–6) remain relative until the official start date is confirmed.
3. **Institutional Hosting Agreements:**  
   Workshop delivery schedules at Nanyang Polytechnic (informally discussed) and prospective engagements at ITE College Central require formal administrative scheduling and institutional assent/consent alignment.
4. **Rebuild Codebase Foundation:**  
   Conduct a systematic source-code audit of the reference prototypes ([ShieldQuest-V2](https://github.com/feliciatanxl/ShieldQuest-V2), [ShieldQuest-V1](https://github.com/feliciatanxl/ShieldQuest-V1), and [SecurePi_SPF](https://github.com/feliciatanxl/SecurePi_SPF)) to decide whether to port and refactor key components or establish a clean scaffold using modern Next.js PWA conventions.
5. **Pre/Post Assessment Instrument Validation:**  
   Engage youth educators and crime-prevention specialists to review the 6 S.H.I.E.L.D. measurement items, ensuring survey questions are psychometrically sound, age-appropriate, and free from double-counting.

---

*Copyright © 2026 Team SecurePi (Nanyang Polytechnic). All rights reserved.*
