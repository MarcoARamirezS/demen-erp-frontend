export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUST'

export interface InventoryMovement {
  id: string
  productId: string
  type: InventoryMovementType
  quantity: number
  reason: string
  referenceType?: 'purchase' | 'sale' | 'manual'
  referenceId?: string
  createdBy: string
  createdAt: any // FireTimestamp
}

export interface InventoryQuery {
  productId?: string
  limit?: number
  cursor?: string
}
