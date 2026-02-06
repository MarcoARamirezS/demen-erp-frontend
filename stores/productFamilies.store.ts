import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface ProductFamily {
  id: string
  name: string
  active?: boolean
}

export const useProductFamiliesStore = defineStore('productFamilies', {
  state: () => ({
    items: [] as ProductFamily[],
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true
      const data = await useApi<ProductFamily[]>('/product-families')
      this.items = data
      this.loading = false
    },

    async create(payload: Partial<ProductFamily>) {
      const family = await useApi<ProductFamily>('/product-families', {
        method: 'POST',
        body: payload,
      })
      this.items.unshift(family)
      return family
    },

    async update(id: string, payload: Partial<ProductFamily>) {
      const updated = await useApi<ProductFamily>(`/product-families/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: string) {
      await useApi(`/product-families/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    },
  },
})
