import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export type SupplierProductPrice = {
  id: string
  supplierProductId: string
  price: number
  currency: 'MXN' | 'USD'
  effectiveDateISO?: string
  notes?: string | null
  createdAt?: any
  updatedAt?: any
  createdBy?: string
}

export type PricesPage = {
  items: SupplierProductPrice[]
  nextCursor: string | null
}

export type PricesAnalytics = {
  supplierProductId: string
  latest: SupplierProductPrice | null
  previous: SupplierProductPrice | null
  diff: { absolute: number | null; percent: number | null }
  trend: 'up' | 'down' | 'stable' | 'none'
  series: Array<{ id: string; date: string | null; price: number; currency: 'MXN' | 'USD' }>
  history: SupplierProductPrice[]
}

export const useSupplierProductPricesStore = defineStore('supplierProductPrices', {
  state: () => ({
    items: [] as SupplierProductPrice[],
    loading: false,
    cursor: null as string | null,
    analytics: null as PricesAnalytics | null,
  }),

  actions: {
    async fetchBySupplierProductId(supplierProductId: string, limit = 50) {
      this.loading = true
      try {
        const api = useApi()
        const q = new URLSearchParams()
        q.set('supplierProductId', supplierProductId)
        q.set('limit', String(limit))
        if (this.cursor) q.set('cursor', this.cursor)

        const res = await api.get<PricesPage>(`/supplier-product-prices?${q.toString()}`)
        if (!this.cursor) this.items = res.items
        else this.items = [...this.items, ...res.items]
        this.cursor = res.nextCursor
      } finally {
        this.loading = false
      }
    },

    async fetchAnalytics(supplierProductId: string, limit = 24) {
      const api = useApi()
      this.analytics = await api.get<PricesAnalytics>(
        `/supplier-product-prices/analytics/${supplierProductId}?limit=${limit}`
      )
    },

    async create(payload: {
      supplierProductId: string
      price: number
      currency?: 'MXN' | 'USD'
      effectiveDate: string | number
      notes?: string
    }) {
      const api = useApi()
      await api.post('/supplier-product-prices', payload)

      // refetch (enterprise consistency)
      this.cursor = null
      await this.fetchBySupplierProductId(payload.supplierProductId, 50)
      await this.fetchAnalytics(payload.supplierProductId, 24)
    },

    async update(
      id: string,
      supplierProductId: string,
      patch: Partial<{
        price: number
        currency: 'MXN' | 'USD'
        effectiveDate: string | number
        notes: string | null
      }>
    ) {
      const api = useApi()
      await api.patch(`/supplier-product-prices/${id}`, patch)

      this.cursor = null
      await this.fetchBySupplierProductId(supplierProductId, 50)
      await this.fetchAnalytics(supplierProductId, 24)
    },

    async remove(id: string, supplierProductId: string) {
      const api = useApi()
      await api.delete(`/supplier-product-prices/${id}`)

      this.items = this.items.filter(x => x.id !== id)
      await this.fetchAnalytics(supplierProductId, 24)
    },
  },
})
