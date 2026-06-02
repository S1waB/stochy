/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1A3C6E', light: '#2E5FA3', dark: '#0F2847', soft: '#071828' },
        accent: { DEFAULT: '#F0A500', soft: '#FDBA74', pink: '#EC4899', cyan: '#06B6D4' },
        surface: '#0B1220',
        background: '#040812',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: '#94A3B8'
      },
      boxShadow: {
        glow: '0 25px 80px rgba(46, 95, 163, 0.18)',
        soft: '0 18px 55px rgba(2, 8, 23, 0.32)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
