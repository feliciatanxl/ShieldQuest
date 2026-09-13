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
 *     tokens, so a player can own two or three of these by the end and never
 *     all of them. Nothing is gated behind coming back tomorrow.
 */

/** What the piece looks like before anything is bought. Always available. */
export const DEFAULT_COSMETIC: Cosmetic = {
  id: 'standard',
  name: 'Standard piece',
  cost: 0,
  blurb: 'The amber piece every session starts with.',
  colour: '#f2ae33',
  glow: null,
};

export const COSMETICS: Cosmetic[] = [
  DEFAULT_COSMETIC,
  {
    id: 'civic-blue',
    name: 'Civic blue',
    cost: 80,
    blurb: 'The blue of the city works crews.',
    colour: '#5fa0e8',
    glow: null,
  },
  {
    id: 'peer-teal',
    name: 'Peer teal',
    cost: 120,
    blurb: 'The colour Peer Shield uses across the city.',
    colour: '#35b3a6',
    glow: null,
  },
  {
    id: 'amber-glow',
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

export const COSMETIC_BY_ID: Record<string, Cosmetic> = Object.fromEntries(
  COSMETICS.map((cosmetic) => [cosmetic.id, cosmetic]),
);

/** The look currently on the piece — the default whenever nothing is equipped. */
export function equippedCosmetic(equipped: string | null): Cosmetic {
  if (!equipped) return DEFAULT_COSMETIC;
  return COSMETIC_BY_ID[equipped] ?? DEFAULT_COSMETIC;
}
