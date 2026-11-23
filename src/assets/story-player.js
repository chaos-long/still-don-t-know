(() => {
  const root = document.querySelector('#story-app');
  const story = window.storyScenario;
  if (!root || !story) return;

  const key = `lab-an-toan-so:story:${story.id}`;
  const themeNames = {background: '--sp-bg', incoming: '--sp-in', outgoing: '--sp-out', text: '--sp-text', action: '--sp-action', accent: '--sp-accent'};
  Object.entries(themeNames).forEach(([name, variable]) => {
    if (/^#[0-9a-fA-F]{3,8}$/.test(story.theme?.[name] || '')) root.style.setProperty(variable, story.theme[name]);
  });
  const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const section = () => story.sections[state.sectionIndex];
  const initial = () => ({version: 1, sectionIndex: 0, eventIndex: 0, phase: 'playing', activeChat: story.startChat, view: 'chat', unlocked: [story.startChat], history: Object.fromEntries(Object.keys(story.chats).map(id => [id, []])), read: {}, completed: [], scroll: {}, ending: null});
  let state;
  let timer = 0;
  let modal = null;
  let storageAvailable = true;
  let busy = false;

  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    state = saved && saved.version === 1 && Number.isInteger(saved.sectionIndex) && saved.sectionIndex >= 0 && saved.sectionIndex < story.sections.length && story.chats[saved.activeChat] && Array.isArray(saved.unlocked) && saved.history && Array.isArray(saved.completed) ? saved : initial();
  } catch { state = initial(); storageAvailable = false; }
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageAvailable = false; } };
  const avatar = (label, color, extra = '') => {
    if (label && (label.includes('/') || label.endsWith('.svg') || label.endsWith('.png') || label.endsWith('.jpg'))) {
      return `<img src="${esc(label)}" class="sp-avatar ${extra}" style="--avatar:${esc(color || '#e4e4e4')}" alt="" aria-hidden="true">`;
    }
    return `<span class="sp-avatar ${extra}" style="--avatar:${esc(color || '#e4e4e4')}" aria-hidden="true">${esc(label || '•')}</span>`;
  };
  const chatItems = id => state.history[id] || [];
  const contentItems = id => chatItems(id).filter(item => item.type !== 'marker');
  const eventPreview = item => item.type === 'image' ? 'Đã gửi một ảnh' : item.type === 'card' ? item.title : item.text || '';
  const lastItem = id => contentItems(id).at(-1);
  const unread = id => Math.max(0, contentItems(id).length - (state.read[id] || 0));
  const isMobile = () => matchMedia('(max-width: 760px)').matches;
  const chatVisible = () => !isMobile() || state.view === 'chat';
  const sectionTargetOpen = () => state.activeChat === section().chat && chatVisible();

  function rememberScroll() {
    const pane = root.querySelector('.sp-history');
    if (pane) state.scroll[state.activeChat] = pane.scrollTop;
  }
  function markRead(id) { state.read[id] = contentItems(id).length; }
  function addMarker() {
    const target = section().chat;
    const id = `${section().id}:marker`;
    if (!chatItems(target).some(item => item.id === id)) state.history[target].push({id, type: 'marker', text: section().label});
  }
  addMarker();

  function renderMessage(item, previous, next, chat) {
    if (item.type === 'marker') return `<div class="sp-time-label">${esc(item.text)}</div>`;
    const mine = item.sender === story.playerId;
    const grouped = previous && previous.type !== 'marker' && previous.sender === item.sender && !['choice'].includes(previous.type);
    const sender = story.people[item.sender] || {name: item.sender, avatar: '?'};
    const groupName = !mine && chat.members.length > 2 && !grouped ? `<span class="sp-sender">${esc(sender.name)}</span>` : '';
    const isEndOfSentCluster = mine && (!next || next.type === 'marker' || next.sender !== item.sender);
    const showRead = isEndOfSentCluster && Boolean(item.read);
    let body = '';
    if (item.type === 'message') body = `<div class="sp-bubble">${esc(item.text)}</div>`;
    if (item.type === 'image') body = `<button type="button" class="sp-image-button" data-sp="image" data-id="${esc(item.id)}" aria-label="Mở ảnh: ${esc(item.alt)}"><img src="${esc(item.src)}" alt="${esc(item.alt)}"></button>`;
    if (item.type === 'card') body = `<article class="sp-card">${item.image ? `<img src="${esc(item.image)}" alt="">` : ''}<div><strong>${esc(item.title)}</strong><p>${esc(item.description || '')}</p><button type="button" data-sp="card" data-id="${esc(item.id)}">${esc(item.action.label)}</button></div></article>`;
    return `<div class="sp-message ${mine ? 'mine' : 'theirs'} ${grouped ? 'grouped' : ''}" data-event="${esc(item.id)}">${groupName}${body}<span class="sp-message-time">${esc(item.time || '')}${showRead ? ' · Đã đọc' : ''}</span></div>`;
  }

  function actionContent() {
    if (state.ending) return `<div class="sp-end"><strong>${esc(story.endings[state.ending].title)}</strong><p>${esc(story.endings[state.ending].body)}</p><button type="button" data-sp="restart">${esc(story.endings[state.ending].action || 'Chơi lại')}</button></div>`;
    if (state.phase === 'switch') {
      const target = story.chats[section().chat];
      const teaser = lastItem(section().chat);
      return `<div class="sp-next-chat" role="status"><span>Tin mới từ <strong>${esc(target.title)}</strong>${teaser ? ` · ${esc(eventPreview(teaser))}` : ''}</span><button type="button" data-sp="open" data-chat="${esc(section().chat)}">Mở chat</button></div>`;
    }
    if (state.activeChat !== section().chat) return '<span class="sp-tray-hint">Quay lại cuộc chat đang diễn ra để tiếp tục.</span>';
    if (state.phase === 'playing') return '<span class="sp-tray-hint">Đang nhận tin nhắn…</span>';
    if (state.phase === 'waiting') {
      const needed = section().events.find(event => event.type === 'card' && event.required && !state.completed.includes(event.id));
      if (!needed) return '<button type="button" data-sp="continue">Tiếp tục</button>';
      return `<span class="sp-tray-hint">Hãy xem nội dung trước khi tiếp tục.</span><button type="button" data-sp="card" data-id="${esc(needed.id)}">${esc(needed.action.label)}</button>`;
    }
    if (state.phase === 'choice') {
      const choice = section().events[state.eventIndex];
      return `<div class="sp-choices"><strong>${esc(choice.title)}</strong>${choice.options.map(option => `<button type="button" data-sp="choose" data-option="${esc(option.id)}">${esc(option.label)}</button>`).join('')}</div>`;
    }
    return '<button type="button" data-sp="continue">Tiếp tục</button>';
  }

  function render() {
    const oldPane = root.querySelector('.sp-history');
    const wasBottom = oldPane ? oldPane.scrollHeight - oldPane.scrollTop - oldPane.clientHeight < 70 : true;
    const oldChat = oldPane?.dataset.chat;
    if (oldPane) state.scroll[oldChat] = oldPane.scrollTop;
    const chat = story.chats[state.activeChat];
    const items = chatItems(state.activeChat);
    const list = state.unlocked.map(id => {
      const item = lastItem(id);
      const info = story.chats[id];
      const count = unread(id);
      return `<button type="button" class="sp-row ${id === state.activeChat ? 'active' : ''} ${count ? 'unread' : ''}" data-sp="open" data-chat="${esc(id)}" ${id === state.activeChat ? 'aria-current="true"' : ''}>${avatar(info.avatar, info.color)}<span class="sp-row-copy"><strong>${esc(info.title)}</strong><small>${esc(item ? eventPreview(item) : 'Chưa có tin nhắn')}</small></span><span class="sp-row-tail"><time>${esc(item?.time || '')}</time>${count ? `<span class="sp-badge" aria-label="${count} tin chưa đọc">${count}</span>` : ''}</span></button>`;
    }).join('');
    const note = storageAvailable ? '' : '<p class="sp-storage">Trình duyệt không lưu được tiến độ. Bạn vẫn có thể chơi trong phiên này.</p>';
    const nextEvent = section()?.events[state.eventIndex];
    const showTyping = state.phase === 'playing' && sectionTargetOpen() && nextEvent && nextEvent.sender !== story.playerId && nextEvent.typing !== false;
    root.innerHTML = `<div class="sp-shell" data-view="${esc(state.view)}">
      <aside class="sp-inbox"><div class="sp-inbox-heading"><div><h1>Tin nhắn</h1><p>${esc(story.title)}</p></div><a href="practice.html" aria-label="Thoát truyện, về Thực hành">Thoát</a></div><div class="sp-rows">${list}</div></aside>
      <section class="sp-conversation" aria-label="Cuộc trò chuyện ${esc(chat.title)}"><header class="sp-header"><button type="button" class="sp-back" data-sp="back" aria-label="Về danh sách tin nhắn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg></button>${avatar(chat.avatar, chat.color)}<div class="sp-header-copy"><strong>${esc(chat.title)}</strong>${chat.status || chat.members.length > 2 ? `<small>${esc(chat.status || `${chat.members.length} thành viên`)}</small>` : ''}</div><a class="sp-exit" href="practice.html">Thoát</a></header>
        <div class="sp-history" data-chat="${esc(state.activeChat)}" tabindex="0" role="log" aria-label="Lịch sử tin nhắn ${esc(chat.title)}">${items.map((item, index) => renderMessage(item, items[index - 1], items[index + 1], chat)).join('')}<div class="sp-typing" ${showTyping ? '' : 'hidden'} aria-label="Đang nhập"><span></span><span></span><span></span></div></div>
        <div class="sp-action-tray">${actionContent()}${note}</div></section>
    </div><dialog class="sp-dialog" aria-label="Nội dung đính kèm"></dialog>`;
    const pane = root.querySelector('.sp-history');
    pane.scrollTop = oldChat === state.activeChat && !wasBottom ? (state.scroll[state.activeChat] || 0) : pane.scrollHeight;
    if (modal) showModal();
  }

  function settle() {
    const current = section();
    if (current.events[state.eventIndex]?.type === 'choice') state.phase = 'choice';
    else if (state.eventIndex < current.events.length) state.phase = 'playing';
    else if (current.events.some(event => event.type === 'card' && event.required && !state.completed.includes(event.id))) state.phase = 'waiting';
    else state.phase = 'ready';
  }
  function deliver(event) {
    state.history[section().chat].push({...event});
    state.eventIndex++;
    if (sectionTargetOpen()) markRead(section().chat);
    settle();
    save();
    update();
  }
  function schedule() {
    clearTimeout(timer);
    if (modal || state.phase !== 'playing' || !sectionTargetOpen()) return;
    const event = section().events[state.eventIndex];
    if (!event) { settle(); save(); render(); return; }
    if (event.type === 'choice') { settle(); save(); render(); return; }
    const wait = event.delay ?? story.pace?.message ?? 850;
    timer = setTimeout(() => deliver(event), Math.max(0, wait));
  }
  function update() { clearTimeout(timer); render(); schedule(); }

  function showModal() {
    const element = root.querySelector('.sp-dialog');
    if (!modal) return;
    if (modal.kind === 'image') element.innerHTML = `<div class="sp-modal-content"><button type="button" data-sp="close" class="sp-close" aria-label="Đóng ảnh">×</button><img src="${esc(modal.event.src)}" alt="${esc(modal.event.alt)}"></div>`;
    else element.innerHTML = `<div class="sp-modal-content"><button type="button" data-sp="close" class="sp-close" aria-label="Đóng nội dung">×</button><h2>${esc(modal.event.action.title)}</h2><p>${esc(modal.event.action.body)}</p>${modal.event.image ? `<img src="${esc(modal.event.image)}" alt="">` : ''}<button type="button" data-sp="close" class="sp-modal-done">Đã xem</button></div>`;
    element.showModal();
    element.addEventListener('close', () => { if (modal) { modal = null; update(); } }, {once: true});
  }
  function openChat(id) {
    if (!state.unlocked.includes(id)) return;
    rememberScroll();
    state.activeChat = id;
    state.view = 'chat';
    markRead(id);
    if (state.phase === 'switch' && id === section().chat) state.phase = 'playing';
    save(); update();
  }
  function continueStory() {
    if (busy || state.phase !== 'ready' || state.sectionIndex >= story.sections.length - 1) return;
    busy = true;
    try {
      state.sectionIndex++;
      state.eventIndex = 0;
      const target = section().chat;
      addMarker();
      if (target !== state.activeChat) {
        if (!state.unlocked.includes(target)) state.unlocked.push(target);
        const first = section().events[0];
        if (first && first.type !== 'choice') {
          state.history[target].push({...first});
          state.eventIndex = 1;
        }
        state.phase = 'switch';
      } else settle();
      save(); update();
    } finally {
      setTimeout(() => { busy = false; }, 80);
    }
  }

  root.addEventListener('click', event => {
    const control = event.target.closest('[data-sp]');
    if (!control) return;
    const action = control.dataset.sp;
    if (action === 'open') { openChat(control.dataset.chat); return; }
    if (action === 'back') { rememberScroll(); state.view = 'list'; save(); update(); return; }
    if (action === 'continue') { continueStory(); return; }
    if (action === 'restart') { clearTimeout(timer); modal = null; state = initial(); addMarker(); save(); update(); return; }
    if (action === 'close') { root.querySelector('.sp-dialog').close(); return; }
    if (action === 'choose' && state.phase === 'choice') {
      const choice = section().events[state.eventIndex];
      const option = choice.options.find(item => item.id === control.dataset.option);
      if (!option || !story.endings[option.ending]) return;
      state.history[section().chat].push({id: choice.id, type: 'message', sender: story.playerId, text: option.label, time: ''});
      state.ending = option.ending;
      state.phase = 'finished';
      markRead(section().chat);
      save(); update(); return;
    }
    if (action === 'image' || action === 'card') {
      const item = Object.values(state.history).flat().find(value => value.id === control.dataset.id);
      if (!item) return;
      clearTimeout(timer);
      modal = {kind: action, event: item};
      if (action === 'card' && !state.completed.includes(item.id)) { state.completed.push(item.id); settle(); save(); }
      showModal();
    }
  });
  root.addEventListener('scroll', event => { if (event.target.matches('.sp-history')) state.scroll[state.activeChat] = event.target.scrollTop; }, true);
  window.addEventListener('resize', () => { if (!modal) update(); });
  window.addEventListener('beforeunload', () => clearTimeout(timer));
  window.addEventListener('pagehide', () => clearTimeout(timer));
  render(); schedule();
})();
