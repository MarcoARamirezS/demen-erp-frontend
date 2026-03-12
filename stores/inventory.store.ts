import { defineStore } from 'pinia'
import type { InventoryMovement, InventoryQuery } from '~/types/inventory-movement'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [] as InventoryMovement[],
    loading: false,
    cursor: null as string | null,
    productId: null as string | null, // ⭐ NUEVO
  }),

  actions: {
    /**
     * Carga inicial y paginación
     */
    async fetch(query: InventoryQuery = {}) {
      this.loading = true

      try {
        const params: Record<string, any> = {
          limit: query.limit ?? 20,
        }

        if (query.cursor) params.cursor = query.cursor
        if (query.productId) params.productId = query.productId

        const res = await useApi('/inventory', {
          query: params,
        })

        this.items = query.cursor ? [...this.items, ...res.items] : res.items

        this.cursor = res.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    setProductFilter(productId: string | null) {
      this.productId = productId
      this.reset()
    },

    /**
     * Crear movimiento de inventario
     */
    async create(payload: Omit<InventoryMovement, 'id' | 'createdAt' | 'createdBy'>) {
      const api = useApi
      await api('/inventory/movements', {
        method: 'POST',
        body: payload,
      })

      this.reset()
      await this.fetch()
    },

    reset() {
      this.items = []
      this.cursor = null
    },
  },
})
