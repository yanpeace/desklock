import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves the site at https://yanpeace.github.io/desklock/
export default defineConfig({
  base: "/desklock/",
  plugins: [react(), tailwindcss()],
  build: { target: "es2020", cssCodeSplit: true },
});
