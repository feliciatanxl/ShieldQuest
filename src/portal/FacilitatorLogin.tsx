import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  FileBarChart,
  Lock,
  Play,
  Search,
} from 'lucide-react';

import { navigate } from '../router.ts';
import { Button, PortalMark } from './parts.tsx';

interface FacilitatorLoginProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

/**
 * Sign-in for the facilitator portal.
 *
 * On the light civic skin, like the portal it leads into. It was previously a
 * full-page navy screen that handed off to a light dashboard — a jarring
 * transition, and one that put the portal's front door in a different register
 * from the portal itself. Facilitators are teachers, counsellors and youth
 * workers; the front door should look like the institutional tool it is.
 *
 * WHO ACTUALLY ARRIVES HERE
 *
 * Almost nobody signs in. In the pilot the portal has a handful of real users
 * and they arrive knowing what it is. The visitor this screen is really for is
 * someone assessing the build — a person who followed "Facilitator portal" from
 * the public site to find out what the adult half of ShieldQuest contains, and
 * who has no credentials and no reason to guess at any.
 *
 * That makes a bare login form the wrong screen twice over. It is a dead end
 * for the visitor who cannot get past it, and a wasted page for the one who
 * can: the portal's actual substance — a review queue, an age-band gate,
 * aggregate-only reporting — is exactly what an evaluator came to see, and it
 * was sitting behind a password box that guards nothing.
 *
 * So the screen says what is behind the door before asking anyone to open it,
 * and it is honest about the lock: there is no account system in this build,
 * the form does not check what it is given, and `/admin` was always reachable
 * without it. Claiming otherwise on the way in would be a small lie told to the
 * people best placed to check it.
 */

const INSIDE = [
  {
    icon: Search,
    title: 'Scenario library',
    body: 'Every situation, filtered by age band and S.H.I.E.L.D. skill, with the review state it is currently in.',
  },
  {
    icon: ClipboardCheck,
    title: 'Content review',
    body: 'The queue a scenario passes through before it can reach a participant, and the age band it is cleared for.',
  },
  {
    icon: Play,
    title: 'Session control',
    body: 'Open a room, follow the group’s decision signals live, and deploy a flash mission mid-session.',
  },
  {
    icon: FileBarChart,
    title: 'Insights',
    body: 'Aggregate only. No participant is named, ranked or identified anywhere in this portal.',
  },
];

export function FacilitatorLogin({ onSuccess, onBackToHome }: FacilitatorLoginProps) {
  const [email, setEmail] = useState('facilitator@shieldquest.sg');
  const [password, setPassword] = useState('demo-access');
  const [loading, setLoading] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const handleSuccess = onSuccess ?? (() => navigate('/admin'));
  const handleBack = onBackToHome ?? (() => navigate('/'));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleSuccess();
    }, 450);
  };

  const fieldClass =
    'mt-1.5 w-full rounded-[var(--radius-control)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3 text-sm text-[var(--sq-ink)] placeholder:text-[var(--sq-ink-muted)]/60 focus:border-[var(--sq-action)] focus:outline-none focus:ring-1 focus:ring-[var(--sq-action)]';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]';

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[var(--sq-canvas)] font-sans antialiased">
      <header className="border-b border-[var(--sq-line)] bg-[var(--sq-surface)] px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <PortalMark subtitle="Facilitator Portal" />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          >
            Public site
          </Button>
        </div>
      </header>

      <main className="flex-1 px-5 py-10 sm:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[1.05fr_minmax(0,410px)] lg:gap-14">
          {/*
            The explanation sits second on a phone, where the card is what a
            returning facilitator wants under their thumb, and first on a wide
            screen, where it is what a first-time visitor reads.
          */}
          <section className="order-2 lg:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--sq-action-text)]">
              The facilitator portal
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[var(--sq-ink)] sm:text-4xl">
              The half of ShieldQuest that adults run
            </h1>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[var(--sq-ink-muted)]">
              Participants never see this. They scan a code and play — no account, no sign-in, no
              name. This is the other door: where the educator, counsellor or youth worker running
              the session prepares the content, opens the room, and reads what came back.
            </p>

            <ul className="mt-8 space-y-5">
              {INSIDE.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--sq-line)] bg-[var(--sq-surface)] text-[var(--sq-action-text)]"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--sq-ink)]">{title}</p>
                    <p className="mt-1 max-w-[46ch] text-[13px] leading-relaxed text-[var(--sq-ink-muted)]">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[52ch] border-t border-[var(--sq-line)] pt-5 text-[12px] leading-relaxed text-[var(--sq-ink-muted)]">
              Every figure inside the portal is authored demonstration data, labelled as such on the
              panel it appears on. Nothing shown was measured from a real session.
            </p>
          </section>

          <section className="order-1 lg:order-2">
            <div className="rounded-[var(--radius-panel)] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-7 shadow-[var(--sq-shadow-raised)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--sq-action)]/25 bg-[var(--color-civic-50)] text-[var(--sq-action-text)]">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-[var(--sq-ink)]">Sign in</h2>
                  <p className="text-[12px] text-[var(--sq-ink-muted)]">
                    For the person running a session
                  </p>
                </div>
              </div>

              {/*
                The demonstration notice is ABOVE the form, not a footnote under
                the button. A visitor without credentials has to know they can
                get in before they decide the page is a wall — and by the time
                they have read to the bottom of a form, they have already
                decided.
              */}
              <p className="mt-6 rounded-[var(--radius-control)] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/12 p-3.5 text-[12px] leading-relaxed text-[var(--sq-ink)]">
                <strong className="font-bold">Demonstration build — open access.</strong> This is
                the sign-in the funded pilot will need. It checks nothing and locks nothing: the
                details below are already filled in, and the portal is reachable without them.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  {/* Labels are bound with htmlFor/id. They were previously bare
                   * `<label>` elements wrapping nothing, so clicking one did not
                   * focus its field and screen readers announced no name. */}
                  <label htmlFor="facilitator-email" className={labelClass}>
                    Work email
                  </label>
                  <input
                    id="facilitator-email"
                    required
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@school.edu.sg"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="facilitator-password" className={labelClass}>
                      Password
                    </label>
                    {/*
                      Was a `window.alert()`. A browser dialog is the one piece
                      of UI a demonstration cannot style, cannot make accessible
                      and cannot be read past — and it fired on the screen most
                      likely to be someone's first impression of the portal.
                    */}
                    <button
                      type="button"
                      onClick={() => setHintOpen((open) => !open)}
                      aria-expanded={hintOpen}
                      aria-controls="facilitator-signin-hint"
                      className="text-[11px] font-bold text-[var(--sq-action-text)] hover:underline"
                    >
                      Trouble signing in?
                    </button>
                  </div>
                  <input
                    id="facilitator-password"
                    required
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={fieldClass}
                  />
                  {hintOpen && (
                    <p
                      id="facilitator-signin-hint"
                      className="mt-2 rounded-[var(--radius-inset)] bg-[var(--sq-surface-sunk)] p-2.5 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]"
                    >
                      Any values are accepted — there is no account system behind this build. The
                      pre-filled pair is there so nothing has to be invented.
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-4 border-t border-[var(--sq-line)] pt-4 text-center">
                <button
                  type="button"
                  onClick={handleSuccess}
                  className="inline-flex min-h-[36px] items-center gap-1.5 text-[12px] font-bold text-[var(--sq-action-text)] hover:underline"
                >
                  Skip and open the portal
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
                  No account is created, and nothing typed here is sent anywhere.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/*
        Attribution must name only what is actually true. This previously read
        "Ministry of Home Affairs / SPF Delta Challenge", which reads as an
        endorsement by both bodies. Neither has endorsed the product: Project
        SHIELD is a Delta Challenge submission, and the Singapore Police Force
        appears in our material solely as the source of the published crime and
        scam statistics we cite. Implying official backing to the very bodies
        assessing the work is a liability, not a credential.
      */}
      <footer className="border-t border-[var(--sq-line)] px-5 py-4 text-center text-xs text-[var(--sq-ink-muted)]">
        ShieldQuest Facilitator Portal · Project SHIELD · Built by Team SecurePi, Nanyang
        Polytechnic
      </footer>
    </div>
  );
}
