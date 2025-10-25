import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // We still need the server config ONLY for local ngrok dev
  // This block is IGNORED by Vercel's production build
  server: {
    host: true, 
    hmr: {
      host: 'debonair-undoctrinally-phylicia.ngrok-free.dev', 
      protocol: 'wss' 
    },
    allowedHosts: ['debonair-undoctrinally-phylicia.ngrok-free.dev'] 
  }
})