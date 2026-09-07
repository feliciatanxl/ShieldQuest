import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Globe,
  Lock,
  Map,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Scenario } from '../types';
import { useSessionStore } from './stores/sessionStore';
import { useCityBoardStore } from './stores/cityBoardStore';
import { CityBoard } from './features/city-board/CityBoard';
import { Guardians } from './features/guardians/Guardians';
import { GuardianEvents } from './features/guardians/GuardianEvents';
import { ScenarioPlayer } from './features/scenarios/ScenarioPlayer';
import { isMissionView } from './features/scenarios/MissionPage';
import { SquadPanel } from './features/squad/SquadPanel';
import { Assessment } from './features/assessment/Assessment';
import { ScenarioPortal } from './features/admin/ScenarioPortal';
import { PwaStatus } from './components/PwaStatus';
import { PublicWebsite } from './features/public-site/PublicWebsite';
import { FacilitatorLogin } from './features/admin/FacilitatorLogin';
import { PlayerOnboardingModal } from './features/onboarding/PlayerOnboardingModal';

type AppMode = 'website' | 'game' | 'facilitator_login' | 'portal';
type GamePage = 'city' | 'squad' | 'guardians' | 'reflection';

const nav = [
  { id: 'city', label: 'City board', icon: Map },
  { id: 'squad', label: 'My squad', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
  { id: 'reflection', label: 'Reflection', icon: BookOpen },
] as const;

export function App() {
  const [mode, setMode] = useState<AppMode>('game');
  const [page, setPage] = useState<GamePage>('city');
  const [mission, setMission] = useState<Scenario | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const cityView = useCityBoardStore((state) => state.view);
  const activeLessonOpen =
    mode === 'game' &&
    page === 'city' &&
    (isMissionView(cityView) ||
      cityView === '/think-vote-explain' ||
      cityView.startsWith('/mini-game/'));

  const { setPreviewCode } = useSessionStore();

  const showPage = (next: GamePage) => {
    if (next === 'city') useCityBoardStore.getState().navigate('/game');
    setPage(next);
  };

  // Sync hash routing for evaluators
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#website' || hash.startsWith('#about') || hash.startsWith('#how-it-works') || hash.startsWith('#framework') || hash.startsWith('#schools') || hash.startsWith('#impact') || hash.startsWith('#safety') || hash.startsWith('#faq')) {
        setMode('website');
      } else if (hash === '#facilitator' || hash === '#admin') {
        setMode('portal');
      } else if (hash === '#login') {
        setMode('facilitator_login');
      } else if (hash === '#play' || hash === '#game') {
        setMode('game');
        setPage('city');
      } else if (hash === '#onboarding') {
        setMode('game');
        setOnboardingOpen(true);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('session')?.toUpperCase();
    if (code && /^[A-Z0-9]{6,8}$/.test(code)) {
      setPreviewCode(code);
      setMode('game');
      setPage('squad');
    }
  }, [setPreviewCode]);

  // First-time visit triggers onboarding once
  useEffect(() => {
    if (mode === 'game' && !localStorage.getItem('sq_onboarded_seen')) {
      setOnboardingOpen(true);
    }
  }, [mode]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('sq_onboarded_seen', 'true');
    setOnboardingOpen(false);
  };

  // If in Facilitator Login Mode
  if (mode === 'facilitator_login') {
    return (
      <FacilitatorLogin
        onSuccess={() => setMode('portal')}
        onBackToHome={() => setMode('website')}
      />
    );
  }

  // If in Facilitator Portal Mode
  if (mode === 'portal') {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Top Evaluator Mode Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-wider text-slate-300">
              Project SHIELD · Prototype Navigation Switcher
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('website')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
            >
              <Globe className="h-3 w-3" />
              <span>Public Site</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('game')}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30"
            >
              <Sparkles className="h-3 w-3" />
              <span>Player PWA</span>
            </button>
          </div>
        </div>
        <ScenarioPortal onReturnToGame={() => setMode('game')} />
      </div>
    );
  }

  // If in Public Website Mode
  if (mode === 'website') {
    return (
      <div>
        {/* Top Evaluator Mode Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-wider text-slate-300">
              Project SHIELD · Prototype Navigation Switcher
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('game')}
              className="inline-flex items-center gap-1 rounded-lg bg-civic-600 px-3 py-1 text-[11px] font-black text-white hover:bg-civic-500"
            >
              <Sparkles className="h-3 w-3" />
              <span>Launch Player PWA</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('portal')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:bg-slate-700"
            >
              <Lock className="h-3 w-3" />
              <span>Facilitator Portal</span>
            </button>
          </div>
        </div>
        <PublicWebsite
          onPlay={() => setMode('game')}
          onFacilitatorLogin={() => setMode('facilitator_login')}
        />
      </div>
    );
  }

  // Standard Mode: Player PWA
  return (
    <div
      className={`app-shell ${page === 'city' || page === 'guardians' ? 'city-shell' : ''} ${activeLessonOpen ? 'mission-shell' : ''}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PwaStatus />

      {/* Top Reviewer Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-navy-950 px-3 py-1.5 text-[11px] text-white/70">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-extrabold uppercase tracking-widest text-white/80">
            Player PWA Mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnboardingOpen(true)}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-white/10"
          >
            Replay Onboarding
          </button>
          <button
            type="button"
            onClick={() => setMode('website')}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
          >
            Public Site
          </button>
          <button
            type="button"
            onClick={() => setMode('portal')}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
          >
            Facilitator Portal
          </button>
        </div>
      </div>

      <header className="header">
        <button className="brand" onClick={() => showPage('city')} aria-label="ShieldQuest home">
          <span className="brand-mark">
            <Shield size={25} fill="currentColor" />
            <span>✦</span>
          </span>
          <span>
            Shield<span className="brand-light">Quest</span>
            <small>YOUR CITY. YOUR CHOICES.</small>
          </span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => showPage(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <button className="join-button" onClick={() => setPage('squad')}>
          <Users size={17} /> Join a squad
          <ArrowUpRight size={15} />
        </button>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="breadcrumb">
          <span>THE SHIELDQUEST ADVENTURE</span>
          <span className="preview-tag">
            <span /> EARLY PREVIEW
          </span>
        </div>
        {page === 'city' ? (
          <CityBoard onMission={setMission} onNavigate={(p) => (p === 'portal' ? setMode('portal') : setPage(p))} />
        ) : page === 'guardians' ? (
          <Guardians onPractice={() => showPage('city')} />
        ) : (
          <>
            <section className="page-heading">
              <div>
                <span className="eyebrow">YOUR SHIELDQUEST JOURNEY</span>
                <h1>
                  {page === 'squad'
                    ? 'Good company. Great choices.'
                    : 'Pause. Think. Grow.'}
                </h1>
                <p>A space to connect, explore and build confidence together.</p>
              </div>
            </section>
            {page === 'squad' && <SquadPanel />}
            {page === 'reflection' && <Assessment />}
          </>
        )}
        <footer className="footer">
          <span>
            <Shield size={14} /> A safer community starts with us.
          </span>
          <button onClick={() => setMode('portal')}>
            For facilitators
            <ChevronRight size={14} />
          </button>
          <span className="footer-version">ShieldQuest · Preview 0.1</span>
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={page === id ? 'active' : ''}
            onClick={() => showPage(id)}
            aria-current={page === id ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {!mission && !activeLessonOpen && <GuardianEvents />}
      {mission && (
        <ScenarioPlayer key={mission.id} scenario={mission} onClose={() => setMission(null)} />
      )}

      {/* 7-Step Player Onboarding Wizard */}
      <PlayerOnboardingModal
        open={onboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
