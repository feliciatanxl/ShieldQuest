import React from 'react';

/**
 * Original pixel-art Singapore neighbourhood scenery, drawn as crisp SVG so it scales without blur.
 * Colours come from --sg-* CSS variables (globals.css) so every piece follows light/dark theme.
 * All pieces are decorative: aria-hidden and pointer-events-none.
 */

type SvgProps = { className?: string; style?: React.CSSProperties };
const base = { shapeRendering: 'crispEdges' as const, 'aria-hidden': true, focusable: false };
const c = (v: string) => `var(--sg-${v})`;

/** HDB slab block: parapet, coloured trim band, window grid (some lit), open void deck with pillars. */
const HdbBlock: React.FC<{ x: number; w: number; h: number; ground: number; trim: string; seed?: number; blk?: string }> = ({ x, w, h, ground, trim, seed = 1, blk }) => {
  const top = ground - h;
  const cols = Math.floor((w - 4) / 4);
  const rows = Math.floor((h - 12) / 5);
  const wins: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const lit = ((r * 7 + k * 3 + seed) % 5) === 0;
      wins.push(<rect key={`${r}-${k}`} x={x + 3 + k * 4} y={top + 5 + r * 5} width={2} height={3} fill={lit ? c('lit') : c('window')} />);
    }
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={c('wall')} />
      <rect x={x + w - 3} y={top} width={3} height={h} fill={c('wall2')} />
      <rect x={x - 1} y={top - 1} width={w + 2} height={2} fill={c('wall2')} />
      <rect x={x} y={top + 2} width={w} height={1} fill={trim} />
      {wins}
      {/* void deck */}
      <rect x={x} y={ground - 6} width={w} height={6} fill={c('shade')} />
      {Array.from({ length: Math.floor(w / 6) + 1 }).map((_, i) => (
        <rect key={i} x={x + i * 6} y={ground - 6} width={1.5} height={6} fill={c('wall')} />
      ))}
      <rect x={x} y={ground - 7} width={w} height={1} fill={trim} />
      {blk && (
        <>
          <rect x={x + 2} y={top + 3} width={8} height={5} fill={c('sign')} />
          <text x={x + 6} y={top + 7} fontSize={3.4} textAnchor="middle" fill="#fff" fontFamily="Pixelify Sans, monospace">{blk}</text>
        </>
      )}
    </g>
  );
};

/** Rain tree: wide layered canopy on a short trunk. */
const RainTree: React.FC<{ x: number; ground: number; s?: number }> = ({ x, ground, s = 1 }) => (
  <g transform={`translate(${x} ${ground}) scale(${s})`}>
    <rect x={-1} y={-9} width={2} height={9} fill={c('trunk')} />
    <rect x={-8} y={-15} width={16} height={5} fill={c('leaf2')} />
    <rect x={-10} y={-13} width={20} height={3} fill={c('leaf2')} />
    <rect x={-7} y={-18} width={14} height={4} fill={c('leaf')} />
    <rect x={-4} y={-20} width={8} height={2} fill={c('leaf')} />
    <rect x={-5} y={-17} width={3} height={1} fill={c('leaf3')} />
    <rect x={2} y={-16} width={3} height={1} fill={c('leaf3')} />
  </g>
);

/** Low hedge with bougainvillea flowers. */
const Hedge: React.FC<{ x: number; ground: number; w: number }> = ({ x, ground, w }) => (
  <g>
    <rect x={x} y={ground - 4} width={w} height={4} fill={c('leaf2')} />
    <rect x={x + 1} y={ground - 5} width={w - 2} height={1} fill={c('leaf')} />
    {Array.from({ length: Math.floor(w / 4) }).map((_, i) => (
      <rect key={i} x={x + 1 + i * 4 + (i % 2)} y={ground - 4 - (i % 2)} width={1} height={1} fill={c('flower')} />
    ))}
  </g>
);

/** Street lamp with warm head (glows in dark theme via --sg-lamp). */
const Lamp: React.FC<{ x: number; ground: number }> = ({ x, ground }) => (
  <g>
    <rect x={x} y={ground - 16} width={1} height={16} fill={c('pole')} />
    <rect x={x} y={ground - 16} width={4} height={1} fill={c('pole')} />
    <rect x={x + 3} y={ground - 15} width={2} height={1} fill={c('lamp')} />
  </g>
);

/** Panoramic estate skyline: HDB blocks, rain trees, hedges and lamps on a pavement. */
export const EstateSkyline: React.FC<SvgProps & { dense?: boolean }> = ({ className = '', style }) => {
  const g = 60;
  return (
    <svg {...base} viewBox="0 0 320 64" preserveAspectRatio="xMidYMax slice" className={`pointer-events-none ${className}`} style={style}>
      <HdbBlock x={6} w={30} h={46} ground={g} trim={c('trim')} seed={2} blk="128" />
      <HdbBlock x={44} w={22} h={34} ground={g} trim={c('trim2')} seed={4} />
      <RainTree x={76} ground={g} />
      <HdbBlock x={90} w={34} h={52} ground={g} trim={c('trim3')} seed={1} blk="130" />
      <Hedge x={126} ground={g} w={18} />
      <HdbBlock x={150} w={26} h={40} ground={g} trim={c('trim')} seed={3} />
      <RainTree x={188} ground={g} s={1.2} />
      <Lamp x={202} ground={g} />
      <HdbBlock x={212} w={32} h={48} ground={g} trim={c('trim2')} seed={5} blk="132" />
      <Hedge x={246} ground={g} w={14} />
      <HdbBlock x={264} w={24} h={36} ground={g} trim={c('trim3')} seed={6} />
      <RainTree x={300} ground={g} s={0.9} />
      <rect x={0} y={g} width={320} height={4} fill={c('pave')} />
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={i * 8} y={g} width={1} height={4} fill={c('pave2')} />
      ))}
    </svg>
  );
};

/** Small standalone tree / plant sprites for framing edges. */
export const TreeSprite: React.FC<SvgProps> = ({ className = '', style }) => (
  <svg {...base} viewBox="-11 -21 22 21" className={`pointer-events-none ${className}`} style={style}>
    <RainTree x={0} ground={0} />
  </svg>
);

export const PlanterSprite: React.FC<SvgProps> = ({ className = '', style }) => (
  <svg {...base} viewBox="0 0 16 12" className={`pointer-events-none ${className}`} style={style}>
    <rect x={2} y={7} width={12} height={5} fill={c('wall2')} />
    <rect x={1} y={6} width={14} height={2} fill={c('wall')} />
    <rect x={3} y={2} width={10} height={4} fill={c('leaf2')} />
    <rect x={5} y={0} width={6} height={2} fill={c('leaf')} />
    <rect x={4} y={3} width={1} height={1} fill={c('flower')} />
    <rect x={9} y={1} width={1} height={1} fill={c('flower')} />
    <rect x={11} y={4} width={1} height={1} fill={c('flower')} />
  </svg>
);

/* ── District thumbnails (96×48) ─────────────────────────────── */

const Sky: React.FC = () => (
  <>
    <rect width={96} height={48} fill={c('sky')} />
    <rect x={10} y={6} width={10} height={2} fill={c('cloud')} />
    <rect x={12} y={4} width={5} height={2} fill={c('cloud')} />
    <rect x={64} y={9} width={12} height={2} fill={c('cloud')} />
    <rect y={42} width={96} height={6} fill={c('pave')} />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={i * 8} y={42} width={1} height={6} fill={c('pave2')} />)}
  </>
);

/** School: low block with clock, flag pole, fence and field. */
const SchoolScene = () => (
  <>
    <Sky />
    <rect x={18} y={20} width={56} height={22} fill={c('wall')} />
    <rect x={18} y={18} width={56} height={2} fill="#4E9BD6" />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={22 + i * 9} y={24} width={5} height={4} fill={c('window')} />)}
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={22 + i * 9} y={31} width={5} height={4} fill={c('window')} />)}
    <rect x={42} y={36} width={8} height={6} fill={c('shade')} />
    <rect x={43} y={12} width={6} height={6} fill={c('wall')} />
    <rect x={45} y={14} width={2} height={2} fill="#17233D" />
    <rect x={82} y={14} width={1} height={28} fill={c('pole')} />
    <rect x={83} y={14} width={6} height={2} fill="#E05252" />
    <rect x={83} y={16} width={6} height={2} fill="#fff" />
    {Array.from({ length: 24 }).map((_, i) => <rect key={i} x={i * 4} y={39} width={1} height={3} fill={c('pole')} />)}
    <rect y={39} width={96} height={1} fill={c('pole')} />
    <RainTree x={8} ground={42} s={0.8} />
  </>
);

/** Retail: shophouse row with five-foot way, awnings and a minimart. */
const RetailScene = () => (
  <>
    <Sky />
    {[
      ['#F3B69A', '#D9735A'],
      ['#A9C5A0', '#5E9A6A'],
      ['#F7E2A8', '#E0A24A'],
      ['#B9D9EC', '#4E9BD6'],
    ].map(([wall, trim], i) => (
      <g key={i}>
        <rect x={6 + i * 22} y={14} width={20} height={28} fill={wall} />
        <rect x={6 + i * 22} y={12} width={20} height={2} fill={trim} />
        <rect x={9 + i * 22} y={17} width={4} height={6} fill={c('window')} />
        <rect x={19 + i * 22} y={17} width={4} height={6} fill={c('window')} />
        <rect x={8 + i * 22} y={17} width={1} height={6} fill={trim} />
        <rect x={23 + i * 22} y={17} width={1} height={6} fill={trim} />
        {/* awning stripes */}
        {Array.from({ length: 5 }).map((_, k) => (
          <rect key={k} x={6 + i * 22 + k * 4} y={27} width={2} height={3} fill={trim} />
        ))}
        <rect x={6 + i * 22} y={30} width={20} height={12} fill={c('shade')} />
        <rect x={10 + i * 22} y={33} width={12} height={9} fill={i === 2 ? c('lit') : c('window')} />
      </g>
    ))}
    <rect x={51} y={25} width={16} height={2} fill="#17233D" />
    <rect x={53} y={25} width={1} height={2} fill="#E8B75D" />
    <rect x={56} y={25} width={1} height={2} fill="#E8B75D" />
    <rect x={59} y={25} width={1} height={2} fill="#E8B75D" />
    <rect x={62} y={25} width={1} height={2} fill="#E8B75D" />
  </>
);

/** Digi-District: elevated rail viaduct with a train and a transit station canopy. */
const DigiScene = () => (
  <>
    <Sky />
    <rect x={56} y={8} width={30} height={30} fill={c('wall2')} />
    {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={59 + i * 5} y={11} width={3} height={24} fill={c('window')} />)}
    <rect y={22} width={96} height={3} fill={c('wall')} />
    {[8, 30, 52, 74].map((x) => <rect key={x} x={x} y={25} width={3} height={17} fill={c('wall')} />)}
    <rect x={8} y={17} width={40} height={5} fill="#F5F5F0" />
    <rect x={8} y={20} width={40} height={1} fill="#159A9C" />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={11 + i * 6} y={18} width={4} height={2} fill={c('window')} />)}
    {/* station canopy */}
    <rect x={14} y={32} width={26} height={2} fill="#159A9C" />
    <rect x={16} y={34} width={1} height={8} fill={c('pole')} />
    <rect x={37} y={34} width={1} height={8} fill={c('pole')} />
    <rect x={24} y={28} width={7} height={4} fill="#fff" />
    <rect x={25} y={29} width={5} height={2} fill="#159A9C" />
  </>
);

/** Community hub: HDB void deck with notice board, stone table set and bicycles. */
const CommunityScene = () => (
  <>
    <Sky />
    <HdbBlock x={10} w={76} h={36} ground={42} trim="#9A86D6" seed={2} />
    <rect x={18} y={33} width={10} height={6} fill="#B78A5A" />
    <rect x={19} y={34} width={3} height={2} fill="#fff" />
    <rect x={23} y={34} width={4} height={3} fill="#F3B69A" />
    <rect x={44} y={38} width={8} height={2} fill={c('wall')} />
    <rect x={47} y={40} width={2} height={2} fill={c('wall')} />
    <rect x={41} y={39} width={2} height={3} fill={c('wall')} />
    <rect x={53} y={39} width={2} height={3} fill={c('wall')} />
    {[64, 72].map((x) => (
      <g key={x}>
        <rect x={x} y={39} width={3} height={3} fill="none" stroke={c('pole')} strokeWidth={0.6} />
        <rect x={x + 4} y={39} width={3} height={3} fill="none" stroke={c('pole')} strokeWidth={0.6} />
        <rect x={x + 2} y={38} width={3} height={1} fill="#E05252" />
      </g>
    ))}
  </>
);

const scenes: Record<string, React.FC> = {
  'school-street': SchoolScene,
  'retail-district': RetailScene,
  'digi-district': DigiScene,
  'community-hub': CommunityScene,
};

export const DistrictScene: React.FC<SvgProps & { id: string }> = ({ id, className = '', style }) => {
  const Scene = scenes[id] ?? SchoolScene;
  return (
    <svg {...base} viewBox="0 0 96 48" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none ${className}`} style={style}>
      <Scene />
    </svg>
  );
};

/** Singapore-style green street name sign with white border (fictional names only). */
export const StreetSign: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-[5px] border-2 border-white bg-[#1f6b4a] px-2.5 py-0.5 font-pixel text-[11px] uppercase tracking-wider text-white shadow-[0_2px_0_0_rgb(0_0_0/0.25)] ${className}`}>
    {children}
  </span>
);

/**
 * Section transition: a pavement strip with a zebra crossing, trees, lamps and a bus shelter,
 * so moving down the page feels like walking between neighbourhood spots.
 */
export const StreetDivider: React.FC<{ label?: string; className?: string }> = ({ label, className = '' }) => (
  <div aria-hidden="true" className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
    <svg {...base} viewBox="0 0 320 26" preserveAspectRatio="xMidYMax slice" className="pointer-events-none block h-auto w-full max-h-24 min-h-[2.5rem]">
      <RainTree x={24} ground={20} s={0.9} />
      <Hedge x={40} ground={20} w={22} />
      <Lamp x={74} ground={20} />
      {/* bus shelter */}
      <g>
        <rect x={210} y={6} width={30} height={2} fill="#159A9C" />
        <rect x={211} y={8} width={1} height={12} fill={c('pole')} />
        <rect x={238} y={8} width={1} height={12} fill={c('pole')} />
        <rect x={214} y={9} width={8} height={6} fill={c('window')} />
        <rect x={224} y={16} width={10} height={1} fill={c('wall2')} />
        <rect x={244} y={4} width={1} height={16} fill={c('pole')} />
        <rect x={242} y={2} width={5} height={4} fill="#fff" />
        <rect x={243} y={3} width={3} height={1} fill="#159A9C" />
      </g>
      <Lamp x={262} ground={20} />
      <RainTree x={292} ground={20} />
      <Hedge x={266} ground={20} w={12} />
      {/* pavement + road */}
      <rect y={20} width={320} height={2} fill={c('pave')} />
      <rect y={22} width={320} height={4} fill={c('road')} />
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={i * 16 + 4} y={23.5} width={6} height={0.8} fill={c('roadline')} />)}
      {/* zebra crossing with Belisha-style beacon poles */}
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={140 + i * 5} y={22} width={3} height={4} fill="#F5F5F0" />)}
      <rect x={136} y={12} width={1} height={8} fill={c('pole')} />
      <rect x={135} y={11} width={3} height={2} fill="#E8B75D" />
      <rect x={172} y={12} width={1} height={8} fill={c('pole')} />
      <rect x={171} y={11} width={3} height={2} fill="#E8B75D" />
    </svg>
    {label && (
      <span className="absolute left-1/2 top-1 -translate-x-1/2 hidden sm:inline-flex">
        <StreetSign>{label}</StreetSign>
      </span>
    )}
  </div>
);

/** Pixel idle sprite from the existing 8-direction sheets (frame index along an 8-frame strip). */
export const IdleSprite: React.FC<{ folder: string; frame?: number; className?: string }> = ({ folder, frame = 0, className = '' }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none inline-block aspect-square ${className}`}
    style={{
      imageRendering: 'pixelated',
      backgroundImage: `url('/game/characters/${folder}/Create_an_original_highl-Idle.png')`,
      backgroundSize: '800% 100%',
      backgroundPosition: `${(frame / 7) * 100}% 0`,
    }}
  />
);

export const SPRITES = {
  student: 'Indian Singaporean male student approximately 18–23 years old',
  worker: 'Chinese Singaporean female young working adult approximately 22–28 years old',
  poly: 'Singaporean female polytechnic student approximately 18–20 years old',
  cafe: 'Eurasian Singaporean female café staff member approximately 20–30 years old',
  rider: 'Malay Singaporean male delivery rider approximately 20–35 years old',
  resident: 'Malay Singaporean female young adult wearing a hijab approximately 18–28 years old',
} as const;
