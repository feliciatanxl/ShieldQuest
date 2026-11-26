import { presets, type Avatar } from '../state/avatar'
import type { ResidentId } from './events'

export const residents: Record<ResidentId, Avatar> = {
  may: { ...presets[1].avatar, style: 2, top: 3, accessory: 2 },
  amir: { ...presets[0].avatar, skin: 3, style: 3, top: 1, accessory: 0 },
  jun: { ...presets[0].avatar, top: 3, shoes: 1, style: 3, accessory: 0 },
  cashier: { ...presets[2].avatar, skin: 4, top: 0, accessory: 0 },
}

export const uncle = { ...presets[2].avatar, style: 1, top: 3, accessory: 0 }

export const isResident = (id: string): id is ResidentId => Object.hasOwn(residents, id)
