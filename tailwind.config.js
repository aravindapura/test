/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        lotus: {
          light: '#fef3f7',
          DEFAULT: '#f8e1ec',
          dark: '#e4b5cc'
        }
      }
    }
  },
  plugins: []
};
