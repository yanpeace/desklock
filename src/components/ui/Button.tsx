import clsx from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out " +
  "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Amber gradient fill, dark ink: the one loud button style
  primary:
    "text-[#1c1d22] bg-[image:var(--g-amber)] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),var(--sh-2)] hover:brightness-105",
  // Graphite with hairline border
  secondary:
    "text-ink bg-surface-2/80 border border-line-2 hover:border-[rgb(241_239_234/0.28)] hover:bg-surface-2",
  // Text only
  ghost: "text-ink-2 hover:text-ink",
};
const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-[0.9375rem] rounded-[var(--r-sm)]",
  lg: "h-13 px-6 text-base rounded-[14px]",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

/** <Button> renders a <button>; <ButtonLink href> renders an <a> with identical styling. */
export function Button({ variant = "secondary", size = "md", className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...rest} />;
}

export function ButtonLink({ variant = "secondary", size = "md", className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={clsx(base, variants[variant], sizes[size], className)} {...rest} />;
}

export const buttonClass = (variant: Variant = "secondary", size: Size = "md") => clsx(base, variants[variant], sizes[size]);
