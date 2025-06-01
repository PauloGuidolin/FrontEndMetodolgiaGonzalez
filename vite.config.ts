import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from 'fs'; // <-- ¡AÑADE ESTA LÍNEA!

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite escuchar en todas las interfaces de red
    https: {
      key: fs.readFileSync('./localhost+1-key.pem'), // Ruta a tu clave privada
      cert: fs.readFileSync('./localhost+1.pem')    // Ruta a tu certificado
    },
  },
});