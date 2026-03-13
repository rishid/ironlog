/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#25253e',
          lighter: '#30304a',
        },
        accent: {
          DEFAULT: '#e94560',
          light: '#ff6b81',
        },
        success: '#4ade80',
        warning: '#f59e0b',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}
