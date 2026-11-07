import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ColumnGuide } from '@/components/upload/column-guide'
import { DangerZone } from '@/components/upload/danger-zone'
import { DropZone } from '@/components/upload/drop-zone'
import { ImportReport } from '@/components/upload/import-report'
import { PendingList } from '@/components/upload/pending-list'
import { SourceList } from '@/components/upload/source-list'
import { StartQuizPrompt } from '@/components/upload/start-quiz-prompt'
import { isAcceptedFile, parseQuizFile } from '@/lib/parser'
import { useQuizStore } from '@/store/quiz-store'

/** Adds files to the pending list; a same-named file replaces the pending one in place. */
function mergePending(pending: File[], incoming: File[]): File[] {
  const next = [...pending]
  for (const file of incoming) {
    const i = next.findIndex((f) => f.name === file.name)
    if (i >= 0) next[i] = file
    else next.push(file)
  }
  return next
}

const quoteNames = (files: File[]) => files.map((f) => '"' + f.name + '"').join(', ')

function ActiveSessionNote() {
  const hasActive = useQuizStore((s) => s.activeSession !== null)
  if (!hasActive) return null
  return (
    <p className="rounded-md border border-rule bg-paper px-4 py-3 text-sm text-ink-soft">
      Bạn đang có một lượt làm dở. Câu hỏi mới sẽ xuất hiện từ lượt sau, lượt hiện tại giữ nguyên bộ câu đã có.{' '}
      <Link to="/lam-bai" className="font-medium text-ink underline underline-offset-4 hover:no-underline">
        Tiếp tục làm bài
      </Link>
    </p>
  )
}

export default function UploadPage() {
  const [pending, setPending] = useState<File[]>([])
  const [building, setBuilding] = useState(false)
  const [prompt, setPrompt] = useState<{ added: number; updated: number } | null>(null)
  const lastImport = useQuizStore((s) => s.lastImport)

  const addFiles = (files: File[]) => {
    const accepted = files.filter(isAcceptedFile)
    const rejected = files.filter((f) => !isAcceptedFile(f))
    if (rejected.length) {
      toast.error(`Không nhận ${quoteNames(rejected)}.`, {
        description: 'Chỉ nhận file .xlsx, .xls hoặc .csv. Lưu lại file theo một trong các định dạng này rồi thêm lại.',
      })
    }
    if (!accepted.length) return
    const replaced = accepted.filter((f) => pending.some((p) => p.name === f.name))
    if (replaced.length) {
      toast(`Đã thay ${quoteNames(replaced)} trong danh sách chờ bằng bản mới.`)
    }
    setPending((prev) => mergePending(prev, accepted))
  }

  const build = async () => {
    if (!pending.length || building) return
    setBuilding(true)
    try {
      const parsed = await Promise.all(pending.map((f) => parseQuizFile(f)))
      const report = useQuizStore.getState().importFiles(parsed)
      setPending([])
      const valid = report.added + report.updated + report.unchanged
      if (valid === 0) {
        toast.error('Không có câu hỏi hợp lệ nào được thêm.', { description: 'Xem các dòng lỗi trong kết quả build.' })
      } else {
        toast.success(`Đã build ${parsed.length} file: ${report.added} câu mới, ${report.updated} cập nhật.`)
        setPrompt({ added: report.added, updated: report.updated })
      }
    } catch {
      toast.error('Không build được ngân hàng câu hỏi.', {
        description: 'Có lỗi khi đọc file. Kiểm tra lại file rồi bấm Build lần nữa.',
      })
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="grid max-w-3xl gap-10">
      <header className="grid gap-2">
        <h1 className="text-[30px] leading-tight font-semibold text-ink">Nạp câu hỏi</h1>
        <p className="max-w-prose text-[15px] text-ink-soft">
          Thêm file Excel, kiểm tra danh sách chờ rồi build. Câu trùng nội dung sẽ được cập nhật theo file mới nhất.
        </p>
      </header>

      <ActiveSessionNote />

      <section aria-label="Thêm file" className="grid gap-5">
        <DropZone onFiles={addFiles} disabled={building} />
        <ColumnGuide />
      </section>

      <PendingList
        files={pending}
        building={building}
        onRemove={(name) => setPending((prev) => prev.filter((f) => f.name !== name))}
        onBuild={build}
      />

      {lastImport && (
        <ImportReport key={lastImport.at} report={lastImport} onDismiss={() => useQuizStore.setState({ lastImport: null })} />
      )}

      <SourceList />

      <DangerZone />

      <StartQuizPrompt
        open={prompt !== null}
        onOpenChange={(open) => !open && setPrompt(null)}
        added={prompt?.added ?? 0}
        updated={prompt?.updated ?? 0}
      />
    </div>
  )
}
