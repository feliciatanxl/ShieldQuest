import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { readPlayerPreferences, savePlayerPreferences } from '../city-board/playerPreferences';

export function PlayerSettingsPage() {
  const navigate = useNavigate();
  const { previewCode } = useSessionStore();
  const initialPreferences = readPlayerPreferences();

  const [pseudonym, setPseudonym] = useState<string>(() => {
    return localStorage.getItem('sq_player_pseudonym') || 'Defender_Alex';
  });
  const [reducedMotion, setReducedMotion] = useState(initialPreferences.reducedMotion);
  const [soundEnabled, setSoundEnabled] = useState(initialPreferences.soundEnabled);
  const [highContrast, setHighContrast] = useState(initialPreferences.highContrast);
  const [enhanced3d, setEnhanced3d] = useState(initialPreferences.enhanced3d);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = () => {
    localStorage.setItem('sq_player_pseudonym', pseudonym);
    savePlayerPreferences({ reducedMotion, soundEnabled, highContrast, enhanced3d });
    setSavedNotice('Settings saved successfully!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <div data-skin="game"
      className="flex min-h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--sq-line)] bg-[var(--sq-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/shield-central')}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] transition hover:bg-[var(--sq-surface-raised)]"
          aria-label="Back to Shield Central"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-ink-muted)]">
            Player Preferences
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Settings & Accessibility
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-[6px] bg-[var(--sq-action)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
        >
          Board
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--sq-surface-raised)] text-[var(--sq-ink)]">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--sq-ink)]">Experience Controls</h2>
              <p className="text-xs text-[var(--sq-ink-muted)]">
                Customise accessibility features and privacy safeguards.
              </p>
            </div>
          </div>
        </div>

        {savedNotice && (
          <div className="mt-4 rounded-[16px] border border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 p-3 text-center text-xs font-bold text-[var(--sq-safe)] animate-in fade-in">
            {savedNotice}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Pseudonym Settings */}
          <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Player Identity (Privacy-by-Design)
            </span>
            <div className="mt-3">
              <label className="block text-xs font-extrabold text-[var(--sq-ink)]">
                Anonymous Pseudonym
              </label>
              <p className="mt-0.5 text-[11px] text-[var(--sq-ink-muted)]">
                Never enter your real name, NRIC, school student ID, or personal contact.
              </p>
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                maxLength={20}
                className="mt-2 w-full rounded-[10px] border border-[var(--sq-line)] px-3.5 py-2.5 text-sm font-bold text-[var(--sq-ink)] focus:border-[var(--sq-action)] focus:outline-none"
              />
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Accessibility & Motion
            </span>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between border-b border-[var(--sq-line)] pb-3">
              <div>
                <p className="text-xs font-extrabold text-[var(--sq-ink)]">Reduced Motion</p>
                <p className="text-[11px] text-[var(--sq-ink-muted)]">
                  Disable 2.5D board tilts and spinning pawn jumps.
                </p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-5 w-5 rounded border-[var(--sq-line-strong)] text-[var(--sq-action-text)] focus:ring-[var(--sq-action)]"
              />
            </div>

            {/* Progressive 3D Enhancement */}
            <div className="flex items-center justify-between border-b border-[var(--sq-line)] pb-3">
              <div>
                <p className="text-xs font-extrabold text-[var(--sq-ink)]">Enhanced 3D City Atmosphere</p>
                <p className="text-[11px] text-[var(--sq-ink-muted)]">
                  Add a lightweight 3D skyline behind the accessible 2.5D board. Low-power devices
                  keep the 2.5D view.
                </p>
              </div>
              <input
                type="checkbox"
                checked={enhanced3d}
                onChange={(e) => setEnhanced3d(e.target.checked)}
                disabled={reducedMotion}
                aria-describedby="enhanced-3d-note"
                className="h-5 w-5 rounded border-[var(--sq-line-strong)] text-[var(--sq-action-text)] focus:ring-[var(--sq-action)]"
              />
              <span id="enhanced-3d-note" className="sr-only">
                Reduced Motion also disables the enhanced 3D atmosphere.
              </span>
            </div>

            {/* Audio Effects */}
            <div className="flex items-center justify-between border-b border-[var(--sq-line)] pb-3">
              <div>
                <p className="text-xs font-extrabold text-[var(--sq-ink)]">Sound Effects & Audio Cues</p>
                <p className="text-[11px] text-[var(--sq-ink-muted)]">
                  Enable subtle auditory chimes on dice roll and reward claims.
                </p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-[var(--sq-line-strong)] text-[var(--sq-action-text)] focus:ring-[var(--sq-action)]"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[var(--sq-ink)]">Enhanced Contrast Mode</p>
                <p className="text-[11px] text-[var(--sq-ink-muted)]">
                  Increase border weight and font contrast for classroom projectors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-5 w-5 rounded border-[var(--sq-line-strong)] text-[var(--sq-action-text)] focus:ring-[var(--sq-action)]"
              />
            </div>
          </div>

          {/* Privacy & Session Reset */}
          <div className="rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-ink-muted)]">
              Session Management
            </span>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[var(--sq-ink)]">Room Session Code</p>
                <p className="text-[11px] text-[var(--sq-ink-muted)]">
                  Active code:{' '}
                  <strong className="text-[var(--sq-action-text)]">{previewCode ?? 'SQ-DEMO'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  useSessionStore.getState().reset();
                  setSavedNotice('Session ledger reset to default.');
                  setTimeout(() => setSavedNotice(null), 2500);
                }}
                className="rounded-[10px] border border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 px-3 py-1.5 text-xs font-extrabold text-[var(--sq-risk)] hover:bg-[var(--sq-risk)]/15"
              >
                Reset Ledger
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--sq-action)] text-sm font-extrabold text-white shadow-md transition hover:bg-[var(--sq-action-hover)] active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </main>
    </div>
  );
}
