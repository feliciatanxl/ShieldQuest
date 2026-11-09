# Security Policy

At **ShieldQuest**, player privacy and data protection are fundamental design principles. Because ShieldQuest is built for young people, software security and privacy preservation are integral to our educational mission.

This policy outlines our vulnerability reporting process, safe harbour guidelines, and planned security architecture.

---

## Reporting a Vulnerability

> [!CAUTION]
> **Do not file public GitHub issues for security vulnerabilities, privacy leaks, or sensitive data exposures.**

If you discover a security vulnerability or privacy flaw in ShieldQuest:

1. **GitHub Security Advisory (Preferred):** Navigate to the **Security** tab of the repository and select **Report a vulnerability** to open a private advisory.
2. **Direct Contact:** If GitHub Security Advisories are unavailable, contact project maintainer Felicia Tan privately via GitHub [@feliciatanxl](https://github.com/feliciatanxl).

### What to Include

Please provide:
- A description of the issue and affected component (route, API endpoint, or file).
- Reproduction steps or a minimal proof of concept using **synthetic test data only**.
- Your assessment of potential impact on player privacy, ballot secrecy, or administrative controls.

We aim to acknowledge reports promptly, investigate valid findings in good faith, and prioritise fixes that safeguard user privacy.

---

## Planned Security and Privacy Architecture

The upcoming rebuild is guided by specific security and privacy design goals:

### 1. Player Privacy and Data Minimisation
- **Data Minimisation:** The design goal is to avoid collecting or persisting sensitive personal identifiers (such as real names, national identity numbers, phone numbers, email addresses, or precise locations) during gameplay.
- **Temporary Session Identifiers:** Group play is planned around temporary, randomly generated room codes, keeping sessions decoupled from persistent personal accounts.
- **No Third-Party Tracking:** The architecture avoids commercial advertising pixels, tracking scripts, and third-party profiling cookies.

### 2. Ballot Secrecy in Squad Play
- **Server-Side Aggregation:** During Think–Vote–Explain squad play, individual ballots should be tallied on the server so that personal responses are not exposed to peers or broadcast in client-side state.
- **Client Sanitisation:** Aggregated voting results sent to player devices should omit individual device identifiers or timestamps.

### 3. Session and Content Security
- **Authentication for Administrative Tools:** The Scenario Management Portal and educator dashboards will require authenticated access.
- **Content Sanitisation:** User-submitted scenario suggestions and discussion text must be sanitised using schema validation and safe rendering to defend against Cross-Site Scripting (XSS) and injection attacks.
- **Fictionalised Identifiers:** Scenarios strictly employ placeholder domain extensions (`.test`, `.example`) and fictional telephone formats (`8XXX XXXX`) to prevent accidental interactions with real external services.

### 4. Data Retention Principles
- Temporary room states and session records are intended to be cleared after sessions conclude, retaining only non-identifying aggregate gameplay metrics for educational feedback.

---

## Safe Harbour

We support security research conducted in good faith. Team SecurePi will not pursue legal action against researchers who:
- Test exclusively against their own accounts, local development instances, or synthetic scenarios.
- Do not access, modify, or download data belonging to other players or participants.
- Do not perform denial-of-service testing or degrade service availability for others.
- Do not attempt social engineering or phishing against students, educators, or team members.
- Provide reasonable time for the maintainers to investigate and remediate reported findings before public disclosure.

Thank you for helping keep ShieldQuest safe for everyone.
