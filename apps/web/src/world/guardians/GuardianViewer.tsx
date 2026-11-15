// Interactive viewer for the ported V2 Guardians. It composes V2's own pieces unchanged
// (AdaptiveCanvas, Lighting, FigureRig, GuardianIcon) and only adds a drag-to-rotate turntable.
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { guardianById, type GuardianId } from '../v2Shared';
import { AdaptiveCanvas } from '../kit/AdaptiveCanvas';
import { useKit } from '../kit/context';
import { Lighting } from '../kit/Lighting';
import { GuardianIcon } from '../flat/GuardianIcon';
import { useRenderMode } from '../quality';
import { FigureRig } from './GuardianFigure';
import '../kit/kit.css';

export interface ViewerHandle {
  yaw: number;
  pitch: number;
  /** Wakes the on-demand frame loop (set by the turntable inside the canvas). */
  wake: () => void;
}

/** Applies the user's drag rotation around V2's own idle sway (which lives on the inner group). */
function Turntable({ view, children }: { view: React.MutableRefObject<ViewerHandle>; children: React.ReactNode }) {
  const { requestFrame } = useKit();
  const group = useRef<Group>(null);
  useLayoutEffect(() => {
    view.current.wake = requestFrame;
  }, [view, requestFrame]);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    // Ease towards the target so drags and resets feel smooth.
    g.rotation.y += (view.current.yaw - g.rotation.y) * 0.2;
    g.rotation.x += (view.current.pitch - g.rotation.x) * 0.2;
    if (Math.abs(view.current.yaw - g.rotation.y) > 1e-3 || Math.abs(view.current.pitch - g.rotation.x) > 1e-3) requestFrame();
  });
  // Pivot around the figure's middle (V2 frames it at y ≈ 0.5).
  return (
    <group position={[0, 0.5, 0]}>
      <group ref={group}>
        <group position={[0, -0.5, 0]}>{children}</group>
      </group>
    </group>
  );
}

interface GuardianViewerProps {
  guardian: GuardianId;
  /** 0 = folded paper sheet, 1-3 = bond level. */
  level: number;
  /** Changing this remounts the rig, replaying V2's Unfold from the paper sheet. */
  playKey: number;
  view: React.MutableRefObject<ViewerHandle>;
}

export function GuardianViewer({ guardian, level, playKey, view }: GuardianViewerProps) {
  const mode = useRenderMode();
  const drag = useRef<{ x: number; y: number } | null>(null);
  const g = guardianById(guardian);
  const flat = (
    <div className="w-guardian__flat">
      <GuardianIcon guardian={guardian} level={level} size={256} />
    </div>
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const v = view.current;
      v.yaw += (e.clientX - drag.current.x) * 0.012;
      v.pitch = Math.max(-0.5, Math.min(0.5, v.pitch + (e.clientY - drag.current.y) * 0.006));
      drag.current = { x: e.clientX, y: e.clientY };
      v.wake();
    },
    [view],
  );
  const endDrag = useCallback(() => {
    drag.current = null;
  }, []);

  if (mode === '2d') return <div className="w-guardian">{flat}</div>;

  return (
    <div
      className="w-guardian cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <AdaptiveCanvas
        quality={mode}
        ariaLabel={level < 1 ? `A folded paper square that unfolds into ${g.name}.` : `${g.name}, ${g.creature}, bond level ${level}. Drag to rotate.`}
        camera={{ position: [0, 0.92, 2.75], fov: 30, near: 0.1, far: 30 }}
        fallback={flat}
      >
        <Lighting grade="blue-hour" timeOfDay="afternoon" fog={false} target={[0, 0.5, 0]} shadowExtent={2} />
        <Turntable view={view}>
          <FigureRig key={`${guardian}-${playKey}`} guardian={guardian} level={level} celebrate />
        </Turntable>
      </AdaptiveCanvas>
    </div>
  );
}
