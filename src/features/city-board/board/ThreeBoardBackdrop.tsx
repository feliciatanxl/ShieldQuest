import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CityDistrictId } from '../../../../types/city-board';

const DISTRICT_COLOURS: Record<CityDistrictId, number> = {
  school: 0xf59e0b,
  retail: 0xe11d48,
  digital: 0x3b82f6,
  community: 0x14b8a6,
};

function canUseEnhancedScene(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.WebGL2RenderingContext) return false;

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData && (navigator.hardwareConcurrency ?? 4) > 2;
}

/**
 * A deliberately small, procedural Three.js layer behind the accessible DOM board.
 * Gameplay, labels and focus remain in CityTrack; this scene is progressive enhancement only.
 */
export default function ThreeBoardBackdrop({
  districtId,
  active,
}: {
  districtId: CityDistrictId;
  active: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !canUseEnhancedScene()) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'h-full w-full';
    renderer.domElement.dataset.testid = 'three-board-atmosphere';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061527, 0.055);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    camera.position.set(0, 10.5, 17);
    camera.lookAt(0, 0.3, 0);

    const world = new THREE.Group();
    world.rotation.y = -0.12;
    scene.add(world);

    scene.add(new THREE.HemisphereLight(0x9ac7ff, 0x061527, 1.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-4, 10, 8);
    scene.add(keyLight);

    const accent = DISTRICT_COLOURS[districtId];
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x12385f,
      emissive: accent,
      emissiveIntensity: 0.08,
      roughness: 0.72,
      metalness: 0.18,
    });
    const buildings = new THREE.InstancedMesh(buildingGeometry, buildingMaterial, 36);
    const dummy = new THREE.Object3D();

    for (let index = 0; index < 36; index += 1) {
      const side = index % 4;
      const lane = Math.floor(index / 4);
      const offset = -8 + lane * 2;
      const depth = 6.5 + (index % 3) * 0.75;
      const height = 1.1 + ((index * 7) % 9) * 0.22;
      const width = 0.58 + (index % 4) * 0.11;

      if (side === 0) dummy.position.set(offset, height / 2 - 1.2, -depth);
      if (side === 1) dummy.position.set(depth, height / 2 - 1.2, offset);
      if (side === 2) dummy.position.set(offset, height / 2 - 1.2, depth);
      if (side === 3) dummy.position.set(-depth, height / 2 - 1.2, offset);
      dummy.scale.set(width, height, width);
      dummy.updateMatrix();
      buildings.setMatrixAt(index, dummy.matrix);
    }
    buildings.instanceMatrix.needsUpdate = true;
    world.add(buildings);

    const grid = new THREE.GridHelper(22, 22, accent, 0x12385f);
    grid.position.y = -1.2;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.22;
    });
    world.add(grid);

    const beacon = new THREE.Group();
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.72, 48), ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.05;
    beacon.add(ring);

    const coreMaterial = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 1.15,
      roughness: 0.35,
    });
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), coreMaterial);
    core.position.y = 1.1;
    beacon.add(core);
    world.add(beacon);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const clock = new THREE.Clock();
    let lastRender = 0;
    renderer.setAnimationLoop(() => {
      if (document.hidden) return;
      const elapsed = clock.getElapsedTime();
      if (elapsed - lastRender < 1 / 30) return;
      lastRender = elapsed;
      core.rotation.y = elapsed * (active ? 1.35 : 0.45);
      core.position.y = 1.1 + Math.sin(elapsed * 1.2) * 0.12;
      ringMaterial.opacity = 0.34 + Math.sin(elapsed * 1.35) * 0.08;
      world.rotation.y = -0.12 + Math.sin(elapsed * 0.18) * 0.025;
      renderer.render(scene, camera);
    });

    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      buildingGeometry.dispose();
      buildingMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      core.geometry.dispose();
      coreMaterial.dispose();
      grid.geometry.dispose();
      gridMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [active, districtId]);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-80"
      aria-hidden="true"
    />
  );
}
