export default {
  title: 'Tao đây, Minh đây',
  description: 'Thực hành đối chiếu một lời nhờ chuyển tiền từ tài khoản bạn bè.',
  scripts: ['level2-data.js', 'level2.js'],
  styles: ['story-player.css', 'level2.css'],
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
      <section class="m2-game sp-shell" id="m2-game" aria-label="Điện thoại mô phỏng" hidden>
        <div class="m2-inbox-bar" id="m2-inbox-bar" hidden>
          <a href="practice.html">‹ Thực hành</a>
          <h1>Tao đây, Minh đây</h1>
          <span>Lab An Toàn Số</span>
        </div>
        <p class="m2-notice" id="m2-game-storage-warning" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn vẫn có thể chơi trong phiên này nhưng không thể tiếp tục sau khi tải lại.</p>
        <div class="m2-phone" id="m2-shell">
          <nav id="m2-appnav" class="m2-appnav sp-inbox" aria-label="Hội thoại và ứng dụng mô phỏng" hidden>
            <div class="m2-nav-heading sp-inbox-heading">
              <div>
                <h1>Tin nhắn</h1>
                <p>Tao đây, Minh đây</p>
              </div>
              <a href="practice.html" aria-label="Thoát, về Thực hành">Thoát</a>
            </div>
            <div style="padding:0 12px 10px">
              <label class="visually-hidden" for="m2-inbox-search">Tìm trong hộp thư</label>
              <input id="m2-inbox-search" class="m2-input" type="search" placeholder="Tìm trong hộp thư" autocomplete="off">
            </div>
            <button type="button" class="m2-nav-button sp-row" data-m2="nav" data-target="chat"><span class="m2-avatar sp-avatar" aria-hidden="true">🐧</span><span class="m2-nav-copy sp-row-copy"><strong>Minh</strong><small>Tin nhắn riêng</small></span></button>
            <button type="button" class="m2-nav-button sp-row" data-m2="nav" data-target="group"><span class="m2-avatar m2-avatar-group sp-avatar" aria-hidden="true">11</span><span class="m2-nav-copy sp-row-copy"><strong>Nhóm<span class="m2-desktop-label"> Văn nghệ</span></strong><small>Văn nghệ 11A2</small></span></button>
            <button type="button" class="m2-nav-button sp-row" data-m2="nav" data-target="contacts"><span class="m2-avatar m2-avatar-contacts sp-avatar" aria-hidden="true">☏</span><span class="m2-nav-copy sp-row-copy"><strong>Danh bạ</strong><small>Số liên hệ đã lưu</small></span></button>
            <button type="button" class="m2-nav-button sp-row" data-m2="nav" data-target="wallet"><span class="m2-avatar m2-avatar-wallet sp-avatar" aria-hidden="true">₫</span><span class="m2-nav-copy sp-row-copy"><strong>Ví lớp</strong><small>Quỹ tổng duyệt</small></span></button>
            <p id="m2-inbox-empty" class="m2-small" role="status" hidden>Không tìm thấy mục phù hợp.</p>
          </nav>
          <div class="m2-panel sp-conversation">
            <header id="m2-topbar" class="m2-topbar sp-header"></header>
            <div id="m2-main" class="m2-main sp-history" tabindex="-1"></div>
          </div>
        </div>
      </section>
      <dialog class="m2-dialog sp-dialog" id="m2-dialog" aria-labelledby="m2-dialog-title"><div class="m2-dialog-content sp-modal-content"><button class="m2-dialog-close sp-close" type="button" data-m2="close-dialog" aria-label="Đóng">×</button><div id="m2-dialog-body"></div></div></dialog>
    </div>`
};
