import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/** Centered max-width column with the page gutter. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mx-auto w-full max-w-[var(--maxw)] px-[var(--gutter)]", className)} {...rest} />;
}

/** Page section: anchor id + standard vertical rhythm + Container. Pass `bare` to skip the Container. */
export function Section({
  id,
  className,
  children,
  bare,
  ...rest
}: HTMLAttributes<HTMLElement> & { id: string; bare?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={clsx("relative py-[var(--section-y)]", className)} {...rest}>
      {bare ? children : <Container>{children}</Container>}
    </section>
  );
}
