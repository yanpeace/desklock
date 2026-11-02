import { memo, useEffect, useRef } from "react";
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import { Lock } from "lucide-react";
import { AppGlyph } from "./AppGlyph";
import type { AppIcon } from "./data";
import { GLYPH, type Target } from "./scene";

export const SPRING = { type: "spring", stiffness: 240, damping: 25, mass: 0.9 } as const;
export const GHOST_EASE = { type: "tween", duration: 0.75, ease: [0.65, 0, 0.35, 1] } as const;

export interface DragApi {
  /** current world->screen scale, read lazily during drags */
  scale: () => number;
  start: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  drop: (id: string, x: number, y: number) => void;
}

interface Props {
  icon: AppIcon;
  t: Target;
  delay: number;
  v: number;
  reduced: boolean;
  ghost: { dx: number; dy: number } | null;
  pulse: number;
  isTarget: boolean;
  lifted: boolean;
  api: DragApi;
}

export const DesktopIcon = memo(function DesktopIcon({ icon, t, delay, v, reduced, ghost, pulse, isTarget, lifted, api }: Props) {
  const x = useMotionValue(t.x);
  const y = useMotionValue(t.y);
  const s = useMotionValue(t.s);
  const dragging = useRef(false);
  const anims = useRef<AnimationPlaybackControls[]>([]);

  const tx = t.x + (ghost?.dx ?? 0);
  const ty = t.y + (ghost?.dy ?? 0);

  useEffect(() => {
    if (dragging.current) return;
    anims.current.forEach((a) => a.stop());
    const tr = reduced ? { duration: 0 } : ghost !== null ? GHOST_EASE : { ...SPRING, delay };
    anims.current = [animate(x, tx, tr), animate(y, ty, tr), animate(s, t.s, reduced ? { duration: 0 } : { ...SPRING, delay })];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx, ty, t.s, v, reduced]);

  const drag = useRef<{ px: number; py: number; x0: number; y0: number; on: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || t.hidden) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x0: x.get(), y0: y.get(), on: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const k = api.scale() || 1;
    const dx = (e.clientX - d.px) / k;
    const dy = (e.clientY - d.py) / k;
    if (!d.on) {
      if (Math.hypot(e.clientX - d.px, e.clientY - d.py) < 4) return;
      d.on = true;
      dragging.current = true;
      anims.current.forEach((a) => a.stop());
      // pick it up: from a mini slot it grows back to full size under the finger
      const grow = reduced ? { duration: 0 } : { ...SPRING, delay: 0 };
      anims.current = [animate(s, 1, grow)];
      if (t.s < 1) {
        d.x0 = d.x0 + (GLYPH * t.s) / 2 - GLYPH / 2;
        d.y0 = d.y0 + (GLYPH * t.s) / 2 - GLYPH / 2;
      }
      api.start(icon.id);
    }
    x.set(d.x0 + dx);
    y.set(d.y0 + dy);
    api.move(icon.id, x.get(), y.get());
  };
  const end = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.on) return;
    dragging.current = false;
    api.drop(icon.id, x.get(), y.get());
  };

  return (
    <motion.div
      className="group absolute left-0 top-0 select-none"
      style={{
        x,
        y,
        scale: s,
        originX: 0,
        originY: 0,
        width: GLYPH,
        height: GLYPH,
        zIndex: lifted ? 60 : ghost ? 55 : t.z,
        touchAction: "none",
        cursor: t.hidden ? "default" : lifted ? "grabbing" : "grab",
        pointerEvents: t.hidden || t.s < 1 ? "none" : "auto",
        willChange: "transform",
      }}
      animate={{ opacity: t.hidden ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : 0.25, delay: t.hidden || reduced ? 0 : delay * 0.6 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      data-icon={icon.id}
    >
      {/* Windows-like hover selection */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-[16px] -bottom-[24px] -top-[6px] rounded-[8px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ background: "rgb(255 255 255 / 0.09)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.12)" }}
      />
      <motion.div
        key={pulse}
        animate={
          pulse > 0 && !reduced
            ? { rotate: [0, -9, 7, -4, 2, 0], scale: isTarget ? 1.12 : 1 }
            : { rotate: 0, scale: isTarget ? 1.12 : 1 }
        }
        transition={{ duration: 0.5, ease: "easeOut", scale: SPRING }}
        style={{ filter: lifted ? "drop-shadow(0 10px 14px rgb(0 0 0 / 0.55))" : undefined }}
      >
        <AppGlyph icon={icon} />
      </motion.div>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-[48px] w-[84px] -translate-x-1/2 truncate text-center text-[10.5px] font-medium leading-tight text-white"
        style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.9), 0 0 6px rgb(0 0 0 / 0.5)" }}
        animate={{ opacity: t.label ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.2, delay: t.label && !reduced ? delay + 0.15 : 0 }}
      >
        {icon.label}
      </motion.span>
      {pulse > 0 && (
        <motion.span
          key={`lock-${pulse}`}
          aria-hidden
          className="pointer-events-none absolute -right-[9px] -top-[9px] grid h-[22px] w-[22px] place-items-center rounded-full"
          style={{ background: "var(--g-amber)", boxShadow: "0 2px 8px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.4)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 1, 1, 0.6], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: reduced ? 0.01 : 1.6, times: [0, 0.12, 0.22, 0.85, 1] }}
        >
          <Lock size={12} strokeWidth={2.6} color="#2a1600" />
        </motion.span>
      )}
    </motion.div>
  );
});
