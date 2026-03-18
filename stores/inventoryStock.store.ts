import { defineStore } from 'pinia'
import type { InventoryStockItem, InventoryStockQuery, InventorySummary } from '~/types/inventory'

export const useInventoryStockStore = defineStore('inventoryStock', {
  state: () => ({
    items: [] as InventoryStockItem[],
    loading: false,
    summaryLoading: false,
    cursor: null as string | null,
    summary: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalUnits: 0,
      movementsToday: 0,
    } as InventorySummary,
    filters: {
      search: '',
      stockStatus: '' as InventoryStockQuery['stockStatus'],
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

    async fetch(query: InventoryStockQuery = {}) {
      if (this.loading) return

      this.loading = true
      try {
        const params: Record<string, any> = {
          limit: query.limit ?? 20,
          search: (query.search ?? this.filters.search) || undefined,
          stockStatus: (query.stockStatus ?? this.filters.stockStatus) || undefined,
        }

        if (query.cursor) params.cursor = query.cursor

        const res = await useApi<{
          ok: boolean
          items: InventoryStockItem[]
          nextCursor: string | null
        }>('/inventory/stock', {
          query: params,
        })

        this.items = query.cursor ? [...this.items, ...(res.items ?? [])] : (res.items ?? [])
        this.cursor = res.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      this.summaryLoading = true
      try {
        const res = await useApi<{
          ok: boolean
          summary: InventorySummary
        }>('/inventory/summary')

        this.summary = res.summary
      } finally {
        this.summaryLoading = false
      }
    },
  },
})
