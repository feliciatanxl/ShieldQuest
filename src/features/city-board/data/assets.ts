import type { CityDistrictId, NodeKind } from '../../../../types/city-board';

/**
 * Art slots.
 *
 * Every illustrated element in the player app resolves its artwork through this
 * one registry. A slot holds a path under `public/` once the file exists, and
 * `null` while it is still a placeholder — at which point the matching component
 * renders its CSS/icon placeholder instead. Both render into the same box, so a
 * slot can be filled or emptied without touching a layout.
 *
 * The illustrated ShieldQuest set arrives in waves. The V2.2 wave supplied the
 * three Guardian portraits, the four district scenes, the player token and the
 * board node marks; the mission-type marks, mini-game badges and the Guardian
 * pose variants are not drawn yet and stay null below rather than being faked
 * with substitute artwork.
 *
 * Conventions for the files themselves are in `public/assets/README.md`.
 */

/** A path under `public/`, or null while the slot is still a placeholder. */
export type ArtSlotSource = string | null;

const SHIELDQUEST = '/assets/shieldquest';

/**
 * Square Guardian portraits. Rendered inside a rounded plate, from the 28px
 * selector tile up to the 44px plate on a Guardian card.
 *
 * V2.2 supplies one neutral pose each. The success/action poses the debrief and
 * reward surfaces would use are not drawn yet, so those surfaces keep showing
 * the neutral portrait rather than a stand-in.
 *
 * Echo, Cluepaw and ByteBuddy joined the roster when the Guardian set grew from
 * three to six, and their portraits were authored in-repo as plain SVG rather
 * than exported from a design tool. They follow the same construction as the
 * V2.2 three — a 200×200 square, one two-stop gradient for the body, a light
 * face patch, dot eyes with a highlight, and one silhouette feature each
 * (Echo's ears and ripples, Cluepaw's ears and magnifier, ByteBuddy's antenna
 * and frame) so the six are still separable at a 28px selector tile.
 */
export { GUARDIAN_ART } from '../../guardians/data';

/**
 * Square district marks, shown on board stops and district headers.
 *
 * Still null, deliberately. V2.2 drew the districts as wide 800×300 scenes, not
 * as square marks — see `DISTRICT_SCENE_ART` below. Cropping a scene to the
 * 46px board stop leaves an unreadable fragment of one building, so the small
 * plates keep their lucide mark on the district's palette plate, which is what
 * actually distinguishes four stops at that size. This slot stays open for the
 * square district icons when they are drawn.
 */
export const DISTRICT_ART: Record<CityDistrictId, ArtSlotSource> = {
  school: null,
  retail: null,
  digital: null,
  community: null,
};

/**
 * Wide district scenes (≈800×300). Used only where there is enough horizontal
 * room to read one — the district sheet header and the district route band —
 * and never squeezed into a square plate.
 */
export const DISTRICT_SCENE_ART: Record<CityDistrictId, ArtSlotSource> = {
  school: `${SHIELDQUEST}/districts/school-street.svg`,
  retail: `${SHIELDQUEST}/districts/retail-district.svg`,
  digital: `${SHIELDQUEST}/districts/digi-district.svg`,
  community: `${SHIELDQUEST}/districts/community-hub.svg`,
};

/** Mission-type marks used on route stops and in the district sheet. */
export const NODE_KIND_ART: Record<NodeKind, ArtSlotSource> = {
  SCENARIO: null, // not in the V2.2 export
  MINI_GAME: null, // not in the V2.2 export
  PEER_SHIELD: null, // not in the V2.2 export
  GUARDIAN_CHALLENGE: null, // not in the V2.2 export
  GROUP_DECISION: null, // not in the V2.2 export
};

/** Mini-game badges, keyed by the mini-game id from `minigame-data.ts`. */
export const MINI_GAME_BADGE_ART: Record<string, ArtSlotSource> = {
  'spot-the-warning-signs': null, // not in the V2.2 export
  'decode-the-clue': null, // not in the V2.2 export
  'risk-or-safe': null, // authored after the V2.2 export
  'clue-match': null, // authored after the V2.2 export
  'who-can-help': null, // authored after the V2.2 export
  'what-happens-next': null, // authored after the V2.2 export
};
