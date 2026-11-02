/**
 * Scroll reveal primitives (one shared IntersectionObserver, CSS transitions, fire once).
 * See src/styles/README.md for usage. Styles live in src/styles/reveal.css.
 *
 *   <Reveal>            one element rises 16px + fades in when it enters the viewport
 *   <RevealGroup>       its DIRECT children reveal one after another (stagger)
 *   <RevealText>        a heading/paragraph split into words that rise in sequence
 *   useInViewOnce(ref)  boolean, for sections that want to start their own animation on entry
 */
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

type Opts = {
  /** extra delay before this element starts, ms */
  delay?: number;
  /** rise distance in px (default 16) */
  y?: number;
  /** start scale, e.g. 0.96 for cards/screens (default 1) */
  scale?: number;
  /** start blur in px, e.g. 6 for big headlines (default 0 = no blur) */
  blur?: number;
  /** duration ms (default 760) */
  duration?: number;
};

const ROOT_MARGIN = "0px 0px -10% 0px";
let io: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observe(el: Element, cb: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        callbacks.get(e.target)?.();
        callbacks.delete(e.target);
        io!.unobserve(e.target);
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: 0.01 },
  );
  callbacks.set(el, cb);
  io.observe(el);
  return () => {
    callbacks.delete(el);
    io?.unobserve(el);
  };
}

/** Marks `ref` with data-revealed on entry, and data-reveal-done once all transitions are over. */
function useReveal(ref: RefObject<HTMLElement | null>, totalMs: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t: number | undefined;
    const stop = observe(el, () => {
      el.setAttribute("data-revealed", "");
      t = window.setTimeout(() => el.setAttribute("data-reveal-done", ""), totalMs + 80);
    });
    return () => {
      stop();
      if (t) window.clearTimeout(t);
    };
  }, [ref, totalMs]);
}

function vars(o: Opts, extra?: CSSProperties): CSSProperties {
  const v: Record<string, string> = {};
  if (o.delay) v["--reveal-delay"] = `${o.delay}ms`;
  if (o.y !== undefined) v["--reveal-y"] = `${o.y}px`;
  if (o.scale !== undefined) v["--reveal-scale"] = String(o.scale);
  if (o.blur) v["--reveal-blur"] = `${o.blur}px`;
  if (o.duration) v["--reveal-dur"] = `${o.duration}ms`;
  return { ...v, ...extra } as CSSProperties;
}

type BaseProps = Opts & {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  [key: `aria-${string}`]: string | undefined;
};

export function Reveal({ as: Tag = "div", delay = 0, y, scale, blur, duration, className, style, children, ...rest }: BaseProps) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, delay + (duration ?? 760));
  return (
    <Tag ref={ref} data-reveal="" className={className} style={vars({ delay, y, scale, blur, duration }, style)} {...rest}>
      {children}
    </Tag>
  );
}

/** Direct children reveal in sequence. Children must be elements (their `style` gets --i). */
export function RevealGroup({
  as: Tag = "div",
  stagger = 70,
  delay = 0,
  y,
  scale,
  blur,
  duration,
  className,
  style,
  children,
  ...rest
}: BaseProps & { stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  const items = Children.toArray(children);
  useReveal(ref, delay + (duration ?? 760) + items.length * stagger);
  return (
    <Tag
      ref={ref}
      data-reveal-group=""
      className={className}
      style={vars({ delay, y, scale, blur, duration }, { ["--reveal-stagger" as string]: `${stagger}ms`, ...style })}
      {...rest}
    >
      {items.map((c, i) =>
        isValidElement(c)
          ? cloneElement(c as ReactElement<{ style?: CSSProperties }>, {
              style: { ...((c.props as { style?: CSSProperties }).style ?? {}), ["--i" as string]: i },
            })
          : c,
      )}
    </Tag>
  );
}

/**
 * Splits a plain string into words that rise one after another.
 * Screen readers get the full sentence once (sr-only copy), words are aria-hidden.
 * Use `as="h1" | "h2" | "p"`; style it like a normal heading via className.
 */
export function RevealText({
  as: Tag = "p",
  text,
  stagger = 45,
  delay = 0,
  y = 14,
  scale,
  blur = 6,
  duration = 820,
  className,
  style,
  ...rest
}: Omit<BaseProps, "children"> & { text: string; stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  // Explicit "\n" in text forces a line break.
  const lines = text.split("\n");
  const wordCount = text.split(/\s+/).length;
  useReveal(ref, delay + duration + wordCount * stagger);
  let i = 0;
  return (
    <Tag
      ref={ref}
      data-reveal-text=""
      className={className}
      style={vars({ delay, y, scale, blur, duration }, { ["--reveal-stagger" as string]: `${stagger}ms`, ...style })}
      {...rest}
    >
      <span className="sr-only">{text.split("\n").join(" ")}</span>
      {lines.map((line, li) => (
        <span key={li} aria-hidden="true">
          {li > 0 && <br />}
          {line.split(/(\s+)/).map((w, wi) =>
            /^\s+$/.test(w) || w === "" ? (
              w
            ) : (
              <span key={wi} className="rv-w" style={{ ["--i" as string]: i++ } as CSSProperties}>
                {w}
              </span>
            ),
          )}
        </span>
      ))}
    </Tag>
  );
}

/** True once the element has entered the viewport (never goes back to false). */
export function useInViewOnce(ref: RefObject<Element | null>, rootMargin = "0px 0px -10% 0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") return setSeen(true);
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          o.disconnect();
        }
      },
      { rootMargin },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [ref, rootMargin, seen]);
  return seen;
}
