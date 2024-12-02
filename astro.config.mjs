import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://TarangK18.github.io',
  base: '/Photo-Portfolio',
  integrations: [tailwind(), react()],
  build: {
    assets: true  // Ensure assets are included in the build
  }
});