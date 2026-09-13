import type { Cosmetic } from '../types.ts';

/**
 * What Shield Tokens buy.
 *
 * Every entry changes how the player's piece looks on the board and nothing
 * else. There is no item here that moves faster, rolls better, sees a clue
 * earlier or makes a scenario easier, because the moment a spendable currency
 * buys an advantage the game starts teaching that money solves problems — in a
 * product about money mules, job scams and unlicensed moneylending.
 *
 * The rules this catalogue follows, in order of how badly they would be missed:
 *
 *  1. **Everything is visible before it is bought.** No sealed items, no
 *     randomised drops, no "mystery" anything. A loot box is a gambling
 *     mechanic, and this is a crime-prevention programme for 10-24s.
 *  2. **A price never changes.** No discounts, no timers, no "last chance".
 *     Urgency is the exact pressure tactic half the scenarios teach players to
 *     recognise; using it to sell them a colour would be indefensible.
 *  3. **Nothing here is recognition.** A Guardian and an achievement say a
 *     player demonstrated a skill. A cosmetic says they chose a colour. The
 *     names below are deliberately about the LOOK, not about mastery — v1's
 *     shop sold a badge called "Anti-Scam Pioneer · Mastery of phishing
 *     vectors" for 80 tokens, which is a claim of competence with a price tag.
 *  4. **Affordable inside one session.** A 24-turn run pays roughly 400-500
 *     tokens, so a player can own one or two of the paid pieces by the end and
 *     never all of them. Nothing is gated behind coming back tomorrow.
 *  5. **Nobody has to buy anything to look like themselves.** Four of the
 *     pieces cost nothing and are offered before the run starts. The shop adds
 *     to that; it is not the gate in front of it.
 */

/**
 * The four starter pieces.
 *
 * Free, owned from the first second, and offered before the run begins — a
 * player picks their colour the way they pick their codename, without owing
 * anybody anything for it. The shop is then somewhere to go later rather than
 * the only way to look like yourself, which is the difference between a
 * cosmetic system and a toll gate.
 *
 * They are plain colours. What the paid pieces add is the lit ring, which is
 * the honest version of the split: you are unlocking the glow, not permission
 * to have a colour.
 */
export const STARTERS: Cosmetic[] = [
  {
    id: 'standard',
    name: 'Standard amber',
    cost: 0,
    blurb: 'The piece every session starts with.',
    colour: '#f2ae33',
    glow: null,
  },
  {
    id: 'civic-blue',
    name: 'Civic blue',
    cost: 0,
    blurb: 'The blue of the city works crews.',
    colour: '#5fa0e8',
    glow: null,
  },
  {
    id: 'peer-teal',
    name: 'Peer teal',
    cost: 0,
    blurb: 'The colour Peer Shield uses across the city.',
    colour: '#35b3a6',
    glow: null,
  },
  {
    id: 'park-green',
    name: 'Park green',
    cost: 0,
    blurb: 'The green of the community boards.',
    colour: '#35a071',
    glow: null,
  },
];

/** What the piece looks like when nothing has been chosen. */
export const DEFAULT_COSMETIC: Cosmetic = STARTERS[0]!;

/** Bought with Shield Tokens. Every one of them is a starter plus a lit ring. */
export const UNLOCKABLES: Cosmetic[] = [
  {
    id: 'amber-halo',
    name: 'Amber halo',
    cost: 160,
    blurb: 'The standard piece, with a warm ring around it.',
    colour: '#f2ae33',
    glow: '#f6c669',
  },
  {
    id: 'night-watch',
    name: 'Night watch',
    cost: 180,
    blurb: 'Deep navy with a pale rim. Quiet on a bright board.',
    colour: '#24608f',
    glow: '#b9cadd',
  },
  {
    id: 'signal-coral',
    name: 'Signal coral',
    cost: 200,
    blurb: 'High-visibility coral, ringed in white.',
    colour: '#d76b53',
    glow: '#f7dfd9',
  },
  {
    id: 'leaf-lantern',
    name: 'Leaf lantern',
    cost: 240,
    blurb: 'Green with a lit edge, like a park lamp at dusk.',
    colour: '#35a071',
    glow: '#b6dcc7',
  },
];

export const COSMETICS: Cosmetic[] = [...STARTERS, ...UNLOCKABLES];

export const COSMETIC_BY_ID: Record<string, Cosmetic> = Object.fromEntries(
  COSMETICS.map((cosmetic) => [cosmetic.id, cosmetic]),
);

/** The look currently on the piece — the default whenever nothing is equipped. */
export function equippedCosmetic(equipped: string | null): Cosmetic {
  if (!equipped) return DEFAULT_COSMETIC;
  return COSMETIC_BY_ID[equipped] ?? DEFAULT_COSMETIC;
}

/** True for a piece anybody may wear without paying for it. */
export const isStarter = (id: string): boolean => COSMETIC_BY_ID[id]?.cost === 0;
