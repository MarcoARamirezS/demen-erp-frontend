// ~/utils/dates.ts
import type { FireTimestamp } from '~/types/audit'

export function fireTsToDate(ts?: FireTimestamp): Date | null {
  if (!ts || !ts._seconds) return null
  return new Date(ts._seconds * 1000)
}

export function formatDateTime(ts?: FireTimestamp): string {
  const d = fireTsToDate(ts)
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}
