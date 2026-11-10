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
    <div className="space-y-24 md:space-y-36 pb-24 overflow-hidden">
      {/* 1. Cinematic Hero Section (Asymmetric 2-column layout on Desktop) */}
      <section className="relative pt-6 sm:pt-10 lg:pt-16" aria-labelledby="hero-title">
        {/* Soft background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-[650px] h-[500px] bg-gradient-to-br from-shield-blue/20 via-shield-cyan/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Eyebrow, Main Headline, Supporting Copy, Dual CTAs, Trust Note */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Tactical Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-shield-navy/90 border border-shield-cardBorder text-xs font-mono font-semibold text-shield-cyan shadow-sm">
                <span className="w-2 h-2 rounded-full bg-shield-cyan animate-pulse" />
                <span>PROJECT SHIELD // YOUTH ADVENTURE SIMULATION</span>
              </div>

              {/* Main Headline */}
              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-[1.08]"
              >
                Every Choice{' '}
                <span className="bg-gradient-to-r from-shield-cyan via-shield-blue to-shield-violet bg-clip-text text-transparent">
                  Shapes Your Story.
                </span>
              </h1>

              {/* Concise Supporting Description */}
              <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed max-w-xl">
                Step into ShieldQuest — a world where quick decisions can have lasting consequences. Explore real-world
                challenges, uncover hidden risks and discover the power of choosing wisely.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/world"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-base shadow-glow-blue transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                >
                  <Compass className="w-5 h-5 text-shield-cyan" />
                  <span>Explore the World</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-shield-navy/80 hover:bg-shield-slate text-shield-cream font-heading font-bold text-base border border-shield-cardBorder transition-all duration-200 hover:border-shield-cyan/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                >
                  <span>How It Works</span>
                </Link>
              </div>

              {/* Educational Purpose & Quick Guardian Lineup Teaser */}
              <div className="pt-4 border-t border-shield-cardBorder/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-shield-muted">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-shield-gold flex-shrink-0" />
                  <span>An educational initiative by Team SecurePi · In Active Development</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-shield-cyan uppercase tracking-wider">
                    6 Guardians Active:
                  </span>
                  <div className="flex -space-x-1">
                    {['#F2B94B', '#A78BFA', '#38D9E6', '#1687F7', '#34D399', '#F472B6'].map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-shield-void"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Cinematic City Art (Visible immediately on desktop!) */}
            <div className="lg:col-span-6 relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 2. What is ShieldQuest? (Visual Storytelling Spread) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="about-intro-title">
        <div className="game-panel p-8 sm:p-12 lg:p-14 border border-shield-cardBorder/80 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Storytelling Text */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-void text-xs font-mono font-semibold text-shield-gold border border-shield-cardBorder">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXPERIENTIAL EDUCATION SANDBOX</span>
              </div>

              <h2 id="about-intro-title" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
                A Safe Digital Sandbox for Real-World Pressures
              </h2>

              <p className="text-base text-shield-cream/90 leading-relaxed">
                Most youths understand intellectually that scams, unauthorized account sharing, and risky dares are wrong.
                Yet real lapses rarely occur in quiet classrooms—they strike during high-pressure social moments when
                friends push, artificial timers countdown, or quick money is promised.
              </p>

              <div className="p-4 rounded-xl bg-shield-void/85 border-l-4 border-shield-cyan text-sm sm:text-base text-shield-cream italic shadow-inner">
                "Experience the consequence. Understand the pressure. Protect someone else."
              </div>

              <p className="text-sm text-shield-muted leading-relaxed">
                ShieldQuest replaces passive lectures with interactive scenarios. In a fictional city simulation,
                players experience the second-order fallout of their decisions, dismantle manipulation tricks, and build
                protective instincts.
              </p>
            </div>

            {/* Visual Narrative Card (Tactical Scenario Dilemma Cue) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-shield-surface to-shield-void border border-shield-cyan/30 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-shield-cardBorder/60 pb-3">
                  <span className="font-mono text-shield-cyan font-bold">PRESSURE SIMULATOR</span>
                  <span className="text-rose-400 font-mono">COUNTDOWN: 00:59</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-shield-gold">
                    Simulated Situation
                  </div>
                  <p className="text-xs text-shield-cream leading-relaxed font-mono">
                    "Hey! Transfer me your 6-digit verification code now so I can lock our tournament team slot before time expires!"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 text-center text-xs font-semibold">
                  <div className="p-2.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30">
                    Instant Reflex: <span className="block text-[11px] font-normal text-rose-400">Account Hijacked</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                    Intentional Pause: <span className="block text-[11px] font-normal text-emerald-400">Class Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Three Pillars (Connected Adventure Stepping Stones) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="pillars-title">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-shield-cyan font-bold block mb-2">
            The Gameplay Trifecta
          </span>
          <h2 id="pillars-title" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
            How ShieldQuest Engages You
          </h2>
          <p className="text-sm text-shield-muted mt-2">
            Three interconnected stages transforming raw knowledge into active protective habits.
          </p>
        </div>
        <PillarCards />
      </section>

      {/* 4. The Delayed Consequence Teaser (Core USP) */}
      <ConsequenceTeaser />

      {/* 5. World Preview (The City Board) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="world-preview-title">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-cyan mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>The City Board</span>
          </div>
          <h2 id="world-preview-title" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight mb-3">
            Explore the Four Districts
          </h2>
          <p className="text-sm sm:text-base text-shield-muted">
            From the bustling hallways of School Street to the digital alleys of Digi-District, each sector mirrors real
            settings where youths navigate digital and social dilemmas.
          </p>
        </div>

        <DistrictMap />
      </section>

      {/* 6. The Guardians Teaser (Character Gallery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="guardians-preview-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-semibold text-shield-gold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Skill Progression</span>
            </div>
            <h2 id="guardians-preview-title" className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
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
        <div className="game-panel p-10 sm:p-14 lg:p-16 border border-shield-blue/50 relative overflow-hidden bg-gradient-to-b from-shield-navy via-shield-void to-shield-void shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-shield-blue/20 via-shield-cyan/15 to-shield-violet/20 rounded-full blur-[120px] pointer-events-none" />

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
