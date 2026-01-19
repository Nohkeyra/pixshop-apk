import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // CRITICAL: The empty string or './' makes all paths relative.
  // This allows the APK to find assets using file:///android_asset/www/
  base: './',

  build: {
    // The folder Cordova looks for
    outDir: 'dist',
    // Cleans the folder before every build to prevent old file conflicts
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // FORCES the output filename to 'main.js' 
        // This stops the 404 error in your index.html
        entryFileNames: `assets/main.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },

  // Ensures the dev server in Termux matches your local environment
  server: {
    port: 3000,
    strictPort: true,
    host: true
  }
})
