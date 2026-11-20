// Chỉ lưu trạng thái của bài, không lưu nội dung cuộc trò chuyện.
try {
  if (localStorage.getItem('lab-an-toan-so:exercise:cong-an-gia') === 'active') {
    window.location.replace('exercise.html');
  }
} catch {
  // Workspace vẫn hiển thị khi trình duyệt không cho phép lưu dữ liệu.
}
