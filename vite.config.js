import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        detail: resolve(__dirname, "src/detail.html"),
        list: resolve(__dirname, "src/list.html"),
      },
    },
  },
});
