import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'The World', href: '/world' },
  { name: 'Guardians', href: '/guardians' },
  { name: 'FAQ', href: '/faq' },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-shield-void/90 border-b border-shield-cardBorder/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Brand Wordmark */}
          <NavLink
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan rounded-xl p-1"
            aria-label="ShieldQuest Home"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-shield-blue to-shield-cyan p-0.5 shadow-glow-blue transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-shield-void rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-shield-cyan transition-colors group-hover:text-shield-gold" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-tight text-shield-cream flex items-center">
                SHIELD<span className="text-shield-cyan">QUEST</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-shield-gold/90 font-medium">
                Choose Right. Protect Together.
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                    isActive
                      ? 'text-shield-cream bg-shield-surface border border-shield-cyan/50 font-semibold'
                      : 'text-shield-muted hover:text-shield-cream hover:bg-shield-navy/60'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-shield-muted hover:text-shield-cream hover:bg-shield-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-x-0 top-18 bottom-0 bg-shield-void/98 backdrop-blur-2xl border-t border-shield-cardBorder/70 p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-shield-blue/20 text-shield-cyan border border-shield-blue/50 font-bold'
                      : 'text-shield-cream/90 hover:bg-shield-navy/70 hover:text-shield-cream'
                  }`
                }
              >
                <span>{item.name}</span>
                <span className="text-xs text-shield-muted">→</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-6 border-t border-shield-cardBorder/60 text-xs text-shield-muted">
            <p>ShieldQuest · Developed by Team SecurePi</p>
          </div>
        </div>
      )}
    </header>
  );
};
