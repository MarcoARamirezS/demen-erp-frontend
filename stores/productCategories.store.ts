import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export interface ProductCategory {
  id: string
  name: string
  familyId?: string
  active?: boolean
}

type FetchResponse =
  | ProductCategory[]
  | {
      items?: ProductCategory[]
      nextCursor?: string | null
    }

export const useProductCategoriesStore = defineStore('productCategories', {
  state: () => ({
    items: [] as ProductCategory[],
    loading: false,
    loadedFamilyIds: [] as string[],
    triedFamilyIds: [] as string[],
    allLoaded: false,
  }),

  actions: {
    normalizeResponse(res: FetchResponse): ProductCategory[] {
      if (Array.isArray(res)) return res
      return res?.items ?? []
    },

    upsertMany(categories: ProductCategory[]) {
      const map = new Map(this.items.map(item => [item.id, item]))

      for (const category of categories) {
        map.set(category.id, category)
      }

      this.items = Array.from(map.values())
    },

    markFamilyLoaded(familyId: string) {
      if (!this.loadedFamilyIds.includes(familyId)) this.loadedFamilyIds.push(familyId)
      if (!this.triedFamilyIds.includes(familyId)) this.triedFamilyIds.push(familyId)
    },

    markFamilyTried(familyId: string) {
      if (!this.triedFamilyIds.includes(familyId)) this.triedFamilyIds.push(familyId)
    },

    wasFamilyTried(familyId?: string) {
      if (!familyId) return false
      return this.triedFamilyIds.includes(familyId)
    },

    async fetchByFamily(familyId: string, force = false) {
      if (!familyId) return []

      if (!force && this.loadedFamilyIds.includes(familyId)) {
        return this.items.filter(item => item.familyId === familyId)
      }

      this.loading = true

      try {
        const res = await useApi<FetchResponse>('/product-categories', {
          query: {
            familyId,
            limit: 100,
          },
        })

        const incoming = this.normalizeResponse(res)
        this.upsertMany(incoming)
        this.markFamilyLoaded(familyId)

        return incoming
      } catch (error) {
        this.markFamilyTried(familyId)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchManyFamilies(familyIds: string[], force = false) {
      const uniqueIds = Array.from(new Set(familyIds.filter(Boolean)))

      await Promise.allSettled(uniqueIds.map(familyId => this.fetchByFamily(familyId, force)))
    },

    reset() {
      this.items = []
      this.loading = false
      this.loadedFamilyIds = []
      this.triedFamilyIds = []
      this.allLoaded = false
    },
  },
})
