import { useEffect, useState } from 'react';
import { ArrowUp, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export function PageControls() {
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('shieldquest-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('shieldquest-theme', theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 300);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const buttonClass = 'flex h-12 w-12 items-center justify-center rounded-full border border-shield-cardBorder bg-shield-card text-shield-cream shadow-lg hover:text-shield-cyan focus-visible:ring-2 focus-visible:ring-shield-cyan';
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col gap-3" aria-label="Page controls">
      <button type="button" className={buttonClass} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}
      </button>
      <AnimatePresence initial={false}>
      {scrolled && <motion.div
        key="scroll-to-top"
        initial={{ height: 0, opacity: 0, marginTop: -12, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.85 }}
        animate={{ height: 48, opacity: 1, marginTop: 0, y: 0, scale: 1 }}
        exit={{ height: 0, opacity: 0, marginTop: -12, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.9 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      ><motion.button
        whileHover={reduceMotion ? undefined : { y: -3, scale: 1.06 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        type="button" className={buttonClass} aria-label="Scroll to top" title="Scroll to top" onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        document.getElementById('main-content')?.focus({ preventScroll: true });
      }}><ArrowUp size={21} aria-hidden="true" /></motion.button></motion.div>}
      </AnimatePresence>
    </div>
  );
}
