import clsx from "clsx";
import { useRef, type ReactNode } from "react";
import { H3 } from "../../components/ui";
import { useOnScreen } from "./hooks";

/**
 * Bento card: glass surface, amber spotlight that follows the cursor (fill + border),
 * a very small tilt on fine pointers. Looping illustrations inside pause when off-screen.
 */
export function FeatureCard({
  title,
  text,
  stage,
  className,
  stageClassName,
  style,
  interactive,
}: {
  title: string;
  text: ReactNode;
  /** a node, or a render function receiving "is on screen" (for JS-driven loops) */
  stage: ReactNode | ((onScreen: boolean) => ReactNode);
  interactive?: boolean;
  className?: string;
  stageClassName?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const on = useOnScreen(ref);

  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--ry", `${((x / r.width - 0.5) * 2.4).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y / r.height) * 2.4).toFixed(2)}deg`);
  };
  const leave = () => {
    const el = ref.current!;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={clsx("fx-cell", className)} style={style}>
      <article ref={ref} className="fx-card" data-paused={on ? undefined : ""} onPointerMove={move} onPointerLeave={leave}>
        <span aria-hidden className="fx-spot" />
        <span aria-hidden className="fx-rim" />
        <div className={clsx("fx-stage", stageClassName)} aria-hidden={interactive ? undefined : true}>
          {typeof stage === "function" ? stage(on) : stage}
        </div>
        <div className="relative px-6 pb-6 sm:px-7 sm:pb-7">
          <H3>{title}</H3>
          <p className="mt-1.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">{text}</p>
        </div>
      </article>
    </div>
  );
}
