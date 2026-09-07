import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Info,
  Shield,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CityTrack } from './board/CityTrack';
import { DiceRoller } from './board/DiceRoller';
import { SpaceSheet } from './board/SpaceSheet';
import { DistrictSecuredCelebration } from './board/DistrictSecuredCelebration';
import { DistrictSheet } from './DistrictSheet';
import { DistrictDiscovery } from './DistrictDiscovery';
import { DistrictScene } from './DistrictArt';
import { DISTRICT_CHAPTER } from './data/world-data';
import { CasebookDrawer } from './hud/CasebookDrawer';
import { GuardianVaultDrawer } from './hud/GuardianVaultDrawer';
import { SquadViewModal } from './hud/SquadViewModal';
import { CityInfoSheet } from './CityInfoSheet';
import { useBoard, type ResolvedSpace } from './hooks/useBoard';
import { useDiceTurn } from './hooks/useDiceTurn';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useWorld, type ResolvedDistrict } from './hooks/useWorld';
import { usePlayer } from './hooks/useCityPlayer';
import { playCue } from './sound';
import { useSessionStore } from '../../stores/sessionStore';
import type { CityDistrictId } from '../../../types/city-board';

const DISTRICT_PROGRESSION: CityDistrictId[] = ['school', 'retail', 'digital', 'community'];

export function CityHomeExperience() {
  const { profile, guardians, equippedIn, discoverDistrict } = usePlayer();
  const { districts, progress } = useWorld();
  const reducedMotion = useReducedMotion(profile.settings.reducedMotion);

  // Active district in Monopoly Go loop (defaults to school, advances sequentially)
  const [districtIndex, setDistrictIndex] = useState<number>(() => {
    const initial = profile.currentDistrictId ?? 'school';
    const found = DISTRICT_PROGRESSION.indexOf(initial);
    return found >= 0 ? found : 0;
  });

  const activeDistrictId = DISTRICT_PROGRESSION[districtIndex] ?? 'school';

  const {
    spaces,
    position,
  } = useBoard(activeDistrictId);

  // HUD & Drawer states
  const [casebookOpen, setCasebookOpen] = useState(false);
  const [guardianVaultOpen, setGuardianVaultOpen] = useState(false);
  const [squadModalOpen, setSquadModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [goBonusToast, setGoBonusToast] = useState(false);
  const [openDistrict, setOpenDistrict] = useState<ResolvedDistrict | null>(null);
  const [discoveryDistrict, setDiscoveryDistrict] = useState<ResolvedDistrict | null>(null);
  const [discoveryLanding, setDiscoveryLanding] = useState<ResolvedSpace | null>(null);

  const openDistrictDirectly = (district: ResolvedDistrict) => {
    if (turn.busy) return;
    if (!district.discovered) {
      discoverDistrict(district.id);
      setDiscoveryLanding(null);
      setDiscoveryDistrict(district);
      return;
    }
    setOpenDistrict(district);
  };

  const closeDiscovery = () => {
    const landed = discoveryLanding;
    setDiscoveryDistrict(null);
    setDiscoveryLanding(null);
    if (landed) setLandedSpace(landed);
  };

  const exploreDiscoveredDistrict = () => {
    if (!discoveryDistrict) return;
    const target = discoveryDistrict;
    setDiscoveryDistrict(null);
    setDiscoveryLanding(null);
    setLandedSpace(null);
    turn.endTurn();
    setOpenDistrict(target);
  };

  const [landedSpace, setLandedSpace] = useState<ResolvedSpace | null>(null);
  const [landingSpace, setLandingSpace] = useState<ResolvedSpace | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const landingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentActiveDistrict = useMemo(
    () => districts.find((d) => d.id === activeDistrictId),
    [districts, activeDistrictId],
  );

  // Watch for district completion to trigger celebration sequence
  const hasCelebratedRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (currentActiveDistrict?.cleared && !hasCelebratedRef.current[activeDistrictId]) {
      hasCelebratedRef.current[activeDistrictId] = true;
      playCue('victory', soundEnabled);
      setCelebrationOpen(true);
    }
  }, [currentActiveDistrict?.cleared, activeDistrictId, soundEnabled]);

  useEffect(
    () => () => {
      if (landingTimer.current) clearTimeout(landingTimer.current);
    },
    [],
  );

  const onLand = useCallback(
    (index: number) => {
      const destination = spaces[index] ?? null;
      if (!destination) return;

      // Passing or landing on GO / Shield Central (+20 Shield Tokens bonus!)
      if (index === 0) {
        useSessionStore.setState((s) => ({ shieldTokens: s.shieldTokens + 20 }));
        playCue('reward', soundEnabled);
        setGoBonusToast(true);
        setTimeout(() => setGoBonusToast(false), 2400);
      } else {
        playCue('land', soundEnabled);
      }

      if (landingTimer.current) clearTimeout(landingTimer.current);
      setLandingSpace(destination);
      const reveal = () => {
        setLandingSpace(null);
        const districtId = destination.districtId;
        const newlyDiscovered =
          districtId && !profile.discoveredDistricts.includes(districtId);
        if (newlyDiscovered && districtId) {
          discoverDistrict(districtId);
          setDiscoveryLanding(destination);
          setDiscoveryDistrict(
            districts.find((district) => district.id === districtId) ?? null,
          );
        } else {
          setLandedSpace(destination);
        }
      };

      if (reducedMotion) reveal();
      else landingTimer.current = setTimeout(reveal, 450);
    },
    [districts, profile.discoveredDistricts, reducedMotion, soundEnabled, spaces, discoverDistrict],
  );

  const turn = useDiceTurn({
    position,
    reducedMotion,
    sound: soundEnabled,
    onLand,
  });

  const districtNames = useMemo(
    () =>
      districts.reduce(
        (acc, district) => ({ ...acc, [district.id]: district.name }),
        {} as Record<CityDistrictId, string>,
      ),
    [districts],
  );

  const closeSheet = () => {
    setLandedSpace(null);
    turn.endTurn();
  };

  const openSpaceDirectly = (space: ResolvedSpace) => {
    if (turn.busy) return;
    if (landingTimer.current) clearTimeout(landingTimer.current);
    setLandingSpace(null);
    setLandedSpace(space);
  };

  // Handle District Advancement Loop
  const handleAdvanceDistrict = () => {
    setCelebrationOpen(false);
    setIsAdvancing(true);
    playCue('victory', soundEnabled);

    // Record badge & award 100 tokens
    useSessionStore.getState().recordDistrictBadge(activeDistrictId);

    setTimeout(() => {
      const nextIdx = (districtIndex + 1) % DISTRICT_PROGRESSION.length;
      setDistrictIndex(nextIdx);
      setIsAdvancing(false);
    }, 750);
  };

  const nextDistrictId =
    DISTRICT_PROGRESSION[(districtIndex + 1) % DISTRICT_PROGRESSION.length];
  const nextDistrictName = nextDistrictId ? districtNames[nextDistrictId] : undefined;

  return (
    <div className="city-home relative flex h-full min-h-[100dvh] w-full flex-col overflow-hidden bg-navy-950 text-white select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. FLOATING CURRENT QUEST CARD (Top-Left, Z-Index 40)         */}
      {/* ------------------------------------------------------------- */}
      <div className="pointer-events-none absolute top-4 left-4 z-40 max-w-[220px] sm:max-w-[280px] rounded-2xl border border-white/20 bg-navy-950/85 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
            ShieldQuest City
          </h2>
        </div>
        <p className="mt-0.5 truncate text-[13px] font-extrabold uppercase tracking-tight text-white">
          {spaces[turn.tokenIndex]?.title ?? currentActiveDistrict?.name ?? 'School Street'}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-white/70">
          <span className="truncate">{currentActiveDistrict?.name ?? 'School Street'}</span>
          <span>·</span>
          <span className="text-amber-300 font-extrabold">
            Stage {districtIndex + 1}/4
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FLOATING HUD CONTROLS (Top-Right, Z-Index 40)              */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 md:gap-2 pointer-events-auto">
        {/* Guardian Vault Button */}
        <button
          type="button"
          onClick={() => setGuardianVaultOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-navy-950/85 px-2.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          title="Open Guardian Vault"
        >
          <Shield className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Guardians</span>
        </button>

        {/* Casebook Drawer Button */}
        <button
          type="button"
          onClick={() => setCasebookOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-navy-950/85 px-2.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          title="Open Shield Casebook"
        >
          <BookOpen className="h-3.5 w-3.5 text-teal-300" />
          <span className="hidden sm:inline">Casebook</span>
        </button>

        {/* Squad View Button */}
        <button
          type="button"
          onClick={() => setSquadModalOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-navy-950/85 px-2.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          title="My Squad"
        >
          <Users className="h-3.5 w-3.5 text-civic-300" />
          <span className="hidden sm:inline">Squad</span>
        </button>

        {/* Token Counter */}
        <div className="flex h-8 items-center gap-1.5 rounded-full border border-amber-400/40 bg-navy-950/85 px-3 text-[12px] font-black tabular-nums text-amber-300 shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{profile.shieldTokens}</span>
        </div>

        {/* Playwright-compatible definition list */}
        <dl className="sr-only">
          <dt>Coins</dt>
          <dd>{profile.coins}</dd>
          <dt>Resilience</dt>
          <dd>{profile.resiliencePoints}</dd>
          <dt>Shield Tokens</dt>
          <dd>{profile.shieldTokens}</dd>
        </dl>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playCue('roll', true);
          }}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-navy-950/85 text-white/80 shadow-lg backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-leaf-400" />
          ) : (
            <VolumeX className="h-4 w-4 text-white/50" />
          )}
        </button>

        {/* About / Info */}
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-label="About this game"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-navy-950/85 text-white/80 shadow-lg backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. GO PASS TOAST BANNER                                        */}
      {/* ------------------------------------------------------------- */}
      {goBonusToast && (
        <div className="animate-pop pointer-events-none absolute top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-navy-950 shadow-2xl">
          <Sparkles className="h-4 w-4" />
          <span>Shield Central Passed! +20 Shield Tokens</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. DEDICATED 2.5D ISOMETRIC BOARD CANVAS                       */}
      {/* ------------------------------------------------------------- */}
      <main className="relative w-full h-[600px] flex-1 overflow-hidden flex items-center justify-center">
        <CityTrack
          spaces={spaces}
          tokenIndex={turn.tokenIndex}
          steppingIndices={turn.steppingIndices}
          guardians={guardians}
          districtNames={districtNames}
          discoveredDistricts={profile.discoveredDistricts}
          onOpenSpace={openSpaceDirectly}
          playerTokenId={profile.playerTokenId}
          trailClass={equippedIn('routeTrail') ? 'stroke-civic-500/65' : undefined}
          tokenClass={equippedIn('playerToken') ? '!border-civic-400' : undefined}
          markerCosmetic={Boolean(equippedIn('boardMarker'))}
          activeDistrictId={activeDistrictId}
          districtCompleted={currentActiveDistrict?.completed ?? 0}
          districtTotal={currentActiveDistrict?.total ?? 3}
          districtCleared={currentActiveDistrict?.cleared ?? false}
          isAdvancing={isAdvancing}
          onDistrictSecuredClick={() => setCelebrationOpen(true)}
        />
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. PINNED BOTTOM ACTION BAR: Tactile Monopoly Go Dice Roller   */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2 w-full max-w-[640px] px-4">
        <DiceRoller
          phase={turn.phase}
          value={turn.value}
          onRoll={turn.roll}
          disabled={
            landedSpace !== null ||
            landingSpace !== null ||
            aboutOpen ||
            celebrationOpen ||
            openDistrict !== null ||
            discoveryDistrict !== null ||
            isAdvancing
          }
        />

        {/* City Chapter Progress Navigation */}
        <nav aria-label="City chapter progress" className="w-full">
          <ul className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {districts.map((district) => {
              const isCurrent = district.id === activeDistrictId;
              const state = district.cleared
                ? 'Secured'
                : isCurrent
                  ? 'Current chapter'
                  : district.discovered
                    ? 'Discovered'
                    : 'Unexplored';
              const progressLabel =
                district.total > 0
                  ? `${district.completed}/${district.total}`
                  : 'Chapter';
              const chapter = DISTRICT_CHAPTER[district.id];

              return (
                <li key={district.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openDistrictDirectly(district)}
                    aria-current={isCurrent ? 'location' : undefined}
                    className={`chapter-chip relative flex min-h-[44px] sm:min-h-[50px] w-full flex-col justify-end overflow-hidden rounded-xl border px-1.5 pb-1 pt-1 text-left transition hover:-translate-y-0.5 hover:border-white/45 backdrop-blur-md ${
                      isCurrent ? 'border-amber-400 bg-white/15' : 'border-white/15 bg-navy-950/80'
                    }`}
                  >
                    <DistrictScene
                      districtId={district.id}
                      className={
                        district.discovered
                          ? 'opacity-35'
                          : 'opacity-20 saturate-50 grayscale-[0.2]'
                      }
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 ${
                        district.discovered ? 'to-navy-950/20' : 'to-white/10'
                      }`}
                    />
                    <span className="relative flex w-full items-center justify-between gap-1">
                      <span className="min-w-0 flex-1 truncate text-[9px] font-extrabold uppercase tracking-wide text-white">
                        {district.id === 'digital' ? 'Digi' : district.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-extrabold tabular-nums text-amber-300">
                        {progressLabel}
                      </span>
                    </span>
                    <span className="relative mt-0.5 block w-full truncate text-[8px] font-bold uppercase tracking-[0.08em] text-white/65">
                      {state}
                    </span>
                    <span className="sr-only">
                      Open {district.name}, {chapter.label}:{' '}
                      {chapter.title}.{' '}
                      {district.total > 0
                        ? `${district.completed} of ${district.total} built activities completed.`
                        : 'Chapter available; activities are planned for prototype expansion.'}{' '}
                      {state}.
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="text-center text-[9px] leading-tight text-white/60">
          The dice moves you. Your decisions shape what you learn.{' '}
          <span className="font-bold text-white/80">
            {progress.completed}/{progress.total} activities
          </span>
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALS, SHEETS & DRAWERS                                    */}
      {/* ------------------------------------------------------------- */}

      {/* Landing Space Interaction Sheet */}
      <SpaceSheet
        space={landedSpace}
        guardians={guardians}
        districtName={
          landedSpace?.districtId ? districtNames[landedSpace.districtId] : 'Shield Central'
        }
        onClose={closeSheet}
      />

      {/* District Sheet for Chapter Exploration */}
      <DistrictSheet district={openDistrict} onClose={() => setOpenDistrict(null)} />

      {/* District Discovery Dialog */}
      <DistrictDiscovery
        district={discoveryDistrict}
        onClose={closeDiscovery}
        onExplore={exploreDiscoveredDistrict}
      />

      {/* District Secured Victory Burst & Fly-out Trigger */}
      {celebrationOpen && (
        <DistrictSecuredCelebration
          districtId={activeDistrictId}
          districtName={currentActiveDistrict?.name ?? 'District'}
          nextDistrictId={nextDistrictId}
          nextDistrictName={nextDistrictName}
          onContinue={handleAdvanceDistrict}
        />
      )}

      {/* SPF Casebook Slide-over Drawer */}
      <CasebookDrawer open={casebookOpen} onClose={() => setCasebookOpen(false)} />

      {/* SPF Guardian Vault Slide-over Drawer */}
      <GuardianVaultDrawer
        open={guardianVaultOpen}
        onClose={() => setGuardianVaultOpen(false)}
      />

      {/* SPF Squad View Modal */}
      <SquadViewModal open={squadModalOpen} onClose={() => setSquadModalOpen(false)} />

      {/* Info / About Sheet */}
      <CityInfoSheet open={aboutOpen} onClose={() => setAboutOpen(false)} spaces={spaces} />
    </div>
  );
}
