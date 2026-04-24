"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "580px" }}>

      {/* Background image with subtle scale animation */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="https://picsum.photos/seed/bedouin-desert-night/1440/580"
          alt=""
          fill
          className="object-cover object-center"
          priority
          aria-hidden="true"
        />
      </motion.div>

      {/* Multi-layer gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(10,5,0,0.42) 0%, rgba(8,3,0,0.15) 30%, rgba(8,3,0,0.55) 75%, rgba(12,5,0,0.92) 100%)",
            "linear-gradient(to right, rgba(26,14,2,0.30) 0%, transparent 40%)",
          ].join(", "),
        }}
        aria-hidden="true"
      />

      {/* Warm color wash for brand depth */}
      <div
        className="absolute inset-0 mix-blend-multiply opacity-30"
        style={{ background: "linear-gradient(135deg, #461e00 0%, transparent 60%)" }}
        aria-hidden="true"
      />

      {/* Floating decorative orbs – abstract desert dunes feel */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,154,79,0.12) 0%, transparent 70%)",
          top: "-140px",
          right: "5%",
        }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(177,122,80,0.10) 0%, transparent 70%)",
          bottom: "80px",
          left: "8%",
        }}
        animate={{ y: [0, 14, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden="true"
      />

      {/* Subtle horizontal light streak */}
      <div
        className="absolute pointer-events-none"
        style={{
          height: "1px",
          left: 0,
          right: 0,
          top: "38%",
          background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.20) 30%, rgba(196,154,79,0.35) 50%, rgba(196,154,79,0.20) 70%, transparent 100%)",
          opacity: 0.7,
        }}
        aria-hidden="true"
      />

      {/* Hero text content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-28">

        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex items-center gap-2.5 mb-5"
        >
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c49a4f]" />
          <span
            className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.22em]"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            Saudi Arabia's Finest Escapes
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c49a4f]" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
          className="font-display font-extrabold text-white leading-[1.08] mb-4"
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)",
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            letterSpacing: "-0.02em",
          }}
        >
          Your Bedouin{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #c49a4f 0%, #f0c84a 45%, #c49a4f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Starts Here
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.56 }}
          className="text-white/75 leading-relaxed max-w-sm"
          style={{
            fontSize: "clamp(1rem, 1.7vw, 1.15rem)",
            textShadow: "0 1px 12px rgba(0,0,0,0.35)",
          }}
        >
          Find unique stays across farms, villas, and desert retreats.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <span className="text-white/40 text-[10px] font-medium uppercase tracking-[0.18em]">
            Scroll to explore
          </span>
          <motion.div
            className="w-5 h-8 rounded-full border border-white/25 flex items-start justify-center pt-1.5"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1.5 bg-white/60 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
