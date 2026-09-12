import type { Scenario } from '../types.ts';

/**
 * ShieldQuest scenarios.
 *
 * Eight authored missions, two per district, covering the themes the proposal
 * assigns to each age band (§4): stranger approaches and online safety for the
 * youngest band; shop theft, phishing, harassment and risky dares in the middle;
 * job scams, money-mule recruitment and suspicious financial requests for
 * post-secondary players. The grant commits to 30–40 reviewed scenarios by the
 * end of the project — these are the reviewed seed set and the shape every
 * later one follows.
 *
 * Four rules hold in every scenario here, and must hold in every one added:
 *
 * 1. **The risky option pays first.** If the tempting choice does not feel
 *    genuinely good at the moment it is taken, the delayed consequence teaches
 *    nothing. Risky choices carry the largest immediate reward on the board.
 * 2. **Feedback describes the offender's tactic, never the player's stupidity.**
 *    No line may imply a victim deserved what happened (proposal §7, risk
 *    register: victim-blaming).
 * 3. **Help is pointed at a trusted person or an appropriate official channel**,
 *    never at a named agency as though it endorsed this game.
 * 4. **No real credentials, banking data or identity documents** are ever
 *    requested, even fictionally, as an input the player types.
 */

/* ------------------------------------------------------------------ */
/* Digi-District — money mule, job scams                               */
/* ------------------------------------------------------------------ */

const EASY_MONEY: Scenario = {
  id: 'scn_easy_money',
  mode: 'ENCOUNTER',
  title: 'Easy Money?',
  category: 'Money Mule Recruitment',
  hook: 'Can you spot the risk before the reward?',
  difficulty: 'Medium',
  estimatedMinutes: 3,
  primaryCompetency: 'SPOT',
  competencies: ['SPOT', 'HOLD', 'EVALUATE'],
  bands: ['B14_16', 'B17_24'],
  prompt: 'Someone online offers you S$200 to receive money into your bank account.',
  messages: [
    {
      id: 'm1',
      author: 'system',
      body: 'Message request from an unknown contact',
      meta: 'You have not spoken to this account before',
    },
    { id: 'm2', author: 'them', displayName: 'Unknown contact', body: 'Bro easy $200.' },
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
        delayTurns: 2,
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
          'Do not allow other people to use your bank account to receive or move money. Disengage, and seek help through an appropriate official channel where necessary.',
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
        guardianId: 'verifox',
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
        guardianId: 'verifox',
      },
    },
  ],
};

const JOB_SCAM: Scenario = {
  id: 'scn_job_scam',
  mode: 'ENCOUNTER',
  title: 'The Part-Time Listing',
  category: 'Job Scam',
  hook: 'The pay is good. The process is strange.',
  difficulty: 'Hard',
  estimatedMinutes: 3,
  primaryCompetency: 'IDENTIFY',
  competencies: ['IDENTIFY', 'SPOT', 'EVALUATE'],
  bands: ['B17_24'],
  prompt: 'A recruiter offers S$80 an hour for "product reviews" — and wants a deposit first.',
  messages: [
    {
      id: 'j1',
      author: 'system',
      body: 'New chat · recruiter found your profile',
      meta: 'The company name in the chat does not match the account name',
    },
    {
      id: 'j2',
      author: 'them',
      displayName: 'HR — Talent Team',
      body: 'Hi! Part-time role: review products online. $80/hr, work from home.',
    },
    {
      id: 'j3',
      author: 'them',
      displayName: 'HR — Talent Team',
      body: 'To activate your account, top up $100 first. You get it back with your first payout.',
    },
    {
      id: 'j4',
      author: 'them',
      displayName: 'HR — Talent Team',
      body: 'Slots close at midnight. Shall I reserve yours?',
    },
  ],
  clueQuestion: 'What does not add up here?',
  clues: [
    {
      id: 'jc_pay',
      label: 'The pay is unreal',
      note: 'A rate far above the going rate for simple work is bait, not generosity.',
    },
    {
      id: 'jc_deposit',
      label: 'You pay them first',
      note: 'A real employer pays you. Money moving towards the "job" is the tell.',
    },
    {
      id: 'jc_identity',
      label: 'Company name mismatch',
      note: 'The account name and the company they claim to represent are different.',
    },
    {
      id: 'jc_deadline',
      label: 'Midnight deadline',
      note: 'Scarcity is manufactured so you decide before you check.',
    },
  ],
  choices: [
    {
      id: 'jch_topup',
      label: 'Top up the S$100',
      hint: 'Pay the activation fee and start earning',
      reply: 'Sent the $100. When do I start?',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 160, trust: 2 },
        flashTitle: 'First task paid out',
        flashAmount: '+160 Coins',
      },
      delayed: {
        delayTurns: 2,
        timeLabel: '1 week later',
        headline: 'The account stopped paying out',
        body: 'The first small payout arrived, which is what convinced you to top up a larger amount. After that the chat went quiet and the withdrawal page kept asking for one more fee.',
        deltas: { coins: -260, trust: -15, risk: 20 },
        changedImmediate: ['+160 Coins', 'A working first payout'],
        changedLater: ['Deposit gone', 'Larger top-up gone', 'Trust decreased'],
        warningSigns: [
          'You were asked to pay before being paid',
          'Pay rate far above the going rate',
          'Account name did not match the company',
          'A deadline that stopped you checking',
        ],
        saferResponse:
          'A legitimate employer never asks you to pay to start work. Check the company through its own official listing, and speak to someone you trust before sending money.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'You paid to start',
        body: 'The small first payout is part of the method: it buys your confidence cheaply so the larger top-up feels safe.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'jch_check',
      label: 'Check the company',
      hint: 'Look the employer up independently before replying',
      reply: 'Let me look up the company first.',
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 45, trust: 8, risk: -8 },
        flashTitle: 'Verified independently',
        flashAmount: '+45 Coins',
      },
      debrief: {
        headline: 'You checked outside the chat',
        body: 'Looking the employer up through its own official channel — not the link they sent — is the step this method is designed to skip past. The listing did not exist.',
        spotted: ['Company name mismatch', 'Pay far above the going rate'],
        saferResponse:
          'Verify a job through the company official channel you find yourself, never through a link or document supplied by the person recruiting you.',
        competency: 'IDENTIFY',
        guardianId: 'cluepaw',
      },
    },
    {
      id: 'jch_walk',
      label: 'Walk away',
      hint: 'No deposit, no job. End the conversation.',
      reply: "I don't pay to work. Not interested.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 50, trust: 10, risk: -10, resilience: 5 },
        flashTitle: 'You held the line',
        flashAmount: '+50 Coins',
      },
      debrief: {
        headline: 'One rule did all the work',
        body: 'You did not need to investigate anything. "I do not pay to work" is a rule that survives whatever story is attached to it, which makes it stronger than judging each offer on its details.',
        spotted: ['Upfront payment requested', 'Manufactured deadline'],
        saferResponse:
          'Treat any request to pay before working as the end of the conversation, however convincing the rest of it is.',
        competency: 'SPOT',
        guardianId: 'verifox',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* School Street — peer pressure, holding items, dares                 */
/* ------------------------------------------------------------------ */

const HOLD_IT: Scenario = {
  id: 'scn_hold_it',
  mode: 'ENCOUNTER',
  title: 'Just Hold It For Me',
  category: 'Peer Pressure',
  hook: 'It is in your bag. That is the part that matters.',
  difficulty: 'Medium',
  estimatedMinutes: 3,
  primaryCompetency: 'HOLD',
  competencies: ['HOLD', 'EVALUATE', 'LEAD'],
  bands: ['B10_13', 'B14_16'],
  prompt: 'A classmate wants to leave something in your bag until after class.',
  messages: [
    {
      id: 'h1',
      author: 'system',
      body: 'Corridor, between periods',
      meta: 'Two other classmates are waiting and watching',
    },
    {
      id: 'h2',
      author: 'them',
      displayName: 'Classmate',
      body: 'Eh can you keep this in your bag until after class?',
    },
    { id: 'h3', author: 'them', displayName: 'Classmate', body: "Don't open it lah. Just hold." },
    {
      id: 'h4',
      author: 'them',
      displayName: 'Classmate',
      body: 'Bell is ringing already. Yes or no?',
    },
  ],
  clueQuestion: 'What is actually being asked?',
  clues: [
    {
      id: 'hc_unknown',
      label: 'You cannot see it',
      note: 'You are being asked to take responsibility for something you are not allowed to identify.',
    },
    {
      id: 'hc_bag',
      label: 'Your bag, your name',
      note: 'If it is found, it is found in your bag. Explaining afterwards is much harder than saying no now.',
    },
    {
      id: 'hc_rush',
      label: 'The bell',
      note: 'The rush is doing the persuading. A fair request can wait ten seconds.',
    },
  ],
  choices: [
    {
      id: 'hch_take',
      label: 'Take it',
      hint: "Hold it — they're a friend, and everyone is watching",
      reply: 'Ok fine, put it in.',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 120, trust: 5 },
        flashTitle: 'The group backed off',
        flashAmount: '+120 Coins',
      },
      delayed: {
        delayTurns: 2,
        timeLabel: 'Later that day',
        headline: 'The bag was checked, not the person who filled it',
        body: 'The item was found where it was left — with you. Being able to name who handed it over did not change whose bag it was in.',
        deltas: { coins: -120, trust: -18, risk: 20 },
        changedImmediate: ['+120 Coins', 'The pressure stopped instantly'],
        changedLater: ['Found in your bag', 'Trust decreased', 'Risk increased'],
        warningSigns: [
          'You were told not to look at what you were holding',
          'The request arrived with a deadline',
          'An audience made refusing feel expensive',
        ],
        saferResponse:
          'You do not have to hold anything you are not allowed to see. "I can not, sorry" is a complete answer, and you can walk while you say it.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'You took it',
        body: 'Saying yes ended an uncomfortable moment immediately. That relief is exactly what the request was built on.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'hch_open',
      label: 'Ask to see it first',
      hint: "Say you'll hold it only if you can look",
      reply: 'I will hold it if you show me what it is.',
      outcome: 'CAUTIOUS',
      immediate: {
        deltas: { coins: 20, trust: 4 },
        flashTitle: 'You put a condition on it',
        flashAmount: '+20 Coins',
      },
      debrief: {
        headline: 'A condition is better than a yes',
        body: 'Asking to see it shifts the pressure back where it belongs. It is still weaker than declining, because whatever you are shown, the item ends up in your bag under your name.',
        spotted: ['You were not allowed to identify it'],
        saferResponse:
          'The safest version is not a better yes — it is a no that does not need a reason.',
        competency: 'HOLD',
        guardianId: 'echo',
      },
    },
    {
      id: 'hch_decline',
      label: 'Decline and move on',
      hint: 'Say no without negotiating, and keep walking',
      reply: 'Cannot, sorry. Ask someone else.',
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 55, trust: 10, risk: -8, resilience: 8 },
        flashTitle: 'Clean refusal',
        flashAmount: '+55 Coins',
      },
      debrief: {
        headline: 'You refused without arguing',
        body: 'You did not explain, apologise at length or offer an alternative — all of which invite a second attempt. A short refusal in motion is the hardest one to push back on.',
        spotted: ['Refused to take responsibility for an unseen item', 'Did not negotiate'],
        saferResponse:
          'If someone keeps pushing after a clear no, tell a teacher or another adult you trust. Persistent pressure is itself the thing worth reporting.',
        competency: 'HOLD',
        guardianId: 'echo',
      },
    },
  ],
};

const FRIEND_UNDER_PRESSURE: Scenario = {
  id: 'scn_friend_pressure',
  mode: 'PEER_SHIELD',
  title: 'Friend Under Pressure',
  category: 'Risky Dare',
  hook: 'You are not the target. You are the witness.',
  difficulty: 'Medium',
  estimatedMinutes: 2,
  primaryCompetency: 'DEFEND',
  competencies: ['DEFEND', 'LEAD'],
  bands: ['B10_13', 'B14_16'],
  prompt: 'Your friend is being dared in front of the group, and a phone is already recording.',
  messages: [
    {
      id: 'f1',
      author: 'system',
      body: 'After school · six people, one phone recording',
      meta: 'Nobody has said anything yet',
    },
    { id: 'f2', author: 'them', displayName: 'Group', body: 'Do it lah. Ten seconds only.' },
    {
      id: 'f3',
      author: 'them',
      displayName: 'Group',
      body: "It's already recording. Don't waste it.",
    },
    { id: 'f4', author: 'them', displayName: 'Your friend', body: '…fine, ok, whatever.' },
  ],
  clueQuestion: "What is holding your friend in place?",
  clues: [
    {
      id: 'fc_audience',
      label: 'The audience',
      note: 'Backing out in front of six people costs more than the dare does. That is the whole mechanism.',
    },
    {
      id: 'fc_camera',
      label: 'The camera',
      note: 'A recording turns a ten-second decision into something that keeps existing.',
    },
    {
      id: 'fc_silence',
      label: 'Nobody has objected',
      note: 'Silence reads as agreement, and everyone is waiting for someone else to break it.',
    },
  ],
  choices: [
    {
      id: 'fch_watch',
      label: 'Stay out of it',
      hint: 'Not your problem — let it play out',
      reply: '(You say nothing.)',
      outcome: 'RISKY',
      immediate: {
        deltas: { resilience: -12, risk: 6 },
        flashTitle: 'You stayed quiet',
        flashAmount: '−12 Resilience',
      },
      debrief: {
        headline: 'Silence is a vote',
        body: 'Six people were waiting for a reason to stop, and nobody gave them one. The more witnesses there are, the less likely any single one of them speaks — which is exactly why one person speaking changes the room.',
        competency: 'DEFEND',
      },
    },
    {
      id: 'fch_exit',
      label: 'Give them an exit',
      hint: 'Pull the attention away so your friend can step back',
      reply: "Eh we're going to be late — come, let's go.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 45, resilience: 28, trust: 8 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+28 Resilience',
      },
      debrief: {
        headline: 'Peer Shield success',
        body: 'You did not argue with the group or make your friend defend themselves. Changing the subject and creating a reason to leave lets someone step back without losing face, which is the single biggest barrier to them changing their mind.',
        spotted: ['Moved the attention, not the argument', 'Let your friend exit without losing face'],
        sampleScript: "Come lah, we need to go. You can do your thing another time.",
        competency: 'DEFEND',
        guardianId: 'shieldfin',
      },
    },
    {
      id: 'fch_camera',
      label: 'Name the recording',
      hint: 'Point out that the video outlives the dare',
      reply: 'Whoever is filming — delete that. It stays on the internet, not on you.',
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 40, resilience: 22, trust: 10 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+22 Resilience',
      },
      debrief: {
        headline: 'You changed what was at stake',
        body: 'Naming the recording moves the risk from your friend to the group, and it gives the person filming a decision of their own to make. It works best when you address the camera rather than the person being dared.',
        spotted: ['Named the lasting consequence', 'Addressed the group, not the target'],
        sampleScript: 'That video is going to be around longer than this joke is. Delete it.',
        competency: 'LEAD',
        guardianId: 'beacon',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Retail District — shop theft dares, e-commerce                      */
/* ------------------------------------------------------------------ */

const CHECKOUT_DARE: Scenario = {
  id: 'scn_checkout_dare',
  mode: 'ENCOUNTER',
  title: 'The Dare at Checkout',
  category: 'Shop Theft',
  hook: 'Nobody is watching the aisle. Something always is.',
  difficulty: 'Medium',
  estimatedMinutes: 3,
  primaryCompetency: 'IDENTIFY',
  competencies: ['IDENTIFY', 'EVALUATE', 'LEAD'],
  bands: ['B14_16', 'B17_24'],
  prompt: 'Your friends are filming, and one of them says the aisle is a blind spot.',
  messages: [
    {
      id: 'r1',
      author: 'system',
      body: 'Convenience store, after school',
      meta: 'One friend is filming on their phone',
    },
    { id: 'r2', author: 'them', displayName: 'Friend', body: 'Aisle 3 has no camera. Go.' },
    { id: 'r3', author: 'them', displayName: 'Friend', body: "It's like $4. Nobody cares." },
    { id: 'r4', author: 'them', displayName: 'Friend', body: 'Chicken ah? Recording already.' },
  ],
  clueQuestion: 'What is the real risk in this situation?',
  clues: [
    {
      id: 'rc_record',
      label: 'It is being filmed',
      note: 'The evidence is being created by your own group, and it does not disappear when the joke ends.',
    },
    {
      id: 'rc_value',
      label: '"It is only $4"',
      note: 'The value of the item does not decide how the act is treated.',
    },
    {
      id: 'rc_blindspot',
      label: 'The "blind spot"',
      note: 'Someone confidently telling you where the cameras are not is a guess, presented as a fact.',
    },
  ],
  choices: [
    {
      id: 'rch_do',
      label: 'Do it',
      hint: 'Take it — it is four dollars and they are watching',
      reply: '(You put it in your pocket and walk.)',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 150, trust: 6 },
        flashTitle: 'The group went wild',
        flashAmount: '+150 Coins',
      },
      delayed: {
        delayTurns: 2,
        timeLabel: '2 weeks later',
        headline: 'The clip was still on a phone',
        body: 'The store had more cameras than your friend thought, and the video your group filmed matched the footage. What made it serious was not the four dollars — it was that it was recorded, shared, and easy to identify you from.',
        deltas: { coins: -150, trust: -22, risk: 28 },
        changedImmediate: ['+150 Coins', 'The group approved'],
        changedLater: ['Identified from footage', 'Trust decreased', 'Risk increased'],
        warningSigns: [
          'Your own group created the evidence',
          'The "blind spot" was someone guessing',
          'Low value framed as low consequence',
        ],
        saferResponse:
          'Shop theft is treated as theft regardless of the value of the item. If friends are filming a dare, the recording is the part most likely to follow you.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'The dare worked',
        body: 'Being filmed made refusing feel like a bigger deal than taking it. That is the pressure the dare is built from, not the item.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'rch_stall',
      label: 'Laugh it off',
      hint: 'Turn it into a joke and hope they move on',
      reply: 'Bro I am not doing that for a $4 drink.',
      outcome: 'CAUTIOUS',
      immediate: {
        deltas: { coins: 25, trust: 5 },
        flashTitle: 'You deflected',
        flashAmount: '+25 Coins',
      },
      debrief: {
        headline: 'It worked, this time',
        body: 'Humour is a real refusal skill and it protects your standing in the group. It is marked cautious only because it leaves the dare alive — the phone is still recording and the next person can still be asked.',
        spotted: ['Refused without escalating'],
        saferResponse:
          'Pair the joke with leaving. A refusal is most durable when the situation ends rather than pauses.',
        competency: 'IDENTIFY',
        guardianId: 'cluepaw',
      },
    },
    {
      id: 'rch_leave',
      label: 'Pay and leave',
      hint: 'Buy what you came for and take the group with you',
      reply: "I'm paying for mine. Come, let's go.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 55, trust: 12, risk: -10, resilience: 10 },
        flashTitle: 'You ended it',
        flashAmount: '+55 Coins',
      },
      debrief: {
        headline: 'You took the situation with you',
        body: 'Leaving does two jobs at once: it refuses the dare, and it removes the audience that made the dare work. Nobody had to be argued out of anything.',
        spotted: ['Refused the dare', 'Removed the audience', 'Left no recording to share'],
        saferResponse:
          'If a group keeps pushing a dare in a shop, leaving is both the refusal and the fix.',
        competency: 'LEAD',
        guardianId: 'beacon',
      },
    },
  ],
};

const FAKE_LISTING: Scenario = {
  id: 'scn_fake_listing',
  mode: 'ENCOUNTER',
  title: 'Too Cheap To Be Real',
  category: 'E-commerce Scam',
  hook: 'The price is the advertisement. The pressure is the product.',
  difficulty: 'Easy',
  estimatedMinutes: 2,
  primaryCompetency: 'SPOT',
  competencies: ['SPOT', 'HOLD'],
  bands: ['B10_13', 'B14_16', 'B17_24'],
  prompt: 'A listing has the console you want at less than half price — if you pay outside the app.',
  messages: [
    {
      id: 'e1',
      author: 'system',
      body: 'Marketplace listing · seller joined 4 days ago',
      meta: 'No reviews, no past sales',
    },
    {
      id: 'e2',
      author: 'them',
      displayName: 'Seller',
      body: 'Yes still available. $180 only, brand new.',
    },
    {
      id: 'e3',
      author: 'them',
      displayName: 'Seller',
      body: "Pay me directly ah, don't use the app. App takes fee.",
    },
    {
      id: 'e4',
      author: 'them',
      displayName: 'Seller',
      body: 'Got 3 other buyers asking. First to transfer gets it.',
    },
  ],
  clueQuestion: 'Which signals stand out?',
  clues: [
    {
      id: 'ec_price',
      label: 'Less than half price',
      note: 'The price is set to stop you thinking, not to make a sale.',
    },
    {
      id: 'ec_offapp',
      label: 'Pay outside the app',
      note: 'Leaving the platform removes the only protection you had in the transaction.',
    },
    {
      id: 'ec_new',
      label: 'Brand new account',
      note: 'A four-day-old account with no sales has nothing to lose by disappearing.',
    },
    {
      id: 'ec_queue',
      label: 'Other buyers waiting',
      note: 'A queue you cannot see is the cheapest pressure there is to invent.',
    },
  ],
  choices: [
    {
      id: 'ech_transfer',
      label: 'Transfer now',
      hint: 'Send the money before someone else takes it',
      reply: 'Ok transferring now. Send me the address.',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 140 },
        flashTitle: 'Deal secured',
        flashAmount: '+140 Coins',
      },
      delayed: {
        delayTurns: 2,
        timeLabel: '4 days later',
        headline: 'The seller stopped replying',
        body: 'The account was deleted and the listing is gone. Because the payment was made outside the platform, there was no transaction record to dispute.',
        deltas: { coins: -180, trust: -12, risk: 15 },
        changedImmediate: ['+140 Coins', 'You "won" the item'],
        changedLater: ['Money gone', 'No transaction protection', 'Account deleted'],
        warningSigns: [
          'Price far below market',
          'Asked to pay outside the platform',
          'Account created days earlier with no sales',
          'An invisible queue of other buyers',
        ],
        saferResponse:
          'Keep the payment inside the platform, whatever fee is quoted as the reason to leave it. If a seller insists on moving the payment elsewhere, that is the end of the deal.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'You moved fast',
        body: 'The queue of other buyers did the work. Speed was the point of the listing, not the price.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'ech_inapp',
      label: 'Insist on in-app payment',
      hint: 'Offer to buy, but only through the platform',
      reply: "I'll take it, but only through the app.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 45, trust: 8, risk: -8 },
        flashTitle: 'You kept your protection',
        flashAmount: '+45 Coins',
      },
      debrief: {
        headline: 'You kept the transaction where it could be traced',
        body: 'The seller stopped replying as soon as the payment had to be traceable. You did not have to work out whether they were genuine — the condition did it for you.',
        spotted: ['Refused to pay outside the platform'],
        saferResponse:
          'A seller who will not accept a traceable payment is telling you what the listing is.',
        competency: 'SPOT',
        guardianId: 'verifox',
      },
    },
    {
      id: 'ech_wait',
      label: 'Sleep on it',
      hint: 'Tell them you will decide tomorrow',
      reply: "I'll think about it and get back to you tomorrow.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 40, trust: 6, resilience: 6 },
        flashTitle: 'You outlasted the deadline',
        flashAmount: '+40 Coins',
      },
      debrief: {
        headline: 'The offer did not survive a night',
        body: 'Nothing about the item required a decision that evening. Introducing a delay costs you nothing on a genuine deal, and breaks almost every pressured one.',
        spotted: ['Refused the manufactured deadline'],
        saferResponse:
          'When you feel rushed, that feeling is the signal. Give the decision one night and see whether the offer still exists.',
        competency: 'HOLD',
        guardianId: 'echo',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Community Hub — Peer Shield Mode                                    */
/* ------------------------------------------------------------------ */

const PEER_JAYDEN: Scenario = {
  id: 'scn_peer_jayden',
  mode: 'PEER_SHIELD',
  title: "Jayden's Offer",
  category: 'Money Mule Recruitment',
  hook: "Sometimes the risky choice isn't yours.",
  difficulty: 'Medium',
  estimatedMinutes: 2,
  primaryCompetency: 'DEFEND',
  competencies: ['DEFEND', 'LEAD'],
  bands: ['B14_16', 'B17_24'],
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
        flashAmount: '+30 Resilience',
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
        guardianId: 'shieldfin',
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
        flashAmount: '+25 Resilience',
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
        guardianId: 'beacon',
      },
    },
  ],
};

const COVER_FOR_ME: Scenario = {
  id: 'scn_cover_for_me',
  mode: 'PEER_SHIELD',
  title: 'Cover For Me',
  category: 'Peer Pressure',
  hook: 'Saying yes makes their problem yours.',
  difficulty: 'Hard',
  estimatedMinutes: 2,
  primaryCompetency: 'LEAD',
  competencies: ['LEAD', 'DEFEND', 'EVALUATE'],
  bands: ['B14_16', 'B17_24'],
  prompt: 'A friend asks you to say the two of you were together when you were not.',
  messages: [
    {
      id: 'c1',
      author: 'system',
      body: 'Direct message · 11:40pm',
      meta: 'Something happened earlier that you were not part of',
    },
    { id: 'c2', author: 'them', displayName: 'Friend', body: 'If anyone asks, we were together ok.' },
    { id: 'c3', author: 'them', displayName: 'Friend', body: 'Please. I will owe you one.' },
    { id: 'c4', author: 'them', displayName: 'Friend', body: 'You are my only friend who can do this.' },
  ],
  clueQuestion: 'What is being asked of you?',
  clues: [
    {
      id: 'cc_account',
      label: 'A false account',
      note: 'You are being asked to state something untrue about where you were, which makes it your statement, not theirs.',
    },
    {
      id: 'cc_obligation',
      label: '"I will owe you one"',
      note: 'Framing it as a favour hides that the cost lands entirely on you.',
    },
    {
      id: 'cc_only',
      label: '"You are my only friend"',
      note: 'Being told you are the only person who can help is pressure, not closeness.',
    },
  ],
  choices: [
    {
      id: 'cch_cover',
      label: 'Cover for them',
      hint: 'They are your friend, and it is just a story',
      reply: 'Ok. We were together.',
      outcome: 'RISKY',
      immediate: {
        deltas: { coins: 130, trust: 8 },
        flashTitle: 'Your friend was relieved',
        flashAmount: '+130 Coins',
      },
      delayed: {
        delayTurns: 2,
        timeLabel: 'A week later',
        headline: 'Your account was the one that did not hold',
        body: 'Two people told the same story and the details did not match. What had been your friend situation became your statement, and undoing it was harder than never making it.',
        deltas: { coins: -130, trust: -20, risk: 22 },
        changedImmediate: ['+130 Coins', 'Your friend stopped panicking'],
        changedLater: ['You were part of it', 'Trust decreased', 'Risk increased'],
        warningSigns: [
          'You were asked to state something untrue',
          'The favour framing hid where the cost landed',
          'Late-night urgency and flattery',
        ],
        saferResponse:
          'You can support a friend without making a statement on their behalf. Helping them tell the truth to someone who can actually help is support; covering for them transfers the problem to you.',
        competency: 'EVALUATE',
      },
      debrief: {
        headline: 'You agreed',
        body: 'It felt like loyalty in the moment. The request was designed to feel that way, which is why it is worth recognising before you answer.',
        competency: 'EVALUATE',
      },
    },
    {
      id: 'cch_decline',
      label: 'Say no, stay their friend',
      hint: 'Refuse the lie without abandoning them',
      reply: "I'm not saying that. But I'm not going anywhere either — what actually happened?",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 55, resilience: 26, trust: 12 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+26 Resilience',
      },
      debrief: {
        headline: 'You separated the person from the request',
        body: 'Refusing the lie and staying present is the hardest version of this and the most useful one. Your friend still has someone to talk to, and you have not taken on something that was never yours.',
        spotted: ['Refused to make a false statement', 'Stayed available to them'],
        sampleScript: "I can't say that, sorry. But tell me what happened — I'll help you sort it.",
        competency: 'DEFEND',
        guardianId: 'shieldfin',
      },
    },
    {
      id: 'cch_route',
      label: 'Point to real help',
      hint: 'Get them to someone who can actually deal with it',
      reply: "This is bigger than me covering for you. Let's talk to someone who can actually help.",
      outcome: 'SAFE',
      immediate: {
        deltas: { coins: 50, resilience: 22, trust: 14 },
        flashTitle: 'Peer Shield success',
        flashAmount: '+22 Resilience',
      },
      debrief: {
        headline: 'You routed it correctly',
        body: 'A situation with a formal consequence attached needs an adult or an official channel, not a second version of events. Offering to go with them is what makes that suggestion something they might actually take.',
        spotted: ['Recognised it had gone past peer advice', 'Offered to go with them'],
        sampleScript: "I'll go with you. Telling it straight now is going to go better than the other way.",
        competency: 'LEAD',
        guardianId: 'beacon',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */

export const SCENARIOS: Scenario[] = [
  EASY_MONEY,
  JOB_SCAM,
  HOLD_IT,
  FRIEND_UNDER_PRESSURE,
  CHECKOUT_DARE,
  FAKE_LISTING,
  PEER_JAYDEN,
  COVER_FOR_ME,
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);
