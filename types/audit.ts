// ~/types/audit.ts
export type FireTimestamp = { _seconds: number; _nanoseconds: number } | null | undefined

export interface AuditLog {
  id: string
  actorUserId?: string | null
  action: string
  resource: string
  resourceId?: string | null
  meta?: Record<string, any>
  createdAt?: FireTimestamp
}
