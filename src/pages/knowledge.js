const topics = [
  {
    icon: '!',
    label: 'NHẬN BIẾT',
    title: 'Nhận diện lừa đảo trực tuyến',
    description: 'Tìm hiểu những dấu hiệu thường gặp để bình tĩnh nhận diện lời mời hay yêu cầu đáng ngờ.',
  },
  {
    icon: '✳',
    label: 'TÀI KHOẢN',
    title: 'Mật khẩu và xác thực hai lớp',
    description: 'Hiểu cách tạo mật khẩu khó đoán và thêm một bước bảo vệ khi đăng nhập.',
  },
  {
    icon: '◎',
    label: 'QUYỀN RIÊNG TƯ',
    title: 'Bảo vệ thông tin cá nhân',
    description: 'Biết thông tin nào cần cân nhắc trước khi chia sẻ và cách giữ quyền riêng tư của mình.',
  },
];

export default {
  title: 'Kiến thức',
  description: 'Những điều cần biết để tự tin hơn khi sử dụng Internet.',
  content: `
    <section class="page-intro" aria-labelledby="knowledge-heading">
      <p class="eyebrow">GÓC KIẾN THỨC</p>
      <h1 class="page-heading" id="knowledge-heading">Hiểu thêm để an toàn hơn</h1>
      <p class="page-lead">Bắt đầu với những kiến thức gần gũi giúp bạn nhận biết rủi ro và bảo vệ bản thân trên không gian mạng.</p>
    </section>
    <section aria-label="Các chủ đề kiến thức mẫu">
      <div class="cards-grid">
        ${topics.map((topic) => `
          <article class="content-card">
            <div class="card-icon" aria-hidden="true">${topic.icon}</div>
            <p class="card-tag">${topic.label} · Chủ đề mẫu</p>
            <h2 class="card-title">${topic.title}</h2>
            <p class="card-description">${topic.description}</p>
          </article>
        `).join('')}
      </div>
      <p class="page-note">Đây là các chủ đề minh họa. Nội dung chi tiết sẽ được bổ sung sau.</p>
    </section>
  `,
};
