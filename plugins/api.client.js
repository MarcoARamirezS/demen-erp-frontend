export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const ui = useUiStore()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    async onRequest({ options }) {
      ui.showLoading()

      const auth = useAuthStore()
      if (auth.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${auth.accessToken}`,
        }
      }
    },

    async onResponse() {
      ui.hideLoading()
    },

    async onResponseError({ response }) {
      ui.hideLoading()

      const auth = useAuthStore()

      if (response.status === 401) {
        try {
          await auth.refresh()
        } catch {
          auth.logout()
          navigateTo("/login")
        }
      }
    },
  })

  return {
    provide: { api },
  }
})
