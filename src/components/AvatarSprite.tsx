import { useLayoutEffect, useRef, useState } from 'react'
import { drawPlayer, loadPlayerArt, playerArtReady } from '../game/playerArt'
import type { Avatar, Facing } from '../state/avatar'
import type { ResidentId } from '../game/events'

// The figure's box within the 80×80 cell, kept at the 4:5 shape the avatar CSS sizes expect.
const CROP = { x: 14, y: 8, w: 52, h: 65 }

/** frame: 0 standing, 1..WALK_FRAMES the walk cycle, exactly as the gameplay sprite draws it. */
export function AvatarSprite({ avatar, facing = 'front', frame = 0, className = '' }: { avatar: Avatar; facing?: Facing; frame?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(playerArtReady)
  useLayoutEffect(() => {
    if (!ready) void loadPlayerArt().then(() => setReady(true))
  }, [ready])
  useLayoutEffect(() => {
    const context = ref.current?.getContext('2d')
    if (!context || !ready) return
    context.clearRect(0, 0, CROP.w, CROP.h)
    drawPlayer(context, avatar, facing, frame, -CROP.x, -CROP.y)
  }, [avatar, facing, frame, ready])

  return <canvas ref={ref} width={CROP.w} height={CROP.h} className={'avatar-sprite ' + className} aria-hidden="true" />
}

// Residents' portraits crop the same PixelLab sprite they use in the world, so faces match what players meet.
const portraitUrls = import.meta.glob('../game/assets/pixellab/objects/npc-{may,amir,jun,cashier}.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const portraitUrl = (id: ResidentId) => portraitUrls[`../game/assets/pixellab/objects/npc-${id}.png`]

export function ResidentPortrait({ id, className = '' }: { id: ResidentId; className?: string }) {
  return <span className={'resident-portrait ' + className} style={{ backgroundImage: `url(${portraitUrl(id)})` }} aria-hidden="true" />
}
