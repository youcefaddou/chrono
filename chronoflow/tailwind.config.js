import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  future: {
    defaultColorPalette: 'classic',
  },
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Include all source files
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
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
    },
  },
  plugins: [],
}
