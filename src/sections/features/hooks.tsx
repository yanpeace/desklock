import clsx from "clsx";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** True while the element is (nearly) on screen. Used to pause looping illustrations off-screen. */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = "80px 0px") {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setOn(true);
    const o = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin });
    o.observe(el);
    return () => o.disconnect();
  }, [ref, rootMargin]);
  return on;
}

export function usePrefersReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setR(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return r;
}

/**
 * Renders a fixed-size scene (w x h design pixels) scaled down to the available width,
 * so the little illustrations keep exact proportions from phone to desktop.
 */
export function Fit({ w, h, max = 1, className, children }: { w: number; h: number; max?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = (width: number) => setS(Math.min(max, width / w));
    measure(el.clientWidth);
    const ro = new ResizeObserver(([e]) => measure(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, max]);
  return (
    <div ref={ref} className={clsx("relative w-full", className)} style={{ height: h * s }}>
      <div
        className="absolute left-1/2 top-0"
        style={{ width: w, height: h, transform: `translateX(-50%) scale(${s})`, transformOrigin: "top center" }}
      >
        {children}
      </div>
    </div>
  );
}
