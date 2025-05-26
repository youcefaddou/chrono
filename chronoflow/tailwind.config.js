import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  future: {
    defaultColorPalette: 'classic',
  },
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        black: '#000',
        gray: {
          600: '#4b5563',
        },
        pink: {
          600: '#db2777',
        },
      },
    },
  },
  plugins: [],
}
