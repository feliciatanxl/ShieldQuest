# Security Policy

ShieldQuest is built for young people, so we treat **privacy issues as security issues**. Thank you for helping keep players safe.

## Supported versions

| Version | Supported |
|---|---|
| `main` branch (latest) | Yes |
| Anything older, including the earlier prototype repositories | No: please test against `main` |

## Reporting a vulnerability

**Please do not open a public issue for security or privacy problems.**

1. Use GitHub's private reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Only the maintainers can see it.
2. If that option is not available, contact the repository owner [@feliciatanxl](https://github.com/feliciatanxl) privately on GitHub and ask for a private channel. Do not put exploit details in a public message.

Please include:

- what you found and where (file, route or API endpoint);
- steps to reproduce, or a proof of concept that uses **test data only**;
- the impact you think it has;
- any suggested fix.

**What to expect:**

| Step | Target time |
|---|---|
| Acknowledge your report | within 3 working days |
| Confirm whether it is a valid issue | within 7 working days |
| Fix a confirmed high-severity issue | as soon as possible, and before any further pilot session |

We will keep you updated and credit you in the fix unless you prefer to stay anonymous.

## What we especially want to hear about

- **Any way to collect or reveal personal data**, such as names, NRIC numbers, phone numbers, emails, banking details or IP addresses reaching storage or logs.
- **Breaking vote privacy**: linking a player's private Think–Vote–Explain vote to their seat or pseudonym.
- **Small-group exposure**: analytics or assessment results that could identify an individual.
- **Session hijacking**: joining or controlling someone else's session or the facilitator console.
- **Educator portal access bypass**: publishing or editing scenarios without authorisation, or skipping moderation.
- **Unsafe content getting through**: real links, real phone numbers or harmful content slipping past moderation.
- **Injection**: cross-site scripting or injection through scenario content or youth submissions.
- **Third-party requests**: anything that makes players' browsers contact third-party servers without need.

## Out of scope

- Denial-of-service against development or demo servers.
- Findings that need physical access to an unlocked device.
- Social engineering of the team or of pilot participants. **Never test on real participants or real sessions.**
- Missing security headers on local development servers (`localhost`).

## Safe harbour

We will not take action against good-faith research that:

- only uses sessions and data you created yourself;
- does not access, change or keep other people's data;
- does not disrupt pilot sessions or degrade the service for others;
- gives us reasonable time to fix the issue before public disclosure.

## Our privacy commitments

- No accounts tied to real identities, and no names, NRIC, phone numbers, banking or Singpass data from players.
- Pre- and post-assessments use random session codes, and results are reported only in aggregate.
- No requirement to disclose personal experiences.
- Data handling designed in line with Singapore's PDPA.

See the "Privacy and safety by design" section of the [README](README.md) for more.
