# Contributing to ShieldQuest

Thank you for helping young people practise safer choices. ShieldQuest is owned and maintained by **Team SecurePi**, and contributions are by invitation or prior agreement with the team. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) and the [LICENSE](LICENSE) before contributing.

## Ways to help

- **Play-test** on real devices, especially older Android phones and iPhones, and tell us what feels slow, confusing or broken.
- **Accessibility testing:** screen readers, keyboard-only play, large text, reduced motion and colour-blind checks.
- **Content review:** check scenarios for accuracy, tone, age-appropriateness and victim-blaming. We especially welcome youth workers, educators and counsellors.
- **Youth co-design:** suggest fictional, non-identifying scenario ideas. Ideas never need personal stories.
- **Code:** bug fixes and features agreed with the team in an issue first.

## Non-negotiable rules

Every change must keep these promises. Reviewers will check them.

### Privacy

- Never ask for or store names, NRIC numbers, phone numbers, emails, schools, photos, banking or Singpass details, or IP addresses.
- Assessment data uses random session codes and is reported only in aggregate.
- No third-party analytics, trackers or advertising.

### Accessibility

- Tap targets of at least 48 px, full keyboard operation and visible focus.
- Readable text sizes that can be adjusted, and plain language for the target age band.
- Status is shown with shape, icon and word, never colour alone.
- Respect reduced-motion settings.
- Every decision must be possible without 3D or heavy graphics (low-power and low-bandwidth friendly).

### Content safety

- **Fictional brands, people, links and phone numbers only.** Use `.test` or `.example` domains and `8XXX XXXX` numbers.
- **Offender-focused feedback.** Blame the tactic, never the target. Every risky choice has a recovery path.
- **No graphic or harmful instructions:** no shop-theft techniques, working scam scripts, sextortion, intimate images or self-harm content.
- Laws and penalties use "may" and "up to". Statistics and helplines cite an official source with an as-of date.
- A scenario is only used with youths after **two human sign-offs**: one for content and one for safeguarding.

## Branches, commits and pull requests

- Branch from `main` with a short descriptive name, for example `fix/vote-reveal-keyboard` or `content/easy-money-review`.
- Write commit messages in the imperative mood ("Add Peer Shield retry", not "Added …").
- Keep each pull request focused on one change. Explain **what** changed, **why**, and **how you tested it** (devices, screen sizes, keyboard).
- Include screenshots or a short recording for any UI change.
- Never commit `.env` files, secrets, real participant data or assessment exports.

## Reporting bugs and ideas

Open a GitHub issue with:

- what you expected and what happened;
- steps to reproduce, including device, browser and screen size;
- the screen or scenario involved.

**Security or privacy problems must not be reported in public issues.** Follow [SECURITY.md](SECURITY.md) instead.

## Ownership of contributions

ShieldQuest is not open source. By contributing, you agree that Team SecurePi may use, modify and distribute your contribution as part of ShieldQuest under the terms in [LICENSE](LICENSE), and you confirm the contribution is your own work.
