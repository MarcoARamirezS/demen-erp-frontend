export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // Leer storage SOLO en cliente
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (accessToken && refreshToken) {
    auth.accessToken = accessToken
    auth.refreshToken = refreshToken

    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }
})
