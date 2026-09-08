import {
  Award,
  CalendarClock,
  Check,
  Shield as ShieldMark,
  Gamepad2,
  Landmark,
  Lock,
  MessageSquareWarning,
  Radio,
  ScrollText,
  Shield,
  ShieldAlert,
  ShieldHalf,
  Vote,
  type LucideIcon,
} from 'lucide-react';
import { GuardianPlate } from '../presentation/GuardianPlate';
import type { ResolvedSpace } from '../hooks/useBoard';
import type { BoardSpaceKind, BoardGuardian } from '../../../../types/city-board';

/**
 * The mark for one space on the city track.
 *
 * Space type is carried by **shape and icon**, state by an overlay and a text
 * label in the accessible name. Colour is the last of the three, never the
 * only one — the board has to survive a projector, greyscale and a screen
 * reader, and a board where the difference between "mini-game" and "completed"
 * is a hue fails all three.
 */

export const SPACE_ICON: Record<BoardSpaceKind, LucideIcon> = {
  SHIELD_CENTRAL: Shield,
  DISTRICT_CHECKPOINT: Landmark,
  SCENARIO: MessageSquareWarning,
  PEER_SHIELD: ShieldHalf,
  MINI_GAME: Gamepad2,
  SITUATION_CARD: ScrollText,
  GUARDIAN_CHECKPOINT: Shield,
  REWARD_CHECKPOINT: Award,
  GROUP_DECISION: Vote,
  SCAM_WATCH: Radio,
  PHISHING_TRAP: ShieldAlert,
};

/**
 * Shape + surface per space type.
 *
 * Shape carries the CATEGORY of a space, and it is doing real work: the board
 * has to survive a projector, greyscale and a screen reader, so the difference
 * between spaces can never rest on hue alone. But it was carrying that meaning
 * through six ad-hoc radii (`rounded-2xl`, `lg`, `md`, `full`, `[10px]`,
 * `[14px]`) with no rule, which read as boxes of assorted sizes jumbled into
 * one track rather than as a system.
 *
 * There are now four shapes, each on the canonical radius scale, and each
 * meaning one thing:
 *
 *   PLACE     16px  — a destination on the map (hub, checkpoint, reward)
 *   CARD       6px  — something to read and decide on (scenario, situation)
 *   ACTIVITY  10px  — something to do (mini-game, watch, trap)
 *   PERSON    full  — someone to meet or protect (guardian, peer)
 *
 * Fills resolve through the semantic roles, so a "risk" space is the same red
 * as a risk verdict everywhere else in the product.
 */
const PLACE = 'rounded-[16px]';
const CARD = 'rounded-[6px]';
const ACTIVITY = 'rounded-[10px]';
const PERSON = 'rounded-full';

const SPACE_SKIN: Record<BoardSpaceKind, string> = {
  // Places
  SHIELD_CENTRAL: `${PLACE} bg-[var(--sq-earned)] text-[var(--color-navy-950)] border-[var(--color-amber-200)]/60 font-extrabold`,
  DISTRICT_CHECKPOINT: `${PLACE} bg-[var(--color-navy-700)] text-white border-white/45`,
  REWARD_CHECKPOINT: `${PLACE} bg-[var(--sq-safe-fill)] text-white border-[var(--sq-safe)]/50`,
  // Cards — something to read
  SCENARIO: `${CARD} bg-[var(--sq-action)] text-white border-[var(--color-civic-300)]/50`,
  SITUATION_CARD: `${CARD} bg-[var(--sq-risk-fill)] text-white border-[var(--sq-risk)]/50`,
  GROUP_DECISION: `${CARD} bg-[var(--color-civic-800)] text-white border-[var(--color-civic-300)]/50`,
  // Activities — something to do
  MINI_GAME: `${ACTIVITY} bg-[var(--color-amber-600)] text-white border-[var(--sq-earned)]/50`,
  SCAM_WATCH: `${ACTIVITY} bg-[var(--color-teal-600)] text-white border-[var(--sq-peer)]/50`,
  PHISHING_TRAP: `${ACTIVITY} bg-[var(--sq-risk)] text-white border-[var(--color-coral-200)]/50`,
  // People
  PEER_SHIELD: `${PERSON} bg-[var(--color-teal-700)] text-white border-[var(--sq-peer)]/50`,
  GUARDIAN_CHECKPOINT: `${PERSON} bg-[var(--color-navy-900)] text-[var(--sq-earned)] border-[var(--sq-earned)]/80`,
};

export function SpaceMark({
  space,
  guardian,
  /** Highlighted while the token is stepping across this space. */
  stepping,
  /** An equipped City Style marker. Changes the completed mark, nothing else. */
  markerCosmetic = false,
  relation = 'ahead',
  discovered = true,
}: {
  space: ResolvedSpace;
  guardian?: BoardGuardian;
  stepping?: boolean;
  markerCosmetic?: boolean;
  /** Exploration state relative to the player's current position. */
  relation?: 'behind' | 'current' | 'ahead';
  /** False while the surrounding district is still only a city teaser. */
  discovered?: boolean;
}) {
  const Icon = SPACE_ICON[space.kind];
  const dim = discovered && (space.planned || space.locked);

  return (
    <span className="relative block">
      <span
        aria-hidden="true"
        className={`grid h-[42px] w-[42px] place-items-center border-2 shadow-[0_5px_12px_-6px_rgba(6,21,39,0.95)] transition ${
          SPACE_SKIN[space.kind]
        } ${dim ? 'opacity-45 saturate-50' : ''} ${!discovered ? 'opacity-55 saturate-50' : ''} ${
          /* The tile underneath already lifts and scales for these two states
           * (see CityTrack). Scaling the mark as well stacked two emphases and
           * made the current space visibly outgrow its neighbours. */
          stepping ? 'ring-2 ring-[var(--color-amber-300)]/60' : ''
        } ${space.isCurrent ? 'animate-node-pulse' : ''} ${
          relation === 'ahead' && !space.isCurrent && !dim ? 'opacity-75' : ''
        } ${
          relation === 'behind' && !space.completed ? 'brightness-90' : ''
        }`}
      >
        {space.kind === 'GUARDIAN_CHECKPOINT' && guardian ? (
          <GuardianPlate
            guardian={guardian}
            className="h-[32px] w-[32px] rounded-full text-[13px]"
            tone="amber"
          />
        ) : (
          <Icon className="h-[19px] w-[19px]" strokeWidth={2.3} />
        )}
      </span>

      {/* State overlay. Always a shape, never a recolour of the mark itself. */}
      {space.completed && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid h-[19px] w-[19px] place-items-center rounded-full border-2 border-[var(--color-navy-950)] bg-[var(--sq-safe-fill)] text-white"
        >
          {markerCosmetic ? (
            <ShieldMark className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Check className="h-2.5 w-2.5" strokeWidth={4} />
          )}
        </span>
      )}
      {discovered && (space.planned || space.locked) && !space.completed && (
        <span
          aria-hidden="true"
          className={`absolute -right-1.5 -top-1.5 grid h-[19px] w-[19px] place-items-center rounded-full border-2 border-[var(--color-navy-950)] text-white ${
            space.planned ? 'bg-[var(--sq-risk-fill)]' : 'bg-[var(--color-navy-800)]'
          }`}
        >
          {space.planned ? (
            <CalendarClock className="h-2.5 w-2.5" strokeWidth={2.8} />
          ) : (
            <Lock className="h-2.5 w-2.5" strokeWidth={3} />
          )}
        </span>
      )}
      <span
        aria-hidden="true"
        className={`absolute -bottom-3 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full ${
          relation === 'behind'
            ? 'bg-[var(--sq-safe)]/80'
            : relation === 'current'
              ? 'bg-[var(--sq-earned)]'
              : 'bg-white/30'
        }`}
      />
    </span>
  );
}

/** The state sentence read to assistive technology, and shown in the legend. */
export function spaceStateLabel(space: ResolvedSpace, discovered = true): string {
  if (!discovered) return 'Undiscovered district';
  if (space.completed) return 'Completed';
  if (space.planned) return 'Coming soon';
  if (space.locked) return 'Locked by progress';
  if (space.node?.playable) return 'Available';
  if (space.visited) return 'Visited';
  return 'Not visited yet';
}
