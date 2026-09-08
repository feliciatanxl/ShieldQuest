import { useEffect, useRef, useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import { BrandMark, Button } from '../../design-system/DesignSystem';
import { SITE_NAV, useSiteNavigation } from './siteNav';

/**
 * Public-site header.
 *
 * Two CTAs, deliberately unequal: "Try ShieldQuest" is the primary action for
 * every visitor, and "Facilitator Portal" is secondary because far fewer
 * visitors are facilitators — but the ones who are need to find it without
 * hunting. Both render from one definition at both breakpoints.
 */
export function SiteHeader({
  onPlay,
  onFacilitatorLogin,
}: {
  onPlay: () => void;
  onFacilitatorLogin: () => void;
}) {
  const { goTo, navigate } = useSiteNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the drawer on Escape and on route-level navigation, so it can never
  // be left covering the page it just navigated to.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const handleNav = (index: number) => {
    setMobileOpen(false);
    goTo(SITE_NAV[index]);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center rounded-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)]"
          aria-label="ShieldQuest home"
        >
          <BrandMark subtitle="Project SHIELD · Youth Learning" />
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {SITE_NAV.map((link, index) => (
            <button
              key={link.hash}
              type="button"
              onClick={() => handleNav(index)}
              className="rounded text-sm font-bold text-[var(--sq-ink-muted)] transition hover:text-[var(--sq-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sq-focus)]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <Button variant="secondary" size="sm" onClick={onFacilitatorLogin}>
            Facilitator Portal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onPlay}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            Try ShieldQuest
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--sq-line)] text-[var(--sq-ink)] lg:hidden"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-nav"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="site-mobile-nav"
          ref={panelRef}
          className="border-t border-[var(--sq-line)] bg-[var(--sq-surface)] px-5 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Main">
            {SITE_NAV.map((link, index) => (
              <button
                key={link.hash}
                type="button"
                onClick={() => handleNav(index)}
                className="rounded-[10px] px-3 py-2.5 text-left text-sm font-bold text-[var(--sq-ink)] hover:bg-[var(--sq-surface-sunk)]"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--sq-line)] pt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setMobileOpen(false);
                onFacilitatorLogin();
              }}
            >
              Facilitator Portal
            </Button>
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={() => {
                setMobileOpen(false);
                onPlay();
              }}
            >
              Try ShieldQuest
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
