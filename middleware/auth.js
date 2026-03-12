export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const auth = useAuthStore()

  if (!auth.initialized) return

  if (!auth.isAuthenticated) {
    return navigateTo('/')
  }
})
