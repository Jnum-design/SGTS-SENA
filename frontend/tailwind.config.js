/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        sena: { DEFAULT: '#39A900', dark: '#2d8600', light: '#e9f7df' },
        navy: { DEFAULT: '#003366', dark: '#00264d', light: '#0b4a8a' },
        brand: '#1e5eff',
      },
      fontFamily: { sans: ['Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
