import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Options
      include: ['buffer'], 
      globals: {
        Buffer: true, 
        global: true,
        process: true,
      },
      protocolImports: true, 
    }) 
  ],
  // Add the server configuration back
  server: {
    // Explicitly allow connections from your ngrok host
    host: true, // Allows Vite to listen on all available IPs, needed for ngrok
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', // Ensures HMR works through ngrok
      protocol: 'wss' // Use secure websockets
    },
    // ** THIS IS THE CRITICAL FIX **
    // Add your ngrok hostname to the allowed list
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  }
})