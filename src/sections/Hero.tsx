import { DOWNLOAD_URL } from "../data/release";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowDown } from "lucide-react";
import type { CSSProperties } from "react";
import { BorderBeam } from "../components/BorderBeam";
import "./hero.css";

const ICON = `${import.meta.env.BASE_URL}icon-512.png`;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Headline, one array per line. Words flagged `true` get the amber accent. */
const TITLE: Array<Array<[string, boolean?]>> = [
  [["Ogni"], ["icona"], ["al"], ["suo"], ["posto."]],
  [["Sempre."]],
];

// blur -> sharp + fade + slight rise, same language as the shared Reveal primitive
const word: Variants = {
  hidden: { opacity: 0, y: "0.32em", filter: "blur(10px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: EASE, delay: 0.25 + i * 0.075 },
  }),
};

const rise: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE, delay: d },
  }),
};

function WindowsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <rect x="0.5" y="0.5" width="6.6" height="6.6" rx="1.1" />
      <rect x="8.9" y="0.5" width="6.6" height="6.6" rx="1.1" />
      <rect x="0.5" y="8.9" width="6.6" height="6.6" rx="1.1" />
      <rect x="8.9" y="8.9" width="6.6" height="6.6" rx="1.1" />
    </svg>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const initial = reduce ? "show" : "hidden";
  const words = TITLE.flat().length;
  const after = 0.25 + words * 0.075; // when the headline has landed

  let n = 0;

  return (
    <section id="top" className="dl-hero" aria-labelledby="hero-title">
      <motion.div
        className="dl-hero__icon-wrap"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.92, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <div className="dl-hero__floor" />
        <div className="dl-hero__icon-float">
          <div className="dl-hero__icon" style={{ "--icon": `url(${ICON})` } as CSSProperties}>
            <img
              src={ICON}
              alt=""
              width={112}
              height={112}
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </motion.div>

      <h1 id="hero-title" className="dl-hero__title">
        <span className="sr-only">Ogni icona al suo posto. Sempre.</span>
        <span aria-hidden="true">
          {TITLE.map((line, li) => (
            <span key={li} className="dl-hero__line">
              {line.map(([w, accent], wi) => {
                const i = n++;
                return (
                  <span key={wi}>
                    <motion.span
                      className={accent ? "dl-hero__word dl-hero__accent" : "dl-hero__word"}
                      variants={word}
                      custom={i}
                      initial={initial}
                      animate="show"
                    >
                      {w}
                    </motion.span>
                    {wi < line.length - 1 ? " " : null}
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </h1>

      <motion.p className="dl-hero__sub" variants={rise} custom={after - 0.05} initial={initial} animate="show">
        Colleghi la TV o un secondo monitor e le icone restano esattamente dove le hai messe. In più, cartelle
        di vetro come su iPhone e categorie che si creano da sole.
      </motion.p>

      <motion.div className="dl-hero__ctas" variants={rise} custom={after + 0.12} initial={initial} animate="show">
        <BorderBeam radius={999} duration={7}>
          <a href={DOWNLOAD_URL} className="dl-cta dl-cta--primary">
            <WindowsGlyph className="dl-cta__win" />
            Scarica per Windows
            <ArrowDown className="dl-cta__arrow" strokeWidth={2} aria-hidden="true" />
          </a>
        </BorderBeam>
        <a href="#demo" className="dl-cta dl-cta--ghost">
          <span className="dl-cta__play" aria-hidden="true">
            <svg viewBox="0 0 10 10">
              <path d="M2 1.2v7.6a.6.6 0 0 0 .9.5l6-3.8a.6.6 0 0 0 0-1L2.9.7a.6.6 0 0 0-.9.5Z" />
            </svg>
          </span>
          Prova la demo
        </a>
      </motion.div>

      <motion.p className="dl-hero__meta" variants={rise} custom={after + 0.28} initial={initial} animate="show">
        <span>Windows 10 e 11</span>
        <i aria-hidden="true" />
        <span>Gratis</span>
        <i aria-hidden="true" />
        <span>Non rallenta il PC</span>
      </motion.p>

      <motion.div
        className="dl-hero__scroll"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: after + 0.8, duration: 1 }}
      />
    </section>
  );
}
