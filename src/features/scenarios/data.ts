// TODO(Scenario.content, Choice.delayedConsequence): temporary authored previews; these IDs are not served by Express yet.
import type { MissionScenario } from '../../../types/scenarios';
import { GUARDIAN_VERIFOX, GUARDIAN_SHIELDFIN, GUARDIAN_BEACON } from '../guardians/data';

export const MULE_ENCOUNTER: MissionScenario = {
  id: 'scn_money_mule_01',
  mode: 'ENCOUNTER',
  title: 'Easy Money?',
  category: 'Money Mule Recruitment',
  hook: 'Can you spot the risk before the reward?',
  difficulty: 'Medium',
  estimatedMinutes: 3,
  primaryCompetency: 'SPOT',
  competencies: ['SPOT', 'HOLD', 'EVALUATE'],
  step: 2,
  totalSteps: 4,
  prompt: 'Someone online offers you S$200 to receive money into your bank account.',
  messages: [
    {
      id: 'm1',
      author: 'system',
      body: 'Message request from an unknown contact',
      meta: 'You have not spoken to this account before',
    },
    {
      id: 'm2',
      author: 'them',
      displayName: 'Unknown contact',
      body: 'Bro easy $200.',
    },
    {
      id: 'm3',
      author: 'them',
      displayName: 'Unknown contact',
      body: 'Just let money enter your account then transfer it out.',
    },
    {
      id: 'm4',
      author: 'them',
      displayName: 'Unknown contact',
      body: 'No risk. Takes 5 mins only. Need your answer tonight.',
    },
  ],
  clueQuestion: 'Why does this seem suspicious?',
  clues: [
    {
      id: 'cl_easy',
      label: 'Easy money',
      note: 'A large payment for almost no work is a recruitment tactic, not a job.',
    },
    {
      id: 'cl_urgency',
      label: 'Urgency',
      note: 'A deadline is there to stop you checking. Real offers survive a delay.',
    },
    {
      id: 'cl_account',
      label: 'Using my account',
      note: 'Nobody legitimate needs your personal account to move their money.',
    },
    {
      id: 'cl_unknown',
      label: 'Unknown sender',
      note: 'You cannot verify who this is, so you cannot verify what you are agreeing to.',
    },
  ],
  choices: [
    {
      id: 'ch_accept',
      label: 'Accept',
      hint: 'Share your account details and take the S$200',
      reply: 'Ok deal. Sending you my account number now.',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 200 },
        flashTitle: 'Payment received',
        flashAmount: '+200 Coins',
      },
      delayed: {
        delayMs: 3000,
        timeLabel: '3 days later',
        headline: 'Account access restricted',
        body: 'Transactions through your account were flagged as suspicious. The account is now restricted while the transfers are reviewed.',
        deltas: { coins: -200, trust: -20, risk: 25 },
        changedImmediate: ['+200 Coins'],
        changedLater: ['Account restricted', 'Trust decreased', 'Risk increased'],
        warningSigns: [
          'Payment offered for use of your personal account',
          'Unknown sender you could not verify',
          'Easy-money promise for almost no work',
          'Request to transfer the funds onward',
        ],
        saferResponse:
          'Do not allow other people to use your bank account to receive or move money. Disengage, and seek help through appropriate official channels where necessary.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'You took the offer',
        body: 'The payment arrived straight away, which is exactly why this approach works on people.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'ch_proof',
      label: 'Ask for proof',
      hint: 'Ask who they are before deciding anything',
      reply: 'Which company is this? Send me your registration details first.',
      outcome: 'CAUTIOUS',
      immediate: {
        deltas: { coins: 10, trust: 4 },
        flashTitle: 'You slowed it down',
        flashAmount: '+10 Coins',
      },
      debrief: {
        headline: 'Partly there',
        body: 'Slowing the conversation down was the right instinct. But documents are easy to fake, and staying in the chat keeps the pressure on you. The offer is unsafe regardless of who is asking, so verifying the sender is weaker than stepping away.',
        spotted: ['Unverified sender'],
        saferResponse:
          'You do not need to establish who they are. Decline the use of your account and disengage.',
        competency: 'HOLD',
        guardianId: GUARDIAN_VERIFOX,
      },
    },
    {
      id: 'ch_reject',
      label: 'Reject & seek help',
      hint: 'Decline, disengage, and tell someone you trust',
      reply: "No — I'm not letting anyone use my account. Blocking this and telling someone.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 50, resilience: 10, trust: 10, risk: -10 },
        flashTitle: 'Good call',
        flashAmount: '+50 Coins',
      },
      debrief: {
        headline: 'Good call',
        body: 'You disengaged instead of negotiating, and you brought someone else in. That is the response that holds up even when the offer is dressed up convincingly.',
        spotted: [
          'Unverified sender',
          'Easy-money incentive',
          'Request to use your personal account',
        ],
        saferResponse:
          'Letting someone else move money through your account can make you responsible for it. Decline, disengage, and raise it through an appropriate official channel if you are unsure.',
        competency: 'SPOT',
        guardianId: GUARDIAN_VERIFOX,
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Peer Shield Mode                                                    */
/* ------------------------------------------------------------------ */

export const MULE_PEER_SHIELD: MissionScenario = {
  id: 'scn_money_mule_peer_01',
  mode: 'PEER_SHIELD',
  title: "Jayden's Offer",
  category: 'Money Mule Recruitment',
  hook: "Sometimes the risky choice isn't yours.",
  difficulty: 'Medium',
  estimatedMinutes: 2,
  primaryCompetency: 'DEFEND',
  competencies: ['DEFEND', 'LEAD'],
  step: 1,
  totalSteps: 3,
  prompt: 'You notice your friend agreeing to transfer unknown funds.',
  messages: [
    {
      id: 'p1',
      author: 'system',
      body: 'Group chat · 6 members',
      meta: 'Jayden posted 2 minutes ago',
    },
    {
      id: 'p2',
      author: 'them',
      displayName: 'Jayden',
      body: "Bro this guy says he'll pay me $200. I just need to receive the money first.",
    },
    {
      id: 'p3',
      author: 'them',
      displayName: 'Jayden',
      body: 'Sending him my account number now. Free money sia.',
    },
  ],
  clueQuestion: "What stands out about Jayden's situation?",
  clues: [
    {
      id: 'pcl_account',
      label: 'His account, their money',
      note: 'Jayden would be the named account holder for funds that are not his.',
    },
    {
      id: 'pcl_stranger',
      label: "He hasn't met them",
      note: 'There is no way for Jayden to check who he is actually helping.',
    },
    {
      id: 'pcl_public',
      label: 'Six people are watching',
      note: 'The more people who see it, the less likely any one of them says something.',
    },
  ],
  choices: [
    {
      id: 'pc_ignore',
      label: 'Ignore it',
      hint: 'Say nothing and scroll past',
      reply: '(You say nothing and close the chat.)',
      outcome: 'RISKY',
      immediate: {
        deltas: { resilience: -10, risk: 5 },
        flashTitle: 'You stayed quiet',
        flashAmount: '−10 Resilience',
      },
      debrief: {
        headline: 'Silence reads as agreement',
        body: 'Six people saw the message and nobody gave Jayden a reason to stop. The more witnesses there are, the less likely any single one of them speaks up — which is exactly why saying something matters.',
        competency: 'DEFEND',
      },
    },
    {
      id: 'pc_private',
      label: 'Warn them privately',
      hint: 'Message Jayden directly, away from the group',
      reply: "(Direct message to Jayden) Hey — hold off on that one, I don't think it's safe.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 40, resilience: 30, trust: 8 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+30 Community Resilience',
      },
      debrief: {
        headline: 'Peer Shield success',
        body: 'You challenged the risky behaviour without escalating the situation. A private message lets Jayden step back without losing face in front of the group, which is the single biggest barrier to a friend changing their mind.',
        spotted: [
          'Raised it privately, not publicly',
          'Named the risk without shaming him',
          'Gave him a clear next step',
        ],
        sampleScript:
          "This sounds risky. Why does he need YOUR account? Don't send anything first — let's check it properly.",
        competency: 'DEFEND',
        guardianId: GUARDIAN_SHIELDFIN,
      },
    },
    {
      id: 'pc_help',
      label: 'Get appropriate help',
      hint: 'Bring in a trusted adult or an official channel',
      reply: '(You speak to someone you trust and point Jayden to the right place to check.)',
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 35, resilience: 25, trust: 10 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+25 Community Resilience',
      },
      debrief: {
        headline: 'Peer Shield success',
        body: 'Some situations are bigger than a group chat. Bringing in a trusted adult or an official channel is the right call when a friend has already shared their details — and it does not require you to confront anyone yourself.',
        spotted: [
          'Recognised it had gone past peer advice',
          'Chose a trusted adult over confrontation',
        ],
        sampleScript:
          "I'm not sure how to fix this one — let's ask someone who actually knows what to do before anything gets transferred.",
        competency: 'LEAD',
        guardianId: GUARDIAN_BEACON,
      },
    },
  ],
};
