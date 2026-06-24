/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          50:  '#e8f5f0',
          100: '#c3e6d8',
          500: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
          900: '#04342C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
