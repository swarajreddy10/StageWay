"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type FloatingCardProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
};

export default function FloatingCard({
  children,
  className = "",
  intensity = 12,
  glowColor = "rgba(168,85,247,0.2)",
}: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-intensity, intensity]), springConfig);
  const glowXBase = useTransform(rawX, [-0.5, 0.5], [0, 100]);
  const glowYBase = useTransform(rawY, [-0.5, 0.5], [0, 100]);
  const glowX     = useSpring(glowXBase, springConfig);
  const glowY     = useSpring(glowYBase, springConfig);
  // Always compute gradient transform so hooks are never conditional
  const shineGradient = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${glowColor} 0%, transparent 60%)`
  );

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - left) / width - 0.5);
    rawY.set((e.clientY - top) / height - 0.5);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      {/* Shine overlay — always rendered, opacity driven by isHovered */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        style={{ background: shineGradient, opacity: isHovered ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      />
      <div style={{ transform: "translateZ(4px)" }}>{children}</div>
    </motion.div>
  );
}
