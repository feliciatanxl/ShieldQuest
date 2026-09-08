import { PlayerAvatarMark } from '../PlayerAvatar';
import { DEFAULT_PLAYER_TOKEN } from '../data/reference';

/**
 * The marker that travels the city track.
 *
 * It shows the Explorer the player chose during onboarding, reduced to the
 * helmet: the full figure is a smudge at this size, and the helmet still
 * carries the colour and the crest that tell the four apart. The full artwork
 * stays in onboarding and token selection, where there is room for it.
 *
 * `className` carries an equipped City Style cosmetic, which recolours the
 * capsule and nothing else — a cosmetic never changes where the token can go or
 * how far it moves, and neither does the chosen Explorer.
 */
export function PlayerTokenMark({
  tokenId = DEFAULT_PLAYER_TOKEN,
  className = '',
  showLabel = true,
  hopping = false,
}: {
  tokenId?: string;
  className?: string;
  showLabel?: boolean;
  hopping?: boolean;
}) {
  return (
    <div
      className="player-isometric-token relative flex flex-col items-center pointer-events-none select-none"
      style={{
        transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-20px)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Pawn Body with Hop Animation */}
      <div
        className={`flex flex-col items-center transition-transform ${
          hopping ? 'animate-token-hop' : 'animate-arrive'
        }`}
      >
        <div
          className={`player-token-halo flex items-center gap-1.5 rounded-full border-2 border-[var(--sq-earned)]/40 bg-navy-950 px-2.5 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.9)] transition-all ${className}`}
        >
          <PlayerAvatarMark tokenId={tokenId} className="h-7 w-7 shrink-0 drop-shadow" />
          {showLabel && (
            <span className="whitespace-nowrap text-[11px] font-black uppercase tracking-wider text-[var(--sq-earned)]">
              You
            </span>
          )}
        </div>
        {/* Pointer Tip */}
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 -mt-1 rotate-45 border-b-2 border-r-2 border-[var(--sq-earned)]/40 bg-navy-950 shadow-md"
        />
      </div>

      {/* Pawn Shadow on Floor Tile */}
      <div
        className="absolute -bottom-2 h-4 w-9 rounded-full bg-navy-950/80 blur-[2px] transition-all"
        style={{
          transform: hopping ? 'scale(0.65)' : 'scale(1)',
          opacity: hopping ? 0.35 : 0.85,
        }}
      />
    </div>
  );
}
