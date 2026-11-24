import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, Backpack, Check, ClipboardList, CloudSun, MapPin, Minus, Network, Play, Plus } from 'lucide-react'
import type { ResidentId } from '../game/events'
import { BUILDING_SIZE, buildingCollisions } from '../game/buildingEntrances'
import { groundColors, neighbourhood } from '../game/maps'
import { HOUSE_SIZE, SHOP_SIZE } from '../game/locations'
import district from '../game/maps/amk-config.json'
import { footprint } from '../game/geoPolygon'
import { houseFurniture, houseRooms, houseWalls } from '../game/houseLayout'
import { shopFixtures } from '../game/minimartLayout'
import { choiceIds, responses, type JunChoice } from '../state/investigation'
import type { Save } from '../state/saveGame'
import type { GuardianId } from '../state/guardians'
import { GuardianCollection } from './GuardianCollection'
import { CharacterCustomizer } from './CharacterCustomizer'
import { currentObjective, objectiveDetails, type GameTool } from './GameHUD'
import { ResidentPortrait } from './AvatarSprite'
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
      <span className="dialogue-portrait"><ResidentPortrait id={id} /></span>
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
  const viewport = useRef<HTMLDivElement>(null)
  const zoomCenter = useRef({ x: .5, y: .5 })
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const [zoom, setZoom] = useState(1)

  function changeZoom(next: number) {
    const view = viewport.current
    if (!view || next === zoom) return
    zoomCenter.current = {
      x: (view.scrollLeft + view.clientWidth / 2) / view.scrollWidth,
      y: (view.scrollTop + view.clientHeight / 2) / view.scrollHeight,
    }
    setZoom(next)
  }

  useLayoutEffect(() => {
    const view = viewport.current
    if (!view) return
    view.scrollLeft = zoomCenter.current.x * view.scrollWidth - view.clientWidth / 2
    view.scrollTop = zoomCenter.current.y * view.scrollHeight - view.clientHeight / 2
  }, [zoom])

  const inside = save.scene === 'Building' || save.scene === 'Minimart' || save.scene === 'HouseH' || save.scene === 'HouseI' || save.scene === 'FreezeFrame'
  const house = save.scene === 'House'
  const map = inside || house ? null : neighbourhood
  const size = save.scene==='Building'?BUILDING_SIZE:house ? HOUSE_SIZE : map?.size ?? SHOP_SIZE
  const tileWidth = map ? 4 : Math.max(7, Math.floor(420 / size.x))
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

    if (map) {
      for (const path of map.props.filter(p => p.kind === 'geoRoad' || p.kind === 'geoPath')) {
        ctx.beginPath()
        path.path?.forEach((p,i) => i ? ctx.lineTo(p.x*tileWidth,p.y*tileWidth) : ctx.moveTo(p.x*tileWidth,p.y*tileWidth))
        ctx.strokeStyle = path.kind === 'geoRoad' ? '#6d7c79' : '#e4d5b6'
        ctx.lineWidth = Math.max(1,Number(path.properties.width)*tileWidth)
        ctx.lineJoin = 'round'; ctx.stroke()
      }
      for (const building of map.props.filter(p => p.kind === 'geoBuilding')) {
        ctx.beginPath()
        footprint(building).forEach((p,i) => i ? ctx.lineTo(p.x*tileWidth,p.y*tileWidth) : ctx.moveTo(p.x*tileWidth,p.y*tileWidth))
        ctx.closePath();ctx.fillStyle='#a6b7a5';ctx.fill();ctx.strokeStyle='#627c70';ctx.lineWidth=1;ctx.stroke()
      }
      for (const [key,point] of Object.entries(district.entrances)) {
        ctx.beginPath();ctx.arc(point.x*tileWidth,point.y*tileWidth,7,0,Math.PI*2)
        ctx.fillStyle='#247c74';ctx.fill();ctx.strokeStyle='#fff8e8';ctx.lineWidth=2;ctx.stroke()
        ctx.fillStyle='#fff8e8';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(({shop:'S',house:'M',houseH:'H',houseI:'I'} as Record<string,string>)[key],point.x*tileWidth,point.y*tileWidth+3)
      }
      for(const [name,label] of [['Ang Mo Kio Hub','AMK Hub'],['Ang Mo Kio','MRT'],['Block 724','724 Market']]) {
        const p=map.props.find(p=>p.kind==='geoBuilding'&&p.name===name)
        if(!p)continue
        const x=(p.x+p.w/2)*tileWidth,y=(p.y+p.d/2)*tileWidth
        ctx.font='bold 11px sans-serif';ctx.textAlign='center';const w=ctx.measureText(label).width+12
        ctx.fillStyle='#28463f';ctx.fillRect(x-w/2,y-9,w,18);ctx.fillStyle='#fff8e8';ctx.fillText(label,x,y+4)
      }
      ctx.textAlign='start'
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
      for (const fixture of save.scene==='Building'?buildingCollisions:shopFixtures) {
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
        {save.scene==='Building' ? save.building?.name ?? 'Building' : house
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
      <div className="area-map-stage">
        <span className="map-north" aria-label="North">N ↑</span>
        <div className="map-zoom-controls" role="group" aria-label="Map zoom">
          <button type="button" aria-label="Zoom out" disabled={zoom === 1} onClick={() => changeZoom(zoom - .5)}><Minus size={16} /></button>
          <button type="button" aria-label={`Reset map zoom, currently ${zoom * 100}%`} disabled={zoom === 1} onClick={() => changeZoom(1)}>{zoom * 100}%</button>
          <button type="button" aria-label="Zoom in" disabled={zoom === 3} onClick={() => changeZoom(zoom + .5)}><Plus size={16} /></button>
        </div>
        <div
          ref={viewport}
          className={`area-map-viewport${zoom > 1 ? ' is-zoomed' : ''}`}
          style={{ width: `min(100%, calc(42dvh * ${width / height}))`, aspectRatio: width / height }}
          role="region"
          aria-label="Map view"
          tabIndex={zoom > 1 ? 0 : undefined}
          onPointerDown={event => {
            if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0) return
            const view = event.currentTarget
            drag.current = { x: event.clientX, y: event.clientY, left: view.scrollLeft, top: view.scrollTop }
            view.setPointerCapture(event.pointerId)
          }}
          onPointerMove={event => {
            if (!drag.current || event.pointerType !== 'mouse') return
            event.currentTarget.scrollLeft = drag.current.left + drag.current.x - event.clientX
            event.currentTarget.scrollTop = drag.current.top + drag.current.y - event.clientY
          }}
          onLostPointerCapture={() => { drag.current = null }}
        >
          <canvas
            ref={ref}
            width={width}
            height={height}
            style={{ width: `${zoom * 100}%` }}
            aria-label="Area map with your location marked by a beacon"
            role="img"
          />
        </div>
      </div>
      <div className="map-legend">
        <span><i /> You</span>
        {map && (
          <>
            <span><i className="district-block-key" /> Buildings</span>
            <span><i className="district-road-key" /> Roads</span>
            <span><b>S</b> Minimart</span>
            <span><b>M</b> Mystery</span>
            <span><b>H</b> Freeze Frame</span>
            <span><b>I</b> Whisper Network</span>
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
    <CharacterCustomizer initial={save.avatar} initialName={save.name} wardrobe onBack={onClose} onConfirm={(avatar, name) => { onUpdate({ avatar, name }); onClose() }} />
  </Modal>
  return <Modal title={title} onClose={onClose} eyebrow={panel === 'map' ? 'NEIGHBOURHOOD GUIDE' : 'YOUR ADVENTURE'} className={panel === 'guardians' ? 'guardian-modal' : `game-panel panel-${panel}`}>
    {panel === 'guardians' && <GuardianCollection save={save} onCollect={onCollectGuardian} />}
    {panel === 'missions' && <section className="mission-entry">
      <span className="panel-kicker"><span className="status-dot" /> CURRENT OBJECTIVE</span>
      <h3>{currentObjective(save)}</h3>
      <p>{objectiveDetails(save)}</p>
      {save.scene !== 'House' && save.investigation.entered && <Button className="secondary" onClick={onOpenBoard}><ClipboardList size={17} /> Evidence board <ArrowUpRight size={16} /></Button>}
    </section>}
    {panel === 'restart' && <>
      <p>Start the movement tutorial again from your current location.</p>
      <div className="modal-actions">
        <Button className="secondary" onClick={onClose}>Cancel</Button>
        <Button className="primary" onClick={onRestart}>Restart tutorial</Button>
      </div>
    </>}
    {panel === 'pack' && <div className="pack-items">
      <Button className="pack-board" onClick={onOpenBoard}><span className="panel-icon"><ClipboardList size={22} /></span><span><strong>Evidence board</strong><small>Review your clues and discoveries</small></span><ArrowUpRight size={18} /></Button>
      <section className="pocket-guide"><h3><Backpack size={18} /> Neighbourhood pocket guide</h3>
        <div className="guide-row"><span className="guide-marker">S</span><div><strong>Sunshine Minimart</strong><p>Find the SHIELD entrance at Block 702.</p></div></div>
        <div className="guide-row"><span className="guide-marker">724</span><div><strong>Market &amp; food centre</strong><p>North-west of AMK Hub, near Avenue 6.</p></div></div>
        <div className="guide-row"><MapPin size={18} /><div><strong>Find your way</strong><p>Open the area map for landmarks and mission entrances.</p></div></div>
      </section>
    </div>}
    {panel === 'map' && <AreaMap save={save} />}
    {panel === 'settings' && <div className="settings-content">
      <section><h3 className="panel-kicker">ACCESSIBILITY</h3><label className="setting-row"><span><strong>Reduced motion</strong><small>Instant camera follow and shorter animations.</small></span>
        <input className="motion-toggle" role="switch" type="checkbox" checked={save.reducedMotion} onChange={event => onUpdate({ reducedMotion: event.target.checked })} /></label></section>
      <section className="panel-controls"><h3 className="panel-kicker">QUICK CONTROLS</h3><dl><div><dt>Move</dt><dd><kbd>WASD</kbd><span>or</span><kbd>↑ ↓ ← →</kbd></dd></div><div><dt>Run</dt><dd><kbd>Shift</kbd></dd></div><div><dt>Interact</dt><dd><kbd>E</kbd></dd></div></dl></section>
      <p className="panel-note"><CloudSun size={17} /><span>Singapore time (SGT). Local temperature from NEA / data.gov.sg.</span></p>
    </div>}
    {panel === 'controls' && <dl className="controls-list">
      <dt>Move</dt><dd><kbd>WASD</kbd>, arrow keys, or the on-screen joystick</dd>
      <dt>Run</dt><dd>Hold <kbd>Shift</kbd> while moving</dd>
      <dt>Interact</dt><dd>Press <kbd>E</kbd> or tap the prompt near a neighbour</dd>
      <dt>Close a panel</dt><dd>Press <kbd>Esc</kbd> or use its Close button</dd>
    </dl>}
  </Modal>
}
