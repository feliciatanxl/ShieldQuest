import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

interface RewardItem {
  id: string;
  category: 'AURAS' | 'FRAMES' | 'BADGES';
  title: string;
  cost: number;
  description: string;
  icon: string;
}

const REWARD_CATALOG: RewardItem[] = [
  {
    id: 'aura-amber',
    category: 'AURAS',
    title: 'Guardian Amber Glow',
    cost: 150,
    description: 'Golden protective aura for your avatar pawn on the 2.5D City Board.',
    icon: '✨',
  },
  {
    id: 'aura-cyan',
    category: 'AURAS',
    title: 'Cyber Pulse Aura',
    cost: 200,
    description: 'High-tech biometric shield aura representing digital defense.',
    icon: '🛡️',
  },
  {
    id: 'frame-gold',
    category: 'FRAMES',
    title: 'Delta Defender Frame',
    cost: 100,
    description: 'Polished gold border awarded for demonstrated peer support.',
    icon: '🥇',
  },
  {
    id: 'frame-tactical',
    category: 'FRAMES',
    title: 'Tactical Inspector Border',
    cost: 120,
    description: 'Forensic inspection frame for keen-eyed truth seekers.',
    icon: '🔍',
  },
  {
    id: 'badge-antiscam',
    category: 'BADGES',
    title: 'Anti-Scam Pioneer',
    cost: 80,
    description: 'Mastery of phishing vectors and bank credential protection.',
    icon: '🎯',
  },
  {
    id: 'badge-peeraid',
    category: 'BADGES',
    title: 'Peer Shield Guardian',
    cost: 120,
    description: 'Commendation for stepping in to support a friend in trouble.',
    icon: '🤝',
  },
];

export function RewardsPage() {
  const navigate = useNavigate();
  const { shieldTokens } = useSessionStore();
  const [unlocked, setUnlocked] = useState<string[]>(['frame-gold']);
  const [equipped, setEquipped] = useState<string>('frame-gold');
  const [activeTab, setActiveTab] = useState<'ALL' | 'AURAS' | 'FRAMES' | 'BADGES'>('ALL');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const filtered = REWARD_CATALOG.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.category === activeTab;
  });

  const handleUnlock = (item: RewardItem) => {
    if (unlocked.includes(item.id)) {
      setEquipped(item.id);
      setPurchaseNotice(`Equipped ${item.title}!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
      return;
    }

    if (shieldTokens < item.cost) {
      setPurchaseNotice(`Need ${item.cost - shieldTokens} more Shield Tokens!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
      return;
    }

    setUnlocked([...unlocked, item.id]);
    setEquipped(item.id);
    setPurchaseNotice(`Unlocked and equipped ${item.title}!`);
    setTimeout(() => setPurchaseNotice(null), 2500);
  };

  return (
    <div data-skin="game"
      className="flex min-h-dvh flex-col bg-[var(--sq-canvas)] text-[var(--sq-ink)]">
      {/* Top Header */}
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
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sq-earned-text)]">
            Cosmetics & Badges
          </span>
          <h1 className="text-base font-extrabold text-[var(--sq-ink)] sm:text-lg">
            Rewards Hub
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-[10px] border border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 px-3 py-1.5 text-xs font-black text-[var(--sq-earned-text)]">
          <Sparkles className="h-4 w-4 text-[var(--sq-earned-text)]" />
          <span>{shieldTokens} Tokens</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        {/* Banner */}
        <div className="rounded-[24px] border border-[var(--sq-earned)]/40 bg-gradient-to-r from-[var(--color-amber-600)] to-[var(--color-amber-700)] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[var(--color-navy-950)]/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-amber-50)]">
                Ethical Customization
              </span>
              <h2 className="mt-2 text-2xl font-black">Personalise Your Defender</h2>
              <p className="mt-1 text-xs text-[var(--color-amber-50)] sm:text-sm">
                Purely cosmetic. Zero loot boxes, zero pay-to-win mechanics, zero random drops.
              </p>
            </div>
            <div className="rounded-[16px] border border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm">
              <span className="block text-[10px] font-bold uppercase text-[var(--sq-earned-text)]">
                Equipped Frame
              </span>
              <span className="text-sm font-extrabold text-white">
                {REWARD_CATALOG.find((r) => r.id === equipped)?.title ?? 'Default'}
              </span>
            </div>
          </div>
        </div>

        {/* Notice Alert */}
        {purchaseNotice && (
          <div className="mt-4 rounded-[16px] border border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 p-3 text-center text-xs font-extrabold text-[var(--sq-action-text)] animate-in fade-in">
            {purchaseNotice}
          </div>
        )}

        {/* Category Tabs */}
        <div className="mt-6 flex items-center justify-between gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5">
            {['ALL', 'AURAS', 'FRAMES', 'BADGES'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`rounded-[10px] px-3 py-1.5 text-xs font-extrabold transition ${
                  activeTab === tab
                    ? 'bg-[var(--sq-action)] text-white shadow-sm'
                    : 'bg-[var(--sq-surface)] text-[var(--sq-ink-muted)] border border-[var(--sq-line)] hover:bg-[var(--sq-surface-raised)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Reward Grid */}
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isUnlocked = unlocked.includes(item.id);
            const isEquipped = equipped === item.id;
            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-[16px] border bg-[var(--sq-surface)] p-5 shadow-sm transition ${
                  isEquipped
                    ? 'border-2 border-[var(--sq-earned)] ring-2 ring-[var(--sq-earned)]/20'
                    : 'border-[var(--sq-line)] hover:border-[var(--sq-line-strong)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="rounded-full bg-[var(--sq-surface-raised)] px-2.5 py-1 text-[11px] font-black text-[var(--sq-ink)]">
                      {item.cost} Tokens
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-[var(--sq-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--sq-ink-muted)]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-[var(--sq-line)] pt-3">
                  <button
                    type="button"
                    onClick={() => handleUnlock(item)}
                    className={`flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-[10px] text-xs font-extrabold transition active:scale-[0.98] ${
                      isEquipped
                        ? 'bg-[var(--sq-safe-fill)] text-white'
                        : isUnlocked
                          ? 'bg-[var(--sq-action)] text-white hover:bg-[var(--sq-action-hover)]'
                          : // Amber marks EARNED progress, so claiming a reward
                            // you have earned is the one place it belongs. Dark
                            // ink on amber, not white — white on amber fails AA.
                            'bg-[var(--sq-earned)] text-[var(--color-navy-950)] hover:brightness-105'
                    }`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="h-4 w-4" />
                        Equipped
                      </>
                    ) : isUnlocked ? (
                      'Equip Item'
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        Unlock for {item.cost}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
