import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    permissions: [],
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: s => !!s.user,
    hasPermission: s => (p: string) => s.permissions.includes(p),
  },

  actions: {
    async login(payload: { usuario: string; password: string }) {
      await useApi('/auth/login', {
        method: 'POST',
        body: payload,
      })

      await this.fetchMe()
      console.log('@@@ isAuthenticaded => ', this.isAuthenticated)
      if (this.isAuthenticated) {
        navigateTo('/')
      }
    },

    async fetchMe() {
      try {
        this.loading = true

        const res = await useApi<any>('/auth/me')

        // 🔑 AJUSTE CLAVE
        this.user = {
          id: res.id,
        }
        this.permissions = res.permissions ?? []
      } catch (e: any) {
        if (e?.code === 401 || e?.status === 401) {
          await this.logout(false)
        } else {
          console.error('[fetchMe] non-auth error', e)
        }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async logout(redirect = true) {
      try {
        await useApi('/auth/logout', { method: 'POST' })
      } catch (e) {
        // ⚠️ Ignorar errores de logout (sesión ya inválida)
        console.warn('[auth] logout skipped', e)
      } finally {
        this.user = null
        this.permissions = []
        this.initialized = true
        if (redirect) navigateTo('/login')
      }
    },
  },
})
