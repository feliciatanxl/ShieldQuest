# Security Policy

At **Project SHIELD: ShieldQuest**, we consider **youth privacy and data protection to be core security requirements**. Because ShieldQuest is designed for young people, vulnerability management is integral to our safeguarding commitment.

This policy outlines our vulnerability disclosure process, safe harbour protections, and target security architecture for the planned platform rebuild.

---

## Supported Versions

| Version / Branch | Security Support Status | Operational Scope |
|---|---|---|
| `main` branch | **Active Support** | Current production documentation and target rebuild specifications. |
| Earlier prototypes (`ShieldQuest-V1`, `ShieldQuest-V2`, `SecurePi_SPF`) | **End of Life (No Support)** | Historical reference repositories. Do not report security findings against these legacy branches. |

---

## Reporting a Security or Privacy Vulnerability

> [!CAUTION]
> **Do not file public GitHub issues for security vulnerabilities, privacy flaws, or sensitive data exposures.**

If you discover a security vulnerability, privacy leak, or potential safeguarding risk in ShieldQuest:

1. **GitHub Security Advisory (Preferred):** Navigate to the **Security** tab of the repository and click **Report a vulnerability**. This creates a private disclosure channel accessible only to repository maintainers.
2. **Direct Private Contact:** If GitHub Advisory is unavailable, contact Lead Technical Architect Felicia Tan privately via GitHub [@feliciatanxl](https://github.com/feliciatanxl) to request an encrypted communication channel.

### What to Include in Your Report

To help us investigate and triage quickly, please include:

- A clear summary of the finding, including the affected component (route, API endpoint, or documentation file).
- Step-by-step reproduction instructions or a minimal proof of concept using **synthetic test data only**.
- Your assessment of the vulnerability's impact, particularly regarding youth privacy, vote secrecy, or administrative bypass.
- Any suggested remediations or mitigations.

### Response and Remediation Timetable

| Milestone | Target Response Commitment |
|---|---|
| **Initial Acknowledgement** | Within **3 business days** |
| **Triage & Validity Confirmation** | Within **7 business days** |
| **High / Critical Severity Remediation** | Prioritised for immediate hotfix and **mandated prior to any live youth pilot session** |
| **Coordinated Public Disclosure** | Mutually agreed timeline (typically 30–90 days following fix verification) |

Reporters acting in good faith will be acknowledged in release notes and security advisories, unless they request anonymity.

---

## Implementation Status of Security Controls

> [!NOTE]
> **Implementation Context**  
> As of 9 November 2026, this repository contains project documentation, technical architecture, and governance standards. The controls detailed below represent **required architectural specifications** for the planned application rebuild. They must be systematically implemented, audited, and verified prior to pilot workshops involving youth participants.

---

## Threat Model and Security Specifications

The target platform architecture addresses specific threat vectors relevant to educational, multi-user youth gaming:

### 1. Youth Privacy and Data Minimisation

- **Zero-PII Storage:** The application layer must never accept, log, or persist Personally Identifiable Information (such as NRIC/FIN numbers, real names, phone numbers, email addresses, student IDs, or location coordinates).
- **Ephemeral Session Tokens:** Student sessions must rely on short-lived, cryptographically random room tokens (e.g. 6-character alphanumeric codes). Tokens expire automatically following session termination.
- **Fingerprinting Prevention:** Server logs must not store raw IP addresses or device user-agent hashes alongside gameplay or assessment records.

### 2. Think–Vote–Explain Ballot Privacy

- **Server-Side Aggregation:** During squad voting, individual player ballots must be submitted over TLS and tallied strictly on the server.
- **Client Payload Sanitisation:** Aggregated voting distributions broadcast to client devices must never contain individual device identifiers, seat numbers, or submission timestamps.
- **Small-Group Re-Identification Protection:** If a squad has fewer than 3 participants, voting distributions must be merged with broader cohort totals to prevent deduction of individual choices.

### 3. Assessment Data Integrity and Isolation

- **Token Pairing:** Pre- and post-activity assessments are linked solely via a one-time random pairing key generated at session start.
- **Tamper Resistance:** Assessment submissions must be validated against expected schema bounds to prevent score fabrication or replay attacks.
- **Automated Data Purge:** Ephemeral session logs and interim gameplay states must be purged within 48 hours of workshop completion. Only anonymised, aggregate KPI summaries are retained for grant reporting.

### 4. Administrative and Educator Access Control

- **Role-Based Access Control (RBAC):** Access to the Scenario Management Portal and Facilitator Dashboard must be protected by strict authentication.
- **Multi-Factor Authentication (MFA):** Mandatory MFA for administrator and content moderator accounts.
- **Route Authorization Guards:** Server-side middleware must verify user role tokens on every API request. Client-side URL hiding alone is insufficient.

### 5. Content Moderation and Authorisation Gates

- **Publishing Workflow Restrictions:** Youth-created or community-drafted missions must remain in a non-queryable `draft` or `pending_review` state until explicitly approved by two designated human reviewers.
- **Injection & XSS Prevention:** All user-submitted scenario text, titles, and discussion prompts must be strictly sanitised using schema validation (e.g. Zod) and rendered via safe markdown sanitisation libraries (e.g. DOMPurify) to prevent Cross-Site Scripting (XSS).
- **Fictional Identifier Enforcement:** Automated checks must verify that all scenario URLs belong to `.test` or `.example` domains and that phone numbers adhere to placeholder patterns (`8XXX XXXX`).

### 6. Session Security and Hijacking Defences

- **Cryptographic Randomness:** Session identifiers and room codes must be generated using cryptographically secure pseudorandom number generators (CSPRNG).
- **Session Hijacking Mitigation:** Ephemeral tokens must be bound to secure HTTP-only cookies or restricted local storage, with short time-to-live (TTL) limits.
- **Rate Limiting:** API endpoints handling room creation, code validation, and voting must enforce IP- and subnet-level rate limiting to defend against brute-force attacks.

### 7. Third-Party Service and Supply Chain Restrictions

- **Zero External Trackers:** No commercial advertising pixels, tracking scripts, or profiling analytics may be embedded.
- **Asset Self-Hosting:** Fonts, stylesheets, and icons must be self-hosted within the PWA bundle to prevent third-party tracking or supply-chain CDN compromise.
- **Subresource Integrity (SRI):** Any mandatory external scripts must incorporate cryptographic Subresource Integrity hashes.

---

## Safe Harbour Commitment

We support responsible security research conducted in good faith. Team SecurePi will not pursue legal action or report researchers to law enforcement provided that:

- You test exclusively against your own test accounts, synthetic scenarios, and local development environments.
- **You never access, modify, download, or disclose data belonging to other users or pilot participants.**
- You never conduct testing that disrupts workshop availability, degrades performance, or causes denial of service.
- **You never attempt social engineering, phishing, or physical attacks** against Team SecurePi members, students, teachers, or workshop facilitators.
- You provide reasonable opportunity for Team SecurePi to remediate identified vulnerabilities prior to public disclosure.

Thank you for partnering with us to keep young people safe online and offline.
