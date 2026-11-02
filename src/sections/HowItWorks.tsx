import clsx from "clsx";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Check, Lock } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Container, H3, Lead, Reveal, RevealGroup, RevealText } from "../components/ui";
import { AppGlyph } from "../demo/AppGlyph";
import { ICON_BY_ID } from "../demo/data";
import { SETUP_FILE_NAME, fmtBytes, release } from "../data/release";
import { useOnScreen } from "./features/hooks";
import "./features/howitworks.css";

const ICON = `${import.meta.env.BASE_URL}icon-512.png`;

function InstallChip() {
  return (
    <div className="hw-chip">
      <img src={ICON} alt="" width={28} height={28} className="rounded-[7px]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[13px] font-medium text-ink">{SETUP_FILE_NAME}</span>
          <span className="tnum shrink-0 text-[11.5px] text-ink-3">{fmtBytes(release.sizeBytes)}</span>
        </div>
        <div className="hw-bar">
          <span />
        </div>
      </div>
    </div>
  );
}

function ArrangeChip() {
  const ids = ["steam", "code", "foto"];
  return (
    <div className="hw-chip hw-arrange">
      {ids.map((id, i) => (
        <span key={id} className={clsx("hw-slot", i === 2 && "hw-slot-target")}>
          {i < 2 && <AppGlyph icon={ICON_BY_ID[id]} size={26} />}
        </span>
      ))}
      <span className="hw-mover">
        <AppGlyph icon={ICON_BY_ID.foto} size={26} />
      </span>
      <span className="ml-auto text-[12px] text-ink-3">Salvato</span>
    </div>
  );
}

function KeepChip() {
  return (
    <div className="hw-chip">
      <span className="hw-lock">
        <Lock size={14} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-ink">Monitor + TV</div>
        <div className="text-[11.5px] text-ink-3">12 icone ripristinate</div>
      </div>
      <Check size={16} strokeWidth={2.4} className="hw-check text-[var(--c-green)]" />
    </div>
  );
}

const STEPS: Array<{ title: string; text: string; chip: ReactNode }> = [
  {
    title: "Scarica e installa",
    text: "Un solo installer, nessun account. Dopo pochi secondi DeskLock è nell’area di notifica, accanto all’orologio.",
    chip: <InstallChip />,
  },
  {
    title: "Sistema le icone come vuoi",
    text: "Spostale, crea cartelle o lascia fare alle categorie. La disposizione viene salvata per ogni combinazione di schermi.",
    chip: <ArrangeChip />,
  },
  {
    title: "DeskLock le tiene lì, sempre",
    text: "Riavvii, cambi risoluzione, colleghi la TV: ogni icona torna al suo posto da sola.",
    chip: <KeepChip />,
  },
];

export default function HowItWorks() {
  const list = useRef<HTMLDivElement>(null);
  const on = useOnScreen(list);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 78%", "end 62%"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.6 });
  const [reached, setReached] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    const n = v >= 0.68 ? 3 : v >= 0.34 ? 2 : v > 0.005 ? 1 : 0;
    setReached((r) => (r === n ? r : n));
  });
  const active = reduced ? 3 : reached;

  return (
    <section id="come-funziona" aria-labelledby="come-funziona-title" className="relative py-[var(--section-y)]">
      <Container>
        <div className="max-w-[720px]">
          <RevealText
            as="h2"
            id="come-funziona-title"
            text="Tre passi. Poi non ci pensi più."
            className="font-display font-normal text-[length:var(--fs-h2)] leading-[1.02] tracking-[-0.01em] text-ink text-balance"
          />
          <Reveal delay={200} blur={6}>
            <Lead className="mt-5">Niente da configurare per iniziare: funziona già con il desktop che hai.</Lead>
          </Reveal>
        </div>

        <div ref={list} className="hw-list relative mt-16 lg:mt-24" data-paused={on ? undefined : ""}>
          {/* connector: vertical on phone, horizontal on desktop; draws with scroll */}
          <span aria-hidden className="hw-track hw-track-v lg:hidden">
            <motion.span className="hw-fill" style={{ scaleY: reduced ? 1 : p, originY: 0 }} />
          </span>
          <span aria-hidden className="hw-track hw-track-h hidden lg:block">
            <motion.span className="hw-fill" style={{ scaleX: reduced ? 1 : p, originX: 0 }} />
          </span>

          <RevealGroup as="ol" className="grid gap-14 lg:grid-cols-3 lg:gap-10" stagger={120} y={20} blur={6} duration={860}>
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative pl-[76px] pt-[11px] lg:pl-0 lg:pt-0">
                <span className={clsx("hw-marker", i < active && "is-on")} aria-hidden>
                  {i + 1}
                </span>
                <span className="sr-only">Passo {i + 1}: </span>
                <H3 className="lg:mt-9">{s.title}</H3>
                <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">{s.text}</p>
                <div className="mt-6 max-w-[340px]" aria-hidden>
                  {s.chip}
                </div>
              </li>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
