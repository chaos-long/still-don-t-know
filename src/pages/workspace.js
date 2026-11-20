export default {
  title: 'Workspace',
  description: 'Quay lại bài thực hành đang làm.',
  scripts: ['workspace.js'],
  content: `
    <section class="workspace-empty wrap" aria-labelledby="workspace-heading">
      <div class="workspace-icon" aria-hidden="true">▧</div>
      <p class="eyebrow">WORKSPACE</p>
      <h1 id="workspace-heading">Bạn chưa bắt đầu bài tập nào</h1>
      <p>Khi bạn bắt đầu một bài thực hành và chưa hoàn thành, bạn có thể quay lại từ đây trên cùng trình duyệt.</p>
      <a class="button button-primary" href="practice.html">Quay lại danh sách bài tập</a>
    </section>
  `,
};
