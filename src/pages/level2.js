export default {
  title: 'Tao đây, Minh đây',
  description: 'Thực hành đối chiếu một lời nhờ chuyển tiền từ tài khoản bạn bè.',
  scripts: ['level2.js'],
  styles: ['level2.css'],
  content: `
    <div class="m2-page wrap" id="level2-app">
      <a class="m2-back" href="practice.html">‹ Quay lại Thực hành</a>
      <section class="m2-intro" id="m2-intro" aria-labelledby="m2-title">
        <p class="m2-eyebrow">MÀN 2 · CHAT/CALL APP · 5–8 PHÚT</p>
        <h1 id="m2-title">Tao đây, Minh đây</h1>
        <p class="m2-lead">Thu xếp phần âm thanh để lớp kịp tổng duyệt lúc 16:00. Bạn đang giữ 500.000đ quỹ lớp.</p>
        <div class="m2-notice"><strong>Đây là một tình huống mô phỏng.</strong> Các tài khoản, số tiền và giao dịch trong bài đều là giả lập.</div>
        <button type="button" class="m2-primary" data-m2="start">Bắt đầu làm</button>
        <p class="m2-small" id="m2-storage-warning" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn vẫn có thể chơi trong phiên này.</p>
      </section>
      <section class="m2-game" id="m2-game" aria-label="Điện thoại mô phỏng" hidden>
        <p class="m2-notice" id="m2-game-storage-warning" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn vẫn có thể chơi trong phiên này nhưng không thể tiếp tục sau khi tải lại.</p>
        <div class="m2-phone" id="m2-shell">
          <nav id="m2-appnav" class="m2-appnav" aria-label="Hội thoại và ứng dụng mô phỏng" hidden>
            <p class="m2-nav-heading">Hộp thư lớp 11A2</p>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="chat"><span class="m2-avatar" aria-hidden="true">🐧</span><span><strong>Minh</strong><small>Tin nhắn riêng</small></span></button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="group"><span class="m2-avatar m2-avatar-group" aria-hidden="true">11</span><span><strong>Nhóm<span class="m2-desktop-label"> Văn nghệ</span></strong><small>Văn nghệ 11A2</small></span></button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="contacts"><span class="m2-avatar m2-avatar-contacts" aria-hidden="true">☏</span><span><strong>Danh bạ</strong><small>Số liên hệ đã lưu</small></span></button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="wallet"><span class="m2-avatar m2-avatar-wallet" aria-hidden="true">₫</span><span><strong>Ví lớp</strong><small>Quỹ tổng duyệt</small></span></button>
          </nav>
          <div class="m2-panel">
            <div class="m2-statusbar"><span>15:42</span></div>
            <header id="m2-topbar" class="m2-topbar"></header>
            <div id="m2-main" class="m2-main" tabindex="-1"></div>
          </div>
        </div>
        <p class="m2-small m2-game-note">Bạn có thể dành bao lâu tùy ý để suy nghĩ. Nội dung và giao dịch đều là mô phỏng.</p>
      </section>
      <dialog class="m2-dialog" id="m2-dialog" aria-labelledby="m2-dialog-title"><div class="m2-dialog-content"><button class="m2-dialog-close" type="button" data-m2="close-dialog" aria-label="Đóng">×</button><div id="m2-dialog-body"></div></div></dialog>
    </div>`
};
