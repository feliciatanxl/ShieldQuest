import { useState } from 'react';
import { Check, Copy, QrCode, Users, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSessionStore } from '../../../stores/sessionStore';

interface SquadViewModalProps {
  open: boolean;
  onClose: () => void;
}

export function SquadViewModal({ open, onClose }: SquadViewModalProps) {
  const code = useSessionStore((state) => state.previewCode) || 'SHIELD01';
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!open) return null;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/?session=${code}` : '';

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="squad-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-pop flex w-full max-w-sm flex-col rounded-[24px] border border-white/20 bg-navy-900 p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-civic-500/20 text-[var(--sq-action)]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 id="squad-modal-title" className="text-sm font-black uppercase tracking-wider">
                My Squad
              </h2>
              <p className="text-[10px] text-white/60">Collaborative City Defense</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lobby Code Card */}
        <div className="mt-4 rounded-[16px] border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-transparent p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--sq-earned)]">
                Session Code
              </span>
              <p className="text-2xl font-black tracking-wider text-white">{code}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-white hover:bg-white/20"
                title="Show QR Code"
              >
                <QrCode className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-white hover:bg-white/20"
                title="Copy Join Link"
              >
                {copied ? <Check className="h-4 w-4 text-[var(--sq-safe)]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {showQr && (
            <div className="mt-3 flex flex-col items-center justify-center rounded-[16px] bg-white p-3 text-[var(--sq-ink)]">
              <QRCodeSVG value={joinUrl} size={130} level="M" />
              <p className="mt-1 text-[10px] font-bold text-[var(--sq-ink)]">Scan to join session</p>
            </div>
          )}
        </div>

        {/* Player Roster Slots */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/60">
            Squad Members (1 / 5 Ready)
          </p>

          {/* Player 1 (You) */}
          <div className="flex items-center justify-between rounded-[10px] border border-amber-400/40 bg-white/10 px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-[var(--sq-ink)]">
                ★
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">Explorer (You)</p>
                <p className="text-[10px] text-[var(--sq-earned)]">Lead Investigator</p>
              </div>
            </div>
            <span className="rounded-full bg-leaf-500/20 px-2 py-0.5 text-[9px] font-bold text-[var(--sq-safe)]">
              Ready
            </span>
          </div>

          {/* Slots 2 to 5 */}
          {[2, 3, 4, 5].map((slot) => (
            <div
              key={slot}
              className="flex items-center justify-between rounded-[10px] border border-dashed border-white/15 bg-white/5 px-3 py-2 opacity-60"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/50">
                  {slot}
                </div>
                <p className="text-[12px] text-white/50">Waiting for teammate…</p>
              </div>
              <span className="text-[9px] text-white/40">Open Slot</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
