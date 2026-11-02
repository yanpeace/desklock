import { useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, type MotionValue } from "motion/react";
import { MODES } from "./modes";

interface Props {
  active: number;
  progress: MotionValue<number>;
  paused: boolean;
  onSelect: (i: number) => void;
}

/** Desktop: vertical list with a progress line under the active mode. */
export function ModeList({ active, progress, paused, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="Funzioni della demo" aria-orientation="vertical" className="flex flex-col gap-1">
      {MODES.map((m, i) => {
        const on = i === active;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={on}
            aria-controls="demo-stage"
            onClick={() => onSelect(i)}
            className={clsx(
              "group relative w-full rounded-[var(--r-md)] px-5 py-4 text-left transition-colors duration-300",
              on ? "bg-[rgb(255_255_255/0.045)]" : "hover:bg-[rgb(255_255_255/0.025)]",
            )}
          >
            <div className="flex items-baseline gap-4">
              <span
                className={clsx(
                  "font-mono text-[12px] tnum transition-colors duration-300",
                  on ? "text-amber" : "text-ink-3 group-hover:text-ink-2",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={clsx(
                  "text-[length:var(--fs-h3)] font-[560] tracking-[-0.01em] transition-colors duration-300",
                  on ? "text-ink" : "text-ink-3 group-hover:text-ink-2",
                )}
              >
                {m.title}
              </span>
            </div>
            {/* caption: grid-rows trick animates height without measuring */}
            <div
              className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)]"
              style={{ gridTemplateRows: on ? "1fr" : "0fr", opacity: on ? 1 : 0 }}
            >
              <p className="overflow-hidden pl-[34px] text-[length:var(--fs-small)] leading-relaxed text-ink-2">
                <span className="block pt-2">{m.caption}</span>
              </p>
            </div>
            <div className="mt-4 ml-[34px] h-[2px] overflow-hidden rounded-full bg-[rgb(255_255_255/0.07)]">
              {on && (
                <motion.div
                  className="h-full origin-left rounded-full"
                  style={{
                    scaleX: progress,
                    background: "var(--g-amber)",
                    opacity: paused ? 0.45 : 1,
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Phone/tablet: horizontally scrolling pills, active one fills with progress. */
export function ModePills({ active, progress, paused, onSelect }: Props) {
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = row.current;
    const pill = el?.children[active] as HTMLElement | undefined;
    if (!el || !pill) return;
    // scroll the row only (never the page)
    el.scrollTo({ left: pill.offsetLeft - (el.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);
  return (
    <div
      ref={row}
      role="tablist"
      aria-label="Funzioni della demo"
      className="-mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {MODES.map((m, i) => {
        const on = i === active;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={on}
            aria-controls="demo-stage"
            onClick={() => onSelect(i)}
            className={clsx(
              "relative shrink-0 snap-center overflow-hidden rounded-[var(--r-pill)] border px-4 py-2 text-[0.9rem] font-medium transition-colors duration-300",
              on ? "border-[rgb(240_160_75/0.45)] text-ink" : "border-line text-ink-3",
            )}
          >
            {on && (
              <motion.span
                aria-hidden
                className="absolute inset-0 origin-left"
                style={{ scaleX: progress, background: "rgb(240 160 75 / 0.16)", opacity: paused ? 0.5 : 1 }}
              />
            )}
            <span className="relative">{m.title}</span>
          </button>
        );
      })}
    </div>
  );
}
