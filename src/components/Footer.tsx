import { RELEASE_REPO } from "../data/release";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-[1] border-t border-line">
      <div className="mx-auto flex w-full max-w-[var(--maxw)] flex-col gap-6 px-[var(--gutter)] py-12 text-sm text-ink-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}app-icon.png`} alt="" width={24} height={24} className="size-6 rounded-[6px]" loading="lazy" />
          <span className="text-ink-2">DeskLock</span>
          <span>per Windows 10 e 11, gratis.</span>
        </div>
        <nav aria-label="Link" className="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto">
          <a className="hover:text-ink" href={`${RELEASE_REPO}/releases`}>Versioni</a>
          <a className="hover:text-ink" href={`${RELEASE_REPO}/issues`}>Segnala un problema</a>
          <a className="hover:text-ink" href="#avviso-windows">Avviso di Windows</a>
          <span>© {year}</span>
        </nav>
      </div>
    </footer>
  );
}
