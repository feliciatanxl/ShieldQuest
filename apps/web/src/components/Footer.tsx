import React from 'react';
import { Link } from 'react-router-dom';
import { BrandMark } from './Navbar';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/world', label: 'The World' },
  { to: '/guardians', label: 'Guardians' },
  { to: '/faq', label: 'FAQ' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 w-full bg-shield-dark text-sm text-shield-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8">
          {/* LEFT: Logo, Tagline, Developer */}
          <div className="space-y-2.5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <BrandMark small />
              <span className="text-lg font-heading font-bold tracking-tight text-shield-cream">
                Shield<span className="text-shield-blue">Quest</span>
              </span>
            </Link>
            <p className="!mt-4 text-sm text-shield-cream/90 font-semibold">Choose Right. Protect Together.</p>
          </div>

          {/* RIGHT: Essential Navigation Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-heading font-medium" aria-label="Footer Navigation">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="group inline-flex items-center gap-1.5 text-shield-muted hover:text-shield-cream transition-colors">
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-shield-gold opacity-0 transition-opacity group-hover:opacity-100" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pixel-divider" aria-hidden="true" />

        {/* BOTTOM: Copyright & Brief Educational Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-shield-muted">
          <p>© 2026 SecurePi. All rights reserved.</p>
          <p className="text-[11px] text-center sm:text-right">Independent educational simulation. Scenarios are strictly fictional.</p>
        </div>
      </div>
    </footer>
  );
};
