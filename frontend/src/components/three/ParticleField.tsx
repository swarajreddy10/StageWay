"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ParticleFieldProps = {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
  spread?: number;
  opacity?: number;
};

export default function ParticleField({
  count = 120,
  color = "#a855f7",
  size = 0.015,
  speed = 0.08,
  spread = 12,
  opacity = 0.6,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  // useState lazy initializer runs once outside React render — safe for Math.random()
  const [{ positions, velocities }] = useState(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.4;
      vel[i * 3]     = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return { positions: pos, velocities: vel };
  });

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3] * speed;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * speed;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * speed;
      // reset particle when it drifts too far up
      if (pos[i * 3 + 1] > spread * 0.3) {
        pos[i * 3 + 1] = -spread * 0.25;
        pos[i * 3]     = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.4;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
