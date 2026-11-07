import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Download, Share2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  applyBackup,
  backupToFile,
  canShareFile,
  createBackup,
  downloadFile,
  readBackup,
  type BackupFile,
  type BackupSummary,
} from '@/lib/backup'
import { useQuizStore } from '@/store/quiz-store'

export const TRANSFER_ANCHOR = 'chuyen-may'

const formatDateTime = (ms: number) =>
  new Date(ms).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })

function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="grid gap-0.5">
        <span className="text-[15px] font-medium text-ink">{title}</span>
        <span className="text-sm text-ink-soft">{text}</span>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">{children}</div>
    </div>
  )
}

/** "Chuyển sang máy khác": export everything to a .json file, or replace this device's data with one. */
export function TransferSection() {
  const location = useLocation()
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isEmpty = useQuizStore((s) => Object.keys(s.bank).length === 0 && s.history.length === 0 && !s.activeSession)
  const [pending, setPending] = useState<{ backup: BackupFile; summary: BackupSummary } | null>(null)
  const [reading, setReading] = useState(false)
  const [shareable, setShareable] = useState(false)

  // Arriving via /nap-cau-hoi#chuyen-may (link on the empty home page) scrolls here.
  useEffect(() => {
    if (location.hash === `#${TRANSFER_ANCHOR}`) sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [location.hash])

  // Share sheet support is per browser; probe once with a tiny file.
  useEffect(() => {
    setShareable(canShareFile(new File(['{}'], 'probe.json', { type: 'application/json' })))
  }, [])

  const exportData = () => {
    downloadFile(backupToFile(createBackup()))
    toast.success('Đã xuất dữ liệu.', { description: 'Gửi file .json sang máy kia rồi bấm "Nhập dữ liệu" ở đó.' })
  }

  const shareData = async () => {
    const file = backupToFile(createBackup())
    try {
      await navigator.share({ files: [file], title: 'Dữ liệu ôn tập trắc nghiệm' })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return // user closed the share sheet
      toast.error('Không mở được bảng chia sẻ. Dùng "Xuất dữ liệu" để tải file về rồi gửi đi.')
    }
  }

  const pickFile = async (file: File | undefined) => {
    if (!file) return
    setReading(true)
    const result = await readBackup(file)
    setReading(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setPending({ backup: result.backup, summary: result.summary })
  }

  const confirmImport = () => {
    if (!pending) return
    const result = applyBackup(pending.backup)
    const active = pending.summary.active
    setPending(null)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Đã nhập dữ liệu từ file sao lưu.', {
      action: active ? { label: 'Làm tiếp', onClick: () => void navigate('/lam-bai') } : undefined,
    })
  }

  const s = pending?.summary

  return (
    <section ref={sectionRef} id={TRANSFER_ANCHOR} aria-labelledby="transfer-heading" className="grid scroll-mt-6 gap-1">
      <h2 id="transfer-heading" className="text-[17px] font-semibold text-ink">
        Chuyển sang máy khác
      </h2>
      <p className="text-sm text-ink-soft">
        Muốn làm tiếp trên điện thoại hay máy khác? Xuất dữ liệu ở máy này, gửi file sang máy kia rồi nhập vào.
      </p>
      <div className="mt-2 divide-y border-y">
        <Row
          title="Xuất dữ liệu"
          text={
            isEmpty
              ? 'Chưa có gì để xuất trên máy này.'
              : 'Gồm ngân hàng câu hỏi, lượt đang làm dở, lịch sử và cài đặt, trong một file .json.'
          }
        >
          {shareable && (
            <Button type="button" variant="outline" className="shadow-none" disabled={isEmpty} onClick={shareData}>
              <Share2 aria-hidden />
              Chia sẻ
            </Button>
          )}
          <Button type="button" variant="outline" className="shadow-none" disabled={isEmpty} onClick={exportData}>
            <Download aria-hidden />
            Xuất dữ liệu
          </Button>
        </Row>
        <Row
          title="Nhập dữ liệu"
          text="Chọn file sao lưu từ máy kia. Toàn bộ dữ liệu trên máy này sẽ được thay bằng nội dung file."
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void pickFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <Button type="button" variant="outline" className="shadow-none" disabled={reading} onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden />
            {reading ? 'Đang đọc file…' : 'Nhập dữ liệu'}
          </Button>
        </Row>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Thay dữ liệu trên máy này?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="grid gap-3 text-sm text-ink-soft">
                {s && (
                  <>
                    <p>File được xuất lúc {formatDateTime(s.exportedAt)}, gồm:</p>
                    <ul className="grid gap-1 text-ink">
                      <li>
                        {s.questionCount} câu hỏi từ {s.sourceCount} file nguồn
                      </li>
                      <li>
                        {s.active
                          ? `Lượt ${s.active.retry ? 'làm lại câu sai' : 'đầy đủ'} đang làm dở ở câu ${s.active.at}/${s.active.total}`
                          : 'Không có lượt đang làm dở'}
                      </li>
                      <li>{s.historyCount} lượt trong lịch sử</li>
                    </ul>
                    <p>Dữ liệu hiện có trên máy này sẽ bị thay hoàn toàn và không hoàn tác được.</p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Thay dữ liệu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
