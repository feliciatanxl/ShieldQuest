import { useState } from 'react'
import { ArrowLeft, Briefcase, Check, Footprints, Glasses, Palette, RotateCcw, Shirt, Shuffle, Smile, Sparkles, UserRound } from 'lucide-react'
import { baseAvatar, categories, groups, presets, randomAvatar, sameAvatar, type Avatar, type Category, type Facing } from '../state/avatar'
import { AvatarSprite } from './AvatarSprite'
import { Button } from './ui'

const icons = [Smile, UserRound, Palette, Shirt, Shirt, Footprints, Glasses, Briefcase]
const facings: Facing[] = ['front', 'right', 'back', 'left']
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

export function CharacterCustomizer({ initial, wardrobe = false, onBack, onConfirm }: {
  initial: Avatar; wardrobe?: boolean; onBack: () => void; onConfirm: (avatar: Avatar) => void
}) {
  const [avatar, setAvatar] = useState(initial)
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
      <p>Start from the base or a look inspired by Singapore&apos;s communities. Every option stays open to everyone.</p>
    </header>
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
          {facings.map(angle => <button key={angle} type="button" aria-pressed={facing === angle} onClick={() => setFacing(angle)}>{angle}</button>)}
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
      <Button className="primary" onClick={() => onConfirm(avatar)}><Check size={19} /> {wardrobe ? 'Save look' : 'Confirm character'}</Button>
    </footer>
  </section>
}
