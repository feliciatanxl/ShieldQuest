import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Sparkles } from 'lucide-react';

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

  // Prevent scroll when mobile menu is open
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-shield-dark/85 border-b border-shield-cardBorder/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan rounded-lg p-1"
            aria-label="ShieldQuest Home"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-shield-blue via-shield-cyan/80 to-shield-violet p-0.5 shadow-glow-blue transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-shield-navy rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-shield-cyan transition-colors duration-300 group-hover:text-shield-gold" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-extrabold tracking-tight text-white flex items-center gap-1.5">
                SHIELD<span className="text-shield-cyan">QUEST</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-shield-muted">
                Project SHIELD
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
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan ${
                    isActive
                      ? 'text-white bg-shield-slate/80 border border-shield-cardBorder text-shield-cyan shadow-sm'
                      : 'text-shield-muted hover:text-white hover:bg-shield-navy/60'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / Status Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-medium text-shield-gold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-shield-gold animate-pulse" />
              <span>In Development</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-shield-muted hover:text-white hover:bg-shield-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-shield-dark/95 backdrop-blur-2xl border-t border-shield-cardBorder/60 p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-2">
            <div className="mb-4 pb-3 border-b border-shield-cardBorder/40 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-shield-muted font-medium">Menu Navigation</span>
              <span className="text-xs text-shield-gold bg-shield-navy px-2 py-0.5 rounded border border-shield-cardBorder">
                In Development
              </span>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-shield-blue/20 text-shield-cyan border border-shield-blue/40 font-semibold'
                      : 'text-shield-cream/90 hover:bg-shield-navy/70 hover:text-white'
                  }`
                }
              >
                <span>{item.name}</span>
                <span className="text-xs text-shield-muted">→</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-shield-cardBorder/50 space-y-3">
            <p className="text-xs text-shield-muted leading-relaxed">
              ShieldQuest is an interactive educational adventure game by Team SecurePi from Nanyang Polytechnic.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
