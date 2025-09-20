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
        manualChunks: (id) => {
          try {
            // Safety check for valid module IDs
            if (!id || typeof id !== 'string') return null;
            
            // Server-only libraries - exclude from client bundle
            if (id.includes('puppeteer') || 
                id.includes('cheerio') || 
                id.includes('node:') ||
                id.includes('/node_modules/pg/') ||
                id.includes('/node_modules/fs/') ||
                id.includes('/node_modules/os/')) {
              return null;
            }

            // Client-safe chunking logic
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui/')) {
              return 'ui-components';
            }
            if (id.includes('@supabase/') || id.includes('@tanstack/') || id.includes('axios')) {
              return 'backend';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('zod')) {
              return 'forms';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || 
                id.includes('class-variance-authority') || id.includes('lucide-react')) {
              return 'utils';
            }
            if (id.includes('node_modules') && !id.includes('puppeteer') && !id.includes('cheerio')) {
              return 'vendor';
            }
            if (id.includes('src/pages/')) {
              return 'pages';
            }
            if (id.includes('src/components/')) {
              return 'components';
            }
            if (id.includes('src/lib/') && !id.includes('server')) {
              return 'lib';
            }
            if (id.includes('src/hooks/')) {
              return 'hooks';
            }
            return null;
          } catch (error) {
            console.warn('Error processing chunk:', id, error);
            return null;
          }
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
