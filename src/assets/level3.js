(() => {
  const app = document.querySelector('#level3-app');
  if (!app) return;
  const scenario = window.level3Scenario || {};
  const d = scenario.dialogues || {};
  const key = 'lab-an-toan-so:exercise:level3';
  const intro = app.querySelector('#m3-intro');
  const game = app.querySelector('#m3-game');
  const inboxBar = app.querySelector('#m3-inbox-bar');
  const shell = app.querySelector('#m3-shell');
  const main = app.querySelector('#m3-main');
  const topbar = app.querySelector('#m3-topbar');
  const nav = app.querySelector('#m3-appnav');
  const dialog = app.querySelector('#m3-dialog');
  const dialogBody = app.querySelector('#m3-dialog-body');
  const storageWarning = app.querySelector('#m3-storage-warning');

  const defaultState = (screen = 'lock') => ({
    status: 'active',
    screen,
    has_inspected_frame: false,
    has_checked_old_story: false,
    has_locked_privacy: false,
    privacy_friend_locked: false,
    privacy_story_locked: false,
    has_saved_evidence: false,
    has_reported_scammer: false,
    has_talked_to_khanh: false,
    has_called_support: false,
    has_paid_scammer: false,
    is_blocked: false,
    asked_discount: false,
    delayed_scammer: false,
    hint: 0,
    balance: 1500000,
    delivered: [],
    chatEvents: [],
    result: null
  });

  let state = null;
  let storageAvailable = true;
  let focusBeforeDialog = null;
  let messageTimer;

  try {
    const raw = localStorage.getItem(key);
    let saved = null;
    try { saved = JSON.parse(raw || 'null'); } catch { /* Bỏ qua dữ liệu lưu không hợp lệ */ }
    const allowed = ['lock','chat-scammer','chat-khanh','profile','frame-inspector','contacts','call-khanh','call-lan','scammer-call','wallet','confirm','history','evidence','report','blocked','result'];
    if (saved && ['active','completed'].includes(saved.status) && allowed.includes(saved.screen)) {
      state = {...defaultState(), ...saved};
      if (state.status === 'completed' && !state.result) state = null;
    }
  } catch { storageAvailable = false; if (storageWarning) storageWarning.hidden = false; }

  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageAvailable = false; if (storageWarning) storageWarning.hidden = false; }
  }

  function navScreen(screen) {
    state.screen = screen;
    save();
    render();
    main.focus({preventScroll:true});
  }

  const button = (action, label, style = 'm3-choice', data = '') => `<button type="button" class="${style}" data-m3="${action}" ${data}>${label}</button>`;
  const heading = (eyebrow, title, desc = '') => `<p class="m3-eyebrow">${eyebrow}</p><h2>${title}</h2>${desc ? `<p class="m3-lead">${desc}</p>` : ''}`;
  const msg = (who, text, mine = false, extra = '') => `<div class="m3-message${mine ? ' mine' : ''}"><span class="m3-message-meta">${who}</span><div class="m3-bubble">${text}</div>${extra}</div>`;
  const beat = (id, html, immediate = false) => ({id, html, immediate});

  const names = {
    lock: 'Thông báo',
    'chat-scammer': 'user_849201',
    'chat-khanh': 'Khánh (Bạn thân)',
    profile: 'Trang cá nhân của Bạn',
    'frame-inspector': 'Trình kiểm tra khung hình',
    contacts: 'Danh bạ',
    'call-khanh': 'Cuộc gọi: Khánh',
    'call-lan': 'Cuộc gọi: Chị Lan / 111',
    'scammer-call': 'Cuộc gọi trong chat',
    wallet: 'Ví điện tử',
    confirm: 'Xác nhận chuyển tiền',
    history: 'Lịch sử giao dịch ví',
    evidence: 'Bằng chứng đã lưu',
    report: 'Báo cáo vi phạm',
    blocked: 'Tài khoản đã chặn',
    result: 'Kết quả tình huống'
  };

  const navTargets = {
    'chat-scammer': 'chat-scammer',
    'chat-khanh': 'chat-khanh',
    profile: 'profile',
    contacts: 'contacts',
    'call-khanh': 'contacts',
    'call-lan': 'contacts',
    wallet: 'wallet',
    confirm: 'wallet',
    history: 'wallet',
    evidence: 'profile',
    report: 'chat-scammer',
    blocked: 'chat-scammer',
    'frame-inspector': 'chat-scammer'
  };

  function playMessages(messages) {
    const log = main.querySelector('[data-m3-message-log]');
    const nextActions = main.querySelector('[data-m3-after-messages]');
    const typing = main.querySelector('.m3-typing');
    if (!log) return;
    const scrollArea = log.closest('.m3-transcript, .m3-main');
    const scrollToLatest = () => { if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight; };
    let index = 0;
    nextActions?.setAttribute('hidden', '');

    function append(message, isNew) {
      log.insertAdjacentHTML('beforeend', message.html);
      if (isNew) log.lastElementChild?.classList.add('m3-arrival');
    }

    function advance() {
      while (index < messages.length) {
        const message = messages[index];
        if (!message.immediate && !state.delivered.includes(message.id)) {
          if (typing) typing.hidden = false;
          scrollToLatest();
          messageTimer = setTimeout(() => {
            state.delivered.push(message.id);
            save();
            append(message, true);
            index++;
            advance();
          }, 680);
          return;
        }
        const isNew = !state.delivered.includes(message.id);
        if (isNew) {
          state.delivered.push(message.id);
          save();
        }
        append(message, isNew);
        index++;
      }
      if (typing) typing.hidden = true;
      nextActions?.removeAttribute('hidden');
      scrollToLatest();
    }
    advance();
  }

  function getScammerMessages() {
    const videoCard = `<div class="m3-video-card">
      <img src="assets/level3-deepfake-preview.svg" alt="Video đe dọa (đã làm mờ an toàn)">
      <h4>Bản xem trước video đính kèm (0:14)</h4>
      <p>Vùng nhạy cảm đã được hệ thống kiểm duyệt làm mờ hoàn toàn.</p>
      ${button('inspect-frame', '🔍 Soi chi tiết khung hình', 'm3-primary')}
    </div>`;

    const beats = [
      beat('scammer-threat-1', msg('user_849201 · 21:15', d.scammerThreat1 || 'Muốn clip này lên thẳng Confession trường hay gửi cho từng đứa trong list bạn bè của mày?')),
      beat('scammer-video', msg('user_849201', videoCard)),
      beat('scammer-threat-2', msg('user_849201', d.scammerThreat2 || '2.000.000đ trong 15 phút. Chuyển xong tao xóa sạch file gốc. Đừng có dại mà chặn, tao nắm hết Facebook mấy đứa bạn thân của mày rồi.')),
    ];

    if (state.asked_discount) {
      beats.push(
        beat('user-deny', msg('Bạn', 'Mày là ai? Xóa ngay đi!', true), true),
        beat('scammer-discount', msg('user_849201', `${d.scammerDiscount || 'Khỏi giả nai. Thằng Khánh với mấy đứa lớp mày đây chứ đâu? Giảm cho mày còn 1.500.000đ, chuyển lẹ trước khi tao bấm gửi.'}<br><img src="assets/level3-friendlist.svg" alt="Danh sách bạn bè" style="width:100%;max-width:320px;border-radius:8px;margin-top:8px">`))
      );
    }

    if (state.delayed_scammer) {
      beats.push(
        beat('user-delay', msg('Bạn', 'Từ từ, đừng gửi bậy. Để tao xoay tiền đã.', true), true),
        beat('scammer-delay', msg('user_849201', d.scammerDelayReply || 'Tao cho mày đúng 10 phút nữa. Im lặng là tao bấm đăng liền.'))
      );
    }

    if (state.has_paid_scammer) {
      beats.push(
        beat('scammer-more', msg('user_849201 · Tin mới', `<span style="color:#c93838;font-weight:700">ĐÒI TIỀN LẦN HAI:</span> ${d.scammerExtortMore || 'Nhận được tiền rồi. Nhưng file này còn lưu trên server dự phòng, muốn xóa vĩnh viễn thì chuyển thêm 3.000.000đ nữa trong 10 phút.'}`))
      );
    }

    return beats;
  }

  function getKhanhMessages() {
    const beats = [
      beat('khanh-init', msg('Khánh · 21:14', d.khanhStart || 'Ê, phần mở đầu tao làm xong rồi nha. Mày check lại số liệu slide 4 giúp tao với, 10 giờ tụi mình ghép file.')),
    ];

    if (state.has_talked_to_khanh) {
      const mode = state.has_checked_old_story ? d.khanhChat?.withStory : d.khanhChat?.withoutStory;
      beats.push(
        beat('user-to-khanh', msg('Bạn', mode?.user || 'Khánh ơi, có nick lạ nhắn tống tiền tao...', true), true),
        beat('khanh-reply-1', msg('Khánh', mode?.reply1 || 'Bình tĩnh! Mày tuyệt đối đừng chuyển một đồng nào nha.')),
        beat('khanh-reply-2', msg('Khánh', mode?.reply2 || 'Khóa riêng tư lại rồi chụp màn hình bằng chứng đi.'))
      );
    }

    return beats;
  }

  function render() {
    clearTimeout(messageTimer);
    if (intro) intro.hidden = !!state;
    if (game) game.hidden = !state;
    if (!state) return;

    const screen = state.screen;
    const inboxActive = !['lock','result'].includes(screen);
    app.classList.toggle('m3-inbox-active', inboxActive);
    if (inboxBar) inboxBar.hidden = !inboxActive;
    shell.dataset.screen = screen;

    topbar.innerHTML = `<div style="display:flex;align-items:center;gap:11px"><span class="m3-avatar" aria-hidden="true">${screen === 'chat-khanh' ? 'K' : screen === 'profile' ? 'B' : screen === 'contacts' ? '☏' : screen === 'wallet' ? '₫' : '?'}</span><div><strong style="display:block;font-size:16px">${names[screen] || 'An Toàn Số'}</strong><small style="color:#717575;font-size:12px">${screen === 'chat-khanh' ? 'Đang trực tuyến' : screen === 'chat-scammer' ? 'Tài khoản lạ · Không xác minh' : 'Lab An Toàn Số'}</small></div></div><span class="m3-tag ${screen === 'chat-scammer' ? 'danger' : ''}">${screen === 'chat-scammer' ? 'ĐE DỌA' : 'MÔ PHỎNG'}</span>`;

    nav.hidden = !inboxActive;
    app.querySelectorAll('.m3-nav-button').forEach(el => {
      const target = el.dataset.target;
      if (target === navTargets[screen]) el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    });

    let html = '';
    let messages = [];

    if (screen === 'lock') {
      messages = [
        beat('lock-khanh', `<button class="m3-notification" type="button" data-m3="nav" data-target="chat-khanh"><span class="m3-notification-title">Khánh · 21:14</span><span>${d.khanhStart || 'Ê, phần mở đầu tao làm xong rồi nha...'}</span></button>`),
        beat('lock-scammer', `<button class="m3-notification" type="button" data-m3="nav" data-target="chat-scammer"><span class="m3-notification-title" style="color:#c93838">user_849201 · 21:15</span><span>${d.scammerThreat1 || 'Muốn clip này lên thẳng Confession trường...'}</span></button>`)
      ];
      html = `<div style="padding:16px">${heading('TỐI NAY · 21:15','Còn 45 phút ghép slide','22:00 nhóm phải nộp bài thuyết trình. Chạm vào thông báo để xử lý.')}
        <div class="m3-list" data-m3-message-log role="log" aria-label="Thông báo mới"></div></div>`;
    }

    if (screen === 'chat-scammer' && state.is_blocked) {
      html = `${heading('TÀI KHOẢN ĐÃ CHẶN','user_849201','Bạn đã chặn tài khoản này. Kẻ gian không thể gửi thêm tin nhắn cho bạn. Bạn vẫn có thể mở Trang cá nhân để khóa riêng tư, kiểm tra bằng chứng hoặc báo cáo tài khoản.')}
      <div class="m3-choices">
        ${button('save-evidence', state.has_saved_evidence ? '✓ Đã lưu bằng chứng' : 'Chụp lưu bằng chứng và ID nick', 'm3-choice')}
        ${button('report-scammer', state.has_reported_scammer ? '✓ Đã gửi báo cáo vi phạm' : 'Báo cáo tài khoản ảo này', 'm3-choice')}
        ${button('profile', 'Vào Trang cá nhân (Khóa riêng tư)', 'm3-primary')}
        ${button('chat-khanh', 'Nhắn tin trao đổi với Khánh', 'm3-secondary')}
        ${button('finish-check', 'Tiếp tục sang 22:00 (Nộp bài)', 'm3-secondary')}
      </div>`;
    } else if (screen === 'chat-scammer') {
      messages = getScammerMessages();
      const replies = [];
      if (!state.asked_discount) replies.push(['reply-deny', 'Mày là ai? Xóa ngay đi!']);
      if (!state.delayed_scammer && !state.has_paid_scammer) replies.push(['reply-delay', 'Khoan đã, để tao xoay tiền.']);

      html = `<div class="m3-chat">
        <div class="m3-chat-toolbar">
          ${button('scammer-call', 'Gọi trong chat', 'm3-tool')}
          ${button('save-evidence', state.has_saved_evidence ? '✓ Đã lưu bằng chứng' : 'Chụp lưu bằng chứng', 'm3-tool')}
          ${button('report-scammer', state.has_reported_scammer ? '✓ Đã báo cáo' : 'Báo cáo nick', 'm3-tool')}
          ${button('block-scammer', 'Chặn tài khoản', 'm3-tool')}
        </div>
        <div class="m3-transcript" tabindex="0" aria-label="Hội thoại đe dọa">
          <div class="m3-chat-date">Hôm nay · 21:15</div>
          <div class="m3-list" data-m3-message-log role="log" aria-label="Tin nhắn với kẻ tống tiền"></div>
          <p class="m3-typing" hidden><span aria-hidden="true">•••</span> user_849201 đang soạn tin</p>
        </div>
        <div class="m3-composer"><div data-m3-after-messages>
          <div class="m3-reply-tools">
            ${button('wallet', state.has_paid_scammer ? 'Xem ví sau chuyển' : 'Mở ví điện tử', 'm3-tool')}
            ${button('profile', 'Xem Trang cá nhân', 'm3-tool')}
            ${button('inspect-frame', 'Soi chi tiết khung hình', 'm3-tool')}
            ${button('hint', 'Gợi ý', 'm3-tool')}
          </div>
          ${state.hint ? `<p class="m3-hint">${state.hint === 1 ? d.hints.level1 : d.hints.level2}</p>` : ''}
          ${replies.length ? `<form class="m3-compose-form">
            <select class="m3-reply-select" name="reply" aria-label="Phản hồi cho kẻ tống tiền" required>
              <option value="" selected disabled>Chọn phản hồi…</option>
              ${replies.map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
            </select>
            <button class="m3-primary m3-send" type="submit" disabled>Gửi</button>
          </form>` : `<div style="padding:10px 16px;display:flex;gap:8px">${button('profile','Vào Trang cá nhân để khóa riêng tư','m3-primary')}${button('chat-khanh','Nhắn Khánh','m3-secondary')}</div>`}
        </div></div>
      </div>`;
    }

    if (screen === 'chat-khanh') {
      messages = getKhanhMessages();
      html = `<div class="m3-chat">
        <div class="m3-chat-toolbar">
          ${button('call-khanh', 'Gọi cho Khánh', 'm3-tool')}
          ${button('profile', 'Xem trang cá nhân', 'm3-tool')}
          ${button('contacts', 'Mở danh bạ', 'm3-tool')}
        </div>
        <div class="m3-transcript" tabindex="0" aria-label="Hội thoại với bạn thân">
          <div class="m3-chat-date">Hôm nay · 21:14</div>
          <div class="m3-list" data-m3-message-log role="log" aria-label="Tin nhắn với Khánh"></div>
          <p class="m3-typing" hidden><span aria-hidden="true">•••</span> Khánh đang soạn tin</p>
        </div>
        <div class="m3-composer"><div data-m3-after-messages>
          <div class="m3-reply-tools">
            ${!state.has_talked_to_khanh ? button('talk-khanh', state.has_checked_old_story ? 'Báo Khánh: Clip ghép từ story cũ thứ Năm' : 'Báo Khánh: Có nick lạ đang tống tiền tao', 'm3-choice') : ''}
            ${button('profile', 'Mở Trang cá nhân & Khóa riêng tư', 'm3-tool')}
            ${button('finish-check', 'Tiếp tục sang 22:00 (Nộp bài)', 'm3-primary')}
          </div>
        </div></div>
      </div>`;
    }

    if (screen === 'profile') {
      html = `${heading('TRANG CÁ NHÂN','Hồ sơ & Dấu vết số','Kiểm tra các nội dung bạn từng chia sẻ công khai.')}
      <div class="m3-card">
        <h3>Kho Story cũ & Bài đăng gần đây</h3>
        <p class="m3-small">Story cách đây 3 ngày (Thứ Năm lúc 22:10 · Công khai)</p>
        <div style="margin:12px 0;display:flex;gap:12px;align-items:center;background:#1e2730;padding:12px;border-radius:10px;color:#fff">
          <img src="assets/level3-story-post.svg" alt="Story cũ" style="width:72px;height:100px;object-fit:cover;border-radius:6px">
          <div>
            <strong style="color:#ffd868">“Cày deadline bài thuyết trình 📚🥲”</strong>
            <p style="margin:4px 0;font-size:12px;color:#9db0bf">Quay cận mặt dưới đèn bàn học màu vàng, mặc áo phông xanh đậm.</p>
            ${button('view-old-story', state.has_checked_old_story ? '✓ Đã đối chiếu vết ghép' : 'Mở xem chi tiết story cũ', 'm3-secondary')}
          </div>
        </div>
      </div>
      
      <div class="m3-card">
        <h3>Cài đặt quyền riêng tư</h3>
        <p class="m3-small">Kiểm soát ai có thể xem thông tin và danh sách bạn bè của bạn.</p>
        
        <div class="m3-privacy-item">
          <div>
            <strong>Danh sách bạn bè</strong>
            <span>Trạng thái: <strong>${state.privacy_friend_locked ? 'Chỉ mình tôi (Đã bảo vệ)' : 'Công khai (Kẻ gian có thể chụp lén)'}</strong></span>
          </div>
          ${button('toggle-privacy-friends', state.privacy_friend_locked ? 'Đã khóa riêng tư' : 'Khóa: Chỉ mình tôi', state.privacy_friend_locked ? 'm3-choice' : 'm3-primary')}
        </div>

        <div class="m3-privacy-item">
          <div>
            <strong>Người lạ nhắn tin & xem Story</strong>
            <span>Trạng thái: <strong>${state.privacy_story_locked ? 'Chỉ bạn bè (Đã bảo vệ)' : 'Mọi người (Công khai)'}</strong></span>
          </div>
          ${button('toggle-privacy-story', state.privacy_story_locked ? 'Đã giới hạn' : 'Khóa: Chỉ bạn bè', state.privacy_story_locked ? 'm3-choice' : 'm3-primary')}
        </div>
      </div>

      <div class="m3-choices">
        ${button('chat-scammer', 'Quay lại đoạn chat lạ', 'm3-secondary')}
        ${button('chat-khanh', 'Nhắn tin với Khánh', 'm3-primary')}
        ${button('finish-check', 'Tiếp tục sang 22:00 (Nộp bài)', 'm3-secondary')}
      </div>`;
    }

    if (screen === 'contacts') {
      html = `${heading('DANH BẠ','Liên hệ tin cậy','Những người đáng tin cậy bạn có thể xin tư vấn khi gặp nguy hiểm.')}
      <div class="m3-card">
        <span class="m3-tag">BẠN THÂN</span>
        <h3>Quốc Khánh · Di động</h3>
        <p class="m3-small">Số cá nhân đã lưu trong máy từ trước.</p>
        ${button('call-khanh', 'Gọi cho Khánh', 'm3-primary')}
      </div>
      <div class="m3-card">
        <span class="m3-tag">TƯ VẤN & BẢO VỆ</span>
        <h3>Tổng đài 111 / Chị Lan · Cố vấn SV</h3>
        <p class="m3-small">Kênh hỗ trợ bảo vệ trẻ em và thanh thiếu niên an toàn trên không gian mạng.</p>
        ${button('call-lan', 'Gọi đường dây hỗ trợ 111', 'm3-secondary')}
      </div>
      <div class="m3-choices">${button('chat-scammer', 'Quay lại chat', 'm3-secondary')}</div>`;
    }

    if (screen === 'call-khanh' || screen === 'call-lan') {
      const isKhanh = screen === 'call-khanh';
      const callBeats = isKhanh ? d.calls?.khanh : d.calls?.lan;
      messages = (callBeats || []).map((c, i) => beat(`call-${screen}-${i}`, msg(c.sender === 'ban' ? 'Bạn' : isKhanh ? 'Khánh' : 'Chị Lan', c.text, c.sender === 'ban')));

      html = `${heading('CUỘC GỌI ĐÃ KẾT NỐI', isKhanh ? 'Khánh · Di động' : 'Chị Lan · Cố vấn SV / 111', 'Sau hai hồi chuông, đầu dây bên kia đã bắt máy.')}
      <div class="m3-list" data-m3-message-log role="log" aria-label="Nội dung cuộc gọi"></div>
      <div data-m3-after-messages style="margin-top:16px">
        <div class="m3-notice">Cuộc gọi giúp bạn bình tĩnh lại và nắm rõ cách phòng thủ: tuyệt đối không chuyển tiền, khóa riêng tư và lưu bằng chứng.</div>
        <div class="m3-choices">
          ${button('profile', 'Mở Trang cá nhân để khóa riêng tư', 'm3-primary')}
          ${button('chat-scammer', 'Quay lại đoạn chat tống tiền', 'm3-secondary')}
          ${button('chat-khanh', 'Nhắn tin với Khánh', 'm3-secondary')}
        </div>
      </div>`;
    }

    if (screen === 'scammer-call') {
      html = `${heading('CUỘC GỌI BỊ TỪ CHỐI','user_849201','Bạn gọi ngay trong đoạn chat, nhưng sau 2 hồi chuông, người dùng từ chối cuộc gọi.')}
      <div class="m3-notice danger">Kẻ tống tiền luôn trốn tránh gọi video hay gọi thoại trực tiếp để không lộ giọng nói và khuôn mặt thật.</div>
      <div class="m3-choices">
        ${button('chat-scammer', 'Quay lại đoạn chat', 'm3-primary')}
        ${button('contacts', 'Mở Danh bạ tìm người hỗ trợ', 'm3-secondary')}
      </div>`;
    }

    if (screen === 'wallet') {
      html = `${heading('VÍ ĐIỆN TỬ','Quỹ sinh hoạt tháng','Số dư của bạn là tiền sinh hoạt thực tế do gia đình gửi.')}
      <div class="m3-money"><span>Số dư ví hiện tại</span><strong>${state.balance.toLocaleString('vi-VN')}đ</strong></div>
      ${state.has_paid_scammer ? '<div class="m3-notice danger">Bạn đã chuyển 1.500.000đ. Kẻ gian lập tức đòi thêm 3.000.000đ nữa. Hãy dừng lại ngay!</div>' : ''}
      <div class="m3-choices">
        ${!state.has_paid_scammer ? button('confirm-transfer', 'Chuẩn bị chuyển 1.500.000đ', 'm3-primary') : ''}
        ${button('history', 'Xem lịch sử giao dịch', 'm3-secondary')}
        ${button('chat-scammer', 'Quay lại đoạn chat', 'm3-secondary')}
        ${state.has_paid_scammer ? button('profile', 'Khóa quyền riêng tư Facebook', 'm3-primary') : ''}
      </div>`;
    }

    if (screen === 'confirm') {
      html = `${heading('XÁC NHẬN CHUYỂN TIỀN','Khoản tiền lớn: 1.500.000đ','Hãy dừng lại một nhịp trước khi bấm xác nhận. Tiền chuyển đi sẽ không thể tự động thu hồi.')}
      <div class="m3-card">
        <p class="m3-small">Người nhận do tài khoản đe dọa cung cấp</p>
        <h3 style="color:#c93838">${scenario.budget?.recipient || 'NGUYEN HOANG PHUC'}</h3>
        <p class="m3-small">${scenario.budget?.recipientNote || 'Ví điện tử mô phỏng · 091 *** 892'}</p>
        <div class="m3-divider"></div>
        <p class="m3-small">Số tiền thanh toán</p>
        <strong style="font-size:24px;color:#c93838">1.500.000đ</strong>
        <p class="m3-small" style="margin-top:6px">Nội dung: Phi xoa clip</p>
      </div>
      <div class="m3-choices">
        ${button('do-transfer', 'Xác nhận chuyển 1.500.000đ', 'm3-choice danger')}
        ${button('wallet', 'Quay lại (Giữ nguyên tiền)', 'm3-primary')}
      </div>`;
    }

    if (screen === 'history') {
      html = `${heading('LỊCH SỬ GIAO DỊCH','Chi tiết ví điện tử')}
      ${state.has_paid_scammer ? `<div class="m3-card">
        <span class="m3-tag danger">ĐÃ CHUYỂN</span>
        <h3>Chuyển 1.500.000đ</h3>
        <p class="m3-small">Người nhận: ${scenario.budget?.recipient}</p>
        <p class="m3-small">Mã giao dịch: <strong>${scenario.budget?.transactionCode}</strong></p>
        <div class="m3-notice">Hãy lưu lại mã giao dịch này để phục vụ trình báo cơ quan công an hoặc hỗ trợ rà soát.</div>
      </div>` : '<div class="m3-notice">Chưa có giao dịch nào phát sinh. Quỹ sinh hoạt 1.500.000đ vẫn an toàn.</div>'}
      <div class="m3-choices">
        ${button('wallet', 'Về ví điện tử', 'm3-secondary')}
        ${button('chat-scammer', 'Quay lại chat', 'm3-primary')}
      </div>`;
    }

    if (screen === 'evidence') {
      html = `${heading('BẰNG CHỨNG ĐÃ LƯU','Lưu trữ dữ liệu số','Bằng chứng giúp cơ quan chức năng hoặc nhà trường xử lý kẻ xấu.')}
      <div class="m3-card">
        <span class="m3-tag">ID TÀI KHOẢN</span>
        <h3>user_849201 (Facebook URL: fb.com/u_849201)</h3>
        <p class="m3-small">Đã lưu ảnh chụp đoạn chat tống tiền, thẻ video cắt ghép và danh sách bạn bè đe dọa.</p>
      </div>
      <div class="m3-choices">
        ${button('report-scammer', 'Báo cáo tài khoản này', 'm3-primary')}
        ${button('chat-scammer', 'Về cuộc chat', 'm3-secondary')}
      </div>`;
    }

    if (screen === 'report') {
      html = `${heading('BÁO CÁO VI PHẠM','user_849201','Gửi báo cáo lên hệ thống để khóa tài khoản kẻ xấu.')}
      <div class="m3-card">
        <p>Chọn lý do báo cáo vi phạm:</p>
        <div class="m3-choices">
          <label style="display:flex;align-items:center;gap:8px;padding:8px;background:#f9f8f5;border-radius:6px">
            <input type="radio" name="report_reason" checked> <strong>Tống tiền, đe dọa và quấy rối tình dục</strong>
          </label>
          <label style="display:flex;align-items:center;gap:8px;padding:8px;background:#f9f8f5;border-radius:6px">
            <input type="radio" name="report_reason"> <strong>Nội dung cắt ghép giả mạo (Deepfake)</strong>
          </label>
        </div>
        <div style="margin-top:14px">
          ${button('submit-report', 'Gửi báo cáo ngay', 'm3-primary')}
        </div>
      </div>
      <div class="m3-choices">${button('chat-scammer', 'Hủy / Quay lại', 'm3-secondary')}</div>`;
    }

    if (screen === 'result') {
      html = resultView();
    }

    main.innerHTML = html;
    main.scrollTop = 0;
    if (messages.length) playMessages(messages);
  }

  function resultView() {
    const balanceText = state.has_paid_scammer ? 'Ví còn 0đ' : 'Ví còn nguyên 1.500.000đ';
    const balanceDetail = state.has_paid_scammer
      ? 'bạn đã lỡ chuyển 1.500.000đ nhưng đã kịp dừng lại khi kẻ gian tiếp tục đòi thêm 3.000.000đ.'
      : 'bạn giữ bình tĩnh và không chuyển bất kỳ khoản tiền nào theo lời đe dọa.';

    const securityDetail = state.has_locked_privacy && state.has_saved_evidence
      ? 'Đã đối chiếu vết ghép deepfake từ story cũ, khóa danh sách bạn bè công khai, lưu bằng chứng và báo cáo tài khoản ảo.'
      : state.has_locked_privacy
      ? 'Đã khóa danh sách bạn bè và story về chế độ riêng tư, ngăn chặn kẻ xấu tiếp cận người thân.'
      : 'Đã nhận diện đòn tâm lý tống tiền và bảo vệ bài thuyết trình.';

    return `<section class="m3-result">
      ${heading('KẾT QUẢ TÌNH HUỐNG','Hoàn thành bài thuyết trình đúng hạn')}
      <div class="m3-money"><span>Số dư ví điện tử</span><strong>${state.balance.toLocaleString('vi-VN')}đ</strong></div>
      
      <div style="margin:20px 0;display:flex;flex-direction:column;gap:10px">
        <div class="m3-notice"><strong>1. Ví điện tử:</strong> ${balanceText} — ${balanceDetail}</div>
        <div class="m3-notice"><strong>2. An toàn dữ liệu:</strong> ${securityDetail}</div>
        <div class="m3-notice"><strong>3. Kết quả:</strong> Không có video nào bị phát tán; bạn giữ vững tâm lý, không bị thao túng và nộp slide 4 cho nhóm đúng 22:00.</div>
      </div>

      <div class="m3-actions">
        ${button('retry', 'Thử một lựa chọn khác', 'm3-primary')}
        <a class="m3-secondary" href="practice.html">Về trang Thực hành</a>
      </div>
    </section>`;
  }

  function showEvidenceModal(type) {
    if (!dialog) return;
    focusBeforeDialog = document.activeElement;
    let content = '';

    if (type === 'frame') {
      content = `<h2 id="m3-dialog-title">${d.frameInspector?.title || 'Trình kiểm tra khung hình'}</h2>
      <p class="m3-small">${d.frameInspector?.subtitle}</p>
      <div class="m3-inspector-grid">
        <div class="m3-inspector-preview">
          <img src="assets/level3-deepfake-preview.svg" alt="Khung hình phân tích">
          <p class="m3-small" style="color:#e9c66e;margin-top:6px">Dấu vết ghép mặt và cổ bị nhòe</p>
        </div>
        <div class="m3-findings">
          ${(d.frameInspector?.findings || []).map(f => `<div class="m3-finding-item"><strong>${f.target}</strong><p>${f.detail}</p></div>`).join('')}
        </div>
      </div>
      <div style="margin-top:16px;text-align:right">
        ${button('close-dialog', 'Đã hiểu và đối chiếu xong', 'm3-primary')}
      </div>`;
    } else if (type === 'old-story') {
      content = `<h2 id="m3-dialog-title">${d.oldStory?.title}</h2>
      <p class="m3-small">${d.oldStory?.details}</p>
      <div style="text-align:center;margin:12px 0">
        <img src="assets/level3-story-post.svg" alt="Story cũ" style="max-height:360px;border-radius:10px">
      </div>
      <div class="m3-notice">Khuôn mặt, góc nghiêng đầu và chiếc áo phông xanh đậm dưới đèn bàn học hoàn toàn trùng khớp với video đe dọa. Đây chính là nguồn ảnh kẻ gian dùng để tạo deepfake!</div>
      <div style="margin-top:16px;text-align:right">
        ${button('close-dialog', 'Xác nhận nguồn gốc ảnh ghép', 'm3-primary')}
      </div>`;
    }

    dialogBody.innerHTML = content;
    dialog.showModal();
    dialog.querySelector('.m3-dialog-close')?.focus();
  }

  // Event delegation
  app.addEventListener('click', event => {
    const control = event.target.closest('[data-m3]');
    if (!control || !app.contains(control) || control.disabled) return;
    const action = control.dataset.m3;

    if (action === 'start' || action === 'retry') {
      state = defaultState('lock');
      save();
      render();
      main.focus({preventScroll:true});
      return;
    }

    if (action === 'close-dialog') {
      dialog.close();
      return;
    }

    if (!state || state.status !== 'active') return;

    if (action === 'nav') {
      navScreen(control.dataset.target);
      return;
    }

    if (action === 'inspect-frame') {
      state.has_inspected_frame = true;
      save();
      showEvidenceModal('frame');
      return;
    }

    if (action === 'view-old-story') {
      state.has_checked_old_story = true;
      save();
      showEvidenceModal('old-story');
      return;
    }

    if (action === 'toggle-privacy-friends') {
      state.privacy_friend_locked = true;
      if (state.privacy_story_locked) state.has_locked_privacy = true;
      save(); render(); return;
    }

    if (action === 'toggle-privacy-story') {
      state.privacy_story_locked = true;
      if (state.privacy_friend_locked) state.has_locked_privacy = true;
      save(); render(); return;
    }

    if (action === 'save-evidence') {
      state.has_saved_evidence = true;
      save(); render();
      navScreen('evidence');
      return;
    }

    if (action === 'report-scammer') {
      navScreen('report');
      return;
    }

    if (action === 'submit-report') {
      state.has_reported_scammer = true;
      state.is_blocked = true;
      save();
      navScreen('chat-scammer');
      return;
    }

    if (action === 'block-scammer') {
      state.is_blocked = true;
      save(); render(); return;
    }

    if (action === 'scammer-call') {
      navScreen('scammer-call');
      return;
    }

    if (action === 'talk-khanh') {
      state.has_talked_to_khanh = true;
      save(); render(); return;
    }

    if (action === 'call-khanh') {
      state.has_called_support = true;
      navScreen('call-khanh');
      return;
    }

    if (action === 'call-lan') {
      state.has_called_support = true;
      navScreen('call-lan');
      return;
    }

    if (action === 'confirm-transfer') {
      navScreen('confirm');
      return;
    }

    if (action === 'do-transfer') {
      state.has_paid_scammer = true;
      state.balance = 0;
      save();
      navScreen('wallet');
      return;
    }

    if (action === 'hint') {
      state.hint = Math.min(2, state.hint + 1);
      save(); render(); return;
    }

    if (action === 'finish-check') {
      state.status = 'completed';
      state.result = state.has_paid_scammer ? 'paid' : 'safe';
      save();
      navScreen('result');
      return;
    }

    if (['chat-scammer','chat-khanh','profile','contacts','wallet','history'].includes(action)) {
      navScreen(action);
      return;
    }
  });

  app.addEventListener('change', event => {
    const field = event.target.closest('.m3-reply-select');
    if (field) field.form.querySelector('.m3-send').disabled = !field.value;
  });

  app.addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches('.m3-compose-form')) return;
    event.preventDefault();
    const reply = form.elements.reply?.value;
    if (reply === 'reply-deny' || reply === 'reply-beg') {
      state.asked_discount = true;
      save(); render();
    } else if (reply === 'reply-delay') {
      state.delayed_scammer = true;
      save(); render();
    }
  });

  dialog?.addEventListener('close', () => {
    if (focusBeforeDialog && focusBeforeDialog.isConnected) focusBeforeDialog.focus();
    focusBeforeDialog = null;
  });

  render();
})();
