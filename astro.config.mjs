// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Build_Statis: keluaran build statis (HTML/CSS/JS) untuk dilayani Apache (Req 8, 9).
  output: 'static',
  integrations: [
    react(),
    tailwind({
      // Kami mengelola direktif Tailwind sendiri melalui src/styles/global.css.
      applyBaseStyles: false,
    }),
  ],
});
