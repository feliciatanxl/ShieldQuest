import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Shield, Sparkles, MapPin } from 'lucide-react';
import { GameplayHero } from '../components/hero3d/GameplayHero';
import { PillarCards } from '../components/PillarCard';
import { ConsequenceTeaser } from '../components/ConsequenceTeaser';
import { GuardianIcon } from '../world/flat/GuardianIcon';
import { guardianById, type GuardianId } from '../world/v2Shared';
import { SHIELD_FRAMEWORK } from '@shieldquest/shared';

export const HomePage: React.FC = () => {
  // Original V2 origami Guardians in S.H.I.E.L.D. order.
  const miniGuardians: { id: GuardianId; letter: string }[] = [
    { id: 'cluepaw', letter: 'S' },
    { id: 'echo', letter: 'H' },
    { id: 'verifox', letter: 'I' },
    { id: 'bytebuddy', letter: 'E' },
    { id: 'beacon', letter: 'L' },
    { id: 'shieldfin', letter: 'D' },
  ];

  const miniDistricts = [
    { name: 'School Street', color: '#3B82F6' },
    { name: 'Retail District', color: '#F59E0B' },
    { name: 'Digi-District', color: '#06B6D4' },
    { name: 'Community Hub', color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-16 overflow-hidden">
      {/* Section 1 — Hero */}
      <section className="relative pt-6 sm:pt-10 lg:pt-12" aria-labelledby="hero-title">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-gradient-to-br from-shield-blue/20 via-shield-cyan/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Headline, Concise Copy, Dual CTAs, In Development pill */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-shield-navy border border-shield-cardBorder text-xs font-mono font-medium text-shield-gold shadow-sm">
                <Sparkles className="w-3 h-3 text-shield-gold animate-pulse" />
                <span>In Development</span>
              </div>

              <h1
                id="hero-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-shield-cream leading-[1.08]"
              >
                Every Choice{' '}
                <span className="bg-gradient-to-r from-shield-cyan via-shield-blue to-shield-violet bg-clip-text text-transparent">
                  Shapes Your Story.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-shield-cream/90 leading-relaxed max-w-xl">
                Explore a city of choices. Uncover hidden risks. Discover what happens next.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  to="/world"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-base shadow-glow-blue transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shield-cyan"
                >
                  <Compass className="w-5 h-5 text-white" />
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
            </div>

            {/* Right: 3D gameplay concept preview (static illustration fallback) */}
            <div className="lg:col-span-6 relative">
              <GameplayHero />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Explore, Decide, Protect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16" aria-labelledby="pillars-title">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 id="pillars-title" className="text-3xl sm:text-4xl font-heading font-black text-shield-cream tracking-tight">
            How ShieldQuest Works
          </h2>
          <p className="text-sm text-shield-muted mt-2">
            Experience the consequence. Understand the pressure. Protect someone else.
          </p>
        </div>
        <PillarCards />
      </section>

      {/* Section 3 — Interactive Consequence Teaser */}
      <ConsequenceTeaser />

      {/* Section 4 — Discover the World */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="discover-title">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 id="discover-title" className="text-3xl sm:text-4xl font-heading font-black text-shield-cream tracking-tight">
            Discover the World
          </h2>
          <p className="text-sm text-shield-muted mt-2">
            Explore the districts and meet the Guardians who join your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: City Board Teaser */}
          <div className="game-panel-interactive p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan mb-3">
                <MapPin className="w-4 h-4 text-shield-cyan" />
                <span>The City Board</span>
              </div>

              <h3 className="text-2xl font-heading font-black text-shield-cream mb-2 group-hover:text-shield-cyan transition-colors">
                Four districts. Different challenges.
              </h3>

              <p className="text-sm text-shield-cream/90 mb-6">
                A Singapore-inspired city to explore. The pilot starts in the Retail District.
              </p>

              {/* District markers */}
              <div className="flex-1 grid grid-cols-2 auto-rows-fr gap-3 mb-8">
                {miniDistricts.map((d) => {
                  const isPilot = d.name === 'Retail District';
                  return (
                    <div
                      key={d.name}
                      className={`p-4 rounded-xl bg-shield-void/80 border text-sm text-shield-cream font-medium flex items-center gap-2 ${
                        isPilot ? 'border-shield-gold/60' : 'border-shield-cardBorder'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: d.color }} aria-hidden="true" />
                      <span className="truncate">{d.name}</span>
                      {isPilot && (
                        <span className="ml-auto text-[9px] font-mono font-bold uppercase rounded bg-shield-gold px-1.5 py-0.5 text-shield-void">
                          Pilot
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/world"
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-shield-cyan hover:text-shield-cream transition-colors group-hover:translate-x-1 duration-200"
            >
              <span>Explore the City</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Guardians Teaser */}
          <div className="game-panel-interactive p-8 flex flex-col justify-between group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-gold mb-3">
                <Shield className="w-4 h-4 text-shield-gold" />
                <span>Skill Guardians</span>
              </div>

              <h3 className="text-2xl font-heading font-black text-shield-cream mb-2 group-hover:text-shield-gold transition-colors">
                Meet your six Guardians.
              </h3>

              <p className="text-sm text-shield-cream/90 mb-6">
                Companions you plan to unlock as your S.H.I.E.L.D. skills grow.
              </p>

              {/* Guardian lineup: original V2 origami art, one per S.H.I.E.L.D. skill */}
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
                {miniGuardians.map((g) => {
                  const art = guardianById(g.id);
                  const step = SHIELD_FRAMEWORK.find((s) => s.letter === g.letter)!;
                  return (
                    <li
                      key={g.id}
                      className="relative flex items-center gap-2.5 rounded-xl border p-2.5 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                      style={{
                        borderColor: `${art.color}40`,
                        background: `linear-gradient(135deg, ${art.color}1f, transparent 70%)`,
                      }}
                    >
                      <div className="relative shrink-0">
                        <GuardianIcon guardian={g.id} level={1} size={44} />
                        <span
                          className="absolute -bottom-1 -right-1 grid place-items-center h-5 w-5 rounded-md text-[11px] font-heading font-black text-shield-void shadow"
                          style={{ backgroundColor: art.color }}
                          aria-hidden="true"
                        >
                          {g.letter}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-heading font-bold text-shield-cream truncate">{art.name}</p>
                        <p className="text-[10px] font-mono uppercase tracking-wide text-shield-muted leading-tight">
                          <span className="sr-only">{g.letter}: </span>
                          {step.title}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link
              to="/guardians"
              className="inline-flex items-center gap-2 text-sm font-heading font-bold text-shield-gold hover:text-shield-cream transition-colors group-hover:translate-x-1 duration-200"
            >
              <span>Meet the Guardians</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 — Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 text-center" aria-labelledby="closing-cta-title">
        <div className="game-panel p-8 sm:p-12 border border-shield-blue/50 relative overflow-hidden bg-gradient-to-b from-shield-navy via-shield-void to-shield-void shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 id="closing-cta-title" className="text-3xl sm:text-4xl font-heading font-black text-shield-cream tracking-tight">
              Your Next Choice Matters.
            </h2>

            <p className="text-base sm:text-lg text-shield-cream/90">
              A cooperative 3D crime-prevention adventure is taking shape.
            </p>

            <div className="pt-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-shield-blue hover:bg-shield-blue/90 text-white font-heading font-bold text-base shadow-glow-blue transition-all hover:scale-105"
              >
                <span>Discover ShieldQuest</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
