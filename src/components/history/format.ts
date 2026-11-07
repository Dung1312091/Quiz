const dateTimeFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const percentFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

export function formatDateTime(ms: number): string {
  return dateTimeFormat.format(ms)
}

/** 83.3 → "83,3%" */
export function formatPercent(percent: number): string {
  return `${percentFormat.format(percent)}%`
}

/** Duration in words: "dưới 1 phút", "12 phút", "1 giờ 5 phút". */
export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return 'dưới 1 phút'
  if (minutes < 60) return `${minutes} phút`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} giờ ${m} phút` : `${h} giờ`
}
