import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { BrandMark, Button } from '../../design-system/DesignSystem';

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
 */
export function FacilitatorLogin({ onSuccess, onBackToHome }: FacilitatorLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('facilitator@shieldquest.sg');
  const [password, setPassword] = useState('demo-access');
  const [loading, setLoading] = useState(false);

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
    'mt-1.5 w-full rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-3 text-sm text-[var(--sq-ink)] placeholder:text-[var(--sq-ink-muted)]/60 focus:border-[var(--sq-action)] focus:outline-none focus:ring-1 focus:ring-[var(--sq-action)]';
  const labelClass =
    'block text-xs font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]';

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[var(--sq-canvas)] font-sans antialiased">
      <header className="border-b border-[var(--sq-line)] bg-[var(--sq-surface)] px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandMark subtitle="Facilitator Portal" />
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

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-8 shadow-[var(--sq-shadow-raised)]">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--sq-action)]/25 bg-[var(--color-civic-50)] text-[var(--sq-action-text)]">
                <Lock className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-[var(--sq-ink)]">
                Facilitator sign-in
              </h1>
              <p className="mt-1.5 text-sm text-[var(--sq-ink-muted)]">
                For educators and programme facilitators running a session.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                  <button
                    type="button"
                    onClick={() =>
                      alert('This is a demonstration build — sign in with the pre-filled details.')
                    }
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
              </div>

              <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <p className="rounded-[10px] border border-[var(--sq-line)] bg-[var(--sq-surface-sunk)] p-3.5 text-center text-[11px] leading-relaxed text-[var(--sq-ink-muted)]">
                <strong className="font-bold text-[var(--sq-ink)]">Demonstration build.</strong>{' '}
                Pre-filled with sample credentials. No real account is required, and no participant
                data is stored.
              </p>
            </form>
          </div>
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
        ShieldQuest Facilitator Portal · Project SHIELD · Built by Team SecurePi, Nanyang Polytechnic
      </footer>
    </div>
  );
}
