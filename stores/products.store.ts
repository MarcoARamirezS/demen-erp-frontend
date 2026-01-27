// 📁 ~/stores/products.store.ts
import { defineStore } from 'pinia'
import type { Product, CreateProductDto } from '~/types/product'

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as Product[],
    selected: null as Product | null,
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(limit = 10) {
      this.loading = true
      const api = useApi

      const params: Record<string, any> = { limit }
      if (this.cursor) params.cursor = this.cursor

      const res = await api('/products', { params })

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
      this.selected = await api(`/products/${id}`)
    },

    async create(payload: CreateProductDto) {
      this.loading = true
      try {
        await useApi('/products', {
          method: 'POST',
          body: payload,
        })
        this.reset()
        await this.fetch()
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: Partial<CreateProductDto>) {
      await useApi(`/products/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },
  },
})
