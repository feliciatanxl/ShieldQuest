import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { SpaceMark, spaceStateLabel } from './SpaceMark';
import { PlayerTokenMark } from './PlayerTokenMark';
import { DistrictLandmark } from './DistrictLandmark';
import { getGridTilePos, type GridTilePos } from './trackGeometry';
import type { ResolvedSpace } from '../hooks/useBoard';
import {
  BOARD_SPACE_LABEL,
  type CityDistrictId,
  type BoardGuardian,
} from '../../../../types/city-board';

const ThreeBoardBackdrop = lazy(() => import('./ThreeBoardBackdrop'));

export function CityTrack({
  spaces,
  tokenIndex,
  steppingIndices,
  guardians,
  districtNames,
  discoveredDistricts: _discoveredDistricts,
  onOpenSpace,
  playerTokenId,
  trailClass: _trailClass,
  tokenClass,
  markerCosmetic,
  activeDistrictId = 'school',
  districtCompleted = 0,
  districtTotal = 3,
  districtCleared = false,
  isAdvancing = false,
  enhanced3d = true,
  onDistrictSecuredClick,
}: {
  spaces: ResolvedSpace[];
  tokenIndex: number;
  steppingIndices: number[];
  guardians: BoardGuardian[];
  districtNames: Record<CityDistrictId, string>;
  discoveredDistricts?: CityDistrictId[];
  onOpenSpace: (space: ResolvedSpace) => void;
  playerTokenId: string;
  trailClass?: string;
  tokenClass?: string;
  markerCosmetic?: boolean;
  activeDistrictId?: CityDistrictId;
  districtCompleted?: number;
  districtTotal?: number;
  districtCleared?: boolean;
  isAdvancing?: boolean;
  enhanced3d?: boolean;
  onDistrictSecuredClick?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardScale, setBoardScale] = useState(0.8);

  // Responsive scale: ensures the 460px diamond fits without clipping on mobile and desktop
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      // Rotated bounding box at 60deg X and -45deg Z
      const scaleX = clientWidth / 620;
      const scaleY = clientHeight / 440;
      const fitScale = Math.min(scaleX, scaleY, 0.85);
      setBoardScale(Math.max(0.48, Math.min(0.8, fitScale)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const isStepping = steppingIndices.length > 0;
  const currentPos = useMemo(() => getGridTilePos(tokenIndex), [tokenIndex]);

  return (
    <div
      ref={containerRef}
      className="isometric-viewport relative w-full h-full flex-1 overflow-hidden flex items-center justify-center bg-radial from-navy-900 via-navy-950 to-navy-950 p-2 select-none"
    >
      {/* 2.5D Ground Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
        }}
      />

      {enhanced3d && (
        <Suspense fallback={null}>
          <ThreeBoardBackdrop districtId={activeDistrictId} active={isStepping || isAdvancing} />
        </Suspense>
      )}

      {/* 2.5D ISOMETRIC STAGE: 5x5 CSS Grid rotated in 3D */}
      <div
        className={`isometric-stage relative z-10 grid grid-cols-5 grid-rows-5 gap-2 rounded-[24px] border-4 border-[var(--sq-earned)]/25 bg-[var(--color-navy-950)]/90 p-3 shadow-[0_45px_90px_rgba(0,0,0,0.95)] ${
          isAdvancing ? 'advancing' : ''
        }`}
        style={{
          perspective: '1000px',
          transform: `translateY(-24px) scale(${boardScale}) rotateX(60deg) rotateZ(-45deg)`,
          transformStyle: 'preserve-3d',
          width: '460px',
          height: '460px',
        }}
      >
        {/* CENTER 3x3: Elevated Central District Landmark */}
        <div
          className="z-10 flex items-center justify-center p-2"
          style={{
            gridColumn: '2 / 5',
            gridRow: '2 / 5',
            transformStyle: 'preserve-3d',
          }}
        >
          <DistrictLandmark
            districtId={activeDistrictId}
            districtName={districtNames[activeDistrictId] ?? 'School Street'}
            completed={districtCompleted}
            total={districtTotal}
            cleared={districtCleared}
            onSecuredClick={onDistrictSecuredClick}
          />
        </div>

        {/* 16 PERIMETER TILES on the 5x5 Grid */}
        {spaces.slice(0, 16).map((space, index) => {
          const pos: GridTilePos = getGridTilePos(index);
          const isCurrent = index === tokenIndex;
          const isSteppingAcross = steppingIndices.includes(index);
          const guardian = space.guardianId
            ? guardians.find((g) => g.id === space.guardianId)
            : undefined;

          return (
            <div
              key={index}
              className="z-20 flex items-center justify-center"
              style={{
                gridColumn: pos.col,
                gridRow: pos.row,
                transformStyle: 'preserve-3d',
              }}
            >
              <button
                type="button"
                onClick={() => onOpenSpace(space)}
                aria-current={isCurrent ? 'location' : undefined}
                className={`isometric-tile-surface group relative flex h-full w-full flex-col items-center justify-center rounded-[16px] border-2 p-1 text-center shadow-md transition-all focus:outline-none ${
                  pos.isCorner
                    ? 'border-[var(--sq-earned)]/90 bg-gradient-to-br from-[var(--sq-earned)]/25 via-[var(--color-navy-900)] to-[var(--color-navy-950)] text-white'
                    : space.completed
                      ? 'border-[var(--sq-safe)]/90 bg-gradient-to-br from-[var(--sq-safe)]/25 via-[var(--color-navy-900)] to-[var(--color-navy-950)] text-white'
                      : isCurrent
                        ? 'border-[var(--sq-earned)] bg-[var(--color-navy-900)] ring-2 ring-[var(--sq-earned)]/50 text-white'
                        : 'border-white/20 bg-[var(--color-navy-900)]/90 text-white/90 hover:border-white/50'
                }`}
                style={{
                  transform: isCurrent
                    ? 'translateZ(12px) scale(1.05)'
                    : isSteppingAcross
                      ? 'translateZ(10px) scale(1.06)'
                      : 'translateZ(2px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/*
                  BILLBOARD LAYER — counter-rotates the stage's
                  `rotateX(60deg) rotateZ(-45deg)` so the mark and its label
                  face the camera and stay legible.

                  Without this the tile's contents inherit the board rotation:
                  the icons skew and the labels end up rotated ~45 degrees at
                  9px, which is unreadable. `DistrictLandmark` and
                  `PlayerTokenMark` already counter-rotate this way — the tiles
                  were the one thing on the board that did not, which is why
                  every space label came out crooked.

                  The tile itself stays flat on the plane: it is the floor.
                  Only what sits ON it stands up.
                */}
                <span
                  className="flex flex-col items-center justify-center gap-0.5"
                  style={{
                    transform: 'rotateZ(45deg) rotateX(-60deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <SpaceMark
                    space={space}
                    guardian={guardian}
                    stepping={isSteppingAcross}
                    markerCosmetic={markerCosmetic}
                  />

                  {/* One line, one size, centred under every mark. 9px was
                    * effectively ~6px on screen once the board scale and the
                    * isometric foreshortening were applied, so it went up to
                    * 10px at full strength with a shadow that keeps it legible
                    * over amber, teal and coral tiles alike. */}
                  <span
                    className="max-w-[58px] truncate text-[10px] font-black uppercase leading-none tracking-tight text-white"
                    style={{ textShadow: '0 1px 2px rgba(6,21,39,0.95)' }}
                  >
                    {space.kind === 'SHIELD_CENTRAL'
                      ? 'Go'
                      : space.kind === 'SCAM_WATCH'
                        ? 'Safe'
                        : space.kind === 'PHISHING_TRAP'
                          ? 'Trap'
                          : space.kind === 'GUARDIAN_CHECKPOINT'
                            ? 'Guardian'
                            : space.title.split(' ')[0]}
                  </span>
                </span>

                <span className="sr-only">
                  Space {space.index + 1} of {spaces.length}. {BOARD_SPACE_LABEL[space.kind]}.{' '}
                  {space.title}. {spaceStateLabel(space, true)}.{isCurrent ? ' You are here.' : ''}
                </span>
              </button>
            </div>
          );
        })}

        {/* Off-perimeter spaces for DOM completeness and accessibility */}
        <div className="sr-only">
          {spaces.slice(16).map((space) => {
            const isCur = space.index === tokenIndex;
            return (
              <button
                key={space.index}
                type="button"
                onClick={() => onOpenSpace(space)}
                aria-current={isCur ? 'location' : undefined}
              >
                Space {space.index + 1} of {spaces.length}. {BOARD_SPACE_LABEL[space.kind]}.{' '}
                {space.title}. {spaceStateLabel(space, true)}.{isCur ? ' You are here.' : ''}
              </button>
            );
          })}
        </div>

        {/* 3D UPRIGHT PLAYER PAWN IN CURRENT CELL */}
        <div
          className="pointer-events-none z-50 flex items-center justify-center"
          style={{
            gridColumn: currentPos.col,
            gridRow: currentPos.row,
            transformStyle: 'preserve-3d',
          }}
        >
          <PlayerTokenMark tokenId={playerTokenId} hopping={isStepping} className={tokenClass} />
        </div>
      </div>
    </div>
  );
}
