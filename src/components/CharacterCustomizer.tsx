import { useId, useState } from 'react'
import { ArrowDown, ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp, ArrowUpLeft, ArrowUpRight, Briefcase, Check, Footprints, Glasses, Palette, RotateCcw, Shirt, Shuffle, Smile, Sparkles, UserRound } from 'lucide-react'
import { baseAvatar, categories, groups, presets, randomAvatar, sameAvatar, type Avatar, type Category, type Facing } from '../state/avatar'
import { AvatarSprite } from './AvatarSprite'
import { readName } from '../multiplayer/protocol'
import { Button } from './ui'

const icons = [Smile, UserRound, Palette, Shirt, Shirt, Footprints, Glasses, Briefcase]
// Preview angles in turning order; each arrow points the way the character faces.
const facings: [Facing, typeof ArrowDown, string][] = [
  ['front', ArrowDown, 'Front'], ['front-right', ArrowDownRight, 'Front right'], ['right', ArrowRight, 'Right'], ['back-right', ArrowUpRight, 'Back right'],
  ['back', ArrowUp, 'Back'], ['back-left', ArrowUpLeft, 'Back left'], ['left', ArrowLeft, 'Left'], ['front-left', ArrowDownLeft, 'Front left'],
]
const starters = [{ name: 'Base', avatar: baseAvatar }, ...presets]

function Choices({ category, avatar, onPick, titled }: { category: Category; avatar: Avatar; onPick: (index: number) => void; titled: boolean }) {
  const details = categories[category]
  const swatches = Boolean(details.options[0][1])
  return <div className="choice-group">
    {titled && <h3>{details.label}</h3>}
    <div className={'choices ' + (swatches ? 'swatches' : '')}>
      {details.options.map(([name, color], index) => <button key={name} type="button" title={name} aria-label={name}
        aria-pressed={avatar[category] === index} onClick={() => onPick(index)}>
        {color ? <span className="swatch" style={{ background: color }}>{avatar[category] === index && <Check size={19} />}</span> : <><span>{name}</span>{avatar[category] === index && <Check size={17} />}</>}
      </button>)}
    </div>
    {swatches && <div className="current-swatch" aria-live="polite">{details.options[avatar[category]][0]}</div>}
  </div>
}

export function CharacterCustomizer({ initial, initialName = '', wardrobe = false, onBack, onConfirm }: {
  initial: Avatar; initialName?: string; wardrobe?: boolean; onBack: () => void; onConfirm: (avatar: Avatar, name: string) => void
}) {
  const [avatar, setAvatar] = useState(initial)
  const [name, setName] = useState(initialName)
  const [touched, setTouched] = useState(false)
  const validName = readName(name)
  const nameId = useId()
  const [tab, setTab] = useState(0)
  const [facing, setFacing] = useState<Facing>('front')
  const group = groups[tab]
  const Icon = icons[tab]

  return <section className="customizer" aria-labelledby="custom-title">
    <header className="custom-header">
      <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={17} /> {wardrobe ? 'Back to game' : 'Main menu'}</button>
      <div className="custom-heading">
        <div className="eyebrow"><Shirt size={15} /> {wardrobe ? 'PLAYER WARDROBE' : 'CHARACTER CUSTOMISATION'}</div>
        <h1 id="custom-title">Choose your look</h1>
      </div>
      <p>Name your character, pick a starting look, then make it your own. Every option stays open to everyone.</p>
    </header>
    <div className="name-field">
      <label htmlFor={nameId}>Your name</label>
      <input id={nameId} value={name} maxLength={24} autoComplete="nickname" placeholder="e.g. Wei Ling, Hafiz, Priya"
        aria-invalid={touched && !validName} aria-describedby={nameId + '-hint'}
        onChange={event => setName(event.target.value)} onBlur={() => setTouched(true)} />
      <small id={nameId + '-hint'} className={touched && !validName ? 'invalid' : ''}>
        {touched && !validName ? 'Enter up to 24 letters or numbers, starting with a letter or number.' : 'Shown above your character and in your player card.'}
      </small>
    </div>
    <div className="presets" aria-label="Starter looks">
      {starters.map(preset => <button className="preset" type="button" key={preset.name}
        aria-pressed={sameAvatar(avatar, preset.avatar)} onClick={() => setAvatar(preset.avatar)}>
        <AvatarSprite avatar={preset.avatar} />
        <span>{preset.name}</span>
        {sameAvatar(avatar, preset.avatar) && <Check size={17} className="preset-check" />}
      </button>)}
    </div>
    <div className="custom-body">
      <nav className="categories" aria-label="Appearance categories">
        {groups.map((entry, index) => {
          const IconForGroup = icons[index]
          return <button key={entry.label} type="button" aria-pressed={index === tab} onClick={() => setTab(index)}>
            <IconForGroup size={17} /> {entry.label}
          </button>
        })}
      </nav>
      <div className="avatar-stage" aria-label={facing + ' avatar preview'}>
        <div className="preview-label">LIVE PREVIEW</div>
        <Sparkles className="preview-sparkle left" size={21} aria-hidden="true" />
        <Sparkles className="preview-sparkle right" size={17} aria-hidden="true" />
        <div className="avatar-platform">
          <AvatarSprite avatar={avatar} facing={facing} />
        </div>
        <div className="facing" aria-label="Preview angle">
          {facings.map(([angle, Arrow, label]) => <button key={angle} type="button" title={label} aria-label={label} aria-pressed={facing === angle} onClick={() => setFacing(angle)}><Arrow size={16} aria-hidden="true" /></button>)}
        </div>
      </div>
      <section className="appearance-options" aria-label={group.label}>
        <div className="appearance-title"><Icon size={19} /><h2>{group.label}</h2></div>
        <p>{categories[group.keys[0]].hint}</p>
        {group.keys.map(key => <Choices key={key} category={key} avatar={avatar} titled={group.keys.length > 1}
          onPick={index => setAvatar({ ...avatar, [key]: index })} />)}
      </section>
    </div>
    <footer className="custom-footer">
      <div>
        <Button className="secondary" onClick={() => setAvatar(randomAvatar())}><Shuffle size={17} /> Randomise</Button>
        <Button className="secondary" onClick={() => { setAvatar(initial); setFacing('front') }}><RotateCcw size={17} /> Reset</Button>
      </div>
      <Button className="primary" disabled={!validName} onClick={() => validName && onConfirm(avatar, validName)}><Check size={19} /> {wardrobe ? 'Save look' : 'Confirm character'}</Button>
    </footer>
  </section>
}
