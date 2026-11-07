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
