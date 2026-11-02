import { useEffect, useRef } from "react";
import "../sections/hero.css";

/**
 * Full-page ambient background, mounted ONCE by App (position: fixed, behind everything).
 *
 * Layers (all CSS, GPU-composited; no per-frame painting):
 *  1. aurora   - three very soft radial "lights" (amber, warm, faint blue) drifting on long loops
 *  2. grid     - faint dotted grid, slight parallax with the cursor
 *  3. spotlight- a brighter copy of the grid revealed only around the cursor (radial mask)
 *  4. grain    - static film grain so the gradients never band
 *  5. vignette - darkens the edges, keeps the centre luminous
 *
 * The only JS is a tiny rAF loop that eases the cursor position into CSS variables; it runs
 * only while the pointer is still settling, never on touch devices, and stops when the tab
 * is hidden. Under prefers-reduced-motion everything is static.
 */
export function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Freeze the drifting lights while the tab is hidden.
    const onPause = () => (el.dataset.paused = String(document.hidden));
    document.addEventListener("visibilitychange", onPause);
    return () => document.removeEventListener("visibilitychange", onPause);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !finePointer) return;

    // target / current, in viewport fractions (0..1)
    let tx = 0.5, ty = 0.32, cx = tx, cy = ty;
    let raf = 0;

    const apply = () => {
      el.style.setProperty("--mx", `${(cx * 100).toFixed(2)}%`);
      el.style.setProperty("--my", `${(cy * 100).toFixed(2)}%`);
      // parallax offset in px, centred on 0
      el.style.setProperty("--px", `${((cx - 0.5) * -18).toFixed(2)}px`);
      el.style.setProperty("--py", `${((cy - 0.5) * -12).toFixed(2)}px`);
    };

    const tick = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      apply();
      if (Math.abs(tx - cx) > 0.0004 || Math.abs(ty - cy) > 0.0004) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const kick = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      el.dataset.active = "true";
      kick();
    };
    const onLeave = () => {
      el.dataset.active = "false";
    };
    const onVis = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={ref} className="dl-bg" aria-hidden="true">
      <div className="dl-bg__aurora">
        <span className="dl-bg__light dl-bg__light--a" />
        <span className="dl-bg__light dl-bg__light--b" />
        <span className="dl-bg__light dl-bg__light--c" />
      </div>
      <div className="dl-bg__grid" />
      <div className="dl-bg__spot" />
      <div className="dl-bg__grain" />
      <div className="dl-bg__vignette" />
    </div>
  );
}

export default AnimatedBackground;
