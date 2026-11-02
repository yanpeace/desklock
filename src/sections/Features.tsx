import { Container, Lead, Reveal, RevealGroup, RevealText } from "../components/ui";
import { FeatureCard } from "./features/FeatureCard";
import { ArrangeScene, FolderScene, LightScene, MonitorsScene, SearchScene, SortScene } from "./features/Illustrations";
import "./features/features.css";

export default function Features() {
  return (
    <section id="funzioni" aria-labelledby="funzioni-title" className="relative py-[var(--section-y)]">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <RevealText
            as="h2"
            id="funzioni-title"
            text={"Il desktop resta come\nl’hai lasciato."}
            className="font-display font-normal text-[length:var(--fs-h2)] leading-[1.02] tracking-[-0.01em] text-ink text-balance"
          />
          <Reveal delay={220} blur={6}>
            <Lead className="lg:pb-2">
              DeskLock ricorda dove sta ogni icona per ogni combinazione di schermi, e ti dà gli strumenti per tenerle in
              ordine senza pensarci.
            </Lead>
          </Reveal>
        </div>

        <RevealGroup
          className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20 lg:grid-cols-6 lg:gap-5"
          stagger={90}
          scale={0.96}
          blur={8}
          y={24}
          duration={900}
        >
          <FeatureCard
            className="md:col-span-2 lg:col-span-4"
            title="Gli schermi cambiano, le icone no"
            text="Colleghi la TV o stacchi il secondo monitor: ogni icona torna esattamente dov’era, su ogni schermo."
            stage={<MonitorsScene />}
          />
          <FeatureCard
            className="lg:col-span-2"
            title="Cartelle di vetro"
            text="Avvicina due icone e nasce una cartella, come sull’iPhone. Un clic e si apre."
            stage={<FolderScene />}
          />
          <FeatureCard
            className="lg:col-span-3"
            title="Si ordinano da sole"
            text="Giochi, programmi e launcher come Steam, Epic e Battle.net vengono riconosciuti e raggruppati."
            stage={<SortScene />}
          />
          <FeatureCard
            className="lg:col-span-3"
            title="Disponi sul desktop"
            text="Un blocco per categoria, in otto posizioni. Prova: scegli dove metterlo e guarda l’anteprima."
            interactive
            stage={(on) => <ArrangeScene onScreen={on} />}
          />
          <FeatureCard
            className="lg:col-span-2"
            title="Trova al volo"
            text="Ctrl+Alt+Spazio, due lettere, Invio. Apri qualsiasi icona, anche dentro le cartelle."
            stage={<SearchScene />}
          />
          <FeatureCard
            className="md:col-span-2 lg:col-span-4"
            title="Leggero, e sempre reversibile"
            text="Parte con Windows, consuma pochissimo e tiene una cronologia: se qualcosa non ti piace, annulli."
            stage={<LightScene />}
          />
        </RevealGroup>
      </Container>
    </section>
  );
}
