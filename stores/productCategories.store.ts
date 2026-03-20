import { defineStore } from 'pinia'

export type ProductCategory = {
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

  getters: {
    byId: state => {
      const map = new Map<string, ProductCategory>()
      for (const item of state.items) {
        map.set(item.id, item)
      }
      return map
    },
  },

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
      if (!this.loadedFamilyIds.includes(familyId)) {
        this.loadedFamilyIds.push(familyId)
      }
      if (!this.triedFamilyIds.includes(familyId)) {
        this.triedFamilyIds.push(familyId)
      }
    },

    markFamilyTried(familyId: string) {
      if (!this.triedFamilyIds.includes(familyId)) {
        this.triedFamilyIds.push(familyId)
      }
    },

    isFamilyLoaded(familyId?: string) {
      if (!familyId) return false
      return this.loadedFamilyIds.includes(familyId)
    },

    wasFamilyTried(familyId?: string) {
      if (!familyId) return false
      return this.triedFamilyIds.includes(familyId)
    },

    async fetchAll(force = false) {
      if (this.allLoaded && !force) {
        return this.items
      }

      this.loading = true

      try {
        const res = await useApi<FetchResponse>('/product-categories', {
          query: {
            limit: 100,
          },
        })

        const incoming = this.normalizeResponse(res)

        this.items = incoming
        this.allLoaded = true

        const familyIds = Array.from(
          new Set(incoming.map(item => item.familyId).filter(Boolean))
        ) as string[]

        this.loadedFamilyIds = familyIds
        this.triedFamilyIds = familyIds

        return incoming
      } finally {
        this.loading = false
      }
    },

    async fetchByFamily(familyId: string, force = false) {
      if (!familyId) return []

      if (this.allLoaded && !force) {
        return this.items.filter(item => item.familyId === familyId)
      }

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

    async fetchManyFamilies(familyIds: string[]) {
      const uniqueIds = Array.from(new Set(familyIds.filter(Boolean)))

      await Promise.allSettled(
        uniqueIds.map(async familyId => {
          if (!this.loadedFamilyIds.includes(familyId)) {
            await this.fetchByFamily(familyId)
          }
        })
      )
    },

    async create(payload: Partial<ProductCategory>) {
      const created = await useApi<ProductCategory>('/product-categories', {
        method: 'POST',
        body: payload,
      })

      this.upsertMany([created])

      if (created.familyId) {
        this.markFamilyLoaded(created.familyId)
      }

      return created
    },

    async update(id: string, payload: Partial<ProductCategory>) {
      const updated = await useApi<ProductCategory>(`/product-categories/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      this.upsertMany([updated])

      if (updated.familyId) {
        this.markFamilyLoaded(updated.familyId)
      }

      return updated
    },

    async remove(id: string) {
      await useApi(`/product-categories/${id}`, {
        method: 'DELETE',
      })

      this.items = this.items.filter(item => item.id !== id)
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
