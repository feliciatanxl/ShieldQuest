import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flag,
  GraduationCap,
  Heart,
  Map,
  Monitor,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { Scenario } from '../types';
import { demoScenarios } from '../types/demo';
import { useSessionStore } from './stores/sessionStore';
import { CityBoard } from './features/city-board/CityBoard';
import { districts } from './features/city-board/districts';
import { Guardians } from './features/guardians/Guardians';
import { ScenarioPlayer } from './features/scenarios/ScenarioPlayer';
import { SquadPanel } from './features/squad/SquadPanel';
import { Assessment } from './features/assessment/Assessment';
import { ScenarioPortal } from './features/admin/ScenarioPortal';
import { PwaStatus } from './components/PwaStatus';
import { Modal } from './components/Modal';

type Page = 'city' | 'squad' | 'guardians' | 'reflection' | 'portal';
const nav = [
  { id: 'city', label: 'City board', icon: Map },
  { id: 'squad', label: 'My squad', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: ShieldCheck },
  { id: 'reflection', label: 'Reflection', icon: BookOpen },
] as const;
const districtIcons = { school: GraduationCap, retail: ShoppingBag, digital: Monitor };

export function App() {
  const [page, setPage] = useState<Page>('city');
  const [mission, setMission] = useState<Scenario | null>(null);
  const [help, setHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const { district, selectDistrict, completed, guardians, setPreviewCode } = useSessionStore();
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('session')?.toUpperCase();
    if (code && /^[A-Z0-9]{6,8}$/.test(code)) {
      setPreviewCode(code);
      setPage('squad');
    }
  }, [setPreviewCode]);
  const selectedMission = demoScenarios.find((scenario) => scenario.district === district)!;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PwaStatus />
      <header className="header">
        <button className="brand" onClick={() => setPage('city')} aria-label="ShieldQuest home">
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
              onClick={() => setPage(id)}
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
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">BIG ADVENTURES. EVERYDAY HEROES.</div>
                <h1>
                  A little courage.
                  <br className="mobile-break" /> A safer city.
                </h1>
                <p>
                  Explore your neighbourhood, make choices that matter, and find your inner
                  Guardian.
                </p>
              </div>
              <button className="secondary-button how-button" onClick={() => setHelp(true)}>
                <BookOpen size={17} /> How to play
              </button>
            </section>
            <div className="board-layout">
              <section className="board-column">
                <CityBoard selected={district} onSelect={selectDistrict} />
                <div className="district-heading">
                  <h2>Where will you make a difference?</h2>
                  <span>3 districts to discover</span>
                </div>
                <div className="district-grid">
                  {districts.map((item) => {
                    const Icon = districtIcons[item.id];
                    return (
                      <button
                        key={item.id}
                        className={`district-card ${item.id} ${district === item.id ? 'active' : ''}`}
                        onClick={() => selectDistrict(item.id)}
                        aria-pressed={district === item.id}
                      >
                        <div className="district-card-top">
                          <span className={`district-symbol ${item.id}`}>
                            <Icon size={24} />
                          </span>
                          <span className="district-number">0{districts.indexOf(item) + 1}</span>
                        </div>
                        <strong>{item.name}</strong>
                        <span>{item.subtitle}</span>
                        <div className="district-card-bottom">
                          <span>
                            {district === item.id ? 'Selected district' : 'Explore district'}
                          </span>
                          {district === item.id ? <Check size={16} /> : <ArrowRight size={16} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
              <aside className="quest-sidebar">
                <section className="mission-card">
                  <div className="section-heading">
                    <span className="eyebrow">YOUR NEXT ADVENTURE</span>
                    <span className="tiny-stars">✦</span>
                  </div>
                  <div className={`mission-art ${district}`} aria-hidden="true">
                    <span className="art-orbit orbit-one" />
                    <span className="art-orbit orbit-two" />
                    {district === 'school' ? (
                      <MessagesArt />
                    ) : district === 'retail' ? (
                      <ShoppingBag size={61} />
                    ) : (
                      <Monitor size={61} />
                    )}
                    <span className="floating-spark">✧</span>
                  </div>
                  <div className="mission-meta">
                    <span className={`district-pill ${district}`}>
                      {districts.find((item) => item.id === district)?.name}
                    </span>
                    <span>
                      <Clock3 size={13} />
                      {selectedMission.durationMinutes} min
                    </span>
                  </div>
                  <h2>{selectedMission.title}</h2>
                  <p>{selectedMission.summary}</p>
                  <div className="skill-line">
                    <Heart size={15} />
                    {selectedMission.skill}
                  </div>
                  <button
                    className="primary-button full"
                    onClick={() => setMission(selectedMission)}
                  >
                    {completed.includes(selectedMission.id)
                      ? 'Replay mission preview'
                      : 'Explore mission'}
                    <ArrowRight size={18} />
                  </button>
                  <div className="mission-footer">
                    A sample story. A chance to think differently.
                  </div>
                </section>
                <section className="surface collection-card">
                  <div className="section-heading">
                    <h3>Meet your Guardians</h3>
                    <span className="count-badge">{guardians.length}/6</span>
                  </div>
                  <p>Big-hearted buddies. Real-world skills.</p>
                  <Guardians compact />
                  <button className="collection-link" onClick={() => setPage('guardians')}>
                    View your collection
                    <ArrowRight size={16} />
                  </button>
                </section>
              </aside>
            </div>
            {showWelcome && (
              <div className="welcome-strip">
                <div className="welcome-icon">
                  <Flag size={22} />
                </div>
                <div>
                  <strong>You don’t need a cape to make a difference.</strong>
                  <p>Start with curiosity. Listen to your squad. Every thoughtful choice counts.</p>
                </div>
                <span className="welcome-detail">EXPLORE · CONNECT · PROTECT</span>
                <button
                  className="icon-button"
                  aria-label="Dismiss welcome tip"
                  onClick={() => setShowWelcome(false)}
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <section className="page-heading">
              <div>
                <span className="eyebrow">YOUR SHIELDQUEST JOURNEY</span>
                <h1>
                  {page === 'squad'
                    ? 'Good company. Great choices.'
                    : page === 'guardians'
                      ? 'A little help from your Guardians.'
                      : page === 'reflection'
                        ? 'Pause. Think. Grow.'
                        : 'Behind every great adventure.'}
                </h1>
                <p>
                  {page === 'guardians'
                    ? 'Meet six companions, each celebrating a skill you can take into everyday life.'
                    : 'A space to connect, explore and build confidence together.'}
                </p>
              </div>
            </section>
            {page === 'squad' && <SquadPanel />}
            {page === 'guardians' && (
              <section className="surface padded">
                <div className="section-heading">
                  <h2>Your collection</h2>
                  <span className="badge">{guardians.length} of 6 · demo progress</span>
                </div>
                <Guardians />
                <div className="note">
                  Try a sample mission to preview collecting a Guardian. Progress resets when you
                  reload. Skill-based awards will be added with the full scenario engine.
                </div>
              </section>
            )}
            {page === 'reflection' && <Assessment />}
            {page === 'portal' && <ScenarioPortal />}
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
            onClick={() => setPage(id)}
            aria-current={page === id ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {mission && (
        <ScenarioPlayer key={mission.id} scenario={mission} onClose={() => setMission(null)} />
      )}
      {help && (
        <Modal title="Every choice is a chance to grow." onClose={() => setHelp(false)}>
          <p>Choose a district and explore a sample mission. Each story follows six moments:</p>
          <div className="how-steps">
            {[
              'Explore the situation',
              'Investigate the clues',
              'Discuss different perspectives',
              'Decide on your response',
              'Experience what happens next',
              'Protect your community',
            ].map((text, i) => (
              <div key={text}>
                <span>{i + 1}</span>
                {text}
              </div>
            ))}
          </div>
          <div className="note">
            <Sparkles size={18} /> This is an early local preview. Live squads, private voting,
            delayed session events and facilitator publishing will be connected in later
            development.
          </div>
          <button className="primary-button full" onClick={() => setHelp(false)}>
            Let’s explore
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}

function MessagesArt() {
  return (
    <div className="chat-art">
      <div className="chat-bubble first">
        <span />
        <span />
        <span />
      </div>
      <div className="chat-bubble second">
        <Heart size={26} fill="currentColor" />
      </div>
    </div>
  );
}
