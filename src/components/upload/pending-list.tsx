import { FileSpreadsheet, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/components/home/format'

export function PendingList({
  files,
  building,
  onRemove,
  onBuild,
}: {
  files: File[]
  building: boolean
  onRemove: (name: string) => void
  onBuild: () => void
}) {
  return (
    <section aria-labelledby="pending-heading" className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pending-heading" className="text-[17px] font-semibold text-ink">
          Chờ build
        </h2>
        {files.length > 0 && <span className="text-sm text-ink-soft tabular">{files.length} file</span>}
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-ink-soft">Chưa có file nào. Thêm file ở trên, rồi bấm Build để đưa vào ngân hàng.</p>
      ) : (
        <ul className="divide-y divide-rule rounded-md border border-rule bg-paper">
          {files.map((file) => (
            <li key={file.name} className="flex items-center gap-3 py-2 pr-2 pl-3">
              <FileSpreadsheet aria-hidden className="size-4 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate text-[15px] text-ink" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-sm text-ink-faint tabular">{formatBytes(file.size)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Bỏ ${file.name} khỏi danh sách chờ`}
                disabled={building}
                onClick={() => onRemove(file.name)}
                className="text-ink-soft hover:text-ink"
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button type="button" size="lg" onClick={onBuild} disabled={files.length === 0 || building}>
          {building && <Loader2 aria-hidden className="animate-spin" />}
          {building ? 'Đang đọc file…' : 'Build ngân hàng câu hỏi'}
        </Button>
      </div>
    </section>
  )
}
