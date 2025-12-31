const fonts = require('./src/theme/fonts')
const colors = require('./src/theme/palette')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: fonts,
      colors: colors,
      fontSize: {
        xxs: ['.625rem', '1rem'],
      },
    },
  },
  plugins: [],
}
