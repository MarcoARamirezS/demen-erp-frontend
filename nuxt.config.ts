export default defineNuxtConfig({
  compatibilityDate: '2025-12-23',
  nitro: {
    prerender: {
      ignore: [
        '/clients',
        '/dashboard',
        '/inventory',
        '/products',
        '/suppliers',
        '/roles',
        '/usuarios',
        '/audit',
        '/projects',
        '/recepciones',
        '/supplier-products',
        '/settings',
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
    },
  },
  typescript: {
    strict: true,
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  experimental: {
    appManifest: false,
  },
  devtools: { enabled: false },
})
