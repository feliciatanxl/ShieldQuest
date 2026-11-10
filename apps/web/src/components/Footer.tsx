import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-shield-dark/95 border-t border-shield-cardBorder/60 pt-16 pb-12 text-sm text-shield-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-shield-cardBorder/40">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-shield-navy border border-shield-cardBorder p-1 text-shield-cyan group-hover:text-shield-gold transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-heading font-black tracking-tight text-white block">
                  SHIELD<span className="text-shield-cyan">QUEST</span>
                </span>
                <span className="text-xs text-shield-muted">Project SHIELD · Team SecurePi</span>
              </div>
            </Link>

            <p className="text-sm text-shield-muted leading-relaxed max-w-md">
              Experience the consequence. Understand the pressure. Protect someone else. An interactive, scenario-based
              adventure game designed to empower youths with critical crime-prevention instincts.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-shield-navy/60 border border-shield-cardBorder text-xs text-shield-cream/90">
              <Sparkles className="w-3.5 h-3.5 text-shield-gold" />
              <span>Developed at Nanyang Polytechnic, Singapore</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-shield-cyan transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-shield-cyan transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-shield-cyan transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/world" className="hover:text-shield-cyan transition-colors">
                  The City Board
                </Link>
              </li>
              <li>
                <Link to="/guardians" className="hover:text-shield-cyan transition-colors">
                  The Six Guardians
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-shield-cyan transition-colors">
                  FAQ & Safety Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Framework */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Framework</h3>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  S
                </span>
                <span>Spot the Risk</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  H
                </span>
                <span>Hold Before Acting</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  I
                </span>
                <span>Identify the Influence</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  E
                </span>
                <span>Evaluate Consequences</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  L
                </span>
                <span>Lead the Right Choice</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/80">
                <span className="w-5 h-5 rounded bg-shield-slate flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  D
                </span>
                <span>Defend Your Community</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Public Project Disclaimer & Notice */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-shield-navy/40 border border-shield-cardBorder/50 flex items-start gap-3 text-xs leading-relaxed text-shield-muted">
            <AlertCircle className="w-4 h-4 text-shield-gold flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-shield-cream font-medium">Independent Educational Project Notice: </strong>
              ShieldQuest is an independent student educational project developed by Team SecurePi from Nanyang
              Polytechnic. It is not an official product or service of the Singapore Police Force (SPF), the National
              Crime Prevention Council (NCPC), the National Youth Council (NYC), or any Government agency. All scenarios,
              phone numbers, organisations, and web links featured are strictly fictional for simulation purposes. For
              actual emergencies or crime reports, please contact official national emergency hotlines or ScamShield.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-shield-muted gap-4">
            <p>© 2026 Team SecurePi. All rights reserved.</p>
            <p className="flex items-center gap-3">
              <span>Public Preview Version 1.0</span>
              <span>•</span>
              <span>Accessibility First (WCAG 2.2 AA Target)</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
