export default {
  title: 'Góc khuất khung hình',
  description: 'Thực hành nhận diện video deepfake cắt ghép và xử lý tình huống bị đe dọa tống tiền.',
  scripts: ['level3-data.js', 'level3.js'],
  styles: ['level3.css'],
  content: `
    <div class="m3-page wrap" id="level3-app">
      <a class="m3-back" href="practice.html">‹ Quay lại Thực hành</a>
      <section class="m3-intro" id="m3-intro" aria-labelledby="m3-title">
        <p class="m3-eyebrow">MÀN 3 · CHAT/CALL APP · 5–8 PHÚT</p>
        <h1 id="m3-title">Góc khuất khung hình</h1>
        <p class="m3-lead">Đối mặt với một tình huống đe dọa tống tiền bằng video cắt ghép mặt khi bạn đang chuẩn bị nộp bài thuyết trình lúc 22:00. Bạn đang giữ 1.500.000đ tiền sinh hoạt tháng trong ví.</p>
        <div class="m3-notice"><strong>Đây là một tình huống mô phỏng an toàn.</strong> Toàn bộ hình ảnh, tài khoản và giao dịch đều là giả lập và không chứa nội dung độc hại.</div>
        <button type="button" class="m3-primary" data-m3="start">Bắt đầu làm</button>
        <p class="m3-small" id="m3-storage-warning" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn vẫn có thể chơi trong phiên này.</p>
      </section>
      <section class="m3-game" id="m3-game" aria-label="Điện thoại mô phỏng" hidden>
        <div class="m3-inbox-bar" id="m3-inbox-bar" hidden>
          <a href="practice.html">‹ Thực hành</a>
          <h1>Góc khuất khung hình</h1>
          <span>Lab An Toàn Số</span>
        </div>
        <p class="m3-notice" id="m3-game-storage-warning" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn vẫn có thể chơi trong phiên này nhưng không thể tiếp tục sau khi tải lại.</p>
        <div class="m3-phone" id="m3-shell">
          <nav id="m3-appnav" class="m3-appnav" aria-label="Hội thoại và ứng dụng mô phỏng" hidden>
            <div class="m3-nav-heading">
              <label for="m3-inbox-label">Ứng dụng mạng xã hội</label>
            </div>
            <button type="button" class="m3-nav-button" data-m3="nav" data-target="chat-scammer"><span class="m3-avatar" style="background:#e85959;color:#fff" aria-hidden="true">!</span><span class="m3-nav-copy"><strong>user_849201</strong><small>Tin nhắn lạ · Đe dọa</small></span></button>
            <button type="button" class="m3-nav-button" data-m3="nav" data-target="chat-khanh"><span class="m3-avatar" style="background:#57937d;color:#fff" aria-hidden="true">K</span><span class="m3-nav-copy"><strong>Khánh</strong><small>Bạn thân · Ghép slide</small></span></button>
            <button type="button" class="m3-nav-button" data-m3="nav" data-target="profile"><span class="m3-avatar" style="background:#4a779d;color:#fff" aria-hidden="true">B</span><span class="m3-nav-copy"><strong>Trang cá nhân</strong><small>Story, danh sách bạn</small></span></button>
            <button type="button" class="m3-nav-button" data-m3="nav" data-target="contacts"><span class="m3-avatar" style="background:#798086;color:#fff" aria-hidden="true">☏</span><span class="m3-nav-copy"><strong>Danh bạ</strong><small>Số khẩn cấp & bạn thân</small></span></button>
            <button type="button" class="m3-nav-button" data-m3="nav" data-target="wallet"><span class="m3-avatar" style="background:#d49b3d;color:#fff" aria-hidden="true">₫</span><span class="m3-nav-copy"><strong>Ví điện tử</strong><small>1.500.000đ sinh hoạt</small></span></button>
          </nav>
          <div class="m3-panel">
            <div class="m3-statusbar"><span>21:15</span></div>
            <header id="m3-topbar" class="m3-topbar"></header>
            <div id="m3-main" class="m3-main" tabindex="-1"></div>
          </div>
        </div>
        <p class="m3-small m3-game-note">Bạn có thể dành bao lâu tùy ý để suy nghĩ. Nội dung và giao dịch đều là mô phỏng.</p>
      </section>
      <dialog class="m3-dialog" id="m3-dialog" aria-labelledby="m3-dialog-title"><div class="m3-dialog-content"><button class="m3-dialog-close" type="button" data-m3="close-dialog" aria-label="Đóng">×</button><div id="m3-dialog-body"></div></div></dialog>
    </div>`
};
