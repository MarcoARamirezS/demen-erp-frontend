import { defineStore } from 'pinia'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

export const useClientAddressesStore = defineStore('clientAddresses', {
  state: () => ({
    items: [] as ClientAddress[],
    loading: false,
  }),

  actions: {
    async fetchByClient(clientId: string) {
      this.loading = true
      const api = useApi

      this.items = await api('/clients/addresses', {
        params: { clientId },
      })

      this.loading = false
    },

    async create(payload: CreateClientAddressDto) {
      const api = useApi
      await api('/clients/addresses', {
        method: 'POST',
        body: payload,
      })
    },

    async update(id: string, payload: Partial<CreateClientAddressDto>) {
      const api = useApi
      await api(`/clients/addresses/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },

    async remove(id: string) {
      const api = useApi
      await api(`/clients/addresses/${id}`, {
        method: 'DELETE',
      })
    },
  },
})
