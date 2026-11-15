import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface KenneyPropProps {
  /** Path under public/models, e.g. "furniture/bench.glb" */
  src: string;
  /** World height the model is scaled to. */
  height: number;
  position: [number, number, number];
  rotY?: number;
  shadows?: boolean;
}

/** Static CC0 Kenney model, cloned per instance and scaled to a target height (see public/models/LICENSES.md). */
export const KenneyProp: React.FC<KenneyPropProps> = ({ src, height, position, rotY = 0, shadows = true }) => {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${src}`);
  const { object, scale, yOffset } = useMemo(() => {
    // Clone so one loaded file can be placed several times; geometry/materials stay shared.
    const o = gltf.scene.clone(true);
    o.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = shadows;
        c.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(o);
    const s = height / (box.max.y - box.min.y);
    return { object: o, scale: s, yOffset: -box.min.y * s };
  }, [gltf, height, shadows]);

  return (
    <group position={position} rotation-y={rotY}>
      <primitive object={object} scale={scale} position-y={yOffset} />
    </group>
  );
};
