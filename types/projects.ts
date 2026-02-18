export type ProjectStatus =
  | 'AUTH_PENDING'
  | 'AUTHORIZED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'NOT_ASSIGNED'

export interface Project {
  id: string
  projectNumber: string

  clientId: string
  branchId: string

  plantaCliente?: string | null
  objetivoFuncionalCliente?: string | null
  realizaLevantamiento?: string | null
  personaAQuienVisita?: string | null

  fecha?: string | null
  visitDate?: any

  status: ProjectStatus
  statusHistory?: any[]

  isActive: boolean

  createdAt?: any
  updatedAt?: any
}

export interface CreateProjectDto {
  clientId: string
  branchId: string
  plantaCliente?: string | null
  objetivoFuncionalCliente?: string | null
  realizaLevantamiento?: string | null
  personaAQuienVisita?: string | null
  fecha?: string | null
}
