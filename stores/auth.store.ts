import { defineStore } from 'pinia'
import { useUiStore } from '~/stores/ui.store'

interface LoginPayload {
  usuario: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const accessToken = useCookie<string | null>('accessToken')
    const refreshToken = useCookie<string | null>('refreshToken')

    return {
      userId: null as string | null,
      permissions: [] as string[],
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      loading: false,
    }
  },

  getters: {
    isAuthenticated: s => !!s.accessToken,
    hasPermission: s => (perm: string) => s.permissions.includes(perm),
  },

  actions: {
    async login(payload: LoginPayload) {
      const ui = useUiStore()
      const api = useApi

      this.loading = true
      ui.showLoading()

      try {
        const res = await api('/auth/login', {
          method: 'POST',
          body: payload,
        })

        // ✅ Cookies SSR-safe
        const accessToken = useCookie<string | null>('accessToken')
        const refreshToken = useCookie<string | null>('refreshToken')

        accessToken.value = res.accessToken
        refreshToken.value = res.refreshToken

        this.accessToken = res.accessToken
        this.refreshToken = res.refreshToken

        await this.fetchMe()

        ui.showToast('success', 'Bienvenido')
        navigateTo('/')
      } catch (e) {
        ui.showToast('error', 'Credenciales inválidas')
        throw e
      } finally {
        this.loading = false
        ui.hideLoading()
      }
    },

    async fetchMe() {
      const api = useApi
      const me = await api('/auth/me')

      this.userId = me.id
      this.permissions = me.permissions || []
    },

    async refresh() {
      const refreshToken = useCookie<string | null>('refreshToken')

      if (!refreshToken.value) return

      const api = useApi

      const res = await api('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: refreshToken.value },
      })

      const accessToken = useCookie<string | null>('accessToken')

      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
    },

    async logout() {
      const api = useApi
      const refreshToken = useCookie<string | null>('refreshToken')
      const accessToken = useCookie<string | null>('accessToken')

      if (refreshToken.value) {
        await api('/auth/logout', {
          method: 'POST',
          body: { refreshToken: refreshToken.value },
        })
      }

      // ✅ Limpieza total
      refreshToken.value = null
      accessToken.value = null

      this.$reset()
      navigateTo('/login')
    },
  },
})
