import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Map,
  Shield,
  ShieldCheck,
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

type Page = 'city' | 'squad' | 'guardians' | 'reflection' | 'portal';
const nav = [
  { id: 'city', label: 'City board', icon: Map },
  { id: 'squad', label: 'My squad', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
  { id: 'reflection', label: 'Reflection', icon: BookOpen },
] as const;

export function App() {
  const [page, setPage] = useState<Page>('city');
  const [mission, setMission] = useState<Scenario | null>(null);
  const cityView = useCityBoardStore((state) => state.view);
  const activeLessonOpen =
    page === 'city' &&
    (isMissionView(cityView) ||
      cityView === '/think-vote-explain' ||
      cityView.startsWith('/mini-game/'));
  const { setPreviewCode } = useSessionStore();
  const showPage = (next: Page) => {
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
  return (
    <div
      className={`app-shell ${page === 'city' || page === 'guardians' ? 'city-shell' : ''} ${activeLessonOpen ? 'mission-shell' : ''}`}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PwaStatus />
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
          <CityBoard onMission={setMission} onNavigate={setPage} />
        ) : page === 'guardians' ? (
          <Guardians onPractice={() => showPage('city')} />
        ) : page === 'portal' ? (
          <ScenarioPortal onReturnToGame={() => setPage('city')} />
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
          <button onClick={() => setPage('portal')}>
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
    </div>
  );
}
