// ~/types/role.ts
import type { FireTimestamp } from '~/types/user'

export interface Role {
  id: string
  name: string
  description?: string
  permissionCodes: string[]
  active: boolean

  createdAt?: FireTimestamp
  updatedAt?: FireTimestamp
}

export interface CreateRoleDto {
  name: string
  description?: string
  permissionCodes?: string[]
  active?: boolean
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}
