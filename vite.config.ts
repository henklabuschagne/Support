import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Configure server to allow iframe embedding
  server: {
    headers: {
      // Remove X-Frame-Options header to allow iframe embedding
      'X-Frame-Options': '',
      // Set CSP to allow embedding from any origin
      'Content-Security-Policy': "frame-ancestors *",
    },
  },

  // Configure preview to allow iframe embedding
  preview: {
    headers: {
      'X-Frame-Options': '',
      'Content-Security-Policy': "frame-ancestors *",
    },
  },
})