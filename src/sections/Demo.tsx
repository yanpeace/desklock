import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { Check, FolderOpen, Lock, LockOpen, Monitor, Play, Plug, RotateCcw, Unplug, Hand } from "lucide-react";
import { Container, Kicker, Lead, Reveal, RevealText } from "../components/ui";
import { DesktopPreview } from "../demo/DesktopPreview";
import { ModeList, ModePills } from "../demo/ModeTabs";
import { useDemo } from "../demo/useDemo";

export default function Demo() {
  const stage = useRef<HTMLDivElement>(null);
  const d = useDemo(stage);
  const key = d.mode.key;

  return (
    <section id="demo" className="relative py-[var(--section-y)] max-sm:pt-16">
      <Container>
        <div className="max-w-[760px]">
          <Reveal>
            <Kicker>Demo dal vivo</Kicker>
          </Reveal>
          <RevealText
            as="h2"
            text={"Un desktop vero, in miniatura.\nProvalo qui."}
            className="font-display font-normal text-[length:var(--fs-h2)] leading-[1.02] tracking-[-0.01em] text-ink text-balance"
          />
          <Reveal delay={180} className="mt-6">
            <Lead>
              Trascina le icone, crea una cartella, collega un secondo schermo. Quello che vedi è esattamente ciò che
              DeskLock fa sul tuo PC.
            </Lead>
          </Reveal>
        </div>

        <div
          className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10"
          onMouseEnter={() => d.setHover(true)}
          onMouseLeave={() => d.setHover(false)}
        >
          <Reveal delay={120} className="hidden lg:block lg:pt-2">
            <ModeList active={d.modeIdx} progress={d.progress} paused={d.userControl} onSelect={d.selectMode} />
          </Reveal>
          <div className="lg:hidden">
            <ModePills active={d.modeIdx} progress={d.progress} paused={d.userControl} onSelect={d.selectMode} />
          </div>

          <Reveal scale={0.96} blur={8} y={24} delay={200} className="min-w-0">
            <div
              ref={stage}
              id="demo-stage"
              role="tabpanel"
              aria-label={`Anteprima: ${d.mode.title}`}
              className="relative rounded-[var(--r-lg)] border border-line p-3 sm:p-5"
              style={{
                background:
                  "radial-gradient(80% 70% at 50% 0%, rgb(240 160 75 / 0.07), transparent 70%), linear-gradient(180deg, rgb(255 255 255 / 0.035), rgb(255 255 255 / 0.01))",
                boxShadow: "var(--glass-highlight), var(--sh-3)",
              }}
            >
              <DesktopPreview
                scene={d.scene}
                open={d.open}
                reduced={d.reduced}
                dragId={d.dragId}
                hit={d.hit}
                ghost={d.ghost}
                ghostDrag={d.ghostDrag}
                pulses={d.pulses}
                api={d.api}
                onOpen={d.openFolder}
                onClose={d.closeFolder}
                onInteract={d.interact}
              >
                <StatusChip d={d} />
                <div className="pointer-events-none absolute bottom-[15%] left-[38%] right-[2%] flex justify-center">
                  <AnimatePresence>
                    {d.toast && (
                      <motion.div
                        key={d.toast.n}
                        className="glass flex items-center gap-2 rounded-[var(--r-pill)] px-3 py-1.5 text-[12px] font-medium text-ink sm:text-[13px]"
                        style={{ background: "rgb(28 29 34 / 0.72)" }}
                        initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {d.toast.tone === "ok" && <Check size={14} className="text-[color:var(--c-green)]" />}
                        {d.toast.tone === "lock" && <Lock size={14} className="text-amber" />}
                        {d.toast.tone === "info" && <LockOpen size={14} className="text-blue" />}
                        {d.toast.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </DesktopPreview>

              {/* toolbar */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 sm:mt-4">
                <p className="min-w-0 flex-1 basis-[220px] text-[length:var(--fs-small)] leading-snug text-ink-3">
                  <span className="lg:hidden text-ink-2">{d.mode.caption} </span>
                  <span className="hidden items-center gap-1.5 lg:inline-flex">
                    <Hand size={14} className="shrink-0 text-amber" />
                    {hintFor(key)}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  {d.userControl && (
                    <ToolButton onClick={d.resume} label="Riprendi la demo automatica">
                      <Play size={14} /> Riprendi
                    </ToolButton>
                  )}
                  {key === "cat" && (
                    <ToolButton onClick={d.toggleFolders} label="Cartelle" pressed={d.folderOn}>
                      <FolderOpen size={14} /> Cartelle
                      <span className="w-[26px] text-left font-mono text-[11px] text-ink-3">{d.folderOn ? "ON" : "OFF"}</span>
                      <Switch on={d.folderOn} />
                    </ToolButton>
                  )}
                  {key === "multi" && (
                    <ToolButton onClick={d.togglePlug} label={d.plugged ? "Scollega monitor" : "Collega monitor"}>
                      {d.plugged ? <Unplug size={14} /> : <Plug size={14} />}
                      {d.plugged ? "Scollega monitor" : "Collega monitor"}
                    </ToolButton>
                  )}
                  {key === "lock" && (
                    <ToolButton onClick={d.toggleLock} label={d.locked ? "Sblocca" : "Blocca"} accent={!d.locked}>
                      {d.locked ? <LockOpen size={14} /> : <Lock size={14} />}
                      {d.locked ? "Sblocca" : "Blocca"}
                    </ToolButton>
                  )}
                  <ToolButton onClick={d.reset} label="Ripristina la demo" icon>
                    <RotateCcw size={15} />
                  </ToolButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function hintFor(key: string) {
  switch (key) {
    case "ios":
      return "Trascina un'icona su un'altra · clic su una cartella per aprirla";
    case "cat":
      return "Accendi e spegni le cartelle: i blocchi si aprono e si richiudono";
    case "multi":
      return "Sposta qualche icona, poi scollega e ricollega lo schermo";
    default:
      return "Prova a trascinare un'icona mentre è bloccata";
  }
}

type DemoState = ReturnType<typeof useDemo>;

function StatusChip({ d }: { d: DemoState }) {
  let chip: { k: string; icon: ReactNode; text: string; tone: "amber" | "green" | "blue" } | null = null;
  if (d.mode.key === "multi")
    chip = d.plugged
      ? { k: `p2-${d.profileN}`, icon: <Monitor size={13} />, text: "2 schermi · profilo salvato ripristinato", tone: "green" }
      : { k: `p1-${d.profileN}`, icon: <Monitor size={13} />, text: "1 schermo · profilo salvato", tone: "blue" };
  else if (d.mode.key === "lock")
    chip = d.locked
      ? { k: "lk", icon: <Lock size={13} />, text: "Icone bloccate", tone: "amber" }
      : { k: "ul", icon: <LockOpen size={13} />, text: "Modifica libera", tone: "blue" };
  const color = chip?.tone === "green" ? "var(--c-green)" : chip?.tone === "blue" ? "var(--c-blue)" : "var(--c-amber)";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center">
      <AnimatePresence mode="wait">
        {chip && (
          <motion.div
            key={chip.k}
            className="glass flex items-center gap-1.5 rounded-[var(--r-pill)] px-2.5 py-1 text-[11px] font-medium text-ink sm:text-[12.5px]"
            style={{ background: "rgb(28 29 34 / 0.66)" }}
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: color }} />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            </span>
            <span style={{ color }}>{chip.icon}</span>
            {chip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  label,
  pressed,
  accent,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  pressed?: boolean;
  accent?: boolean;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={clsx(
        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-[var(--r-sm)] border text-[13px] font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97]",
        icon ? "w-9 justify-center" : "px-3",
        accent
          ? "border-transparent bg-[image:var(--g-amber)] text-[#1c1d22] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
          : "border-line-2 bg-surface-2/70 text-ink hover:border-[rgb(241_239_234/0.28)] hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "relative ml-0.5 inline-block h-[18px] w-[32px] rounded-full transition-colors duration-300",
        on ? "bg-amber" : "bg-[rgb(255_255_255/0.16)]",
      )}
    >
      <span
        className="absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-spring)]"
        style={{ transform: on ? "translateX(14px)" : "translateX(0)" }}
      />
      <span className="sr-only">{on ? "ON" : "OFF"}</span>
    </span>
  );
}
