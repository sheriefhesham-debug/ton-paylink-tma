import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// We do NOT need any polyfill plugins

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // We STILL need the server config for local ngrok dev
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  },

  // This is CRITICAL for the 'buffer' package to work
  define: {
    'global': 'globalThis',
    'process.env': {}
  },

  // --- THE DEFINITIVE FIX: ALIAS NODE MODULES ---
  resolve: {
    alias: {
      // This tells Vite: "When code imports 'buffer', use the 'buffer/' package instead."
      buffer: 'buffer/',
      events: 'events/',
      process: "process/browser",
      stream: "stream-browserify",
      util: "util/",
      zlib: "browserify-zlib",
    }
  }
})