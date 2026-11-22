import { presets, type Avatar } from './avatar'
export type ShopCategory = 'Seating' | 'Greenery' | 'Street life' | 'Outfits'
export type ShopItem = { id:string; name:string; category:ShopCategory; price:number; description:string; asset?:string; avatar?:Avatar }
export const shopCatalog:ShopItem[] = [
  {id:'park-bench',name:'Neighbourhood bench',category:'Seating',price:30,description:'A familiar spot to sit, chat and watch the estate go by.',asset:'bench'},
  {id:'kopi-table',name:'Kopitiam table',category:'Seating',price:45,description:'Good conversations start over a kopi.',asset:'kopitiam-table'},
  {id:'chess-table',name:'Chess corner',category:'Seating',price:60,description:'For friendly matches and a little healthy competition.',asset:'chess-table'},
  {id:'flower-planter',name:'Courtyard planter',category:'Greenery',price:20,description:'A little greenery for your growing furniture collection.',asset:'planter'},
  {id:'frangipani',name:'Frangipani tree',category:'Greenery',price:55,description:'Cream blossoms and a generous patch of shade.',asset:'frangipani'},
  {id:'rain-tree',name:'Rain tree',category:'Greenery',price:80,description:'A leafy Singapore favourite with a spreading canopy.',asset:'rain-tree'},
  {id:'garden',name:'Community garden',category:'Greenery',price:75,description:'A small garden with a big neighbourhood spirit.',asset:'garden'},
  {id:'street-lamp',name:'Estate lamp',category:'Street life',price:25,description:'A classic streetlight for your furniture collection.',asset:'lamp'},
  {id:'bicycle-rack',name:'Bicycle rack',category:'Street life',price:40,description:'A colourful corner for the everyday commute.',asset:'bikes'},
  {id:'recycling',name:'Recycling station',category:'Street life',price:35,description:'Keep the neighbourhood clean and green.',asset:'recycling-bins'},
  {id:'pavilion',name:'Garden pavilion',category:'Street life',price:90,description:'A sheltered meeting place for sunny afternoons.',asset:'pavilion'},
  ...presets.map((preset,i)=>({id:`outfit-${i}`,name:`${preset.name} look`,category:'Outfits' as const,price:45+i*5,description:'A complete curated outfit. Buy once, then wear it from your collection. Wardrobe customisation remains free.',avatar:preset.avatar})),
]
export type ShopInventory=Record<string,number>
export function readShopInventory(raw:unknown):ShopInventory {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {}
  const result:ShopInventory={}
  for(const item of shopCatalog){const value=(raw as Record<string,unknown>)[item.id];if(typeof value==='number'&&Number.isInteger(value)&&value>0&&value<=999)result[item.id]=item.avatar?1:value}
  return result
}
export function purchaseItem(coins:number,inventory:ShopInventory|undefined,id:string,quantity:number):{coins:number;shop:ShopInventory}|null {
  const item=shopCatalog.find(item=>item.id===id)
  if(!item||!Number.isSafeInteger(coins)||coins<0||!Number.isInteger(quantity)||quantity<1||quantity>20)return null
  const shop=readShopInventory(inventory),owned=shop[id]??0
  if(item.avatar&&(quantity!==1||owned))return null
  const cost=item.price*quantity
  if(cost>coins||owned+quantity>999)return null
  return {coins:coins-cost,shop:{...shop,[id]:owned+quantity}}
}
