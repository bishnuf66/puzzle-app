import dotenv from 'dotenv';

import { defineConfig } from 'vite'

// Load .env file variables
dotenv.config();

import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
