/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e18',
        surface: {
          primary: '#0f131d',
          elevated: '#171b26',
          card: '#1c1f2a',
        },
        cinema: {
          red: '#e50914',
          'red-hover': '#b80710',
          glow: 'rgba(229, 9, 20, 0.4)',
        },
        amber: {
          accent: '#f59e0b',
        },
        text: {
          main: '#f9fafb',
          secondary: '#9ca3af',
          muted: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cinema-glow': '0 0 25px -5px rgba(229, 9, 20, 0.3)',
        'amber-glow': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
