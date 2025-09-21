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
    // Increase chunk size warning limit to 1000kb (1MB)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          
          // All Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'ui-components';
          }
          
          // Backend & API libraries
          if (id.includes('@supabase/') || id.includes('@tanstack/') || id.includes('axios')) {
            return 'backend';
          }
          
          // Form handling libraries
          if (id.includes('react-hook-form') || id.includes('@hookform/') || id.includes('zod')) {
            return 'forms';
          }
          
          // Chart libraries
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          
          // Utility libraries
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || 
              id.includes('class-variance-authority') || id.includes('lucide-react')) {
            return 'utils';
          }
          
          // Large third-party libraries
          if (id.includes('puppeteer') || id.includes('cheerio')) {
            return 'scraping';
          }
          
          // Node modules that are large
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // Application code - split by feature
          if (id.includes('src/pages/')) {
            return 'pages';
          }
          
          if (id.includes('src/components/')) {
            return 'components';
          }
          
          if (id.includes('src/lib/')) {
            return 'lib';
          }
          
          if (id.includes('src/hooks/')) {
            return 'hooks';
          }
        }
      }
    }
  }
}));
