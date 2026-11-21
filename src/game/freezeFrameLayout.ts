import type { Hotspot } from './events'

export const freezeFrameObjects: Hotspot[] = [
  { id: 'exit-freeze-frame', at: { x: 8.53, y: 7.66 }, radius: 0.85, label: 'Leave Simulation (Return to House H)' },
  { id: 'ff-jun', at: { x: 4.83, y: 3.31 }, radius: 1.05, label: 'Talk to Jun (Hold / Clarify / Act)' },
  { id: 'ff-cashier', at: { x: 8.77, y: 4.32 }, radius: 1.05, label: 'Ask Cashier Mr. Tan' },
  { id: 'ff-backpack', at: { x: 2.76, y: 3.02 }, radius: 0.88, label: 'Inspect Jun’s Backpack' },
  { id: 'ff-cctv', at: { x: 8.43, y: 6.13 }, radius: 0.88, label: 'Inspect CCTV Camera Screen' },
  { id: 'ff-counter', at: { x: 7.8, y: 5.2 }, radius: 0.88, label: 'Inspect Store Rules Sign' },
  { id: 'ff-basket', at: { x: 4.67, y: 5.0 }, radius: 0.88, label: 'Inspect Store Shopping Basket' },
  { id: 'ff-door', at: { x: 7.04, y: 7.18 }, radius: 0.88, label: 'Inspect Entrance Glass Door' },
]
