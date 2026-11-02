import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppGlyph } from "./AppGlyph";
import { ICONS, ICON_BY_ID } from "./data";
import { DesktopIcon, GHOST_EASE, SPRING, type DragApi } from "./DesktopIcon";
import {
  BEZEL,
  GLYPH,
  MON2_X,
  SCREEN_H,
  SCREEN_W,
  STAND_H,
  TASKBAR_H,
  panelRect,
  targetFor,
  tileRect,
  type DropHit,
  type FolderT,
  type Scene,
} from "./scene";

export interface Ghost {
  x: number;
  y: number;
  show: boolean;
  press: boolean;
}

interface Props {
  scene: Scene;
  open: string | null;
  reduced: boolean;
  dragId: string | null;
  hit: DropHit;
  ghost: Ghost;
  ghostDrag: { id: string; dx: number; dy: number } | null;
  pulses: Record<string, number>;
  api: Omit<DragApi, "scale">;
  onOpen: (f: string) => void;
  onClose: () => void;
  onInteract: () => void;
  children?: ReactNode;
}

const WORLD_H = SCREEN_H + BEZEL * 2 + STAND_H;
const W1 = SCREEN_W + BEZEL * 2;
const W2 = MON2_X + SCREEN_W + BEZEL * 2;
export const PREVIEW_ASPECT = `${W1} / ${WORLD_H}`;

export function DesktopPreview(props: Props) {
  const { scene, open, reduced, dragId, hit, ghost, ghostDrag, pulses, api, onOpen, onClose, onInteract, children } =
    props;
  const box = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setCw(el.clientWidth);
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ww = scene.monitors === 2 ? W2 : W1;
  const k = cw ? cw / ww : 0;
  const ch = cw * (WORLD_H / W1);
  const oy = (ch - WORLD_H * k) / 2;
  const scaleRef = useRef(k);
  scaleRef.current = k;

  const dragApi = useRef<DragApi>({ ...api, scale: () => scaleRef.current });
  dragApi.current.start = api.start;
  dragApi.current.move = api.move;
  dragApi.current.drop = api.drop;
  const stableApi = useRef<DragApi>({
    scale: () => scaleRef.current,
    start: (id) => dragApi.current.start(id),
    move: (id, x, y) => dragApi.current.move(id, x, y),
    drop: (id, x, y) => dragApi.current.drop(id, x, y),
  }).current;

  const openFolder = scene.folders.find((f) => f.id === open) ?? null;
  const formingAt =
    hit?.kind === "icon" && scene.places[hit.id]?.kind === "free"
      ? (scene.places[hit.id] as { x: number; y: number })
      : null;

  return (
    <div
      ref={box}
      className="relative w-full select-none"
      style={{ aspectRatio: PREVIEW_ASPECT }}
      onPointerDown={onInteract}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ contain: "layout paint" }}>
      {cw > 0 && (
        <motion.div
          className="absolute left-0 top-0"
          style={{ width: W2, height: WORLD_H, originX: 0, originY: 0 }}
          initial={false}
          animate={{ scale: k, y: oy }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
        >
          {/* desk plane: screen 1 origin */}
          <div className="absolute" style={{ left: BEZEL, top: BEZEL, width: W2, height: SCREEN_H }}>
            <Monitor x={0} variant={0} />
            <AnimatePresence initial={false}>
              {scene.monitors === 2 && (
                <motion.div
                  key="m2"
                  className="absolute left-0 top-0"
                  initial={{ opacity: 0, x: 220 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 220 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
                >
                  <Monitor x={MON2_X} variant={1} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* clip content to the screens (taskbars sit above) */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
              <AnimatePresence initial={false}>
                {scene.blocks.map((b) => (
                  <motion.div
                    key={b.id}
                    className="absolute left-0 top-0 overflow-hidden"
                    style={{
                      width: b.w,
                      height: b.h,
                      borderRadius: 16,
                      background: "rgb(255 255 255 / 0.045)",
                      border: "1px solid rgb(255 255 255 / 0.11)",
                      boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.08)",
                      zIndex: 5,
                    }}
                    initial={{ opacity: 0, scale: 0.94, x: b.x, y: b.y }}
                    animate={{ opacity: 1, scale: 1, x: b.x, y: b.y }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: reduced ? 0 : 0.22 } }}
                    transition={reduced ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.35, delay: 0.05 } }}
                  >
                    <div
                      className="flex h-[30px] items-center justify-between px-3 text-[12px] font-semibold tracking-wide text-white/90"
                      style={{
                        background: "linear-gradient(180deg, rgb(255 255 255 / 0.13), rgb(255 255 255 / 0.06))",
                        borderBottom: "1px solid rgb(255 255 255 / 0.1)",
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--c-amber)" }} />
                        {b.name}
                      </span>
                      <span className="text-[11px] font-medium text-white/50">6</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* forming-folder hint when hovering an icon with another one */}
              <AnimatePresence>
                {formingAt && (
                  <motion.div
                    key="forming"
                    className="pointer-events-none absolute left-0 top-0"
                    style={{
                      width: 60,
                      height: 60,
                      x: tileRect(formingAt).x,
                      y: tileRect(formingAt).y,
                      borderRadius: 16,
                      background: "rgb(255 255 255 / 0.16)",
                      border: "1px solid rgb(240 160 75 / 0.6)",
                      boxShadow: "0 0 24px -4px rgb(240 160 75 / 0.6)",
                      zIndex: 9,
                    }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1.08 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {scene.folders.map((f) => (
                  <FolderTile
                    key={f.id}
                    f={f}
                    reduced={reduced}
                    isOpen={open === f.id}
                    isTarget={hit?.kind === "folder" && hit.f === f.id}
                    onOpen={onOpen}
                  />
                ))}
              </AnimatePresence>

              {/* open folder: frosted backdrop + glass panel */}
              <AnimatePresence>
                {openFolder && (
                  <motion.div
                    key="backdrop"
                    className="absolute left-0 top-0"
                    style={{
                      width: scene.monitors === 2 ? MON2_X + SCREEN_W : SCREEN_W,
                      height: SCREEN_H - TASKBAR_H,
                      zIndex: 30,
                      background:
                        "radial-gradient(60% 70% at 50% 45%, rgb(10 11 14 / 0.45), rgb(10 11 14 / 0.72))",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.28 }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onInteract();
                      onClose();
                    }}
                  />
                )}
                {openFolder && <FolderPanel key={`panel-${openFolder.id}`} f={openFolder} reduced={reduced} />}
              </AnimatePresence>

              {ICONS.map((ic) => {
                const t = targetFor(scene, ic.id, open);
                return (
                  <DesktopIcon
                    key={ic.id}
                    icon={ic}
                    t={t}
                    delay={scene.delays[ic.id] ?? 0}
                    v={scene.v}
                    reduced={reduced}
                    ghost={ghostDrag?.id === ic.id ? ghostDrag : null}
                    pulse={pulses[ic.id] ?? 0}
                    isTarget={hit?.kind === "icon" && hit.id === ic.id}
                    lifted={dragId === ic.id}
                    api={stableApi}
                  />
                );
              })}

              <GhostCursor g={ghost} reduced={reduced} />
            </div>
          </div>
        </motion.div>
      )}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------ monitor ------------------------------ */

const WALLS = [
  `radial-gradient(60% 70% at 18% 22%, rgb(240 160 75 / 0.30), transparent 62%),
   radial-gradient(55% 60% at 85% 85%, rgb(90 184 230 / 0.26), transparent 60%),
   radial-gradient(40% 45% at 70% 18%, rgb(224 69 123 / 0.14), transparent 65%),
   linear-gradient(160deg, #22232b 0%, #16171c 55%, #101116 100%)`,
  `radial-gradient(55% 65% at 80% 20%, rgb(224 69 123 / 0.30), transparent 62%),
   radial-gradient(60% 60% at 15% 85%, rgb(90 184 230 / 0.22), transparent 60%),
   linear-gradient(200deg, #23202a 0%, #15151b 60%, #0f1015 100%)`,
];

const Monitor = memo(function Monitor({ x, variant }: { x: number; variant: 0 | 1 }) {
  return (
    <div className="absolute top-0" style={{ left: x, width: SCREEN_W, height: SCREEN_H + STAND_H + BEZEL }}>
      {/* stand */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: SCREEN_H + BEZEL - 4,
          width: 120,
          height: STAND_H - 6,
          background: "linear-gradient(180deg, #121317, #24252b)",
          clipPath: "polygon(22% 0, 78% 0, 88% 100%, 12% 100%)",
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: SCREEN_H + BEZEL + STAND_H - 14,
          width: 260,
          height: 10,
          borderRadius: 6,
          background: "linear-gradient(180deg, #2c2d33, #17181c)",
          boxShadow: "0 8px 18px rgb(0 0 0 / 0.6)",
        }}
      />
      {/* screen + bezel */}
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 6,
          background: WALLS[variant],
          boxShadow:
            "0 0 0 12px #0b0c0f, 0 0 0 13px rgb(255 255 255 / 0.09), 0 40px 70px -20px rgb(0 0 0 / 0.85)",
        }}
      >
        {/* soft shapes */}
        <div
          className="absolute rounded-full"
          style={{
            left: variant ? 520 : 420,
            top: variant ? 300 : 120,
            width: 360,
            height: 360,
            background: "radial-gradient(circle at 35% 35%, rgb(255 255 255 / 0.07), transparent 65%)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: variant ? 60 : 640,
            top: variant ? 60 : 300,
            width: 300,
            height: 300,
            borderRadius: "42% 58% 60% 40% / 45% 40% 60% 55%",
            border: "1px solid rgb(255 255 255 / 0.05)",
            background: "radial-gradient(circle at 60% 40%, rgb(240 160 75 / 0.08), transparent 70%)",
          }}
        />
        <Taskbar small={variant === 1} />
      </div>
    </div>
  );
});

const TASK_APPS = ["web", "discord", "code", "musica"];

function Taskbar({ small }: { small: boolean }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
      style={{
        height: TASKBAR_H,
        zIndex: 20,
        background: "rgb(22 23 28 / 0.82)",
        borderTop: "1px solid rgb(255 255 255 / 0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex items-center gap-[10px]">
        <div className="grid h-[24px] w-[24px] grid-cols-2 gap-[2px] p-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="rounded-[2px]" style={{ background: i === 0 ? "var(--c-amber)" : "rgb(255 255 255 / 0.75)" }} />
          ))}
        </div>
        {!small &&
          TASK_APPS.map((id) => (
            <div key={id} className="relative">
              <AppGlyph icon={ICON_BY_ID[id]} size={24} />
              {id === "web" && (
                <span className="absolute -bottom-[5px] left-1/2 h-[2px] w-[10px] -translate-x-1/2 rounded-full bg-white/70" />
              )}
            </div>
          ))}
      </div>
      <div className="absolute right-4 text-right text-[10px] leading-[1.2] text-white/80">
        <div className="tnum">21:47</div>
        <div className="tnum text-white/50">03/11/2026</div>
      </div>
    </div>
  );
}

/* ------------------------------ folders ------------------------------ */

function FolderTile({
  f,
  reduced,
  isOpen,
  isTarget,
  onOpen,
}: {
  f: FolderT;
  reduced: boolean;
  isOpen: boolean;
  isTarget: boolean;
  onOpen: (id: string) => void;
}) {
  const r = tileRect(f);
  return (
    <motion.button
      type="button"
      aria-label={`Apri cartella ${f.name}`}
      className="absolute left-0 top-0 cursor-pointer outline-none"
      style={{ width: r.w, height: r.h, zIndex: 11, borderRadius: 17 }}
      initial={{ opacity: 0, scale: 0.4, x: r.x, y: r.y }}
      animate={{ opacity: isOpen ? 0.35 : 1, scale: isTarget ? 1.12 : 1, x: r.x, y: r.y }}
      exit={{
        opacity: 0,
        scale: 1.5,
        transition: reduced ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      }}
      transition={reduced ? { duration: 0 } : { ...SPRING, opacity: { duration: 0.25 } }}
      whileHover={reduced ? undefined : { scale: 1.06 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => onOpen(f.id)}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: 17,
          background:
            "radial-gradient(90% 90% at 15% 0%, rgb(240 160 75 / 0.22), transparent 60%), rgb(255 255 255 / 0.13)",
          border: isTarget ? "1px solid rgb(240 160 75 / 0.85)" : "1px solid rgb(255 255 255 / 0.2)",
          boxShadow: isTarget
            ? "0 0 0 3px rgb(240 160 75 / 0.25), 0 0 30px -4px rgb(240 160 75 / 0.7)"
            : "inset 0 1px 0 rgb(255 255 255 / 0.25), 0 8px 18px -8px rgb(0 0 0 / 0.7)",
          backdropFilter: "blur(10px) saturate(1.5)",
          WebkitBackdropFilter: "blur(10px) saturate(1.5)",
        }}
      />
      <span
        className="pointer-events-none absolute left-1/2 top-[64px] w-[96px] -translate-x-1/2 truncate text-center text-[10.5px] font-semibold text-white"
        style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.9)" }}
      >
        {f.name}
      </span>
    </motion.button>
  );
}

function FolderPanel({ f, reduced }: { f: FolderT; reduced: boolean }) {
  const p = panelRect(f.items.length);
  const t = tileRect(f);
  const ox = (t.x + t.w / 2 - p.x) / p.w;
  const oy = (t.y + t.h / 2 - p.y) / p.h;
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0"
      style={{
        x: p.x,
        y: p.y,
        width: p.w,
        height: p.h,
        zIndex: 35,
        originX: ox,
        originY: oy,
        borderRadius: 26,
        background:
          "radial-gradient(70% 60% at 10% 0%, rgb(240 160 75 / 0.16), transparent 60%), rgb(40 41 48 / 0.55)",
        border: "1px solid rgb(255 255 255 / 0.16)",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.2), 0 40px 80px -24px rgb(0 0 0 / 0.8)",
        backdropFilter: "blur(22px) saturate(1.5)",
        WebkitBackdropFilter: "blur(22px) saturate(1.5)",
      }}
      initial={{ opacity: 0, scale: 0.18 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.18, transition: reduced ? { duration: 0 } : { duration: 0.26, ease: [0.4, 0, 1, 1] } }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
    >
      <div className="flex items-baseline justify-between px-6 pt-4">
        <span className="text-[24px] leading-none text-white" style={{ fontFamily: "var(--font-display)" }}>
          {f.name}
        </span>
        <span className="text-[11px] font-medium text-white/50">{f.items.length} elementi</span>
      </div>
    </motion.div>
  );
}

/* ------------------------------ ghost cursor ------------------------------ */

function GhostCursor({ g, reduced }: { g: Ghost; reduced: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={{ zIndex: 70 }}
      initial={false}
      animate={{ x: g.x, y: g.y, opacity: g.show && !reduced ? 1 : 0, scale: g.press ? 0.86 : 1 }}
      transition={reduced ? { duration: 0 } : { ...GHOST_EASE, opacity: { duration: 0.25 }, scale: { duration: 0.12 } }}
    >
      <svg width="26" height="30" viewBox="0 0 26 30" style={{ filter: "drop-shadow(0 3px 4px rgb(0 0 0 / 0.6))" }}>
        <path d="M3 2 L3 24 L9 18.5 L13 27.5 L17 25.8 L13 17 L21 17 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {g.press && (
        <motion.span
          className="absolute -left-[10px] -top-[10px] h-[24px] w-[24px] rounded-full"
          style={{ border: "2px solid var(--c-amber)" }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}

export const glyphCenter = (x: number, y: number) => ({ x: x + GLYPH / 2, y: y + GLYPH / 2 });
