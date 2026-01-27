// 📁 ~/stores/supplierProducts.store.ts
import { defineStore } from 'pinia'
import type { SupplierProduct, CreateSupplierProductDto } from '~/types/supplier-product'

export const useSupplierProductsStore = defineStore('supplierProducts', {
  state: () => ({
    items: [] as SupplierProduct[],
    selected: null as SupplierProduct | null,
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(limit = 10) {
      this.loading = true
      const api = useApi

      const params: Record<string, any> = { limit }
      if (this.cursor) params.cursor = this.cursor

      const res = await api('/supplier-products', { params })

      this.items = res.items
      this.cursor = res.nextCursor ?? null
      this.loading = false
    },

    reset() {
      this.items = []
      this.cursor = null
      this.selected = null
    },

    async getById(id: string) {
      const api = useApi
      this.selected = await api(`/supplier-products/${id}`)
    },

    async create(payload: CreateSupplierProductDto) {
      this.loading = true
      try {
        await useApi('/supplier-products', {
          method: 'POST',
          body: payload,
        })
        this.reset()
        await this.fetch()
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: Partial<CreateSupplierProductDto>) {
      await useApi(`/supplier-products/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },
  },
})
