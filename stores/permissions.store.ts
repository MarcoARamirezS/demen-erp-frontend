import { defineStore } from 'pinia'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    items: [] as any[],
    loading: false,
    cursor: null as string | null,
  }),

  getters: {
    activePermissions: state => state.items.filter(p => p.active),
  },

  actions: {
    async fetch() {
      this.loading = true
      this.items = []
      this.cursor = null

      try {
        const api = useApi

        do {
          const params: Record<string, any> = {}
          if (this.cursor) params.cursor = this.cursor

          const res = await api('/permissions', { params })

          this.items.push(...res.items)
          this.cursor = res.nextCursor ?? null
        } while (this.cursor)
      } finally {
        this.loading = false
      }
    },
  },
})
