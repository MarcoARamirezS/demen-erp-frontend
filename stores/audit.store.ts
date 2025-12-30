// ~/stores/audit.store.ts
import { defineStore } from 'pinia'
import type { AuditLog } from '~/types/audit'

export const useAuditStore = defineStore('audit', {
  state: () => ({
    items: [] as AuditLog[],
    loading: false,
    cursor: null as string | null,

    selected: null as AuditLog | null,
    loadingOne: false,
  }),

  getters: {
    hasMore: s => !!s.cursor,
  },

  actions: {
    async fetch(limit = 25) {
      const api = useApi
      this.loading = true
      try {
        const res = await api('/audit', { query: { limit } })
        this.items = res?.items ?? []
        this.cursor = res?.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async fetchMore(limit = 25) {
      if (!this.cursor) return
      const api = useApi
      this.loading = true
      try {
        const res = await api('/audit', { query: { limit, cursor: this.cursor } })
        const next = res?.items ?? []
        this.items = [...this.items, ...next].filter(Boolean)
        this.cursor = res?.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async get(id: string) {
      const api = useApi
      this.loadingOne = true
      try {
        const res = await api(`/audit/${id}`)
        this.selected = res ?? null
        return this.selected
      } finally {
        this.loadingOne = false
      }
    },

    clearSelected() {
      this.selected = null
    },
  },
})
