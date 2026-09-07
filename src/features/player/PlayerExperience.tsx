import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Map,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { Scenario } from '../../../types';
import { useSessionStore } from '../../stores/sessionStore';
import { useCityBoardStore } from '../../stores/cityBoardStore';
import { CityBoard } from '../city-board/CityBoard';
import { Guardians } from '../guardians/Guardians';
import { GuardianEvents } from '../guardians/GuardianEvents';
import { ScenarioPlayer } from '../scenarios/ScenarioPlayer';
import { isMissionView } from '../scenarios/MissionPage';
import { SquadPanel } from '../squad/SquadPanel';
import { Assessment } from '../assessment/Assessment';
import { PwaStatus } from '../../components/PwaStatus';
import { PlayerOnboardingModal } from '../onboarding/PlayerOnboardingModal';

export type GamePage = 'city' | 'squad' | 'guardians' | 'reflection';

const nav = [
  { id: 'city', label: 'City board', icon: Map },
  { id: 'squad', label: 'My squad', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
  { id: 'reflection', label: 'Reflection', icon: BookOpen },
] as const;

export function PlayerExperience({
  initialPage = 'city',
}: {
  initialPage?: GamePage;
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState<GamePage>(initialPage);
  const [mission, setMission] = useState<Scenario | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const cityView = useCityBoardStore((state) => state.view);
  const activeLessonOpen =
    page === 'city' &&
    (isMissionView(cityView) ||
      cityView === '/think-vote-explain' ||
      cityView.startsWith('/mini-game/'));

  const { setPreviewCode } = useSessionStore();

  useEffect(() => {
    if (initialPage) setPage(initialPage);
  }, [initialPage]);

  const showPage = (next: GamePage) => {
    if (next === 'city') useCityBoardStore.getState().navigate('/game');
    setPage(next);
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('session')?.toUpperCase();
    if (code && /^[A-Z0-9]{6,8}$/.test(code)) {
      setPreviewCode(code);
      setPage('squad');
    }
  }, [setPreviewCode]);

  useEffect(() => {
    if (!localStorage.getItem('sq_onboarded_seen')) {
      setOnboardingOpen(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('sq_onboarded_seen', 'true');
    setOnboardingOpen(false);
  };

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
          <Link
            to="/shield-central"
            className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30"
          >
            Shield Central
          </Link>
          <button
            type="button"
            onClick={() => setOnboardingOpen(true)}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-white/10"
          >
            Replay Onboarding
          </button>
          <Link
            to="/"
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
          >
            Public Site
          </Link>
          <Link
            to="/admin"
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
          >
            Facilitator Portal
          </Link>
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
          <Link
            to="/peer-shield"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white"
          >
            Peer Shield
          </Link>
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
          <CityBoard
            onMission={setMission}
            onNavigate={(p) => (p === 'portal' ? navigate('/admin') : setPage(p))}
          />
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
          <Link to="/admin" className="flex items-center gap-1">
            For facilitators
            <ChevronRight size={14} />
          </Link>
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
