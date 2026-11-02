import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Car,
  Clapperboard,
  CodeXml,
  Crown,
  FileText,
  FileType,
  Gamepad2,
  Globe,
  Image,
  Joystick,
  MessageCircle,
  Mic,
  Music,
  NotebookPen,
  Puzzle,
  Radio,
  Settings,
  Sheet,
  Shield,
  StickyNote,
  Swords,
  Terminal,
  Folder,
} from "lucide-react";

export type Category = "giochi" | "programmi" | "documenti" | "media";

export interface AppIcon {
  id: string;
  label: string;
  cat: Category;
  glyph: LucideIcon;
  /** two-stop gradient for the rounded glyph */
  from: string;
  to: string;
  /** glyph stroke color */
  ink?: string;
}

export const CATEGORY_NAME: Record<Category, string> = {
  giochi: "Giochi",
  programmi: "Programmi",
  documenti: "Documenti",
  media: "Media",
};

export const CATEGORIES: Category[] = ["giochi", "programmi", "documenti", "media"];

/** 24 generic desktop "apps": no real logos, just rounded glyphs with distinct colors. */
export const ICONS: AppIcon[] = [
  // Giochi
  { id: "steam", label: "Steam", cat: "giochi", glyph: Gamepad2, from: "#3b4a6b", to: "#1b2338" },
  { id: "epic", label: "Epic", cat: "giochi", glyph: Swords, from: "#4a4a52", to: "#202024" },
  { id: "arcade", label: "Arcade", cat: "giochi", glyph: Joystick, from: "#ff6a88", to: "#c2185b" },
  { id: "racing", label: "Racing", cat: "giochi", glyph: Car, from: "#ffb347", to: "#e8590c" },
  { id: "puzzle", label: "Puzzle", cat: "giochi", glyph: Puzzle, from: "#7ee8a1", to: "#1f9d55" },
  { id: "scacchi", label: "Scacchi", cat: "giochi", glyph: Crown, from: "#c7a6ff", to: "#6741d9" },
  // Programmi
  { id: "brave", label: "Brave", cat: "programmi", glyph: Shield, from: "#ff8a4c", to: "#e8430c" },
  { id: "web", label: "Web", cat: "programmi", glyph: Globe, from: "#6cc6ff", to: "#1c7ed6" },
  { id: "discord", label: "Discord", cat: "programmi", glyph: MessageCircle, from: "#8c9eff", to: "#4c5fd5" },
  { id: "code", label: "Code", cat: "programmi", glyph: CodeXml, from: "#4dabf7", to: "#1864ab" },
  { id: "terminale", label: "Terminale", cat: "programmi", glyph: Terminal, from: "#3a3d45", to: "#15161a", ink: "#9ef0b5" },
  { id: "impostazioni", label: "Impostazioni", cat: "programmi", glyph: Settings, from: "#adb5bd", to: "#5c636a" },
  // Documenti
  { id: "note", label: "Note", cat: "documenti", glyph: StickyNote, from: "#ffe066", to: "#f59f00", ink: "#4a3500" },
  { id: "fattura", label: "Fattura.pdf", cat: "documenti", glyph: FileText, from: "#ff8787", to: "#c92a2a" },
  { id: "tesi", label: "Tesi.docx", cat: "documenti", glyph: FileType, from: "#74c0fc", to: "#1971c2" },
  { id: "budget", label: "Budget.xlsx", cat: "documenti", glyph: Sheet, from: "#8ce99a", to: "#2b8a3e" },
  { id: "progetti", label: "Progetti", cat: "documenti", glyph: Folder, from: "#ffd8a8", to: "#f08c00", ink: "#5c3300" },
  { id: "appunti", label: "Appunti", cat: "documenti", glyph: NotebookPen, from: "#f1efea", to: "#bfbab0", ink: "#3d3a35" },
  // Media
  { id: "foto", label: "Foto", cat: "media", glyph: Image, from: "#63e6be", to: "#0b7285" },
  { id: "musica", label: "Musica", cat: "media", glyph: Music, from: "#ff6b9a", to: "#a61e4d" },
  { id: "video", label: "Video", cat: "media", glyph: Clapperboard, from: "#9775fa", to: "#5f3dc4" },
  { id: "podcast", label: "Podcast", cat: "media", glyph: Mic, from: "#da77f2", to: "#862e9c" },
  { id: "radio", label: "Radio", cat: "media", glyph: Radio, from: "#69db7c", to: "#2f9e44" },
  { id: "camera", label: "Camera", cat: "media", glyph: Camera, from: "#495057", to: "#212529", ink: "#ffd43b" },
];

export const ICON_BY_ID: Record<string, AppIcon> = Object.fromEntries(ICONS.map((i) => [i.id, i]));

export const byCat = (c: Category) => ICONS.filter((i) => i.cat === c).map((i) => i.id);
