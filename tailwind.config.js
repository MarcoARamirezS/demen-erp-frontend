import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
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
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        danam: {
          /* =========================
             BRAND
          ========================= */
          primary: '#1F7A5A',
          'primary-content': '#F5FCF8',

          secondary: '#8FC8AC',
          'secondary-content': '#163427',

          accent: '#145C43',
          'accent-content': '#F3FBF7',

          /* =========================
             NEUTRAL
          ========================= */
          neutral: '#23332C',
          'neutral-content': '#ECF5F0',

          /* =========================
             BASE
          ========================= */
          'base-100': '#FFFFFF',
          'base-200': '#F4F8F5',
          'base-300': '#DCE8E0',
          'base-content': '#16211B',

          /* =========================
             STATES
          ========================= */
          info: '#0EA5E9',
          'info-content': '#F5FBFF',

          success: '#15803D',
          'success-content': '#F3FFF7',

          warning: '#D97706',
          'warning-content': '#FFF9F2',

          error: '#DC2626',
          'error-content': '#FFF5F5',

          /* =========================
             OPTIONAL DAISY TOKENS
          ========================= */
          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.2s',
          '--animation-input': '0.2s',
          '--btn-focus-scale': '0.98',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.75rem',
        },
      },
    ],
  },
}
