/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'idf-olive': '#4B5320',
        'dark-olive': '#2D3D1A',
        'light-sand': '#F5F5DC',
        'military-green': '#6B8E23',
        'accent-green': '#A6C36F',
      },
      fontFamily: {
        'assistant': ['Assistant', 'sans-serif'],
      },
    },
  },
  plugins: [],
}