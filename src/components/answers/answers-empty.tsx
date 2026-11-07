import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function EmptyBank() {
  return (
    <div className="rounded-md border border-rule bg-paper px-5 py-8 sm:px-8">
      <p className="text-[17px] font-medium text-ink">Ngân hàng câu hỏi đang trống.</p>
      <p className="mt-1.5 max-w-[60ch] text-[15px] text-ink-soft">
        Nạp file Excel câu hỏi để tra cứu đáp án đúng của từng câu tại đây.
      </p>
      <Button asChild className="mt-5">
        <Link to="/nap-cau-hoi">Nạp câu hỏi</Link>
      </Button>
    </div>
  )
}

export function NoResults({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="rounded-md border border-rule bg-paper px-5 py-8 sm:px-8">
      <p className="text-[17px] font-medium text-ink">Không có câu nào khớp.</p>
      <p className="mt-1.5 max-w-[60ch] text-[15px] text-ink-soft">
        {hasFilters
          ? 'Thử bỏ bộ lọc hoặc đổi từ khóa ngắn hơn.'
          : 'Thử từ khóa khác hoặc ngắn hơn — không cần gõ dấu.'}
      </p>
      <Button variant="outline" className="mt-5 bg-paper shadow-none" onClick={onClear}>
        Xóa tìm kiếm và bộ lọc
      </Button>
    </div>
  )
}
