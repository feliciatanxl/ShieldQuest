import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PageControls } from '../components/PageControls';
import { Footer } from '../components/Footer';

export const RootLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-shield-void text-shield-cream selection:bg-shield-gold/40 sq-backdrop">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-shield-cyan text-shield-navy font-bold rounded-lg shadow-xl ring-2 ring-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
      <PageControls />
    </div>
  );
};
