# Lab An Toàn Số

Website tiếng Việt giúp học sinh THPT làm quen với an toàn số. Trang Thực hành có bài mô phỏng “Công An Giả”, hỗ trợ tìm kiếm, lọc chủ đề và tiếp tục bài đang làm qua Workspace.

## Chạy trên máy

Cần Node.js 18 trở lên, không cần cài thêm thư viện.

```sh
npm run dev
```

Mở địa chỉ được in trong terminal (mặc định `http://127.0.0.1:4173`). Để tạo bản tĩnh riêng, chạy `npm run build`; kết quả nằm trong `dist/` và có thể đưa lên bất kỳ máy chủ tĩnh nào.

## Cấu trúc và giới hạn

- `src/config.js`: tên website dùng chung.
- `src/pages/`: nội dung và cấu trúc từng trang.
- `src/assets/`: giao diện và các tương tác chạy trên trình duyệt.
- `scripts/`: tạo các trang HTML và chạy máy chủ xem thử.

Trạng thái bài tập được lưu trên cùng trình duyệt bằng localStorage, không đồng bộ giữa các thiết bị. Tin nhắn và ảnh trong bài mô phỏng không được gửi tới máy chủ hay lưu lâu dài. Các bài và chủ đề còn lại là nội dung minh họa; chưa có đăng nhập hay chức năng kiểm tra flag.
