export interface ProductImage {
  publicId: string
  url: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  isMain: boolean
  order: number
  createdAt: FireTimestamp
}

export interface Product {
  id: string
  partNumber: string // 🔥 CAMBIADO
  internalCode?: string
  name: string
  description?: string
  brand?: string
  unit: 'm' | 'pz' | 'kg' | 'lt'
  familyId: string // 🔥 requerido
  categoryId: string // 🔥 requerido
  active: boolean
  avgCost?: number
  lastCost?: number
  createdAt?: any
  updatedAt?: any
  images?: ProductImage[]
}

/* =========================
   DTO SOLO PARA CREAR
========================= */

export interface CreateProductDto {
  partNumber: string
  name: string
  description?: string
  brand?: string
  unit: 'm' | 'pz' | 'kg' | 'lt'
  familyId: string
  categoryId: string
}
