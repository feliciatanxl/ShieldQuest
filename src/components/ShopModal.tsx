import { useEffect, useState } from 'react'
import { ArrowRight, Armchair, Check, ChevronLeft, ChevronRight, Coins, Package, Search, Shirt, ShoppingBag, Sparkles } from 'lucide-react'
import type { Save } from '../state/saveGame'
import { sameAvatar } from '../state/avatar'
import { shopCatalog, type ShopCategory, type ShopItem } from '../state/shop'
import { AvatarSprite } from './AvatarSprite'
import { Button, Modal } from './ui'

const assets=import.meta.glob('../game/assets/pixellab/objects/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>
const tabs=['Front page','Furniture','Clothing','Your collection'] as const
type Tab=typeof tabs[number]
const categories:ShopCategory[]=['Seating','Greenery','Street life']
function ProductArt({item,large=false,turn=0}:{item:ShopItem;large?:boolean;turn?:number}){
  return item.avatar ? <AvatarSprite avatar={item.avatar} facing={(['front','right','back','left'] as const)[turn]} className={large?'shop-avatar large':'shop-avatar'} />
    : <img src={assets[`../game/assets/pixellab/objects/${item.asset}.png`]} alt="" className={large?'shop-object large':'shop-object'} style={{transform:turn%2?'scaleX(-1)':undefined}} />
}
export function ShopModal({save,onClose,onBuy,onWear}:{save:Save;onClose:()=>void;onBuy:(id:string,quantity:number)=>{ok:boolean;message:string};onWear:(id:string)=>void}){
  const [tab,setTab]=useState<Tab>('Front page'),[category,setCategory]=useState<ShopCategory|null>(null),[query,setQuery]=useState('')
  const [selected,setSelected]=useState(shopCatalog[0].id),[quantity,setQuantity]=useState(1),[turn,setTurn]=useState(0),[feedback,setFeedback]=useState('')
  const inventory=save.shop??{},item=shopCatalog.find(p=>p.id===selected)!,owned=inventory[item.id]??0
  const wearing=!!item.avatar&&sameAvatar(save.avatar,item.avatar)
  const items=shopCatalog.filter(p=>(tab==='Your collection' ? !!inventory[p.id] : tab==='Clothing'?!!p.avatar:!p.avatar)&&(!category||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase()))
  function pick(p:ShopItem){setSelected(p.id);setQuantity(1);setTurn(0);setFeedback('')}
  function navigate(next:Tab){setTab(next);setCategory(null);setQuery('');setFeedback('');setQuantity(1);const first=shopCatalog.find(p=>next==='Your collection'?!!inventory[p.id]:next==='Clothing'?!!p.avatar:!p.avatar);if(first)pick(first)}
  useEffect(() => {
    if(items.length&&!items.some(p=>p.id===selected))pick(items[0])
  }, [tab,category,query])
  const cost=item.price*quantity,affordable=save.coins>=cost
  function buy(){const result=onBuy(item.id,quantity);setFeedback(result.ok?`${quantity} × ${item.name}. ${result.message}`:result.message)}
  return <Modal title="Sunshine Shop" eyebrow="SPEND YOUR IN-GAME COINS" className="shop-modal" onClose={onClose}>
    <div className="shop-toolbar"><span><ShoppingBag size={16}/> A little something for your estate life.</span><span className="shop-balance"><Coins size={18}/><strong>{save.coins}</strong><small>coins</small></span></div>
    <nav className="shop-tabs" aria-label="Shop sections">{tabs.map(t=><button key={t} type="button" aria-pressed={tab===t} onClick={()=>navigate(t)}>{t==='Front page'?<Sparkles size={15}/>:t==='Furniture'?<Armchair size={15}/>:t==='Clothing'?<Shirt size={15}/>:<Package size={15}/>} {t}</button>)}</nav>
    {tab==='Front page'?<div className="shop-front">
      <button className="shop-feature" onClick={()=>navigate('Furniture')}><span className="shop-promo-label">THE SUNSHINE COLLECTION</span><div className="shop-feature-art"><ProductArt item={shopCatalog[0]} large/><ProductArt item={shopCatalog[3]} large/></div><span className="shop-feature-copy"><strong>Make yourself<br/>at home.</strong><span>Little finds. Big neighbourhood energy.</span><b>Browse furniture <ArrowRight size={16}/></b></span></button>
      <div className="shop-front-stack"><button className="shop-banner clothes" onClick={()=>navigate('Clothing')}><div><small>EVERYDAY STYLE</small><strong>Your next favourite look.</strong><span>Shop curated outfits <ArrowRight size={15}/></span></div><ProductArt item={shopCatalog.find(p=>p.avatar)!} large/></button>
      <button className="shop-banner greenery" onClick={()=>{navigate('Furniture');setCategory('Greenery');pick(shopCatalog[3])}}><div><small>A LITTLE MORE GREEN</small><strong>Room for something leafy.</strong><span>Discover greenery <ArrowRight size={15}/></span></div><ProductArt item={shopCatalog[4]} large/></button>
      <button className="shop-banner collection" onClick={()=>navigate('Your collection')}><div><small>YOUR FINDS, ALL TOGETHER</small><strong>The collection is yours.</strong><span>{Object.values(inventory).reduce((a,b)=>a+b,0)} items collected <ArrowRight size={15}/></span></div><Package size={54}/></button></div>
      <p className="shop-front-note"><Coins size={15}/> Purchases use game coins only. No real-money payments.</p>
    </div>:<>
      <div className="shop-catalogue">
        <aside className="shop-sidebar"><label className="shop-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search items…" aria-label="Search shop items"/></label><h3>{tab==='Your collection'?'YOUR COLLECTION':'BROWSE CATEGORIES'}</h3><button className={!category?'active':''} onClick={()=>setCategory(null)}>All {tab==='Clothing'?'outfits':'items'}<span>{tab==='Your collection'?Object.keys(inventory).length:tab==='Clothing'?shopCatalog.filter(p=>p.avatar).length:shopCatalog.filter(p=>!p.avatar).length}</span></button>{(tab==='Clothing'?[]:tab==='Your collection'?[...categories,'Outfits' as const]:categories).map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}<ChevronRight size={14}/></button>)}<p>{tab==='Clothing'?'Curated looks, ready to wear. Your wardrobe editor is always free.':'Furniture purchases are saved in this collection. Room placement is not available yet.'}</p></aside>
        <section className="shop-products" aria-label="Products"><div className="shop-products-heading"><strong>{category??tab}</strong><span>{items.length} {items.length===1?'item':'items'}</span></div><div className="shop-grid">{items.map(p=><button className={'shop-product '+(p.id===selected?'selected':'')} key={p.id} aria-pressed={p.id===selected} aria-label={`View ${p.name}`} onClick={()=>pick(p)}><span className="shop-product-art"><ProductArt item={p}/>{inventory[p.id]?<span className="shop-owned"><Check size={10}/>{inventory[p.id]}</span>:null}</span><strong>{p.name}</strong><span className="shop-price"><Coins size={12}/>{p.price}</span></button>)}</div>{!items.length&&<div className="shop-empty"><Package size={34}/><strong>{tab==='Your collection'&&!Object.keys(inventory).length?'Your collection starts here.':'No items found.'}</strong><p>{tab==='Your collection'?'Browse the shop to find your first item.':'Try another category or search.'}</p>{tab==='Your collection'&&<Button onClick={()=>navigate('Furniture')}>Browse furniture</Button>}</div>}</section>
        {items.length>0&&(tab!=='Your collection'||Object.keys(inventory).length>0)&&<section className="shop-detail" aria-label="Item preview"><div className="shop-preview"><span className="shop-preview-caption">ITEM PREVIEW</span><ProductArt item={item} large turn={turn}/><div className="shop-turn"><button aria-label="Previous preview view" onClick={()=>setTurn((turn+3)%4)}><ChevronLeft size={15}/></button><button aria-label="Next preview view" onClick={()=>setTurn((turn+1)%4)}><ChevronRight size={15}/></button></div></div><span className="shop-detail-category">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><div className="shop-detail-bottom"><span className="shop-owned-line">{owned?`${owned} in your collection`:'Not collected yet'}</span>{tab==='Your collection'?item.avatar?<Button className="primary" disabled={wearing} onClick={()=>{onWear(item.id);setFeedback(`${item.name} equipped.`)}}><Shirt size={16}/>{wearing?'Wearing this look':'Wear this look'}</Button>:<p className="shop-collected-note"><Check size={15}/> Saved to your furniture collection.</p>:item.avatar&&owned?<Button className="primary" disabled={wearing} onClick={()=>{onWear(item.id);setFeedback(`${item.name} equipped.`)}}><Shirt size={16}/>{wearing?'Wearing this look':'Wear this look'}</Button>:<><div className="shop-quantity"><label htmlFor="shop-amount">Quantity</label><input id="shop-amount" type="number" min={1} max={item.avatar?1:20} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(item.avatar?1:20,Math.trunc(Number(e.target.value))||1)))}/><span><Coins size={15}/><strong>{cost}</strong></span></div><Button className="primary shop-buy" disabled={!affordable} onClick={buy}><ShoppingBag size={16}/>{affordable?'Buy item':'Not enough coins'}</Button>{!affordable&&<small className="shop-shortfall">You need {cost-save.coins} more coins.</small>}</>}</div></section>}
      </div>
      <p className="shop-feedback" role="status" aria-live="polite">{feedback||'Choose an item to see its details.'}</p>
    </>}
  </Modal>
}
