import type { Avatar } from '../state/avatar'
import type { ResidentId } from './events'

// Portrait avatars (friends list, dialogue) styled to match each resident's PixelLab sprite in the world.
export const residents: Record<ResidentId, Avatar> = {
  may: { skin: 5, style: 3, hair: 2, topStyle: 2, top: 2, bottomStyle: 0, bottom: 5, shoeStyle: 2, shoes: 0, glasses: 2, accessory: 0 },
  amir: { skin: 2, style: 4, hair: 2, topStyle: 1, top: 6, bottomStyle: 2, bottom: 4, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 0 },
  jun: { skin: 5, style: 4, hair: 2, topStyle: 0, top: 5, bottomStyle: 1, bottom: 6, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 1 },
  cashier: { skin: 3, style: 5, hair: 2, topStyle: 0, top: 1, bottomStyle: 0, bottom: 2, shoeStyle: 1, shoes: 2, glasses: 0, accessory: 0 },
}

export const isResident = (id: string): id is ResidentId => Object.hasOwn(residents, id)
