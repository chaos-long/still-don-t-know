# Lab An Toàn Số

Website tiếng Việt giúp học sinh THPT làm quen với an toàn số. Trang Thực hành có hai bài mô phỏng “Công An Giả” và “Tao đây, Minh đây”, hỗ trợ tìm kiếm, lọc chủ đề và tiếp tục bài đang làm qua Workspace.

## Chạy trên máy

Cần Node.js 18 trở lên, không cần cài thêm thư viện.

```sh
npm run dev
```

Mở địa chỉ được in trong terminal (mặc định `http://127.0.0.1:4173`). Để tạo bản tĩnh riêng, chạy `npm run build`; kết quả nằm trong `dist/` và có thể đưa lên bất kỳ máy chủ tĩnh nào.

## Kiểm thử trình duyệt

Cài Chromium hoặc Chrome và ChromeDriver tương thích, rồi bảo đảm `chromedriver` có trong `PATH`. Chạy:

```sh
npm run test:browser
```

Kiểm thử tự build website và dùng một hồ sơ trình duyệt tạm, không động đến dữ liệu trình duyệt cá nhân. Có thể đặt `CHROMEDRIVER` là đường dẫn tới ChromeDriver hoặc `CHROME_BINARY` là đường dẫn tới Chromium/Chrome. Trong môi trường Linux không hỗ trợ Chrome sandbox, có thể chạy `CHROME_NO_SANDBOX=1 npm run test:browser`.

## Cấu trúc và giới hạn

- `src/config.js`: tên website dùng chung.
- `src/pages/`: nội dung và cấu trúc từng trang.
- `src/assets/`: giao diện và các tương tác chạy trên trình duyệt.
- `scripts/`: tạo các trang HTML và chạy máy chủ xem thử.

Trạng thái bài tập được lưu trên cùng trình duyệt bằng localStorage, không đồng bộ giữa các thiết bị. Tin nhắn và ảnh trong bài mô phỏng không được gửi tới máy chủ hay lưu lâu dài. Người học hoàn thành bài bằng cách xử lý phù hợp trong tình huống. Khi có hai bài đang làm, Workspace cho phép chọn bài để tiếp tục. Các bài và chủ đề còn lại là nội dung minh họa; chưa có đăng nhập.
