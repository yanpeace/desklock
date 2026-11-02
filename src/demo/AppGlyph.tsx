import { memo } from "react";
import type { AppIcon } from "./data";
import { GLYPH } from "./scene";

/** A rounded "app" glyph: gradient squircle + soft highlight + line symbol. */
export const AppGlyph = memo(function AppGlyph({ icon, size = GLYPH }: { icon: AppIcon; size?: number }) {
  const G = icon.glyph;
  return (
    <div
      className="relative grid place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        background: `linear-gradient(155deg, ${icon.from}, ${icon.to})`,
        boxShadow:
          "inset 0 1px 0 rgb(255 255 255 / 0.28), inset 0 -1px 0 rgb(0 0 0 / 0.25), 0 3px 8px -2px rgb(0 0 0 / 0.55)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          background: "radial-gradient(120% 70% at 30% 0%, rgb(255 255 255 / 0.32), transparent 55%)",
        }}
      />
      <G size={size * 0.5} strokeWidth={2.1} color={icon.ink ?? "#fff"} aria-hidden />
    </div>
  );
});
