export type FireTimestamp =
  | { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number }
  | Date
  | string
  | number
  | null
  | undefined

export interface AuditActor {
  id?: string | null
  nombre?: string | null
  usuario?: string | null
}

export interface AuditChange {
  field: string
  label?: string
  before?: any
  after?: any
}

export interface AuditLog {
  id: string
  actorUserId?: string | null
  actor?: AuditActor | null

  action: string
  actionLabel?: string

  resource: string
  resourceLabel?: string

  resourceId?: string | null
  entityLabel?: string | null

  description?: string | null
  highlights?: string[]
  changes?: AuditChange[]

  meta?: Record<string, any>
  createdAt?: FireTimestamp
}
