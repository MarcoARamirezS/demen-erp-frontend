import { defineStore } from "pinia"
import { useUiStore } from "~/stores/ui.store"

interface LoginCredentials {
  username: string
  password: string
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    loading: false,
  }),

  actions: {
    async login(credentials: LoginCredentials) {
      const api = useApi()
      const ui = useUiStore()

      this.loading = true
      ui.showLoading()

      try {
        const res = await api("/auth/login", {
          method: "POST",
          body: credentials,
        })

        this.accessToken = res.accessToken
        this.refreshToken = res.refreshToken
        this.user = res.user

        ui.showToast("success", "Bienvenido")
        navigateTo("/")
      } catch (e) {
        ui.showToast("error", "Credenciales inválidas")
        throw e
      } finally {
        this.loading = false
        ui.hideLoading()
      }
    },

    async refresh() {
      const api = useApi()

      const res = await api("/auth/refresh", {
        method: "POST",
        body: {
          refreshToken: this.refreshToken,
        },
      })

      this.accessToken = res.accessToken
    },

    async fetchMe() {
      const api = useApi()
      this.user = await api("/auth/me")
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      navigateTo("/login")
    },
  },
})
