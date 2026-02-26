export type CondicionPago = '30' | '45' | '60' | '90'

export interface Client {
  id: string
  tipo: 'empresa' | 'persona'
  nombreComercial: string
  razonSocial: string
  rfc?: string
  telefono?: string
  email?: string

  diasCredito: number
  limiteCredito: number
  condicionPago: CondicionPago

  clasificacionFiscal?: string
  regimenFiscal?: string
  usoCfdiDefault?: string

  aplicaRepse: boolean
  aplicaPortalFacturacion: boolean

  comentarios?: string | null
  activo: boolean
}

export type CreateClientDto = Omit<Client, 'id'>
