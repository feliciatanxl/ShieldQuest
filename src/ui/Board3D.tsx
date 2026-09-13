import { useEffect, useRef, useState } from 'react';

import { TRACK } from '../game/board.ts';
import { DISTRICTS } from '../game/board.ts';
import { BoardScene } from '../three/BoardScene.ts';
import { equippedCosmetic } from '../game/content/cosmetics.ts';
import { useGame } from '../state/store.ts';
import type { DistrictId } from '../game/types.ts';

/**
 * The 3D board, plus the focusable DOM layer that sits exactly on top of it.
 *
 * The canvas is `aria-hidden`: it is a picture of the board. Everything a
 * player or a screen reader needs to *operate* is in the button layer above it,
 * positioned each frame by projecting the same tile geometry the meshes use.
 * Tab order follows the track, so tabbing walks the board in playing order.
 */
export default function Board3D({ onInspect }: { onInspect: (index: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BoardScene | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [viewMoved, setViewMoved] = useState(false);

  const game = useGame((s) => s.game);
  const path = useGame((s) => s.path);
  const dice = useGame((s) => s.dice);
  const celebrate = useGame((s) => s.celebrate);
  const arrive = useGame((s) => s.arrive);

  /* --- scene lifecycle --------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new BoardScene(canvas, {
      reducedMotion: reduced,
      // The scene owns the pacing of a turn; this only says what happens at
      // each hand-off. The landing pulse and the pause after it live in the
      // scene so they stay tied to the render loop.
      onDiceSettled: () => {
        useGame.getState().settleDice();
        scene.moveToken(useGame.getState().path);
      },
      onTokenArrived: () => useGame.getState().arrive(),
    });
    sceneRef.current = scene;

    const observer = new ResizeObserver(() => scene.resize());
    observer.observe(canvas.parentElement ?? canvas);

    // Project the tiles onto the control layer every frame. Writing styles
    // directly rather than through state keeps 28 buttons off React's render
    // path while the camera is moving.
    let raf = 0;
    const sync = () => {
      for (let i = 0; i < TRACK.length; i += 1) {
        const button = buttonsRef.current[i];
        if (!button) continue;
        const box = scene.project(i);
        if (!box) {
          button.style.visibility = 'hidden';
          continue;
        }
        button.style.visibility = 'visible';
        button.style.left = `${box.x}px`;
        button.style.top = `${box.y}px`;
        button.style.width = `${box.w}px`;
        button.style.height = `${box.h}px`;
      }
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
    // The scene is created once and then driven imperatively; re-creating it on
    // every state change would rebuild 28 textures a turn.
  }, [arrive]);

  /* --- the player's view of the board -------------------------------- */

  /**
   * Drag to turn the board, wheel or pinch to move in and out.
   *
   * Bound to the STAGE rather than the canvas, because the 28 tile buttons ring
   * the whole board — bound to the canvas, a drag that happened to start on a
   * tile would do nothing, which is most of the board's edge.
   *
   * That creates the one problem this has to solve: a drag that starts on a
   * button would also fire its click on release and open a space the player was
   * only trying to look behind. So a drag past a few pixels arms a one-shot
   * capture-phase listener that swallows the click. Below that threshold
   * nothing is suppressed, and a tap is still a tap.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    /** Pixels of travel before a press stops being a tap. */
    const DRAG_THRESHOLD = 8;

    const pointers = new Map<number, { x: number; y: number }>();
    let dragging = false;
    let moved = 0;
    let pinch = 0;

    const spread = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };

    const swallowClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const onPointerDown = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) pinch = spread();
      if (pointers.size !== 1) return;
      dragging = true;
      moved = 0;
      // Not captured on the stage: capturing would steal the pointer from the
      // tile button underneath and kill the tap it is still allowed to be.
      stage.style.cursor = 'grabbing';
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size >= 2) {
        // Two fingers: pinch. The ratio is turned into the same units the
        // wheel sends, so both paths land in `zoomBy` meaning the same thing.
        const next = spread();
        if (pinch > 0 && next > 0) sceneRef.current?.zoomBy((pinch - next) * 2.2);
        pinch = next;
        setViewMoved(true);
        return;
      }

      if (!dragging) return;
      const wasTap = moved <= DRAG_THRESHOLD;
      moved += Math.abs(dx) + Math.abs(dy);
      sceneRef.current?.orbit(dx, dy);

      if (wasTap && moved > DRAG_THRESHOLD) {
        setViewMoved(true);
        // Capture only once this is definitely a drag. Capturing on pointerdown
        // would be simpler and would break every tile: a captured pointer
        // delivers its click to the capturing element, so the button under the
        // finger would never hear it. By here the click is going to be
        // swallowed anyway, and capture is what lets the drag continue when the
        // mouse leaves the board.
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {
          /* Pointer already gone. The drag just ends at the edge instead. */
        }
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (pointers.size > 0) return;
      // A few pixels of travel is the line between "aiming at a tile" and
      // "turning the board". Below it the click goes through untouched.
      if (dragging && moved > DRAG_THRESHOLD) {
        window.addEventListener('click', swallowClick, { capture: true, once: true });
        // If the release produced no click at all, the listener would sit there
        // waiting to eat the player's next one.
        window.setTimeout(() => window.removeEventListener('click', swallowClick, true), 0);
      }
      if (stage.hasPointerCapture?.(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      dragging = false;
      moved = 0;
      stage.style.cursor = '';
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      sceneRef.current?.zoomBy(event.deltaY);
      setViewMoved(true);
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('pointerleave', onPointerUp);
    // Not passive: the whole point is to stop the page scrolling under a zoom.
    stage.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      stage.removeEventListener('pointerleave', onPointerUp);
      stage.removeEventListener('wheel', onWheel);
      window.removeEventListener('click', swallowClick, true);
    };
  }, []);

  /* --- drive the scene from state ---------------------------------- */

  // The equipped cosmetic. Same source as the flat board, so a piece that is
  // teal on one renderer is teal on the other.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !game) return;
    const look = equippedCosmetic(game.equipped);
    scene.setPieceLook(look.colour, look.glow);
  }, [game?.equipped, game]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !game) return;
    scene.setCurrent(game.position);
    scene.setResolved(
      new Set(TRACK.filter((s) => game.resolved.includes(s.id)).map((s) => s.index)),
    );
    for (const districtId of Object.keys(DISTRICTS) as DistrictId[]) {
      scene.setUpgrades(districtId, game.districts[districtId].upgrades);
    }
  }, [game]);

  // A new roll: throw the dice, and let the settle callback start the move.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !dice || path.length === 0) return;
    scene.throwDice(dice.a, dice.b);
  }, [dice, path.length]);

  // Any celebration — a Guardian met, a district secured, an upgrade built.
  useEffect(() => {
    if (celebrate === 0) return;
    const scene = sceneRef.current;
    if (!scene || !game) return;
    scene.pulse(game.position, 0xf2ae33);
  }, [celebrate, game]);

  const overlayKind = useGame((s) => s.overlay.kind);
  useEffect(() => {
    if (overlayKind === 'consequence') sceneRef.current?.jolt();
    // The dice have done their job once the space opens; leaving them lying on
    // the board reads as a bug the next time the player rolls.
    if (overlayKind !== 'none') sceneRef.current?.hideDice();
  }, [overlayKind]);

  /* --- render ------------------------------------------------------- */

  return (
    <div ref={stageRef} className="sq-board-stage" style={{ cursor: 'grab' }}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />

      {/*
        Offered only once the view has actually been moved.

        A permanent "reset" implies the board needs resetting, and a player who
        has not touched the camera has nothing to undo. It is also the only way
        back for a keyboard user, who cannot orbit — the camera is a picture, so
        that is acceptable, but being stranded in somebody else's angle is not.
      */}
      {viewMoved ? (
        <button
          type="button"
          onClick={() => {
            sceneRef.current?.resetView();
            setViewMoved(false);
          }}
          className="absolute right-3 top-3 z-10 rounded-[var(--radius-control)] border border-[var(--sq-line-strong)] bg-[var(--sq-surface)]/85 px-3 py-2 text-xs font-semibold text-[var(--sq-ink-muted)] backdrop-blur transition hover:text-[var(--sq-ink)]"
        >
          Reset view
        </button>
      ) : null}

      <div ref={layerRef} className="sq-tile-layer">
        <ol>
          {TRACK.map((space) => {
            const resolved = game?.resolved.includes(space.id) ?? false;
            // `position` updates the moment the roll is applied, so during the
            // hop it names the DESTINATION. Marking that tile while the token
            // is still three spaces away reads as the ring being in the wrong
            // place, so it only appears once the token has actually arrived.
            const current = game?.position === space.index && path.length === 0;
            return (
              <li key={space.id}>
                <button
                  ref={(node) => {
                    buttonsRef.current[space.index] = node;
                  }}
                  type="button"
                  className="sq-tile-hit"
                  data-current={current}
                  onClick={() => onInspect(space.index)}
                  /* The tile's face is painted in the scene behind, so the
                     button has no text of its own to name it. Stated outright
                     rather than left to a visually-hidden child: this is the
                     only description of the space a screen-reader user gets. */
                  aria-label={
                    `Space ${space.index + 1}. ${space.title}. ` +
                    `${DISTRICTS[space.districtId].name}. ${space.summary}` +
                    (current ? ' You are here.' : '') +
                    (resolved ? ' Already played.' : '')
                  }
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
