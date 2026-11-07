import { optionLetter } from '@/lib/text'

/** 42_000 → "0:42", 754_000 → "12:34". Expects a non-negative number of whole seconds. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** 72.5 → "72,5%" (Vietnamese decimal comma). */
export function formatPercent(value: number): string {
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
}

const dateTimeFormat = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDateTime(ts: number): string {
  return dateTimeFormat.format(ts)
}

/** Human duration: "45 giây", "12 phút", "1 giờ 5 phút". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  if (totalSeconds < 60) return `${totalSeconds} giây`
  const totalMinutes = Math.round(totalSeconds / 60)
  if (totalMinutes < 60) return `${totalMinutes} phút`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m ? `${h} giờ ${m} phút` : `${h} giờ`
}

/** [0, 2] → "A, C" */
export function formatLetters(indices: readonly number[]): string {
  return indices.map(optionLetter).join(', ')
}
