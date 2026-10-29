import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "features": path.resolve(__dirname, "./src/features"),
      "lib": path.resolve(__dirname, "./src/lib"),
      "components": path.resolve(__dirname, "./src/components"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  server: { port: 3001, host: true, allowedHosts: true },
  preview: { port: 3001, host: true, allowedHosts: true },
  build: { chunkSizeWarningLimit: 5000 },
});