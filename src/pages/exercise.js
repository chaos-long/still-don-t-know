const openingMessage = `Bạn bị nghi ngờ dính vào đường dây rửa tiền xuyên biên giới, vui lòng thực hiện theo các yêu cầu sau đây:`;

// Nội dung tình huống được tách khỏi phần điều khiển ở assets/exercise.js.
export default {
  title: 'Công An Giả',
  description: 'Thực hành nhận diện một tình huống giả danh công an trên ứng dụng nhắn tin.',
  scripts: ['exercise.js'],
  styles: ['exercise.css'],
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
      <section id="chat-view" class="chat-view" aria-labelledby="chat-title" hidden>
        <div class="chat-heading"><div><p class="eyebrow">BÀI THỰC HÀNH · CHAT/CALL APP</p><h1 id="chat-title">Công An Giả</h1></div><span class="simulation-badge"><span aria-hidden="true">●</span> Cuộc trò chuyện mô phỏng</span></div>
        <p class="chat-safety"><strong>Chú ý:</strong> Không nhập thông tin cá nhân thật hoặc gửi ảnh giấy tờ thật.</p>
        <div class="chat-shell">
          <header class="chat-header">
            <div class="chat-person"><div class="chat-avatar" aria-hidden="true"><svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="#dbece6"/><path d="M10 64c1-13 9-19 22-19s21 6 22 19" fill="#3f7769"/><path d="M25 44h14v9H25z" fill="#dfa985"/><ellipse cx="32" cy="30" rx="15" ry="17" fill="#efc3a0"/><path d="M17 28c0-11 6-18 15-18s15 7 15 18c-4-2-7-4-8-8-5 4-12 6-22 8" fill="#263d3a"/><path d="M14 22c1-9 8-15 18-15s17 6 18 15l-4 4H18z" fill="#30695e"/><path d="M18 22h28v5H18z" fill="#244d45"/><circle cx="32" cy="17" r="3" fill="#f4ce77"/><path d="M25 35c2 2 4 3 7 3s5-1 7-3" stroke="#9d6c58" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="26" cy="30" r="1.3" fill="#273e39"/><circle cx="38" cy="30" r="1.3" fill="#273e39"/></svg></div><div><h2>Người tự xưng là công an</h2><p>Nhân vật mô phỏng</p></div></div>
            <button type="button" class="block-button" id="block-person">Chặn</button>
          </header>
          <div class="chat-transcript" id="chat-transcript" role="log" aria-label="Tin nhắn trong cuộc trò chuyện mô phỏng" aria-live="polite" aria-relevant="additions text">
            <p class="chat-day">Tình huống bắt đầu</p>
            <div class="chat-message incoming"><span class="message-sender">Người tự xưng là công an</span><div class="chat-bubble"><p>${openingMessage}</p><ul><li>Không được nói cho bất kỳ ai để bảo đảm tính bảo mật của cuộc điều tra.</li><li>Gửi căn cước công dân qua cuộc gọi này.</li><li>Tìm một nơi chỉ có 1 mình và thực hiện gọi video cho chúng tôi để xác minh làm rõ vụ việc.</li></ul></div></div>
          </div>
          <div id="chat-completed" class="chat-completed" role="status" hidden><strong>Cuộc trò chuyện đã kết thúc.</strong> Bạn đã chặn nhân vật trong tình huống này.<div class="exercise-actions"><button type="button" class="button button-primary retry-exercise">Làm lại bài</button><a href="practice.html" class="button button-secondary">Về trang Thực hành</a></div></div>
          <form class="chat-compose" id="chat-compose" novalidate>
            <label class="upload-button" for="chat-image" title="Chọn ảnh"><span aria-hidden="true">▧</span><span class="visually-hidden">Chọn ảnh mô phỏng</span></label><input id="chat-image" type="file" accept="image/*" class="visually-hidden">
            <label class="visually-hidden" for="chat-input">Nhập tin nhắn mô phỏng</label><input id="chat-input" type="text" maxlength="2000" placeholder="Nhập tin nhắn..." autocomplete="off">
            <button type="submit" class="send-button">Gửi</button>
          </form>
          <div class="attachment-line" id="attachment-line" hidden><span id="attachment-name"></span><button type="button" id="remove-attachment">Bỏ ảnh</button><span>Ảnh chưa được gửi.</span></div>
          <p class="chat-feedback" id="chat-feedback" role="status" aria-live="polite"></p>
        </div>
        <p class="chat-privacy">Tin nhắn và ảnh chỉ được dùng trong mô phỏng trên trình duyệt; nội dung không được gửi đi hoặc lưu lại sau khi rời trang.</p>
      </section>
      <dialog id="exercise-dialog" class="exercise-dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description dialog-extra">
        <div class="dialog-content"><button class="dialog-close" id="dialog-close" type="button" aria-label="Đóng thông báo">×</button><span class="dialog-icon" id="dialog-icon" aria-hidden="true">!</span><h2 id="dialog-title"></h2><p id="dialog-description"></p><div id="dialog-extra"></div><div class="dialog-actions" id="dialog-actions"></div></div>
      </dialog>
    </div>`
};
