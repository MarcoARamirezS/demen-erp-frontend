import { defineStore } from 'pinia'
import type { Project } from '~/types/project.types'

interface ProjectsState {
  items: Project[]
  loading: boolean
  cursor: string | null
  hasMore: boolean
  selected: Project | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    items: [],
    loading: false,
    cursor: null,
    hasMore: true,
    selected: null,
  }),

  actions: {
    /* =========================
       RESET
    ========================= */
    reset() {
      this.items = []
      this.cursor = null
      this.hasMore = true
      this.selected = null
    },

    /* =========================
       FETCH LIST (CURSOR)
    ========================= */
    async fetch(limit = 25) {
      if (this.loading || !this.hasMore) return

      this.loading = true
      try {
        const res = await useApi<{
          items: Project[]
          nextCursor?: string
        }>('/projects', {
          params: {
            limit,
            cursor: this.cursor || undefined,
          },
        })

        this.items.push(...res.items)
        this.cursor = res.nextCursor || null
        this.hasMore = Boolean(res.nextCursor)
      } finally {
        this.loading = false
      }
    },

    /* =========================
       GET BY ID
    ========================= */
    async getById(id: string) {
      this.loading = true
      try {
        this.selected = await useApi<Project>(`/projects/${id}`)
      } finally {
        this.loading = false
      }
    },

    /* =========================
       CREATE
    ========================= */
    async create(payload: { clientId: string; fechaLevantamiento: string; descripcion: string }) {
      await useApi('/projects', {
        method: 'POST',
        body: payload,
      })

      // 🔁 Refrescar listado
      this.reset()
      await this.fetch()
    },

    /* =========================
       UPDATE
    ========================= */
    async update(
      id: string,
      payload: Partial<{
        clientId: string
        fechaLevantamiento: string
        descripcion: string
        activo: boolean
      }>
    ) {
      await useApi(`/projects/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      // 🔄 Sync local
      if (this.selected?.id === id) {
        Object.assign(this.selected, payload)
      }

      const idx = this.items.findIndex(p => p.id === id)
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...payload }
      }
    },

    /* =========================
       DELETE (SOFT)
    ========================= */
    async remove(id: string) {
      await useApi(`/projects/${id}`, {
        method: 'DELETE',
      })

      // 🧹 Quitar de listado
      this.items = this.items.filter(p => p.id !== id)

      if (this.selected?.id === id) {
        this.selected = null
      }
    },
  },
})
