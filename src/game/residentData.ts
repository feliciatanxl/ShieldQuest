import type { Avatar } from '../state/avatar'
import type { ResidentId } from './events'

// Walking residents in the mini-games use the PixelLab base bodies, dressed to match each resident's sprite in the estate.
export const residents: Record<ResidentId, Avatar> = {
  may: { skin: 5, style: 1, hair: 0, topStyle: 2, top: 2, bottomStyle: 0, bottom: 5, shoeStyle: 2, shoes: 1, glasses: 2, accessory: 0 },
  amir: { skin: 2, style: 0, hair: 2, topStyle: 1, top: 6, bottomStyle: 2, bottom: 4, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 0 },
  jun: { skin: 5, style: 0, hair: 2, topStyle: 0, top: 5, bottomStyle: 1, bottom: 0, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 1 },
  cashier: { skin: 3, style: 5, hair: 2, topStyle: 0, top: 4, bottomStyle: 0, bottom: 2, shoeStyle: 0, shoes: 1, glasses: 0, accessory: 2 },
}

export const isResident = (id: string): id is ResidentId => Object.hasOwn(residents, id)
