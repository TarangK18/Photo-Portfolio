import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  site: 'https://yourusername.github.io',
  base: '/your-repo-name',
  build: {
    assets: 'assets'
  }
});