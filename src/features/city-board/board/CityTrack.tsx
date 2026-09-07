import { useEffect, useMemo, useRef, useState } from 'react';
import { SpaceMark } from './SpaceMark';
import { PlayerTokenMark } from './PlayerTokenMark';
import { DistrictLandmark } from './DistrictLandmark';
import { getGridTilePos, type GridTilePos } from './trackGeometry';
import type { ResolvedSpace } from '../hooks/useBoard';
import type { CityDistrictId, BoardGuardian } from '../../../../types/city-board';

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
      className="isometric-viewport relative w-full h-[600px] flex-1 overflow-hidden flex items-center justify-center bg-radial from-navy-900 via-navy-950 to-navy-950 p-2 select-none"
    >
      {/* 2.5D Ground Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(59, 130, 246, 0.18) 0%, transparent 70%)',
        }}
      />

      {/* 2.5D ISOMETRIC STAGE: 5x5 CSS Grid rotated in 3D */}
      <div
        className={`isometric-stage relative grid grid-cols-5 grid-rows-5 gap-2 rounded-3xl border-4 border-amber-400/25 bg-navy-950/95 p-3 shadow-[0_45px_90px_rgba(0,0,0,0.95)] ${
          isAdvancing ? 'advancing' : ''
        }`}
        style={{
          perspective: '1000px',
          transform: `scale(${boardScale}) rotateX(60deg) rotateZ(-45deg)`,
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
                aria-label={`${space.title}, ${space.kind}`}
                className={`isometric-tile-surface group relative flex h-full w-full flex-col items-center justify-center rounded-xl border-2 p-1 text-center shadow-md transition-all focus:outline-none ${
                  pos.isCorner
                    ? 'border-amber-400/90 bg-gradient-to-br from-amber-500/25 via-navy-900 to-navy-950 text-white shadow-amber-500/20'
                    : space.completed
                      ? 'border-leaf-400/90 bg-gradient-to-br from-leaf-600/25 via-navy-900 to-navy-950 text-white shadow-leaf-500/15'
                      : isCurrent
                        ? 'border-amber-300 bg-navy-900 ring-4 ring-amber-400/50 shadow-amber-400/30'
                        : 'border-white/20 bg-navy-900/90 text-white/90 hover:border-white/50'
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
                {/* Tile Icon / Mark */}
                <div className="flex shrink-0 items-center justify-center">
                  <SpaceMark
                    space={space}
                    guardian={guardian}
                    stepping={isSteppingAcross}
                    markerCosmetic={markerCosmetic}
                  />
                </div>

                {/* Compact Tile Label */}
                <span className="mt-0.5 line-clamp-1 w-full text-[9px] font-black uppercase tracking-tight text-white/90">
                  {space.kind === 'SHIELD_CENTRAL'
                    ? 'GO'
                    : space.kind === 'SCAM_WATCH'
                      ? 'Safe'
                      : space.kind === 'PHISHING_TRAP'
                        ? 'Trap'
                        : space.kind === 'GUARDIAN_CHECKPOINT'
                          ? 'Sanctuary'
                          : space.title.split(' ')[0]}
                </span>
              </button>
            </div>
          );
        })}

        {/* 3D UPRIGHT PLAYER PAWN IN CURRENT CELL */}
        <div
          className="pointer-events-none z-50 flex items-center justify-center"
          style={{
            gridColumn: currentPos.col,
            gridRow: currentPos.row,
            transformStyle: 'preserve-3d',
          }}
        >
          <PlayerTokenMark
            tokenId={playerTokenId}
            hopping={isStepping}
            className={tokenClass}
          />
        </div>
      </div>
    </div>
  );
}
