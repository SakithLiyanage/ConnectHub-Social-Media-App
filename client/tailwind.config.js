/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1d4ed8',
        'primary-light': '#3b82f6',
        'primary-dark': '#1e40af',
        'secondary': '#f97316',
        'secondary-light': '#fb923c',
        'secondary-dark': '#ea580c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}