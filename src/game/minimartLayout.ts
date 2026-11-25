export const shelfRows = [
  { x: 1.49, y: 2.10, w: 2.36, d: .65 },
  { x: 1.49, y: 4.05, w: 2.36, d: .65 },
  { x: 5.76, y: 2.13, w: 2.21, d: .65 },
]
export const fridge = { x: .65, y: .22, w: 3.42, d: .65 }
export const checkout = { x: 7.50, y: 5.02, w: 2.09, d: .78 }
export const display = { x: 5.38, y: 4.38, w: .90, d: .72 }
export const bag = { x: 4.91, y: 4.77, w: .35, d: .30 }
export const plants = [
  { x: .45, y: 6.60, w: .57, d: .58 },
  { x: 9.29, y: 7.09, w: .57, d: .58 },
]

// Set dressing (no hotspots): fruit stand by the left wall, ice-cream freezer by the sign, a stack of baskets by the door.
export const fruitStand = { x: .35, y: 3.1, w: .8, d: 1.5 }
export const iceFreezer = { x: 8.6, y: .9, w: 1.2, d: .6 }
export const baskets = { x: 6.1, y: 6.75, w: .42, d: .36 }

export const shopFixtures = [...shelfRows, fridge, checkout, display, bag, ...plants, fruitStand, iceFreezer, baskets]
