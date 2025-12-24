export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (to.path === "/login") return

  if (!auth.isAuthenticated) {
    return navigateTo("/login")
  }

  if (!auth.userId) {
    try {
      await auth.fetchMe()
    } catch {
      return navigateTo("/login")
    }
  }
})
