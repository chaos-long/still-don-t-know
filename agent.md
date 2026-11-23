# Quy trình làm việc với GitHub

- Trước khi bắt đầu một yêu cầu mới, kiểm tra trạng thái Git cục bộ và cập nhật mới nhất của nhánh đang theo dõi trên GitHub. Đồng bộ với tiến độ đã có trên GitHub trước khi sửa mã.
- Giữ nguyên các thay đổi cục bộ của người dùng. Nếu có thay đổi chưa commit, lịch sử phân nhánh hoặc xung đột, xử lý an toàn và tránh ghi đè; chỉ tiếp tục khi hiểu được trạng thái. Nếu không thể đồng bộ, báo rõ trở ngại thay vì coi bản cục bộ đã cập nhật.
- Sau khi hoàn thành và kiểm tra phù hợp, commit các thay đổi thuộc yêu cầu và cập nhật repo GitHub theo quyền đã được cấp. Kiểm tra trạng thái Git sau khi hoàn tất.

# Quy chuẩn thiết kế giao diện Chat mô phỏng (Simulated Chat Box UI)

Với mỗi challenge/bài thực hành mới hoặc khi chỉnh sửa các bài cũ nếu có sử dụng box chat giả lập, bắt buộc phải sử dụng giao diện (UI) đồng nhất với bài **“Trước giờ tổng duyệt”** (`story.html` / `story-player.css` / `story-player.js`):

1. **Bố cục tổng thể (Layout & Viewport):**
   - Trải nghiệm toàn màn hình `100vh / 100dvh`, ẩn thanh header và footer chính của website khi đang ở màn hình làm bài (`body:has(...) :is(.site-header, .site-footer) { display: none; }`).
   - **Desktop (màn hình rộng):** Chia 2 cột cố định:
     - Cột trái (~300px): Hộp thư / Danh sách cuộc trò chuyện và ứng dụng liên quan (`sp-inbox`). Header có tiêu đề "Tin nhắn", tên kịch bản/bài tập, và nút "Thoát" dẫn về `practice.html`. Mỗi hàng hội thoại (`sp-row`) cao 72px gồm avatar tròn 40px, tên liên hệ in đậm, dòng xem trước tin nhắn mới nhất, thời gian và badge số tin chưa đọc màu đỏ cam (`#c95238`).
     - Cột phải: Khung hội thoại đang mở (`sp-conversation`).
   - **Mobile (màn hình <= 760px):** Mobile-first, hiển thị luân phiên giữa danh sách hộp thư (`list`) và cuộc chat chi tiết (`chat`). Header cuộc chat có nút quay lại (mũi tên góc trái) để trở về danh sách. Luôn chừa safe area ở đáy (`env(safe-area-inset-bottom)`). Không để phát sinh thanh cuộn ngang ngoài ý muốn (`scrollWidth <= clientWidth`).

2. **Khung hội thoại & Lịch sử tin nhắn (Conversation & History):**
   - Header cố định cao 60px nền trắng, gồm nút quay lại trên mobile, avatar 38px, tên liên hệ, trạng thái/số thành viên và liên kết "Thoát" về Thực hành trên desktop.
   - Nền lịch sử chat: Màu be sáng `#f1f0ec` (`--sp-bg`), phần nội dung căn giữa với độ rộng tối đa ~700px.
   - Dấu mốc thời gian (`sp-time-label`): Dạng viên thuốc nhỏ gọn bo tròn, màu chữ `#717575`, căn giữa.
   - Bong bóng tin nhắn (`sp-bubble`): Nhỏ vừa nội dung, bo góc 12px, đổ bóng nhẹ `0 1px 2px rgba(40,35,27,.08)`:
     - Tin đến / người khác: Nền trắng `#ffffff`, chữ `#262626`.
     - Tin đi / người chơi: Nền vàng nhạt `#fff0b8`, chữ `#262626`, căn sát lề phải.
     - Dấu giờ tin nhắn (`sp-message-time`): Chữ nhỏ kín đáo 11px màu `#777b7b`.
     - Hiệu ứng gõ tin (`sp-typing`): Ba chấm chuyển động trên nền bong bóng trắng.

3. **Vùng hành động sát đáy (Action Tray):**
   - Cố định ở đáy màn hình với nền than sẫm `#34383c` (`--sp-action`), chữ trắng.
   - Nút hành động chính / gửi: Màu vàng nghệ `#e9c66e` (`--sp-accent`), chữ tối `#262626`, bo góc 9px, font-weight 700.
   - Nút lựa chọn / phản hồi phụ: Nền xám `#43494f`, viền `#545c63`, chữ trắng.
   - Dòng nhắc nhở / hướng dẫn: Chữ màu xám sáng `#d8dbdc`.

4. **Hộp thoại xem chi tiết / Modal (`sp-dialog`):**
   - Căn giữa màn hình, bo góc 16px, đổ bóng sâu, hiệu ứng nền làm mờ `backdrop-filter: blur(2px)`. Có nút đóng '×' ở góc trên bên phải. Không dùng ảnh/nội dung nhạy cảm thật trong tình huống mô phỏng.
