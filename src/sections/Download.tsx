import type { ReactNode } from "react";
import { Download as DownloadIcon, ExternalLink, ShieldCheck, Terminal } from "lucide-react";
import { ButtonLink, Container, GlassCard, H3, Kicker, Lead, Reveal, RevealGroup, RevealText } from "../components/ui";
import {
  DOWNLOAD_URL,
  SETUP_FILE_NAME,
  VIRUSTOTAL_UPLOAD_URL,
  downloadReadyMeta,
  fmtBytes,
  fmtDate,
  release,
  virusTotalFileUrl,
} from "../data/release";
import { CopyButton } from "./download/CopyButton";
import { SmartScreenMock } from "./download/SmartScreenMock";
import { s } from "./download/strings";
import "./download/download.css";

const COMMAND = `Get-FileHash .\\${SETUP_FILE_NAME} -Algorithm SHA256`;

// Same look as <H2>, rendered through RevealText (words rise with blur -> sharp).
const H2_CLASS = "font-display font-normal leading-[1.02] tracking-[-0.01em] text-ink text-balance";
const H2_BIG = `${H2_CLASS} text-[length:var(--fs-h2)]`;
const H2_SUB = `${H2_CLASS} text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]`;

/** Thin separator between the three blocks of the section. */
function Rule() {
  return (
    <div
      aria-hidden="true"
      className="my-[clamp(64px,9vw,120px)] h-px bg-gradient-to-r from-transparent via-[var(--c-line-2)] to-transparent"
    />
  );
}

function Facts() {
  const rows: { dt: string; dd: ReactNode; key: string }[] = [
    { key: "v", dt: s.factVersion, dd: <span className="tnum">{release.version}</span> },
    {
      key: "s",
      dt: s.factSize,
      dd: (
        <span className="flex flex-col">
          <span className="tnum">{fmtBytes(release.sizeBytes)}</span>
          <span className="text-[0.8125rem] text-ink-3">{s.factSizeJoke}</span>
        </span>
      ),
    },
    { key: "d", dt: s.factDate, dd: <span className="tnum">{fmtDate(release.releaseDate)}</span> },
    {
      key: "h",
      dt: s.factHash,
      dd: (
        <span className="flex items-center gap-2">
          <code id="dl-fact-hash" className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-ink" title={release.sha256}>
            {release.sha256}
          </code>
          <CopyButton compact value={release.sha256} label={s.hashLabel} targetId="dl-fact-hash" className="!h-8 !w-8" />
        </span>
      ),
    },
    {
      key: "r",
      dt: s.factRequirements,
      dd: (
        <>
          {s.factRequirementsValue}
          <span className="mt-0.5 block font-normal text-ink-3">{s.factRequirementsNote}</span>
        </>
      ),
    },
    { key: "p", dt: s.factPrice, dd: s.factPriceValue },
  ];
  return (
    <Reveal scale={0.97} y={20} delay={120}>
      <GlassCard className="p-2">
        <RevealGroup as="dl" aria-label={s.factsLabel} className="m-0 grid" delay={240} stagger={60} y={10}>
          {rows.map((r) => (
            <div
              key={r.key}
              className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-4 border-b border-line px-4 py-3.5 text-sm last:border-b-0 max-sm:grid-cols-[96px_minmax(0,1fr)] max-sm:px-3"
            >
              <dt className="text-ink-2">{r.dt}</dt>
              <dd className="m-0 min-w-0 font-medium text-ink">{r.dd}</dd>
            </div>
          ))}
        </RevealGroup>
      </GlassCard>
    </Reveal>
  );
}

function CodeBlock({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--r-sm)] border border-line-2 bg-[rgb(23_24_28/0.72)] py-1.5 pr-1.5 pl-4 shadow-[var(--glass-highlight)]">
      <code id={id} className="min-w-0 flex-1 py-1 font-mono text-[0.8125rem] leading-normal text-ink [overflow-wrap:anywhere] select-all">
        {value}
      </code>
      <CopyButton value={value} label={label} targetId={id} />
    </div>
  );
}

export default function Download() {
  return (
    <section id="download" aria-labelledby="dl-title" className="relative py-[var(--section-y)]">
      {/* soft amber glow behind the download button */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] left-[8%] h-[420px] w-[620px] max-w-[90vw] rounded-full opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(closest-side, rgb(240 160 75 / 0.16), transparent)" }}
      />
      <Container className="relative">
        {/* ---- hero of the section */}
        <div className="grid items-end gap-[clamp(40px,6vw,80px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="flex flex-col">
            <Reveal>
              <Kicker>{s.eyebrow}</Kicker>
            </Reveal>
            <RevealText as="h2" id="dl-title" className={H2_BIG} text={s.title} />
            <Reveal delay={120}>
              <Lead className="mt-6">{s.lead}</Lead>
            </Reveal>
            <Reveal delay={200} className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink variant="primary" size="lg" href={DOWNLOAD_URL} className="shadow-[var(--glow-amber)]">
                <DownloadIcon size={19} strokeWidth={2.2} aria-hidden="true" />
                {s.button}
              </ButtonLink>
              <span className="tnum text-sm text-ink-2">{downloadReadyMeta(release.version)}</span>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-5 max-w-[58ch] text-sm leading-relaxed text-ink-3">
                {s.unsignedHint}{" "}
                <a className="text-link !text-ink-2" href="#avviso-windows">
                  {s.warnTitle}
                </a>
              </p>
            </Reveal>
          </div>
          <Facts />
        </div>

        <Rule />

        {/* ---- SmartScreen notice (unsigned installer) */}
        <section id="avviso-windows" aria-labelledby="dl-warn-title" className="scroll-mt-24">
          <div className="grid gap-x-[clamp(40px,6vw,80px)] gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <RevealText as="h2" id="dl-warn-title" className={H2_SUB} text={s.warnTitle} />
            <RevealGroup delay={120} stagger={90} className="grid max-w-[64ch] gap-4 text-[length:var(--fs-lead)] leading-normal text-ink-2 text-pretty">
              {s.warnText.map((p) => (
                <p key={p} className="m-0">
                  {p}
                </p>
              ))}
            </RevealGroup>
          </div>

          <div role="img" aria-label={s.mockLabel} className="mt-[clamp(40px,5vw,64px)]">
            <RevealGroup stagger={140} scale={0.96} y={24} blur={6} className="grid gap-6 md:grid-cols-2">
              <div className="h-full">
                <SmartScreenMock step={1} fileName={SETUP_FILE_NAME} />
              </div>
              <div className="h-full">
                <SmartScreenMock step={2} fileName={SETUP_FILE_NAME} />
              </div>
            </RevealGroup>
          </div>

          <RevealGroup as="ol" stagger={80} className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3">
            {s.warnSteps.map((step, i) => (
              <li key={step.title} className="flex gap-4 border-t border-line pt-5">
                <span
                  aria-hidden="true"
                  className="tnum grid size-7 flex-none place-items-center rounded-full border border-[rgb(240_160_75/0.4)] bg-[rgb(240_160_75/0.08)] text-[0.8125rem] font-semibold text-amber"
                >
                  {i + 1}
                </span>
                <div>
                  <H3 className="!text-base">{step.title}</H3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{step.text}</p>
                </div>
              </li>
            ))}
          </RevealGroup>
          <Reveal as="p" className="mt-8 text-sm text-ink-3">
            {s.warnDoubt}{" "}
            <a className="text-link !text-ink-2" href="#verifica">
              {s.warnDoubtLink}
            </a>
            .
          </Reveal>
        </section>

        <Rule />

        {/* ---- verify */}
        <section id="verifica" aria-labelledby="dl-verify-title" className="scroll-mt-24">
          <div className="grid gap-x-[clamp(40px,6vw,80px)] gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <RevealText as="h2" id="dl-verify-title" className={H2_SUB} text={s.verifyTitle} />
            <RevealGroup delay={120} stagger={80} className="flex min-w-0 flex-col gap-7">
              <Lead className="max-w-[64ch]">{s.verifyLead}</Lead>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <ButtonLink variant="secondary" size="lg" href={virusTotalFileUrl(release.sha256)} target="_blank" rel="noopener">
                  <ShieldCheck size={18} aria-hidden="true" className="text-amber" />
                  {s.virusTotal}
                  <ExternalLink size={15} aria-hidden="true" className="text-ink-3" />
                  <span className="sr-only">{s.external}</span>
                </ButtonLink>
                <a
                  href={VIRUSTOTAL_UPLOAD_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors duration-200 hover:text-ink"
                >
                  {s.virusTotalUpload}
                  <ExternalLink size={14} aria-hidden="true" />
                  <span className="sr-only">{s.external}</span>
                </a>
              </div>

              <div className="grid max-w-[72ch] gap-2" role="group" aria-labelledby="dl-hash-label">
                <p id="dl-hash-label" className="m-0 text-sm font-medium text-ink-2">
                  {s.hashLabel}
                </p>
                <CodeBlock id="dl-hash" value={release.sha256} label={s.hashLabel} />
              </div>

              <div className="grid max-w-[72ch] gap-2">
                <H3 className="flex items-center gap-2 !text-base">
                  <Terminal size={17} aria-hidden="true" className="text-amber" />
                  {s.hashHowTitle}
                </H3>
                <p className="m-0 text-sm leading-relaxed text-ink-2">{s.hashHow}</p>
                <CodeBlock id="dl-cmd" value={COMMAND} label={s.commandLabel} />
              </div>
            </RevealGroup>
          </div>
        </section>
      </Container>
    </section>
  );
}
