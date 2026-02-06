import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface ProductCategory {
  id: string
  name: string
  familyId: string
  active?: boolean
}

export const useProductCategoriesStore = defineStore('productCategories', {
  state: () => ({
    items: [] as ProductCategory[],
    loading: false,
    currentFamilyId: null as string | null,
  }),

  actions: {
    async fetchByFamily(familyId: string) {
      if (!familyId) {
        this.items = []
        this.currentFamilyId = null
        return
      }

      this.loading = true
      const data = await useApi<ProductCategory[]>('/product-categories', {
        query: { familyId },
      })
      this.items = data
      this.currentFamilyId = familyId
      this.loading = false
    },

    async create(payload: Partial<ProductCategory>) {
      const category = await useApi<ProductCategory>('/product-categories', {
        method: 'POST',
        body: payload,
      })
      this.items.unshift(category)
      return category
    },

    async update(id: string, payload: Partial<ProductCategory>) {
      const updated = await useApi<ProductCategory>(`/product-categories/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: string) {
      await useApi(`/product-categories/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    },

    clear() {
      this.items = []
      this.currentFamilyId = null
    },
  },
})
