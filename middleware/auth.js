export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.accessToken) {
    return navigateTo("/login")
  }

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }
})
