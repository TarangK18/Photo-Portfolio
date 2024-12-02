/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        lime: '#abd699',
        lemon: '#ffe26a',
        teal: '#75c9b7',
        mint: '#c7ddcc',
        navy: '#16123f',
      },
    },
  },
  plugins: [],
}