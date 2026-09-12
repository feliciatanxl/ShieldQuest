import { useEffect, useState } from 'react';
import { Menu, Shield, X } from 'lucide-react';

import { navigate, scrollToSection } from '../router.ts';
import { EnquiryDialog } from './EnquiryDialog.tsx';
import { Faq, ForSchools, Safety, ClosingCta } from './DeliverySections.tsx';
import { Framework, Hero, LearningLoop, Scenarios, WhyNow } from './ProgrammeSections.tsx';
import { SiteButton, SiteLink } from './parts.tsx';

/**
 * The public site.
 *
 * One page, because there is one story to tell and a school reader tells you
 * they evaluate it in a single scroll: what it is, why now, how it works, what
 * the missions look like, what running it costs them, and whether it is safe.
 * The nav links are in-page anchors rather than routes for the same reason — a
 * partner pasting `#safety` into an email should land on the section, in
 * context, not on an orphaned page.
 */

const NAV = [
  { label: 'How it works', id: 'how-it-works' },
  { label: 'The missions', id: 'scenarios' },
  { label: 'For schools', id: 'schools' },
  { label: 'Safety', id: 'safety' },
  { label: 'Questions', id: 'faq' },
];

function SiteHeader({ onEnquiry }: { onEnquiry: () => void }) {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape, and whenever the viewport grows enough
  // that the desktop nav is showing instead.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <SiteLink to="/" className="flex shrink-0 items-center gap-2">
          <Shield className="h-6 w-6 fill-current text-[var(--sq-earned)]" aria-hidden="true" />
          <span className="text-base font-black uppercase tracking-tight text-[var(--sq-ink)]">
            ShieldQuest
          </span>
        </SiteLink>

        <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-bold text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-sunk)] hover:text-[var(--sq-ink)]"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* Wrapped rather than given `hidden sm:inline-flex` directly: the
              button's own base class sets `inline-flex`, and Tailwind orders
              display utilities by group rather than by the order they are
              written, so the base class won and the button showed at every
              width — three words wrapped onto three lines on a phone. */}
          <span className="hidden sm:block">
            <SiteButton variant="secondary" className="px-3.5 py-2" onClick={onEnquiry}>
              Request a session
            </SiteButton>
          </span>
          <SiteButton className="whitespace-nowrap px-3.5 py-2" onClick={() => navigate('/play')}>
            Try it
          </SiteButton>
          <button
            type="button"
            className="rounded-[var(--radius-control)] p-2 text-[var(--sq-ink)] lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-menu"
          aria-label="Sections"
          className="border-t border-[var(--sq-line)] bg-[var(--sq-surface)] px-5 py-3 lg:hidden"
        >
          <ul className="space-y-1">
            {NAV.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  className="w-full rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm font-bold text-[var(--sq-ink)] hover:bg-[var(--sq-surface-sunk)]"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEnquiry();
                }}
                className="w-full rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm font-bold text-[var(--sq-action-text)] hover:bg-[var(--sq-surface-sunk)]"
              >
                Request a session
              </button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter({ onEnquiry }: { onEnquiry: () => void }) {
  return (
    <footer className="bg-[var(--color-navy-950)] py-12 text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Shield
                className="h-5 w-5 fill-current text-[var(--color-amber-400)]"
                aria-hidden="true"
              />
              <span className="text-lg font-black uppercase tracking-tight text-white">
                Project SHIELD · ShieldQuest
              </span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-[var(--color-navy-200)]">
              An evidence-informed, scenario-based youth crime-prevention and scam-awareness
              platform for schools, youth organisations and community facilitators.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-[var(--color-navy-200)] opacity-70">
              Built by Team SecurePi — Felicia Tan and Charlisa Tan — at Nanyang Polytechnic.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Sections</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {NAV.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-left text-[var(--color-navy-200)] transition hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Access</h2>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <SiteLink
                  to="/play"
                  className="text-[var(--color-navy-200)] transition hover:text-white"
                >
                  Launch the player app
                </SiteLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onEnquiry}
                  className="text-left text-[var(--color-navy-200)] transition hover:text-white"
                >
                  Request a session
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* The attribution line. The SPF is a STATISTICS SOURCE, not a backer,
            and Delta Challenge is a competition this was submitted to. Neither
            endorses the project, and this is the line that says so. */}
        <p className="mt-10 border-t border-white/10 pt-6 text-[11px] leading-relaxed text-[var(--color-navy-200)] opacity-70">
          Figures on this page are drawn from the Singapore Police Force Annual Crime Brief 2025 and
          Annual Scam and Cybercrime Brief 2025, cited as published statistics. ShieldQuest is a
          student project and is not endorsed by, affiliated with, or produced on behalf of any
          government agency. Every scenario in the game is fictional.
        </p>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-[var(--color-navy-200)] opacity-70 sm:flex-row sm:items-center">
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

export default function PublicSite() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const openEnquiry = () => setEnquiryOpen(true);
  const play = () => navigate('/play');

  // A link pasted with a fragment should land on that section, once the page
  // below it has actually rendered.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = requestAnimationFrame(() => scrollToSection(hash));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--sq-surface)] text-[var(--sq-ink)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-[var(--sq-action)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader onEnquiry={openEnquiry} />

      <main id="main">
        <Hero onPlay={play} onEnquiry={openEnquiry} />
        <WhyNow />
        <LearningLoop />
        <Framework />
        <Scenarios />
        <ForSchools onEnquiry={openEnquiry} />
        <Safety />
        <Faq />
        <ClosingCta onPlay={play} onEnquiry={openEnquiry} />
      </main>

      <SiteFooter onEnquiry={openEnquiry} />

      <EnquiryDialog open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </div>
  );
}
