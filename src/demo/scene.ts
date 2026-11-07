import { CATEGORIES, CATEGORY_NAME, ICONS, ICON_BY_ID, byCat, type Category } from "./data";

/* ------------------------------------------------------------------ */
/* Geometry. Everything is in "desk" pixels: monitor 1's screen is     */
/* 960x600 at (0,0); monitor 2's screen starts at MON2_X.              */
/* An icon's (x,y) is the top-left of its 44px glyph.                  */
/* ------------------------------------------------------------------ */

export const SCREEN_W = 960;
export const SCREEN_H = 600;
export const TASKBAR_H = 40;
export const USABLE_H = SCREEN_H - TASKBAR_H;
export const MON2_X = 1010;
export const GLYPH = 44;
export const BEZEL = 16;
export const STAND_H = 44;

/* Folder tile: 60px glass square anchored 8px above-left of the glyph slot */
export const TILE = 60;
export const TILE_PAD = 8;
export const MINI_SCALE = 0.28;

/* Desktop grid: every icon, folder and block sits on these cells, and drops snap to them. */
export const GRID_COLS = 10;
export const GRID_ROWS = 6;
export const GRID_PITCH_X = 96;
export const GRID_PITCH_Y = 90;
const GRID_X = (SCREEN_W - ((GRID_COLS - 1) * GRID_PITCH_X + GLYPH)) / 2;
const GRID_Y = 20;
export const gridCell = (col: number, row: number, monitor: 1 | 2 = 1) => ({
  x: (monitor === 2 ? MON2_X : 0) + GRID_X + col * GRID_PITCH_X,
  y: GRID_Y + row * GRID_PITCH_Y,
});
const MINI_INSET = 7;
const MINI_PITCH = (TILE - 2 * MINI_INSET - 3 * GLYPH * MINI_SCALE) / 2 + GLYPH * MINI_SCALE;

export type Place = { kind: "free"; x: number; y: number } | { kind: "folder"; f: string };

export interface FolderT {
  id: string;
  name: string;
  x: number;
  y: number;
  items: string[];
}

export interface BlockT {
  id: string;
  name: string;
  cat: Category;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scene {
  places: Record<string, Place>;
  folders: FolderT[];
  blocks: BlockT[];
  monitors: 1 | 2;
  /** per-icon animation delay (seconds) for this version only */
  delays: Record<string, number>;
  /** bumps on every change so icons re-run their spring even to the same spot */
  v: number;
}

export interface Target {
  x: number;
  y: number;
  s: number;
  label: boolean;
  hidden: boolean;
  z: number;
}

/* ------------------------------ helpers ------------------------------ */

export const tileRect = (f: { x: number; y: number }) => ({
  x: f.x - TILE_PAD,
  y: f.y - TILE_PAD,
  w: TILE,
  h: TILE,
});

export const miniSlot = (f: { x: number; y: number }, i: number) => {
  const r = tileRect(f);
  const c = i % 3;
  const row = Math.floor(i / 3);
  return { x: r.x + MINI_INSET + c * MINI_PITCH, y: r.y + MINI_INSET + row * MINI_PITCH };
};

/* Open folder panel (centered on monitor 1) */
export const PANEL_COLS = 4;
const P_PITCH_X = 88;
const P_PITCH_Y = 92;
export const panelRect = (n: number) => {
  const rows = Math.max(1, Math.ceil(n / PANEL_COLS));
  const w = PANEL_COLS * P_PITCH_X + 40;
  const h = 62 + rows * P_PITCH_Y + 10;
  return { x: (SCREEN_W - w) / 2, y: (USABLE_H - h) / 2, w, h };
};
export const panelSlot = (n: number, i: number) => {
  const p = panelRect(n);
  return {
    x: p.x + 20 + (i % PANEL_COLS) * P_PITCH_X + (P_PITCH_X - GLYPH) / 2,
    y: p.y + 60 + Math.floor(i / PANEL_COLS) * P_PITCH_Y + 4,
  };
};

export function targetFor(scene: Scene, id: string, open: string | null): Target {
  const p = scene.places[id];
  if (!p) return { x: 0, y: 0, s: 1, label: true, hidden: true, z: 10 };
  if (p.kind === "free") return { x: p.x, y: p.y, s: 1, label: true, hidden: false, z: 10 };
  const f = scene.folders.find((ff) => ff.id === p.f);
  if (!f) return { x: 0, y: 0, s: 1, label: true, hidden: true, z: 10 };
  const i = f.items.indexOf(id);
  if (open === f.id) {
    const s = panelSlot(f.items.length, i);
    return { ...s, s: 1, label: true, hidden: false, z: 40 };
  }
  const m = miniSlot(f, Math.min(i, 8));
  return { ...m, s: MINI_SCALE, label: false, hidden: i > 8, z: 12 };
}

/* ------------------------------ builders ------------------------------ */

const free = (x: number, y: number): Place => ({ kind: "free", x, y });

function base(monitors: 1 | 2 = 1): Scene {
  return { places: {}, folders: [], blocks: [], monitors, delays: {}, v: 0 };
}

/** Deterministic "messy" desktop: icons sprinkled on a jittered grid. */
export function messyScene(): Scene {
  const s = base();
  const cols = 8;
  const rows = 5;
  const cells: number[] = [];
  for (let i = 0; i < cols * rows; i++) cells.push(i);
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const cw = (SCREEN_W - 60) / cols;
  const ch = (USABLE_H - 70) / rows;
  ICONS.forEach((ic, i) => {
    const cell = cells[i];
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    s.places[ic.id] = free(
      Math.round(26 + c * cw + rnd() * (cw - 60)),
      Math.round(18 + r * ch + rnd() * (ch - 64)),
    );
  });
  return s;
}

/** Classic Windows columns, sorted by category (used by "Blocca"). */
export function columnsScene(): Scene {
  const s = base();
  CATEGORIES.forEach((cat, c) => {
    byCat(cat).forEach((id, r) => {
      const cell = gridCell(c, r);
      s.places[id] = free(cell.x, cell.y);
    });
  });
  return s;
}

/** iOS-style: four glass folders centered, a few favourites left free. */
export const FAVOURITES = ["steam", "brave", "note", "foto"];
export function iosScene(): Scene {
  const s = base();
  FAVOURITES.forEach((id, i) => {
    const cell = gridCell(0, i);
    s.places[id] = free(cell.x, cell.y);
  });
  CATEGORIES.forEach((cat, i) => {
    const fid = `f-${cat}`;
    const items = byCat(cat).filter((id) => !FAVOURITES.includes(id));
    s.folders.push({ id: fid, name: CATEGORY_NAME[cat], ...gridCell(3 + i, 2), items });
    items.forEach((id) => (s.places[id] = { kind: "folder", f: fid }));
  });
  return s;
}

/* Category blocks */
const BLOCK_COLS = 3;
const BLOCK_PAD = 16;
const BLOCK_HEAD = 46;
const BLOCK_W = (BLOCK_COLS - 1) * GRID_PITCH_X + GLYPH + BLOCK_PAD * 2;
const BLOCK_H = 210;
type BlockCell = { col: number; row: number; monitor: 1 | 2 };
type BlockPos = Record<Category, BlockCell>;
const MONO: BlockPos = {
  giochi: { col: 0, row: 1, monitor: 1 },
  programmi: { col: 7, row: 1, monitor: 1 },
  documenti: { col: 0, row: 4, monitor: 1 },
  media: { col: 7, row: 4, monitor: 1 },
};
const DUAL: BlockPos = {
  programmi: { col: 0, row: 1, monitor: 1 },
  documenti: { col: 7, row: 1, monitor: 1 },
  giochi: { col: 0, row: 1, monitor: 2 },
  media: { col: 7, row: 4, monitor: 2 },
};

/** The block's frame: its first icon lands on the grid cell (col,row). */
const blockFrame = ({ col, row, monitor }: BlockCell) => {
  const c = gridCell(col, row, monitor);
  return { x: c.x - BLOCK_PAD, y: c.y - BLOCK_HEAD };
};

export function blockSlot(b: { x: number; y: number }, i: number) {
  return {
    x: b.x + BLOCK_PAD + (i % BLOCK_COLS) * GRID_PITCH_X,
    y: b.y + BLOCK_HEAD + Math.floor(i / BLOCK_COLS) * GRID_PITCH_Y,
  };
}

/** Category blocks; `folders` = each category collapsed into a glass tile. */
export function blocksScene(folders: boolean, monitors: 1 | 2 = 1): Scene {
  const s = base(monitors);
  const pos = monitors === 2 ? DUAL : MONO;
  CATEGORIES.forEach((cat) => {
    const cell = pos[cat];
    const p = blockFrame(cell);
    const ids = byCat(cat);
    if (folders) {
      const fid = `f-${cat}`;
      s.folders.push({
        id: fid,
        name: CATEGORY_NAME[cat],
        ...gridCell(cell.col + 1, cell.row, cell.monitor),
        items: ids,
      });
      ids.forEach((id) => (s.places[id] = { kind: "folder", f: fid }));
    } else {
      s.blocks.push({ id: `b-${cat}`, name: CATEGORY_NAME[cat], cat, x: p.x, y: p.y, w: BLOCK_W, h: BLOCK_H });
      ids.forEach((id, i) => (s.places[id] = free(blockSlot(p, i).x, blockSlot(p, i).y)));
    }
  });
  return s;
}

/* ---------------------------- transitions ---------------------------- */

/**
 * Stamp per-icon delays so a scene change reads as a choreography:
 *  - folder -> free  ("burst"): the tile swells first, icons fly out after
 *  - free -> folder  ("gather"): the tile appears first, icons fly in after
 *  - free -> free: a light cascade
 */
export function choreograph(prev: Scene, next: Scene, extra = 0): Scene {
  const delays: Record<string, number> = {};
  let k = 0;
  for (const ic of ICONS) {
    const a = prev.places[ic.id];
    const b = next.places[ic.id];
    if (!a || !b) continue;
    if (a.kind === "folder" && b.kind === "free") delays[ic.id] = extra + 0.1 + k++ * 0.018;
    else if (a.kind === "free" && b.kind === "folder") {
      const f = next.folders.find((ff) => ff.id === b.f);
      const rank = f ? f.items.indexOf(ic.id) : 0;
      delays[ic.id] = extra + 0.16 + rank * 0.04;
    } else delays[ic.id] = extra + k++ * 0.012;
  }
  return { ...next, delays, v: prev.v + 1 };
}

/* ------------------------------ editing ------------------------------ */

/** Nearest grid cell not taken by another icon or folder, for a glyph whose top-left is (x,y). */
export function snapToGrid(scene: Scene, id: string, x: number, y: number) {
  const taken: { x: number; y: number }[] = [...scene.folders];
  for (const [other, p] of Object.entries(scene.places)) {
    if (other !== id && p.kind === "free") taken.push(p);
  }
  const monitors: (1 | 2)[] = scene.monitors === 2 ? [1, 2] : [1];
  let best: { x: number; y: number } | null = null;
  let bestD = Infinity;
  for (const m of monitors) {
    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        const cell = gridCell(c, r, m);
        const d = Math.hypot(cell.x - x, cell.y - y);
        if (d >= bestD) continue;
        if (taken.some((t) => Math.abs(t.x - cell.x) < GRID_PITCH_X / 2 && Math.abs(t.y - cell.y) < GRID_PITCH_Y / 2)) continue;
        best = cell;
        bestD = d;
      }
    }
  }
  return best ?? { x, y };
}

export type DropHit = { kind: "folder"; f: string } | { kind: "icon"; id: string } | null;

/** What is under a dragged icon whose glyph top-left is (x,y)? */
export function hitTest(scene: Scene, dragId: string, x: number, y: number): DropHit {
  const cx = x + GLYPH / 2;
  const cy = y + GLYPH / 2;
  for (const f of scene.folders) {
    const r = tileRect(f);
    if (cx > r.x - 6 && cx < r.x + r.w + 6 && cy > r.y - 6 && cy < r.y + r.h + 6) {
      const p = scene.places[dragId];
      if (p?.kind === "folder" && p.f === f.id) return null;
      return { kind: "folder", f: f.id };
    }
  }
  for (const [id, p] of Object.entries(scene.places)) {
    if (id === dragId || p.kind !== "free") continue;
    if (Math.hypot(p.x + GLYPH / 2 - cx, p.y + GLYPH / 2 - cy) < 30) return { kind: "icon", id };
  }
  return null;
}

let folderSeq = 0;
const bump = (s: Scene): Scene => ({ ...s, delays: {}, v: s.v + 1 });

/** Apply a user drop. Returns the new scene and, if any, a folder to keep open. */
export function applyDrop(
  scene: Scene,
  id: string,
  x: number,
  y: number,
  open: string | null,
): { scene: Scene; open: string | null } {
  const places = { ...scene.places };
  let folders = scene.folders.map((f) => ({ ...f, items: [...f.items] }));
  const from = places[id];

  // dragged out of the open panel?
  if (from?.kind === "folder" && open === from.f) {
    const src = folders.find((f) => f.id === from.f)!;
    const pr = panelRect(src.items.length);
    const cx = x + GLYPH / 2;
    const cy = y + GLYPH / 2;
    const inside = cx > pr.x && cx < pr.x + pr.w && cy > pr.y && cy < pr.y + pr.h;
    if (inside) return { scene: bump(scene), open };
    src.items = src.items.filter((i) => i !== id);
    const pt = snapToGrid(scene, id, x, y);
    places[id] = free(pt.x, pt.y);
    let nextOpen: string | null = null;
    if (src.items.length === 1) {
      // a folder of one dissolves (iOS)
      const last = src.items[0];
      places[last] = free(src.x, src.y);
      folders = folders.filter((f) => f.id !== src.id);
    }
    return { scene: bump({ ...scene, places, folders }), open: nextOpen };
  }

  const hit = hitTest(scene, id, x, y);
  if (hit?.kind === "folder") {
    const f = folders.find((ff) => ff.id === hit.f)!;
    f.items.push(id);
    places[id] = { kind: "folder", f: f.id };
    return { scene: bump({ ...scene, places, folders }), open };
  }
  if (hit?.kind === "icon") {
    const other = places[hit.id] as Extract<Place, { kind: "free" }>;
    const a = ICON_BY_ID[id];
    const b = ICON_BY_ID[hit.id];
    const fid = `u-${++folderSeq}`;
    const name = a.cat === b.cat ? CATEGORY_NAME[a.cat] : "Cartella";
    folders.push({ id: fid, name, x: other.x, y: other.y, items: [hit.id, id] });
    places[hit.id] = { kind: "folder", f: fid };
    places[id] = { kind: "folder", f: fid };
    return { scene: bump({ ...scene, places, folders }), open };
  }
  const pt = snapToGrid(scene, id, x, y);
  places[id] = free(pt.x, pt.y);
  return { scene: bump({ ...scene, places, folders }), open };
}
