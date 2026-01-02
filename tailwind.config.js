/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Prompt', 'sans-serif'],
        'body': ['Noto Serif Thai', 'serif'],
      },
      colors: {
        'election': {
          'primary': '#1e3a5f',
          'secondary': '#c9a227',
          'accent': '#e63946',
          'light': '#f1faee',
          'dark': '#14213d',
        }
      }
    },
  },
  plugins: [],
}

