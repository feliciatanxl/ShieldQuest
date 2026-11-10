import React from 'react';
import { Search, Compass, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  accent: string;
  details: string[];
  link: string;
  icon: React.ReactNode;
}

const pillars: Pillar[] = [
  {
    id: 'explore',
    title: 'EXPLORE',
    subtitle: 'Uncover the Hidden Details',
    description:
      'Search through authentic simulated evidence—chat transcripts, spoofed web portals, fake receipts, and permission prompts—to spot anomalies before acting.',
    color: '#38D9E6',
    accent: 'from-cyan-500/20 to-blue-600/10',
    details: [
      'Examine simulated evidence clues',
      'Spot mismatched web domains and spoofed profiles',
      'Distinguish manufactured urgency from real deadlines',
    ],
    link: '/world',
    icon: <Search className="w-8 h-8 text-shield-cyan" />,
  },
  {
    id: 'decide',
    title: 'DECIDE',
    subtitle: 'Experience Branching Stakes',
    description:
      'Confront realistic high-pressure dilemmas where every action leads down distinct paths, revealing how instant short-term gains trigger delayed liabilities.',
    color: '#F2B94B',
    accent: 'from-amber-500/20 to-orange-600/10',
    details: [
      'Multi-branching decision paths',
      'Delayed Consequence Engine tracking',
      'Zero-shaming, constructive learning feedback',
    ],
    link: '/how-it-works',
    icon: <Compass className="w-8 h-8 text-shield-gold" />,
  },
  {
    id: 'protect',
    title: 'PROTECT',
    subtitle: 'Defend Yourself and Your Peers',
    description:
      'True crime prevention is community resilience. Learn how to decline coercive dares gracefully and step in safely to shield friends from manipulation.',
    color: '#1687F7',
    accent: 'from-blue-500/20 to-indigo-600/10',
    details: [
      'Peer Shield bystander intervention',
      'Think–Vote–Explain squad consensus',
      'Six Guardian protective habit disciplines',
    ],
    link: '/guardians',
    icon: <ShieldAlert className="w-8 h-8 text-shield-blue" />,
  },
];

export const PillarCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {pillars.map((pillar) => (
        <div
          key={pillar.id}
          className="game-panel-interactive p-8 flex flex-col justify-between group relative overflow-hidden"
          style={{ borderTop: `4px solid ${pillar.color}` }}
        >
          {/* Subtle gradient glow */}
          <div
            className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl bg-gradient-to-br ${pillar.accent} pointer-events-none group-hover:scale-110 transition-transform duration-500`}
          />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-shield-navy border border-shield-cardBorder shadow-md group-hover:scale-105 transition-transform duration-300">
                {pillar.icon}
              </div>
              <span
                className="text-xs font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-shield-dark border"
                style={{ borderColor: `${pillar.color}40`, color: pillar.color }}
              >
                Pillar
              </span>
            </div>

            <h3 className="text-3xl font-heading font-black text-white tracking-tight mb-1 group-hover:text-shield-cyan transition-colors">
              {pillar.title}
            </h3>
            <p className="text-sm font-semibold text-shield-cream/90 mb-4">
              {pillar.subtitle}
            </p>

            <p className="text-sm text-shield-muted leading-relaxed mb-6">
              {pillar.description}
            </p>

            <ul className="space-y-2.5 pt-4 border-t border-shield-cardBorder/50 mb-8">
              {pillar.details.map((detail) => (
                <li key={detail} className="flex items-center gap-2.5 text-xs text-shield-cream/80">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pillar.color }}
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to={pillar.link}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-shield-cyan transition-colors group-hover:translate-x-1 duration-200"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ))}
    </div>
  );
};
