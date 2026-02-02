// 📁 ~/stores/supplierProductPrices.store.ts
import { defineStore } from 'pinia'

export interface SupplierProductPrice {
  id: string
  supplierProductId: string
  cost: number
  currency: 'MXN' | 'USD'
  validFrom: any
  validTo?: any | null
  active: boolean
}

export const useSupplierProductPricesStore = defineStore('supplierProductPrices', {
  state: () => ({
    items: [] as SupplierProductPrice[],
    loading: false,
  }),

  actions: {
    async fetchByRelation(supplierProductId: string) {
      this.loading = true
      try {
        const res = await useApi('/supplier-product-prices', {
          params: { supplierProductId },
        })
        this.items = res
      } finally {
        this.loading = false
      }
    },

    async create(payload: {
      supplierProductId: string
      supplierId: string
      productId: string
      cost: number
      currency: 'MXN' | 'USD'
    }) {
      await useApi('/supplier-product-prices', {
        method: 'POST',
        body: payload,
      })
    },
  },
})
