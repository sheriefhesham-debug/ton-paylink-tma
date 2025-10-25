import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// Removed 'path' import, it's not needed here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // We are NOT using polyfill plugins, we use aliases
  ],
  
  // Server config (only for local 'npm run dev', ignored by Vercel)
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  },

  // Define 'global' for browser compatibility (for 'buffer' package)
  define: {
    'global': 'globalThis',
    'process.env': {}
  },

  // --- THE DEFINITIVE FIX: ALIAS NODE MODULES ---
  resolve: {
    alias: {
      buffer: 'buffer/',
      events: 'events/',
      process: "process/browser",
      stream: "stream-browserify",
      util: "util/",
      zlib: "browserify-zlib",
    }
  }
})