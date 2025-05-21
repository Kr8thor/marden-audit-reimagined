import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Remove the problematic import
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    proxy: {
      '/api': {
        target: 'https://marden-audit-backend-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    // Remove the component tagger in both modes
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure source maps are generated for easier debugging
    sourcemap: true,
    // Make output more verbose for debugging
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Ensure these are set correctly to fix asset path issues
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
}));