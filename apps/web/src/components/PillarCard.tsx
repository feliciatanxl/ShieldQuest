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
    color: '#159A9C',
    accent: '#4FC1B9',
    link: '/world',
    linkText: 'Explore the City',
    icon: <Search className="w-7 h-7" aria-hidden="true" />,
  },
  {
    id: 'decide',
    step: '02',
    title: 'DECIDE',
    tagline: 'Make your choice. See what follows.',
    color: '#E0A24A',
    accent: '#E8B75D',
    link: '/how-it-works',
    linkText: 'How Decisions Work',
    icon: <Compass className="w-7 h-7" aria-hidden="true" />,
  },
  {
    id: 'protect',
    step: '03',
    title: 'PROTECT',
    tagline: 'Learn to protect yourself and others.',
    color: '#4E9BD6',
    accent: '#6FB7E8',
    link: '/guardians',
    linkText: 'Meet the Guardians',
    icon: <ShieldAlert className="w-7 h-7" aria-hidden="true" />,
  },
];

export const PillarCards: React.FC = () => {
  return (
    <div className="relative">
      {/* Dotted footpath linking the three chapter markers (desktop) */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-5 left-[16%] right-[16%] h-5 rounded-sm bg-[var(--sg-pave)] border-y-2 border-[var(--sg-pave2)] bg-[linear-gradient(90deg,transparent_23%,#f5f5f0_23%_24.5%,transparent_24.5%_26%,#f5f5f0_26%_27.5%,transparent_27.5%_29%,#f5f5f0_29%_30.5%,transparent_30.5%_69.5%,#f5f5f0_69.5%_71%,transparent_71%_72.5%,#f5f5f0_72.5%_74%,transparent_74%_75.5%,#f5f5f0_75.5%_77%,transparent_77%)]"
      />

      <ol className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 relative z-10">
        {pillars.map((pillar, i) => (
          <li key={pillar.id} className="flex flex-col items-center motion-safe:animate-fadeIn" style={{ animationDelay: `${i * 90}ms` }}>
            {/* Chapter marker */}
            <div
              className="pixel-frame z-10 grid h-14 w-14 place-items-center text-white transition-transform duration-300 motion-safe:hover:-translate-y-1"
              style={{ backgroundColor: pillar.color }}
            >
              {pillar.icon}
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-[5px] border-2 border-white bg-[#1f6b4a] px-2 py-0.5 font-pixel text-[11px] tracking-widest text-white shadow-[0_2px_0_0_rgb(0_0_0/0.25)]">CHAPTER {pillar.step}</span>

            <div
              className="game-panel-interactive mt-4 w-full p-6 sm:p-7 flex flex-col justify-between flex-1 group text-center overflow-hidden"
            >
              {/* Coloured awning stripe, like a shopfront */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-3 rounded-t-[15px]"
                style={{ background: `repeating-linear-gradient(90deg, ${pillar.color} 0 18px, ${pillar.accent} 18px 36px)` }}
              />
              <div className="pt-2">
                <h3 className="text-2xl font-heading font-bold text-shield-cream tracking-wide mb-2">{pillar.title}</h3>
                <p className="text-base text-shield-cream/85 leading-snug font-medium mb-6">{pillar.tagline}</p>
              </div>

              <Link
                to={pillar.link}
                className="inline-flex items-center justify-center gap-2 text-sm font-heading font-semibold text-shield-blue hover:text-shield-cream transition-colors pt-4 border-t-2 border-dashed border-shield-cardBorder/70"
              >
                <span>{pillar.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
