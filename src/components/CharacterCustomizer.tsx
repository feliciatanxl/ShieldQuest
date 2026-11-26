import { useState } from 'react'
import { ArrowLeft, Check, Footprints, Glasses, Palette, RotateCcw, Shirt, Shuffle, Smile, Sparkles, UserRound } from 'lucide-react'
import { categories, categoryKeys, presets, randomAvatar, sameAvatar, type Avatar, type Category, type Facing } from '../state/avatar'
import { AvatarSprite } from './AvatarSprite'
import { Button } from './ui'

const icons = { skin: Smile, style: UserRound, hair: Palette, top: Shirt, bottom: Shirt, shoes: Footprints, accessory: Glasses }
const facings: Facing[] = ['front', 'right', 'back', 'left']

export function CharacterCustomizer({ initial, wardrobe = false, onBack, onConfirm }: {
  initial: Avatar; wardrobe?: boolean; onBack: () => void; onConfirm: (avatar: Avatar) => void
}) {
  const [avatar, setAvatar] = useState(initial)
  const [category, setCategory] = useState<Category>('skin')
  const [facing, setFacing] = useState<Facing>('front')
  const details = categories[category]
  const Icon = icons[category]

  return <section className="customizer" aria-labelledby="custom-title">
    <header className="custom-header">
      <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={17} /> {wardrobe ? 'Back to game' : 'Main menu'}</button>
      <div className="custom-heading">
        <div className="eyebrow"><Shirt size={15} /> {wardrobe ? 'PLAYER WARDROBE' : 'CHARACTER CUSTOMISATION'}</div>
        <h1 id="custom-title">Choose your look</h1>
      </div>
      <p>Pick a starter look or make it your own.</p>
    </header>
    <div className="presets" aria-label="Starter looks">
      {presets.map(preset => <button className="preset" type="button" key={preset.name}
        aria-pressed={sameAvatar(avatar, preset.avatar)} onClick={() => setAvatar(preset.avatar)}>
        <AvatarSprite avatar={preset.avatar} />
        <span>{preset.name}</span>
        {sameAvatar(avatar, preset.avatar) && <Check size={17} className="preset-check" />}
      </button>)}
    </div>
    <div className="custom-body">
      <nav className="categories" aria-label="Appearance categories">
        {categoryKeys.map(key => {
          const IconForCategory = icons[key]
          return <button key={key} type="button" aria-pressed={key === category} onClick={() => setCategory(key)}>
            <IconForCategory size={17} /> {categories[key].label}
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
      <section className="appearance-options" aria-label={details.label}>
        <div className="appearance-title"><Icon size={19} /><h2>{details.label}</h2></div>
        <p>{details.hint}</p>
        <div className={'choices ' + (details.options[0][1] ? 'swatches' : '')}>
          {details.options.map(([name, color], index) => <button key={name} type="button" title={name} aria-label={name}
            aria-pressed={avatar[category] === index} onClick={() => setAvatar({ ...avatar, [category]: index })}>
            {color ? <span className="swatch" style={{ background: color }}>{avatar[category] === index && <Check size={19} />}</span> : <><span>{name}</span>{avatar[category] === index && <Check size={17} />}</>}
          </button>)}
        </div>
        {details.options[0][1] && <div className="current-swatch" aria-live="polite">{details.options[avatar[category]][0]}</div>}
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
