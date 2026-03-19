import { defineStore } from 'pinia'
import type { InventoryStockItem, InventorySummary, InventoryStockStatus } from '~/types/inventory'

type StockFetchParams = {
  limit?: number
  cursor?: string
}

type StockResponse = {
  ok: boolean
  items: InventoryStockItem[]
  nextCursor: string | null
}

type SummaryResponse = {
  ok: boolean
  summary: InventorySummary
}

export const useInventoryStockStore = defineStore('inventoryStock', {
  state: () => ({
    items: [] as InventoryStockItem[],
    loading: false,
    cursor: null as string | null,

    summary: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalUnits: 0,
      movementsToday: 0,
    } as InventorySummary,
    summaryLoading: false,

    search: '',
    stockStatus: '' as InventoryStockStatus | '',
  }),

  actions: {
    setFilters(payload: { search?: string; stockStatus?: InventoryStockStatus | '' }) {
      this.search = payload.search ?? ''
      this.stockStatus = payload.stockStatus ?? ''
      this.cursor = null
      this.items = []
    },

    reset() {
      this.items = []
      this.cursor = null
      this.loading = false
    },

    clearAll() {
      this.items = []
      this.cursor = null
      this.loading = false
      this.search = ''
      this.stockStatus = ''
    },

    async fetch(params: StockFetchParams = {}) {
      if (this.loading) return

      this.loading = true

      try {
        const res = await useApi<StockResponse>('/inventory/stock', {
          query: {
            limit: params.limit ?? 20,
            cursor: params.cursor ?? this.cursor ?? undefined,
            search: this.search || undefined,
            stockStatus: this.stockStatus || undefined,
          },
        })

        const incomingItems = Array.isArray(res?.items) ? res.items : []

        if (params.cursor) {
          this.items.push(...incomingItems)
        } else {
          this.items = incomingItems
        }

        this.cursor = res?.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      if (this.summaryLoading) return

      this.summaryLoading = true

      try {
        const res = await useApi<SummaryResponse>('/inventory/summary')
        this.summary = res?.summary ?? {
          totalProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          totalUnits: 0,
          movementsToday: 0,
        }
      } finally {
        this.summaryLoading = false
      }
    },
  },
})
