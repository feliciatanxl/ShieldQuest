import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, AlertCircle, Compass, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050811] border-t border-shield-cardBorder/70 pt-16 pb-12 text-sm text-shield-muted relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-shield-blue/10 via-shield-cyan/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-shield-cardBorder/50">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-shield-navy border border-shield-cardBorder p-1 text-shield-cyan group-hover:text-shield-gold transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-heading font-black tracking-tight text-white block">
                  SHIELD<span className="text-shield-cyan">QUEST</span>
                </span>
                <span className="text-xs font-mono text-shield-gold">Project SHIELD · Team SecurePi</span>
              </div>
            </Link>

            <p className="text-sm text-shield-cream/90 leading-relaxed max-w-md">
              Experience the consequence. Understand the pressure. Protect someone else. An interactive, scenario-based
              adventure game designed to empower youths with critical crime-prevention instincts.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-shield-navy/80 border border-shield-cardBorder text-xs text-shield-cream/90 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-shield-gold" />
              <span>Developed at Nanyang Polytechnic, Singapore</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-shield-cyan" />
              <span>Explore Sectors</span>
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>Home</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>About the Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>How It Works</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
              <li>
                <Link to="/world" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>The City Board</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
              <li>
                <Link to="/guardians" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>The Six Guardians</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-shield-cyan transition-colors flex items-center justify-between group">
                  <span>FAQ & Safety Notice</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-shield-cyan" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Framework */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-4">
              S.H.I.E.L.D. Protocol
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  S
                </span>
                <span>Spot the Risk</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  H
                </span>
                <span>Hold Before Acting</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  I
                </span>
                <span>Identify the Influence</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  E
                </span>
                <span>Evaluate Consequences</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  L
                </span>
                <span>Lead the Right Choice</span>
              </li>
              <li className="flex items-center gap-2 text-shield-cream/90 font-mono">
                <span className="w-5 h-5 rounded bg-shield-surface border border-shield-cardBorder flex items-center justify-center font-bold text-shield-cyan text-[10px]">
                  D
                </span>
                <span>Defend Your Community</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Public Project Disclaimer & Notice */}
        <div className="pt-8 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-shield-void/80 border border-shield-cardBorder/70 flex items-start gap-3.5 text-xs leading-relaxed text-shield-muted shadow-sm">
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

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-shield-muted gap-4 pt-2 font-mono">
            <p>© 2026 Team SecurePi. All rights reserved.</p>
            <p className="flex items-center gap-3">
              <span>Public Preview Version 2.0</span>
              <span>•</span>
              <span>Accessibility First (WCAG 2.2 AA Target)</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
