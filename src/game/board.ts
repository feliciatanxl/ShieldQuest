import type { BoardSpace, District, DistrictId } from './types.ts';

/**
 * The ShieldQuest City board.
 *
 * An original roll-and-move track built from this project's own content. It
 * borrows exactly one thing from tabletop games — the turn rhythm of roll,
 * move, land, play — and nothing else. There is no property, no ownership, no
 * rent, no money taken from other players, no chance or community pile, no
 * jail, no free parking, no railways or utilities, and no board layout, colour
 * banding or trade dress taken from any existing commercial game.
 *
 * ## The dice decide one thing
 *
 * Movement. Nothing else. A roll cannot make a decision safe, cannot pay for a
 * community upgrade, cannot strengthen a Guardian and cannot mark anyone a
 * winner. It chooses which situation the player meets next; what they learn
 * from it is decided entirely by the choice they make once they are inside it.
 * This is the line that keeps the proposal's promise that Guardians are earned
 * "by demonstrating S.H.I.E.L.D. skills, not through randomised loot boxes".
 *
 * ## Shape
 *
 * Twenty-eight spaces: four district gates on the corners, six spaces along
 * each side. Every district carries two decision spaces, a clue space, a
 * situation space, a Guardian checkpoint and a community space, so a player who
 * never leaves one side of the board still meets the full loop.
 */

export const TRACK_LENGTH = 28;

/* ------------------------------------------------------------------ */
/* Districts                                                           */
/* ------------------------------------------------------------------ */

/**
 * Community upgrades are the coin sink, and the reason coins matter.
 *
 * They are city infrastructure, never Guardians and never abilities: buying one
 * changes the board and the Trust Meter, and buys no advantage in any decision.
 * That separation is deliberate — the moment a purchase could influence an
 * outcome, the money earned by a risky choice would start buying safety.
 */
export const DISTRICTS: Record<DistrictId, District> = {
  school: {
    id: 'school',
    name: 'School Street',
    tagline: 'Where the pressure has a face you know.',
    themes: 'Peer pressure, risky dares, cyberbullying, holding things for other people',
    colour: '#f2ae33',
    upgrades: [
      {
        name: 'Quiet Corner',
        cost: 120,
        trust: 6,
        blurb: 'Somewhere to go when a group is waiting for an answer.',
      },
      {
        name: 'Peer Support Room',
        cost: 260,
        trust: 10,
        blurb: 'Students trained to listen before anything escalates.',
      },
      {
        name: 'Open Reporting Desk',
        cost: 450,
        trust: 14,
        blurb: 'Raising something stops being a public act.',
      },
    ],
  },
  retail: {
    id: 'retail',
    name: 'Retail District',
    tagline: 'Small decisions, permanent records.',
    themes: 'Shop theft dares, e-commerce scams, filmed challenges',
    colour: '#d76b53',
    upgrades: [
      {
        name: 'Staffed Aisle',
        cost: 120,
        trust: 6,
        blurb: 'A dare is harder to start when someone is present.',
      },
      {
        name: 'Buyer Protection Notice',
        cost: 260,
        trust: 10,
        blurb: 'Paying outside the platform stops looking normal.',
      },
      {
        name: 'Youth Advisory Panel',
        cost: 450,
        trust: 14,
        blurb: 'Shops and students set the rules together.',
      },
    ],
  },
  digital: {
    id: 'digital',
    name: 'Digi-District',
    tagline: 'The offer arrives before the question does.',
    themes: 'Job scams, money-mule recruitment, phishing, account misuse',
    colour: '#5fa0e8',
    upgrades: [
      {
        name: 'Verify Point',
        cost: 120,
        trust: 6,
        blurb: 'One place to check an offer that is not the offer itself.',
      },
      {
        name: 'Account Safety Clinic',
        cost: 260,
        trust: 10,
        blurb: 'Help with logins before something goes wrong, not after.',
      },
      {
        name: 'Scam Signal Board',
        cost: 450,
        trust: 14,
        blurb: 'What is circulating this week, in the words of the people receiving it.',
      },
    ],
  },
  community: {
    id: 'community',
    name: 'Community Hub',
    tagline: 'Protect your people.',
    themes: 'Peer intervention, safe reporting, supporting a friend at risk',
    colour: '#35b3a6',
    upgrades: [
      {
        name: 'Drop-in Space',
        cost: 120,
        trust: 6,
        blurb: 'Somewhere to bring a problem that is not yet an emergency.',
      },
      {
        name: 'Peer Shield Training',
        cost: 260,
        trust: 10,
        blurb: 'Practising the sentence you would actually say.',
      },
      {
        name: 'Trusted Adult Network',
        cost: 450,
        trust: 14,
        blurb: 'Every young person can name someone. That is the whole goal.',
      },
    ],
  },
};

export const DISTRICT_ORDER: DistrictId[] = ['school', 'retail', 'digital', 'community'];

/* ------------------------------------------------------------------ */
/* The track                                                           */
/* ------------------------------------------------------------------ */

type SideSpec = Omit<BoardSpace, 'index' | 'id' | 'districtId'>;

const SCHOOL_SIDE: SideSpec[] = [
  {
    kind: 'MISSION',
    title: 'Just Hold It For Me',
    short: 'Hold It',
    summary: 'A classmate wants something kept in your bag until after class.',
    competency: 'HOLD',
    guardianId: 'echo',
    scenarioId: 'scn_hold_it',
  },
  {
    kind: 'CLUE',
    title: 'Read the Room',
    short: 'Read Room',
    summary: 'One question. Name the signal that actually matters.',
    competency: 'IDENTIFY',
    guardianId: 'cluepaw',
  },
  {
    kind: 'SITUATION',
    title: 'Corridor Card',
    short: 'Card',
    summary: 'A short situation, one decision, fifteen seconds.',
    competency: 'SPOT',
  },
  {
    kind: 'PEER_SHIELD',
    title: 'Friend Under Pressure',
    short: 'Friend',
    summary: 'Your friend is being dared. You are the witness, not the target.',
    competency: 'DEFEND',
    guardianId: 'shieldfin',
    scenarioId: 'scn_friend_pressure',
  },
  {
    kind: 'GUARDIAN',
    title: 'Echo Checkpoint',
    short: 'Echo',
    summary: 'See what your decisions have actually built.',
    competency: 'HOLD',
    guardianId: 'echo',
  },
  {
    kind: 'COMMUNITY',
    title: 'School Street Works',
    short: 'Works',
    summary: 'Spend coins on something the district keeps.',
  },
];

const RETAIL_SIDE: SideSpec[] = [
  {
    kind: 'MISSION',
    title: 'The Dare at Checkout',
    short: 'The Dare',
    summary: 'Friends filming, and someone says the aisle is a blind spot.',
    competency: 'IDENTIFY',
    guardianId: 'cluepaw',
    scenarioId: 'scn_checkout_dare',
  },
  {
    kind: 'SITUATION',
    title: 'Shopfront Card',
    short: 'Card',
    summary: 'A short situation, one decision, fifteen seconds.',
    competency: 'EVALUATE',
  },
  {
    kind: 'CLUE',
    title: 'Spot the Signal',
    short: 'Signal',
    summary: 'One question. Name the signal that actually matters.',
    competency: 'SPOT',
    guardianId: 'verifox',
  },
  {
    kind: 'MISSION',
    title: 'Too Cheap To Be Real',
    short: 'Listing',
    summary: 'Half price, if you pay outside the app.',
    competency: 'SPOT',
    guardianId: 'verifox',
    scenarioId: 'scn_fake_listing',
  },
  {
    kind: 'GUARDIAN',
    title: 'Cluepaw Checkpoint',
    short: 'Cluepaw',
    summary: 'See what your decisions have actually built.',
    competency: 'IDENTIFY',
    guardianId: 'cluepaw',
  },
  {
    kind: 'COMMUNITY',
    title: 'Retail District Works',
    short: 'Works',
    summary: 'Spend coins on something the district keeps.',
  },
];

const DIGITAL_SIDE: SideSpec[] = [
  {
    kind: 'MISSION',
    title: 'Easy Money?',
    short: 'Money?',
    summary: 'S$200 to let money pass through your account. No risk, they say.',
    competency: 'SPOT',
    guardianId: 'verifox',
    scenarioId: 'scn_easy_money',
  },
  {
    kind: 'CLUE',
    title: 'Warning Signs',
    short: 'Signs',
    summary: 'One question. Name the signal that actually matters.',
    competency: 'SPOT',
    guardianId: 'verifox',
  },
  {
    kind: 'SITUATION',
    title: 'Inbox Card',
    short: 'Card',
    summary: 'A short situation, one decision, fifteen seconds.',
    competency: 'EVALUATE',
    guardianId: 'bytebuddy',
  },
  {
    kind: 'MISSION',
    title: 'The Part-Time Listing',
    short: 'Job Ad',
    summary: 'S$80 an hour — after you pay the activation fee.',
    competency: 'IDENTIFY',
    guardianId: 'cluepaw',
    scenarioId: 'scn_job_scam',
  },
  {
    kind: 'GUARDIAN',
    title: 'VeriFox Checkpoint',
    short: 'VeriFox',
    summary: 'See what your decisions have actually built.',
    competency: 'SPOT',
    guardianId: 'verifox',
  },
  {
    kind: 'COMMUNITY',
    title: 'Digi-District Works',
    short: 'Works',
    summary: 'Spend coins on something the district keeps.',
  },
];

const COMMUNITY_SIDE: SideSpec[] = [
  {
    kind: 'PEER_SHIELD',
    title: "Jayden's Offer",
    short: 'Jayden',
    summary: 'Your friend is about to hand over his account number.',
    competency: 'DEFEND',
    guardianId: 'shieldfin',
    scenarioId: 'scn_peer_jayden',
  },
  {
    kind: 'SITUATION',
    title: 'Hub Card',
    short: 'Card',
    summary: 'A short situation, one decision, fifteen seconds.',
    competency: 'DEFEND',
  },
  {
    kind: 'CLUE',
    title: 'Who Would You Tell?',
    short: 'Who?',
    summary: 'One question. Name the signal that actually matters.',
    competency: 'LEAD',
    guardianId: 'beacon',
  },
  {
    kind: 'PEER_SHIELD',
    title: 'Cover For Me',
    short: 'Cover',
    summary: 'A friend wants you to say you were together. You were not.',
    competency: 'LEAD',
    guardianId: 'beacon',
    scenarioId: 'scn_cover_for_me',
  },
  {
    kind: 'GUARDIAN',
    title: 'Shieldfin Checkpoint',
    short: 'Shieldfin',
    summary: 'See what your decisions have actually built.',
    competency: 'DEFEND',
    guardianId: 'shieldfin',
  },
  {
    kind: 'COMMUNITY',
    title: 'Community Hub Works',
    short: 'Works',
    summary: 'Spend coins on something the district keeps.',
  },
];

const SIDES: { districtId: DistrictId; gate: SideSpec; spaces: SideSpec[] }[] = [
  {
    districtId: 'school',
    gate: {
      kind: 'GATE',
      title: 'School Street',
      short: 'School',
      summary: 'Enter School Street. Collect your community stipend.',
      corner: true,
    },
    spaces: SCHOOL_SIDE,
  },
  {
    districtId: 'retail',
    gate: {
      kind: 'GATE',
      title: 'Retail District',
      short: 'Retail',
      summary: 'Enter the Retail District. Collect your community stipend.',
      corner: true,
    },
    spaces: RETAIL_SIDE,
  },
  {
    districtId: 'digital',
    gate: {
      kind: 'GATE',
      title: 'Digi-District',
      short: 'Digi',
      summary: 'Enter the Digi-District. Collect your community stipend.',
      corner: true,
    },
    spaces: DIGITAL_SIDE,
  },
  {
    districtId: 'community',
    gate: {
      kind: 'GATE',
      title: 'Community Hub',
      short: 'Hub',
      summary: 'Enter the Community Hub. Collect your community stipend.',
      corner: true,
    },
    spaces: COMMUNITY_SIDE,
  },
];

function buildTrack(): BoardSpace[] {
  const spaces: BoardSpace[] = [];
  for (const side of SIDES) {
    const gateIndex = spaces.length;
    spaces.push({
      ...side.gate,
      index: gateIndex,
      id: `sp_${side.districtId}_gate`,
      districtId: side.districtId,
    });
    side.spaces.forEach((spec, i) => {
      spaces.push({
        ...spec,
        index: spaces.length,
        id: `sp_${side.districtId}_${i + 1}`,
        districtId: side.districtId,
      });
    });
  }
  return spaces;
}

export const TRACK: BoardSpace[] = buildTrack();

export const SPACE_BY_ID: Record<string, BoardSpace> = Object.fromEntries(
  TRACK.map((s) => [s.id, s]),
);

export const spacesInDistrict = (districtId: DistrictId): BoardSpace[] =>
  TRACK.filter((s) => s.districtId === districtId);

/**
 * Spaces that count towards securing a district. Gates and community works are
 * excluded: a district is secured by doing its thinking, not by walking past
 * its corner or by spending money on it.
 */
export const securingSpaces = (districtId: DistrictId): BoardSpace[] =>
  spacesInDistrict(districtId).filter(
    (s) => s.kind !== 'GATE' && s.kind !== 'COMMUNITY' && s.kind !== 'GUARDIAN',
  );

/** Coins collected for entering a district gate. */
export const GATE_STIPEND = 40;
