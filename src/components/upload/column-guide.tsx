import { cn } from '@/lib/utils'

const COLUMNS = [
  { letter: 'A', label: 'STT', sample: '1' },
  { letter: 'B', label: 'Câu hỏi', sample: 'Thành phố nào ở miền Bắc?', wide: true },
  { letter: 'C', label: 'Đáp án 1', sample: 'Hà Nội' },
  { letter: 'D', label: 'Đáp án 2', sample: 'Huế' },
  { letter: 'E', label: 'Đáp án 3', sample: 'Hải Phòng' },
  { letter: 'F', label: 'Đáp án 4', sample: 'Cần Thơ' },
  { letter: 'G', label: 'Giây', sample: '30' },
  { letter: 'H', label: 'Đáp án đúng', sample: '1,3', key: true },
]

/** A tiny printed spreadsheet showing which column holds what. */
export function ColumnGuide({ className }: { className?: string }) {
  return (
    <figure className={cn('grid gap-2', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-[13px]">
          <caption className="sr-only">Cấu trúc cột của file câu hỏi</caption>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.letter}
                  scope="col"
                  className="border border-sheet-rule bg-sheet-wash px-2 py-1 text-center text-xs font-semibold text-sheet"
                >
                  {c.letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {COLUMNS.map((c) => (
                <td
                  key={c.letter}
                  className={cn(
                    'border border-sheet-rule bg-paper px-2 py-1.5 font-medium text-ink',
                    c.wide && 'min-w-32',
                  )}
                >
                  {c.label}
                </td>
              ))}
            </tr>
            <tr>
              {COLUMNS.map((c) => (
                <td
                  key={c.letter}
                  className={cn(
                    'border border-sheet-rule bg-paper px-2 py-1.5 text-ink-soft tabular',
                    c.key && 'font-semibold text-ink',
                  )}
                >
                  {c.sample}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <figcaption className="max-w-prose text-[13px] leading-relaxed text-ink-soft">
        Dòng tiêu đề và sheet hướng dẫn (như sheet Example của template Kahoot) được tự bỏ qua; app đọc mọi sheet. Cần 2–4 đáp án, ô trống sẽ bị ẩn. Cột H ghi số thứ tự đáp án đúng, nhiều
        đáp án thì cách nhau bằng dấu phẩy (ví dụ trên: Hà Nội và Hải Phòng).
      </figcaption>
    </figure>
  )
}
