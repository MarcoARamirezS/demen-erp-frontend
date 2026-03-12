export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    auth.fetchMe().catch(() => {})
  }
})
