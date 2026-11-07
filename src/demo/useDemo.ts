import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { MODES, type ModeKey } from "./modes";
import type { Ghost } from "./DesktopPreview";
import {
  GLYPH,
  GRID_PITCH_X,
  GRID_PITCH_Y,
  applyDrop,
  blocksScene,
  choreograph,
  columnsScene,
  hitTest,
  iosScene,
  messyScene,
  type DropHit,
  type Scene,
} from "./scene";

/** "Blocca" demo: Racing moves by whole grid cells. */
const RACING_DX = 4 * GRID_PITCH_X;
const RACING_DY = -2 * GRID_PITCH_Y;

interface Step {
  at: number;
  run: () => void;
}

export interface Toast {
  text: string;
  tone: "ok" | "lock" | "info";
  n: number;
}

/**
 * The demo's brain: current scene, the auto-play clock (scripted steps per mode),
 * user drags/drops and the per-mode toggles.
 */
export function useDemo(rootRef: RefObject<HTMLElement | null>) {
  const reduced = !!useReducedMotion();
  const [modeIdx, setModeIdx] = useState(0);
  const [scene, setSceneState] = useState<Scene>(messyScene);
  const [open, setOpenState] = useState<string | null>(null);
  const [folderOn, setFolderOn] = useState(false);
  const [plugged, setPlugged] = useState(false);
  const [profileN, setProfileN] = useState(0);
  const [locked, setLockedState] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [ghost, setGhost] = useState<Ghost>({ x: 720, y: 500, show: false, press: false });
  const [ghostDrag, setGhostDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [pulses, setPulses] = useState<Record<string, number>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [hit, setHitState] = useState<DropHit>(null);
  const [userControl, setUserControl] = useState(false);
  const progress = useMotionValue(0);

  const sceneRef = useRef(scene);
  const openRef = useRef(open);
  const lockedRef = useRef(locked);
  const modeRef = useRef(0);
  const userRef = useRef(false);
  const hoverRef = useRef(false);
  const visibleRef = useRef(false);
  const elapsed = useRef(0);
  const stepIdx = useRef(0);
  const steps = useRef<Step[]>([]);
  const profiles = useRef<Partial<Record<1 | 2, Scene>>>({});
  const hitKey = useRef("");
  const toastN = useRef(0);

  const setScene = useCallback((next: Scene | ((s: Scene) => Scene)) => {
    const v = typeof next === "function" ? next(sceneRef.current) : next;
    sceneRef.current = v;
    setSceneState(v);
  }, []);
  const setOpen = useCallback((f: string | null) => {
    openRef.current = f;
    setOpenState(f);
  }, []);
  const setLocked = useCallback((b: boolean) => {
    lockedRef.current = b;
    setLockedState(b);
  }, []);
  const say = useCallback((text: string, tone: Toast["tone"]) => setToast({ text, tone, n: ++toastN.current }), []);

  /* ------------------------------ actions ------------------------------ */
  const go = useCallback((next: Scene, extra = 0) => setScene((prev) => choreograph(prev, next, extra)), [setScene]);

  const plug = useCallback(
    (on: boolean) => {
      const cur = sceneRef.current;
      profiles.current[cur.monitors] = cur;
      const n = on ? 2 : 1;
      const saved = profiles.current[n] ?? blocksScene(false, n);
      setOpen(null);
      setPlugged(on);
      setProfileN((x) => x + 1);
      go({ ...saved, monitors: n }, on ? 0.32 : 0.04);
    },
    [go, setOpen],
  );

  const ghostTo = (x: number, y: number, extra: Partial<Ghost> = {}) =>
    setGhost((g) => ({ ...g, x, y, show: true, ...extra }));
  const iconCenter = (id: string) => {
    const p = sceneRef.current.places[id];
    return p?.kind === "free" ? { x: p.x + GLYPH / 2, y: p.y + GLYPH / 2 } : { x: 480, y: 280 };
  };

  const mediaFolder = () => sceneRef.current.folders.find((f) => f.id === "f-media");
  const fotoToMedia = () => {
    const p = sceneRef.current.places.foto;
    const f = mediaFolder();
    return p?.kind === "free" && f ? { dx: f.x - p.x, dy: f.y - p.y } : { dx: 0, dy: 0 };
  };

  const scriptFor = (key: ModeKey): Step[] => {
    switch (key) {
      case "ios":
        return [
          { at: 0, run: () => go(messyScene()) },
          { at: 750, run: () => go(iosScene()) },
          { at: 2300, run: () => setGhost({ x: 700, y: 520, show: true, press: false }) },
          { at: 2450, run: () => ghostTo(iconCenter("foto").x, iconCenter("foto").y) },
          // Foto: presa, portata sulla cartella Media e lasciata lì, così si vede che ci entra
          {
            at: 3300,
            run: () => {
              const c = iconCenter("foto");
              const { dx, dy } = fotoToMedia();
              setGhostDrag({ id: "foto", dx, dy });
              ghostTo(c.x + dx, c.y + dy, { press: true });
            },
          },
          { at: 4050, run: () => setHitState({ kind: "folder", f: "f-media" }) },
          {
            at: 4650,
            run: () => {
              const f = mediaFolder();
              setHitState(null);
              setGhostDrag(null);
              setGhost((g) => ({ ...g, press: false }));
              if (f) setScene((s) => applyDrop(s, "foto", f.x, f.y, null).scene);
              say("Foto è entrata in Media", "ok");
            },
          },
          // un clic sulla cartella: Foto è dentro
          { at: 5500, run: () => (setGhost((g) => ({ ...g, press: true })), setOpen("f-media")) },
          { at: 5700, run: () => setGhost((g) => ({ ...g, press: false })) },
          { at: 7300, run: () => ghostTo(150, 470) },
          { at: 8200, run: () => (setGhost((g) => ({ ...g, press: true })), setOpen(null)) },
          { at: 8400, run: () => setGhost((g) => ({ ...g, press: false })) },
          { at: 8900, run: () => setGhost((g) => ({ ...g, show: false })) },
        ];
      case "cat":
        return [
          { at: 0, run: () => (setFolderOn(false), go(blocksScene(false))) },
          { at: 2500, run: () => (setFolderOn(true), go(blocksScene(true))) },
          { at: 4700, run: () => (setFolderOn(false), go(blocksScene(false))) },
        ];
      case "multi":
        return [
          {
            at: 0,
            run: () => {
              profiles.current = { 2: blocksScene(false, 2) };
              setPlugged(false);
              go(blocksScene(false, 1));
            },
          },
          { at: 1000, run: () => plug(true) },
          { at: 3900, run: () => plug(false) },
          { at: 6200, run: () => plug(true) },
        ];
      case "lock":
        return [
          { at: 0, run: () => (setLocked(true), go(columnsScene())) },
          { at: 700, run: () => setGhost({ x: 700, y: 500, show: true, press: false }) },
          { at: 850, run: () => ghostTo(iconCenter("steam").x, iconCenter("steam").y) },
          {
            at: 1750,
            run: () => {
              const c = iconCenter("steam");
              setGhostDrag({ id: "steam", dx: 280, dy: 150 });
              ghostTo(c.x + 280, c.y + 150, { press: true });
            },
          },
          {
            at: 2700,
            run: () => {
              setGhostDrag(null);
              setGhost((g) => ({ ...g, press: false }));
              setPulses((p) => ({ ...p, steam: (p.steam ?? 0) + 1 }));
              say("Icone bloccate: restano al loro posto", "lock");
            },
          },
          { at: 3700, run: () => (setLocked(false), say("Sbloccate: spostale dove vuoi", "info")) },
          { at: 4000, run: () => ghostTo(iconCenter("racing").x, iconCenter("racing").y) },
          {
            at: 4800,
            run: () => {
              const c = iconCenter("racing");
              setGhostDrag({ id: "racing", dx: RACING_DX, dy: RACING_DY });
              ghostTo(c.x + RACING_DX, c.y + RACING_DY, { press: true });
            },
          },
          {
            at: 5700,
            run: () => {
              const p = sceneRef.current.places.racing;
              if (p?.kind === "free")
                setScene((s) => ({
                  ...s,
                  places: { ...s.places, racing: { kind: "free", x: p.x + RACING_DX, y: p.y + RACING_DY } },
                  delays: {},
                  v: s.v + 1,
                }));
              setGhostDrag(null);
              setGhost((g) => ({ ...g, press: false }));
            },
          },
          { at: 6400, run: () => (setLocked(true), say("Disposizione salvata", "ok"), setGhost((g) => ({ ...g, show: false }))) },
        ];
    }
  };
  const ghostRef = useRef(ghost);
  ghostRef.current = ghost;

  const enterMode = useCallback(
    (i: number) => {
      modeRef.current = i;
      setModeIdx(i);
      elapsed.current = 0;
      stepIdx.current = 0;
      steps.current = scriptFor(MODES[i].key);
      progress.set(0);
      setOpen(null);
      setGhost((g) => ({ ...g, show: false, press: false }));
      setGhostDrag(null);
      setToast(null);
      setHitState(null);
      if (MODES[i].key !== "lock") setLocked(false);
      if (MODES[i].key !== "multi") setPlugged(false);
      userRef.current = false;
      setUserControl(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ------------------------------ clock ------------------------------ */
  useEffect(() => {
    steps.current = scriptFor(MODES[0].key);
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      if (!visibleRef.current || document.hidden || userRef.current) return; // loop sleeps
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const m = MODES[modeRef.current];
      let e = elapsed.current + dt;
      if (hoverRef.current) e = Math.min(e, m.duration - 1);
      elapsed.current = e;
      const st = steps.current;
      while (stepIdx.current < st.length && st[stepIdx.current].at <= e) st[stepIdx.current++].run();
      progress.set(Math.min(1, e / m.duration));
      if (e >= m.duration) enterMode((modeRef.current + 1) % MODES.length);
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && visibleRef.current && !document.hidden && !userRef.current) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    wakeRef.current = wake;
    const el = rootRef.current;
    const io = new IntersectionObserver(
      ([en]) => {
        visibleRef.current = en.isIntersecting;
        wake();
      },
      { threshold: 0.3 },
    );
    if (el) io.observe(el);
    const vis = () => wake();
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wakeRef = useRef<() => void>(() => {});

  /* ------------------------------ user ------------------------------ */
  const interact = useCallback(() => {
    if (userRef.current) return;
    userRef.current = true;
    setUserControl(true);
    setGhost((g) => ({ ...g, show: false, press: false }));
    setGhostDrag(null);
    setHitState(null);
  }, []);

  const resume = useCallback(() => {
    userRef.current = false;
    setUserControl(false);
    stepIdx.current = steps.current.length; // skip the rest of this mode's script
    elapsed.current = Math.max(elapsed.current, MODES[modeRef.current].duration - 1400);
    wakeRef.current();
  }, []);

  const selectMode = useCallback(
    (i: number) => {
      enterMode(i);
      wakeRef.current();
    },
    [enterMode],
  );

  const reset = useCallback(() => {
    setPulses({});
    profiles.current = {};
    enterMode(modeRef.current);
    wakeRef.current();
  }, [enterMode]);

  const setHover = useCallback((h: boolean) => {
    hoverRef.current = h;
    if (!h) {
      const d = MODES[modeRef.current].duration;
      if (elapsed.current >= d - 1) elapsed.current = d - 1200;
    }
  }, []);

  const api = useMemo(
    () => ({
      start: (id: string) => {
        interact();
        setDragId(id);
      },
      move: (id: string, x: number, y: number) => {
        const isLocked = MODES[modeRef.current].key === "lock" && lockedRef.current;
        const h = isLocked ? null : hitTest(sceneRef.current, id, x, y);
        const k = h ? (h.kind === "folder" ? `f:${h.f}` : `i:${h.id}`) : "";
        if (k !== hitKey.current) {
          hitKey.current = k;
          setHitState(h);
        }
      },
      drop: (id: string, x: number, y: number) => {
        setDragId(null);
        hitKey.current = "";
        setHitState(null);
        if (MODES[modeRef.current].key === "lock" && lockedRef.current) {
          setScene((s) => ({ ...s, delays: {}, v: s.v + 1 }));
          setPulses((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
          say("Bloccate: premi «Sblocca» per spostarle", "lock");
          return;
        }
        const r = applyDrop(sceneRef.current, id, x, y, openRef.current);
        setScene(r.scene);
        setOpen(r.open);
      },
    }),
    [interact, say, setOpen, setScene],
  );

  const openFolder = useCallback(
    (f: string) => {
      interact();
      setOpen(f);
    },
    [interact, setOpen],
  );
  const closeFolder = useCallback(() => setOpen(null), [setOpen]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, setOpen]);

  const toggleFolders = useCallback(() => {
    interact();
    const on = !folderOn;
    setFolderOn(on);
    setOpen(null);
    go(blocksScene(on, sceneRef.current.monitors));
  }, [folderOn, go, interact, setOpen]);

  const togglePlug = useCallback(() => {
    interact();
    plug(!plugged);
  }, [interact, plug, plugged]);

  const toggleLock = useCallback(() => {
    interact();
    const next = !lockedRef.current;
    setLocked(next);
    say(next ? "Disposizione salvata" : "Sbloccate: spostale dove vuoi", next ? "ok" : "info");
  }, [interact, say, setLocked]);

  // toasts fade on their own
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((cur) => (cur?.n === toast.n ? null : cur)), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  return {
    reduced,
    mode: MODES[modeIdx],
    modeIdx,
    scene,
    open,
    folderOn,
    plugged,
    profileN,
    locked,
    toast,
    ghost,
    ghostDrag,
    pulses,
    dragId,
    hit,
    userControl,
    progress,
    api,
    interact,
    resume,
    selectMode,
    reset,
    setHover,
    openFolder,
    closeFolder,
    toggleFolders,
    togglePlug,
    toggleLock,
  };
}
