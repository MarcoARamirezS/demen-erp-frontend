export default defineNuxtRouteMiddleware(async to => {
  const auth = useAuthStore()

  if (to.path === '/login') return

  if (!auth.accessToken) {
    return navigateTo('/login')
  }

  if (!auth.user && !auth.loading) {
    try {
      await auth.fetchMe()
    } catch {
      return navigateTo('/login')
    }
  }
})
