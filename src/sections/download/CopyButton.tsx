import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { s } from "./strings";

type State = "idle" | "copied" | "failed";

/** Copies `value`; if the clipboard is unavailable it selects the text of #targetId so it can be copied by hand. */
export function CopyButton({
  value,
  label,
  targetId,
  className,
  compact,
}: {
  value: string;
  label: string;
  targetId?: string;
  className?: string;
  /** Icon only (the visible text is hidden, the accessible label stays). */
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      const el = targetId ? document.getElementById(targetId) : null;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  const text = state === "copied" ? s.copied : state === "failed" ? s.copyFailed : s.copy;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={s.copyLabel(label)}
      title={s.copyLabel(label)}
      className={clsx(
        "inline-flex h-9 flex-none items-center justify-center gap-1.5 rounded-[var(--r-xs)] border text-[0.8125rem] font-medium",
        "cursor-pointer transition-[background-color,border-color,color] duration-200 ease-out active:scale-[0.96]",
        compact ? "w-9" : "px-3",
        state === "copied"
          ? "border-[rgb(111_207_151/0.4)] bg-[rgb(111_207_151/0.1)] text-[var(--c-green)]"
          : "border-line-2 bg-surface-2/70 text-ink-2 hover:border-[rgb(241_239_234/0.28)] hover:text-ink",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state === "copied" ? "check" : "copy"}
          initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 26 }}
          className="inline-flex"
          aria-hidden="true"
        >
          {state === "copied" ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} />}
        </motion.span>
      </AnimatePresence>
      {!compact && <span aria-hidden="true">{text}</span>}
      <span className="sr-only" role="status" aria-live="polite">
        {state === "idle" ? "" : text}
      </span>
    </button>
  );
}
