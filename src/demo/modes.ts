export type ModeKey = "ios" | "cat" | "multi" | "lock";

export interface ModeDef {
  key: ModeKey;
  title: string;
  caption: string;
  /** ms before auto-advancing */
  duration: number;
}

export const MODES: ModeDef[] = [
  {
    key: "ios",
    title: "Cartelle stile iOS",
    caption: "Trascina un'icona su un'altra e nasce una cartella di vetro. Un clic e si apre.",
    duration: 7000,
  },
  {
    key: "cat",
    title: "Disponi per categoria",
    caption: "Giochi, programmi, documenti e media trovano da soli il loro angolo.",
    duration: 7000,
  },
  {
    key: "multi",
    title: "Multi-monitor",
    caption: "Stacca il secondo schermo o la TV: ogni icona torna esattamente dov'era.",
    duration: 8400,
  },
  {
    key: "lock",
    title: "Blocca le icone",
    caption: "Basta icone spostate per sbaglio: bloccale e restano al loro posto.",
    duration: 7800,
  },
];
