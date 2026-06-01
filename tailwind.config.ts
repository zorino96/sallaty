import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#D4AF6A',
          500: '#C8A654',
          600: '#A8893F',
          700: '#86692F',
        },
        cream: {
          50:  '#FBF6E9',
          100: '#F5EFE0',
          200: '#EEE5D0',
          300: '#E4D7B5',
        },
        ink: {
          800: '#1A1A1A',
        },
        teal: {
          200: '#99F6E4',
          700: '#1D3D38',
          800: '#152F2B',
          900: '#0E2421',
        },
        sky: {
          fajr:    '#3D2C5C',
          shuruq:  '#E89B5E',
          dhuhr:   '#A8D0E0',
          asr:     '#B0703C',
          maghrib: '#6B1F35',
          isha:    '#14122A',
        },
      },
      fontFamily: {
        rabar:  ['Rabar', 'Vazirmatn', 'Almarai', 'sans-serif'],
        arabic: ['Almarai', 'Vazirmatn', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
        gold:  '0 6px 18px rgba(200, 166, 84, 0.35)',
      },
      animation: {
        'spin-slow': 'spin 80s linear infinite',
        'fade-in':   'fade-in 240ms ease-out',
        'scale-pop': 'scale-pop 220ms ease-out',
      },
      keyframes: {
        'fade-in':   { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-pop': { '0%': { transform: 'scale(0.9)', opacity: '0' },     '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
