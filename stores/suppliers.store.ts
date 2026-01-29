import type { FireTimestamp } from '~/types/fire'

export interface Supplier {
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

export interface CreateSupplierDto {
  razonSocial: string
  nombreComercial?: string
  rfc?: string
  email?: string
  telefono?: string
  activo?: boolean
}
