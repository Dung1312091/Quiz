import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmAction } from '@/components/upload/confirm-action'
import { useQuizStore } from '@/store/quiz-store'

function DangerRow({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="grid gap-0.5">
        <span className="text-[15px] font-medium text-ink">{title}</span>
        <span className="text-sm text-ink-soft">{text}</span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const dangerButton = 'border-fail/40 bg-paper text-fail shadow-none hover:bg-fail-wash hover:text-fail'

export function DangerZone() {
  const historyCount = useQuizStore((s) => s.history.length)
  const clearHistory = useQuizStore((s) => s.clearHistory)
  const resetAll = useQuizStore((s) => s.resetAll)

  return (
    <section aria-labelledby="danger-heading" className="grid gap-1">
      <h2 id="danger-heading" className="text-[17px] font-semibold text-ink">
        Xóa dữ liệu
      </h2>
      <p className="text-sm text-ink-soft">Dữ liệu chỉ lưu trên trình duyệt này. Thao tác xóa không hoàn tác được.</p>
      <div className="mt-2 divide-y border-y">
        <DangerRow
          title="Xóa lịch sử làm bài"
          text={
            historyCount
              ? `Xóa ${historyCount} lượt đã làm xong. Ngân hàng câu hỏi và lượt đang làm dở vẫn giữ nguyên.`
              : 'Chưa có lượt nào trong lịch sử.'
          }
        >
          <ConfirmAction
            trigger={
              <Button type="button" variant="outline" className={dangerButton} disabled={historyCount === 0}>
                Xóa lịch sử làm bài
              </Button>
            }
            title="Xóa lịch sử làm bài?"
            description={
              <p>
                {historyCount} lượt đã làm xong và kết quả chi tiết của chúng sẽ bị xóa. Ngân hàng câu hỏi và lượt đang
                làm dở vẫn giữ nguyên.
              </p>
            }
            actionLabel="Xóa lịch sử"
            onConfirm={() => {
              clearHistory()
              toast.success('Đã xóa lịch sử làm bài.')
            }}
          />
        </DangerRow>
        <DangerRow
          title="Reset toàn bộ"
          text="Xóa ngân hàng câu hỏi, lịch sử, lượt đang làm dở và cài đặt. Ứng dụng trở về như lúc mới mở."
        >
          <ConfirmAction
            trigger={
              <Button type="button" variant="outline" className={dangerButton}>
                Reset toàn bộ
              </Button>
            }
            title="Reset toàn bộ dữ liệu?"
            description={
              <p>
                Ngân hàng câu hỏi, toàn bộ lịch sử, lượt đang làm dở và cài đặt sẽ bị xóa. Bạn sẽ cần nạp lại file để
                làm bài.
              </p>
            }
            actionLabel="Reset toàn bộ"
            onConfirm={() => {
              resetAll()
              toast.success('Đã reset toàn bộ dữ liệu.')
            }}
          />
        </DangerRow>
      </div>
    </section>
  )
}
