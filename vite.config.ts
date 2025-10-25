import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // We are no longer using any node polyfill plugins
  ],
  
  // We still need the server config for local ngrok dev
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  },

  // Define 'global' as 'globalThis' for browser compatibility (for Buffer, etc.)
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
      // We can add more here if other errors pop up, but this covers the main ones.
    }
  }
})