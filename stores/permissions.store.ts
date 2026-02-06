import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    items: [] as any[],
    loading: false,
    loaded: false, // ⬅️ CLAVE: evita fetch infinito
    cursor: null as string | null,
  }),

  getters: {
    activePermissions: state => state.items.filter(p => p.active),
  },

  actions: {
    async fetch(force = false) {
      // ⛔ Guardias críticas
      if (this.loading) return
      if (this.loaded && !force) return

      this.loading = true

      try {
        const api = useApi

        // Reset SOLO si forzamos reload
        if (force) {
          this.items = []
          this.cursor = null
          this.loaded = false
        }

        do {
          const params: Record<string, any> = {}
          if (this.cursor) params.cursor = this.cursor

          const res = await api('/permissions', { params })

          this.items.push(...res.items)
          this.cursor = res.nextCursor ?? null
        } while (this.cursor)

        this.loaded = true // ⬅️ se marca como cargado
      } finally {
        this.loading = false
      }
    },

    // Útil si algún día quieres recargar permisos explícitamente
    reset() {
      this.items = []
      this.cursor = null
      this.loaded = false
      this.loading = false
    },
  },
})
