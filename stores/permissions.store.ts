import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Permission } from '~/types/permissions'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    items: [] as Permission[],
    loading: false,
    loaded: false,
  }),

  actions: {
    async fetch(force = false) {
      // 🛑 evita doble o múltiple fetch
      if (this.loading) return
      if (this.loaded && !force) return

      this.loading = true
      try {
        if (force) {
          this.items = []
          this.loaded = false
        }

        // ✅ UNA sola llamada (permissions son estáticos)
        const res = await useApi<{ items: Permission[] }>('/permissions', {
          query: { limit: 200 },
        })

        this.items = res.items
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    reset() {
      this.items = []
      this.loaded = false
      this.loading = false
    },
  },
})
