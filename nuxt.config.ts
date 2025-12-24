export default defineNuxtConfig({
  compatibilityDate: "2025-12-23",
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",
    },
  },
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
