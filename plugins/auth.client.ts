export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // 🔐 Leer tokens SOLO en cliente
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (accessToken && refreshToken) {
    auth.accessToken = accessToken
    auth.refreshToken = refreshToken

    try {
      await auth.fetchMe()
    } catch (e) {
      auth.logout()
    }
  }
})
