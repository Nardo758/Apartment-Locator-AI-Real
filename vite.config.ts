import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
  }
}));
