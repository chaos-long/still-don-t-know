(() => {
  const app = document.querySelector('#level2-app');
  if (!app) return;
  const key = 'lab-an-toan-so:exercise:level2';
  const intro = app.querySelector('#m2-intro');
  const game = app.querySelector('#m2-game');
  const main = app.querySelector('#m2-main');
  const topbar = app.querySelector('#m2-topbar');
  const nav = app.querySelector('#m2-appnav');
  const dialog = app.querySelector('#m2-dialog');
  const dialogBody = app.querySelector('#m2-dialog-body');
  const storageWarning = app.querySelector('#m2-storage-warning');
  const gameStorageWarning = app.querySelector('#m2-game-storage-warning');
  const defaultState = (screen = 'lock') => ({ status:'active', screen, transferred:false, blocked:false, viewedReceipt:false, askedQuote:false, viewedQuote:false, askedSong:false, viewedHistory:false, verifiedMinh:false, talkedVy:false, groupWarned:false, teacherWarned:false, warnedAfterTransfer:false, vyAfterTransfer:false, teacherAfterTransfer:false, supportSent:false, hint:0, result:null, receiver:null });
  let state = null;
  let storageAvailable = true;
  let focusBeforeDialog = null;
  try {
    const raw = localStorage.getItem(key);
    let saved = null;
    try { saved = JSON.parse(raw || 'null'); } catch { /* Tiến độ hỏng được bỏ qua; bài mới vẫn có thể lưu. */ }
    const allowedScreens = ['lock','chat','group','contacts','call','chat-call','vy','wallet','confirm','history','support','after-transfer','decline','result'];
    if (saved && ['active','completed'].includes(saved.status) && allowedScreens.includes(saved.screen)) {
      state = {...defaultState(), ...saved};
      if (state.status === 'completed' && !state.result) state = null;
    }
  } catch { storageAvailable = false; storageWarning.hidden = false; }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { storageAvailable = false; storageWarning.hidden = false; }
  }
  function markStory() {
    try { localStorage.setItem('lab-an-toan-so:story:vy-warned', 'true'); }
    catch { storageAvailable = false; storageWarning.hidden = false; gameStorageWarning.hidden = false; }
  }
  function navScreen(screen) { state.screen = screen; save(); render(); main.focus({preventScroll:true}); }
  const button = (action, label, style = 'm2-choice', data = '') => `<button type="button" class="${style}" data-m2="${action}" ${data}>${label}</button>`;
  const heading = (eyebrow, title, desc = '') => `<p class="m2-eyebrow">${eyebrow}</p><h2>${title}</h2>${desc ? `<p class="m2-lead">${desc}</p>` : ''}`;
  const msg = (who, text, mine = false) => `<div class="m2-message${mine ? ' mine' : ''}"><span class="m2-message-meta">${who}</span><div class="m2-bubble">${text}</div></div>`;
  const groupMessage = `<article class="m2-receipt m2-search-result" data-search="cọc loa vy 200k ứng biên nhận thanh toán"><p class="m2-message-meta">Vy · 11:26</p><p>“Tớ ứng 200k cọc rồi nha. Chiều lấy loa, cuối buổi lớp hoàn tớ.”</p><div class="m2-evidence"><span aria-hidden="true">🔊</span><div><strong>Loa đỏ · Biên nhận</strong><br><span class="m2-small">Nhấn để xem chi tiết</span></div></div>${button('receipt','Xem biên nhận','m2-secondary')}</article>`;
  function mainNavFor(screen) {
    if (['chat','chat-call'].includes(screen)) return 'chat';
    if (['group','vy','decline'].includes(screen)) return 'group';
    if (['contacts','call'].includes(screen)) return 'contacts';
    if (['wallet','confirm','history','support','after-transfer'].includes(screen)) return 'wallet';
    return '';
  }
  const names = { lock:'Thông báo', chat:'Minh 🐧', group:'Văn nghệ 11A2', contacts:'Danh bạ', call:'Cuộc gọi từ danh bạ', 'chat-call':'Cuộc gọi trong chat', vy:'Vy · Phụ trách loa', wallet:'Ví lớp', confirm:'Xác nhận chuyển tiền', history:'Lịch sử giao dịch', support:'Hỗ trợ giao dịch', 'after-transfer':'Kiểm tra khoản chi', decline:'Tin nhắn từ nhóm lớp', result:'Kết quả' };
  function render() {
    intro.hidden = !!state;
    game.hidden = !state;
    if (!state) return;
    const screen = state.screen;
    topbar.innerHTML = `<span>${names[screen] || 'Điện thoại'}</span><span class="m2-tag">MÔ PHỎNG</span>`;
    nav.hidden = ['lock','result'].includes(screen);
    app.querySelectorAll('.m2-nav-button').forEach(el => {
      if (el.dataset.target === mainNavFor(screen)) el.setAttribute('aria-current','page');
      else el.removeAttribute('aria-current');
    });
    let html = '';
    if (screen === 'lock') {
      html = `<div class="m2-lock">${heading('THỨ BA · 15:42','Còn 18 phút','16:00 lớp bắt đầu tổng duyệt. Hãy chạm vào thông báo để mở ứng dụng.')}
        <button class="m2-notification" type="button" data-m2="nav" data-target="group"><span class="m2-notification-title">Văn nghệ 11A2 · Cô Hạnh</span><span>16 giờ cô mở hội trường nhé. Nhóm âm thanh nhớ mang loa qua cửa bên hông giúp cô.</span></button>
        <button class="m2-notification" type="button" data-m2="nav" data-target="chat"><span class="m2-notification-title">Minh 🐧</span><span>Ê m còn cầm quỹ lớp không? Chuyển giúp t 200k cọc loa với, lát gặp t tính lại.</span></button></div>`;
    }
    if (screen === 'chat' && state.blocked) {
      html = `${heading('TÀI KHOẢN ĐÃ CHẶN','Minh 🐧','Bạn đã chặn tài khoản này. Bạn có thể tiếp tục xử lý tình huống qua nhóm lớp hoặc danh bạ mà không cần mở chặn.')}<div class="m2-choices">${button('group','Xem nhóm lớp','m2-primary')}${button('contacts','Mở danh bạ','m2-secondary')}${button('continue-decline','Xem tin nhắn về việc nhận loa','m2-secondary')}</div>`;
    } else if (screen === 'chat') {
      html = `<div class="m2-chat">${heading('CUỘC TRÒ CHUYỆN CŨ','Minh 🐧','Trò chuyện với Minh')}
        ${button('old-history',state.viewedHistory ? 'Ẩn tin nhắn cũ' : 'Xem tin nhắn cũ','m2-secondary')}
        ${state.viewedHistory ? `${msg('Bạn · Tối qua','Mai lớp mình tập bài “Nắng sân trường” nhé.',true)}${msg('Minh · Tối qua','Ừ, t lưu bài “Nắng sân trường” rồi.')}` : ''}
        ${msg('Bạn · Tối qua','Mai mà m bật nhầm nhạc như hôm bữa là cả lớp nhảy trên nền nhạc chuông đó.',true)}
        ${msg('Minh · Tối qua','Yên tâm =))) lần này t lưu hẳn hai bản.')}
        ${msg('Minh 🐧 · 15:42','Ê m còn cầm quỹ lớp không? Chuyển giúp t 200k cọc loa với, lát gặp t tính lại.')}
        ${msg('Minh 🐧','Chuyển vào ví NGUYEN VAN NAM nha, 200k thôi.')}
        ${state.askedSong ? `${msg('Bạn','M đang tập bài gì?',true)}${msg('Minh 🐧','“Nắng sân trường” đó, t đang sửa nốt đoạn đầu.')}` : ''}
        ${state.askedQuote ? `${msg('Bạn','M gửi biên nhận cho t xem.',true)}${msg('Minh 🐧',`T gửi đây nha. ${button('quote','Xem ảnh Minh gửi','m2-secondary')}`)}` : ''}
        ${state.transferred ? msg('Minh 🐧','Bên kia bảo chưa thấy tiền. M xem lại giúp t với.') : ''}
        <div class="m2-divider"></div><p class="m2-small">Bạn muốn làm gì?</p><div class="m2-choices">
        ${!state.askedSong ? button('ask-song','M đang tập bài gì?') : ''}
        ${!state.askedQuote ? button('ask-quote','M gửi biên nhận cho t xem.') : button('quote',state.viewedQuote ? 'Xem lại ảnh Minh gửi' : 'Xem ảnh Minh gửi')}
        ${button('chat-call','Gọi trong đoạn chat')}
        ${!state.transferred ? button('wallet','Chuyển tiền','m2-primary') : button('after-transfer','Kiểm tra khoản chi','m2-primary')}
        ${!state.transferred ? `${button('decline','Để lát gặp ở hội trường nha.')}${button('mute','Tắt thông báo')}${button('block','Chặn tài khoản')}` : ''}
        ${button('hint','Mình không biết làm gì tiếp','m2-secondary')}
        </div>${state.hint ? `<p class="m2-hint">${state.hint === 1 ? 'Trong lớp, ai là người trực tiếp thuê loa?' : 'Hãy xem tin ghim trong nhóm Văn nghệ 11A2 để biết phân công.'}</p>` : ''}
        </div>`;
    }
    if (screen === 'group') {
      html = `${heading('NHÓM LỚP','Văn nghệ 11A2','Cuộc trò chuyện về buổi tổng duyệt')}
        <div class="m2-pinned"><strong>Tin ghim · Phân công</strong><p>Vy – loa, Minh – nhạc.</p></div>
        <label class="m2-label" for="m2-search">Tìm trong nhóm</label><input id="m2-search" class="m2-input" type="search" placeholder="Tìm tin nhắn, ví dụ: cọc" autocomplete="off"><p class="m2-small" id="m2-search-empty" hidden>Không tìm thấy tin nhắn phù hợp.</p>
        <div class="m2-list m2-group-messages" id="m2-group-messages" aria-label="Tin nhắn nhóm" tabindex="0">${groupMessage}<article class="m2-message m2-search-result" data-search="bạn lớp tập nhạc sân khấu"><span class="m2-message-meta">Bạn lớp · 14:15</span><div class="m2-bubble">Mình đã kiểm tra dây nối cho sân khấu rồi nhé.</div></article><article class="m2-message m2-search-result" data-search="lớp lịch tổng duyệt"><span class="m2-message-meta">Bạn lớp · 15:20</span><div class="m2-bubble">Mọi người nhớ lịch tổng duyệt lúc 16 giờ nha.</div></article><article class="m2-message m2-search-result" data-search="cô hạnh 16 giờ hội trường loa cửa bên hông"><span class="m2-message-meta">Cô Hạnh · 15:40</span><div class="m2-bubble">16 giờ cô mở hội trường nhé. Nhóm âm thanh nhớ mang loa qua cửa bên hông giúp cô.</div></article>
        ${state.transferred ? msg('Vy · Mới đây','Tớ gửi lại biên nhận cọc buổi sáng ở đây nha. Chiều nay ai lấy loa thì chỉ cần đọc tên lớp thôi, khỏi trả thêm.') : ''}</div>
        <div class="m2-choices">${button('vy','Nhắn Vy về tiền cọc','m2-primary')}
        ${state.transferred || state.verifiedMinh ? button('warn-group', (state.transferred ? state.warnedAfterTransfer : state.groupWarned) ? 'Đã báo nhóm lớp' : 'Cảnh báo nhóm lớp','m2-secondary', (state.transferred ? state.warnedAfterTransfer : state.groupWarned) ? 'disabled' : '') : ''}
        ${state.transferred ? button('after-transfer','Kiểm tra chuyện vừa xảy ra','m2-secondary') : ''}
        ${state.viewedQuote && state.viewedReceipt ? button('compare','Đặt hai ảnh cạnh nhau','m2-secondary') : ''}</div>
        ${(state.transferred ? state.warnedAfterTransfer : state.groupWarned) ? `<p class="m2-notice">${state.transferred ? 'Sau tin nhắn của bạn, Vy đã hủy một giao dịch đang chờ xác nhận.' : 'Vy: “May quá, tớ cũng vừa nhận được tin nhờ ứng thêm.”'}</p>` : ''}`;
    }
    if (screen === 'contacts') html = `${heading('DANH BẠ','Liên hệ đã lưu','Số cá nhân đã có trong máy từ trước.')}
      <article class="m2-card"><span class="m2-tag">ĐÃ LƯU</span><h3>Minh – số cá nhân</h3><p>Liên hệ trong danh bạ của bạn.</p>${button('call','Gọi số cá nhân','m2-primary')}</article>
      <article class="m2-card"><h3>Vy</h3><p>Phụ trách thuê loa cho lớp.</p>${button('vy','Nhắn Vy','m2-secondary')}</article>`;
    if (screen === 'chat-call') html = `${heading('CUỘC GỌI','Không được bắt máy','Bạn gọi ngay trong đoạn chat, nhưng cuộc gọi không được bắt máy. Điều này chưa đủ để kết luận chuyện gì đã xảy ra.')}
      <div class="m2-choices">${button('chat','Về đoạn chat','m2-secondary')}${button('contacts','Mở danh bạ','m2-primary')}${button('vy','Hỏi Vy về tiền cọc')}</div>`;
    if (screen === 'call') html = `${heading('CUỘC GỌI TỪ SỐ ĐÃ LƯU','Minh – số cá nhân','Sau hai hồi chuông, có tiếng nhạc tập ở đầu dây bên kia.')}
      <div class="m2-list">${msg('Minh','Alo? M nghe thử đoạn đầu luôn không, t vừa sửa xong.')}${msg('Bạn','Ủa, m vừa nhắn t chuyển tiền cọc loa hả?',true)}${msg('Minh','Đâu có. T đứng với cô nãy giờ mà. Khoan, nó nhắn từ nick t hả?')}</div>
      <p class="m2-small">Bạn đã nói chuyện với Minh qua số đã lưu. Tiếp theo bạn chọn gì?</p><div class="m2-choices">${button('minh-audio','Quay lại lo âm thanh','m2-primary')}${button('minh-report','Báo ngay vào nhóm lớp')}${button('minh-teacher','Nhờ Minh báo lớp qua cô Hạnh')}</div>`;
    if (screen === 'vy') html = `${heading('TIN NHẮN','Vy · Phụ trách loa','Bạn hỏi người trực tiếp thuê loa cho lớp.')}
      <div class="m2-list">${msg('Bạn','Vy ơi, loa chiều nay còn thiếu 200k cọc hả?',true)}${msg('Vy','Tớ cọc sáng rồi. Cậu kéo lên tin có hình cái loa đỏ ấy.')}${msg('Vy','À mà tiện, cậu ra cửa bên hông nhận loa giúp tớ được không? Tớ đang mắc thay đồ.')}</div>
      ${state.transferred ? '<p class="m2-notice">Vy giúp đối chiếu khoản cọc và thu xếp loa; giao dịch chuyển nhầm vẫn còn trong lịch sử ví.</p>' : ''}
      <div class="m2-choices">${button('vy-self','Mình sẽ ra nhận loa','m2-primary')}${button('vy-friend','Nhờ Vy gọi bạn khác nhận thay')}${button('group','Xem nhóm và biên nhận','m2-secondary')}${state.transferred ? button('after-transfer','Tiếp tục kiểm tra khoản chi','m2-secondary') : ''}</div>`;
    if (screen === 'wallet') html = `${heading('VÍ LỚP','Quỹ lớp','Các con số và giao dịch đều là mô phỏng.')}
      <div class="m2-money"><span>Số dư hiện tại</span><strong>${state.transferred ? '300.000đ' : '500.000đ'}</strong></div>
      ${state.transferred ? '<p class="m2-notice">Đã có một giao dịch 200.000đ. Bạn có thể xem lại và gửi yêu cầu hỗ trợ.</p>' : '<p class="m2-small">Bạn có thể xem giao dịch trước khi xác nhận chuyển.</p>'}
      <div class="m2-choices">${!state.transferred && !state.blocked ? button('confirm','Chuẩn bị chuyển 200.000đ','m2-primary') : state.transferred ? button('after-transfer','Kiểm tra chuyện vừa xảy ra','m2-primary') : ''}${button('history','Xem lịch sử giao dịch','m2-secondary')}${button('chat','Quay lại chat','m2-secondary')}</div>`;
    if (screen === 'confirm') html = `${heading('KIỂM TRA TRƯỚC KHI CHUYỂN','Xác nhận giao dịch','Đây là bước xem lại. Tiền chỉ được chuyển khi bạn bấm xác nhận.')}
      <div class="m2-card"><p class="m2-small">Người nhận do tài khoản chat cung cấp</p><h3>NGUYEN VAN NAM</h3><p class="m2-small">Ví mô phỏng · 094 *** 123</p><div class="m2-divider"></div><p class="m2-small">Số tiền</p><strong class="m2-money-inline">200.000đ</strong></div>
      <div class="m2-choices">${button('transfer','Xác nhận chuyển 200.000đ','m2-primary')}${button('wallet','Quay lại, chưa chuyển','m2-secondary')}</div>`;
    if (screen === 'history') html = `${heading('VÍ LỚP','Lịch sử giao dịch')}${state.transferred ? `<article class="m2-card"><span class="m2-tag">ĐÃ GHI NHẬN</span><h3>Chuyển 200.000đ</h3><p>Người nhận: NGUYEN VAN NAM</p><label class="m2-label" for="m2-transaction-code">Mã giao dịch</label><input id="m2-transaction-code" class="m2-input" value="MO-PHONG-1126" readonly>${button('copy-tx','Sao chép mã giao dịch','m2-secondary')}<p class="m2-small" id="m2-copy-status" role="status"></p><p class="m2-small">Số dư hiện tại: 300.000đ</p>${button('support','Hỗ trợ giao dịch','m2-secondary')}</article>` : '<div class="m2-notice">Chưa có giao dịch nào trong bài mô phỏng.</div>'}<div class="m2-choices">${button('wallet','Về ví lớp','m2-secondary')}</div>`;
    if (screen === 'support') html = `${heading('VÍ LỚP','Hỗ trợ giao dịch','Mã giao dịch: MO-PHONG-1126')}
      ${state.supportSent ? '<div class="m2-notice"><strong>Đã gửi yêu cầu hỗ trợ.</strong><p>Giao dịch chưa được hoàn lại; quỹ lớp vẫn còn 300.000đ.</p></div>' : '<div class="m2-card"><p>Bạn có thể gửi yêu cầu hỗ trợ cho giao dịch mô phỏng này. Việc gửi yêu cầu không tự động hoàn tiền.</p></div>'}
      <div class="m2-choices">${!state.supportSent ? button('send-support','Gửi yêu cầu hỗ trợ','m2-primary') : ''}${button('after-transfer','Tiếp tục kiểm tra khoản chi','m2-secondary')}${button('history','Về lịch sử ví','m2-secondary')}</div>`;
    if (screen === 'after-transfer') html = `${heading('MỤC TIÊU MỚI','Kiểm tra chuyện vừa xảy ra','Kiểm tra giao dịch và giúp lớp xử lý khoản chi.')}
      <div class="m2-list">${msg('Vy · Nhóm lớp','Tớ gửi lại biên nhận cọc buổi sáng ở đây nha. Chiều nay ai lấy loa thì chỉ cần đọc tên lớp thôi, khỏi trả thêm.')}${msg('Minh 🐧 · Chat riêng','Bên kia bảo chưa thấy tiền. M xem lại giúp t với.')}</div>
      <div class="m2-money"><span>Số dư quỹ lớp</span><strong>300.000đ</strong></div>
      ${state.warnedAfterTransfer ? '<div class="m2-notice">Sau tin nhắn của bạn, Vy đã hủy một giao dịch đang chờ xác nhận.</div>' : ''}
      ${state.supportSent ? '<div class="m2-notice">Đã gửi yêu cầu hỗ trợ. Khoản tiền chưa được hoàn lại.</div>' : ''}
      ${state.vyAfterTransfer ? '<div class="m2-notice">Vy đã biết chuyện và giúp đối chiếu khoản cọc, thu xếp loa cho lớp.</div>' : ''}
      ${state.teacherAfterTransfer ? '<div class="m2-notice">Cô Hạnh đã nhận được thông báo và giúp lớp đối chiếu, thu xếp loa.</div>' : ''}
      <div class="m2-choices">${button('history','Mở lịch sử ví','m2-primary')}${button('vy','Báo và hỏi Vy')}${button('report-teacher','Báo cô Hạnh')}${button('group','Mở nhóm lớp')}${!state.warnedAfterTransfer ? button('warn-group','Cảnh báo nhóm lớp') : ''}${state.warnedAfterTransfer || state.vyAfterTransfer || state.teacherAfterTransfer ? button('finish-transfer','Kết thúc và xem kết quả','m2-secondary') : ''}</div>`;
    if (screen === 'decline') html = `${heading('NHÓM LỚP','Tin nhắn mới','Bạn đã dừng yêu cầu chuyển tiền và chưa gửi tiền.')}
      ${msg('Vy','Ai ở gần cửa bên hông nhận loa với?')}
      <div class="m2-choices">${button('decline-self','Mình sẽ ra nhận loa','m2-primary')}${button('decline-friend','Để bạn khác nhận loa')}</div>`;
    if (screen === 'result') html = resultView();
    main.innerHTML = html;
    main.scrollTop = 0;
    if (screen === 'group') { const thread = main.querySelector('#m2-group-messages'); thread.scrollTop = thread.scrollHeight; }
    if (!storageAvailable) { storageWarning.hidden = false; gameStorageWarning.hidden = false; }
  }
  function resultView() {
    const balance = state.transferred ? '300.000đ' : '500.000đ';
    let title = 'Loa đã tới hội trường';
    let explanation = '';
    const consequences = [];
    if (state.result === 'minh') {
      explanation = 'Bạn gọi Minh qua số cá nhân đã lưu. Minh xác nhận không nhờ chuyển tiền và nhận xử lý tài khoản. Bạn giữ được khoản tiền và lớp có loa để tổng duyệt.';
      if (state.groupWarned) consequences.push('Bạn đã báo nhóm. Vy cho biết cũng vừa nhận được tin nhờ ứng thêm; Vy sẽ nhớ cùng đối chiếu người nhận ở tình huống sau.');
      else if (state.teacherWarned) consequences.push('Minh nhờ cô Hạnh nhắc cả lớp trong nhóm trong khi bạn đi nhận loa.');
      else consequences.push('Bạn nhắn Vy và đến cửa bên hông nhận loa.');
    } else if (state.result === 'vy') {
      explanation = state.viewedReceipt
        ? 'Bạn tìm thấy biên nhận Vy gửi lúc 11:26. Chi tiết “đã thanh toán” giúp bạn giữ lại 200.000đ dù chưa cần kết luận ai đang dùng tài khoản Minh.'
        : 'Bạn hỏi trực tiếp Vy, người thuê loa, và biết khoản cọc đã được trả. Bạn tránh trả cùng một khoản hai lần.';
      consequences.push(state.receiver === 'self' ? 'Bạn đến cửa bên hông nhận chiếc loa đỏ cho lớp.' : 'Vy nhờ một bạn khác nhận chiếc loa đỏ cho lớp.');
    } else if (state.result === 'decline') {
      explanation = 'Bạn dừng yêu cầu chuyển tiền và giữ lại quỹ lớp. Tại hội trường, Minh nói Vy đã báo cho mình về tin nhắn từ tài khoản đó.';
      consequences.push(state.receiver === 'self' ? 'Bạn xung phong nhận loa ở cửa bên hông.' : 'Một bạn khác nhận loa để lớp kịp tổng duyệt.');
    } else if (state.result === 'transfer') {
      title = state.warnedAfterTransfer ? 'Chặn lần chuyển thứ hai' : 'Tiếp tục xử lý khoản chi';
      explanation = 'Bạn đã chuyển 200.000đ trong ví mô phỏng. Khoản chuyển nhầm chưa được hoàn lại; lớp vẫn có loa vì tiền cọc thật đã được trả từ sáng.';
      if (state.warnedAfterTransfer) consequences.push('Sau tin nhắn của bạn, Vy đã hủy một giao dịch đang chờ xác nhận.');
      if (state.vyAfterTransfer) consequences.push('Bạn đã báo Vy để cùng đối chiếu khoản cọc và thu xếp loa.');
      if (state.teacherAfterTransfer) consequences.push('Bạn đã báo cô Hạnh để giúp lớp đối chiếu và thu xếp loa.');
      if (state.supportSent) consequences.push('Bạn đã gửi yêu cầu hỗ trợ giao dịch; tiền chưa tự động trở lại ví.');
      if (state.verifiedMinh) consequences.push('Bạn gọi số đã lưu và nói chuyện với Minh.');
    }
    const stage = state.result === 'vy' ? `<svg class="m2-scene" viewBox="0 0 520 200" role="img" aria-label="Cả lớp tổng duyệt trên sân khấu, chiếc loa đỏ ở bên cạnh" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="200" rx="14" fill="#e9f4ef"/><path d="M0 145H520V200H0z" fill="#c3ded1"/><path d="M35 50h450v100H35z" fill="#f9fcf9" stroke="#bad5c8" stroke-width="3"/><path d="M50 150h420v13H50z" fill="#8dbba6"/><rect x="405" y="98" width="42" height="64" rx="6" fill="#bf504c"/><circle cx="426" cy="118" r="9" fill="#733e40"/><circle cx="426" cy="143" r="12" fill="#733e40"/><circle cx="190" cy="86" r="12" fill="#ddb59a"/><path d="M173 130c0-19 7-27 17-27s17 8 17 27" fill="#337b68"/><circle cx="250" cy="79" r="12" fill="#ddb59a"/><path d="M233 130c0-19 7-34 17-34s17 15 17 34" fill="#416c96"/><circle cx="310" cy="86" r="12" fill="#ddb59a"/><path d="M293 130c0-19 7-27 17-27s17 8 17 27" fill="#ba8061"/><path d="M100 70l18-10v17c0 6-11 8-11 2 0-3 4-4 8-4V63l-15 9z" fill="#70ad91"/></svg>` : '';
    return `<section class="m2-result">${heading('KẾT QUẢ TÌNH HUỐNG',title)}${stage}<div class="m2-money"><span>Số dư quỹ lớp</span><strong>${balance}</strong></div><p><strong>Cả lớp tổng duyệt đúng giờ.</strong></p><p>${explanation}</p>${consequences.map(text => `<p class="m2-notice">${text}</p>`).join('')}<div class="m2-actions">${button('retry','Thử một lựa chọn khác','m2-primary')}<a class="m2-secondary" href="practice.html">Về trang Thực hành</a></div></section>`;
  }
  function finish(reason) {
    state.status = 'completed';
    state.result = reason;
    state.screen = 'result';
    save(); render(); main.focus({preventScroll:true});
  }
  function showEvidence(type) {
    if (!dialog.open) focusBeforeDialog = document.activeElement;
    let content;
    if (type === 'quote') {
      content = `<h2 id="m2-dialog-title">Phiếu báo giá</h2><p class="m2-small">Ảnh do tài khoản chat gửi · mô phỏng</p><div class="m2-evidence"><span aria-hidden="true">🔊</span><div><strong>BÁO GIÁ THUÊ LOA</strong><p>Số tiền cần đặt cọc</p><strong>200.000đ</strong><p>Trạng thái: chưa ghi nhận thanh toán</p></div></div>${state.viewedReceipt ? button('compare','Đặt hai ảnh cạnh nhau','m2-secondary') : ''}`;
    } else if (type === 'receipt') {
      content = `<h2 id="m2-dialog-title">Biên nhận thuê loa</h2><p class="m2-small">Vy đăng trong nhóm · 11:26</p><div class="m2-evidence"><span aria-hidden="true">🔊</span><div><strong>BIÊN NHẬN · LOA ĐỎ</strong><p>Tiền đặt cọc: 200.000đ</p><strong>ĐÃ THANH TOÁN</strong><p>Người đặt: Vy · Lớp 11A2</p></div></div>${state.viewedQuote ? button('compare','Đặt hai ảnh cạnh nhau','m2-secondary') : ''}`;
    } else {
      content = `<h2 id="m2-dialog-title">Đối chiếu hai ảnh</h2><p class="m2-small">Xem kỹ trạng thái thanh toán của từng giấy.</p><div class="m2-compare"><div class="m2-evidence"><div><strong>Phiếu báo giá</strong><p>Số tiền cần đặt cọc</p><strong>200.000đ</strong><p>Chưa ghi nhận thanh toán</p></div></div><div class="m2-evidence"><div><strong>Biên nhận · loa đỏ</strong><p>Đặt cọc 200.000đ</p><strong>ĐÃ THANH TOÁN</strong><p>Vy · 11:26</p></div></div></div>`;
    }
    dialogBody.innerHTML = content;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.m2-dialog-close').focus();
  }
  app.addEventListener('input', event => {
    if (event.target.id !== 'm2-search') return;
    const normalize = text => text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d').trim();
    const query = normalize(event.target.value);
    let matches = 0;
    main.querySelectorAll('.m2-search-result').forEach(item => {
      const match = !query || normalize(item.dataset.search + ' ' + item.textContent).includes(query);
      item.hidden = !match;
      if (match) matches += 1;
    });
    main.querySelector('#m2-search-empty').hidden = matches > 0;
    const thread = main.querySelector('#m2-group-messages');
    thread.scrollTop = query ? 0 : thread.scrollHeight;
  });
  app.addEventListener('click', event => {
    const control = event.target.closest('[data-m2]');
    if (!control || !app.contains(control) || control.disabled) return;
    const action = control.dataset.m2;
    if (action === 'close-dialog') { dialog.close(); return; }
    if (action === 'start' || action === 'retry') {
      state = defaultState(action === 'retry' ? 'chat' : 'lock');
      save(); render(); main.focus({preventScroll:true}); return;
    }
    if (!state || state.status !== 'active') return;
    if (action === 'nav') { navScreen(control.dataset.target); return; }
    if (['chat','group','contacts','wallet','after-transfer','history','support','confirm','vy','chat-call'].includes(action)) {
      if (action === 'confirm' && (state.transferred || state.blocked)) return;
      if (action === 'vy') { state.talkedVy = true; if (state.transferred) state.vyAfterTransfer = true; }
      navScreen(action); return;
    }
    if (action === 'copy-tx') {
      const code = app.querySelector('#m2-transaction-code');
      const feedback = app.querySelector('#m2-copy-status');
      const selectCode = () => { code.focus(); code.select(); feedback.textContent = 'Mã đã được chọn; hãy sao chép bằng bàn phím hoặc menu của trình duyệt.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code.value).then(() => { feedback.textContent = 'Đã sao chép mã giao dịch.'; }, selectCode);
      else selectCode();
      return;
    }
    if (action === 'call') { state.verifiedMinh = true; navScreen('call'); return; }
    if (action === 'old-history') { state.viewedHistory = !state.viewedHistory; save(); render(); main.focus({preventScroll:true}); return; }
    if (action === 'ask-song') { state.askedSong = true; save(); render(); main.focus({preventScroll:true}); return; }
    if (action === 'ask-quote') { state.askedQuote = true; save(); render(); main.focus({preventScroll:true}); return; }
    if (action === 'hint') { state.hint = Math.min(2, state.hint + 1); save(); render(); main.focus({preventScroll:true}); return; }
    if (['quote','receipt','compare'].includes(action)) {
      if (action === 'quote') state.viewedQuote = true;
      if (action === 'receipt') state.viewedReceipt = true;
      if (action === 'compare' && !(state.viewedReceipt && state.viewedQuote)) return;
      save(); showEvidence(action); return;
    }
    if (['decline','mute','block'].includes(action) && !state.transferred) { if (action === 'block') state.blocked = true; navScreen('decline'); return; }
    if (action === 'continue-decline' && state.blocked && !state.transferred) { navScreen('decline'); return; }
    if (['decline-self','decline-friend'].includes(action)) {
      state.receiver = action === 'decline-self' ? 'self' : 'friend'; finish('decline'); return;
    }
    if (['vy-self','vy-friend'].includes(action)) {
      state.talkedVy = true; if (state.transferred) state.vyAfterTransfer = true; state.receiver = action === 'vy-self' ? 'self' : 'friend';
      if (state.transferred) { navScreen('after-transfer'); return; }
      finish('vy'); return;
    }
    if (action === 'warn-group') {
      state.groupWarned = true; if (state.transferred) state.warnedAfterTransfer = true; markStory();
      navScreen(state.transferred ? 'after-transfer' : 'group'); return;
    }
    if (['minh-audio','minh-report','minh-teacher'].includes(action)) {
      if (action === 'minh-report') { state.groupWarned = true; if (state.transferred) state.warnedAfterTransfer = true; markStory(); }
      if (action === 'minh-teacher') { state.teacherWarned = true; if (state.transferred) state.teacherAfterTransfer = true; markStory(); }
      if (state.transferred) { navScreen('after-transfer'); return; }
      finish('minh'); return;
    }
    if (action === 'transfer') {
      if (state.transferred || state.blocked || state.screen !== 'confirm') return;
      state.transferred = true; navScreen('after-transfer'); return;
    }
    if (action === 'send-support') { state.supportSent = true; save(); render(); main.focus({preventScroll:true}); return; }
    if (action === 'report-teacher') { state.teacherWarned = true; state.teacherAfterTransfer = true; save(); render(); main.focus({preventScroll:true}); return; }
    if (action === 'finish-transfer' && state.transferred && (state.warnedAfterTransfer || state.vyAfterTransfer || state.teacherAfterTransfer)) { finish('transfer'); }
  });
  dialog.addEventListener('close', () => { if (focusBeforeDialog && focusBeforeDialog.isConnected) focusBeforeDialog.focus(); focusBeforeDialog = null; });
  render();
})();
