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
          primary: '#5FB989', // un poco más profundo
          'primary-content': '#0B2418',

          secondary: '#9FD0B0',
          'secondary-content': '#1E3A2A',

          accent: '#3FA06F', // más contraste para acciones
          'accent-content': '#0B2418',

          neutral: '#2C3A32',
          'neutral-content': '#E3EFE8',

          // ⬇️ CLAVE PARA EL SIDEBAR
          'base-100': '#F6FAF6', // fondo app
          'base-200': '#EDF4EE', // cards
          'base-300': '#D9E5DD', // bordes

          'base-content': '#1F2D26', // texto principal (↑ contraste)

          info: '#38BDF8',
          success: '#3FA06F',
          warning: '#FBBF24',
          error: '#EF4444',
        },
      },
    ],
  },
}
