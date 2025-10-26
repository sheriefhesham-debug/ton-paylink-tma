import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // More comprehensive polyfill setup
    nodePolyfills({
      include: ['buffer', 'events', 'util', 'stream', 'string_decoder', 'process'], 
      globals: {
        Buffer: true, 
        global: true,
        process: true,
      },
      protocolImports: true, 
    }) 
  ],
  // Server config for local dev (can keep or remove for build check)
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  }
})