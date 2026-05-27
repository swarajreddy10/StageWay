"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CheckInEffectProps = {
  active: boolean;
  success: boolean;
};

export default function CheckInEffect({ active, success }: CheckInEffectProps) {
  const meshRef = useRef<THREE.Points>(null);
  const startTime = useRef<number | null>(null);

  const count = 60;
  // useState initializer runs outside render — safe for initial typed arrays
  const [initialPositions] = useState(() => new Float32Array(count * 3));
  const positions = useRef(initialPositions);
  const velocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    if (active) {
      startTime.current = null;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.08 + 0.03;
        positions.current[i * 3]     = 0;
        positions.current[i * 3 + 1] = 0;
        positions.current[i * 3 + 2] = 0;
        velocities.current[i * 3]     = Math.cos(angle) * speed;
        velocities.current[i * 3 + 1] = Math.sin(angle) * speed + 0.04;
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      }
    }
  }, [active]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;
    if (startTime.current === null) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    const mat = meshRef.current.material as THREE.PointsMaterial;

    mat.opacity = Math.max(0, 1 - elapsed * 1.5);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities.current[i * 3];
      pos[i * 3 + 1] += velocities.current[i * 3 + 1];
      pos[i * 3 + 2] += velocities.current[i * 3 + 2];
      velocities.current[i * 3 + 1] -= 0.002; // gravity
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={success ? "#10b981" : "#ef4444"}
        size={0.06}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
