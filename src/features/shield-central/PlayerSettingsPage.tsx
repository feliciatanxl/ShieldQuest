import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

export function PlayerSettingsPage() {
  const navigate = useNavigate();
  const { previewCode } = useSessionStore();

  const [pseudonym, setPseudonym] = useState<string>(() => {
    return localStorage.getItem('sq_player_pseudonym') || 'Defender_Alex';
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('sq_reduced_motion') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sq_sound_enabled') !== 'false';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('sq_high_contrast') === 'true';
  });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = () => {
    localStorage.setItem('sq_player_pseudonym', pseudonym);
    localStorage.setItem('sq_reduced_motion', String(reducedMotion));
    localStorage.setItem('sq_sound_enabled', String(soundEnabled));
    localStorage.setItem('sq_high_contrast', String(highContrast));
    setSavedNotice('Settings saved successfully!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <div className="flex min-h-full flex-col bg-slate-50 text-slate-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/shield-central')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          aria-label="Back to Shield Central"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Player Preferences
          </span>
          <h1 className="text-base font-extrabold text-navy-900 sm:text-lg">
            Settings & Accessibility
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
        >
          Board
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-navy-900">
                Experience Controls
              </h2>
              <p className="text-xs text-slate-500">
                Customise accessibility features and privacy safeguards.
              </p>
            </div>
          </div>
        </div>

        {savedNotice && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-900 animate-in fade-in">
            {savedNotice}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Pseudonym Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Player Identity (Privacy-by-Design)
            </span>
            <div className="mt-3">
              <label className="block text-xs font-extrabold text-navy-900">
                Anonymous Pseudonym
              </label>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Never enter your real name, NRIC, school student ID, or personal contact.
              </p>
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                maxLength={20}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-civic-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Accessibility & Motion
            </span>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-extrabold text-navy-900">
                  Reduced Motion
                </p>
                <p className="text-[11px] text-slate-500">
                  Disable 2.5D board tilts and spinning pawn jumps.
                </p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-civic-600 focus:ring-civic-500"
              />
            </div>

            {/* Audio Effects */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-extrabold text-navy-900">
                  Sound Effects & Audio Cues
                </p>
                <p className="text-[11px] text-slate-500">
                  Enable subtle auditory chimes on dice roll and reward claims.
                </p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-civic-600 focus:ring-civic-500"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-navy-900">
                  Enhanced Contrast Mode
                </p>
                <p className="text-[11px] text-slate-500">
                  Increase border weight and font contrast for classroom projectors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-civic-600 focus:ring-civic-500"
              />
            </div>
          </div>

          {/* Privacy & Session Reset */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Session Management
            </span>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-navy-900">
                  Room Session Code
                </p>
                <p className="text-[11px] text-slate-500">
                  Active code: <strong className="text-civic-700">{previewCode ?? 'SQ-DEMO'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  useSessionStore.getState().reset();
                  setSavedNotice('Session ledger reset to default.');
                  setTimeout(() => setSavedNotice(null), 2500);
                }}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700 hover:bg-rose-100"
              >
                Reset Ledger
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-extrabold text-white shadow-md transition hover:bg-navy-800 active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </main>
    </div>
  );
}
