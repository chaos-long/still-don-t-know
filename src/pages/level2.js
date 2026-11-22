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
        <div class="m2-phone">
          <div class="m2-statusbar"><span>15:42</span><span>● ● ▰</span></div>
          <div id="m2-topbar" class="m2-topbar"></div>
          <div id="m2-main" class="m2-main" tabindex="-1"></div>
          <nav id="m2-appnav" class="m2-appnav" aria-label="Ứng dụng trên điện thoại mô phỏng" hidden>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="chat"><span aria-hidden="true">◉</span>Chat</button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="group"><span aria-hidden="true">♧</span>Nhóm</button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="contacts"><span aria-hidden="true">☏</span>Danh bạ</button>
            <button type="button" class="m2-nav-button" data-m2="nav" data-target="wallet"><span aria-hidden="true">▣</span>Ví lớp</button>
          </nav>
        </div>
        <p class="m2-small m2-game-note">Bạn có thể dành bao lâu tùy ý để suy nghĩ. Nội dung và giao dịch đều là mô phỏng.</p>
      </section>
      <dialog class="m2-dialog" id="m2-dialog" aria-labelledby="m2-dialog-title"><div class="m2-dialog-content"><button class="m2-dialog-close" type="button" data-m2="close-dialog" aria-label="Đóng">×</button><div id="m2-dialog-body"></div></div></dialog>
    </div>`
};
