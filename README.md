# Ôn tập trắc nghiệm

Ứng dụng web chạy hoàn toàn trên trình duyệt để ôn tập câu hỏi trắc nghiệm từ file Excel. Không có backend; dữ liệu (ngân hàng câu hỏi, lượt làm, lịch sử) được lưu trong `localStorage` của trình duyệt.

## Định dạng file Excel

Hỗ trợ `.xlsx`, `.xls`, `.csv`. App đọc **tất cả các sheet**; sheet chỉ có hướng dẫn hoặc câu mẫu (như sheet `Example` của template Kahoot) được bỏ qua. Dòng tiêu đề được tự dò (cột B bắt đầu bằng "Question"/"Câu hỏi", cột H bằng "Correct"/"Đáp án"); nếu không thấy thì coi dòng 1 là tiêu đề. Dòng chỉ có số thứ tự ở cột A được bỏ qua.

| Cột | Nội dung |
| --- | --- |
| A | Số thứ tự |
| B | Câu hỏi |
| C–F | Đáp án 1–4 (tối thiểu 2, ô trống được bỏ qua) |
| G | Thời gian trả lời (giây), mặc định 60 nếu trống |
| H | Đáp án đúng, ví dụ `2` hoặc `1,3` |

Dòng mẫu của template ("Which spreadsheet tools can read this sheet…") được tự động bỏ qua. Dòng lỗi được bỏ qua và liệt kê trong báo cáo sau khi build.

Câu hỏi được nhận diện theo nội dung: nạp lại câu đã có thì bản mới ghi đè; nạp lại file cùng tên thì danh sách câu của file đó được thay thế.

## Chạy trên máy

Yêu cầu Node 22 (`.nvmrc`).

```bash
nvm use
npm install
npm run dev
```

## Deploy lên Vercel

`vercel.json` đã cấu hình sẵn (framework Vite, output `dist`, rewrite SPA về `index.html`). Import repo trên Vercel hoặc chạy:

```bash
npx vercel        # preview
npx vercel --prod # production
```

Đặt Node.js version của project trên Vercel là 22.x.

## Làm tiếp trên máy khác (điện thoại ↔ máy tính)

Dữ liệu nằm trong trình duyệt của từng máy, nên cần chuyển bằng file sao lưu:

1. Trên máy đang dùng: **Nạp câu hỏi → Chuyển sang máy khác → Xuất dữ liệu** (trên điện thoại có thêm nút **Chia sẻ** để gửi thẳng qua Zalo, AirDrop…). File `on-tap-trac-nghiem-YYYY-MM-DD.json` chứa ngân hàng câu hỏi, lượt đang làm dở, lịch sử, kết quả từng câu và cài đặt.
2. Gửi file sang máy kia và mở app bằng cùng địa chỉ Vercel.
3. Trên máy kia: **Nạp câu hỏi → Nhập dữ liệu** (khi máy còn trống, trang Tổng quan có sẵn đường dẫn). Xem lại nội dung file rồi bấm **Thay dữ liệu**. Toàn bộ dữ liệu trên máy đó được thay bằng nội dung file; lượt dở tiếp tục đúng câu đang làm.

File không đúng định dạng, hỏng, hoặc quá lớn so với bộ nhớ trình duyệt sẽ bị từ chối và dữ liệu hiện có giữ nguyên.
