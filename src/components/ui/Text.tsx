import clsx from "clsx";
import type { HTMLAttributes } from "react";

/** Small sentence-case label (NOT all caps, no tracking). Use only when it carries information. */
export function Kicker({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-sm font-medium text-amber mb-4", className)} {...rest} />;
}

/** Section title in the display serif. */
export function H2({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={clsx("font-display font-normal text-[length:var(--fs-h2)] leading-[1.02] tracking-[-0.01em] text-ink text-balance", className)}
      {...rest}
    />
  );
}

/** Sans sub-heading for cards / steps. */
export function H3({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("text-[length:var(--fs-h3)] font-[560] leading-snug tracking-[-0.01em] text-ink", className)} {...rest} />;
}

/** Intro paragraph under a title. Keeps line length < 60ch. */
export function Lead({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-[length:var(--fs-lead)] leading-relaxed text-ink-2 max-w-[58ch] text-pretty", className)} {...rest} />;
}
