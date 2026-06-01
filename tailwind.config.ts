import type { Config } from 'tailwindcss';

/**
 * "The Illuminated Hours" design system.
 *
 * Palette of Qur'anic manuscript illumination: lapis lazuli, gold leaf,
 * parchment ivory, with jewel-tone accents. The legacy token NAMES
 * (gold / cream / ink / teal / sky) are preserved so every existing page
 * keeps working — but their VALUES are re-pointed to the new palette, so
 * the whole app is re-skinned at once. New tokens (lapis / parch / ivory /
 * jewel) are added for the rebuilt chrome.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Gold leaf — the illumination metal. (legacy keys 400-700 kept)
        gold: {
          200: '#FAF0CF',
          300: '#F4E3B0',
          400: '#ECCE80',
          500: '#E0BC63',
          600: '#C9A24A',
          700: '#A8812F',
          800: '#856321',
          900: '#5E4615',
        },
        // Parchment ivory — re-points legacy `cream`.
        cream: {
          50:  '#FCF7EA',
          100: '#F5EBD4',
          200: '#ECDFC2',
          300: '#E0CEA6',
        },
        parch: {
          50:  '#FCF7EA',
          100: '#F5EBD4',
          200: '#ECDFC2',
          300: '#E0CEA6',
          400: '#D0B888',
        },
        // Sepia manuscript ink — re-points legacy `ink`.
        ink: {
          700: '#574329',
          800: '#2A2012',
          900: '#1C1509',
        },
        // Lapis lazuli — re-points legacy `teal` (so dark mode becomes lapis,
        // not teal, everywhere the old classes are used).
        teal: {
          200: '#A9BCF2',
          700: '#1C2E76',
          800: '#142057',
          900: '#0A1330',
        },
        lapis: {
          950: '#070B22',
          900: '#0A1330',
          800: '#142057',
          700: '#1C2E76',
          600: '#27399A',
          500: '#3850B4',
          400: '#5E78D6',
          300: '#92A8EC',
        },
        ivory: {
          100: '#F6EEDA',
          200: '#E9DCC0',
          300: '#CDBD9C',
        },
        // Jewel accents drawn from illuminated pigments.
        jewel: {
          garnet: '#B0455C',
          rose:   '#D78097',
          jade:   '#1F8A6E',
          teal:   '#2A8E8E',
          violet: '#6A4A9C',
          amber:  '#D9923A',
        },
        // Sky-of-the-hour anchors (richer than before).
        sky: {
          fajr:    '#3A2A63',
          shuruq:  '#E8945A',
          dhuhr:   '#5E97D6',
          asr:     '#B97A38',
          maghrib: '#7A2547',
          isha:    '#0C153B',
        },
      },
      fontFamily: {
        // Kurdish UI (kept). Almarai/Vazirmatn body fallback (kept).
        rabar:  ['Rabar', 'Vazirmatn', 'Almarai', 'sans-serif'],
        arabic: ['Almarai', 'Vazirmatn', 'sans-serif'],
        // New display voices.
        script: ['"Aref Ruqaa"', 'Amiri', 'serif'], // calligraphic Arabic display
        naskh:  ['Amiri', 'serif'],                  // Arabic serif body
        clock:  ['Fraunces', 'Amiri', 'Georgia', 'serif'], // luxe numerals
      },
      boxShadow: {
        gold:  '0 8px 26px -6px rgba(201, 162, 74, 0.45)',
        glow:  '0 0 0 1px rgba(224,188,99,0.30), 0 10px 40px -8px rgba(224,188,99,0.35)',
        glass: '0 18px 50px -16px rgba(7, 11, 34, 0.55)',
        panel: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 10px 30px -14px rgba(42,32,18,0.30)',
        'panel-d': 'inset 0 1px 0 rgba(224,188,99,0.10), 0 16px 44px -18px rgba(0,0,0,0.7)',
        node: '0 0 14px 1px rgba(236,206,128,0.85)',
      },
      letterSpacing: {
        kashida: '0.32em',
      },
      animation: {
        'spin-slow':  'spin 110s linear infinite',
        'spin-rev':   'spin 150s linear infinite reverse',
        'fade-in':    'fade-in 280ms cubic-bezier(0.2,0.7,0.2,1) both',
        'rise':       'rise 620ms cubic-bezier(0.16,0.84,0.3,1) both',
        'scale-pop':  'scale-pop 260ms cubic-bezier(0.2,0.8,0.2,1) both',
        'draw':       'draw 1500ms cubic-bezier(0.6,0,0.2,1) forwards',
        'twinkle':    'twinkle 3.4s ease-in-out infinite',
        'float-y':    'float-y 6s ease-in-out infinite',
        'shimmer':    'shimmer 4.5s linear infinite',
        'halo':       'halo 4s ease-in-out infinite',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'rise':     {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.985)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        'scale-pop': { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'draw':     { '0%': { strokeDashoffset: 'var(--len,520)' }, '100%': { strokeDashoffset: '0' } },
        'twinkle':  { '0%,100%': { opacity: '0.25', transform: 'scale(0.85)' }, '50%': { opacity: '1', transform: 'scale(1)' } },
        'float-y':  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        'shimmer':  { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        'halo':     { '0%,100%': { opacity: '0.55', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.08)' } },
      },
    },
  },
  plugins: [],
};

export default config;
