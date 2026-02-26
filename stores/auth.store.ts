import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { id: string },
    permissions: [] as string[],
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: s => !!s.user,
    hasPermission: s => (p: string) => s.permissions.includes(p),
  },

  actions: {
    async login(payload: { usuario: string; password: string }) {
      this.loading = true
      try {
        await useApi('/auth/login', {
          method: 'POST',
          body: payload,
        })

        await this.fetchMe()
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      try {
        const res = await useApi<any>('/auth/me')

        this.user = { id: res.id }
        this.permissions = res.permissions ?? []
      } catch (e: any) {
        if (e?.status === 401) {
          await this.logout(false)
        } else {
          console.error('[auth.fetchMe]', e)
        }
      } finally {
        this.initialized = true
      }
    },

    async logout(redirect = true) {
      try {
        await useApi('/auth/logout', { method: 'POST' })
      } catch (_) {}

      this.user = null
      this.permissions = []
      this.initialized = true

      if (redirect) navigateTo('/')
    },
  },
})
