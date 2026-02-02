// middleware/guest.ts
export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const auth = useAuthStore()

  // ⚠️ SOLO usar el estado actual
  // NO forzar fetchMe en login
  if (auth.isAuthenticated) {
    return navigateTo('/')
  }
})
