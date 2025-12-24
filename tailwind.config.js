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
          primary: '#6FBF8E', // Verde DANAM
          'primary-content': '#0F2A1D',

          secondary: '#A7D7B5',
          'secondary-content': '#1F3D2B',

          accent: '#4FAE79',
          'accent-content': '#0F2A1D',

          neutral: '#2E3B33',
          'neutral-content': '#E6F1EA',

          'base-100': '#F4F8F3',
          'base-200': '#E8EFE6',
          'base-300': '#D4DED1',
          'base-content': '#24312A',

          info: '#3ABFF8',
          success: '#4FAE79',
          warning: '#FACC15',
          error: '#EF4444',
        },
      },
    ],
  },
}
