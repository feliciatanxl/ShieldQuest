import { useLayoutEffect, useRef } from 'react'
import { Backpack, Check, ClipboardList, CloudSun, MapPin, Network, Play } from 'lucide-react'
import type { ResidentId } from '../game/events'
import { groundColors, neighbourhood } from '../game/maps'
import { HOUSE_SIZE, SHOP_SIZE } from '../game/locations'
import { houseFurniture, houseRooms, houseWalls } from '../game/houseLayout'
import { shopFixtures } from '../game/minimartLayout'
import { choiceIds, responses, type JunChoice } from '../state/investigation'
import type { Save } from '../state/saveGame'
import type { GuardianId } from '../state/guardians'
import { GuardianCollection } from './GuardianCollection'
import { CharacterCustomizer } from './CharacterCustomizer'
import { currentObjective, objectiveDetails, type GameTool } from './GameHUD'
import { AvatarSprite } from './AvatarSprite'
import { residents } from '../game/residentData'
import { Button, Modal } from './ui'

const dialogue = {
  may: { name: 'Auntie May', text: '“Going for a walk ah? Sunshine Minimart is just beside Kopi Corner. Look for the teal sign!”' },
  amir: { name: 'Amir', text: '“Hey! Have you been to the playground? It’s just past the sheltered walkway.”' },
  jun: { name: 'Jun', text: '“Eh, can you watch the door for me?”' },
  cashier: { name: 'Cashier', text: '“Let me know if you have a question. If something worries you, you can tell me exactly what you saw.”' },
}

export function DialogueBox({ id, choice, onChoice, onClose, onOpenFreezeFrame, onOpenWhisperNetwork }: {
  id: ResidentId
  choice: JunChoice | null
  onChoice: (choice: JunChoice) => void
  onClose: () => void
  onOpenFreezeFrame?: () => void
  onOpenWhisperNetwork?: () => void
}) {
  const { name, text } = dialogue[id]
  const consequence = id === 'jun' && choice ? responses[choice].consequence : null
  return <Modal title={name} onClose={onClose}>
    <div className="dialogue-line">
      <span className="dialogue-portrait"><AvatarSprite avatar={residents[id]} /></span>
      <p>{text}</p>
    </div>
    {consequence && <p className="jun-consequence" role="status">{consequence}</p>}
    {id === 'jun' && !choice ? <div className="jun-choices" aria-label="Choose a response">
      {choiceIds.map(option => <Button key={option} className="secondary" onClick={() => onChoice(option)}>{responses[option].label}</Button>)}
      {onOpenFreezeFrame && <Button className="secondary" onClick={onOpenFreezeFrame}><Play size={15} /> Practice: Freeze Frame (Hold)</Button>}
    </div> : <div className="modal-actions">
      {id === 'jun' && onOpenFreezeFrame && <Button className="secondary" onClick={onOpenFreezeFrame}><Play size={15} /> Practice Freeze Frame</Button>}
      {(id === 'may' || id === 'amir') && onOpenWhisperNetwork && <Button className="secondary" onClick={onOpenWhisperNetwork}><Network size={15} /> Practice Whisper Network</Button>}
      <Button className="primary" onClick={onClose}><Check size={17} /> Done</Button>
    </div>}
  </Modal>
}

function AreaMap({ save }: { save: Save }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const inside = save.scene === 'Minimart' || save.scene === 'HouseH' || save.scene === 'HouseI'
  const house = save.scene === 'House'
  const map = inside || house ? null : neighbourhood
  const size = house ? HOUSE_SIZE : map?.size ?? SHOP_SIZE
  const tileWidth = Math.floor(250 / size.x)
  const width = tileWidth * size.x
  const height = tileWidth * size.y
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ecd1b0'
    ctx.fillRect(0, 0, width, height)
    map?.tiles.forEach((tile, i) => {
      ctx.fillStyle = groundColors[tile - 1] ?? '#25364b'
      ctx.fillRect(i % size.x * tileWidth, Math.floor(i / size.x) * tileWidth, tileWidth, tileWidth)
    })
    for (const item of map?.props ?? []) {
      if (!item.w || !item.d) continue
      ctx.fillStyle = item.kind === 'shop' ? '#299c91' : item.kind === 'house' ? '#995e72' : item.kind === 'tree' ? '#54806b' : '#62566f'
      ctx.fillRect(item.x * tileWidth, item.y * tileWidth, item.w * tileWidth, item.d * tileWidth)
    }
    if (inside) {
      ctx.fillStyle = '#8b6e6a'
      for (const fixture of shopFixtures) {
        ctx.fillRect(fixture.x * tileWidth, fixture.y * tileWidth, fixture.w * tileWidth, fixture.d * tileWidth)
      }
    }
    if (house) {
      for (const room of houseRooms) {
        ctx.fillStyle = room.colors[0]
        ctx.fillRect(room.x * tileWidth, room.y * tileWidth, room.w * tileWidth, room.d * tileWidth)
        ctx.fillStyle = '#26364c'
        ctx.font = '11px sans-serif'
        ctx.fillText(room.name, room.x * tileWidth + 8, room.y * tileWidth + 15)
      }
      ctx.fillStyle = '#8b6e6a'
      for (const fixture of [...houseWalls, ...houseFurniture]) {
        ctx.fillRect(fixture.x * tileWidth, fixture.y * tileWidth, fixture.w * tileWidth, fixture.d * tileWidth)
      }
    }
    const position = save.position
    ctx.beginPath()
    ctx.arc(position.x * tileWidth, position.y * tileWidth, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#fff9e2'
    ctx.fill()
    ctx.strokeStyle = '#26364c'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [map, inside, house, width, height, tileWidth, save.position])
  return <div className="map-content">
    <p><MapPin size={17} /> {house ? 'The Mysterious House' : inside ? 'Sunshine Minimart' : 'Sunshine Estate'}</p>
    <canvas ref={ref} width={width} height={height} aria-label="Area map with your location marked by a white dot" role="img" />
    <div className="map-legend"><span><i /> You are here</span>{map && <>
      <span><i className="shop-key" /> Minimart</span><span><i className="house-key" /> Mysterious House</span>
    </>}</div>
  </div>
}

export type GamePanelView = GameTool | 'missions' | 'controls' | 'restart' | 'guardians'

export function GamePanel({ panel, save, onClose, onUpdate, onRestart, onOpenBoard, onCollectGuardian }: {
  panel: GamePanelView; save: Save; onClose: () => void; onUpdate: (changes: Partial<Save>) => void; onRestart: () => void; onOpenBoard: () => void
  onCollectGuardian: (id: GuardianId) => void
}) {
  const title = {
    wardrobe: 'Wardrobe', pack: 'Your pack', settings: 'Settings', map: 'Area map',
    missions: 'Missions', controls: 'Help & controls', restart: 'Restart tutorial?', guardians: 'Guardians',
  }[panel]
  if (panel === 'wardrobe') return <Modal title={title} onClose={onClose} wide>
    <CharacterCustomizer initial={save.avatar} wardrobe onBack={onClose} onConfirm={avatar => { onUpdate({ avatar }); onClose() }} />
  </Modal>
  return <Modal title={title} onClose={onClose} className={panel === 'guardians' ? 'guardian-modal' : undefined}>
    {panel === 'guardians' && <GuardianCollection save={save} onCollect={onCollectGuardian} />}
    {panel === 'missions' && <section className="mission-entry">
      <h3>{currentObjective(save)}</h3>
      <p>{objectiveDetails(save)}</p>
      {save.scene !== 'House' && save.investigation.entered && <Button className="secondary" onClick={onOpenBoard}><ClipboardList size={17} /> Evidence board</Button>}
    </section>}
    {panel === 'restart' && <>
      <p>Start the movement tutorial again from your current location.</p>
      <div className="modal-actions">
        <Button className="secondary" onClick={onClose}>Cancel</Button>
        <Button className="primary" onClick={onRestart}>Restart tutorial</Button>
      </div>
    </>}
    {panel === 'pack' && <div className="pack-items">
      <Button className="secondary" onClick={onOpenBoard}><ClipboardList size={17} /> Evidence board</Button>
      <p><Backpack size={18} /> Estate pocket guide</p>
      <ul>
        <li><strong>Kopi Corner</strong> · Look for the terracotta awning.</li>
        <li><strong>Sunshine Minimart</strong> · The teal storefront beside Kopi Corner.</li>
        <li><strong>Bus stop</strong> · Beside the pedestrian crossing.</li>
      </ul>
    </div>}
    {panel === 'map' && <AreaMap save={save} />}
    {panel === 'settings' && <div className="settings-content">
      <label className="setting-row"><span><strong>Reduced motion</strong><small>Instant camera follow and shorter animations</small></span>
        <input type="checkbox" checked={save.reducedMotion} onChange={event => onUpdate({ reducedMotion: event.target.checked })} /></label>
      <p><CloudSun size={18} /> In-game weather and time are fictional.</p>
      <p><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> Move · <kbd>Shift</kbd> Run · <kbd>E</kbd> Interact</p>
    </div>}
    {panel === 'controls' && <dl className="controls-list">
      <dt>Move</dt><dd><kbd>WASD</kbd>, arrow keys, or the on-screen joystick</dd>
      <dt>Run</dt><dd>Hold <kbd>Shift</kbd> while moving</dd>
      <dt>Interact</dt><dd>Press <kbd>E</kbd> or tap the prompt near a neighbour</dd>
      <dt>Close a panel</dt><dd>Press <kbd>Esc</kbd> or use its Close button</dd>
    </dl>}
  </Modal>
}
