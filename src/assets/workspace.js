// Chỉ kiểm tra trạng thái; không lưu nội dung cuộc trò chuyện.
(() => {
  const empty = document.querySelector('#workspace-empty');
  const selection = document.querySelector('#workspace-selection');
  const unavailable = document.querySelector('#workspace-unavailable');
  try {
    const firstActive = localStorage.getItem('lab-an-toan-so:exercise:cong-an-gia') === 'active';
    let secondActive = false;
    try {
      const saved = JSON.parse(localStorage.getItem('lab-an-toan-so:exercise:level2'));
      secondActive = saved !== null && typeof saved === 'object' && saved.status === 'active';
    } catch {
      // Tiến độ màn 2 không hợp lệ không ảnh hưởng đến màn 1.
    }
    if (firstActive && secondActive) {
      empty.hidden = true;
      selection.hidden = false;
    } else if (firstActive) {
      window.location.replace('exercise.html');
    } else if (secondActive) {
      window.location.replace('level2.html');
    }
  } catch {
    empty.hidden = true;
    unavailable.hidden = false;
  }
})();
