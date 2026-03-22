import { defineStore } from 'pinia'
import type { Supplier } from '~/types/supplier'

type ListQuery = {
  limit?: number
  cursor?: string | null
  search?: string
  active?: boolean
}

type NextCodeResponse = {
  nextCode?: string
  nextSequence?: number
}

type SupplierPayload = Record<string, any>

function normalizeSearchText(value: string) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchableText(item: Partial<Supplier>) {
  return normalizeSearchText(
    [item.code, item.name, item.legalName, item.rfc, item.email, item.phone]
      .filter(Boolean)
      .join(' ')
  )
}

function supplierMatchesFilters(item: Partial<Supplier>, query: ListQuery) {
  if (typeof query.active === 'boolean' && Boolean(item.active) !== query.active) {
    return false
  }

  const normalizedSearch = normalizeSearchText(query.search || '')
  if (!normalizedSearch) return true

  return buildSearchableText(item).includes(normalizedSearch)
}

function sanitizeQuery(params: ListQuery = {}, limit = 25, cursor?: string | null): ListQuery {
  const normalizedSearch = normalizeSearchText(params.search || '')

  return {
    ...(typeof params.active === 'boolean' ? { active: params.active } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    limit,
    ...(cursor ? { cursor } : {}),
  }
}

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    items: [] as Supplier[],
    loading: false,
    cursor: null as string | null,
    hasMore: true,
    limit: 25,

    // filtros reutilizables
    lastQuery: {} as ListQuery,
  }),

  actions: {
    normalizeSearch(value: string) {
      return normalizeSearchText(value)
    },

    reset() {
      this.items = []
      this.loading = false
      this.cursor = null
      this.hasMore = true
      this.lastQuery = {}
    },

    setSearch(value: string) {
      const normalized = normalizeSearchText(value)

      this.lastQuery = {
        ...this.lastQuery,
        search: normalized || undefined,
      }

      this.cursor = null
      this.hasMore = true
      this.items = []
    },

    setActiveFilter(value?: boolean) {
      this.lastQuery = {
        ...this.lastQuery,
        active: typeof value === 'boolean' ? value : undefined,
      }

      this.cursor = null
      this.hasMore = true
      this.items = []
    },

    async fetch(params: ListQuery = {}, limit = 25) {
      this.loading = true

      try {
        const mergedParams: ListQuery = {
          ...this.lastQuery,
          ...params,
        }

        const query = sanitizeQuery(mergedParams, limit)
        this.lastQuery = {
          ...mergedParams,
          search: query.search,
        }

        const res = await useApi<any>('/suppliers', {
          query,
        })

        this.items = res.items ?? []
        this.cursor = res.nextCursor ?? null
        this.hasMore = !!res.nextCursor
        this.limit = limit
      } finally {
        this.loading = false
      }
    },

    async fetchMore(params: ListQuery = {}, limit = this.limit || 25) {
      if (!this.cursor || this.loading) return

      this.loading = true

      try {
        const mergedParams: ListQuery = {
          ...this.lastQuery,
          ...params,
        }

        const query = sanitizeQuery(mergedParams, limit, this.cursor)
        const res = await useApi<any>('/suppliers', {
          query,
        })

        const next = (res.items ?? []) as Supplier[]
        const existingIds = new Set(this.items.map(item => item.id))
        const uniqueNext = next.filter(item => !existingIds.has(item.id))

        this.items.push(...uniqueNext)
        this.cursor = res.nextCursor ?? null
        this.hasMore = !!res.nextCursor
        this.limit = limit
      } finally {
        this.loading = false
      }
    },

    async refreshLastQuery(limit = this.limit || 25) {
      await this.fetch(this.lastQuery, limit)
    },

    async fetchNextCode() {
      return await useApi<NextCodeResponse>('/suppliers/next-code')
    },

    async create(payload: SupplierPayload) {
      const created = await useApi<Supplier>('/suppliers', {
        method: 'POST',
        body: payload,
      })

      if (supplierMatchesFilters(created, this.lastQuery)) {
        this.items.unshift(created)
      } else {
        await this.refreshLastQuery()
      }

      return created
    },

    async update(id: string, payload: SupplierPayload) {
      const updated = await useApi<Supplier>(`/suppliers/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(item => item.id === id)

      if (idx !== -1) {
        if (supplierMatchesFilters(updated, this.lastQuery)) {
          this.items[idx] = updated
        } else {
          this.items.splice(idx, 1)
        }
      } else {
        await this.refreshLastQuery()
      }

      return updated
    },

    async remove(id: string) {
      await useApi(`/suppliers/${id}`, {
        method: 'DELETE',
      })

      this.items = this.items.filter(item => item.id !== id)
    },
  },
})
