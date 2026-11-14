import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-shield-dark border-t border-shield-cardBorder/70 py-10 sm:py-12 text-sm text-shield-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-shield-cardBorder/40">
          {/* LEFT: Logo, Tagline, Developer */}
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-shield-navy border border-shield-cardBorder text-shield-cyan group-hover:text-shield-gold transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-heading font-black tracking-tight text-shield-cream">
                SHIELD<span className="text-shield-cyan">QUEST</span>
              </span>
            </Link>
            <p className="text-xs text-shield-cream/90 font-medium">
              Choose Right. Protect Together.
            </p>
            <p className="text-xs text-shield-muted">
              Developed by SecurePi
            </p>
          </div>

          {/* RIGHT: Essential Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium" aria-label="Footer Navigation">
            <Link to="/" className="text-shield-muted hover:text-shield-cream transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-shield-muted hover:text-shield-cream transition-colors">
              About
            </Link>
            <Link to="/world" className="text-shield-muted hover:text-shield-cream transition-colors">
              The World
            </Link>
            <Link to="/guardians" className="text-shield-muted hover:text-shield-cream transition-colors">
              Guardians
            </Link>
            <Link to="/faq" className="text-shield-muted hover:text-shield-cream transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        {/* BOTTOM: Copyright & Brief Educational Notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-shield-muted/80">
          <p>© 2026 SecurePi. All rights reserved.</p>
          <p className="text-[11px] text-center sm:text-right">
            Independent educational simulation. Scenarios are strictly fictional.
          </p>
        </div>
      </div>
    </footer>
  );
};
