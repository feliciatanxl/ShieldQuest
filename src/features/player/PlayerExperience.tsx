import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
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
import { BrandMark } from '../../design-system/BrandMark';

export type GamePage = 'city' | 'squad' | 'guardians' | 'reflection';

const nav = [
  { id: 'city', label: 'City board', icon: Map },
  { id: 'squad', label: 'My squad', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
  { id: 'reflection', label: 'Reflection', icon: BookOpen },
] as const;

export function PlayerExperience({ initialPage = 'city' }: { initialPage?: GamePage }) {
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

  const handleCompleteOnboarding = () => {
    localStorage.setItem('sq_onboarded_seen', 'true');
    setOnboardingOpen(false);
  };

  return (
    <div
      // The player PWA is the one surface on the dark "game" skin. Setting it
      // here means every component below — including the shared design-system
      // primitives and the legacy shell CSS — resolves its colours from the
      // game ramps instead of the light civic ones, with no per-component
      // branching. The public site and facilitator portal never set this.
      data-skin="game"
      className={`app-shell ${page === 'city' ? 'city-shell' : ''} ${activeLessonOpen ? 'mission-shell' : ''}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PwaStatus />



      <header className="header">
        <button className="brand" onClick={() => showPage('city')} aria-label="ShieldQuest home">
          <BrandMark size="sm" subtitle="Your city. Your choices." />
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? 'active' : ''}
              onClick={() => showPage(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
          {/* Teal is the Peer Shield colour throughout the product (--sq-peer),
            * so this link matches the mode it opens. It was `rose`, which is
            * the risk colour — the opposite signal. */}
          <Link
            to="/peer-shield"
            className="flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-xs font-bold text-[var(--sq-peer)] transition hover:bg-[var(--sq-surface-sunk)]"
          >
            <ShieldCheck size={16} />
            Peer Shield
          </Link>
        </nav>
        <button className="join-button" onClick={() => setPage('squad')}>
          <Users size={16} /> <span>Join a squad</span>
          <ArrowUpRight size={14} />
        </button>
      </header>

      <main id="main" tabIndex={-1}>
        {/* Participants see this during a facilitated session, so it carries
          * orientation rather than build status. The previous "EARLY PREVIEW"
          * tag and "Preview 0.1" footer told a 15-year-old the thing they were
          * being asked to take seriously was unfinished. */}
        <div className="breadcrumb">
          <span>THE SHIELDQUEST ADVENTURE</span>
          <span className="preview-tag">
            <span /> SESSION IN PROGRESS
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
                <h1>{page === 'squad' ? 'Good company. Great choices.' : 'Pause. Think. Grow.'}</h1>
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
          <span className="footer-version">ShieldQuest · Project SHIELD</span>
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
      <PlayerOnboardingModal open={onboardingOpen} onComplete={handleCompleteOnboarding} />
    </div>
  );
}
