# DeskLock site: shared design system

Stack: Vite + React 19 + TypeScript + Tailwind v4 (`@tailwindcss/vite`) + `motion` (`import { motion } from "motion/react"`), `lucide-react`, `clsx`.
Deps are installed: do not run `npm install`. Base path is `/desklock/`: reference files in `public/` as
`` `${import.meta.env.BASE_URL}file.png` ``.

## Files
- `tokens.css` – all CSS variables (colors, glass, radii, shadows, fonts, type scale, easing). Never hard-code brand hex values in sections.
- `global.css` – Tailwind import, `@theme` mapping of tokens to utilities, base styles, `.glass`, `.text-link`, `.tnum`, `.sr-only`, reduced-motion kill switch.
- `reveal.css` – scroll reveal styles used by `Reveal*` components.

## Tokens as Tailwind utilities
`bg-bg bg-graphite bg-surface bg-surface-2 border-line border-line-2 text-ink text-ink-2 text-ink-3 text-amber text-amber-hi text-blue text-pink font-sans font-display font-mono`.
Others via arbitrary values: `rounded-[var(--r-md)]`, `shadow-[var(--sh-3)]`, `bg-[image:var(--g-amber)]`, `text-[length:var(--fs-h2)]`, `ease-[var(--ease-out)]`.

| Token | Value / role |
|---|---|
| `--c-bg` `#17181c` page, `--c-graphite` `#1C1D22`, `--c-surface` `#202020`, `--c-surface-2` `#2B2B2D` | graphite surfaces |
| `--c-ink` `#F1EFEA`, `--c-ink-2` 68 %, `--c-ink-3` 44 % | text |
| `--c-amber` `#F0A04B`, `--g-amber` `#F6B868→#D9822B` | the one accent |
| `--c-blue` `#5AB8E6` (portals), `--c-pink` `#E0457B` (TV/party) | secondary, sparingly |
| `--glass-*` | folder-tile glass; or just add class `glass` |
| `--r-xs 6` chips, `--r-sm 10` inputs/code, `--r-md 16` tiles/panels, `--r-lg 24` screens | radii by hierarchy |
| `--sh-1/2/3`, `--glow-amber` | shadows |
| `--font-display` Instrument Serif (headlines only, roman, never single-word accents), `--font-sans` Geist, `--font-mono` Geist Mono (code/hash only) | type |
| `--fs-display --fs-h2 --fs-h3 --fs-lead --fs-body --fs-small --fs-micro` | type scale |
| `--gutter` (16px on phones), `--maxw 1180px`, `--section-y` | layout |
| `--ease-out` `(.22,1,.36,1)`, `--ease-in-out`, `--ease-spring`, `--dur-1/2/3` | motion |

Copy rules: Italian, sentence case, no ALL-CAPS eyebrows, no "→" on buttons, no emoji.

## Primitives (`import { … } from "../components/ui"`)
- `Button` / `ButtonLink` – `variant="primary" | "secondary" | "ghost"`, `size="md" | "lg"`. `buttonClass(variant,size)` for custom elements.
- `Container` – centered max-width column with gutter. `Section id=…` – `<section>` with standard vertical padding + Container (`bare` to skip the Container).
- `Kicker` (small amber sentence-case label, use only if informative), `H2` (display serif section title), `H3` (sans card/step title), `Lead` (intro paragraph, ≤58ch).
- `GlassCard` – glass surface (`strong` for more opacity).

## Scroll reveal (`Reveal.tsx`, upfork-like feel)
One shared IntersectionObserver (bottom margin −10 %), fires once, pure CSS transitions on a soft
deceleration curve `cubic-bezier(.2,.55,.3,1)`, 760 ms, rise 16 px + fade, ~70 ms staggers. Hidden only when
JS runs (`html.js`) and `prefers-reduced-motion` is not `reduce` (then everything is simply visible).
After the reveal finishes the transition rules are removed (`data-reveal-done`), so your own hover
transitions are not delayed.

```tsx
import { Reveal, RevealGroup, RevealText, useInViewOnce } from "../components/ui";

<RevealText as="h2" className="font-display text-[length:var(--fs-h2)]" text={"Le icone restano\ndove le metti."} />
//   words rise one after another with a light blur → sharp. Props: text (string, "\n" = line break),
//   as, className, stagger=45 ms, delay=0, y=14, blur=6, duration=820. Screen readers get the sentence once.

<Reveal delay={120}>…</Reveal>                     // single block. Props: as, delay, y=16, scale (e.g. 0.96 for screens/cards), blur=0, duration=760
<Reveal scale={0.96} y={24}><Preview/></Reveal>    // "scale-in" for a big visual

<RevealGroup as="ul" stagger={80} className="grid …">  // DIRECT children reveal in sequence (they get style --i)
  <li>…</li><li>…</li><li>…</li>
</RevealGroup>

const ref = useRef(null); const seen = useInViewOnce(ref); // start your own motion/JS animation on entry
```
Use reveal for entrances only; do not wrap every single element. Typical section: RevealText title →
Reveal lead (delay 120) → RevealGroup for the items.
