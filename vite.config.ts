import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "demo",
  build: {
    // emptyOutDir: true,
    outDir: path.join(__dirname, "dist"),
    lib: {
      entry: path.join(__dirname, "src", "index.tsx"),
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-fast-compare"],
    },
  },
});
