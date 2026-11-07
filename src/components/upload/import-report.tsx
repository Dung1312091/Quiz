import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/components/home/format'
import type { FileImportSummary, ImportReport as Report, RowError } from '@/lib/types'
import { cn } from '@/lib/utils'

const COLLAPSED_ERROR_ROWS = 8

function Tally({ value, label, tone }: { value: number; label: string; tone?: 'wrong' }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-[13px] text-ink-soft">{label}</dt>
      <dd
        className={cn(
          'text-[22px] leading-tight font-semibold tabular',
          value === 0 ? 'text-ink-faint' : tone === 'wrong' ? 'text-fail' : 'text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function fileLine(f: FileImportSummary): string {
  const parts: string[] = []
  if (f.added) parts.push(`${f.added} mới`)
  if (f.updated) parts.push(`${f.updated} cập nhật`)
  if (f.unchanged) parts.push(`${f.unchanged} không đổi`)
  if (f.removed) parts.push(`${f.removed} gỡ bỏ`)
  if (f.errors.length) parts.push(`${f.errors.length} dòng lỗi`)
  return parts.join(', ')
}

function FileRow({ file }: { file: FileImportSummary }) {
  const valid = file.added + file.updated + file.unchanged
  return (
    <li className="grid gap-0.5 py-2.5">
      <span className="break-all text-[15px] font-medium text-ink">{file.name}</span>
      {valid === 0 ? (
        <span className="text-sm text-fail">
          Không có câu hỏi hợp lệ nào, ngân hàng giữ nguyên với file này.{' '}
          {file.errors.length ? 'Xem các dòng lỗi bên dưới.' : 'File có thể đang trống.'}
        </span>
      ) : (
        <span className="text-sm text-ink-soft">
          {valid} câu hợp lệ: {fileLine(file)}
        </span>
      )}
    </li>
  )
}

function ErrorTable({ errors }: { errors: RowError[] }) {
  const [expanded, setExpanded] = useState(false)
  const long = errors.length > COLLAPSED_ERROR_ROWS
  const visible = long && !expanded ? errors.slice(0, COLLAPSED_ERROR_ROWS) : errors

  return (
    <div className="grid gap-2">
      <h3 className="text-[15px] font-semibold text-ink">Dòng bị bỏ qua</h3>
      <div className="overflow-x-auto rounded-md border border-rule">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-desk text-[13px] text-ink-soft">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                File
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Dòng
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Lý do
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {visible.map((e, i) => (
              <tr key={`${e.file}-${e.row}-${i}`} className="align-top">
                <td className="max-w-40 px-3 py-2 break-all text-ink-soft">{e.file}</td>
                <td className="px-3 py-2 text-ink tabular">{e.row > 0 ? (e.sheet ? `${e.row} (sheet ${e.sheet})` : e.row) : 'Cả file'}</td>
                <td className="min-w-48 px-3 py-2 text-ink">{e.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {long && (
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? 'Thu gọn' : `Hiện tất cả ${errors.length} dòng lỗi`}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ImportReport({ report, onDismiss }: { report: Report; onDismiss: () => void }) {
  const errors = report.files.flatMap((f) => f.errors)

  return (
    <section aria-labelledby="report-heading" className="grid gap-5 rounded-md border border-rule bg-paper p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id="report-heading" className="text-[17px] font-semibold text-ink">
            Kết quả build gần nhất
          </h2>
          <p className="text-sm text-ink-soft">
            {formatDateTime(report.at)}, {report.files.length} file
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Ẩn kết quả build"
          onClick={onDismiss}
          className="-mt-1 -mr-1 text-ink-soft hover:text-ink"
        >
          <X />
        </Button>
      </div>

      <dl className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5">
        <Tally value={report.added} label="Mới" />
        <Tally value={report.updated} label="Cập nhật" />
        <Tally value={report.unchanged} label="Không đổi" />
        <Tally value={report.removed} label="Gỡ bỏ" />
        <Tally value={report.errorCount} label="Dòng lỗi" tone="wrong" />
      </dl>
      {report.removed > 0 && (
        <p className="-mt-2 text-[13px] text-ink-soft">
          Gỡ bỏ là những câu có trong bản cũ của file nhưng không còn trong bản mới, và không nằm trong file nào khác.
        </p>
      )}

      <ul className="divide-y border-t">
        {report.files.map((f) => (
          <FileRow key={f.name} file={f} />
        ))}
      </ul>

      {errors.length > 0 && <ErrorTable errors={errors} />}
    </section>
  )
}
