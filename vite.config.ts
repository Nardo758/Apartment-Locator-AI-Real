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
    // Ensure componentTagger returns a valid plugin or false
    mode === 'development' && typeof componentTagger === 'function' ? componentTagger() : false,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Ensure proper environment variables for client-side
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      external: [
        // Exclude server-only packages from client build
        'puppeteer',
        'cheerio',
        'pg',
        'fs',
        'path',
        'os'
      ],
      output: {
        manualChunks: {
          // Ensure React is in its own stable chunk
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'ui-lib': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-lib': ['@tanstack/react-query'],
          'supabase-lib': ['@supabase/supabase-js'],
        },
      },
    },
  },
  // SSR configuration
  ssr: {
    noExternal: ['@radix-ui/*']
  },
  optimizeDeps: {
    exclude: ['puppeteer', 'cheerio', 'pg']
  }
}));
