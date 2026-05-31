/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A3C6E', light: '#2E5FA3', dark: '#0F2847' },
        accent: '#F0A500',
        surface: '#FFFFFF',
        background: '#F5F7FA',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
