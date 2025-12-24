export default defineNuxtRouteMiddleware(async to => {
  // ⛔ No validar auth en SSR
  if (process.server) return

  const auth = useAuthStore()

  if (to.path === '/login') return

  if (!auth.accessToken) {
    return navigateTo('/login')
  }

  if (!auth.userId) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
      return navigateTo('/login')
    }
  }
})
