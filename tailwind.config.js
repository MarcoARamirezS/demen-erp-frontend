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
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.06)',
        card: '0 10px 35px rgba(22, 33, 27, 0.08)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    darkTheme: 'danam',
    themes: [
      {
        danam: {
          /* =========================
             BRAND
          ========================= */
          primary: '#1F7A5A',
          'primary-content': '#F7FFFB',

          secondary: '#8FC8AC',
          'secondary-content': '#18352A',

          accent: '#145C43',
          'accent-content': '#F4FFFA',

          /* =========================
             NEUTRAL
          ========================= */
          neutral: '#24342D',
          'neutral-content': '#EEF7F2',

          /* =========================
             BASE
          ========================= */
          'base-100': '#FFFFFF',
          'base-200': '#F3F8F5',
          'base-300': '#D7E4DC',
          'base-content': '#17231C',

          /* =========================
             STATES
          ========================= */
          info: '#0284C7',
          'info-content': '#F3FAFF',

          success: '#15803D',
          'success-content': '#F3FFF7',

          warning: '#C56A0A',
          'warning-content': '#FFF7ED',

          error: '#C62828',
          'error-content': '#FFF5F5',

          /* =========================
             OPTIONAL TOKENS
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
