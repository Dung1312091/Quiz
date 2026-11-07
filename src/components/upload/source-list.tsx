import { useMemo } from 'react'
import { FileSpreadsheet, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/components/home/format'
import { ConfirmAction } from '@/components/upload/confirm-action'
import type { SourceFile } from '@/lib/types'
import { selectQuestionCount, useQuizStore } from '@/store/quiz-store'

function SourceRow({ source }: { source: SourceFile }) {
  const removeSource = useQuizStore((s) => s.removeSource)
  const count = source.questionIds.length

  return (
    <li className="flex items-center gap-3 py-2.5 pr-2 pl-3">
      <FileSpreadsheet aria-hidden className="size-4 shrink-0 text-ink-faint" />
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-[15px] font-medium text-ink" title={source.name}>
          {source.name}
        </span>
        <span className="text-[13px] text-ink-soft">
          <span className="tabular">{count}</span> câu, nạp lúc <span className="tabular">{formatDateTime(source.importedAt)}</span>
        </span>
      </div>
      <ConfirmAction
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Xóa ${source.name} khỏi ngân hàng`}
            className="text-ink-soft hover:bg-fail-wash hover:text-fail"
          >
            <Trash2 />
          </Button>
        }
        title={`Xóa "${source.name}" khỏi ngân hàng?`}
        description={
          <>
            <p>
              {count} câu hỏi của file này sẽ bị xóa khỏi ngân hàng, cùng kết quả đúng/sai gần nhất của chúng.
            </p>
            <p>Câu nào cũng có trong file khác thì vẫn được giữ lại. Lượt đang làm dở không bị ảnh hưởng.</p>
          </>
        }
        actionLabel="Xóa file"
        onConfirm={() => {
          removeSource(source.name)
          toast.success(`Đã xóa "${source.name}" khỏi ngân hàng.`)
        }}
      />
    </li>
  )
}

export function SourceList() {
  const sources = useQuizStore((s) => s.sources)
  const questionCount = useQuizStore(selectQuestionCount)
  const list = useMemo(() => Object.values(sources).sort((a, b) => b.importedAt - a.importedAt), [sources])

  return (
    <section aria-labelledby="bank-heading" className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="bank-heading" className="text-[17px] font-semibold text-ink">
          Ngân hàng hiện có
        </h2>
        {list.length > 0 && (
          <span className="text-sm text-ink-soft">
            <span className="font-semibold text-ink tabular">{questionCount}</span> câu hỏi từ{' '}
            <span className="tabular">{list.length}</span> file
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-ink-soft">Ngân hàng đang trống. Thêm file ở trên và bấm Build để bắt đầu.</p>
      ) : (
        <ul className="divide-y rounded-md border bg-paper">
          {list.map((src) => (
            <SourceRow key={src.name} source={src} />
          ))}
        </ul>
      )}
    </section>
  )
}
