import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  ArrowLeft, Briefcase, Check, Footprints, Glasses, HardHat, Pause, Pencil, Play, RotateCcw, RotateCw, Save, Scissors, Shirt,
  Shuffle, Smile, Trash2, Undo2, UserRound, Users, Wand2, X,
} from 'lucide-react'
import { baseAvatar, categories, genderOf, genderStyles, presets, randomAvatar, sameAvatar, type Avatar, type Category, type Facing } from '../state/avatar'
import { OUTFIT_NAME_LENGTH, outfitName, readOutfits, writeOutfits, type Outfit } from '../state/outfits'
import { WALK_FRAMES } from '../game/playerArt'
import { AvatarSprite } from './AvatarSprite'
import { readName } from '../multiplayer/protocol'
import { Button } from './ui'

type Focus = 'head' | 'torso' | 'legs' | 'feet' | 'full'
/** One sidebar entry: a garment shape (style) and/or its colour, both real options the gameplay sprite draws. */
type Part = { label: string; icon: ReactNode; style?: Category; colour?: Category; only?: number[]; gender?: boolean; focus: Focus; note?: string }
type Section = { label: string; icon: ReactNode; parts: Part[] }

const Trousers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 3h12l1 18h-5l-2-11-2 11H5z" /><path d="M6 7h12" />
</svg>
// Accessories share one slot in the save, so both places that offer them say so.
const ONE_ACCESSORY = 'One accessory at a time: picking one here replaces any bag, lanyard, clip or hat you wear.'
const sections: Section[] = [
  { label: 'Face & Body', icon: <Smile size={17} />, parts: [
    { label: 'Gender', icon: <Users size={20} />, gender: true, focus: 'full', note: 'Choose a boy or girl. Hairstyles under Head match your choice.' },
    { label: 'Skin tone', icon: <Smile size={20} />, colour: 'skin', focus: 'head',
      note: 'Choose a skin tone for your character.' },
  ] },
  { label: 'Head', icon: <UserRound size={17} />, parts: [
    { label: 'Hair', icon: <Scissors size={20} />, style: 'style', colour: 'hair', focus: 'head' },
    { label: 'Glasses', icon: <Glasses size={20} />, style: 'glasses', focus: 'head' },
    { label: 'Headwear', icon: <HardHat size={20} />, style: 'accessory', only: [0, 3, 4, 5], focus: 'head', note: ONE_ACCESSORY },
  ] },
  { label: 'Torso', icon: <Shirt size={17} />, parts: [
    { label: 'Tops', icon: <Shirt size={20} />, style: 'topStyle', colour: 'top', focus: 'torso' },
  ] },
  { label: 'Legs', icon: <Trousers />, parts: [
    { label: 'Bottoms', icon: <Trousers />, style: 'bottomStyle', colour: 'bottom', focus: 'legs' },
    { label: 'Shoes', icon: <Footprints size={20} />, style: 'shoeStyle', colour: 'shoes', focus: 'feet' },
  ] },
  { label: 'Misc', icon: <Briefcase size={17} />, parts: [
    { label: 'Bags & lanyards', icon: <Briefcase size={20} />, style: 'accessory', only: [0, 1, 2], focus: 'full', note: ONE_ACCESSORY },
  ] },
]
const WARDROBE = sections.length
const tabs = [...sections.map(s => ({ label: s.label, icon: s.icon })), { label: 'Wardrobe', icon: <Wand2 size={17} /> }]
// Turning order, so the arrows rotate the figure the way a player would expect.
const turning: Facing[] = ['front', 'front-right', 'right', 'back-right', 'back', 'back-left', 'left', 'front-left']
const starters = [{ name: 'Base', avatar: baseAvatar }, ...presets]

function Thumb({ avatar, focus }: { avatar: Avatar; focus: Focus }) {
  return <span className={'looks-thumb focus-' + focus}><AvatarSprite avatar={avatar} /></span>
}

/** Arrow keys move along a row of buttons (tabs, sidebar), as the ARIA tab pattern expects. */
function roving(event: KeyboardEvent<HTMLElement>, count: number, current: number, pick: (index: number) => void, vertical = false) {
  const step = { [vertical ? 'ArrowDown' : 'ArrowRight']: 1, [vertical ? 'ArrowUp' : 'ArrowLeft']: -1 }[event.key]
  const next = step ? (current + step + count) % count : event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : -1
  if (next < 0) return
  event.preventDefault()
  pick(next)
  const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button')
  buttons[next]?.focus()
}

function Items({ part, avatar, onPick }: { part: Part; avatar: Avatar; onPick: (category: Category, index: number) => void }) {
  if (part.gender) return <div className="looks-items" role="group" aria-label="Gender">
    {(['boy', 'girl'] as const).map(gender => {
      const current = genderOf(avatar.style) === gender
      const style = current ? avatar.style : genderStyles[gender][0]
      return <button key={gender} type="button" className="looks-item" title={gender === 'boy' ? 'Boy' : 'Girl'} aria-label={gender === 'boy' ? 'Boy' : 'Girl'}
        aria-pressed={current} onClick={() => onPick('style', style)}>
        <Thumb avatar={{ ...avatar, style }} focus="full" />
      </button>
    })}
  </div>
  // Colour-only parts (skin) still show real sprite thumbnails, one per colour.
  const style = part.style ?? part.colour
  if (!style) return <div className="looks-empty"><Smile size={30} aria-hidden="true" /><p>{part.note}</p></div>
  const options = categories[style].options.map((option, index) => ({ name: option[0], index }))
    .filter(({ index }) => !part.only || part.only.includes(index))
    .filter(({ index }) => style !== 'style' || genderOf(index) === genderOf(avatar.style))
  return <div className="looks-items" role="group" aria-label={categories[style].label}>
    {options.map(({ name, index }) => {
      const none = name === 'None'
      return <button key={name} type="button" className="looks-item" title={name} aria-label={name} aria-pressed={avatar[style] === index}
        onClick={() => onPick(style, index)}>
        {none ? <X className="looks-none" size={34} aria-hidden="true" /> : <Thumb avatar={{ ...avatar, [style]: index }} focus={part.focus} />}
      </button>
    })}
  </div>
}

function Palette({ category, avatar, onPick }: { category: Category; avatar: Avatar; onPick: (category: Category, index: number) => void }) {
  return <div className="looks-palette" role="group" aria-label={categories[category].label}>
    {categories[category].options.map(([name, colour], index) => <button key={name} type="button" title={name} aria-label={name}
      aria-pressed={avatar[category] === index} style={{ background: colour }} onClick={() => onPick(category, index)}>
      {avatar[category] === index && <Check size={17} aria-hidden="true" />}
    </button>)}
  </div>
}

function Wardrobe({ avatar, onWear }: { avatar: Avatar; onWear: (avatar: Avatar) => void }) {
  const [outfits, setOutfits] = useState(readOutfits)
  const [renaming, setRenaming] = useState<{ slot: number; text: string } | null>(null)
  const [pending, setPending] = useState<{ slot: number; action: 'delete' | 'replace' } | null>(null)
  const [stored, setStored] = useState(true)
  const update = (slot: number, outfit: Outfit | null) => {
    const next = outfits.map((current, i) => i === slot ? outfit : current)
    setOutfits(next)
    setStored(writeOutfits(next))
    setPending(null)
  }
  const finishRename = () => {
    const outfit = renaming && outfits[renaming.slot]
    if (outfit) update(renaming.slot, { ...outfit, name: outfitName(renaming.text) || outfit.name })
    setRenaming(null)
  }

  return <div className="looks-wardrobe">
    <section aria-labelledby="outfits-title">
      <h3 id="outfits-title">Your outfits</h3>
      <p>Save the look you are wearing to a slot, then wear it again whenever you like. Outfits stay in this browser.</p>
      {!stored && <p className="looks-warning" role="status">Browser storage is unavailable, so outfits will last only until you close this page.</p>}
      <ul className="looks-slots">
        {outfits.map((outfit, slot) => <li key={slot} className={'looks-slot ' + (outfit ? 'saved' : 'empty')}>
          {!outfit ? <>
            <span className="looks-slot-figure" aria-hidden="true" />
            <span className="looks-slot-name">Empty slot</span>
            <button type="button" className="looks-slot-save" onClick={() => update(slot, { name: `Outfit ${slot + 1}`, avatar })}>
              <Save size={15} aria-hidden="true" /> Save current look
            </button>
          </> : <>
            <button type="button" className="looks-slot-wear" aria-pressed={sameAvatar(avatar, outfit.avatar)}
              aria-label={`Wear ${outfit.name}`} title={`Wear ${outfit.name}`} onClick={() => onWear(outfit.avatar)}>
              <Thumb avatar={outfit.avatar} focus="full" />
            </button>
            {renaming?.slot === slot
              ? <input className="looks-slot-input" autoFocus value={renaming.text} maxLength={OUTFIT_NAME_LENGTH} aria-label="Outfit name"
                onChange={event => setRenaming({ slot, text: event.target.value })} onBlur={finishRename}
                onKeyDown={event => { if (event.key === 'Enter') finishRename(); if (event.key === 'Escape') setRenaming(null) }} />
              : <span className="looks-slot-name">{outfit.name}</span>}
            {pending?.slot === slot
              ? <div className="looks-slot-confirm" role="group" aria-label={pending.action === 'delete' ? `Delete ${outfit.name}?` : `Replace ${outfit.name}?`}>
                <span>{pending.action === 'delete' ? 'Delete?' : 'Replace?'}</span>
                <button type="button" onClick={() => update(slot, pending.action === 'delete' ? null : { ...outfit, avatar })}>Yes</button>
                <button type="button" onClick={() => setPending(null)}>No</button>
              </div>
              : <div className="looks-slot-actions">
                <button type="button" title="Replace with the current look" aria-label={`Replace ${outfit.name} with the current look`}
                  disabled={sameAvatar(avatar, outfit.avatar)} onClick={() => setPending({ slot, action: 'replace' })}><Save size={15} /></button>
                <button type="button" title="Rename" aria-label={`Rename ${outfit.name}`} onClick={() => setRenaming({ slot, text: outfit.name })}><Pencil size={15} /></button>
                <button type="button" title="Delete" aria-label={`Delete ${outfit.name}`} onClick={() => setPending({ slot, action: 'delete' })}><Trash2 size={15} /></button>
              </div>}
          </>}
        </li>)}
      </ul>
    </section>
    <section aria-labelledby="starters-title">
      <h3 id="starters-title">Starter looks</h3>
      <p>Everyday looks from around the estate. Every option stays open to everyone.</p>
      <div className="looks-starters">
        {starters.map(starter => <button key={starter.name} type="button" className="looks-starter" aria-pressed={sameAvatar(avatar, starter.avatar)}
          onClick={() => onWear(starter.avatar)}>
          <Thumb avatar={starter.avatar} focus="full" /><span>{starter.name}</span>
        </button>)}
      </div>
    </section>
  </div>
}

export function CharacterCustomizer({ initial, initialName = '', wardrobe = false, onBack, onConfirm }: {
  initial: Avatar; initialName?: string; wardrobe?: boolean; onBack: () => void; onConfirm: (avatar: Avatar, name: string) => void
}) {
  // Everything here is a draft: the save only changes when the player presses Save.
  const [avatar, setAvatar] = useState(initial)
  const [name, setName] = useState(initialName)
  const [touched, setTouched] = useState(false)
  const validName = readName(name)
  const nameId = useId()
  const [tab, setTab] = useState(0)
  const [parts, setParts] = useState(() => sections.map(() => 0))
  const [facing, setFacing] = useState<Facing>('front')
  const [walking, setWalking] = useState(false)
  const [frame, setFrame] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!walking) { setFrame(0); return }
    timer.current = window.setInterval(() => setFrame(current => current % WALK_FRAMES + 1), 120)
    return () => window.clearInterval(timer.current)
  }, [walking])

  const pick = (category: Category, index: number) => setAvatar(current => ({ ...current, [category]: index }))
  const turn = (step: number) => setFacing(current => turning[(turning.indexOf(current) + step + turning.length) % turning.length])
  const section = sections[tab]
  const part = section?.parts[parts[tab]]
  const shown = part?.style ?? part?.colour
  const selectedName = part?.gender ? (genderOf(avatar.style) === 'boy' ? 'Boy' : 'Girl') : shown ? categories[shown].options[avatar[shown]][0] : undefined
  const colourName = part?.colour ? categories[part.colour].options[avatar[part.colour]][0] : undefined

  return <section className={'looks ' + (wardrobe ? 'in-game' : 'new-game')} aria-labelledby="custom-title">
    <header className="looks-titlebar">
      {wardrobe ? <span /> : <button className="looks-back" type="button" onClick={onBack}><ArrowLeft size={17} /> Main menu</button>}
      <h1 id="custom-title">{wardrobe ? 'Change your look' : 'Choose your look'}</h1>
      {wardrobe ? <button className="looks-close" type="button" onClick={onBack} aria-label="Close without saving" title="Close without saving"><X size={20} /></button> : <span />}
    </header>
    <div className="looks-tabs" role="tablist" aria-label="Appearance" onKeyDown={event => roving(event, tabs.length, tab, setTab)}>
      {tabs.map((entry, index) => <button key={entry.label} type="button" role="tab" id={`looks-tab-${index}`} aria-selected={index === tab}
        aria-controls="looks-panel" tabIndex={index === tab ? 0 : -1} onClick={() => setTab(index)}>
        {entry.icon}<span>{entry.label}</span>
      </button>)}
    </div>
    <div className="looks-body">
      <div id="looks-panel" role="tabpanel" aria-labelledby={`looks-tab-${tab}`} className={'looks-panel ' + (tab === WARDROBE ? 'wardrobe' : '')}>
        {tab === WARDROBE ? <Wardrobe avatar={avatar} onWear={setAvatar} /> : <>
          <nav className="looks-parts" aria-label={`${section.label} items`}
            onKeyDown={event => roving(event, section.parts.length, parts[tab], index => setParts(p => p.map((v, i) => i === tab ? index : v)), true)}>
            {section.parts.map((entry, index) => <button key={entry.label} type="button" title={entry.label} aria-label={entry.label}
              aria-pressed={index === parts[tab]} tabIndex={index === parts[tab] ? 0 : -1}
              onClick={() => setParts(p => p.map((v, i) => i === tab ? index : v))}>{entry.icon}<span>{entry.label}</span></button>)}
          </nav>
          <div className="looks-grid">
            <h2>{part.label}{selectedName && <small aria-live="polite">{selectedName}</small>}</h2>
            {(part.note || shown) && <p className="looks-hint">{part.note ?? categories[shown!].hint}</p>}
            <Items part={part} avatar={avatar} onPick={pick} />
          </div>
          <div className="looks-colours">
            <h2>Colour{colourName && <small aria-live="polite">{colourName}</small>}</h2>
            {part.colour
              ? <>{categories[part.colour].hint && <p className="looks-hint">{categories[part.colour].hint}</p>}<Palette category={part.colour} avatar={avatar} onPick={pick} /></>
              : <p className="looks-hint">{part.gender ? 'Pick colours for skin, hair and clothes in their own sections.' : 'This item comes in one colour.'}</p>}
          </div>
        </>}
      </div>
      <aside className="looks-preview" aria-label="Live preview">
        <div className="looks-name">
          <label htmlFor={nameId}>Your name</label>
          <input id={nameId} value={name} maxLength={24} autoComplete="nickname" placeholder="e.g. Wei Ling, Hafiz, Priya"
            aria-invalid={touched && !validName} aria-describedby={nameId + '-hint'}
            onChange={event => setName(event.target.value)} onBlur={() => setTouched(true)} />
          <small id={nameId + '-hint'} className={touched && !validName ? 'invalid' : ''}>
            {validName ? 'Shown above your character.' : touched ? 'Up to 24 letters or numbers, starting with a letter or number.' : 'Enter a name to save.'}
          </small>
        </div>
        <div className="looks-stage">
          <AvatarSprite avatar={avatar} facing={facing} frame={frame} />
          {validName && <span className="looks-tag">{validName}</span>}
          <button type="button" className="looks-turn left" onClick={() => turn(-1)} aria-label="Turn left" title="Turn left"><RotateCcw size={18} /></button>
          <button type="button" className="looks-turn right" onClick={() => turn(1)} aria-label="Turn right" title="Turn right"><RotateCw size={18} /></button>
          <button type="button" className="looks-walk" aria-pressed={walking} onClick={() => setWalking(!walking)}
            title={walking ? 'Stand still' : 'Preview walking'}>{walking ? <Pause size={15} /> : <Play size={15} />}{walking ? 'Stand' : 'Walk'}</button>
        </div>
        <div className="looks-tools">
          <button type="button" onClick={() => { setAvatar(initial); setFacing('front') }} disabled={sameAvatar(avatar, initial)} title="Undo all changes"><Undo2 size={16} /> Undo</button>
          <button type="button" onClick={() => setAvatar(randomAvatar())} title="Randomise every option"><Shuffle size={16} /> Random</button>
        </div>
        <Button className="primary looks-save" disabled={!validName} onClick={() => validName && onConfirm(avatar, validName)}>
          <Check size={19} /> {wardrobe ? 'Save look' : 'Save character'}
        </Button>
      </aside>
    </div>
  </section>
}
