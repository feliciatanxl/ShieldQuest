export const categories = {
  skin: { label: 'Skin tone', hint: 'Choose a skin tone for your character.', options: [
    ['Porcelain', '#f9dbc2'], ['Honey', '#edbb8e'], ['Warm tan', '#cf9367'], ['Copper', '#ac6e4c'], ['Deep', '#764834'],
  ] },
  style: { label: 'Hairstyle', hint: 'Pick a silhouette for your hair.', options: [
    ['Side swept', ''], ['Bob cut', ''], ['High bun', ''], ['Soft curls', ''],
  ] },
  hair: { label: 'Hair colour', hint: 'Give your hairstyle a little colour.', options: [
    ['Espresso', '#3a2928'], ['Chestnut', '#794b37'], ['Black', '#282a37'], ['Auburn', '#a75643'], ['Honey blond', '#d4a161'],
  ] },
  top: { label: 'Tops', hint: 'Choose an everyday top.', options: [
    ['Estate teal', '#359f93'], ['Sunflower', '#efbc5b'], ['Peach', '#ed947d'], ['Periwinkle', '#818bc5'], ['Fern green', '#7b9d66'],
  ] },
  bottom: { label: 'Bottoms', hint: 'Pick a colour for your trousers.', options: [
    ['Indigo', '#3d546f'], ['Stone', '#aa8370'], ['Charcoal', '#484252'], ['Olive', '#626f53'],
  ] },
  shoes: { label: 'Shoes', hint: 'Choose something comfy for the walk.', options: [
    ['Cream', '#fff0d6'], ['Brick', '#c45f4d'], ['Midnight', '#354252'], ['Mustard', '#d29e4e'],
  ] },
  accessory: { label: 'Accessories', hint: 'Add a little finishing touch.', options: [
    ['None', ''], ['Satchel', ''], ['Glasses', ''], ['Hair clip', ''],
  ] },
} as const

export type Category = keyof typeof categories
export type Avatar = Record<Category, number>
export type Facing = 'front' | 'back' | 'left' | 'right'
export const categoryKeys = Object.keys(categories) as Category[]
export const presets: { name: string; avatar: Avatar }[] = [
  { name: 'Everyday Teal', avatar: { skin: 1, style: 0, hair: 0, top: 0, bottom: 0, shoes: 0, accessory: 1 } },
  { name: 'Sunny Weekend', avatar: { skin: 2, style: 2, hair: 2, top: 1, bottom: 1, shoes: 1, accessory: 2 } },
  { name: 'Peach Street', avatar: { skin: 0, style: 1, hair: 1, top: 2, bottom: 2, shoes: 0, accessory: 3 } },
]

export function randomAvatar(): Avatar {
  return Object.fromEntries(categoryKeys.map(key => [key, Math.floor(Math.random() * categories[key].options.length)])) as Avatar
}

export function sameAvatar(first: Avatar, second: Avatar) {
  return categoryKeys.every(key => first[key] === second[key])
}
