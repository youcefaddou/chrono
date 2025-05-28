/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode based on the 'dark' class
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Include all source files
  ],
  theme: {
    extend: {
      colors: {
        lightBackground: '#ffffff', // Background color for light mode
        darkBackground: '#1a202c', // Background color for dark mode
        lightText: '#1a202c', // Text color for light mode
        darkText: '#ffffff', // Text color for dark mode
      },
    },
  },
  plugins: [],
}
