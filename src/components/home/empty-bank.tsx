import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    title: 'Nạp file Excel',
    text: 'Mỗi dòng là một câu hỏi với 2–4 đáp án, cột H ghi đáp án đúng. Có thể nạp nhiều file.',
  },
  {
    title: 'Làm từng lượt',
    text: 'Mỗi lượt đi qua toàn bộ ngân hàng theo thứ tự ngẫu nhiên. Tô đáp án và biết đúng sai ngay.',
  },
  {
    title: 'Xem kết quả, làm lại câu sai',
    text: 'Cuối lượt có tỉ lệ đúng và danh sách câu sai để làm lại cho đến khi nhớ.',
  },
]

export function EmptyBank() {
  return (
    <div className="grid gap-10">
      <section className="grid max-w-xl gap-4">
        <h2 className="text-[22px] leading-snug font-semibold text-ink">Ngân hàng câu hỏi đang trống</h2>
        <p className="text-[15px] text-ink-soft">
          Nạp một file Excel chứa câu hỏi và đáp án để bắt đầu ôn tập. Dữ liệu chỉ lưu trên trình duyệt này.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button asChild size="lg">
            <Link to="/nap-cau-hoi">Nạp câu hỏi</Link>
          </Button>
          <Link
            to={{ pathname: "/nap-cau-hoi", hash: "#chuyen-may" }}
            className="text-[15px] text-ink underline underline-offset-4 hover:no-underline"
          >
            Đã làm trên máy khác? Nhập file sao lưu
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="grid gap-4">
        <h2 id="how-heading" className="text-[15px] font-semibold text-ink">
          Cách dùng
        </h2>
        <ol className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2.5">
              <span
                aria-hidden
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-sheet-rule bg-paper text-sm font-semibold text-sheet tabular"
              >
                {i + 1}
              </span>
              <div className="grid gap-1">
                <span className="text-[15px] font-medium text-ink">{step.title}</span>
                <span className="text-sm leading-relaxed text-ink-soft">{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
