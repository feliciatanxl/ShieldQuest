import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  TriangleAlert,
  X,
} from 'lucide-react';
import { SITUATION_CARDS } from '../city-board/data/board-data';

export function CasebookPage() {
  const navigate = useNavigate();
  const [filterGuardian, setFilterGuardian] = useState<string>('ALL');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const filteredCards = SITUATION_CARDS.filter((card) => {
    if (filterGuardian === 'ALL') return true;
    return card.guardianId.toLowerCase() === filterGuardian.toLowerCase();
  });

  const activeCard = SITUATION_CARDS.find((c) => c.id === selectedCardId);

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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-action-text)]">
            Threat Intelligence
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Shield Casebook
          </h1>
        </div>
        <Link
          to="/board"
          className="rounded-[6px] bg-[var(--sq-action)] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
        >
          Board
        </Link>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-[24px] border border-indigo-100 bg-gradient-to-r from-indigo-900 to-[var(--color-navy-900)] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[var(--sq-action)]/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--sq-action-text)]">
                Discovery Collection
              </span>
              <h2 className="mt-2 text-2xl font-black">Scam & Crime Dossiers</h2>
              <p className="mt-1 text-xs text-[var(--sq-action-text)] sm:text-sm">
                Real-world scam vectors fictionalised into decision case files. No random drops.
              </p>
            </div>
            <div className="flex gap-2 text-center">
              <div className="rounded-[16px] border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sq-action-text)]">
                  Case Files
                </span>
                <span className="text-xl font-black text-[var(--sq-earned-text)] tabular-nums">
                  {SITUATION_CARDS.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex items-center justify-between gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5">
            {['ALL', 'verifox', 'echo', 'cluepaw', 'bytebuddy', 'beacon', 'shieldfin'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGuardian(g)}
                className={`rounded-[10px] px-3 py-1.5 text-xs font-extrabold transition ${
                  filterGuardian === g
                    ? 'bg-[var(--sq-action)] text-white shadow-sm'
                    : 'bg-[var(--sq-surface)] text-[var(--sq-ink-muted)] border border-[var(--sq-line)] hover:bg-[var(--sq-surface-raised)]'
                }`}
              >
                {g === 'ALL' ? 'All Guardians' : g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Casebook Grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {filteredCards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="group flex cursor-pointer flex-col justify-between rounded-[16px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-4 shadow-sm transition hover:border-[var(--sq-action)]/40 hover:shadow-md active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-[6px] bg-[var(--sq-action)]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--sq-action-text)]">
                    Case #{String(idx + 1).padStart(2, '0')} · {card.guardianId.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--sq-safe)]">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Reviewed
                  </span>
                </div>
                <h3 className="mt-2 text-base font-extrabold text-[var(--sq-ink)] group-hover:text-[var(--sq-action-text)]">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink-muted)] line-clamp-2">
                  {card.blurb}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--sq-line)] pt-2.5 text-xs">
                <span className="font-bold text-[var(--sq-ink-muted)]">
                  Competency: <strong className="text-[var(--sq-ink)]">{card.competency}</strong>
                </span>
                <span className="font-extrabold text-[var(--sq-action-text)] group-hover:underline">
                  Inspect Evidence →
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Case Details Modal */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--sq-action)]/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[var(--sq-line)] bg-[var(--sq-surface)] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedCardId(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sq-surface-raised)] text-[var(--sq-ink-muted)] hover:bg-[var(--sq-surface-raised)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded-[6px] bg-[var(--sq-action)]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--sq-action-text)]">
                Guardian {activeCard.guardianId.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-[var(--sq-ink-muted)]">Case Dossier</span>
            </div>

            <h2 className="mt-2 text-xl font-black text-[var(--sq-ink)] sm:text-2xl">
              {activeCard.title}
            </h2>
            <p className="mt-1 text-xs text-[var(--sq-ink-muted)] leading-relaxed sm:text-sm">
              {activeCard.blurb}
            </p>

            {/* Red Flags & Clues */}
            <div className="mt-5 space-y-3">
              <div className="rounded-[16px] border border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--sq-risk)]">
                  <TriangleAlert className="h-4 w-4 text-[var(--sq-risk)]" />
                  Forensic Red Flags
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-medium text-[var(--sq-risk)]">
                  {activeCard.warningSigns?.map((sign, i) => (
                    <li key={i}>{sign}</li>
                  )) ?? (
                    <>
                      <li>High artificial urgency designed to bypass critical pause.</li>
                      <li>Requests to circumvent official verified platforms or banking channels.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="rounded-[16px] border border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--sq-safe)]">
                  <Shield className="h-4 w-4 text-[var(--sq-safe)]" />
                  S.H.I.E.L.D. Safeguard Action
                </h4>
                <p className="mt-1 text-xs font-medium text-[var(--sq-safe)]">
                  {activeCard.saferResponse || 'Pause immediately. Consult a trusted adult or verify through official SPF Anti-Scam Hotline (1799).'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCardId(null)}
              className="mt-6 flex min-h-[46px] w-full items-center justify-center rounded-[10px] bg-[var(--sq-action)] text-sm font-bold text-white transition hover:bg-[var(--sq-action-hover)]"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
