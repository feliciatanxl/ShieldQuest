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
  const inside = save.scene === 'Minimart' || save.scene === 'HouseH' || save.scene === 'HouseI' || save.scene === 'FreezeFrame'
  const house = save.scene === 'House'
  const map = inside || house ? null : neighbourhood
  const size = house ? HOUSE_SIZE : map?.size ?? SHOP_SIZE
  const tileWidth = Math.max(7, Math.floor(266 / size.x))
  const width = tileWidth * size.x
  const height = tileWidth * size.y

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ecd1b0'
    ctx.fillRect(0, 0, width, height)

    // Terrain ground tiles
    map?.tiles.forEach((tile, i) => {
      ctx.fillStyle = groundColors[tile - 1] ?? '#25364b'
      ctx.fillRect((i % size.x) * tileWidth, Math.floor(i / size.x) * tileWidth, tileWidth, tileWidth)
    })

    // Roads and pedestrian thoroughfares
    if (map) {
      // Main horizontal street
      ctx.fillStyle = '#475569'
      ctx.fillRect(0, 15 * tileWidth, 38 * tileWidth, 3 * tileWidth)
      // Central North-South boulevard
      ctx.fillRect(19 * tileWidth, 5 * tileWidth, 3 * tileWidth, 26 * tileWidth)
      // South Boulevard
      ctx.fillRect(8 * tileWidth, 28 * tileWidth, 27 * tileWidth, 3 * tileWidth)

      // Zebra crossings (white stripes)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(16 * tileWidth, 15 * tileWidth, 1.3 * tileWidth, 3 * tileWidth)
      ctx.fillRect(28 * tileWidth, 15 * tileWidth, 1.3 * tileWidth, 3 * tileWidth)
      ctx.fillRect(19 * tileWidth, 13 * tileWidth, 3 * tileWidth, 1.3 * tileWidth)
      ctx.fillRect(19 * tileWidth, 26 * tileWidth, 3 * tileWidth, 1.3 * tileWidth)
    }

    // World props & buildings
    for (const item of map?.props ?? []) {
      if (!item.w || !item.d) continue
      const px = item.x * tileWidth
      const py = item.y * tileWidth
      const pw = item.w * tileWidth
      const ph = item.d * tileWidth

      if (item.kind === 'block') {
        // HDB Blocks 101–105
        ctx.fillStyle = '#334155'
        ctx.fillRect(px, py, pw, ph)
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 1
        ctx.strokeRect(px, py, pw, ph)
        // Block number badge
        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 8px monospace'
        const blockNum = String(item.properties.number || '')
        ctx.fillText(blockNum, px + 3, py + 10)
      } else if (item.kind === 'shop') {
        // Sunshine Minimart
        ctx.fillStyle = '#0d9488'
        ctx.fillRect(px, py, pw, ph)
        ctx.strokeStyle = '#042f2e'
        ctx.strokeRect(px, py, pw, ph)
        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 7px sans-serif'
        ctx.fillText('MART', px + 3, py + ph / 2 + 2)
      } else if (item.kind === 'kopi') {
        // Kopi Corner
        ctx.fillStyle = '#d97706'
        ctx.fillRect(px, py, pw, ph)
        ctx.strokeStyle = '#78350f'
        ctx.strokeRect(px, py, pw, ph)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 7px sans-serif'
        ctx.fillText('KOPI', px + 3, py + ph / 2 + 2)
      } else if (item.kind === 'house') {
        const isH = item.name.includes('Freeze Frame') || item.name.includes('House H')
        const isI = item.name.includes('Whisper Network') || item.name.includes('House I')
        ctx.fillStyle = isH ? '#059669' : isI ? '#c2410c' : '#831843'
        ctx.fillRect(px, py, pw, ph)
        ctx.strokeStyle = '#0f172a'
        ctx.strokeRect(px, py, pw, ph)
        ctx.fillStyle = '#fef08a'
        ctx.font = 'bold 8px sans-serif'
        ctx.fillText(isH ? 'H' : isI ? 'I' : 'M', px + pw / 2 - 3, py + ph / 2 + 3)
      } else if (item.kind === 'linkway') {
        // Sheltered Linkways
        ctx.fillStyle = '#16a34a'
        ctx.fillRect(px, py, pw, ph)
      } else if (item.kind === 'tree') {
        ctx.fillStyle = '#4ade80'
        ctx.beginPath()
        ctx.arc(px + pw / 2, py + ph / 2, Math.max(3, pw / 2), 0, Math.PI * 2)
        ctx.fill()
      } else if (item.kind === 'play') {
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(px, py, pw, ph)
      }
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

    // Player position beacon with pulsing gold halo
    const position = save.position
    const beaconX = position.x * tileWidth
    const beaconY = position.y * tileWidth

    // Gold halo
    ctx.beginPath()
    ctx.arc(beaconX, beaconY, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.45)'
    ctx.fill()

    // Inner bright white beacon
    ctx.beginPath()
    ctx.arc(beaconX, beaconY, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [map, inside, house, width, height, tileWidth, save.position, size])

  return (
    <div className="map-content">
      <p>
        <MapPin size={17} />{' '}
        {house
          ? 'The Mysterious House'
          : save.scene === 'HouseH'
          ? 'Freeze Frame House'
          : save.scene === 'HouseI'
          ? 'Whisper Network House'
          : save.scene === 'FreezeFrame'
          ? 'Freeze Frame · Investigation'
          : inside
          ? 'Sunshine Minimart'
          : 'Sunshine Estate'}
      </p>
      <canvas
        ref={ref}
        width={width}
        height={height}
        aria-label="Area map with your location marked by a beacon"
        role="img"
      />
      <div className="map-legend">
        <span><i /> You</span>
        {map && (
          <>
            <span><i className="block-key" /> Blocks 101–105</span>
            <span><i className="shop-key" /> Minimart</span>
            <span><i className="kopi-key" /> Kopi Corner</span>
            <span><i className="mystery-key" /> Mystery (M)</span>
            <span><i className="house-h-key" /> House H</span>
            <span><i className="house-i-key" /> House I</span>
            <span><i className="linkway-key" /> Linkway</span>
          </>
        )}
      </div>
    </div>
  )
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
