import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // In development: base = '/'  (nessuna variabile → funziona normalmente)
  // In GitHub Pages: base = '/nome-repo/' (impostato dalla GitHub Action)
  base: process.env.VITE_BASE_PATH || "/",
});
