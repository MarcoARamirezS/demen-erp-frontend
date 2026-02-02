import { defineStore } from 'pinia'
import type { SupplierProduct, CreateSupplierProductDto } from '~/types/supplier-product'

export const useSupplierProductsStore = defineStore('supplierProducts', {
  state: () => ({
    items: [] as SupplierProduct[],
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(params: Record<string, any> = {}, limit = 25) {
      this.loading = true
      const res = await useApi<any>('/supplier-products', {
        query: { ...params, limit },
      })
      this.items = res.items
      this.cursor = res.nextCursor
      this.loading = false
    },

    async fetchMore(params: Record<string, any> = {}, limit = 25) {
      if (!this.cursor) return
      const res = await useApi<any>('/supplier-products', {
        query: { ...params, limit, cursor: this.cursor },
      })
      this.items.push(...res.items)
      this.cursor = res.nextCursor
    },

    async create(payload: CreateSupplierProductDto) {
      await useApi('/supplier-products', {
        method: 'POST',
        body: payload,
      })
      await this.fetch()
    },

    async update(id: string, payload: Partial<CreateSupplierProductDto>) {
      await useApi(`/supplier-products/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      await this.fetch()
    },

    async remove(id: string) {
      await useApi(`/supplier-products/${id}`, {
        method: 'DELETE',
      })
      this.items = this.items.filter(i => i.id !== id)
    },
  },
})
