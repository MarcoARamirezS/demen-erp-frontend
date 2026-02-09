/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js}',
    './components/**/*.{vue,js}',
    './layouts/**/*.{vue,js}',
    './pages/**/*.{vue,js}',
    './plugins/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
        serif: ['Times New Roman', 'serif'],
      },
      borderRadius: {
        danam: '0.75rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        danam: {
          /* BRAND */
          primary: '#4FAE85',
          'primary-content': '#0B2418',

          secondary: '#9FD0B0',
          'secondary-content': '#1E3A2A',

          accent: '#1E7F5C',
          'accent-content': '#ECF8F1',

          /* NEUTRAL */
          neutral: '#334840',
          'neutral-content': '#EAF3ED',

          /* BASE */
          'base-100': '#F6FAF6',
          'base-200': '#EDF4EE',
          'base-300': '#D9E5DD',
          'base-content': '#26352E',

          /* STATES */
          info: '#38BDF8',
          success: '#2E8B67',
          warning: '#FBBF24',
          error: '#EF4444',
        },
      },
    ],
  },
}
