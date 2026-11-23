const openingMessage = `Bạn bị nghi ngờ dính vào đường dây rửa tiền xuyên biên giới, vui lòng thực hiện theo các yêu cầu sau đây:`;

// Nội dung tình huống được tách khỏi phần điều khiển ở assets/exercise.js.
export default {
  title: 'Công An Giả',
  description: 'Thực hành nhận diện một tình huống giả danh công an trên ứng dụng nhắn tin.',
  scripts: ['exercise.js'],
  styles: ['story-player.css', 'exercise.css'],
  content: `
    <div class="exercise-page wrap" id="exercise-app">
      <a class="exercise-back" href="practice.html">‹ <span>Quay lại Thực hành</span></a>
      <section id="exercise-intro" class="exercise-intro" aria-labelledby="exercise-title">
        <div class="exercise-intro-copy">
          <p class="eyebrow">BÀI THỰC HÀNH · CHAT/CALL APP</p>
          <h1 id="exercise-title">Công An Giả</h1>
          <p class="exercise-summary">Một người lạ tự xưng là công an liên hệ với bạn qua ứng dụng nhắn tin. Bạn sẽ xử lý tình huống này như thế nào?</p>
          <div class="exercise-safety"><span aria-hidden="true">✳</span><p><strong>Đây là tình huống mô phỏng.</strong> Đừng nhập thông tin cá nhân thật hoặc gửi ảnh giấy tờ thật vào bài tập.</p></div>
          <button class="button button-primary exercise-start" id="start-exercise" type="button">Bắt đầu làm</button>
          <p id="storage-notice" class="storage-notice" role="status" hidden>Trình duyệt không cho phép lưu tiến độ. Bạn có thể làm bài, nhưng sẽ không thể tiếp tục sau khi tải lại trang.</p>
        </div>
        <div class="intro-illustration" aria-hidden="true"><div class="intro-phone"><div class="intro-phone-top"></div><div class="intro-line long"></div><div class="intro-line"></div><div class="intro-bubble">?</div><div class="intro-line short"></div></div><span class="intro-shield">✓</span></div>
      </section>
      <section id="exercise-completed" class="exercise-completed" aria-labelledby="completed-heading" hidden>
        <span class="completed-icon" aria-hidden="true">✓</span><p class="eyebrow">BÀI THỰC HÀNH ĐÃ HOÀN THÀNH</p><h1 id="completed-heading">Bạn đã hoàn thành bài này.</h1><p>Bạn có thể thử lại tình huống hoặc tiếp tục khám phá các bài thực hành khác.</p><div class="exercise-actions"><button type="button" class="button button-primary retry-exercise">Làm lại bài</button><a class="button button-secondary" href="practice.html">Về trang Thực hành</a></div>
      </section>
      <section id="chat-view" class="chat-view sp-shell" data-view="chat" aria-label="Ứng dụng tin nhắn mô phỏng" hidden>
        <aside class="sp-inbox">
          <div class="sp-inbox-heading">
            <div><h1>Tin nhắn</h1><p>Công An Giả</p></div>
            <a href="practice.html" aria-label="Thoát, về Thực hành">Thoát</a>
          </div>
          <div class="sp-rows">
            <button type="button" class="sp-row active" aria-current="true">
              <span class="sp-avatar" style="--avatar:#dbece6;background:#dbece6;color:#264d42" aria-hidden="true">👮</span>
              <span class="sp-row-copy">
                <strong>Người tự xưng là công an</strong>
                <small>Bạn bị nghi ngờ dính vào đường dây...</small>
              </span>
              <span class="sp-row-tail">
                <time>09:15</time>
              </span>
            </button>
          </div>
        </aside>
        <section class="sp-conversation" aria-label="Cuộc trò chuyện với Người tự xưng là công an">
          <header class="sp-header">
            <button type="button" class="sp-back" aria-label="Về danh sách tin nhắn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <span class="sp-avatar" style="--avatar:#dbece6;background:#dbece6;color:#264d42" aria-hidden="true">👮</span>
            <div class="sp-header-copy">
              <strong>Người tự xưng là công an</strong>
              <small>Nhân vật mô phỏng</small>
            </div>
            <button type="button" class="block-button" id="block-person">Chặn</button>
            <a class="sp-exit" href="practice.html">Thoát</a>
          </header>
          <div class="sp-history chat-transcript" id="chat-transcript" role="log" tabindex="0" aria-label="Tin nhắn trong cuộc trò chuyện mô phỏng">
            <div class="sp-time-label">Tình huống bắt đầu · 09:15</div>
            <div class="sp-message theirs chat-message incoming">
              <span class="sp-sender message-sender">Người tự xưng là công an</span>
              <div class="sp-bubble chat-bubble">
                <p>${openingMessage}</p>
                <ul>
                  <li>Không được nói cho bất kỳ ai để bảo đảm tính bảo mật của cuộc điều tra.</li>
                  <li>Gửi căn cước công dân qua cuộc gọi này.</li>
                  <li>Tìm một nơi chỉ có 1 mình và thực hiện gọi video cho chúng tôi để xác minh làm rõ vụ việc.</li>
                </ul>
              </div>
              <span class="sp-message-time">09:15</span>
            </div>
          </div>
          <div id="chat-completed" class="chat-completed" role="status" hidden>
            <strong>Cuộc trò chuyện đã kết thúc.</strong> Bạn đã chặn nhân vật trong tình huống này.
            <div class="exercise-actions">
              <button type="button" class="button button-primary retry-exercise">Làm lại bài</button>
              <a href="practice.html" class="button button-secondary">Về trang Thực hành</a>
            </div>
          </div>
          <div class="sp-action-tray">
            <form class="chat-compose" id="chat-compose" novalidate>
              <label class="upload-button" for="chat-image" title="Chọn ảnh"><span aria-hidden="true">▧</span><span class="visually-hidden">Chọn ảnh mô phỏng</span></label>
              <input id="chat-image" type="file" accept="image/*" class="visually-hidden">
              <label class="visually-hidden" for="chat-input">Nhập tin nhắn mô phỏng</label>
              <input id="chat-input" type="text" maxlength="2000" placeholder="Nhập tin nhắn..." autocomplete="off">
              <button type="submit" class="send-button">Gửi</button>
            </form>
          </div>
          <div class="attachment-line" id="attachment-line" hidden><span id="attachment-name"></span><button type="button" id="remove-attachment">Bỏ ảnh</button><span>Ảnh chưa được gửi.</span></div>
          <p class="chat-feedback" id="chat-feedback" role="status" aria-live="polite"></p>
        </section>
      </section>
      <dialog id="exercise-dialog" class="sp-dialog exercise-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description dialog-extra">
        <div class="sp-modal-content dialog-content">
          <button class="sp-close dialog-close" id="dialog-close" type="button" aria-label="Đóng thông báo">×</button>
          <span class="dialog-icon" id="dialog-icon" aria-hidden="true">!</span>
          <h2 id="dialog-title"></h2>
          <p id="dialog-description"></p>
          <div id="dialog-extra"></div>
          <div class="dialog-actions" id="dialog-actions"></div>
        </div>
      </dialog>
    </div>`
};
