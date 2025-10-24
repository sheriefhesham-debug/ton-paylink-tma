import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Options to ensure Buffer etc. are available
      include: ['buffer', 'events'], // Explicitly include buffer and events
      globals: {
        Buffer: true, // Make Buffer available globally
        global: true,
        process: true,
      },
      protocolImports: true, // Needed for some modules like 'url'
    })
  ],
  // Server config for local development with ngrok
  server: {
    host: true, // Allows Vite to listen on all available IPs
    hmr: {
      // Use your stable ngrok hostname here
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', // Replace if your ngrok URL changed
      protocol: 'wss' // Use secure websockets
    },
    // Allows connections from your ngrok host
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] // Replace if your ngrok URL changed
  }
})