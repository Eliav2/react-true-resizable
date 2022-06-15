import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import typescript from "@rollup/plugin-typescript";
// import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [react()],
  // root: "demo",
  build: {
    emptyOutDir: true,
    // outDir: path.join(__dirname, "dist"),
    outDir: "dist",
    lib: {
      // entry: path.join(__dirname, "src", "index.tsx"),
      entry: "src/index.tsx",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      // plugins: [typescript({ tsconfig: "tsconfig.build.json" })], // relatively slow, so running tsc concurrently using package.json script
      external: ["react", "react-dom", "react-fast-compare"],
    },
  },
});
