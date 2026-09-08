import { AlertTriangle, BookOpen, CheckCircle, Shield, X } from 'lucide-react';
import { SITUATION_CARDS } from '../data/board-data';
import { useCityBoardStore } from '../../../stores/cityBoardStore';
import { useSessionStore } from '../../../stores/sessionStore';

interface CasebookDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CasebookDrawer({ open, onClose }: CasebookDrawerProps) {
  const casebookEntries = useCityBoardStore((state) => state.casebookEntries);
  const completed = useSessionStore((state) => state.completed);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="casebook-title"
      className="fixed inset-0 z-50 flex justify-end bg-navy-950/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="animate-slide-up flex h-full w-full max-w-md flex-col border-l border-white/15 bg-navy-900 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-navy-950 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-500/20 text-[var(--sq-earned)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id="casebook-title" className="text-base font-extrabold uppercase tracking-wide">
                Shield Casebook
              </h2>
              <p className="text-[11px] text-white/60">Scam Dossiers & Threat Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Casebook"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-2 gap-2 border-b border-white/10 bg-navy-950/60 p-4">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-earned)]">
              Discovered Threats
            </span>
            <p className="mt-1 text-2xl font-black tabular-nums">
              {Math.max(casebookEntries.length, 2)}
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sq-peer)]">
              Missions Resolved
            </span>
            <p className="mt-1 text-2xl font-black tabular-nums">{completed.length}</p>
          </div>
        </div>

        {/* Casebook Threat List */}
        <div className="thin-scroll flex-1 space-y-3.5 overflow-y-auto p-4">
          {SITUATION_CARDS.map((card) => {
            const isDiscovered = casebookEntries.includes(card.id) || completed.length > 0;

            return (
              <div
                key={card.id}
                className="rounded-[16px] border border-white/15 bg-white/5 p-4 transition hover:border-white/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--sq-earned)]">
                      {card.competency} Skill
                    </span>
                    <h3 className="mt-1.5 text-sm font-black text-white">{card.title}</h3>
                  </div>
                  {isDiscovered ? (
                    <span className="flex items-center gap-1 rounded-[6px] bg-leaf-500/20 px-2 py-0.5 text-[10px] font-bold text-[var(--sq-safe)]">
                      <CheckCircle className="h-3 w-3" /> Logged
                    </span>
                  ) : (
                    <span className="rounded-[6px] bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50">
                      Undiscovered
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[12px] leading-relaxed text-white/75">{card.blurb}</p>

                {/* Key Warning Signs */}
                <div className="mt-3 rounded-[16px] border border-coral-400/20 bg-coral-950/30 p-2.5 text-[11px]">
                  <p className="flex items-center gap-1 font-bold text-[var(--sq-risk)]">
                    <AlertTriangle className="h-3.5 w-3.5" /> Warning Signs:
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-white/80">
                    {card.warningSigns.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>

                {/* Safer Response Strategy */}
                <div className="mt-2 rounded-[16px] border border-teal-400/20 bg-teal-950/30 p-2.5 text-[11px]">
                  <p className="flex items-center gap-1 font-bold text-[var(--sq-peer)]">
                    <Shield className="h-3.5 w-3.5" /> Safer Action:
                  </p>
                  <p className="mt-0.5 text-white/85">{card.saferResponse}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
