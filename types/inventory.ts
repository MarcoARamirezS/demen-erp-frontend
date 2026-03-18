export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUST'
export type InventoryReferenceType = 'purchase' | 'sale' | 'manual'
export type InventoryStockStatus = 'OK' | 'LOW' | 'OUT'

export interface InventoryProductRef {
  id: string
  name: string
  partNumber?: string
  internalCode?: string
  location?: string
  stockOnHand?: number
  stockMin?: number
  stockMax?: number
  active?: boolean
}

export interface InventoryMovement {
  id: string
  productId: string
  type: InventoryMovementType
  quantity: number
  reason: string
  referenceType?: InventoryReferenceType
  referenceId?: string
  createdBy: string
  createdAt: any
  updatedAt?: any

  stockBefore?: number
  stockAfter?: number

  product?: InventoryProductRef | null
}

export interface InventoryMovementsQuery {
  productId?: string
  search?: string
  type?: InventoryMovementType | ''
  limit?: number
  cursor?: string
}

export interface InventoryStockItem {
  id: string
  name: string
  partNumber?: string
  internalCode?: string
  brand?: string
  unit?: string
  location?: string
  active?: boolean

  stockOnHand: number
  stockMin: number
  stockMax: number

  stockStatus: InventoryStockStatus
  updatedAt?: any
  createdAt?: any
}

export interface InventoryStockQuery {
  search?: string
  stockStatus?: InventoryStockStatus | ''
  limit?: number
  cursor?: string
}

export interface InventorySummary {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalUnits: number
  movementsToday: number
}
