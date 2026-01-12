import type { FireTimestamp } from '~/types/firestore'

export type ClientTipo = 'empresa' | 'persona'

export interface Client {
  id: string
  tipo: ClientTipo
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
  tipo: ClientTipo
  razonSocial: string
  nombreComercial?: string
  rfc?: string
  email?: string
  telefono?: string
  activo: boolean
}
