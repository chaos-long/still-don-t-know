// Thay dữ liệu trong tệp này để viết truyện khác; trình phát không chứa tên nhân vật hay lời thoại.
window.storyScenario = {
  id: 'truoc-gio-tong-duyet',
  title: 'Trước giờ tổng duyệt',
  playerId: 'ban',
  startChat: 'minh',
  pace: { message: 900, typing: 450 },
  theme: {
    background: '#f1f0ec', incoming: '#ffffff', outgoing: '#fff0b8',
    text: '#262626', action: '#34383c', accent: '#e9c66e',
  },
  people: {
    ban: { name: 'Bạn', avatar: 'B', color: '#d9e8e2' },
    minh: { name: 'Minh', avatar: 'M', color: '#d7dcef' },
    vy: { name: 'Vy', avatar: 'V', color: '#f0dcd0' },
    hanh: { name: 'Cô Hạnh', avatar: 'H', color: '#e8dfef' },
  },
  chats: {
    minh: { title: 'Minh', avatar: 'M', color: '#d7dcef', members: ['ban', 'minh'], status: 'Đang trực tuyến' },
    lop: { title: 'Văn nghệ 11A2', avatar: '11', color: '#dbe9d1', members: ['ban', 'vy', 'minh', 'hanh'] },
    vy: { title: 'Vy', avatar: 'V', color: '#f0dcd0', members: ['ban', 'vy'], status: 'Vừa hoạt động' },
  },
  sections: [
    { id: 'loi-nho', chat: 'minh', label: 'Hôm nay · 15:42', events: [
      { id: 'm1', type: 'message', sender: 'minh', text: 'Ê, m còn cầm quỹ lớp không?', time: '15:42' },
      { id: 'm2', type: 'message', sender: 'minh', text: 'Chuyển giúp t 200k cọc loa với. Lát gặp t tính lại.', time: '15:42', delay: 1200 },
      { id: 'm3', type: 'message', sender: 'ban', text: 'Vy phụ trách loa mà? Để t hỏi lại nhóm trước nhé.', time: '15:43', delay: 350 },
      { id: 'm4', type: 'message', sender: 'minh', text: 'Nhanh lên, sắp tới giờ rồi. Chuyển vào ví NGUYEN VAN NAM nha.', time: '15:43' },
    ] },
    { id: 'tin-nhom', chat: 'lop', label: 'Hôm nay · 15:44', events: [
      { id: 'g1', type: 'message', sender: 'hanh', text: '16 giờ cô mở hội trường. Nhóm âm thanh mang loa qua cửa bên hông nhé.', time: '15:44' },
      { id: 'g2', type: 'message', sender: 'vy', text: 'Mình đã đặt cọc loa sáng nay. Mình gửi lại biên nhận để cả nhóm xem.', time: '15:44' },
      { id: 'g3', type: 'image', sender: 'vy', src: 'assets/story-receipt.svg', alt: 'Biên nhận mô phỏng cho khoản cọc loa 200.000đ đã thanh toán', time: '15:45' },
      { id: 'g4', type: 'card', sender: 'vy', title: 'Thông tin khoản cọc', description: 'Xem chi tiết biên nhận của nhóm.', image: 'assets/story-receipt.svg', action: { label: 'Mở biên nhận', title: 'Biên nhận đặt cọc loa', body: 'Vy đã đặt cọc 200.000đ lúc 11:26. Khi đến nhận loa, lớp không cần trả khoản cọc lần nữa.' }, required: true, time: '15:45' },
    ] },
    { id: 'hoi-vy', chat: 'vy', label: 'Hôm nay · 15:47', events: [
      { id: 'v1', type: 'message', sender: 'ban', text: 'Vy ơi, khoản cọc loa đã xong rồi đúng không?', time: '15:47' },
      { id: 'v2', type: 'message', sender: 'vy', text: 'Ừ, mình cọc xong từ sáng. Nhóm đã có biên nhận đó.', time: '15:48', delay: 1250 },
      { id: 'v3', type: 'message', sender: 'vy', text: 'Chiều chỉ cần đọc tên lớp để nhận loa thôi.', time: '15:48' },
    ] },
    { id: 'quyet-dinh', chat: 'lop', label: 'Hôm nay · 15:49', events: [
      { id: 'd1', type: 'message', sender: 'hanh', text: 'Các em đã kiểm tra khoản cọc chưa? Báo cô nếu thấy lời nhờ chuyển tiền lạ nhé.', time: '15:49' },
      { id: 'd2', type: 'choice', sender: 'ban', title: 'Bạn sẽ xử lý thế nào?', options: [
        { id: 'bao-nhom', label: 'Báo cô và nhóm, không chuyển thêm tiền', ending: 'safe' },
        { id: 'chuyen-tien', label: 'Vẫn chuyển 200.000đ theo tin nhắn', ending: 'risk' },
      ] },
    ] },
  ],
  endings: {
    safe: { title: 'Bạn đã xử lý phù hợp', body: 'Bạn đối chiếu biên nhận và hỏi người phụ trách trước khi chuyển tiền. Báo cô và nhóm giúp mọi người tránh làm theo tin nhắn đáng ngờ.', action: 'Chơi lại' },
    risk: { title: 'Hãy dừng lại và kiểm tra', body: 'Biên nhận cho thấy tiền cọc đã được trả. Lời nhờ chuyển thêm tiền không khớp với thông tin từ nhóm. Khi gặp trường hợp này, hãy hỏi người phụ trách hoặc thầy cô qua kênh đã biết.', action: 'Thử lại' },
  },
};
