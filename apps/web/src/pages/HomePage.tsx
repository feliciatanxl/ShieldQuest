import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Shield,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { HeroIllustration } from '../components/HeroIllustration';
import { PillarCards } from '../components/PillarCard';
import { ConsequenceTeaser } from '../components/ConsequenceTeaser';
import { DistrictMap } from '../components/DistrictMap';
import { GuardianCard } from '../components/GuardianCard';
import { SquadPreview } from '../components/SquadPreview';
import { fetchGuardians } from '../services/api';
import { Guardian } from '@shieldquest/shared';

export const HomePage: React.FC = () => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);

  useEffect(() => {
    fetchGuardians().then(setGuardians);
  }, []);

  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 lg:pt-24 overflow-hidden" aria-labelledby="hero-title">
        {/* Soft background ambient gradient lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-shield-blue/15 via-shield-cyan/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            {/* Project Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-semibold text-shield-cyan shadow-sm mb-6 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-shield-cyan animate-pulse" />
              <span>Project SHIELD · Public Web Preview · In Development</span>
            </div>

            {/* Primary Headline */}
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white mb-6 leading-[1.1]"
            >
              Every Choice <span className="bg-gradient-to-r from-shield-cyan via-shield-blue to-shield-violet bg-clip-text text-transparent">Shapes Your Story.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-shield-cream/90 leading-relaxed mb-8 max-w-2xl mx-auto">
              Step into ShieldQuest — a world where quick decisions can have lasting consequences. Explore real-world
              challenges, uncover hidden risks and discover the power of choosing wisely.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/world"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-base shadow-glow-blue transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
              >
                <Compass className="w-5 h-5 text-shield-cyan" />
                <span>Explore the World</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-shield-navy/80 hover:bg-shield-slate text-shield-cream font-heading font-bold text-base border border-shield-cardBorder transition-all duration-200 hover:border-shield-cyan/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
              >
                <span>How It Works</span>
              </Link>
            </div>
          </div>

          {/* Hero Illustration: Interactive City Board Preview */}
          <HeroIllustration />
        </div>
      </section>

      {/* 2. What is ShieldQuest? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="about-intro-title">
        <div className="game-panel p-8 sm:p-12 lg:p-16 border border-shield-cardBorder/80 relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-slate text-xs font-semibold text-shield-gold border border-shield-cardBorder">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Beyond Passive Awareness</span>
            </div>

            <h2 id="about-intro-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              A Safe Digital Sandbox for Real-World Pressures
            </h2>

            <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
              Most youths know that scams, credential sharing, and risky dares are dangerous. But real lapses rarely
              happen during calm classroom lectures—they strike in social, high-pressure moments when friends dare you,
              deadlines flash, or quick money is promised.
            </p>

            <div className="p-4 rounded-xl bg-shield-dark/80 border-l-4 border-shield-cyan text-sm sm:text-base text-shield-cream italic">
              "Experience the consequence. Understand the pressure. Protect someone else."
            </div>

            <p className="text-sm sm:text-base text-shield-muted leading-relaxed">
              ShieldQuest replaces static posters with interactive scenarios. Players test their reactions in a
              fictional urban setting, uncover deceptive social engineering, and learn that immediate reward does not
              equal safety.
            </p>
          </div>
        </div>
      </section>

      {/* 3. The Three Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="pillars-title">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-shield-cyan font-bold block mb-2">
            The Gameplay Trifecta
          </span>
          <h2 id="pillars-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            How ShieldQuest Engages You
          </h2>
        </div>
        <PillarCards />
      </section>

      {/* 4. The Delayed Consequence Teaser (Core USP) */}
      <ConsequenceTeaser />

      {/* 5. World Preview (City Board) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="world-preview-title">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>The City Board</span>
          </div>
          <h2 id="world-preview-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight mb-3">
            Explore the Four Districts
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            From the bustling hallways of School Street to the digital alleys of Digi-District, each sector mirrors real
            settings where youths navigate digital and social dilemmas.
          </p>
        </div>

        <DistrictMap />
      </section>

      {/* 6. The Guardians Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="guardians-preview-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-gold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Skill Progression</span>
            </div>
            <h2 id="guardians-preview-title" className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              Meet the Six Guardians
            </h2>
            <p className="text-sm sm:text-base text-shield-muted max-w-xl mt-2">
              Each Guardian embodies a transferable protective discipline—unlocked through demonstrated reasoning,
              never loot boxes or luck.
            </p>
          </div>

          <Link
            to="/guardians"
            className="inline-flex items-center gap-2 text-sm font-semibold text-shield-cyan hover:text-white transition-colors group"
          >
            <span>View All Guardian Profiles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guardians.slice(0, 3).map((guardian) => (
            <GuardianCard key={guardian.id} guardian={guardian} />
          ))}
        </div>
      </section>

      {/* 7. Peer Shield Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SquadPreview />
      </section>

      {/* 8. Closing CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" aria-labelledby="closing-cta-title">
        <div className="game-panel p-10 sm:p-14 lg:p-16 border border-shield-blue/40 relative overflow-hidden bg-gradient-to-b from-shield-navy via-shield-dark to-shield-dark">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-shield-blue/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-shield-gold font-bold">
              Join the Movement
            </span>

            <h2 id="closing-cta-title" className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight">
              Your Next Choice Matters.
            </h2>

            <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed">
              Discover how ShieldQuest equips young people with the instincts to pause under pressure, deconstruct
              manipulation, and stand up for friends safely.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-base shadow-glow-blue transition-all hover:scale-105"
              >
                <span>Discover ShieldQuest</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-shield-navy hover:bg-shield-slate text-shield-muted hover:text-white font-heading font-semibold text-base border border-shield-cardBorder transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
