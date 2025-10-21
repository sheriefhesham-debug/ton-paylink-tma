import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    })
  ],
  server: {
    // Allows Vite to listen on all available IPs, needed for ngrok
    host: true, 
    // Configuration for Hot Module Replacement (HMR) through ngrok
    hmr: {
      // Use your stable ngrok hostname here
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' // Use secure websockets
    },
    // Allows connections from your ngrok host
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  }
})