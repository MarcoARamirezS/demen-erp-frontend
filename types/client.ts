export type ClientTipo = 'empresa' | 'persona'
export type CondicionPago = '0' | '7' | '15' | '30' | '45' | '60' | '90'

export type FireTimestamp =
  | Date
  | string
  | number
  | {
      _seconds?: number
      _nanoseconds?: number
      seconds?: number
      nanoseconds?: number
    }
  | null

export interface ClientLogo {
  publicId?: string
  url?: string
  secureUrl?: string
  originalName?: string
  uploadedAt?: FireTimestamp
}

export interface ClientUsuario {
  nombre: string
  puesto?: string
  email?: string
  telefono?: string
}

export interface CreateClientDto {
  tipo: ClientTipo
  nombreComercial: string
  razonSocial: string
  rfc?: string
  telefono?: string
  email?: string
  usuarios?: ClientUsuario[]

  diasCredito: number
  limiteCredito: number
  condicionPago: CondicionPago

  clasificacionFiscal?: string
  regimenFiscal?: string
  usoCfdiDefault?: string

  aplicaRepse?: boolean
  aplicaPortalFacturacion?: boolean

  comentarios?: string
  activo?: boolean
}

export interface Client extends CreateClientDto {
  id: string
  logo?: ClientLogo | null
  createdAt?: FireTimestamp
  updatedAt?: FireTimestamp
}
