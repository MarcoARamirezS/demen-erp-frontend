export default defineNuxtRouteMiddleware(async to => {
  const auth = useAuthStore()

  // Permitir login siempre
  if (to.path === '/login') return

  // Si no hay token → login
  if (!auth.accessToken) {
    return navigateTo('/login')
  }

  // Si hay token pero no usuario cargado
  if (!auth.userId) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
      return navigateTo('/login')
    }
  }
})
