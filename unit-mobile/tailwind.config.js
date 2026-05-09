/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy:  '#000080',
        mint:  '#1F7A5C',
        coral: '#B73E37',
        cream: '#FAF8F4',
      },
      fontFamily: {
        sans: ['Pretendard'],
        mono: ['ui-monospace', 'Menlo'],
      },
    },
  },
  plugins: [],
};
