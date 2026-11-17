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

/** Brand mark: gold pixel-framed shield tile, shared with the footer. */
export const BrandMark: React.FC<{ small?: boolean }> = ({ small }) => (
  <div
    className={`pixel-frame grid place-items-center bg-[#E8B75D] text-[#17233D] transition-transform duration-200 group-hover:-rotate-6 ${small ? 'h-7 w-7 [--px:3px]' : 'h-9 w-9'}`}
  >
    <Shield className={small ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2.5} />
  </div>
);

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-shield-void/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] sm:h-[76px]">
          {/* Logo & Brand Wordmark */}
          <NavLink to="/" className="flex items-center gap-3.5 group rounded-xl p-1" aria-label="ShieldQuest Home">
            <BrandMark />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-heading font-bold tracking-tight text-shield-cream">
                Shield<span className="text-shield-blue">Quest</span>
              </span>
              <span className="mt-1 text-[10px] font-pixel uppercase tracking-wider text-shield-gold">
                Choose Right. Protect Together.
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Items */}
          <nav
            className="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-2xl border border-shield-cardBorder/70 bg-shield-card/70 p-1"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `px-3 lg:px-3.5 py-1.5 rounded-xl text-sm font-heading font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-shield-blue text-white shadow-[0_2px_0_0_rgb(var(--shield-shadow)/0.35)]'
                      : 'text-shield-muted hover:text-shield-cream hover:bg-shield-surface'
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
              className="inline-flex items-center justify-center p-2 rounded-xl border border-shield-cardBorder bg-shield-card text-shield-cream hover:border-shield-gold"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      <div className="transit-stripe" aria-hidden="true" />

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          // absolute, not fixed: the header's backdrop-filter makes it the containing block for fixed children
          className="md:hidden absolute inset-x-0 top-full h-[calc(100dvh-100%)] bg-shield-void p-5 flex flex-col justify-between overflow-y-auto animate-fadeIn"
        >
          <div className="space-y-2">
            <p className="quest-tag mb-2">Where to next?</p>
            {navItems.map((item, i) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-heading text-lg font-medium border transition-colors ${
                    isActive
                      ? 'bg-shield-blue text-white border-transparent'
                      : 'bg-shield-card text-shield-cream border-shield-cardBorder hover:border-shield-gold'
                  }`
                }
              >
                <span className="font-pixel text-xs opacity-70 w-5" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{item.name}</span>
                <span aria-hidden="true">→</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-6 text-xs text-shield-muted">
            <div className="pixel-divider mb-4" aria-hidden="true" />
            <p>ShieldQuest · Developed by SecurePi</p>
          </div>
        </div>
      )}
    </header>
  );
};
