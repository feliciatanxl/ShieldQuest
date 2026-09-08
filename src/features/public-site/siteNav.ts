import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Public-site navigation, declared once.
 *
 * Each link points at a section of the landing page AND a standalone route
 * (deep links that partners can paste into an email or a grant report need to
 * resolve to a real page, not a fragment). Previously the header carried this
 * scroll-or-navigate branch inline, copy-pasted eight times — once per link
 * per breakpoint — so the desktop and mobile menus could drift apart.
 */
export interface SiteNavLink {
  label: string;
  /** Section id on the landing page. */
  hash: string;
  /** Standalone route for deep links. */
  route: string;
}

export const SITE_NAV: SiteNavLink[] = [
  { label: 'How It Works', hash: 'how-it-works', route: '/how-it-works' },
  { label: 'For Schools', hash: 'schools', route: '/for-schools' },
  { label: 'Safety', hash: 'safety', route: '/safety' },
  { label: 'About', hash: 'about', route: '/about' },
];

/**
 * Returns a handler that scrolls when we are already on the landing page and
 * navigates otherwise. Honours `prefers-reduced-motion`: a smooth scroll is
 * motion the user may have asked us not to produce.
 */
export function useSiteNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const onLanding = location.pathname === '/' || location.pathname === '/website';

  const goTo = useCallback(
    (link: SiteNavLink) => {
      if (!onLanding) {
        navigate(link.route);
        return;
      }
      const target = document.getElementById(link.hash);
      if (!target) {
        navigate(link.route);
        return;
      }
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [navigate, onLanding],
  );

  return { goTo, onLanding, navigate, location };
}
