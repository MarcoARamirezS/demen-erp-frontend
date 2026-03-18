import { defineStore } from 'pinia'
import type { InventoryMovement, InventoryMovementsQuery } from '~/types/inventory'

export const useInventoryMovementsStore = defineStore('inventoryMovements', {
  state: () => ({
    items: [] as InventoryMovement[],
    loading: false,
    cursor: null as string | null,
    filters: {
      search: '',
      type: '' as InventoryMovementsQuery['type'],
      productId: undefined as string | undefined,
    },
  }),

  actions: {
    reset() {
      this.items = []
      this.cursor = null
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = {
        ...this.filters,
        ...filters,
      }
      this.reset()
    },

    async fetch(query: InventoryMovementsQuery = {}) {
      if (this.loading) return

      this.loading = true
      try {
        const params: Record<string, any> = {
          limit: query.limit ?? 20,
          search: (query.search ?? this.filters.search) || undefined,
          type: (query.type ?? this.filters.type) || undefined,
          productId: (query.productId ?? this.filters.productId) || undefined,
        }

        if (query.cursor) params.cursor = query.cursor

        const res = await useApi<{
          ok: boolean
          items: InventoryMovement[]
          nextCursor: string | null
        }>('/inventory/movements', {
          query: params,
        })

        this.items = query.cursor ? [...this.items, ...(res.items ?? [])] : (res.items ?? [])
        this.cursor = res.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async create(
      payload: Omit<
        InventoryMovement,
        'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'product' | 'stockBefore' | 'stockAfter'
      >
    ) {
      await useApi('/inventory/movements', {
        method: 'POST',
        body: payload,
      })

      this.reset()
      await this.fetch()
    },
  },
})
