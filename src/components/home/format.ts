import type { SessionKind } from '@/lib/types'

const dateTimeFmt = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateTimeFmt = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

/** "07/11/2026, 14:05" (vi-VN). */
export function formatDateTime(ts: number): string {
  return dateTimeFmt.format(ts)
}

/** "14:05 07/11" — compact, for dense lists. */
export function formatShortDateTime(ts: number): string {
  return shortDateTimeFmt.format(ts)
}

/** 85.5 → "85,5%". */
export function formatPercent(value: number): string {
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} MB`
}

export function sessionKindLabel(kind: SessionKind): string {
  return kind === 'retry' ? 'Làm lại câu sai' : 'Toàn bộ ngân hàng'
}
