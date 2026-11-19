export interface Guardian {
  id: string;
  name: string;
  discipline: string;
  role: string;
  reinforcedBehaviour: string;
  color: string;
  accentColor: string;
  badge: string;
  symbol: string;
  quote: string;
  description: string;
}

export interface District {
  id: string;
  name: string;
  theme: string;
  skillsExplored: string[];
  visualConcept: string;
  description: string;
  coordinates: { x: number; y: number };
  sampleScenarioPreview: string;
  keyThreats: string[];
}

export interface ShieldStep {
  letter: 'S' | 'H' | 'I' | 'E' | 'L' | 'D';
  title: string;
  headline: string;
  description: string;
  example: string;
  guardianPair: string;
}

export interface TeaserChoice {
  id: string;
  text: string;
  immediateConsequence: string;
  immediateType: 'neutral' | 'danger' | 'caution';
  delayedConsequence: string;
  delayedType: 'danger' | 'success';
  learningTakeaway: string;
  guardianInsight: {
    guardian: string;
    advice: string;
  };
}

export interface TeaserScenario {
  id: string;
  title: string;
  context: string;
  sender: string;
  incomingMessage: string;
  urgencyWarning: string;
  choices: [TeaserChoice, TeaserChoice];
}

export interface SiteMetadata {
  name: string;
  tagline: string;
  coreBrandIdea: string;
  team: string;
  institution: string;
  status: string;
  phase: string;
  disclaimer: string;
}

export const SITE_METADATA: SiteMetadata = {
  name: 'ShieldQuest',
  tagline: 'Choose Right. Protect Together.',
  coreBrandIdea: 'Experience the consequence. Understand the pressure. Protect someone else.',
  team: 'SecurePi',
  institution: 'Nanyang Polytechnic, Singapore',
  status: 'In Active Development',
  phase: 'Phase 1: Public Web Preview',
  disclaimer:
    'ShieldQuest is an independent student educational project developed by SecurePi from Nanyang Polytechnic. It is not an official product or service of the Singapore Police Force (SPF), the National Crime Prevention Council (NCPC), the National Youth Council (NYC), or any government agency. All scenarios, organizations, web domains, and phone numbers featured are strictly fictional.',
};

export const GUARDIANS: Guardian[] = [
  {
    id: 'verifox',
    name: 'VeriFox',
    discipline: 'Verification',
    role: 'Validates claims against trusted sources; checks URLs and identities.',
    reinforcedBehaviour: 'Pause and verify information through trusted channels before taking action.',
    color: '#F2B94B',
    accentColor: '#D97706',
    badge: 'Source Checker',
    symbol: 'CheckCheck',
    quote: 'Never take urgency at face value. If an offer is real, it will survive two minutes of verification.',
    description:
      'Swift, inquisitive, and methodical. VeriFox helps players cross-reference incoming claims against official domain directories, examine cryptographic badges, and verify sender identities outside suspicious chat channels.',
  },
  {
    id: 'echo',
    name: 'Echo',
    discipline: 'Consultation',
    role: 'Prompts consultation with friends, teachers, or trusted adults.',
    reinforcedBehaviour: 'Overcome hesitation or embarrassment; seek advice when things seem unusual.',
    color: '#A78BFA',
    accentColor: '#7C3AED',
    badge: 'Trusted Guide',
    symbol: 'MessageCircleHeart',
    quote: 'Manipulators rely on your silence. Speaking up to one trusted person breaks their leverage.',
    description:
      'Warm and perceptive. Echo models the courage to reach out when a situation feels awkward, embarrassing, or confusing, reminding players that asking for a second opinion is a sign of resilience, not weakness.',
  },
  {
    id: 'beacon',
    name: 'Beacon',
    discipline: 'Reporting',
    role: 'Identifies confidential, official reporting channels and escalation paths.',
    reinforcedBehaviour: 'Know when, how, and where to report suspicious activity safely.',
    color: '#38D9E6',
    accentColor: '#0891B2',
    badge: 'Signal Post',
    symbol: 'Radio',
    quote: 'Reporting is not snitching. It is putting up a guardrail before another classmate gets hurt.',
    description:
      'Clear-sighted and decisive. Beacon guides players to confidential reporting pathways, official helpline channels, and evidence-preservation habits, transforming silent observers into community protectors.',
  },
  {
    id: 'shieldfin',
    name: 'Shieldfin',
    discipline: 'Peer Protection',
    role: 'Deploys calm refusal responses and shields peers from social pressure.',
    reinforcedBehaviour: 'Resist dares, coercion, and manipulation from friends or acquaintances.',
    color: '#1687F7',
    accentColor: '#1D4ED8',
    badge: 'Squad Defender',
    symbol: 'Shield',
    quote: 'Standing with a friend means giving them a graceful exit when group pressure starts building.',
    description:
      'Steadfast and supportive. Shieldfin equips players with graceful de-escalation responses, refusal strategies that protect peer friendships, and the confidence to interrupt risky dares before lines are crossed.',
  },
  {
    id: 'cluepaw',
    name: 'Cluepaw',
    discipline: 'Situational Awareness',
    role: 'Highlights subtle inconsistencies and overlooked details in evidence.',
    reinforcedBehaviour: 'Pay attention to context, fine print, and anomalies in digital communication.',
    color: '#34D399',
    accentColor: '#059669',
    badge: 'Detail Tracker',
    symbol: 'Sparkles',
    quote: 'The red flag is almost never in bold type. It lives in the tone, the deadline, and the fine print.',
    description:
      'Sharp-eyed and alert. Cluepaw teaches players to read between the lines, notice sudden shifts in conversational tone, detect mismatched branding, and scrutinise hidden permissions.',
  },
  {
    id: 'bytebuddy',
    name: 'ByteBuddy',
    discipline: 'Digital Hygiene',
    role: 'Inspects app permissions, credential requests, and multi-factor security.',
    reinforcedBehaviour: 'Protect personal logins, passwords, Singpass credentials, and device access.',
    color: '#F472B6',
    accentColor: '#DB2777',
    badge: 'Access Guardian',
    symbol: 'Cpu',
    quote: 'Your credentials are the keys to your entire digital identity. Never pass them through a screen door.',
    description:
      'Vigilant and analytical. ByteBuddy audits authorization dialogs, multi-factor authentication tokens, and credential entry fields, protecting young players from inadvertent account surrender.',
  },
];

export const DISTRICTS: District[] = [
  {
    id: 'school-street',
    name: 'School Street',
    theme: 'Social pressure, peer dares, academic account sharing, classroom dynamics',
    skillsExplored: ['Peer protection', 'Social boundaries', 'Resisting dares', 'Consultation'],
    visualConcept: 'Academic brick arches, bustling bus stops, shaded library walkways, student bulletin boards',
    description:
      'The vibrant perimeter surrounding school grounds where social circles meet, peer expectations run high, and impulsive dares challenge personal boundaries.',
    coordinates: { x: 28, y: 32 },
    sampleScenarioPreview:
      'A classmate is pressured into taking an unauthorized photo of an exam paper for a group chat dare.',
    keyThreats: ['Coercive dares', 'Account credential sharing', 'Unauthorised media circulation'],
  },
  {
    id: 'retail-district',
    name: 'Retail District',
    theme: 'Initial pilot focus: shop-theft prevention, store dares, speaking up and seeking help',
    skillsExplored: ['Spotting risk', 'Resisting dares', 'Redirecting peers', 'Seeking help'],
    visualConcept: 'Bustling covered arcades, neon storefronts, transit escalators, digital ad billboards',
    description:
      'A busy corridor of shops and kiosks where a friend’s dare to pocket something quickly turns into a real decision about honesty and consequences.',
    coordinates: { x: 74, y: 34 },
    sampleScenarioPreview:
      'A friend dares the group to slip a snack into a bag while the store assistant is busy.',
    keyThreats: ['Shop-theft dares', 'Group pressure', 'Bystander silence'],
  },
  {
    id: 'digi-district',
    name: 'Digi-District',
    theme: 'Phishing links, gaming account trades, malware lures, Singpass and credential theft',
    skillsExplored: ['Digital hygiene', 'Situational awareness', 'MFA security', 'Domain checking'],
    visualConcept: 'Sleek cyber plazas, luminous fiber bridges, competitive esports lounges, holographic hubs',
    description:
      'The high-tech pulse of the city where virtual goods, game assets, and modding forums meet sophisticated online social engineering.',
    coordinates: { x: 70, y: 72 },
    sampleScenarioPreview:
      'A Discord direct message promises an exclusive game tournament skin in exchange for logging into a mirrored portal.',
    keyThreats: ['Credential harvesters', 'Spoofed login forms', 'Session token hijacking'],
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    theme: 'Youth clubs, neighbourhood gathering spots, bystander intervention, safe reporting',
    skillsExplored: ['Bystander action', 'Safe escalation', 'Official helplines', 'Peer support'],
    visualConcept: 'Open-air community amphitheatre, illuminated recreational plaza, corkboard notices, cafe terrace',
    description:
      'The civic heart where youths unwind after hours, and where noticing an anxious friend and knowing where to turn turns bystander hesitation into genuine protection.',
    coordinates: { x: 30, y: 72 },
    sampleScenarioPreview:
      'You notice a squad mate secretly transferring savings to an unknown caller claiming to be a courier investigator.',
    keyThreats: ['Impersonation schemes', 'Coerced isolation', 'Bystander hesitation'],
  },
];

export const SHIELD_FRAMEWORK: ShieldStep[] = [
  {
    letter: 'S',
    title: 'Spot the Risk',
    headline: 'Notice objective observations and clues',
    description: 'Pick out what is actually happening: who is there, what they are doing and which details stand out.',
    example: 'Noticing a friend glance at the store camera while holding an unpaid item.',
    guardianPair: 'Cluepaw & VeriFox',
  },
  {
    letter: 'H',
    title: 'Hold Before Acting',
    headline: 'Choose a safe immediate boundary',
    description: 'Pause and set a clear, safe boundary or refusal in the moment instead of going along with it.',
    example: 'Saying “I’m not taking anything, I’ll wait outside” when a dare starts.',
    guardianPair: 'Shieldfin',
  },
  {
    letter: 'I',
    title: 'Identify the Influence',
    headline: 'Recognise pressure and risk context',
    description: 'Identify the peer pressure, influence and situational factors pushing someone towards a risky choice.',
    example: 'Recognising that “everyone does it” is group pressure, not a reason.',
    guardianPair: 'Echo & Cluepaw',
  },
  {
    letter: 'E',
    title: 'Evaluate Consequences',
    headline: 'Compare options and likely outcomes',
    description: 'Compare the available options and weigh their likely immediate and delayed consequences.',
    example: 'Weighing a moment of approval against being caught and losing trust.',
    guardianPair: 'ByteBuddy',
  },
  {
    letter: 'L',
    title: 'Lead the Right Choice',
    headline: 'Redirect a peer respectfully',
    description: 'Construct a respectful message that redirects a peer away from the risky choice.',
    example: '“Put it back, it’s not worth it. Let’s go get food instead.”',
    guardianPair: 'Shieldfin & VeriFox',
  },
  {
    letter: 'D',
    title: 'Defend Your Community',
    headline: 'Seek appropriate help with the facts',
    description: 'Seek help from an appropriate adult and communicate factual observations.',
    example: 'Telling store staff or a teacher exactly what you saw, without guessing.',
    guardianPair: 'Beacon & Echo',
  },
];

export const TEASER_SCENARIOS: TeaserScenario[] = [
  {
    id: 'game-pass-urgency',
    title: 'The "Limited Tournament" Invite',
    context: 'Saturday evening. You receive an urgent direct message from what appears to be a classmate’s gamer handle.',
    sender: 'Kyler_Nexus (Classmate)',
    incomingMessage:
      'BRO QUICK!! Only 2 minutes left to register our 4-player team for the regional brawl cup. Tap this link: game-pass.secure-link.test and paste the 6-digit verification code you get on SMS so I can lock our squad in!!',
    urgencyWarning: 'Artificial Urgency: 01:45 remaining on timer',
    choices: [
      {
        id: 'choice-rush',
        text: 'Send the 6-digit SMS code quickly to avoid missing the team deadline.',
        immediateConsequence:
          'Your friend replies: "Thanks, registered!" You feel temporary relief that your team did not miss out on the slot.',
        immediateType: 'neutral',
        delayedConsequence:
          '90 minutes later, you are locked out of your primary gaming account and your linked email. The SMS code was actually an account recovery token. Scammers hijacked your classmate’s account earlier and are now using your profile to scam 12 other classmates.',
        delayedType: 'danger',
        learningTakeaway:
          'Urgency is manufactured to disable verification. Genuine gaming tournaments and platforms never require you to share external SMS one-time codes with team captains.',
        guardianInsight: {
          guardian: 'ByteBuddy',
          advice: 'Never treat a 2-factor OTP as a team entry ticket. Verification codes belong solely to the recipient.',
        },
      },
      {
        id: 'choice-verify',
        text: 'Pause. Refuse to send the code, check the domain, and call Kyler directly.',
        immediateConsequence:
          'You resist the rush. You feel a momentary FOMO, but keep your credentials firmly in your own possession.',
        immediateType: 'caution',
        delayedConsequence:
          'When you call Kyler’s actual phone number, he answers in surprise: "I am having dinner with my family, my messaging app was hacked 20 minutes ago!" By pausing, you prevented your account from being compromised and helped Kyler alert the rest of your school cohort.',
        delayedType: 'success',
        learningTakeaway:
          'A two-minute pause and an independent voice verification disrupts the manipulator’s timeline and protects your entire network.',
        guardianInsight: {
          guardian: 'VeriFox & Shieldfin',
          advice: 'Holding the line when artificial timers tick is the hallmark of true peer protection.',
        },
      },
    ],
  },
];
export * from './gameState.js';
