export default defineNuxtConfig({
  compatibilityDate: "2025-12-23",

  typescript: {
    strict: true,
  },

  modules: ["@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  experimental: {
    appManifest: false,
  },
})
