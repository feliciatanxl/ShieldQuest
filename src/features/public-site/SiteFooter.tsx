import { Shield } from 'lucide-react';
import { SITE_NAV, useSiteNavigation } from './siteNav';

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="rounded text-left text-[var(--color-navy-200)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-civic-400)]"
      >
        {children}
      </button>
    </li>
  );
}

export function SiteFooter({
  onPlay,
  onFacilitatorLogin,
}: {
  onPlay: () => void;
  onFacilitatorLogin: () => void;
}) {
  const { navigate } = useSiteNavigation();

  return (
    <footer className="bg-[var(--color-navy-950)] py-12 text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 fill-current text-[var(--color-amber-400)]" />
              <span className="text-lg font-black uppercase tracking-tight text-white">
                Project SHIELD · ShieldQuest
              </span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-[var(--color-navy-200)]">
              An evidence-informed, scenario-based youth crime-prevention and scam-awareness
              platform for schools, youth organisations and community facilitators.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-[var(--color-navy-200)]/70">
              Built by Team SecurePi at Nanyang Polytechnic.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Programme</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {SITE_NAV.map((link) => (
                <FooterLink key={link.route} onClick={() => navigate(link.route)}>
                  {link.label}
                </FooterLink>
              ))}
              <FooterLink onClick={() => navigate('/accessibility')}>Accessibility</FooterLink>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Access</h2>
            <ul className="mt-3 space-y-2 text-xs">
              <FooterLink onClick={onPlay}>Launch the player app</FooterLink>
              <FooterLink onClick={onFacilitatorLogin}>Facilitator portal</FooterLink>
              <FooterLink onClick={() => navigate('/faq')}>Questions</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--color-navy-200)]/70 sm:flex-row sm:items-center">
          <span>© Project SHIELD · Youth crime-prevention learning platform.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Privacy by design</span>
            <span aria-hidden="true">·</span>
            <span>Targeting WCAG 2.1 AA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
