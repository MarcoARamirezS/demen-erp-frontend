import type { FireTimestamp } from '~/types/firestore'

export interface ClientAddress {
  id: string
  clientId: string

  calle: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  ciudad: string
  estado: string
  pais: string
  codigoPostal?: string
  referencias?: string

  esFiscal: boolean
  esEnvio: boolean
  activo: boolean

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

export interface CreateClientAddressDto {
  clientId: string

  calle: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  ciudad: string
  estado: string
  pais: string
  codigoPostal?: string
  referencias?: string

  esFiscal: boolean
  esEnvio: boolean
  activo: boolean
}
