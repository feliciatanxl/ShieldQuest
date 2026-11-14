import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Shield, Sparkles, MapPin } from 'lucide-react';
import { HeroIllustration } from '../components/HeroIllustration';
import { PillarCards } from '../components/PillarCard';
import { ConsequenceTeaser } from '../components/ConsequenceTeaser';
import { GuardianCharacterPortrait } from '../components/GuardianCard';

export const HomePage: React.FC = () => {
  const miniGuardians = [
    { id: 'verifox', name: 'VeriFox', color: '#F59E0B', accent: '#FDE047' },
    { id: 'echo', name: 'Echo', color: '#8B5CF6', accent: '#A78BFA' },
    { id: 'beacon', name: 'Beacon', color: '#06B6D4', accent: '#38D9E6' },
    { id: 'shieldfin', name: 'Shieldfin', color: '#2563EB', accent: '#60A5FA' },
    { id: 'cluepaw', name: 'Cluepaw', color: '#10B981', accent: '#34D399' },
    { id: 'bytebuddy', name: 'ByteBuddy', color: '#EC4899', accent: '#F472B6' },
  ];

  const miniDistricts = [
    { name: 'School Street', color: '#3B82F6' },
    { name: 'Retail District', color: '#F59E0B' },
    { name: 'Digi-District', color: '#06B6D4' },
    { name: 'Community Hub', color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-20 md:space-y-28 pb-20 overflow-hidden">
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
            </div>

            {/* Right: City Artwork */}
            <div className="lg:col-span-6 relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Explore, Decide, Protect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="pillars-title">
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
            Explore diverse city districts and meet the Guardians who guide your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: City Board Teaser */}
          <div className="game-panel-interactive p-8 flex flex-col justify-between group relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-shield-cyan mb-3">
                <MapPin className="w-4 h-4 text-shield-cyan" />
                <span>The City Board</span>
              </div>

              <h3 className="text-2xl font-heading font-black text-shield-cream mb-2 group-hover:text-shield-cyan transition-colors">
                Four districts. Different challenges.
              </h3>

              <p className="text-sm text-shield-cream/90 mb-6">
                From School Street to Digi-District, navigate realistic spaces where youths encounter everyday digital and social choices.
              </p>

              {/* District Pills */}
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {miniDistricts.map((d) => (
                  <div
                    key={d.name}
                    className="p-3 rounded-xl bg-shield-void/80 border border-shield-cardBorder text-xs text-shield-cream font-medium flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                  </div>
                ))}
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
                Unlock transferable protective instincts—from verification to peer protection—through demonstrated reasoning.
              </p>

              {/* Mini Guardian Lineup */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
                {miniGuardians.map((g) => (
                  <div
                    key={g.id}
                    className="p-2 rounded-xl bg-shield-void/80 border border-shield-cardBorder text-center group-hover:scale-105 transition-transform"
                  >
                    <div className="w-10 h-10 mx-auto">
                      <GuardianCharacterPortrait guardianId={g.id} color={g.color} accentColor={g.accent} />
                    </div>
                    <span className="text-[10px] font-mono text-shield-cream block mt-1 truncate">
                      {g.name}
                    </span>
                  </div>
                ))}
              </div>
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
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" aria-labelledby="closing-cta-title">
        <div className="game-panel p-8 sm:p-12 border border-shield-blue/50 relative overflow-hidden bg-gradient-to-b from-shield-navy via-shield-void to-shield-void shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 id="closing-cta-title" className="text-3xl sm:text-4xl font-heading font-black text-shield-cream tracking-tight">
              Your Next Choice Matters.
            </h2>

            <p className="text-base sm:text-lg text-shield-cream/90">
              A new kind of learning adventure is taking shape.
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
