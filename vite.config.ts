import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base './' => funziona in locale, su GitHub Pages e aprendo dist/ da filesystem
export default defineConfig({
  base: "./",
  plugins: [react()],
});
