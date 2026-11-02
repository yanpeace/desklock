import clsx from "clsx";
import { Hexagon, Search, Undo2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AppGlyph } from "../../demo/AppGlyph";
import { ICON_BY_ID, type AppIcon } from "../../demo/data";
import { Fit, usePrefersReducedMotion } from "./hooks";

const I = (id: string) => ICON_BY_ID[id];
const BNET: AppIcon = { id: "bnet", label: "Battle.net", cat: "giochi", glyph: Hexagon, from: "#6cc6ff", to: "#1b4f9c" };
const v = (o: Record<string, string | number>) => o as CSSProperties;

/* ───────────────────────── 1. Monitor + TV: icons never move ───────────────────────── */

const MAIN_ICONS = ["steam", "web", "discord", "code", "note", "foto", "musica"];
const TV_ICONS = ["arcade", "racing", "video"];

export function MonitorsScene() {
  return (
    <Fit w={520} h={250} max={1.2}>
      <div className="fx-mon">
        {/* cable: draws in when the TV gets plugged in */}
        <svg className="fx-mon-cable" width="520" height="250" viewBox="0 0 520 250" fill="none">
          <path d="M150 214 C 150 236, 250 236, 300 236 S 418 236, 418 196" stroke="rgb(241 239 234 / 0.14)" strokeWidth="1.5" />
          <path className="fx-mon-cable-live" d="M150 214 C 150 236, 250 236, 300 236 S 418 236, 418 196" stroke="var(--c-amber)" strokeWidth="1.5" pathLength={1} />
        </svg>

        {/* main monitor */}
        <div className="fx-screen" style={{ left: 18, top: 14, width: 268, height: 168 }}>
          <div className="fx-wall fx-wall-a">
            <div className="fx-mon-icons">
              {MAIN_ICONS.map((id, i) => (
                <span key={id} className="fx-mon-icon" style={v({ "--i": i })}>
                  <AppGlyph icon={I(id)} size={24} />
                </span>
              ))}
            </div>
            <span className="fx-seal" />
          </div>
        </div>
        <div className="fx-stand" style={{ left: 18 + 134 - 22, top: 184, width: 44 }} />

        {/* TV */}
        <div className="fx-screen fx-tv" style={{ left: 312, top: 52, width: 196, height: 122 }}>
          <div className="fx-wall fx-wall-tv">
            <div className="fx-tv-icons">
              {TV_ICONS.map((id, i) => (
                <span key={id} className="fx-tv-icon" style={v({ "--i": i })}>
                  <AppGlyph icon={I(id)} size={26} />
                </span>
              ))}
            </div>
          </div>
          <span className="fx-tv-led" />
        </div>
        <div className="fx-tv-legs" style={{ left: 312 + 30, top: 176, width: 136 }} />

        {/* status */}
        <div className="fx-mon-status">
          <span className="fx-st fx-st-on">
            <i className="fx-dot" style={{ background: "var(--c-pink)" }} /> TV collegata
          </span>
          <span className="fx-st fx-st-off">
            <i className="fx-dot" style={{ background: "var(--c-ink-3)" }} /> TV scollegata
          </span>
        </div>
      </div>
    </Fit>
  );
}

/* ───────────────────────── 2. Glass folder 3x3 that opens ───────────────────────── */

const FOLDER = ["steam", "epic", "arcade", "racing", "puzzle", "scacchi", "discord", "video", "musica"];

export function FolderScene() {
  return (
    <Fit w={300} h={236}>
      <div className="fx-fold">
        <div className="fx-fold-tile">
          <div className="fx-fold-grid">
            {FOLDER.map((id) => (
              <AppGlyph key={id} icon={I(id)} size={18} />
            ))}
          </div>
          <span className="fx-fold-name">Giochi</span>
        </div>
        <span className="fx-tap" />
        <div className="fx-fold-panel">
          <p className="fx-fold-title">Giochi</p>
          <div className="fx-fold-big">
            {FOLDER.map((id, i) => (
              <span key={id} className="fx-fold-item" style={v({ "--i": i })}>
                <AppGlyph icon={I(id)} size={36} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Fit>
  );
}

/* ───────────────────────── 3. Icons sorting into labeled groups ───────────────────────── */

const COLS = [
  { name: "Giochi", ids: ["arcade", "racing", "puzzle"] },
  { name: "Programmi", ids: ["web", "code", "terminale"] },
  { name: "Launcher", ids: ["steam", "epic", "bnet"] },
];
// scattered start positions (design px, top-left of a 34px glyph)
const SCATTER: Array<[number, number]> = [
  [262, 160], [36, 92], [398, 70], [188, 64], [330, 180], [104, 176], [222, 118], [430, 150], [48, 150],
];

export function SortScene() {
  let n = 0;
  return (
    <Fit w={480} h={232}>
      <div className="fx-sort">
        {COLS.map((c, ci) => {
          const cx = 80 + ci * 160;
          return (
            <div key={c.name}>
              <span className="fx-sort-label" style={{ left: cx, top: 12 }}>
                {c.name}
              </span>
              <span className="fx-sort-well" style={{ left: cx - 40, top: 44 }} />
              {c.ids.map((id, ri) => {
                const [x0, y0] = SCATTER[n];
                const style = v({ "--x0": `${x0}px`, "--y0": `${y0}px`, "--x1": `${cx - 17}px`, "--y1": `${56 + ri * 52}px`, "--i": n });
                n++;
                return (
                  <span key={id} className="fx-sort-icon" style={style}>
                    <AppGlyph icon={id === "bnet" ? BNET : I(id)} size={34} />
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </Fit>
  );
}

/* ───────────────────────── 4. Arrange on desktop: 8 positions, live preview ───────────────────────── */

const SPOTS = [
  { id: "tl", x: 0, y: 0, name: "In alto a sinistra" },
  { id: "tc", x: 0.5, y: 0, name: "In alto al centro" },
  { id: "tr", x: 1, y: 0, name: "In alto a destra" },
  { id: "ml", x: 0, y: 0.5, name: "Al centro a sinistra" },
  { id: "mr", x: 1, y: 0.5, name: "Al centro a destra" },
  { id: "bl", x: 0, y: 1, name: "In basso a sinistra" },
  { id: "bc", x: 0.5, y: 1, name: "In basso al centro" },
  { id: "br", x: 1, y: 1, name: "In basso a destra" },
] as const;
// grid cell of each spot inside the 3x3 picker (center is empty)
const CELL = [0, 1, 2, 3, 5, 6, 7, 8];
const AUTO = [0, 2, 7, 5, 3, 4, 1, 6];
const BLOCK_IDS = ["steam", "epic", "arcade", "racing", "puzzle", "scacchi"];

function placeStyle(x: number, y: number): CSSProperties {
  return {
    left: `calc(10px + (100% - 20px) * ${x})`,
    top: `calc(10px + (100% - 40px) * ${y})`,
    transform: `translate(${-x * 100}%, ${-y * 100}%)`,
  };
}

export function ArrangeScene({ onScreen }: { onScreen: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || !onScreen || reduced) return;
    let k = AUTO.indexOf(sel);
    const t = window.setInterval(() => {
      k = (k + 1) % AUTO.length;
      setSel(AUTO[k]);
    }, 2200);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, onScreen, reduced]);

  const pick = (i: number) => {
    setAuto(false);
    setSel(i);
  };
  const s = SPOTS[sel];
  const g = hover !== null && hover !== sel ? SPOTS[hover] : null;

  return (
    <div className="flex items-center gap-5 sm:gap-7">
      <div className="min-w-0 flex-1">
        <Fit w={340} h={214}>
          <div className="fx-arr-screen">
            <div className="fx-wall fx-wall-b" />
            {g && (
              <div className="fx-arr-ghost" style={placeStyle(g.x, g.y)}>
                <span>Anteprima</span>
              </div>
            )}
            <div className="fx-arr-block" style={placeStyle(s.x, s.y)}>
              <span className="fx-arr-label">Giochi</span>
              <div className="fx-arr-grid">
                {BLOCK_IDS.map((id) => (
                  <AppGlyph key={id} icon={I(id)} size={22} />
                ))}
              </div>
            </div>
            <div className="fx-arr-taskbar">
              <i /> <i /> <i /> <i />
            </div>
          </div>
        </Fit>
      </div>
      <div className="shrink-0" role="radiogroup" aria-label="Posizione del blocco Giochi" onPointerLeave={() => setHover(null)}>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }, (_, cell) => {
            const i = CELL.indexOf(cell);
            if (i < 0) return <span key={cell} className="fx-pick-center" aria-hidden />;
            const on = i === sel;
            return (
              <button
                key={cell}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={SPOTS[i].name}
                className={clsx("fx-pick", on && "is-on")}
                onClick={() => pick(i)}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <i style={{ left: `${10 + SPOTS[i].x * 44}%`, top: `${10 + SPOTS[i].y * 44}%` }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 5. Quick search Ctrl+Alt+Space ───────────────────────── */

export function SearchScene() {
  return (
    <Fit w={300} h={236}>
      <div className="fx-search">
        <div className="fx-keys">
          <kbd className="fx-key" style={v({ "--i": 0 })}>Ctrl</kbd>
          <kbd className="fx-key" style={v({ "--i": 1 })}>Alt</kbd>
          <kbd className="fx-key fx-key-wide" style={v({ "--i": 2 })}>Spazio</kbd>
        </div>
        <div className="fx-sbox">
          <div className="fx-sinput">
            <Search size={14} strokeWidth={2.2} className="text-ink-3" />
            <span className="fx-typed">
              <b className="fx-ch fx-ch1">s</b>
              <b className="fx-ch fx-ch2">t</b>
              <b className="fx-ch fx-ch3">e</b>
            </span>
            <span className="fx-caret" />
          </div>
          <div className="fx-results">
            <div className="fx-res fx-res-hit">
              <AppGlyph icon={I("steam")} size={22} />
              <span>
                <b>Ste</b>am
              </span>
              <kbd>Invio</kbd>
            </div>
            <div className="fx-res fx-res-2">
              <AppGlyph icon={I("foto")} size={22} />
              <span>
                Po<b>ste</b>r.png <em>in Foto</em>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Fit>
  );
}

/* ───────────────────────── 6. Light: starts with Windows, history + undo ───────────────────────── */

const TIMES = ["09:12", "11:40", "14:05", "16:22", "Adesso"];

export function LightScene() {
  const icon = `${import.meta.env.BASE_URL}icon-512.png`;
  const ref = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width < 480));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref}>
    <Fit w={compact ? 360 : 600} h={compact ? 300 : 196}>
      <div className={clsx("fx-light", compact && "is-compact")}>
        {/* tray */}
        <div className="fx-tray">
          <div className="fx-toggle-row">
            <span>Avvia con Windows</span>
            <span className="fx-toggle">
              <i />
            </span>
          </div>
          <div className="fx-taskbar">
            <span className="fx-tb-apps">
              <i /> <i /> <i />
            </span>
            <span className="fx-tb-tray">
              <img src={icon} alt="" width={16} height={16} className="fx-tb-dl" />
              <span className="tnum">09:41</span>
            </span>
          </div>
        </div>

        {/* history */}
        <div className="fx-hist">
          <div className="fx-hist-line">
            <span className="fx-hist-fill" />
          </div>
          {TIMES.map((t, i) => (
            <div key={t} className={clsx("fx-node", i === 3 && "fx-node-back", i === 4 && "fx-node-now")} style={{ left: `${i * 25}%` }}>
              <i />
              <span className="tnum">{t}</span>
            </div>
          ))}
          <span className="fx-hist-ring" />
          <span className="fx-undo">
            <Undo2 size={13} strokeWidth={2.4} /> Annulla
          </span>
          {/* tiny desktop preview: messy now → restored */}
          <div className="fx-prev">
            <div className="fx-prev-a">
              {[[8, 6], [44, 30], [20, 40], [70, 12], [58, 44], [86, 34]].map(([x, y], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />
              ))}
            </div>
            <div className="fx-prev-b">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <i key={i} style={{ left: `${8 + (i % 2) * 14}%`, top: `${8 + Math.floor(i / 2) * 26}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Fit>
    </div>
  );
}
