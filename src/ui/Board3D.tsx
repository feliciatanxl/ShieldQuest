import { useEffect, useRef } from 'react';

import { TRACK } from '../game/board.ts';
import { DISTRICTS } from '../game/board.ts';
import { BoardScene } from '../three/BoardScene.ts';
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
  const layerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BoardScene | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

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
      onTokenArrived: () => {
        scene.pulse(useGame.getState().game?.position ?? 0);
        useGame.getState().arrive();
      },
      onDiceSettled: () => {
        const state = useGame.getState();
        scene.moveToken(state.path);
      },
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

  /* --- drive the scene from state ---------------------------------- */

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
    <div className="sq-board-stage">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />

      <div ref={layerRef} className="sq-tile-layer">
        <ol>
          {TRACK.map((space) => {
            const resolved = game?.resolved.includes(space.id) ?? false;
            const current = game?.position === space.index;
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
                >
                  {/* Visually hidden, because the tile face is drawn in the
                      scene behind. This is the accessible name for it. */}
                  <span className="sr-only">
                    {`Space ${space.index + 1}. ${space.title}. ${DISTRICTS[space.districtId].name}. ${space.summary}`}
                    {current ? ' You are here.' : ''}
                    {resolved ? ' Already played.' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
