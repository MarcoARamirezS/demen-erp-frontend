import { defineStore } from 'pinia'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

export const useClientAddressesStore = defineStore('clientAddresses', {
  state: () => ({
    items: [] as ClientAddress[],
    loading: false,
  }),

  actions: {
    async fetchByClient(clienteId: string) {
      this.loading = true
      try {
        const data = await useApi<ClientAddress[]>('/clients/addresses', {
          query: { clienteId },
        })

        this.items = [...data].sort((a, b) => {
          if (Boolean(a.esPrincipal) === Boolean(b.esPrincipal)) return 0
          return a.esPrincipal ? -1 : 1
        })
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateClientAddressDto) {
      await useApi('/clients/addresses', {
        method: 'POST',
        body: {
          ...payload,
          esPrincipal: payload.esPrincipal ?? false,
        },
      })
    },

    async update(id: string, payload: Partial<CreateClientAddressDto>) {
      await useApi(`/clients/addresses/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },

    async setPrimary(address: Pick<ClientAddress, 'id' | 'clienteId'>) {
      await useApi(`/clients/addresses/${address.id}`, {
        method: 'PATCH',
        body: {
          esPrincipal: true,
        },
      })

      await this.fetchByClient(address.clienteId)
    },

    async remove(id: string) {
      await useApi(`/clients/addresses/${id}`, {
        method: 'DELETE',
      })
    },
  },
})
