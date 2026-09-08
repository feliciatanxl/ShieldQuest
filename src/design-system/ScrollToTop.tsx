import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Back-to-top control.
 *
 * Mounted ONCE, at the app root, rather than per page. Every long surface here
 * — the landing page, Shield Central, the Guardians grid, the portal's section
 * bodies — scrolls the window rather than an inner container, so one
 * window-level listener covers all of them and there is no per-route mount to
 * forget on the next page someone adds.
 *
 * Three details it has to get right:
 *
 *  - It must not sit on top of the player's bottom tab bar, which is fixed at
 *    the foot of the screen below 700px. The offset clears it, and the safe
 *    area under it on a notched phone.
 *  - It must disappear while a dialog is open, for the same reason the tab bar
 *    does: a floating control layered over a modal is reachable when it should
 *    not be, and covers the modal's own content.
 *  - It respects `prefers-reduced-motion` by jumping instead of animating. A
 *    long smooth scroll is exactly the kind of motion that setting is for.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show it only once there is a meaningful distance to travel back.
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      /*
        Verify the smooth scroll actually started, and jump if it did not.

        `behavior: 'smooth'` is silently a no-op in some environments — it does
        nothing at all in an automated browser, for instance, while
        `behavior: 'auto'` works fine. A back-to-top button that quietly does
        nothing is a worse failure than one that jumps, so if we have not moved
        after a frame or two, take the instant route.
      */
      window.setTimeout(() => {
        if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'auto' });
      }, 250);
    }

    // Send focus to the top of the content, so a keyboard user is not left at
    // the bottom of the document with the button gone from under them.
    const main = document.getElementById('main');
    if (main) {
      // `<main>` is not focusable by default; -1 makes it programmatically
      // focusable without adding it to the tab order.
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className="sq-scroll-top group fixed right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-[var(--sq-line)] bg-[var(--sq-surface)] text-[var(--sq-ink-muted)] shadow-[var(--sq-shadow-float)] transition hover:border-[var(--sq-action)] hover:text-[var(--sq-action-text)] sm:right-6"
    >
      <ArrowUp className="h-5 w-5 transition group-hover:-translate-y-0.5" aria-hidden="true" />
    </button>
  );
}
