export default {
  title: 'Tạo màn chơi',
  description: 'Tự viết tình huống, chơi thử và chia sẻ màn thực hành qua chat.',
  scripts: ['story-player.js', 'creator-project.js', 'creator-view.js', 'creator.js'],
  styles: ['story-player.css', 'creator.css'],
  content: `
    <div id="creator-app">
      <section id="creator-library" class="cr-library" aria-labelledby="creator-library-title">
        <a href="practice.html" class="cr-return">← Thực hành</a>
        <div class="cr-library-heading">
          <div><h1 id="creator-library-title">Màn của tôi</h1><p>Soạn tình huống qua chat để học sinh có thể chơi và tự chọn cách xử lý.</p></div>
          <div class="cr-tools"><button type="button" data-action="new-draft" class="cr-primary" disabled>Tạo màn mới</button>
            <button type="button" data-action="import" disabled>Nhập màn</button></div>
        </div>
        <div id="creator-drafts"><p class="cr-empty">Đang mở các màn đã lưu…</p></div>
      </section>
      <section id="creator-editor" class="cr-editor" hidden aria-label="Soạn màn chơi">
        <div class="cr-editor-heading">
          <button type="button" data-action="library" class="cr-quiet">← Màn của tôi</button>
          <label class="cr-title"><span>Tên màn chơi</span><input data-edit="draft" data-field="title" maxlength="160"></label>
          <span id="creator-save" class="cr-save" role="status"></span>
          <div class="cr-tools">
            <button type="button" data-action="people">Nhân vật</button>
            <button type="button" data-action="chats">Cuộc trò chuyện</button>
            <button type="button" data-action="export">Xuất màn</button>
            <button type="button" data-action="test" class="cr-primary">Chơi thử từ đầu</button>
          </div>
        </div>
        <div id="creator-issues"></div>
        <div class="cr-tabs" role="tablist" aria-label="Vùng soạn màn">
          <button type="button" role="tab" id="cr-tab-outline" aria-controls="cr-outline" aria-selected="false" tabindex="-1" data-action="tab" data-id="outline">Dàn cảnh</button>
          <button type="button" role="tab" id="cr-tab-compose" aria-controls="cr-compose" aria-selected="true" data-action="tab" data-id="compose">Soạn cảnh</button>
          <button type="button" role="tab" id="cr-tab-preview" aria-controls="cr-preview" aria-selected="false" tabindex="-1" data-action="tab" data-id="preview">Xem thử</button>
        </div>
        <div class="cr-grid" data-tab="compose">
          <aside id="cr-outline" class="cr-panel cr-outline" aria-label="Dàn cảnh"></aside>
          <section id="cr-compose" class="cr-panel cr-compose" aria-label="Soạn cảnh"></section>
          <aside id="cr-preview" class="cr-panel cr-preview" aria-label="Xem thử">
            <div class="cr-panel-heading"><h2>Xem thử</h2><button type="button" data-action="test-scene">Phát thử cảnh</button></div>
            <div id="creator-preview"></div>
          </aside>
        </div>
      </section>
      <p id="creator-notice" role="status" hidden></p>
      <input id="creator-import" type="file" accept=".json,application/json" hidden>
      <dialog id="creator-manager" class="cr-manager" aria-labelledby="creator-manager-title">
        <div class="cr-manager-heading"><h2 id="creator-manager-title"></h2><button type="button" data-action="close-manager" aria-label="Đóng">Đóng</button></div>
        <div id="creator-manager-body"></div>
        <p id="creator-manager-notice" role="status" hidden></p>
      </dialog>
    </div>
    <div id="creator-player" hidden aria-label="Trình phát màn chơi"></div>
  `,
};
