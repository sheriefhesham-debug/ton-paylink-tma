import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // Server config (for local ngrok dev, ignored by Vercel)
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  },

  // --- THE DEFINITIVE FIX ---
  // Define 'global' as 'globalThis' for browser compatibility
  define: {
    'global': 'globalThis',
    'process.env': {}
  },

  // Alias Node.js modules to their browser-safe versions
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