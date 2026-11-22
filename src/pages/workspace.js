export default {
  title: 'Workspace',
  description: 'Quay lại bài thực hành đang làm.',
  scripts: ['workspace.js'],
  content: `
    <section id="workspace-empty" class="workspace-empty wrap" aria-labelledby="workspace-heading">
      <div class="workspace-icon" aria-hidden="true">▧</div>
      <p class="eyebrow">WORKSPACE</p>
      <h1 id="workspace-heading">Bạn chưa bắt đầu bài tập nào</h1>
      <p>Khi bạn bắt đầu một bài thực hành và chưa hoàn thành, bạn có thể quay lại từ đây trên cùng trình duyệt.</p>
      <a class="button button-primary" href="practice.html">Quay lại danh sách bài tập</a>
    </section>
    <section id="workspace-selection" class="workspace-empty wrap" aria-labelledby="workspace-selection-heading" hidden>
      <div class="workspace-icon" aria-hidden="true">▧</div>
      <p class="eyebrow">WORKSPACE</p>
      <h1 id="workspace-selection-heading">Bài tập đang làm</h1>
      <p>Chọn bài bạn muốn tiếp tục trên trình duyệt này.</p>
      <div class="explore-grid">
        <article class="explore-card"><div><h2>Công An Giả</h2><p>Tiếp tục tình huống giả danh công an.</p><a class="text-link" href="exercise.html">Tiếp tục Công An Giả</a></div></article>
        <article class="explore-card"><div><h2>Tao đây, Minh đây</h2><p>Tiếp tục thu xếp phần âm thanh của lớp.</p><a class="text-link" href="level2.html">Tiếp tục Tao đây, Minh đây</a></div></article>
      </div>
      <p><a href="practice.html">Quay lại danh sách bài tập</a></p>
    </section>
    <section id="workspace-unavailable" class="workspace-empty wrap" aria-labelledby="workspace-unavailable-heading" hidden>
      <div class="workspace-icon" aria-hidden="true">▧</div>
      <p class="eyebrow">WORKSPACE</p>
      <h1 id="workspace-unavailable-heading">Không thể xem tiến độ</h1>
      <p>Trình duyệt không cho phép truy cập dữ liệu đã lưu. Hãy kiểm tra cài đặt lưu trữ hoặc chọn bài từ danh sách.</p>
      <a class="button button-primary" href="practice.html">Quay lại danh sách bài tập</a>
    </section>
  `,
};
