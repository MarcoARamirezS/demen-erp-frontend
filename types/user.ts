// ~/types/user.ts
export type FireTimestamp = { _seconds: number; _nanoseconds: number } | null | undefined

export interface User {
  id: string
  nombre: string
  apaterno: string
  amaterno?: string

  direccion?: string
  telefono?: string
  ciudad?: string
  estado?: string

  usuario: string
  activo: boolean

  roleIds: string[]
  permissionCodes: string[]

  createdAt?: FireTimestamp
  updatedAt?: FireTimestamp
}

export interface CreateUserDto {
  nombre: string
  apaterno: string
  amaterno?: string

  direccion?: string
  telefono?: string
  ciudad?: string
  estado?: string

  usuario: string
  password: string
  activo?: boolean
  roleIds?: string[]
  permissionCodes?: string[]
}
