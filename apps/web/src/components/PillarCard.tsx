import React from 'react';
import { Search, Compass, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Pillar {
  id: string;
  step: string;
  title: string;
  tagline: string;
  color: string;
  accent: string;
  link: string;
  linkText: string;
  icon: React.ReactNode;
}

const pillars: Pillar[] = [
  {
    id: 'explore',
    step: '01',
    title: 'EXPLORE',
    tagline: 'Spot the clues others might miss.',
    color: '#06B6D4',
    accent: '#38D9E6',
    link: '/world',
    linkText: 'Explore the City',
    icon: <Search className="w-6 h-6 text-shield-cyan" />,
  },
  {
    id: 'decide',
    step: '02',
    title: 'DECIDE',
    tagline: 'Make your choice. See what follows.',
    color: '#F59E0B',
    accent: '#FDE047',
    link: '/how-it-works',
    linkText: 'How Decisions Work',
    icon: <Compass className="w-6 h-6 text-shield-gold" />,
  },
  {
    id: 'protect',
    step: '03',
    title: 'PROTECT',
    tagline: 'Learn to protect yourself and others.',
    color: '#2563EB',
    accent: '#60A5FA',
    link: '/guardians',
    linkText: 'Meet the Guardians',
    icon: <ShieldAlert className="w-6 h-6 text-shield-blue" />,
  },
];

export const PillarCards: React.FC = () => {
  return (
    <div className="relative">
      {/* Connected Adventure Trail (Desktop visual connector) */}
      <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 -translate-y-8 bg-gradient-to-r from-cyan-500/30 via-amber-500/30 to-blue-500/30 pointer-events-none border-t border-dashed border-white/20" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="game-panel-interactive p-7 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{ borderTop: `4px solid ${pillar.color}` }}
          >
            {/* Ambient Background Gradient Corner */}
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none"
              style={{ backgroundColor: pillar.color }}
            />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className="p-3 rounded-2xl bg-shield-navy/90 border shadow-md group-hover:scale-105 transition-transform duration-200"
                  style={{ borderColor: `${pillar.color}50` }}
                >
                  {pillar.icon}
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-shield-muted">
                  STEP {pillar.step}
                </span>
              </div>

              <h3 className="text-2xl font-heading font-black text-shield-cream tracking-tight mb-2 group-hover:text-shield-cyan transition-colors">
                {pillar.title}
              </h3>

              <p className="text-base text-shield-cream/90 leading-snug font-medium mb-6">
                {pillar.tagline}
              </p>
            </div>

            <Link
              to={pillar.link}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-shield-cyan hover:text-shield-cream transition-colors group-hover:translate-x-1 duration-200 pt-4 border-t border-shield-cardBorder/40"
            >
              <span>{pillar.linkText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
