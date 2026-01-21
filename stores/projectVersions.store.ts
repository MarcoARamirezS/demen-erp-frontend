import { defineStore } from 'pinia'
import type { ProjectVersion } from '~/types/project.types'

interface ProjectVersionsState {
  items: ProjectVersion[]
  loading: boolean
}

export const useProjectVersionsStore = defineStore('projectVersions', {
  state: (): ProjectVersionsState => ({
    items: [],
    loading: false,
  }),

  getters: {
    /* =========================
       VERSION ACTUAL
    ========================= */
    current(state): ProjectVersion | null {
      return state.items.find(v => v.esActual) || null
    },

    /* =========================
       SIGUIENTE LETRA
    ========================= */
    nextVersionLetter(state): string {
      if (!state.items.length) return 'A'

      const letters = state.items.map(v => v.version).sort()

      const last = letters[letters.length - 1]
      return String.fromCharCode(last.charCodeAt(0) + 1)
    },
  },

  actions: {
    /* =========================
       RESET
    ========================= */
    reset() {
      this.items = []
    },

    /* =========================
       FETCH BY PROJECT
    ========================= */
    async fetchByProject(projectId: string) {
      this.loading = true
      try {
        this.items = await useApi<ProjectVersion[]>('/projects/versions', {
          params: { projectId },
        })
      } finally {
        this.loading = false
      }
    },

    /* =========================
       CREATE VERSION
    ========================= */
    async create(payload: { projectId: string; descripcion: string }) {
      const version = this.nextVersionLetter

      const created = await useApi<ProjectVersion>('/projects/versions', {
        method: 'POST',
        body: {
          projectId: payload.projectId,
          descripcion: payload.descripcion,
          version,
        },
      })

      this.items.push(created)
    },

    /* =========================
       UPDATE VERSION
    ========================= */
    async update(
      id: string,
      payload: Partial<{
        descripcion: string
      }>
    ) {
      await useApi(`/projects/versions/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(v => v.id === id)
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...payload }
      }
    },

    /* =========================
       SET CURRENT
    ========================= */
    async setCurrent(versionId: string) {
      await useApi(`/projects/versions/${versionId}/set-current`, {
        method: 'POST',
      })

      // 🔁 Sync local: solo una vigente
      this.items = this.items.map(v => ({
        ...v,
        esActual: v.id === versionId,
      }))
    },
  },
})
