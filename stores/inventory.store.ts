import { defineStore } from 'pinia'
import type { InventoryMovement, InventoryQuery } from '~/types/inventory-movement'
import { useApi } from '~/composables/useApi'
import { useUi } from '~/composables/useUi'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    items: [] as InventoryMovement[],
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(query: InventoryQuery = {}) {
      this.loading = true
      try {
        const { data } = await useApi().get('/inventory', {
          params: {
            limit: query.limit ?? 20,
            cursor: query.cursor,
            productId: query.productId,
          },
        })

        this.items = query.cursor ? [...this.items, ...data.items] : data.items
        this.cursor = data.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<InventoryMovement, 'id' | 'createdAt' | 'createdBy'>) {
      const ui = useUi()
      try {
        await useApi().post('/inventory/movements', payload)
        ui.showToast('Movimiento registrado', 'success')
        await this.fetch({})
      } catch (e: any) {
        ui.showToast(e?.message ?? 'Error al registrar movimiento', 'error')
        throw e
      }
    },

    reset() {
      this.items = []
      this.cursor = null
    },
  },
})
