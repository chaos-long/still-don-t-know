# Lab An Toàn Số

Bản draft website tiếng Việt giúp học sinh THPT làm quen với an toàn số. Website gồm trang chủ, Thực hành và Kiến thức; các bài và chủ đề hiện là nội dung minh họa, chưa có bài chi tiết hoặc chức năng kiểm tra flag.

## Chạy trên máy

Cần Node.js 18 trở lên, không cần cài thêm thư viện.

```sh
npm run dev
```

Mở địa chỉ được in trong terminal (mặc định `http://127.0.0.1:4173`). Để tạo bản tĩnh riêng, chạy `npm run build`; kết quả nằm trong `dist/` và có thể đưa lên bất kỳ máy chủ tĩnh nào.

## Cấu trúc

- `src/config.js`: tên website dùng chung.
- `src/pages/`: nội dung từng trang; danh sách bài mẫu và chủ đề nằm trong các mảng dữ liệu tương ứng.
- `src/assets/`: giao diện và menu trên màn hình nhỏ.
- `scripts/`: tạo các trang HTML và chạy máy chủ xem thử.

Đăng nhập, lưu tiến độ, nội dung bài chi tiết và kiểm tra flag chưa được triển khai.
