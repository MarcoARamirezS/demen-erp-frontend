// 📁 ~/types/supplier.ts

import type { FireTimestamp } from '~/types/fire'

/**
 * Proveedor
 */
export interface Supplier {
  id: string

  name: string // Razón social
  rfc?: string
  email?: string
  phone?: string

  active: boolean

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

/**
 * DTO creación
 */
export interface CreateSupplierDto {
  name: string
  rfc?: string
  email?: string
  phone?: string
  active?: boolean
}
