import clsx from "clsx";
import type { HTMLAttributes } from "react";

/** Frosted glass surface (the app's folder-tile material). `strong` = more opaque. */
export function GlassCard({ className, strong, ...rest }: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={clsx("glass rounded-[var(--r-md)]", strong && "bg-[var(--glass-bg-strong)]", className)}
      {...rest}
    />
  );
}
