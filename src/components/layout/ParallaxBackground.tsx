import { motion, useScroll, useTransform } from "motion/react";

const DOCUMENT_IMAGE =
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1600";

export function ParallaxBackground() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,181,216,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(26,54,93,0.6),_transparent_55%)]" />
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 opacity-[0.18]"
      >
        <img
          src={DOCUMENT_IMAGE}
          alt="Legacy document background"
          className="w-full h-full object-cover grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80" />
      </motion.div>
    </div>
  );
}

