import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static',
  // Update these values with your GitHub username and repository name
  site: 'https://yourusername.github.io',
  base: '/photography-portfolio'
});