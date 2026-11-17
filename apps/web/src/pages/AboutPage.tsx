import { EstateSkyline } from '../components/sg/Scenery';
import React from 'react';
import { Shield, ArrowRight, Timer, Users, Waves, Map, Vote, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SHIELD_FRAMEWORK } from '@shieldquest/shared';

const letterColors: Record<string, string> = {
  S: '#06B6D4',
  H: '#F59E0B',
  I: '#3B82F6',
  E: '#8B5CF6',
  L: '#10B981',
  D: '#EC4899',
};

const challenges = [
  { icon: Timer, title: 'Split-second pressure', text: 'Risky moments happen fast, in front of friends.' },
  { icon: Users, title: 'Group influence', text: 'Saying no feels harder when everyone is watching.' },
  { icon: Waves, title: 'Hidden fallout', text: 'Consequences often arrive later, not right away.' },
];

const approach = [
  { icon: Map, title: 'Explore a 3D world', text: 'Investigate fictional cases in a stylised low-poly city.' },
  { icon: Vote, title: 'Decide as a squad', text: 'Up to five players think, vote and explain together.' },
  { icon: Sparkles, title: 'See the ripple effect', text: 'Choices lead to immediate and delayed outcomes.' },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="page-intro grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="quest-tag">
            <Shield className="w-3.5 h-3.5" />
            <span>ABOUT SHIELDQUEST</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-shield-cream tracking-tight leading-tight">
            Empowering Youths to Make Safer Choices Together
          </h1>
          <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
            ShieldQuest is a cooperative 3D crime-prevention adventure game in development by SecurePi.
            The initial pilot focuses on shop-theft prevention in a virtual Retail District.
          </p>
        </div>

        {/* SHIELD emblem */}
        <div className="lg:col-span-5" aria-hidden="true">
          <div className="game-panel relative p-6 sm:p-8 overflow-hidden">
            <EstateSkyline className="sg-glow absolute inset-x-0 bottom-0 h-24 w-full opacity-60" />
            <div className="relative grid grid-cols-6 gap-2 sm:gap-3">
              {SHIELD_FRAMEWORK.map((s, i) => (
                <div
                  key={s.letter}
                  className="pixel-frame aspect-square flex items-center justify-center font-pixel text-2xl sm:text-3xl text-white motion-safe:animate-fadeIn"
                  style={{ backgroundColor: letterColors[s.letter], animationDelay: `${i * 80}ms` }}
                >
                  {s.letter}
                </div>
              ))}
            </div>
            <p className="relative mt-5 mb-16 text-center text-xs font-mono uppercase tracking-[0.2em] text-shield-muted">
              Six competencies · one squad
            </p>
          </div>
        </div>
      </div>

      {/* Problem → approach */}
      <section aria-labelledby="why-heading" className="space-y-6">
        <span className="section-kicker" aria-hidden="true">Chapter I</span>
        <h2 id="why-heading" className="!mt-2 text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
          Why Experience Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="notice-board p-3"><div className="notice-paper p-6 space-y-4 h-full">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-shield-gold">The challenge</h3>
            <ul className="space-y-3">
              {challenges.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="p-2 h-fit rounded-lg bg-shield-void border border-shield-cardBorder text-shield-gold">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-sm font-heading text-shield-cream">{title}</strong>
                    <span className="text-sm text-shield-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div></div>
          <div className="game-panel shopfront p-6 !pt-9 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan">The ShieldQuest approach</h3>
            <ul className="space-y-3">
              {approach.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="p-2 h-fit rounded-lg bg-shield-void border border-shield-cardBorder text-shield-cyan">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-sm font-heading text-shield-cream">{title}</strong>
                    <span className="text-sm text-shield-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* S.H.I.E.L.D. */}
      <section className="space-y-6" aria-labelledby="framework-heading">
        <div>
          <span className="section-kicker" aria-hidden="true">Chapter II · The adventurer's guide</span>
          <h2 id="framework-heading" className="mt-2 text-2xl sm:text-3xl font-heading font-black text-shield-cream tracking-tight">
            The S.H.I.E.L.D. Framework
          </h2>
          <p className="text-sm text-shield-muted mt-1">Six distinct competencies, each measured on its own.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHIELD_FRAMEWORK.map((skill) => (
            <div
              key={skill.letter}
              className="game-panel-interactive p-5 pl-6 flex gap-4 bg-[linear-gradient(90deg,rgb(var(--shield-surface))_0_10px,transparent_10px)]"
              style={{ borderLeft: `4px solid ${letterColors[skill.letter]}` }}
            >
              <span
                className="pixel-frame w-11 h-11 flex-shrink-0 flex items-center justify-center font-pixel text-xl text-white"
                style={{ backgroundColor: letterColors[skill.letter] }}
                aria-hidden="true"
              >
                {skill.letter}
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-heading font-bold text-shield-cream">{skill.title}</h3>
                <p className="text-sm text-shield-cream/80 leading-relaxed">{skill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="dialogue-panel p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-heading font-black text-shield-cream">See the framework in action</h3>
          <p className="text-xs text-shield-muted">Follow the player journey from first clue to delayed consequence.</p>
        </div>
        <Link
          to="/how-it-works"
          className="btn-quest flex-shrink-0"
        >
          <span>How It Works</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
