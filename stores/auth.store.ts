import { defineStore } from "pinia"
import { useUiStore } from "~/stores/ui.store"

interface LoginPayload {
  usuario: string
  password: string
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userId: null as string | null,
    permissions: [] as string[],
    accessToken: null as string | null,
    refreshToken: null as string | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.accessToken,
    hasPermission: (s) => (perm: string) =>
      s.permissions.includes(perm),
  },

  actions: {
    async login(payload: LoginPayload) {
      const ui = useUiStore()
      const api = useApi

      this.loading = true
      ui.showLoading()

      try {
        const res = await api("/auth/login", {
          method: "POST",
          body: payload,
        })

        this.accessToken = res.accessToken
        this.refreshToken = res.refreshToken

        await this.fetchMe()

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

    async fetchMe() {
      const api = useApi
      const me = await api("/auth/me")

      this.userId = me.id
      this.permissions = me.permissions || []
    },

    async refresh() {
      if (!this.refreshToken) return

      const api = useApi

      const res = await api("/auth/refresh", {
        method: "POST",
        body: { refreshToken: this.refreshToken },
      })

      this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
    },

    async logout() {
      const api = useApi

      if (this.refreshToken) {
        await api("/auth/logout", {
          method: "POST",
          body: { refreshToken: this.refreshToken },
        })
      }

      this.$reset()
      navigateTo("/login")
    },
  },
})
