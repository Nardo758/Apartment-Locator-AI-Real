import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI Components
          'ui-components': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          // Backend & Data
          'backend': ['@supabase/supabase-js', '@tanstack/react-query', 'axios'],
          // Forms
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Charts
          'charts': ['recharts'],
          // Utilities
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react']
        }
      }
    }
  }
}));
