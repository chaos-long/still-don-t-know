const exercises = [
  {
    icon: '✉',
    label: 'Tin nhắn',
    title: 'Nhận diện tin nhắn lừa đảo',
    description: 'Tập nhận ra những dấu hiệu đáng ngờ trong một tin nhắn trước khi trả lời hay làm theo.',
  },
  {
    icon: '↗',
    label: 'Đường link',
    title: 'Kiểm tra đường link đáng ngờ',
    description: 'Quan sát địa chỉ đường link và tìm hiểu những điều cần kiểm tra trước khi nhấp vào.',
  },
  {
    icon: '⌘',
    label: 'Tài khoản',
    title: 'Bảo vệ mật khẩu và tài khoản',
    description: 'Làm quen với những cách đơn giản để giữ mật khẩu và tài khoản của bạn an toàn hơn.',
  },
];

export default {
  title: 'Thực hành',
  description: 'Làm quen với an toàn số qua những tình huống gần gũi.',
  content: `
    <section class="page-intro" aria-labelledby="practice-heading">
      <p class="eyebrow">GÓC THỰC HÀNH</p>
      <h1 class="page-heading" id="practice-heading">Học qua những tình huống thật gần</h1>
      <p class="page-lead">Mỗi bài thực hành là một cơ hội để quan sát, suy nghĩ và thử tìm cách xử lý an toàn trên mạng.</p>
    </section>
    <section aria-label="Các bài thực hành mẫu">
      <div class="cards-grid">
        ${exercises.map((exercise) => `
          <article class="content-card">
            <div class="card-icon" aria-hidden="true">${exercise.icon}</div>
            <p class="card-tag">${exercise.label} · Bài mẫu</p>
            <h2 class="card-title">${exercise.title}</h2>
            <p class="card-description">${exercise.description}</p>
          </article>
        `).join('')}
      </div>
      <p class="page-note">Các bài trên đang là nội dung minh họa. Tình huống và thử thách sẽ được bổ sung sau.</p>
    </section>
  `,
};
