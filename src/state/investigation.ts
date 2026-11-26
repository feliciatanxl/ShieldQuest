export const clues = {
  shelf: { title: 'Product shelf', observed: 'A gap is visible in a row of identical snack packets.', unknown: 'Who moved a packet, or when the space appeared.', assumption: 'A gap means someone took a packet without paying.' },
  item: { title: 'Unattended item', observed: 'A sealed snack packet is sitting on a small display table.', unknown: 'Who put it there or whether it has been paid for.', assumption: 'The packet belongs to the person standing nearest to it.' },
  bag: { title: 'Shopping bag', observed: 'A tote bag is resting next to the display table.', unknown: 'Who owns the bag or what is inside it.', assumption: 'The bag was placed there to hide something.' },
  counter: { title: 'Checkout counter', observed: 'The cashier is working at a counter with a register and a receipt tray.', unknown: 'Which items have been paid for.', assumption: 'Every transaction would be visible from the aisle.' },
  entrance: { title: 'Shop entrance', observed: 'The entrance is open and has a green welcome mat.', unknown: 'Who has recently entered or left.', assumption: 'A request to watch the door means a theft is planned.' },
} as const

export type ClueId = keyof typeof clues
export const clueIds = Object.keys(clues) as ClueId[]
export const isClue = (id: string): id is ClueId => Object.hasOwn(clues, id)

export const responses = {
  agree: { label: 'Agree to help', consequence: '“Thanks. I’ll be right back.” You stay by the door, still unsure what Jun wanted you to look out for.' },
  decline: { label: 'Decline politely', consequence: '“No worries,” Jun says. You step aside, and Jun goes to ask the cashier for help.' },
  accuse: { label: 'Accuse Jun publicly', consequence: 'Jun steps away as shoppers turn to look. The cashier asks everyone to give Jun some space. The accusation leaves Jun upset, and what happened is still unclear.' },
} as const

export type JunChoice = keyof typeof responses
export const choiceIds = Object.keys(responses) as JunChoice[]

export type Investigation = {
  entered: boolean
  walked: number
  clues: ClueId[]
  spokeToJun: boolean
  choice: JunChoice | null
}

export const EXPLORE_GOAL = 1.5
export const newInvestigation = (): Investigation => ({
  entered: false, walked: 0, clues: [], spokeToJun: false, choice: null,
})

export function validInvestigation(value: unknown): value is Investigation {
  if (!value || typeof value !== 'object') return false
  const { entered, walked, clues: found, spokeToJun, choice } = value as Partial<Investigation>
  return typeof entered === 'boolean' && typeof spokeToJun === 'boolean' &&
    typeof walked === 'number' && Number.isFinite(walked) && walked >= 0 && walked <= EXPLORE_GOAL &&
    Array.isArray(found) && found.every(id => typeof id === 'string' && isClue(id)) &&
    new Set(found).size === found.length &&
    (choice === null || (typeof choice === 'string' && Object.hasOwn(responses, choice)))
}
