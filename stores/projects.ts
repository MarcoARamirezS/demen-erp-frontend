import { defineStore } from 'pinia'
import type { Project, CreateProjectDto } from '@/types/project'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    selected: null as Project | null,
    loading: false,
    cursor: null as string | null,
    hasMore: true,
  }),

  actions: {
    /* =========================
       RESET
    ========================= */
    reset() {
      this.items = []
      this.cursor = null
      this.hasMore = true
    },

    /* =========================
       FETCH (compatible backend actual)
       Nota: backend aún no es cursor-based,
       pero dejamos estructura lista.
    ========================= */
    async fetch(filters: Record<string, any> = {}) {
      if (this.loading) return

      this.loading = true

      try {
        const res = await useApi<{ ok: boolean; projects: Project[] }>('/projects', {
          query: filters,
        })

        this.items = res.projects ?? []
      } finally {
        this.loading = false
      }
    },

    /* =========================
       CREATE
    ========================= */
    async create(payload: CreateProjectDto) {
      const res = await useApi<{ ok: boolean; project: Project }>('/projects', {
        method: 'POST',
        body: payload,
      })

      const created = res.project
      this.items.unshift(created)

      return created
    },

    /* =========================
       UPDATE
    ========================= */
    async update(id: string, payload: Partial<CreateProjectDto>) {
      const res = await useApi<{ ok: boolean; updated: Project }>(`/projects/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const updated = res.updated

      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated

      if (this.selected?.id === id) {
        this.selected = updated
      }

      return updated
    },

    /* =========================
       CHANGE STATUS
    ========================= */
    async changeStatus(id: string, status: string) {
      const res = await useApi<{ ok: boolean; updated: Project }>(`/projects/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })

      const updated = res.updated

      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated

      return updated
    },

    /* =========================
       DELETE
    ========================= */
    async remove(id: string) {
      await useApi(`/projects/${id}`, {
        method: 'DELETE',
      })

      this.items = this.items.filter(i => i.id !== id)
    },

    /* =========================
       GET BY ID
    ========================= */
    async get(id: string) {
      const res = await useApi<{ ok: boolean; project: Project }>(`/projects/${id}`)

      this.selected = res.project
      return this.selected
    },

    clearSelected() {
      this.selected = null
    },
  },
})
