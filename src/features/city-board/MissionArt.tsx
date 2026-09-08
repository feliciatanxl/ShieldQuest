import {
  Gamepad2,
  MessageSquareWarning,
  ShieldHalf,
  Sparkles,
  Vote,
  type LucideIcon,
} from 'lucide-react';
import { ArtSlot } from './presentation/ArtSlot';
import { MINI_GAME_BADGE_ART, NODE_KIND_ART } from './data/assets';
import type { NodeKind } from '../../../types/city-board';

/**
 * The mark for each kind of mission stop. Shared by the district route, the
 * district sheet and anywhere else a stop is listed, so a stop looks the same
 * wherever it appears.
 */
export const KIND_ICON: Record<NodeKind, LucideIcon> = {
  SCENARIO: MessageSquareWarning,
  MINI_GAME: Gamepad2,
  PEER_SHIELD: ShieldHalf,
  GUARDIAN_CHALLENGE: Sparkles,
  GROUP_DECISION: Vote,
};

/**
 * Peer Shield is styled distinctly from every other node type, on the board and
 * everywhere else. It is a signature mode, not one mini-game among several, and
 * a youth should be able to pick it out of the route at a glance.
 */
export const KIND_CHIP: Record<NodeKind, string> = {
  SCENARIO: 'border-[var(--sq-action)]/40 bg-[var(--sq-action)]/15 text-[var(--sq-action-text)]',
  MINI_GAME: 'border-[var(--sq-earned)]/40 bg-[var(--sq-earned)]/15 text-[var(--sq-earned-text)]',
  PEER_SHIELD: 'border-[var(--sq-peer)]/40 bg-[var(--sq-peer)]/15 text-[var(--sq-peer)]',
  GUARDIAN_CHALLENGE: 'border-[var(--sq-safe)]/40 bg-[var(--sq-safe)]/15 text-[var(--sq-safe)]',
  GROUP_DECISION: 'border-[var(--sq-risk)]/40 bg-[var(--sq-risk)]/15 text-[var(--sq-risk)]',
};

/** Mission-type mark: registered artwork if there is any, the icon until then. */
export function MissionKindMark({
  kind,
  className = 'h-4 w-4',
}: {
  kind: NodeKind;
  className?: string;
}) {
  const Icon = KIND_ICON[kind];
  return (
    <ArtSlot src={NODE_KIND_ART[kind]} className={className}>
      <Icon className={className} />
    </ArtSlot>
  );
}

/** Mini-game badge, keyed by mini-game id. Falls back to the mini-game mark. */
export function MiniGameBadge({
  gameId,
  className = 'h-5 w-5',
}: {
  gameId: string;
  className?: string;
}) {
  return (
    <ArtSlot src={MINI_GAME_BADGE_ART[gameId] ?? null} className={className}>
      <Gamepad2 className={className} />
    </ArtSlot>
  );
}
