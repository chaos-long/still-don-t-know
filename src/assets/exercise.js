(() => {
  const app = document.querySelector('#exercise-app');
  if (!app) return;

  const storageKey = 'lab-an-toan-so:exercise:cong-an-gia';
  const warning = 'Công an sẽ không làm việc với công dân bằng các ứng dụng nhắn tin như Zalo, Messenger,... Thay vào đó sẽ liên hệ với các công dân cần thiết bằng văn bản gửi đến địa phương. Do vậy không được gửi thông tin cá nhân cho người lạ đột nhiên nhắn tin nhận là công an.';
  const $ = selector => app.querySelector(selector);
  const intro = $('#exercise-intro');
  const completed = $('#exercise-completed');
  const chat = $('#chat-view');
  const chatEnded = $('#chat-completed');
  const composer = $('#chat-compose');
  const input = $('#chat-input');
  const file = $('#chat-image');
  const attachment = $('#attachment-line');
  const fileName = $('#attachment-name');
  const feedback = $('#chat-feedback');
  const transcript = $('#chat-transcript');
  const block = $('#block-person');
  const dialog = $('#exercise-dialog');
  const dialogClose = $('#dialog-close');
  const dialogIcon = $('#dialog-icon');
  const dialogTitle = $('#dialog-title');
  const dialogDescription = $('#dialog-description');
  const dialogExtra = $('#dialog-extra');
  const dialogActions = $('#dialog-actions');
  const storageNotice = $('#storage-notice');
  let status = 'not-started';
  let storageAvailable = true;
  let focusAfterDialog = null;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'active' || saved === 'completed') status = saved;
  } catch {
    storageAvailable = false;
    storageNotice.hidden = false;
  }

  function saveStatus(next) {
    status = next;
    try { localStorage.setItem(storageKey, next); }
    catch {
      storageAvailable = false;
      storageNotice.hidden = false;
      feedback.textContent = 'Trình duyệt không cho phép lưu tiến độ; bạn có thể tiếp tục trong phiên này.';
    }
  }

  function showState(next, focusInput = false) {
    const showChat = next === 'active';
    intro.hidden = next !== 'not-started';
    completed.hidden = next !== 'completed';
    chat.hidden = !showChat;
    app.classList.toggle('is-active', showChat);
    if (showChat) chat.dataset.view = 'chat';
    if (showChat && !storageAvailable) feedback.textContent = 'Trình duyệt không cho phép lưu tiến độ; bạn có thể tiếp tục trong phiên này.';
    if (showChat && focusInput) input.focus();
  }

  function clearAttachment() {
    file.value = '';
    fileName.textContent = '';
    attachment.hidden = true;
  }

  function startExercise() {
    transcript.querySelectorAll('.outgoing').forEach(message => message.remove());
    composer.reset();
    clearAttachment();
    feedback.textContent = '';
    chatEnded.hidden = true;
    composer.hidden = false;
    block.disabled = false;
    saveStatus('active');
    showState('active', true);
  }

  function addOutgoing(text) {
    const message = document.createElement('div');
    message.className = 'sp-message mine chat-message outgoing';
    const bubble = document.createElement('div');
    bubble.className = 'sp-bubble chat-bubble';
    bubble.textContent = text;
    const time = document.createElement('span');
    time.className = 'sp-message-time';
    time.textContent = 'Đã gửi';
    message.append(bubble, time);
    transcript.append(message);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  function openDialog(kind) {
    const success = kind === 'success';
    dialogIcon.textContent = success ? '✓' : '!';
    dialogIcon.classList.toggle('success', success);
    dialogTitle.textContent = success ? 'Chúc mừng bạn đã hoàn thành thử thách!' : 'Dừng lại và kiểm tra';
    dialogDescription.textContent = success ? 'Bạn đã nhận ra dấu hiệu lừa đảo! Tài khoản này có nhiều điểm đáng ngờ:' : warning;
    dialogExtra.replaceChildren();
    dialogActions.replaceChildren();
    if (success) {
      const signs = [
        'Người lạ tự nhận là công an và nói bạn liên quan đến một vụ án.',
        'Họ yêu cầu bạn giữ bí mật và ở một mình, khiến bạn khó trao đổi với người thân hoặc thầy cô.',
        'Họ yêu cầu ảnh căn cước và gọi video để “xác minh”.',
      ];
      const list = document.createElement('ul');
      list.className = 'dialog-signs';
      for (const sign of signs) {
        const item = document.createElement('li');
        item.textContent = sign;
        list.append(item);
      }
      const explanation = document.createElement('p');
      explanation.className = 'dialog-explanation';
      explanation.textContent = 'Chặn tài khoản giúp bạn ngừng liên lạc và tránh bị gây áp lực hoặc cung cấp thông tin cá nhân.';
      const advice = document.createElement('p');
      advice.className = 'dialog-advice';
      advice.textContent = 'Nếu gặp tình huống tương tự, đừng làm theo yêu cầu của người lạ. Hãy nói với người thân hoặc thầy cô và chủ động liên hệ công an địa phương qua kênh chính thức để xác minh.';
      dialogExtra.append(list, explanation, advice);
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'button button-primary';
      retry.textContent = 'Làm lại bài';
      retry.addEventListener('click', () => { closeDialog(); startExercise(); });
      const back = document.createElement('a');
      back.className = 'button button-secondary';
      back.href = 'practice.html';
      back.textContent = 'Về trang Thực hành';
      dialogActions.append(retry, back);
    } else {
      const note = document.createElement('p');
      note.className = 'dialog-advice';
      note.textContent = 'Nếu nghi ngờ, hãy dừng trao đổi và tự liên hệ cơ quan công an gần nhất qua kênh chính thức để xác minh.';
      dialogExtra.append(note);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'button button-primary';
      close.textContent = 'Đã hiểu';
      close.addEventListener('click', closeDialog);
      dialogActions.append(close);
    }
    focusAfterDialog = success ? chatEnded.querySelector('.retry-exercise') : input;
    dialog.showModal();
    dialogClose.focus();
  }

  $('#start-exercise').addEventListener('click', startExercise);
  app.querySelectorAll('.retry-exercise').forEach(button => button.addEventListener('click', startExercise));
  file.addEventListener('change', () => {
    const selected = file.files[0];
    if (!selected) { clearAttachment(); return; }
    if (!selected.type.startsWith('image/')) {
      clearAttachment();
      feedback.textContent = 'Vui lòng chọn một tệp ảnh.';
      return;
    }
    feedback.textContent = '';
    fileName.textContent = selected.name;
    attachment.hidden = false;
  });
  $('#remove-attachment').addEventListener('click', () => { clearAttachment(); input.focus(); });
  composer.addEventListener('submit', event => {
    event.preventDefault();
    if (status !== 'active') return;
    const message = input.value.trim();
    const hasImage = file.files.length > 0;
    if (!message && !hasImage) {
      feedback.textContent = 'Hãy nhập tin nhắn hoặc chọn ảnh trước khi gửi.';
      input.focus();
      return;
    }
    feedback.textContent = '';
    if (message) addOutgoing(message);
    if (hasImage) addOutgoing('Đã gửi một ảnh trong mô phỏng.');
    input.value = '';
    clearAttachment();
    openDialog('warning');
  });
  block.addEventListener('click', () => {
    if (status !== 'active') return;
    saveStatus('completed');
    block.disabled = true;
    composer.hidden = true;
    clearAttachment();
    chatEnded.hidden = false;
    openDialog('success');
  });
  const backBtn = chat.querySelector('.sp-back');
  const chatRow = chat.querySelector('.sp-row');
  if (backBtn) backBtn.addEventListener('click', () => { chat.dataset.view = 'list'; });
  if (chatRow) chatRow.addEventListener('click', () => { chat.dataset.view = 'chat'; });
  dialogClose.addEventListener('click', closeDialog);
  dialog.addEventListener('close', () => {
    if (focusAfterDialog && focusAfterDialog.isConnected) focusAfterDialog.focus();
    focusAfterDialog = null;
  });
  showState(status);
})();
