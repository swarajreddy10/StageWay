"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import * as THREE from "three";

/* ── Monochrome Stage Scene ─────────────────────────────────────
   Pure white/silver lighting — no neon colors.
   Three animated white spotlights sweep the stage floor.
   Silver particles float upward.
──────────────────────────────────────────────────────────────── */

function AnimatedSpot({
  position,
  targetBase,
  intensity,
  speed,
  offset,
}: {
  position: [number, number, number];
  targetBase: [number, number, number];
  intensity: number;
  speed: number;
  offset: number;
}) {
  const lightRef  = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    if (targetRef.current) {
      targetRef.current.position.x = targetBase[0] + Math.sin(t) * 2.0;
      targetRef.current.position.z = targetBase[2] + Math.cos(t * 0.65) * 1.4;
      targetRef.current.updateMatrixWorld();
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity + Math.sin(t * 1.2) * (intensity * 0.1);
      if (lightRef.current.target !== targetRef.current && targetRef.current) {
        lightRef.current.target = targetRef.current;
      }
    }
  });

  return (
    <>
      <object3D ref={targetRef} position={targetBase} />
      <spotLight
        ref={lightRef}
        position={position}
        angle={0.30}
        penumbra={0.80}
        intensity={intensity}
        color="#ffffff"
        castShadow={false}
        distance={22}
        decay={1.8}
      />
    </>
  );
}

function makeParticleData(count: number) {
  const px  = new Float32Array(count);
  const py  = new Float32Array(count);
  const pz  = new Float32Array(count);
  const spd = new Float32Array(count);
  const phi = new Float32Array(count);
  const sz  = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    px[i]  = (Math.random() - 0.5) * 18;
    py[i]  = Math.random() * 10 - 1.5;
    pz[i]  = (Math.random() - 0.5) * 13;
    spd[i] = 0.04 + Math.random() * 0.07;
    phi[i] = Math.random() * Math.PI * 2;
    sz[i]  = 0.010 + Math.random() * 0.010;
  }
  return { px, py, pz, spd, phi, sz };
}

function SilverParticles({ count }: { count: number }) {
  const mesh  = useRef<THREE.InstancedMesh>(null!);
  const dummy = useRef(new THREE.Object3D());

  const data = useRef<ReturnType<typeof makeParticleData>>(null!);
  if (!data.current) data.current = makeParticleData(count);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const d = data.current;
    for (let i = 0; i < count; i++) {
      const y = d.py[i] + t * d.spd[i];
      const wrapY = ((y + 1.5) % 11.5) - 1.5;
      dummy.current.position.set(
        d.px[i] + Math.sin(t * 0.25 + d.phi[i]) * 0.4,
        wrapY,
        d.pz[i] + Math.cos(t * 0.18 + d.phi[i]) * 0.3,
      );
      dummy.current.scale.setScalar(d.sz[i]);
      dummy.current.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.current.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#e8e8e8" transparent opacity={0.45} />
    </instancedMesh>
  );
}

export default function StageScene({ mobile = false }: { mobile?: boolean }) {
  const particleCount = mobile ? 55 : 130;

  return (
    <>
      <fogExp2 attach="fog" args={["#000000", 0.055]} />
      <ambientLight intensity={0.04} color="#ffffff" />

      {/* Left key spot */}
      <AnimatedSpot
        position={[-5, 8, 3]}
        targetBase={[-1, 0, 0]}
        intensity={70}
        speed={0.20}
        offset={0}
      />

      {/* Center overhead spot */}
      <AnimatedSpot
        position={[0, 10, 1]}
        targetBase={[0, 0, 0.5]}
        intensity={85}
        speed={0.15}
        offset={Math.PI / 2}
      />

      {/* Right spot */}
      <AnimatedSpot
        position={[5, 8, 3]}
        targetBase={[1, 0, 0]}
        intensity={65}
        speed={0.18}
        offset={Math.PI}
      />

      {/* Subtle back rim point lights */}
      <pointLight color="#ffffff" position={[-7, 2.5, -7]} intensity={3} distance={12} decay={2} />
      <pointLight color="#ffffff" position={[7, 2.5, -7]}  intensity={3} distance={12} decay={2} />

      {/* Stage floor */}
      <Plane
        args={[40, 30]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.5, -2]}
        receiveShadow={false}
      >
        <meshStandardMaterial
          color="#060606"
          metalness={0.55}
          roughness={0.38}
        />
      </Plane>

      {/* Stage edge trim — thin white line */}
      <mesh position={[0, -2.42, 3]}>
        <boxGeometry args={[22, 0.05, 0.28]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.04} />
      </mesh>

      <SilverParticles count={particleCount} />
    </>
  );
}
