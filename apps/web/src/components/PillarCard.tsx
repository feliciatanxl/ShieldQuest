import React from 'react';
import { Search, Compass, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Pillar {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  accent: string;
  badge: string;
  details: string[];
  link: string;
  icon: React.ReactNode;
}

const pillars: Pillar[] = [
  {
    id: 'explore',
    step: 'STAGE 01',
    title: 'EXPLORE',
    subtitle: 'Uncover the Hidden Details',
    description:
      'Search through simulated evidence clues—chat transcripts, spoofed web portals, fake transaction receipts, and device permission prompts—to spot subtle anomalies before taking action.',
    color: '#06B6D4',
    accent: '#38D9E6',
    badge: 'Investigation',
    details: [
      'Examine simulated evidence clues',
      'Spot mismatched web domains and spoofed profiles',
      'Distinguish manufactured urgency from real deadlines',
    ],
    link: '/world',
    icon: <Search className="w-7 h-7 text-shield-cyan" />,
  },
  {
    id: 'decide',
    step: 'STAGE 02',
    title: 'DECIDE',
    subtitle: 'Experience Branching Stakes',
    description:
      'Confront realistic high-pressure dilemmas where every choice leads down distinct paths, demonstrating how instant short-term relief can produce delayed consequences.',
    color: '#F59E0B',
    accent: '#FDE047',
    badge: 'Decision-Making',
    details: [
      'Multi-branching decision paths',
      'Delayed Consequence Engine tracking',
      'Zero-shaming, constructive learning feedback',
    ],
    link: '/how-it-works',
    icon: <Compass className="w-7 h-7 text-shield-gold" />,
  },
  {
    id: 'protect',
    step: 'STAGE 03',
    title: 'PROTECT',
    subtitle: 'Defend Yourself and Your Peers',
    description:
      'Crime prevention is community resilience. Learn how to decline coercive dares gracefully and step in safely to shield friends from manipulation through bystander action.',
    color: '#2563EB',
    accent: '#60A5FA',
    badge: 'Peer Resilience',
    details: [
      'Peer Shield bystander intervention',
      'Think–Vote–Explain squad consensus',
      'Six Guardian protective habit disciplines',
    ],
    link: '/guardians',
    icon: <ShieldAlert className="w-7 h-7 text-shield-blue" />,
  },
];

export const PillarCards: React.FC = () => {
  return (
    <div className="relative">
      {/* Connected Adventure Trail (Desktop visual connector) */}
      <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 -translate-y-12 bg-gradient-to-r from-cyan-500/40 via-amber-500/40 to-blue-500/40 pointer-events-none border-t border-dashed border-white/20" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="game-panel-interactive p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{ borderTop: `4px solid ${pillar.color}` }}
          >
            {/* Ambient Background Gradient Corner */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
              style={{ backgroundColor: pillar.color }}
            />

            <div>
              {/* Pillar Step Header */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className="p-3.5 rounded-2xl bg-shield-navy/90 border shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ borderColor: `${pillar.color}50` }}
                >
                  {pillar.icon}
                </div>

                <div className="text-right">
                  <span
                    className="text-[11px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded border shadow-sm block mb-1"
                    style={{
                      color: pillar.accent,
                      backgroundColor: `${pillar.color}18`,
                      borderColor: `${pillar.color}40`,
                    }}
                  >
                    {pillar.step}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-shield-muted">
                    {pillar.badge}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-3xl font-heading font-black text-white tracking-tight mb-1 group-hover:text-shield-cyan transition-colors">
                {pillar.title}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-shield-gold mb-3">
                {pillar.subtitle}
              </p>

              <p className="text-sm text-shield-cream/90 leading-relaxed mb-6">
                {pillar.description}
              </p>

              {/* Core Learning Milestones */}
              <ul className="space-y-2.5 pt-4 border-t border-shield-cardBorder/50 mb-8">
                {pillar.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5 text-xs text-shield-cream/80">
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: pillar.accent }}
                    />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Link */}
            <Link
              to={pillar.link}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-shield-cyan transition-colors group-hover:translate-x-1 duration-200 pt-2 border-t border-shield-cardBorder/30"
            >
              <span>Explore {pillar.title} Mode</span>
              <ArrowRight className="w-3.5 h-3.5 text-shield-cyan" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
