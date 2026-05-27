"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("sw_loaded");
    if (!seen) {
      sessionStorage.setItem("sw_loaded", "1");
      setVisible(true);
      const t = setTimeout(() => setOpen(true), 950);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.85 }}
          onAnimationComplete={(def) => {
            if ((def as Record<string, unknown>).opacity === 0) setVisible(false);
          }}
        >
          {/* Left curtain */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{ background: "linear-gradient(to right, #060810, #0a0c16)" }}
            animate={open ? { x: "-101%" } : { x: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Right curtain */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{ background: "linear-gradient(to left, #060810, #0a0c16)" }}
            animate={open ? { x: "101%" } : { x: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Spotlight beam — appears as curtains open */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={open ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "radial-gradient(ellipse 40% 80% at 50% 100%, rgba(124,90,245,0.45) 0%, transparent 70%)",
            }}
          />

          {/* Center wordmark */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 select-none"
            animate={open ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.94 }}
            transition={open
              ? { duration: 0.35, ease: "easeIn" }
              : { duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <div className="relative flex flex-col items-center gap-5">
              {/* Ambient glow behind wordmark */}
              <div
                className="absolute -inset-16 rounded-full opacity-30"
                style={{
                  background: "radial-gradient(circle, rgba(124,90,245,0.6) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />

              {/* Wordmark */}
              <motion.span
                className="relative font-display text-4xl sm:text-5xl font-bold tracking-[0.22em] text-white uppercase"
                initial={{ letterSpacing: "0.35em", opacity: 0 }}
                animate={{ letterSpacing: "0.22em", opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                STAGEWAY
              </motion.span>

              {/* Animated underline */}
              <motion.div
                className="h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(124,90,245,0.8), transparent)" }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 72, opacity: 1 }}
                transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
              />

              <motion.p
                className="text-[9px] tracking-[0.6em] text-white/30 uppercase font-mono"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                Events Platform
              </motion.p>
            </div>
          </motion.div>

          {/* Center seam */}
          <motion.div
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
            style={{ background: "rgba(124,90,245,0.15)" }}
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
