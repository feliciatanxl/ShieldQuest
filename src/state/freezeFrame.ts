/**
 * SHIELD Practice Mini-Game: H — Freeze Frame (Hold Before Acting)
 *
 * Inspired by Papers, Please and The Case of the Golden Idol.
 * A pausable, interactive scenario in Sunshine Minimart where Jun pressures
 * the player to act as a lookout.
 */

export type FreezeScenarioId = 'snack-dare-device' | 'delivery-parcel-mixup'

export interface CCTVCamFeed {
  id: 'cam-01' | 'cam-02' | 'cam-03'
  name: string
  location: string
  angles: {
    stage: number
    observationText: string
    zoomDetail: string
    keyClue?: string
  }[]
}

export interface ManifestItem {
  serial: string
  name: string
  price: string
  status: 'PAID' | 'UNPAID_HOLD' | 'CUSTOMER_RESERVE'
  customer: string
  isDiscrepancy?: boolean
}

export const CCTV_CHANNELS: Record<string, CCTVCamFeed[]> = {
  'snack-dare-device': [
    {
      id: 'cam-01',
      name: 'CAM 01 · Register & Counter',
      location: 'Checkout area & delivery counter',
      angles: [
        {
          stage: 1,
          observationText: 'Mr. Tan is organizing delivery logs on the counter clipboard.',
          zoomDetail: 'Counter manifest shows 3 items arrived. Only 2 were paid for by previous customers.',
        },
        {
          stage: 2,
          observationText: 'Mr. Tan turns his back to retrieve fresh receipt rolls from the under-counter shelf.',
          zoomDetail: 'The register drawer is shut and locked, but the reserved customer pickup shelf behind the counter is partially accessible from the side aisle.',
        },
        {
          stage: 3,
          observationText: 'Mr. Tan is checking serial barcode tags against his delivery clipboard.',
          zoomDetail: 'Clipboard notes: “All high-value electronics must be signed by customer before departure.”',
          keyClue: 'Official Store Policy: Items cannot be taken without cashier scanning.',
        },
        {
          stage: 4,
          observationText: 'Mr. Tan hears rustling near the doorway and looks up towards the front window.',
          zoomDetail: 'His view of the lower door is partially blocked by the snack display stand.',
        },
        {
          stage: 5,
          observationText: 'Mr. Tan walks towards the counter bell to see who entered.',
          zoomDetail: 'The bell chime is activated when the door sensor triggers.',
        },
      ],
    },
    {
      id: 'cam-02',
      name: 'CAM 02 · Electronics & Sundry Aisle',
      location: 'Aisle 3 (Chargers, Cables, Powerbanks)',
      angles: [
        {
          stage: 1,
          observationText: 'Jun approaches the electronics shelf, constantly looking around with hurried posture.',
          zoomDetail: 'His personal grey backpack is unzipped at his side.',
        },
        {
          stage: 2,
          observationText: 'Jun’s hands hover over the top shelf holding a 10,000mAh fast-charge powerbank.',
          zoomDetail: 'Bright orange security tag #SEC-8821 is clearly visible on the packaging!',
          keyClue: 'Security Tag #SEC-8821: This item has NOT been deactivated at the register.',
        },
        {
          stage: 3,
          observationText: 'Jun conceals the powerbank inside his backpack flap instead of placing it in the store basket.',
          zoomDetail: 'The empty store basket is sitting untouched on the floor just 30cm away.',
          keyClue: 'Concealment Observed: Item was deliberately hidden rather than held for payment.',
        },
        {
          stage: 4,
          observationText: 'Jun rushes down the aisle towards the player, face tense and pleading.',
          zoomDetail: 'Jun’s smartphone screen in his hand shows an active Telegram group titled “Estate Squad Dare”.',
          keyClue: 'Peer Dare Detected: Jun is under Telegram group pressure, not acting alone.',
        },
        {
          stage: 5,
          observationText: 'Jun crouches behind the endcap display, gesturing urgently towards the doorway.',
          zoomDetail: 'Jun is trying to get the player to step between him and the counter line of sight.',
        },
      ],
    },
    {
      id: 'cam-03',
      name: 'CAM 03 · Entrance & Streetfront',
      location: 'Minimart sliding door & pedestrian walkway',
      angles: [
        {
          stage: 1,
          observationText: 'The sliding door shuts. Sunshine Estate walkway is quiet outside.',
          zoomDetail: 'Nobody is chasing or following Jun.',
        },
        {
          stage: 2,
          observationText: 'A light breeze outside; two neighbours are chatting peacefully near Block 102.',
          zoomDetail: 'Zero police, security, or suspicious pursuit outside.',
        },
        {
          stage: 3,
          observationText: 'Auntie May carrying a grocery tote bag approaches leisurely along the sheltered walkway.',
          zoomDetail: 'Auntie May is just walking to buy canned beans and fresh ginger.',
        },
        {
          stage: 4,
          observationText: 'Auntie May steps onto the green welcome mat outside the entrance.',
          zoomDetail: 'The “someone coming” Jun panicked about is merely Auntie May doing daily grocery shopping!',
          keyClue: 'Fabricated Panic: The approaching person is just a regular neighbourhood resident.',
        },
        {
          stage: 5,
          observationText: 'Auntie May pushes the door handle to enter.',
          zoomDetail: 'If the player blocks the door, Auntie May will be obstructed and alarm will be raised.',
        },
      ],
    },
  ],
}

export const STORE_MANIFESTS: Record<string, ManifestItem[]> = {
  'snack-dare-device': [
    { serial: 'SN-0491', name: 'Alkaline AA Batteries (4-pk)', price: '$4.50', status: 'PAID', customer: 'Jun (Receipt in pocket)' },
    { serial: 'SN-1022', name: 'USB-C Braided Cable (1m)', price: '$8.00', status: 'PAID', customer: 'Walk-in customer' },
    { serial: 'SN-8821', name: '10,000mAh Powerbank Pro', price: '$45.00', status: 'CUSTOMER_RESERVE', customer: 'Mr. Lim (Hold until 6 PM)', isDiscrepancy: true },
    { serial: 'SN-9014', name: 'Salted Egg Potato Crisps', price: '$3.20', status: 'PAID', customer: 'Morning delivery' },
  ],
  'delivery-parcel-mixup': [
    { serial: 'PARCEL-A', name: 'Express Electronics Box (Unit 1)', price: '$65.00', status: 'PAID', customer: 'Customer pickup' },
    { serial: 'PARCEL-B', name: 'Duplicate Shipping Carton', price: '$65.00', status: 'UNPAID_HOLD', customer: 'Courier Return Logged', isDiscrepancy: true },
  ],
}

export interface TimelineStage {
  id: number
  timeSeconds: number
  timeDisplay: string
  title: string
  summary: string
  junDialogue: string
  junAction: string
  cashierStatus: string
  doorStatus: string
  activeHotspotIds: FreezeHotspotId[]
}

export type FreezeHotspotId =
  | 'jun-backpack'
  | 'cctv-monitor'
  | 'cashier-counter'
  | 'entrance-door'
  | 'jun-demeanor'
  | 'shopping-basket'

export interface FreezeHotspot {
  id: FreezeHotspotId
  label: string
  category: 'physical-evidence' | 'environment' | 'person'
  stages: number[]
  magnifierTitle: string
  visualDescription: string
  verifiedFact: string
  criticalForVerification: boolean
}

export interface ClarificationQuestion {
  id: string
  target: 'jun' | 'cashier'
  prompt: string
  answer: string
  insight: string
}

export type FreezeDecisionId = 'calm-refusal' | 'comply-lookout' | 'public-accusation' | 'flee-store'

export interface FreezeDecision {
  id: FreezeDecisionId
  title: string
  quote: string
  description: string
  rating: 'protective' | 'risky' | 'reckless' | 'avoidant'
  passed: boolean
  feedback: string
}

export interface FreezeFrameResult {
  paused: boolean
  timelinePositionsChecked: number[]
  inspectedHotspots: FreezeHotspotId[]
  askedQuestionIds: string[]
  verifiedBeforeActing: boolean
  decision: FreezeDecisionId
  passed: boolean
  score: number // 0 to 100
  patienceRating: 'High' | 'Moderate' | 'Low'
  evidenceRating: 'Thorough' | 'Partial' | 'None'
  completedAt: string
  summaryNotes: string[]
}

export const FREEZE_FRAME_STAGES: TimelineStage[] = [
  {
    id: 1,
    timeSeconds: 2,
    timeDisplay: '0:02',
    title: 'Stage 1 · The Rush',
    summary: 'Jun bursts into Sunshine Minimart clutching his backpack, scanning the aisles with hurried breath.',
    junDialogue: '“Hey! You’re here! Perfect timing, I need your help right now!”',
    junAction: 'Jun hurries towards you, glancing nervously over his shoulder towards the cashier.',
    cashierStatus: 'Cashier Mr. Tan is adjusting shelf price labels at the counter.',
    doorStatus: 'The entrance glass sliding door closes quietly behind Jun.',
    activeHotspotIds: ['jun-demeanor', 'cctv-monitor', 'cashier-counter'],
  },
  {
    id: 2,
    timeSeconds: 6,
    timeDisplay: '0:06',
    title: 'Stage 2 · The Pitch',
    summary: 'Jun approaches you closely and lowers his voice, asking you to keep watch.',
    junDialogue: '“Eh bro, help me watch the entrance for two minutes! Just tell me if anyone comes in, okay? We’re friends right?”',
    junAction: 'Jun leans in with intense eye contact, appealing to your friendship to get an immediate yes.',
    cashierStatus: 'Mr. Tan is keying items into the inventory register behind the counter.',
    doorStatus: 'A light breeze outside; no one is currently at the door.',
    activeHotspotIds: ['jun-demeanor', 'cctv-monitor', 'cashier-counter', 'shopping-basket'],
  },
  {
    id: 3,
    timeSeconds: 10,
    timeDisplay: '0:10',
    title: 'Stage 3 · The Aisle',
    summary: 'Jun heads into Aisle 3 (electronics & specialty snacks) while leaving the store shopping basket on the floor.',
    junDialogue: '“Keep your eyes on the door! Don’t look over here, just whistle if you see someone!”',
    junAction: 'Jun reaches towards the top shelf where power banks and imported energy drinks are stocked.',
    cashierStatus: 'Mr. Tan is checking receipt paper in the register.',
    doorStatus: 'Neighbourhood walkway visible through the glass door.',
    activeHotspotIds: ['jun-backpack', 'shopping-basket', 'cctv-monitor', 'cashier-counter'],
  },
  {
    id: 4,
    timeSeconds: 14,
    timeDisplay: '0:14',
    title: 'Stage 4 · The Bagging',
    summary: 'Jun slips unpurchased merchandise directly into his half-opened backpack instead of the basket.',
    junDialogue: '“Almost done! Make sure no one walks past that door!”',
    junAction: 'Jun zips up his personal bag with store merchandise inside, checking the angle of the aisle mirror.',
    cashierStatus: 'Mr. Tan pauses and glances up towards Aisle 2 before returning to the register.',
    doorStatus: 'A resident’s shadow appears along the outdoor sheltered walkway.',
    activeHotspotIds: ['jun-backpack', 'shopping-basket', 'cctv-monitor', 'cashier-counter', 'entrance-door'],
  },
  {
    id: 5,
    timeSeconds: 18,
    timeDisplay: '0:18',
    title: 'Stage 5 · The Climax',
    summary: 'Footsteps approach the entrance. Jun frantically gestures for you to block the door.',
    junDialogue: '“Someone’s coming! Quick, block the door! Tell them the shop is closed for cleaning!”',
    junAction: 'Jun freezes behind the display rack, clutching his backpack tightly.',
    cashierStatus: 'Mr. Tan hears the entrance sensor and looks up.',
    doorStatus: 'Auntie May is approaching the glass door holding a grocery tote.',
    activeHotspotIds: ['entrance-door', 'jun-backpack', 'cashier-counter', 'cctv-monitor'],
  },
]

export const FREEZE_HOTSPOTS: Record<FreezeHotspotId, FreezeHotspot> = {
  'jun-backpack': {
    id: 'jun-backpack',
    label: 'Jun’s Backpack',
    category: 'physical-evidence',
    stages: [3, 4, 5],
    magnifierTitle: 'Personal Backpack Inspection',
    visualDescription: 'Jun’s grey backpack is half-zipped. Inside are two unpaid portable power banks and energy drinks from Aisle 3. Store price stickers are intact.',
    verifiedFact: 'Jun is placing store merchandise directly into his personal bag without placing them in the basket or paying.',
    criticalForVerification: true,
  },
  'cctv-monitor': {
    id: 'cctv-monitor',
    label: 'CCTV Observation Screen',
    category: 'environment',
    stages: [1, 2, 3, 4, 5],
    magnifierTitle: 'Store Surveillance Feed',
    visualDescription: 'A high-definition colour monitor mounted beside the ceiling. Cam 02 has an unobstructed view of Aisle 3 and Cam 01 monitors the entrance door.',
    verifiedFact: 'The CCTV system is fully active and recording every aisle in high definition.',
    criticalForVerification: true,
  },
  'cashier-counter': {
    id: 'cashier-counter',
    label: 'Cashier Counter & Rules',
    category: 'environment',
    stages: [1, 2, 3, 4, 5],
    magnifierTitle: 'Store Policies & Cashier Station',
    visualDescription: 'Mr. Tan is on duty. Prominently displayed on the counter is a sign: “All unpaid items must remain in store baskets until checkout. Personal bags must remain closed.”',
    verifiedFact: 'Store policy explicitly forbids placing unpaid items in personal bags before payment.',
    criticalForVerification: false,
  },
  'entrance-door': {
    id: 'entrance-door',
    label: 'Entrance Glass Door',
    category: 'environment',
    stages: [4, 5],
    magnifierTitle: 'Approaching Visitor',
    visualDescription: 'Looking through the front glass door reveals Auntie May carrying an umbrella and an empty tote bag, walking leisurely to buy fresh milk.',
    verifiedFact: 'The approaching person is an ordinary neighbourhood shopper, not a threat or security officer.',
    criticalForVerification: true,
  },
  'jun-demeanor': {
    id: 'jun-demeanor',
    label: 'Jun’s Demeanor & Speech',
    category: 'person',
    stages: [1, 2],
    magnifierTitle: 'Behavioural Observation',
    visualDescription: 'Jun displays rapid breathing, sweaty palms, and darting glances. He emphasizes “We’re friends right?” and insists on immediate compliance without explaining why.',
    verifiedFact: 'Jun is combining artificial urgency with a loyalty appeal to prevent you from thinking through the request.',
    criticalForVerification: true,
  },
  'shopping-basket': {
    id: 'shopping-basket',
    label: 'Abandoned Store Basket',
    category: 'physical-evidence',
    stages: [2, 3, 4],
    magnifierTitle: 'Store Shopping Basket',
    visualDescription: 'A red plastic minimart basket sits completely empty on the floor by the aisle entrance.',
    verifiedFact: 'A store basket is available right beside Jun, proving he deliberately chose not to use it.',
    criticalForVerification: false,
  },
}

export const CLARIFICATION_QUESTIONS: ClarificationQuestion[] = [
  {
    id: 'q-jun-purpose',
    target: 'jun',
    prompt: '“Why do you need me to watch the entrance?”',
    answer: '“Aiya, just help me la! Why ask so much questions? I just need two quick minutes to settle something! Real friends help each other out, right?”',
    insight: 'Jun deflects the question and doubles down on emotional pressure instead of providing a legitimate reason.',
  },
  {
    id: 'q-jun-bag',
    target: 'jun',
    prompt: '“Why are you putting items into your backpack instead of the basket?”',
    answer: '“I... the basket was dirty, okay? I’m gonna pay at the cashier later! Just watch the door so nobody interrupts me!”',
    insight: 'Jun gives an inconsistent excuse. The basket on the floor is clean, and paying later does not require a lookout.',
  },
  {
    id: 'q-cashier-lookout',
    target: 'cashier',
    prompt: '“Excuse me Mr. Tan, is someone supposed to guard the entrance?”',
    answer: '“Guard the entrance? No, the door is automatic! Why would anyone guard it? If someone needs help, they come to me at the counter.”',
    insight: 'Mr. Tan confirms there is zero legitimate reason for any customer to monitor or block the doorway.',
  },
]

export const FREEZE_DECISIONS: Record<FreezeDecisionId, FreezeDecision> = {
  'calm-refusal': {
    id: 'calm-refusal',
    title: 'Calm Boundary & Refusal (Protective)',
    quote: '“I’m not watching the door for you, Jun. Put those items in the store basket and pay at the counter like normal.”',
    description: 'You pause, verify the reality of the situation, refuse to participate in wrongful conduct, and offer a safe, responsible path forward without escalating.',
    rating: 'protective',
    passed: true,
    feedback: 'Mastered Hold Before Acting! By hitting pause, checking the physical evidence, and clarifying with questions, you avoided blind peer pressure and protected both yourself and your friend from serious trouble.',
  },
  'comply-lookout': {
    id: 'comply-lookout',
    title: 'Comply as Lookout (Impulsive Complicity)',
    quote: '“Okay, quick! I’ll stand by the door and tell anyone outside that the shop is closed!”',
    description: 'You acted impulsively under peer pressure. By guarding the entrance while Jun concealed unpaid items, you became an active accomplice to shoplifting.',
    rating: 'risky',
    passed: false,
    feedback: 'Failed Hold Before Acting. Acting on urgent impulse without verifying facts made you an accomplice. The CCTV recorded you blocking the entrance.',
  },
  'public-accusation': {
    id: 'public-accusation',
    title: 'Loud Public Accusation (Reckless Escalation)',
    quote: '“Thief! Mr. Tan, call the police right now! Jun is stealing power banks in Aisle 3!”',
    description: 'You reacted with aggression and created public chaos before calmly setting boundaries or giving Jun a chance to correct his action.',
    rating: 'reckless',
    passed: false,
    feedback: 'Suboptimal response. While preventing theft is good, explosive public accusations escalate confrontations dangerously. Calm boundary-setting is safer and more effective.',
  },
  'flee-store': {
    id: 'flee-store',
    title: 'Flee & Pretend Nothing Happened (Passive Avoidance)',
    quote: '“Uh... I’m just gonna walk away and leave the minimart right now.”',
    description: 'You ran away to avoid discomfort, leaving Jun to commit theft and leaving the store unprotected.',
    rating: 'avoidant',
    passed: false,
    feedback: 'Suboptimal response. Passive avoidance protects you temporarily, but leaves your friend to make a life-altering mistake. A clear verbal boundary is needed.',
  },
}

const STORAGE_KEY = 'shieldquest.practice.freezeFrame'

export function readStoredFreezeFrameRecord(): FreezeFrameResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FreezeFrameResult
  } catch {
    return null
  }
}

export function saveFreezeFrameRecord(result: FreezeFrameResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch {
    // Local storage unavailable
  }
}

export function calculateFreezeScore(params: {
  paused: boolean
  timelinePositionsChecked: number[]
  inspectedHotspots: FreezeHotspotId[]
  askedQuestionIds: string[]
  decision: FreezeDecisionId
}): FreezeFrameResult {
  const { paused, timelinePositionsChecked, inspectedHotspots, askedQuestionIds, decision } = params

  const inspectedCriticalCount = inspectedHotspots.filter(
    id => FREEZE_HOTSPOTS[id]?.criticalForVerification
  ).length

  const verifiedBeforeActing =
    paused &&
    inspectedCriticalCount >= 2 &&
    askedQuestionIds.length >= 1

  let score = 0
  const summaryNotes: string[] = []

  // Component 1: Pausing (Hold instinct) - up to 25 pts
  if (paused) {
    score += 25
    summaryNotes.push('Held before acting: Paused the scenario to assess the environment.')
  } else {
    summaryNotes.push('Did not pause: Rushed directly into a decision under time pressure.')
  }

  // Component 2: Evidence gathering (Hotspots) - up to 35 pts
  const evidenceScore = Math.min(35, Math.round((inspectedHotspots.length / 5) * 35))
  score += evidenceScore
  if (inspectedCriticalCount >= 2) {
    summaryNotes.push(`Thorough investigation: Discovered ${inspectedHotspots.length} evidence points including Jun's concealed items and active CCTV.`)
  } else if (inspectedHotspots.length > 0) {
    summaryNotes.push('Partial investigation: Inspected some details but missed key physical evidence.')
  } else {
    summaryNotes.push('Zero inspection: Made decisions based purely on assumption without checking the facts.')
  }

  // Component 3: Clarification (Questions) - up to 15 pts
  if (askedQuestionIds.length >= 2) {
    score += 15
    summaryNotes.push('Clarification: Questioned both Jun and the cashier to test the story.')
  } else if (askedQuestionIds.length === 1) {
    score += 10
    summaryNotes.push('Clarification: Asked clarifying questions before concluding.')
  } else {
    summaryNotes.push('No clarification: Accepted surface pressure without asking a single question.')
  }

  // Component 4: Decision quality - up to 25 pts
  const chosenDecision = FREEZE_DECISIONS[decision]
  if (decision === 'calm-refusal') {
    score += 25
    summaryNotes.push('Optimal decision: Asserted calm, firm boundaries and refused complicity.')
  } else if (decision === 'public-accusation') {
    score += 10
    summaryNotes.push('Flawed decision: Escalated into aggressive confrontation rather than de-escalating.')
  } else if (decision === 'flee-store') {
    score += 8
    summaryNotes.push('Flawed decision: Chose passive evasion instead of constructive boundaries.')
  } else {
    score += 0
    summaryNotes.push('Critical failure: Succumbed to peer pressure and acted as an accomplice.')
  }

  const passed = paused && verifiedBeforeActing && chosenDecision.passed

  return {
    paused,
    timelinePositionsChecked,
    inspectedHotspots,
    askedQuestionIds,
    verifiedBeforeActing,
    decision,
    passed,
    score: Math.min(100, score),
    patienceRating: paused && timelinePositionsChecked.length >= 2 ? 'High' : paused ? 'Moderate' : 'Low',
    evidenceRating: inspectedCriticalCount >= 2 ? 'Thorough' : inspectedHotspots.length > 0 ? 'Partial' : 'None',
    completedAt: new Date().toISOString(),
    summaryNotes,
  }
}
