// ~/types/permission.ts
export interface Permission {
  id: string // code (doc id)
  code: string // redundante pero útil
  name: string
  description?: string
  active: boolean
  isSystem?: boolean

  createdAt?: any
  updatedAt?: any
}
