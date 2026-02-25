import { defineStore } from 'pinia'
import type { ProjectRequirement } from '@/types/project-requirement'

export const useProjectRequirementsStore = defineStore('projectRequirements', {
  state: () => ({
    latest: null as ProjectRequirement | null,
    items: [] as ProjectRequirement[],
    loading: false,
    saving: false,
  }),

  actions: {
    async fetchLatest(projectId: string) {
      this.loading = true
      try {
        const res = await useApi<{ ok: boolean; item: ProjectRequirement | null }>(
          `/projects/${projectId}/requirements/latest`
        )
        this.latest = res.item
        return this.latest
      } finally {
        this.loading = false
      }
    },

    async listByProject(projectId: string) {
      this.loading = true
      try {
        const res = await useApi<{ ok: boolean; items: ProjectRequirement[] }>(
          `/projects/${projectId}/requirements`
        )
        this.items = res.items ?? []
        return this.items
      } finally {
        this.loading = false
      }
    },

    async createDraft(projectId: string) {
      this.saving = true
      try {
        const res = await useApi<{ ok: boolean; item: ProjectRequirement }>(
          `/projects/${projectId}/requirements`,
          { method: 'POST', body: { projectId } }
        )

        this.latest = res.item
        return res.item
      } finally {
        this.saving = false
      }
    },

    async update(id: string, payload: Partial<ProjectRequirement>) {
      this.saving = true
      try {
        const res = await useApi<{ ok: boolean; updated: ProjectRequirement }>(
          `/projects/requirements/${id}`,
          { method: 'PATCH', body: payload }
        )

        this.latest = res.updated
        return res.updated
      } finally {
        this.saving = false
      }
    },

    async uploadImages(id: string, files: File[]) {
      if (!files.length) return

      const form = new FormData()
      files.forEach(f => form.append('images', f))

      const res = await useApi<{ ok: boolean; updated: ProjectRequirement }>(
        `/projects/requirements/${id}/images`,
        { method: 'POST', body: form }
      )

      this.latest = res.updated
      return res.updated
    },

    async submit(id: string, comment?: string) {
      this.saving = true
      try {
        const res = await useApi<{ ok: boolean; updated: ProjectRequirement }>(
          `/projects/requirements/${id}/submit`,
          { method: 'POST', body: { comment: comment ?? null } }
        )

        this.latest = res.updated
        return res.updated
      } finally {
        this.saving = false
      }
    },
  },
})
