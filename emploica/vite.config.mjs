import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  server: { port: 3000, host: true, allowedHosts: true },
  preview: { port: 3000, host: true, allowedHosts: true },
  build: { chunkSizeWarningLimit: 5000 },
});