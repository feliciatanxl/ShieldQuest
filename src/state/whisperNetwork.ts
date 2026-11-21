/**
 * SHIELD Practice Mini-Game: I — Whisper Network (Identify the Influence)
 *
 * Inspired by Among Us, Suspects: Mystery Mansion, and The Case of the Golden Idol.
 * An investigative social-deduction board game where players examine NPC witness
 * transcripts, extract manipulative statements, and map influence tactics across
 * Sunshine Estate.
 */

import { residents } from '../game/residentData'
import type { Avatar } from './avatar'

export type TacticId =
  | 'urgency'
  | 'social-proof'
  | 'loyalty'
  | 'dare'
  | 'false-authority'
  | 'false-promise'
  | 'isolation'

export interface InfluenceTactic {
  id: TacticId
  name: string
  icon: string
  shortDef: string
  description: string
  tellTaleSign: string
}

export const INFLUENCE_TACTICS: Record<TacticId, InfluenceTactic> = {
  'urgency': {
    id: 'urgency',
    name: 'Artificial Urgency',
    icon: '⏳',
    shortDef: '“Act right now before it’s too late!”',
    description: 'Imposing strict, artificial deadlines to rush victims into compliance before they have time to think critically or consult trusted adults.',
    tellTaleSign: 'Words like “Immediately”, “Last chance”, “Before 5 PM”, “Right now”.',
  },
  'social-proof': {
    id: 'social-proof',
    name: 'Social Proof (Bandwagon)',
    icon: '👥',
    shortDef: '“Everyone is doing it, don’t be left out!”',
    description: 'Claiming that peers, seniors, or the entire crowd have already participated to make questionable actions seem normal and acceptable.',
    tellTaleSign: 'Claims like “The whole class did it”, “Everyone in Block 12 is in”.',
  },
  'loyalty': {
    id: 'loyalty',
    name: 'Friendship & Loyalty Appeal',
    icon: '🤝',
    shortDef: '“If you’re really my friend, you’ll help me.”',
    description: 'Leveraging personal affection, camaraderie, or guilt to turn refusal into a betrayal of friendship.',
    tellTaleSign: 'Phrases like “We’re bros right?”, “You owe me”, “Prove you support me”.',
  },
  'dare': {
    id: 'dare',
    name: 'Ego Dare & Ridicule',
    icon: '🐔',
    shortDef: '“Don’t be chicken / coward!”',
    description: 'Challenging personal bravery, masculinity, or cool factor to provoke an impulsive reaction to save face.',
    tellTaleSign: 'Taunts like “Scared ah?”, “Too soft”, “Prove you have guts”.',
  },
  'false-authority': {
    id: 'false-authority',
    name: 'False Authority & Intimidation',
    icon: '🎖️',
    shortDef: '“The seniors said we must obey.”',
    description: 'Invoking the name of an older student, gang figure, or official-sounding title to demand unquestioned obedience.',
    tellTaleSign: 'Citing “The Block 12 seniors”, “The VIP recruiter”, “Official agent”.',
  },
  'false-promise': {
    id: 'false-promise',
    name: 'False Promise & Fast Reward',
    icon: '💰',
    shortDef: '“Guaranteed easy money / free gifts!”',
    description: 'Luring targets with unrealistic financial rewards, free items, or effortless perks in exchange for compromising actions.',
    tellTaleSign: 'Promises like “$300 for 10 minutes work”, “Guaranteed cash”.',
  },
  'isolation': {
    id: 'isolation',
    name: 'Secrecy & Isolation',
    icon: '🤐',
    shortDef: '“Don’t tell your parents or teachers.”',
    description: 'Warning victims to hide discussions from parents, teachers, and guardians so no external check or warning can intervene.',
    tellTaleSign: 'Instructions like “Keep this strictly between us”, “No parents”.',
  },
}

export interface QuotePhrase {
  id: string
  speakerId: string
  text: string
  isManipulative: boolean
  associatedTactic?: TacticId
  targetId?: string
  explanation: string
}

export interface NPCWitness {
  id: string
  name: string
  title: string
  location: string
  avatar: Avatar
  background: string
  transcript: {
    speaker: string
    line: string
    phrases: QuotePhrase[]
  }[]
}

export interface WhisperConnection {
  id: string
  phraseId: string
  speakerId: string
  tacticId: TacticId
  targetId: string
}

export interface WhisperScenario {
  id: 'snack-dare' | 'fast-cash'
  title: string
  subtitle: string
  incidentSummary: string
  learningGoal: string
  witnesses: NPCWitness[]
  targetSolutions: {
    phraseId: string
    expectedTactic: TacticId
    expectedSource: string
    expectedTarget: string
  }[]
  rumourDistortion: {
    originalTruthSpeaker: string
    originalTruth: string
    twistedRumour: string
    distorter: string
  }
}

export interface WhisperNetworkResult {
  scenarioId: 'snack-dare' | 'fast-cash'
  connectionsMapped: WhisperConnection[]
  correctConnectionsCount: number
  totalTargetConnections: number
  identifiedTwistedFact: boolean
  passed: boolean
  score: number
  detectiveRank: 'Chief Guardian Analyst' | 'Senior Investigator' | 'Junior Detective' | 'Cadet'
  feedbackMessages: string[]
  completedAt: string
}

export const WHISPER_SCENARIOS: Record<'snack-dare' | 'fast-cash', WhisperScenario> = {
  'snack-dare': {
    id: 'snack-dare',
    title: 'Case 1 · The Minimart Snack Dare',
    subtitle: 'Peer pressure, false dare, and distorted supply rumors in Sunshine Estate',
    incidentSummary:
      'A rumour is sweeping through the neighbourhood WhatsApp and Telegram chats that the Sunshine Minimart CCTV cameras are broken, and students are being dared by older peers to snatch limited-edition imported chips to prove they aren’t cowards.',
    learningGoal:
      'Identify how innocent remarks get twisted into scarcity urgency, and how social proof and ego dares manipulate youth into illegal acts.',
    witnesses: [
      {
        id: 'amir',
        name: 'Amir',
        title: 'Classmate',
        location: 'Playground Bench',
        avatar: residents.amir,
        background: 'Amir was shown a message by a senior student asking him to join in.',
        transcript: [
          {
            speaker: 'Amir',
            line: 'I didn’t want to go near the minimart today, but look at what was forwarded to me.',
            phrases: [],
          },
          {
            speaker: 'Amir',
            line: 'A senior from Block 12 texted: “The seniors said the back camera is down, prove you’re not a coward by grabbing the spicy chips.”',
            phrases: [
              {
                id: 'sd-phrase-1',
                speakerId: 'amir',
                text: '“The seniors said the back camera is down...”',
                isManipulative: true,
                associatedTactic: 'false-authority',
                targetId: 'amir',
                explanation: 'Appealing to older seniors to give wrongful actions an aura of requirement and authority.',
              },
              {
                id: 'sd-phrase-2',
                speakerId: 'amir',
                text: '“...prove you’re not a coward by grabbing the spicy chips.”',
                isManipulative: true,
                associatedTactic: 'dare',
                targetId: 'amir',
                explanation: 'A textbook ego dare designed to make someone act impulsively to avoid being labeled weak.',
              },
            ],
          },
          {
            speaker: 'Amir',
            line: 'Jun saw the same message and got completely stressed out. He kept saying we would be outcasts if we didn’t join.',
            phrases: [],
          },
        ],
      },
      {
        id: 'jun',
        name: 'Jun',
        title: 'Close Friend',
        location: 'Minimart Entrance',
        avatar: residents.jun,
        background: 'Jun is feeling immense pressure to conform and fit in with the older group.',
        transcript: [
          {
            speaker: 'Jun',
            line: 'You don’t understand! Everyone in the gaming group already took a bag yesterday!',
            phrases: [
              {
                id: 'sd-phrase-3',
                speakerId: 'jun',
                text: '“Everyone in the gaming group already took a bag yesterday!”',
                isManipulative: true,
                associatedTactic: 'social-proof',
                targetId: 'player',
                explanation: 'Using false bandwagon / social proof to make shoplifting seem like a standard, harmless group activity.',
              },
            ],
          },
          {
            speaker: 'Jun',
            line: 'If we don’t do it right now, all the limited snacks will be gone before school starts!',
            phrases: [
              {
                id: 'sd-phrase-4',
                speakerId: 'jun',
                text: '“If we don’t do it right now, all the limited snacks will be gone...”',
                isManipulative: true,
                associatedTactic: 'urgency',
                targetId: 'jun',
                explanation: 'Manufacturing artificial urgency and FOMO (fear of missing out) to short-circuit calm reflection.',
              },
            ],
          },
          {
            speaker: 'Jun',
            line: 'Come on bro, we’re best friends right? Just watch the door for me while I grab one!',
            phrases: [
              {
                id: 'sd-phrase-5',
                speakerId: 'jun',
                text: '“Come on bro, we’re best friends right? Just watch the door for me...”',
                isManipulative: true,
                associatedTactic: 'loyalty',
                targetId: 'player',
                explanation: 'Weaponizing friendship and loyalty to pressure the player into complicity.',
              },
            ],
          },
        ],
      },
      {
        id: 'may',
        name: 'Auntie May',
        title: 'Estate Resident',
        location: 'Kopi Corner',
        avatar: residents.may,
        background: 'Auntie May heard the children talking and was shocked by the distortion.',
        transcript: [
          {
            speaker: 'Auntie May',
            line: 'Aiyo! I was having tea this morning and Jun was talking about snacks being scarce. I only said the supplier delivery van was caught in a jam on the expressway!',
            phrases: [
              {
                id: 'sd-phrase-6',
                speakerId: 'may',
                text: '“I only said the supplier delivery van was caught in a jam on the expressway!”',
                isManipulative: false,
                explanation: 'This was a factual statement about traffic delays, which the rumour twisted into an excuse for a heist.',
              },
            ],
          },
          {
            speaker: 'Auntie May',
            line: 'Who in the world twisted my words into taking things without paying?! Young people nowadays must check the source!',
            phrases: [],
          },
        ],
      },
      {
        id: 'tan',
        name: 'Mr. Tan',
        title: 'Minimart Owner',
        location: 'Cashier Desk',
        avatar: residents.cashier,
        background: 'Store manager who monitors the security cameras and inventory.',
        transcript: [
          {
            speaker: 'Mr. Tan',
            line: 'Cameras down? Who said that? We just upgraded our CCTV system to 4K cloud backup last Tuesday.',
            phrases: [
              {
                id: 'sd-phrase-7',
                speakerId: 'tan',
                text: '“We just upgraded our CCTV system to 4K cloud backup last Tuesday.”',
                isManipulative: false,
                explanation: 'Verified store fact proving the rumour about broken cameras was a complete fabrication to trick kids into taking risks.',
              },
            ],
          },
          {
            speaker: 'Mr. Tan',
            line: 'Whoever spread that rumour was trying to trick inexperienced kids into getting caught while they watched from afar.',
            phrases: [],
          },
        ],
      },
    ],
    targetSolutions: [
      {
        phraseId: 'sd-phrase-1',
        expectedTactic: 'false-authority',
        expectedSource: 'amir',
        expectedTarget: 'amir',
      },
      {
        phraseId: 'sd-phrase-2',
        expectedTactic: 'dare',
        expectedSource: 'amir',
        expectedTarget: 'amir',
      },
      {
        phraseId: 'sd-phrase-3',
        expectedTactic: 'social-proof',
        expectedSource: 'jun',
        expectedTarget: 'player',
      },
      {
        phraseId: 'sd-phrase-4',
        expectedTactic: 'urgency',
        expectedSource: 'jun',
        expectedTarget: 'jun',
      },
      {
        phraseId: 'sd-phrase-5',
        expectedTactic: 'loyalty',
        expectedSource: 'jun',
        expectedTarget: 'player',
      },
    ],
    rumourDistortion: {
      originalTruthSpeaker: 'may',
      originalTruth: 'The delivery truck had a traffic delay on the expressway.',
      twistedRumour: 'The snacks are running out and the cameras are broken, so grab them right now.',
      distorter: 'Block 12 Seniors & Group Chats',
    },
  },

  'fast-cash': {
    id: 'fast-cash',
    title: 'Case 2 · The Fast-Cash Account Scheme',
    subtitle: 'Underground digital wallet recruitment targeting neighbourhood students',
    incidentSummary:
      'Recruiters on a messaging channel are offering $300 cash for students to verify foreign crypto accounts using their personal Singpass and mobile bank accounts. Jun is being pressured with an urgent 5 PM countdown.',
    learningGoal:
      'Expose how financial scams use false rewards, extreme urgency, and isolation tactics to exploit young people into becoming money mules.',
    witnesses: [
      {
        id: 'jun',
        name: 'Jun',
        title: 'Tempted Student',
        location: 'Minimart Entrance',
        avatar: residents.jun,
        background: 'Jun is tempted by an offer to earn money for gaming gear.',
        transcript: [
          {
            speaker: 'Jun',
            line: 'Look at this chat! The recruiter said: “Guaranteed $300 cash in 15 minutes just for helping an overseas partner verify an app.”',
            phrases: [
              {
                id: 'fc-phrase-1',
                speakerId: 'jun',
                text: '“Guaranteed $300 cash in 15 minutes just for helping...”',
                isManipulative: true,
                associatedTactic: 'false-promise',
                targetId: 'jun',
                explanation: 'A classic too-good-to-be-true financial lure where high cash is promised for zero real work.',
              },
            ],
          },
          {
            speaker: 'Jun',
            line: 'He told me: “The VIP verification quota closes strictly at 5 PM today, confirm right now or lose your spot.”',
            phrases: [
              {
                id: 'fc-phrase-2',
                speakerId: 'jun',
                text: '“The VIP verification quota closes strictly at 5 PM today, confirm right now...”',
                isManipulative: true,
                associatedTactic: 'urgency',
                targetId: 'jun',
                explanation: 'Artificial countdown deadline designed to prevent Jun from discussing with family.',
              },
            ],
          },
          {
            speaker: 'Jun',
            line: 'He specifically emphasized: “Keep this between us. Don’t tell your parents or school teachers because adults don’t understand modern crypto.”',
            phrases: [
              {
                id: 'fc-phrase-3',
                speakerId: 'jun',
                text: '“Keep this between us. Don’t tell your parents or school teachers...”',
                isManipulative: true,
                associatedTactic: 'isolation',
                targetId: 'jun',
                explanation: 'Isolation tactic cutting off access to trusted adults and guidance.',
              },
            ],
          },
        ],
      },
      {
        id: 'amir',
        name: 'Amir',
        title: 'Vigilant Friend',
        location: 'Void Deck Table',
        avatar: residents.amir,
        background: 'Amir noticed the red flags and warned Jun immediately.',
        transcript: [
          {
            speaker: 'Amir',
            line: 'I warned Jun that the recruiter claimed: “Every cool secondary school kid in the East is already registered.”',
            phrases: [
              {
                id: 'fc-phrase-4',
                speakerId: 'amir',
                text: '“Every cool secondary school kid in the East is already registered.”',
                isManipulative: true,
                associatedTactic: 'social-proof',
                targetId: 'jun',
                explanation: 'Fabricated social proof to make illegal money-mule activity seem trendy and widespread.',
              },
            ],
          },
          {
            speaker: 'Amir',
            line: 'Why would a legitimate international business hire teenagers in a secret chat to transfer money through personal bank accounts? It makes zero sense!',
            phrases: [],
          },
        ],
      },
      {
        id: 'may',
        name: 'Auntie May',
        title: 'RC Volunteer',
        location: 'Residents’ Corner',
        avatar: residents.may,
        background: 'Volunteers with the local community safety network.',
        transcript: [
          {
            speaker: 'Auntie May',
            line: 'Just this morning the police crime prevention officer visited our centre! Handing over bank credentials makes you a money mule liable for criminal prosecution.',
            phrases: [
              {
                id: 'fc-phrase-5',
                speakerId: 'may',
                text: '“Handing over bank credentials makes you a money mule liable for criminal prosecution.”',
                isManipulative: false,
                explanation: 'Factual legal warning from Singapore Police Force crime prevention bulletins.',
              },
            ],
          },
          {
            speaker: 'Auntie May',
            line: 'No legitimate financial company ever pays you to register using your personal Singpass!',
            phrases: [],
          },
        ],
      },
      {
        id: 'tan',
        name: 'Mr. Tan',
        title: 'Community Merchant',
        location: 'Sunshine Minimart',
        avatar: residents.cashier,
        background: 'Sees many youth in the neighbourhood and listens to their concerns.',
        transcript: [
          {
            speaker: 'Mr. Tan',
            line: 'Whenever an offer pairs urgent countdowns with strict secrecy, it is 100% a trap to prevent young people from asking for help.',
            phrases: [],
          },
        ],
      },
    ],
    targetSolutions: [
      {
        phraseId: 'fc-phrase-1',
        expectedTactic: 'false-promise',
        expectedSource: 'jun',
        expectedTarget: 'jun',
      },
      {
        phraseId: 'fc-phrase-2',
        expectedTactic: 'urgency',
        expectedSource: 'jun',
        expectedTarget: 'jun',
      },
      {
        phraseId: 'fc-phrase-3',
        expectedTactic: 'isolation',
        expectedSource: 'jun',
        expectedTarget: 'jun',
      },
      {
        phraseId: 'fc-phrase-4',
        expectedTactic: 'social-proof',
        expectedSource: 'amir',
        expectedTarget: 'jun',
      },
    ],
    rumourDistortion: {
      originalTruthSpeaker: 'may',
      originalTruth: 'Community advisory warns that syndicates recruit students as money mules.',
      twistedRumour: 'It’s just an easy VIP crypto partner gig that everyone is doing for fast cash.',
      distorter: 'Anonymous Online Scam Recruiter',
    },
  },
}

const STORAGE_KEY = 'shieldquest.practice.whisperNetwork'

export function readStoredWhisperRecord(scenarioId?: 'snack-dare' | 'fast-cash'): WhisperNetworkResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WhisperNetworkResult
    if (scenarioId && parsed.scenarioId !== scenarioId) return null
    return parsed
  } catch {
    return null
  }
}

export function saveWhisperRecord(result: WhisperNetworkResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch {
    // Local storage unavailable
  }
}

export function evaluateWhisperBoard(params: {
  scenarioId: 'snack-dare' | 'fast-cash'
  connections: WhisperConnection[]
  selectedTwistedSpeakerId?: string
}): WhisperNetworkResult {
  const { scenarioId, connections, selectedTwistedSpeakerId } = params
  const scenario = WHISPER_SCENARIOS[scenarioId]

  let correctMatches = 0
  const feedbackMessages: string[] = []

  for (const sol of scenario.targetSolutions) {
    const match = connections.find(
      c => c.phraseId === sol.phraseId && c.tacticId === sol.expectedTactic
    )
    if (match) {
      correctMatches++
      const tacticObj = INFLUENCE_TACTICS[sol.expectedTactic]
      feedbackMessages.push(`Correctly identified ${tacticObj.name} in phrase.`)
    }
  }

  const identifiedTwistedFact =
    selectedTwistedSpeakerId === scenario.rumourDistortion.originalTruthSpeaker

  if (identifiedTwistedFact) {
    feedbackMessages.push(
      `Pinpointed rumour origin: Recognized that ${scenario.rumourDistortion.originalTruthSpeaker.toUpperCase()} was speaking factual truth that was distorted.`
    )
  }

  const totalTargets = scenario.targetSolutions.length
  const accuracy = Math.round((correctMatches / totalTargets) * 75)
  const distortionBonus = identifiedTwistedFact ? 25 : 0
  const totalScore = Math.min(100, accuracy + distortionBonus)

  let detectiveRank: WhisperNetworkResult['detectiveRank'] = 'Cadet'
  if (totalScore >= 90) detectiveRank = 'Chief Guardian Analyst'
  else if (totalScore >= 70) detectiveRank = 'Senior Investigator'
  else if (totalScore >= 50) detectiveRank = 'Junior Detective'

  const passed = totalScore >= 70

  return {
    scenarioId,
    connectionsMapped: connections,
    correctConnectionsCount: correctMatches,
    totalTargetConnections: totalTargets,
    identifiedTwistedFact,
    passed,
    score: totalScore,
    detectiveRank,
    feedbackMessages,
    completedAt: new Date().toISOString(),
  }
}
