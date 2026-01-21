import { defineStore } from 'pinia'
import type { ProjectPhoto } from '~/types/project.types'

export const useProjectPhotosStore = defineStore('projectPhotos', {
  state: () => ({
    items: [] as ProjectPhoto[],
    loading: false,
  }),

  actions: {
    /* =========================
       RESET
    ========================= */
    reset() {
      this.items = []
      this.loading = false
    },

    /* =========================
       FETCH PHOTOS
       GET /api/projects/photos?projectId=ID&versionId=ID
    ========================= */
    async fetch(projectId: string, versionId: string) {
      this.loading = true
      try {
        this.items = await useApi('/projects/photos', {
          params: {
            projectId,
            versionId,
          },
        })
      } finally {
        this.loading = false
      }
    },

    /* =========================
       UPLOAD PHOTO
       POST /api/projects/photos
       multipart/form-data
    ========================= */
    async upload(payload: {
      file: File
      projectId: string
      versionId: string
      source?: 'web' | 'mobile'
    }) {
      const form = new FormData()
      form.append('file', payload.file)
      form.append('projectId', payload.projectId)
      form.append('versionId', payload.versionId)
      form.append('source', payload.source || 'web')

      await useApi('/projects/photos', {
        method: 'POST',
        body: form,
      })
    },

    /* =========================
       DELETE PHOTO
       DELETE /api/projects/photos/:id
    ========================= */
    async remove(id: string) {
      await useApi(`/projects/photos/${id}`, {
        method: 'DELETE',
      })
    },
  },
})
