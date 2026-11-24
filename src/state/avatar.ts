// Option indices are stored in saves and sent over multiplayer: only ever append options, never reorder.
export const categories = {
  skin: { label: 'Skin tone', hint: 'Choose a skin tone for your character.', options: [
    ['Porcelain', '#f9dbc2'], ['Honey', '#edbb8e'], ['Warm tan', '#cf9367'], ['Copper', '#ac6e4c'], ['Deep', '#764834'],
    ['Fair', '#f3caa6'], ['Caramel', '#bd8158'], ['Espresso', '#5b3626'],
  ] },
  style: { label: 'Hairstyle', hint: 'Pick a silhouette for your hair.', options: [
    ['Side swept', ''], ['Bob cut', ''], ['High bun', ''], ['Soft curls', ''],
    ['Short crop', ''], ['Ponytail', ''], ['Long straight', ''], ['Tudung', ''],
  ] },
  hair: { label: 'Hair colour', hint: 'Give your hairstyle a little colour. A tudung takes its colour from your top.', options: [
    ['Espresso', '#3a2928'], ['Chestnut', '#794b37'], ['Black', '#282a37'], ['Auburn', '#a75643'], ['Honey blond', '#d4a161'],
    ['Silver grey', '#a9a8b0'],
  ] },
  topStyle: { label: 'Top style', hint: 'Choose an everyday top.', options: [
    ['T-shirt', ''], ['Polo tee', ''], ['Blouse', ''], ['Singlet', ''], ['Long sleeves', ''],
  ] },
  top: { label: 'Top colour', hint: '', options: [
    ['Estate teal', '#359f93'], ['Sunflower', '#efbc5b'], ['Peach', '#ed947d'], ['Periwinkle', '#818bc5'], ['Fern green', '#7b9d66'],
    ['White', '#f1ede4'], ['Navy', '#35496f'], ['Chilli red', '#c9544a'],
  ] },
  bottomStyle: { label: 'Bottom style', hint: 'Pick something comfy for the weather.', options: [
    ['Casual pants', ''], ['Shorts', ''], ['Jeans', ''],
  ] },
  bottom: { label: 'Bottom colour', hint: '', options: [
    ['Indigo', '#3d546f'], ['Stone', '#aa8370'], ['Charcoal', '#484252'], ['Olive', '#626f53'],
    ['Denim', '#5576a1'], ['Khaki', '#c2a679'], ['Black', '#2c2b33'],
  ] },
  shoeStyle: { label: 'Shoe style', hint: 'Choose something comfy for the walk.', options: [
    ['Sneakers', ''], ['Slippers', ''], ['Sandals', ''],
  ] },
  shoes: { label: 'Shoe colour', hint: '', options: [
    ['Cream', '#fff0d6'], ['Brick', '#c45f4d'], ['Midnight', '#354252'], ['Mustard', '#d29e4e'],
  ] },
  glasses: { label: 'Glasses', hint: 'Add spectacles or shades.', options: [
    ['None', ''], ['Spectacles', ''], ['Round specs', ''], ['Sunglasses', ''],
  ] },
  accessory: { label: 'Accessories', hint: 'Add a finishing touch. Caps and hats sit over any hairstyle except the tudung.', options: [
    ['None', ''], ['Satchel', ''], ['Lanyard', ''], ['Hair clip', ''], ['Cap', ''], ['Bucket hat', ''],
  ] },
} as const

// Gender is read from the hairstyle (each hairstyle has its own base body), so saves and multiplayer need no new field.
export type Gender = 'boy' | 'girl'
export const genderStyles: Record<Gender, number[]> = { boy: [0, 4], girl: [1, 2, 3, 5, 6, 7] }
export const genderOf = (style: number): Gender => genderStyles.boy.includes(style) ? 'boy' : 'girl'

export type Category = keyof typeof categories
export type Avatar = Record<Category, number>
/** Which way a character faces on screen: 'front' looks at the player, 'back-right' walks up and to the right. */
export type Facing = 'front' | 'back' | 'left' | 'right' | 'front-left' | 'front-right' | 'back-left' | 'back-right'
export const categoryKeys = Object.keys(categories) as Category[]

/** Wardrobe tabs: a garment's shape and colour share one tab. */
export const groups: { label: string; keys: Category[] }[] = [
  { label: 'Skin tone', keys: ['skin'] },
  { label: 'Hairstyle', keys: ['style'] },
  { label: 'Hair colour', keys: ['hair'] },
  { label: 'Tops', keys: ['topStyle', 'top'] },
  { label: 'Bottoms', keys: ['bottomStyle', 'bottom'] },
  { label: 'Shoes', keys: ['shoeStyle', 'shoes'] },
  { label: 'Glasses', keys: ['glasses'] },
  { label: 'Accessories', keys: ['accessory'] },
]

/** The neutral base every new character starts from: plain tee, shorts and sneakers, ready to restyle. */
export const baseAvatar: Avatar = { skin: 1, style: 4, hair: 2, topStyle: 0, top: 5, bottomStyle: 1, bottom: 0, shoeStyle: 0, shoes: 1, glasses: 0, accessory: 0 }

// Everyday starting looks across Singapore's communities. They only pre-fill options; every option stays open to everyone.
export const presets: { name: string; avatar: Avatar }[] = [
  { name: 'Campus', avatar: { skin: 5, style: 1, hair: 0, topStyle: 2, top: 5, bottomStyle: 0, bottom: 1, shoeStyle: 0, shoes: 0, glasses: 2, accessory: 1 } },
  { name: 'Smart casual', avatar: { skin: 0, style: 0, hair: 2, topStyle: 1, top: 6, bottomStyle: 0, bottom: 5, shoeStyle: 0, shoes: 2, glasses: 1, accessory: 2 } },
  { name: 'Everyday', avatar: { skin: 2, style: 7, hair: 2, topStyle: 4, top: 4, bottomStyle: 0, bottom: 2, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 0 } },
  { name: 'Sporty', avatar: { skin: 6, style: 4, hair: 2, topStyle: 3, top: 7, bottomStyle: 1, bottom: 6, shoeStyle: 0, shoes: 0, glasses: 0, accessory: 4 } },
  { name: 'Market run', avatar: { skin: 3, style: 6, hair: 0, topStyle: 2, top: 1, bottomStyle: 0, bottom: 0, shoeStyle: 2, shoes: 3, glasses: 0, accessory: 1 } },
  { name: 'Weekend', avatar: { skin: 4, style: 3, hair: 2, topStyle: 0, top: 0, bottomStyle: 2, bottom: 4, shoeStyle: 1, shoes: 1, glasses: 3, accessory: 0 } },
]

export function randomAvatar(): Avatar {
  return Object.fromEntries(categoryKeys.map(key => [key, Math.floor(Math.random() * categories[key].options.length)])) as Avatar
}

export function sameAvatar(first: Avatar, second: Avatar) {
  return categoryKeys.every(key => first[key] === second[key])
}

// Avatars saved before the clothing-shape update lack these keys; 0 reproduces their old look.
const addedKeys: Partial<Avatar> = { topStyle: 0, bottomStyle: 0, shoeStyle: 0, glasses: 0 }
const LEGACY_GLASSES_ACCESSORY = 2

/** Validates an avatar from a save or the network and upgrades older avatars. Returns null if invalid. */
export function normalizeAvatar(raw: unknown): Avatar | null {
  if (!raw || typeof raw !== 'object') return null
  const input = raw as Record<string, unknown>
  const avatar = {} as Avatar
  for (const key of categoryKeys) {
    const value = input[key] ?? addedKeys[key]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value >= categories[key].options.length) return null
    avatar[key] = value
  }
  if (input.glasses === undefined && avatar.accessory === LEGACY_GLASSES_ACCESSORY) {
    avatar.glasses = 1
    avatar.accessory = 0
  }
  return avatar
}
