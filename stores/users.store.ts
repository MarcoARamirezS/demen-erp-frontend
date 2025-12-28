// ~/stores/users.store.ts
import { defineStore } from 'pinia'
import type { User, CreateUserDto } from '~/types/user'

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [] as User[],
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(limit = 25) {
      const api = useApi
      this.loading = true
      try {
        const res = await api('/users', { query: { limit } })
        this.items = res?.items || []
        this.cursor = res?.nextCursor || null
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateUserDto) {
      const api = useApi
      await api('/users', { method: 'POST', body: payload })
      await this.fetch()
    },

    async update(id: string, payload: Partial<CreateUserDto>) {
      const api = useApi
      await api(`/users/${id}`, { method: 'PATCH', body: payload })
      await this.fetch()
    },

    // Solo activar/desactivar (tu requerimiento)
    async toggleActive(user: User) {
      const api = useApi
      await api(`/users/${user.id}`, {
        method: 'PATCH',
        body: { activo: !user.activo },
      })
      // actualiza local rápido (sin esperar refetch)
      this.items = this.items.map(u => (u.id === user.id ? { ...u, activo: !u.activo } : u))
    },

    // si aún quieres conservar delete, déjalo
    async remove(id: string) {
      const api = useApi
      await api(`/users/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(u => u.id !== id)
    },
  },
})
