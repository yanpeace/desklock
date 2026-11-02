import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import "../sections/hero.css";

type BorderBeamProps = {
  children: ReactNode;
  /** Corner radius in px. Clamped to half the height, so 999 = pill. */
  radius?: number;
  /** Seconds per lap. */
  duration?: number;
  /** Start offset along the perimeter, 0..1 (desync several beams). */
  offset?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Wraps any element and sends a slow comet of light around its rounded border.
 *
 * Implementation: an SVG <rect> that exactly traces the border, normalised with
 * pathLength=100, so the comet travels at constant speed along the perimeter (a rotating
 * conic gradient would rush along the short sides of a wide button). The tail is several
 * stacked dashes of decreasing length / increasing opacity whose heads stay aligned, plus a
 * blurred copy for the glow. Reduced motion -> a still, faint amber ring.
 */
export function BorderBeam({ children, radius = 999, duration = 7, offset = 0, className, style }: BorderBeamProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Tail segments: [length in % of the perimeter, opacity]. Heads coincide.
  // Many thin, equally faint layers stack into a smooth fade (no visible steps).
  const tail: Array<[number, number]> = [
    [38, 0.13],
    [30, 0.14],
    [23, 0.15],
    [17, 0.17],
    [12, 0.2],
    [8, 0.24],
    [4.5, 0.3],
  ];

  const beam = (glow: boolean) => {
    if (!box) return null;
    const pad = glow ? 8 : 0; // room for the blur
    const r = Math.min(radius, box.h / 2, box.w / 2);
    const rect = {
      x: pad + 0.75,
      y: pad + 0.75,
      width: Math.max(0, box.w - 1.5),
      height: Math.max(0, box.h - 1.5),
      rx: Math.max(0, r - 0.75),
      pathLength: 100,
      fill: "none",
    };
    return (
      <svg
        className={clsx("dl-beam__svg", glow && "dl-beam__svg--glow")}
        width={box.w + pad * 2}
        height={box.h + pad * 2}
        style={{ left: -pad, top: -pad }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="dl-beam-head" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4e2" />
            <stop offset="100%" stopColor="#f6b868" />
          </linearGradient>
        </defs>
        {/* static hairline ring */}
        {!glow && <rect {...rect} className="dl-beam__ring" />}
        <g className="dl-beam__comet">
          {tail.map(([len, op]) => (
            <rect
              key={len}
              {...rect}
              className="dl-beam__dash"
              // "0 gap dash": the visible dash spans [100-len, 100], so its head sits on 0
              strokeDasharray={`0 ${100 - len} ${len} 0`}
              style={{ opacity: op }}
            />
          ))}
          {/* white-hot head */}
          <rect
            {...rect}
            className="dl-beam__dash dl-beam__dash--head"
            strokeDasharray="0 98.6 1.4 0"
          />
        </g>
      </svg>
    );
  };

  return (
    <span
      ref={ref}
      className={clsx("dl-beam", className)}
      style={
        {
          ...style,
          borderRadius: radius,
          "--beam-dur": `${duration}s`,
          "--beam-delay": `${-offset * duration}s`,
        } as CSSProperties
      }
    >
      {beam(true)}
      {children}
      {beam(false)}
    </span>
  );
}

export default BorderBeam;
