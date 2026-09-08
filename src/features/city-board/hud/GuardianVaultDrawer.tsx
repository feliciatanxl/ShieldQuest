import { Shield, Sparkles, X } from 'lucide-react';
import { guardians } from '../../guardians/data';
import { GuardianPlate } from '../../guardians/GuardianArt';
import { guardianStanding } from '../../guardians/progress';
import { useSessionStore } from '../../../stores/sessionStore';

interface GuardianVaultDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function GuardianVaultDrawer({ open, onClose }: GuardianVaultDrawerProps) {
  const guardianProgress = useSessionStore((state) => state.guardianProgress);
  const metGuardians = useSessionStore((state) => state.guardians);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guardian-vault-title"
      className="fixed inset-0 z-50 flex justify-start bg-navy-950/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="animate-slide-up flex h-full w-full max-w-md flex-col border-r border-white/15 bg-navy-900 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-navy-950 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-500/20 text-[var(--sq-earned)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="guardian-vault-title" className="text-base font-extrabold uppercase tracking-wide">
                Guardian Vault
              </h2>
              <p className="text-[11px] text-white/60">S.H.I.E.L.D. Mentors & Advice Perks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Guardian Vault"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Roster List */}
        <div className="thin-scroll flex-1 space-y-3.5 overflow-y-auto p-4">
          {guardians.map((guardian) => {
            const count = guardianProgress[guardian.id] ?? 0;
            const isMet = metGuardians.includes(guardian.id) || count > 0;
            const standing = guardianStanding(guardian, count);

            return (
              <div
                key={guardian.id}
                className={`relative overflow-hidden rounded-[16px] border p-4 transition ${
                  isMet
                    ? 'border-amber-400/40 bg-gradient-to-br from-white/10 via-white/5 to-navy-950'
                    : 'border-white/10 bg-white/5 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <GuardianPlate
                    guardian={guardian}
                    className="h-14 w-14 shrink-0 rounded-[16px] text-2xl shadow-md border-2 border-white/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="truncate text-base font-black text-white">{guardian.name}</h3>
                      <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--sq-earned)]">
                        {guardian.competency}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-[var(--sq-action)]">{guardian.skill}</p>
                    <p className="mt-0.5 text-[11px] italic text-white/70">"{guardian.motto}"</p>
                  </div>
                </div>

                {/* Advice Perk & Standing */}
                <div className="mt-3 rounded-[16px] border border-white/10 bg-navy-950/80 p-2.5 text-[11px]">
                  <p className="flex items-center gap-1 font-bold text-[var(--sq-earned)]">
                    <Sparkles className="h-3.5 w-3.5" /> Mentor Advice:
                  </p>
                  <p className="mt-1 text-white/85">{guardian.greeting}</p>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-white/60">
                  <span>Level {standing.level}</span>
                  <span className="tabular-nums text-[var(--sq-earned)]">
                    {count} / {guardian.target} Pips
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((count / guardian.target) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
