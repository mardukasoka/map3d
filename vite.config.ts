import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
    }),
  ],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  build: {
    sourcemap: false,
    reportCompressedSize: false,
  },
});
