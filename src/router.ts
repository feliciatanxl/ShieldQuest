import { useSyncExternalStore } from 'react';

/**
 * A two-surface router.
 *
 * ShieldQuest has two audiences and two front doors:
 *
 *   `/`      the public site — educators, schools, youth partners and grant
 *            assessors. Light "civic" skin.
 *   `/play`  the player app — youths aged 10–24, arriving from a QR code.
 *            Dark "game" skin.
 *
 * That is the whole route table, so it does not get a routing library. A router
 * would be ~20KB gzipped on a product that commits to low-bandwidth access in
 * school halls, to decide between two branches. When the facilitator portal is
 * ported across from v1 and the table grows past a handful of routes, swap this
 * out — the surface it exposes (`usePath`, `navigate`, `Link`) is deliberately
 * the shape of one, so the call sites will not have to change.
 *
 * Note the hosting requirement this creates: every path must serve
 * `index.html`. Vite's dev server does it by default, the service worker does
 * it offline, and `vercel.json` does it in production.
 */

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current path, re-rendering the tree when it changes. */
export function usePath(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  );
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const [path, hash] = to.split('#');
  const target = path || window.location.pathname;

  if (target !== window.location.pathname) {
    window.history[options.replace ? 'replaceState' : 'pushState']({}, '', to);
    emit();
    // A new page starts at the top. Without this, following a link from
    // halfway down the landing page lands you halfway down the next one.
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  if (hash) scrollToSection(hash);
}

/**
 * Scroll to a section of the current page, honouring the motion preference.
 *
 * A smooth scroll is motion, and someone who has asked their device for less of
 * it has asked for less of this too.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // Move focus as well as the viewport: a scroll that the keyboard does not
  // follow leaves a keyboard user exactly where they were.
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/** True when `path` is the player app rather than the public site. */
export const isPlayerRoute = (path: string) => path === '/play' || path.startsWith('/play/');
