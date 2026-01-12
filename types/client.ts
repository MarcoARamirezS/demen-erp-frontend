import type { FireTimestamp } from '~/types/firestore'

export interface Client {
  id: string
  razonSocial: string
  nombreComercial?: string
  rfc?: string
  email?: string
  telefono?: string
  activo: boolean
  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

export interface CreateClientDto {
  razonSocial: string
  nombreComercial?: string
  rfc?: string
  email?: string
  telefono?: string
  activo: boolean
}
