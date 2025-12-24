export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const ui = useUiStore()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    async onRequest({ options }) {
      console.log("[API REQUEST]", {
        request,
        method: options.method || "GET",
        headers: options.headers,
        body: options.body || null,
      })
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

    async onResponseError({ response, request, options }) {
      ui.hideLoading()

      const auth = useAuthStore()

      if (response.status === 401 && auth.refreshToken) {
        try {
          await auth.refresh()

          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${auth.accessToken}`,
          }

          return await $fetch(request, options)
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
