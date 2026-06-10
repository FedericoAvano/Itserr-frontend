// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Questa è la configurazione minima necessaria per React.
export default defineConfig({
  plugins: [react()],
  // Opzionale: imposta la porta standard di React
  server: {
    port: 3000, 
  }
});