import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Shield, Sparkles, MapPin } from 'lucide-react';
// 3D hero kept in components/hero3d as a backup; homepage now previews the 2D neighbourhood.
import { NeighbourhoodHero } from '../components/NeighbourhoodHero';
import { PillarCards } from '../components/PillarCard';
import { ConsequenceTeaser } from '../components/ConsequenceTeaser';
import { GuardianIcon } from '../world/flat/GuardianIcon';
import { guardianById, type GuardianId } from '../world/v2Shared';
import { SHIELD_FRAMEWORK } from '@shieldquest/shared';
import { DistrictScene, EstateSkyline } from '../components/sg/Scenery';

/** Small pixel cloud, purely decorative. */
const PixelCloud: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden="true" viewBox="0 0 16 6" shapeRendering="crispEdges" className={`pointer-events-none absolute fill-shield-cardBorder/40 ${className}`}>
    <path d="M4 0h4v1h2v1h3v1h1v3H0V3h1V2h3z" />
  </svg>
);

/** Section heading shared by the homepage sections. */
const SectionHeading: React.FC<{ id: string; kicker: string; title: string; sub: string }> = ({ id, kicker, title, sub }) => (
  <div className="text-center max-w-xl mx-auto mb-12">
    <span className="section-kicker" aria-hidden="true">{kicker}</span>
    <h2 id={id} className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-shield-cream tracking-tight">{title}</h2>
    <p className="text-base text-shield-muted mt-2">{sub}</p>
  </div>
);

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
    { id: 'school-street', name: 'School Street', color: '#4E9BD6' },
    { id: 'retail-district', name: 'Retail District', color: '#E0A24A' },
    { id: 'digi-district', name: 'Digi-District', color: '#159A9C' },
    { id: 'community-hub', name: 'Community Hub', color: '#9A86D6' },
  ];

  return (
    <div className="pb-8 overflow-hidden">
      {/* Section 1 — Hero */}
      <section className="relative pt-10 sm:pt-14 lg:pt-16 pb-24 sm:pb-32" aria-labelledby="hero-title">
        <PixelCloud className="w-40 top-6 left-[8%] motion-safe:animate-bob" />
        <PixelCloud className="w-24 top-24 right-[6%] motion-safe:animate-bob [animation-delay:1.2s]" />
        {/* Estate backdrop: HDB blocks and rain trees behind the hero, fading into the page */}
        <EstateSkyline className="sg-glow absolute inset-x-0 bottom-0 h-28 sm:h-36 w-full opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left: Headline, Concise Copy, Dual CTAs, In Development pill */}
            <div className="lg:col-span-5 space-y-6 text-left motion-safe:animate-fadeIn">
              <div className="quest-tag">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                <span>In Development</span>
              </div>

              <h1 id="hero-title" className="text-[2.6rem] sm:text-6xl lg:text-[3.6rem] xl:text-[4.25rem] font-heading font-bold tracking-tight text-shield-cream leading-[1.02]">
                Every Choice{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-shield-cyan via-shield-blue to-shield-violet bg-clip-text text-transparent">Shapes Your Story.</span>
                  {/* pixel underline */}
                  <span aria-hidden="true" className="absolute -bottom-1 left-0 h-1.5 w-full bg-[repeating-linear-gradient(90deg,rgb(var(--shield-gold))_0_8px,transparent_8px_12px)]" />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-shield-cream/85 leading-relaxed max-w-lg">
                Explore a city of choices. Uncover hidden risks. Discover what happens next.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link to="/world" className="btn-quest">
                  <Compass className="w-5 h-5" aria-hidden="true" />
                  <span>Explore the World</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link to="/how-it-works" className="btn-ghost">
                  <span>How It Works</span>
                </Link>
              </div>
            </div>

            {/* Right: live 2D neighbourhood preview (static image fallback) */}
            <div className="lg:col-span-7 relative motion-safe:animate-fadeIn [animation-delay:120ms]">
              <NeighbourhoodHero />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Explore, Decide, Protect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24" aria-labelledby="pillars-title">
        <SectionHeading
          id="pillars-title"
          kicker="Your journey"
          title="How ShieldQuest Works"
          sub="Experience the consequence. Understand the pressure. Protect someone else."
        />
        <PillarCards />
      </section>

      {/* Section 3 — Interactive Consequence Teaser */}
      <ConsequenceTeaser />

      {/* Section 4 — Discover the World */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-16 md:pb-24" aria-labelledby="discover-title">
        <SectionHeading
          id="discover-title"
          kicker="The map"
          title="Discover the World"
          sub="Explore the districts and meet the Guardians who join your journey."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: City Board Teaser — styled as a district select screen */}
          <div className="game-panel p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="quest-tag self-start mb-4 !text-shield-blue !bg-shield-blue/10 !border-shield-blue/30">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>The City Board</span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-shield-cream mb-2">Four districts. Different challenges.</h3>
              <p className="text-base text-shield-cream/85 mb-6">
                A Singapore-inspired city to explore. The pilot starts in the Retail District.
              </p>

              {/* District plots: coloured roof strip + location pin, pilot highlighted */}
              <div className="flex-1 grid grid-cols-2 auto-rows-fr gap-4 mb-8">
                {miniDistricts.map((d) => {
                  const isPilot = d.name === 'Retail District';
                  return (
                    <div
                      key={d.name}
                      className={`relative overflow-hidden rounded-lg border-2 bg-shield-card pb-3 px-3 text-sm font-heading font-medium text-shield-cream flex flex-wrap items-center gap-2 transition-transform duration-200 motion-safe:hover:-translate-y-0.5 ${
                        isPilot ? 'border-shield-gold shadow-[0_3px_0_0_rgb(var(--shield-gold)/0.6)]' : 'border-shield-cardBorder'
                      }`}
                    >
                      <DistrictScene
                        id={d.id}
                        className={`-mx-3 mb-1 block h-20 sm:h-24 w-[calc(100%+1.5rem)] border-b-2 ${isPilot ? '' : 'grayscale-[60%] opacity-75'}`}
                        style={{ borderColor: d.color }}
                      />
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isPilot ? 'motion-safe:animate-bob' : ''}`} style={{ color: d.color }} aria-hidden="true" />
                      <span className="truncate">{d.name}</span>
                      {isPilot && (
                        <span className="ml-auto font-pixel text-[10px] uppercase rounded bg-[#E8B75D] px-1.5 py-0.5 text-[#17233D]">Pilot</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Link to="/world" className="inline-flex items-center gap-2 text-base font-heading font-semibold text-shield-blue hover:text-shield-cream transition-colors">
              <span>Explore the City</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {/* Card 2: Guardians Teaser — collectible card row */}
          <div className="game-panel p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="quest-tag mb-4">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Skill Guardians</span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-shield-cream mb-2">Meet your six Guardians.</h3>
              <p className="text-base text-shield-cream/85 mb-6">Companions you plan to unlock as your S.H.I.E.L.D. skills grow.</p>

              {/* Guardian lineup: original V2 origami art, one per S.H.I.E.L.D. skill */}
              <ul className="flex-1 grid grid-cols-2 sm:grid-cols-3 auto-rows-fr gap-3 mb-8">
                {miniGuardians.map((g, i) => {
                  const art = guardianById(g.id);
                  const step = SHIELD_FRAMEWORK.find((s) => s.letter === g.letter)!;
                  return (
                    <li
                      key={g.id}
                      className="relative flex flex-col items-center justify-center text-center rounded-xl border-2 bg-shield-card px-2 pt-3 pb-2.5 transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:-rotate-1"
                      style={{ borderColor: `${art.color}66`, boxShadow: `0 3px 0 0 ${art.color}55` }}
                    >
                      <span className="absolute left-2 top-1.5 font-pixel text-[10px] text-shield-muted" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="relative rounded-full p-1" style={{ background: `radial-gradient(circle, ${art.color}33, transparent 70%)` }}>
                        <GuardianIcon guardian={g.id} level={1} size={48} />
                        <span
                          className="absolute -bottom-0.5 -right-1 grid place-items-center h-5 w-5 rounded text-[11px] font-pixel text-[#17233D] shadow"
                          style={{ backgroundColor: art.color }}
                          aria-hidden="true"
                        >
                          {g.letter}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-heading font-semibold text-shield-cream truncate max-w-full">{art.name}</p>
                      <p className="text-[10px] font-pixel uppercase tracking-wide text-shield-muted leading-tight">
                        <span className="sr-only">{g.letter}: </span>
                        {step.title}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link to="/guardians" className="inline-flex items-center gap-2 text-base font-heading font-semibold text-shield-gold hover:text-shield-cream transition-colors">
              <span>Meet the Guardians</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 — Final CTA: dusk over the estate */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center" aria-labelledby="closing-cta-title">
        <div className="relative overflow-hidden rounded-[20px] border-[3px] border-shield-cream/85 px-6 pt-12 pb-28 sm:px-12 sm:pt-16 sm:pb-36 bg-gradient-to-b from-[#2a3f6b] via-[#5a5f93] to-[#e7a283] shadow-cozy">
          {/* Pixel stars */}
          <div aria-hidden="true" className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_1px_1px,#fff9ef_1px,transparent_0)] bg-[length:46px_38px] [mask-image:linear-gradient(#000,transparent_55%)]" />
          {/* HDB skyline with lit windows */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 sm:gap-3 px-4">
            {[70, 110, 86, 130, 64, 100, 78].map((h, i) => (
              <div
                key={i}
                className="w-12 sm:w-20 rounded-t-sm bg-[#17233D] bg-[radial-gradient(#e8b75d_2px,transparent_2.5px)] bg-[length:12px_14px] bg-[position:2px_6px]"
                style={{ height: h }}
              />
            ))}
          </div>
          <PixelCloud className="w-32 top-8 left-6 !fill-white/20 motion-safe:animate-bob" />

          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="quest-tag !text-[#fff9ef] !bg-white/10 !border-white/40">Next chapter</span>
            <h2 id="closing-cta-title" className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
              Your Next Choice Matters.
            </h2>
            <p className="text-base sm:text-lg text-white/90">A cooperative 3D crime-prevention adventure is taking shape.</p>
            <div className="pt-3">
              <Link to="/about" className="btn-quest !bg-[#E8B75D] !text-[#17233D] px-8">
                <span>Discover ShieldQuest</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
