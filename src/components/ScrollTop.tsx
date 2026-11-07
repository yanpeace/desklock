import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Oltre questa distanza dall'alto (px) compare il pulsante. */
const SHOW_AFTER = 640;

/** Pulsante di vetro "Torna su": compare scendendo, l'anello ambra segue la lettura della pagina. */
export function ScrollTop() {
  const reduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > SHOW_AFTER));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Torna su"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
          className="dl-top glass"
          initial={{ opacity: 0, y: 28, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.85, transition: { duration: 0.18 } }}
          whileHover={reduced ? undefined : { y: -3, scale: 1.04 }}
          whileTap={reduced ? undefined : { scale: 0.93 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          <span className="dl-top__icon">
            <svg className="dl-top__ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="16.5" pathLength={1} className="dl-top__track" />
              <motion.circle cx="18" cy="18" r="16.5" pathLength={1} className="dl-top__bar" style={{ pathLength: progress }} />
            </svg>
            <ArrowUp className="dl-top__arrow" size={17} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="dl-top__label">Torna su</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
