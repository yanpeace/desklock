import { useEffect, useState } from "react";
import clsx from "clsx";
import { Download } from "lucide-react";
import { DOWNLOAD_URL } from "../data/release";

const nav = [
  { href: "#demo", label: "Prova" },
  { href: "#funzioni", label: "Funzioni" },
  { href: "#come-funziona", label: "Come funziona" },
  { href: "#download", label: "Download" },
];

/** Sticky top bar: logo, anchors (hidden on phones), compact download. Turns to glass after scrolling. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div
        className={clsx(
          "mx-auto mt-3 flex h-14 w-[calc(100%-24px)] max-w-[var(--maxw)] items-center gap-6 rounded-[18px] px-3 pl-3.5 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled ? "glass !bg-[rgb(28_29_34/0.62)]" : "border border-transparent",
        )}
      >
        <a href="#top" className="flex items-center gap-2.5 font-[560] tracking-[-0.01em]" aria-label="DeskLock, torna su">
          <img src={`${import.meta.env.BASE_URL}app-icon.png`} alt="" width={28} height={28} className="size-7 rounded-[7px]" />
          <span>DeskLock</span>
        </a>
        <nav aria-label="Sezioni" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-7 text-sm text-ink-2">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-ink">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={DOWNLOAD_URL}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-[10px] border border-line-2 bg-surface-2/70 px-3.5 text-sm font-medium transition-colors hover:border-[rgb(240_160_75/0.5)] md:ml-0"
        >
          <Download className="size-4 text-amber" aria-hidden />
          Scarica
        </a>
      </div>
    </header>
  );
}
