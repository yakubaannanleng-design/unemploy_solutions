import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true, allowedHosts: true },
  preview: { port: 3000, host: true, allowedHosts: true },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { chunkSizeWarningLimit: 5000 },
});