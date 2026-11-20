import { useLayoutEffect, useRef } from 'react'
import { AVATAR_HEIGHT, AVATAR_WIDTH, drawAvatar } from '../game/avatarArt'
import type { Avatar, Facing } from '../state/avatar'

export function AvatarSprite({ avatar, facing = 'front', className = '' }: { avatar: Avatar; facing?: Facing; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const context = ref.current?.getContext('2d')
    if (context) drawAvatar(context, avatar, facing)
  }, [avatar, facing])

  return <canvas ref={ref} width={AVATAR_WIDTH} height={AVATAR_HEIGHT} className={'avatar-sprite ' + className} aria-hidden="true" />
}
