export const levelTitle = 'The Missing Evidence'

export const items = {
  bookmark: { name: 'Pressed-leaf bookmark', category: 'Physical Items', description: 'A pressed leaf from the original house preview.' },
  sketch: { name: 'Room sketch', category: 'Documents', description: 'A hand-drawn plan of the four rooms, saved from the original house preview.' },
  note: { name: 'Kitchen note', category: 'Documents', description: '“Put everything back where it belongs.” Saved from the original house preview.' },
  'letter-opening': { name: 'Letter fragment · Greeting', category: 'Physical Items', description: '“Dear detective, begin at the study bookshelf. First choose the symbol that grows on a branch.”' },
  'letter-middle': { name: 'Letter fragment · Instructions', category: 'Physical Items', description: '“Next choose the symbol that changes shape in the night sky. Last choose the symbol that opens locks. Read the spine numbers in that order.”' },
  'letter-end': { name: 'Letter fragment · Sign-off', category: 'Physical Items', description: '“One last detail for the safe later: the house on the living room painting has exactly two lit windows. Yours, the challenge host.”' },
  letter: { name: 'Reconstructed letter', category: 'Documents', description: 'At the study shelf, choose what grows on a branch, what changes shape in the night sky, and what opens locks. Read their spine numbers in that order. For later, remember the two lit windows in the living room painting.' },
  'cipher-rubbing': { name: 'Selected spine numbers', category: 'Evidence', description: 'Leaf: 3. Moon: 7. Key: 4. Read those numbers in the letter’s order to open the desk drawer.' },
  'incident-report': { name: 'Incident report', category: 'Documents', description: 'Training case SQ-01. A boxed compass was reported missing from its usual shelf. Its absence was confirmed. The report names no suspect and records no removal.' },
  'witness-note': { name: 'Witness note · 14:16', category: 'Documents', description: '14:16 — The witness told the clerk the compass shelf was empty. “I had seen a visitor by the entrance. They must have taken it,” the witness added. This last sentence is their interpretation.' },
  'partial-reference': { name: 'Partial evidence reference', category: 'Evidence', description: 'Case SQ-01 needs the receipt, clock observation, witness note, and transaction record. Put the events in time order at the study timeline to recover the full reference.' },
  'shop-receipt': { name: 'Shop receipt · 14:05', category: 'Documents', description: '14:05 — The register printed a receipt for a roll of display labels. The receipt lists labels only. It records no purchase of the compass.' },
  'clock-observation': { name: 'Clock observation · 14:11', category: 'Evidence', description: '14:11 — A training observer recorded a visitor with a canvas tote by the entrance. The observer did not see the visitor handle the compass.' },
  'transaction-record': { name: 'Transaction record · 14:22', category: 'Documents', description: '14:22 — The clerk retrieved a stock-transfer record authorising the boxed compass to move to the seasonal display. The clerk had yet to verify its location.' },
  'timeline-reference': { name: 'Evidence reference SQ-01', category: 'Evidence', description: 'Chronology verified. Review the sources on the evidence board. For later, retain the minute shown on the third event’s document.' },
  'safe-instructions': { name: 'Safe code worksheet', category: 'Documents', description: 'The worksheet lists the four digits in order. Open the Study Safe to see them above the keypad.' },
  'house-key': { name: 'House Exit Key', category: 'Physical Items', description: 'The supervised challenge key. Use it at the front door to finish the level.' },
  'final-evidence': { name: 'Final evidence file', category: 'Evidence', description: 'A stock check found the boxed compass on the seasonal display, as the authorised transfer recorded. The visitor’s presence by the entrance never established that they took it. Report what the sources show and name what remains uncertain.' },
} as const

export type ItemId = keyof typeof items
export const categories = ['Physical Items', 'Documents', 'Evidence'] as const

export const housePickups = {
  'house-coffee-table': 'letter-opening',
  'house-bookshelf': 'letter-middle',
  'house-painting': 'letter-end',
  'house-cabinet': 'shop-receipt',
  'house-clock': 'clock-observation',
  'house-files': 'transaction-record',
} as const satisfies Record<string, ItemId>

export type PickupId = keyof typeof housePickups
export const letterOrder = ['letter-opening', 'letter-middle', 'letter-end'] as const

const moonBook = { id: 'moon', label: 'Moon', digit: 7, symbol: '☾' } as const
export const books = [
  { id: 'shell', label: 'Shell', digit: 8, symbol: '◈' },
  { id: 'key', label: 'Key', digit: 4, symbol: '⚿' },
  { id: 'sun', label: 'Sun', digit: 5, symbol: '☀' },
  { id: 'leaf', label: 'Leaf', digit: 3, symbol: '❧' },
  moonBook,
] as const

export const bookOrder = ['leaf', 'moon', 'key'] as const
export const drawerCode = bookOrder.map(id => books.find(book => book.id === id)?.digit).join('')

export const timeline = [
  { id: 'receipt-printed', label: 'The register printed a receipt for display labels', source: 'shop-receipt', time: '14:05' },
  { id: 'visitor-observed', label: 'An observer saw a visitor by the entrance', source: 'clock-observation', time: '14:11' },
  { id: 'shelf-reported', label: 'A witness reported the empty shelf', source: 'witness-note', time: '14:16' },
  { id: 'record-retrieved', label: 'The clerk retrieved a stock-transfer record', source: 'transaction-record', time: '14:22' },
] as const satisfies readonly { id: string; label: string; source: ItemId; time: string }[]

export const evidenceBins = {
  observation: 'Verified observations',
  assumption: 'Unsupported assumptions',
  conclusion: 'Evidence-supported conclusions',
} as const

export const evidenceCards = [
  { id: 'theft', text: 'The visitor must have stolen the compass.', bin: 'assumption' },
  { id: 'authorised', text: 'A record authorises moving the compass to the seasonal display.', bin: 'observation' },
  { id: 'insufficient', text: 'These records do not establish that the visitor stole anything. The authorised move is a reason to check the display.', bin: 'conclusion' },
  { id: 'tote', text: 'An observer recorded a visitor with a tote near the entrance.', bin: 'observation' },
  { id: 'labels', text: 'Buying display labels proves the label buyer took the compass.', bin: 'assumption' },
] as const

export const safeDigits = [
  { clue: 'Lit windows in the painting', digit: 2 },
  { clue: 'Number on the Moon book', digit: moonBook.digit },
  { clue: `Last digit of the third event’s time (${timeline[2].time})`, digit: timeline[2].time.slice(-1) },
  { clue: 'Verified observations on the board', digit: evidenceCards.filter(card => card.bin === 'observation').length },
] as const
export const safeCode = safeDigits.map(({ digit }) => digit).join('')

export const puzzleIds = ['letter', 'cipher', 'timeline', 'board', 'study-safe'] as const
export type PuzzleId = typeof puzzleIds[number]

export const puzzles = {
  letter: {
    title: 'The Torn Letter', required: letterOrder,
    hints: ['Search the living room furniture and wall art.', 'Look for the greeting, the unfinished instructions, and the host’s sign-off.', 'Start with “Dear detective”, follow with “Next choose”, and end with “One last detail” and the signature.'],
  },
  cipher: {
    title: 'The Bookshelf Cipher', required: ['letter'],
    hints: ['Read the reconstructed letter in your inventory.', 'Match each description to a symbol on a spine. A changing shape at night points to the Moon.', 'Choose Leaf, then Moon, then Key. Read those spine digits left to right for the drawer.'],
  },
  timeline: {
    title: 'The Incident Timeline', required: ['partial-reference', 'shop-receipt', 'clock-observation', 'witness-note', 'transaction-record'],
    hints: ['Check the study drawer, filing cabinet, kitchen cabinet, and wall clock.', 'Match each event to the time its source actually records. Use the time the clerk retrieved the record, rather than the time a stock move might have happened.', 'Order the receipt printout, visitor observation, empty-shelf report, and stock-record retrieval from earliest to latest.'],
  },
  board: {
    title: 'The Evidence Board', required: ['timeline-reference'],
    hints: ['Read the three sections on the board.', 'The records give you two verified observations.', 'Select Finish Evidence Review to get the safe code worksheet.'],
  },
  'study-safe': {
    title: 'The Final Safe', required: ['safe-instructions'],
    hints: ['Read the safe code worksheet and reopen the earlier puzzle rewards.', 'The four digits come from the painting detail in the letter, one spine, one minute digit, and a count of observation cards.', 'Use two lit windows, the Moon’s spine number, the ones digit of the witness note’s minute, and the two verified observations.'],
  },
} as const satisfies Record<PuzzleId, { title: string; required: readonly ItemId[]; hints: readonly [string, string, string] }>
