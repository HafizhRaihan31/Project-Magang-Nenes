/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#94bfe0',
          400: '#5f9fd0',
          500: '#3a81c0',
          600: '#2867a5',
          700: '#215386',
          800: '#1e466f',
          900: '#1d3c5d',
          950: '#13263d',
        }
      }
    },
  },
  plugins: [],
}
