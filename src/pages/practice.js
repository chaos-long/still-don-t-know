// Nội dung được tách thành dữ liệu để bổ sung bài thực hành về sau.
const exercises = [
  {
    icon: '✉',
    category: 'Chat/Call App',
    title: 'Công An Giả',
    description: 'Nhận diện và xử lý tình huống người lạ giả danh công an qua ứng dụng nhắn tin.',
    href: 'exercise.html',
  },
  {
    icon: '✉',
    category: 'Chat/Call App',
    title: 'Nhận diện tin nhắn lừa đảo',
    description: 'Tập nhận ra những dấu hiệu đáng ngờ trong một tin nhắn trước khi trả lời hay làm theo.',
  },
  {
    icon: '⌕',
    category: 'Fake website',
    title: 'Kiểm tra đường link đáng ngờ',
    description: 'Quan sát địa chỉ đường link và tìm hiểu những điều cần kiểm tra trước khi nhấp vào.',
  },
  {
    icon: '⌘',
    category: 'Others',
    title: 'Bảo vệ mật khẩu và tài khoản',
    description: 'Làm quen với những cách đơn giản để giữ mật khẩu và tài khoản của bạn an toàn hơn.',
  },
];

const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export default {
  title: 'Thực hành',
  description: 'Làm quen với an toàn số qua những tình huống gần gũi.',
  scripts: ['practice.js'],
  styles: ['practice.css'],
  content: `
    <section class="page-intro practice-intro" aria-labelledby="practice-heading">
      <p class="eyebrow">GÓC THỰC HÀNH</p>
      <h1 class="page-heading" id="practice-heading">Học qua những tình huống thật gần</h1>
      <p class="page-lead">Chọn một bài thực hành và tìm cách xử lý những tình huống bạn có thể gặp trên mạng.</p>
    </section>
    <section class="practice-section" aria-labelledby="exercises-heading">
      <div class="practice-toolbar" aria-label="Tìm và lọc bài thực hành">
        <div class="practice-field practice-search-field">
          <label for="exercise-search">Tìm bài thực hành</label>
          <div class="search-control"><span aria-hidden="true">⌕</span><input id="exercise-search" type="search" placeholder="Tìm theo tên hoặc mô tả" autocomplete="off"></div>
        </div>
        <div class="practice-field practice-category-field">
          <label for="exercise-category">Category</label>
          <select id="exercise-category">
            <option value="all">Tất cả</option>
            <option value="Chat/Call App">Chat/Call App</option>
            <option value="Fake website">Fake website</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <a class="workspace-link" href="workspace.html"><span aria-hidden="true">▣</span> Workspace</a>
      </div>
      <div class="practice-list-heading"><div><p class="eyebrow">KHÁM PHÁ CÁC TÌNH HUỐNG</p><h2 id="exercises-heading">Bài thực hành</h2></div><p>Chọn một chủ đề để bắt đầu.</p></div>
      <p id="exercise-results" class="results-message" role="status" aria-live="polite"></p>
      <div class="cards-grid practice-cards" id="exercise-list">
        ${exercises.map((exercise) => `
          <article class="content-card practice-card" data-category="${escapeHtml(exercise.category)}">
            <div class="practice-card-top"><div class="card-icon" aria-hidden="true">${escapeHtml(exercise.icon)}</div><span class="practice-badge${exercise.href ? ' is-available' : ''}">${exercise.href ? 'Có thể thực hành' : 'Bài mẫu'}</span></div>
            <p class="card-tag">${escapeHtml(exercise.category)}</p>
            <h3 class="card-title">${escapeHtml(exercise.title)}</h3>
            <p class="card-description">${escapeHtml(exercise.description)}</p>
            ${exercise.href ? `<a class="practice-card-link" href="${escapeHtml(exercise.href)}">Xem bài thực hành</a>` : '<p class="practice-card-note">Nội dung sẽ được bổ sung sau</p>'}
          </article>
        `).join('')}
      </div>
      <p class="practice-footnote">Các thẻ ghi “Bài mẫu” chỉ mang tính minh họa và sẽ được phát triển sau.</p>
    </section>
  `,
};
