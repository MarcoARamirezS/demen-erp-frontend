// middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  // ⛔ Evitar auth en SSR (cookies no disponibles)
  if (process.server) return

  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchMe()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/')
  }
})
