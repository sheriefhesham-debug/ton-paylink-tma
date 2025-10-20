import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Let's rely on the plugin's defaults initially
      // Explicitly include buffer if needed, but start without
      // include: ['buffer'], 
      globals: {
        Buffer: true, // Still good to ensure Buffer is globally available
        // global: true, // Often not needed with this plugin
        // process: true, // Often not needed with this plugin
      },
      protocolImports: true, 
    }) 
  ],
  // REMOVED server section - only needed for dev server, not build
  // REMOVED define section - let polyfill handle process.env if needed
  // REMOVED optimizeDeps section - let polyfill handle globalThis/Buffer
})