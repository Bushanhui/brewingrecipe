/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#78421b',
        secondary: '#a67c52',
        accent: '#d9c5b2',
        mocha: '#c2a68e',
        'background-light': '#fdfbf9',
        'background-dark': '#1a1614',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
