import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import defaultViteConfig from "./vite.config";

// https://vitejs.dev/config/
export default defineConfig({
  ...defaultViteConfig,
  build: {
    ...defaultViteConfig.build,
    watch: {
      include: path.join(__dirname, "src/**/*"),
      clearScreen: false,
    },
  },
});
