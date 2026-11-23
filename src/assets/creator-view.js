(() => {
  const {escape: esc, get, chatName, sceneName, initials, acceptImage, startIndex} = window.creatorProject;
  const button = (action, label, attributes = '', variant = '') =>
    `<button type="button" ${variant ? 'class="cr-' + variant + '"' : ''} data-action="${action}" ${attributes}>${label}</button>`;
  const option = (id, text, current) =>
    `<option value="${esc(id)}"${id === current ? ' selected' : ''}>${esc(text)}</option>`;
  const edit = (kind, id, field) => `data-edit="${kind}" data-id="${esc(id)}" data-field="${field}"`;
  const input = (label, value, binding, {type = 'text', max = 160, extra = ''} = {}) =>
    `<label><span>${label}</span><input type="${type}" value="${esc(value)}" maxlength="${max}" ${binding} ${extra}></label>`;
  const textarea = (label, value, binding, extra = '') =>
    `<label><span>${label}</span><textarea rows="3" maxlength="12000" ${binding} ${extra}>${esc(value)}</textarea></label>`;
  const select = (label, content, binding) =>
    `<label><span>${label}</span><select ${binding}>${content}</select></label>`;
  const attr = (name, value) => `data-${name}="${esc(value)}"`;
  const upload = (label, image, binding, remove, hint = '') => `<div class="cr-upload">
    ${image ? `<img src="${esc(image)}" alt="Ảnh xem trước" class="cr-thumbnail">` : ''}
    <label><span>${label}</span><input type="file" accept="${acceptImage}" ${binding}>${hint ? `<small>${hint}</small>` : ''}</label>
    ${image ? remove : ''}
  </div>`;

  function sorter(kind, itemId, index, length, what) {
    const data = attr('kind', kind) + ' ' + attr('id', itemId);
    return `<div class="cr-sort">
      <span class="cr-grip" draggable="true" data-drag ${data} title="Kéo để đổi thứ tự" aria-hidden="true">⠿</span>
      ${button('move', '↑', `${data} data-step="-1" aria-label="Đưa ${what} lên"${index === 0 ? ' disabled' : ''}`)}
      ${button('move', '↓', `${data} data-step="1" aria-label="Đưa ${what} xuống"${index === length - 1 ? ' disabled' : ''}`)}
    </div>`;
  }

  function library(drafts) {
    return drafts.length ? `<div class="cr-library-grid">${drafts.map(draft => {
      const data = attr('id', draft.id);
      return `<article class="cr-library-card">
        <h2>${esc(draft.title.trim() || 'Màn chưa đặt tên')}</h2>
        <p>${draft.scenes.length} cảnh · ${new Intl.DateTimeFormat('vi-VN', {dateStyle: 'medium', timeStyle: 'short'}).format(draft.updated)}</p>
        <div class="cr-tools">
          ${button('edit-draft', 'Mở bản nháp', data, 'primary')}
          ${button('play-draft', 'Chơi', data)}
          ${button('duplicate-draft', 'Nhân bản', data)}
        </div>
      </article>`;
    }).join('')}</div>` : '<p class="cr-empty">Bạn chưa có màn nào. Tạo màn đầu tiên hoặc nhập file màn chơi để bắt đầu.</p>';
  }

  function outline(draft, selectedId) {
    const opening = startIndex(draft);
    return `<div class="cr-panel-heading"><h2>Dàn cảnh</h2></div>
      <ol class="cr-scene-list">${draft.scenes.map((scene, index) => {
        const selected = scene.id === selectedId;
        const chat = chatName(draft, get(draft.chats, scene.chatId));
        return `<li class="cr-scene-row${selected ? ' is-current' : ''}" data-sort-kind="scene" ${attr('sort-id', scene.id)}>
          <button type="button" class="cr-scene-link" data-action="scene" ${attr('id', scene.id)}${selected ? ' aria-current="true"' : ''}>
            <span class="cr-index">${index + 1}</span><span><strong>${esc(sceneName(scene))}</strong><small>${esc(chat)}${index === opening ? ' · Mở đầu' : ''}</small></span>
          </button>
          ${sorter('scene', scene.id, index, draft.scenes.length, 'cảnh')}
        </li>`;
      }).join('')}</ol>
      ${button('add-scene', 'Thêm cảnh', '', 'wide')}`;
  }

  function messageFields(message, binding) {
    if (message.type === 'image') return upload('Ảnh trong tin nhắn', message.src, binding('src'),
      button('clear-image', 'Bỏ ảnh', binding('src')), 'PNG, JPG, WebP hoặc GIF, tối đa 2 MB.') +
      input('Mô tả ảnh', message.alt, binding('alt'), {max: 300});
    if (message.type === 'card') return input('Tiêu đề thẻ', message.title, binding('title')) +
      input('Mô tả ngắn', message.description, binding('description'), {max: 300}) +
      input('Nhãn nút mở thẻ', message.button, binding('button')) +
      textarea('Nội dung khi mở thẻ', message.body, binding('body')) +
      upload('Ảnh của thẻ (không bắt buộc)', message.src, binding('src'), button('clear-image', 'Bỏ ảnh', binding('src')));
    return textarea('Lời thoại', message.text, binding('text'), 'placeholder="Viết tin nhắn…"');
  }

  function messages(draft, scene, openTiming) {
    const chat = get(draft.chats, scene.chatId);
    const members = draft.people.filter(person => chat?.members.includes(person.id));
    return scene.messages.map((message, index) => {
      const binding = field => edit('message', message.id, field);
      return `<article class="cr-message" ${attr('message', message.id)} data-sort-kind="message" ${attr('sort-id', message.id)}>
        <div class="cr-message-tools"><strong>Tin ${index + 1}</strong>
          ${sorter('message', message.id, index, scene.messages.length, 'tin nhắn')}
          ${button('duplicate-message', 'Nhân bản', attr('id', message.id))}
          ${button('remove-message', 'Xóa', attr('id', message.id) + ' aria-label="Xóa tin ' + (index + 1) + '"')}
        </div>
        <div class="cr-fields">
          ${select('Ai gửi?', option('', 'Chọn người gửi', message.sender) +
            members.map(person => option(person.id, person.name || 'Chưa đặt tên', message.sender)).join(''), binding('sender'))}
          ${select('Kiểu tin', [['message', 'Tin chữ'], ['image', 'Ảnh'], ['card', 'Thẻ thông tin']]
            .map(([id, label]) => option(id, label, message.type)).join(''), binding('type'))}
        </div>
        ${messageFields(message, binding)}
        <details class="cr-timing" ${attr('timing', message.id)}${openTiming.has(message.id) ? ' open' : ''}>
          <summary>Nhịp phát <span data-delay-label>${formatDelay(message.delay)} giây</span></summary>
          ${input('Chờ trước khi gửi (giây)', message.delay / 1000, binding('delay'), {type: 'number', extra: 'min="0" max="30" step="0.001"'})}
        </details>
        ${button('add-message', 'Thêm tin bên dưới', attr('id', message.id), 'quiet')}
      </article>`;
    }).join('');
  }
  function formatDelay(milliseconds) {
    return new Intl.NumberFormat('vi-VN', {maximumFractionDigits: 3}).format(milliseconds / 1000);
  }

  function aftermath(draft, scene) {
    const after = scene.after;
    const binding = field => edit('after', scene.id, field);
    let content = '';
    if (after.mode === 'next') {
      const next = draft.scenes[draft.scenes.indexOf(scene) + 1];
      content = next ? `<p class="cr-note">Đi tới: ${button('jump-scene', esc(sceneName(next)), attr('id', next.id), 'text')}</p>` :
        '<p class="cr-note">Cảnh này đang ở cuối dàn cảnh. Thêm cảnh tiếp theo hoặc đặt kết thúc.</p>';
    }
    if (after.mode === 'choice') {
      content = after.choices.map((choice, index) => {
        const target = get(draft.scenes, choice.target);
        const choiceBinding = field => edit('choice', choice.id, field);
        return `<div class="cr-choice" ${attr('choice', choice.id)}>
          <div class="cr-message-tools"><strong>Lựa chọn ${index + 1}</strong>${button('remove-choice', 'Xóa', attr('id', choice.id))}</div>
          ${input('Nội dung nút', choice.label, choiceBinding('label'), {max: 300})}
          ${select('Cảnh đích', option('', 'Chọn cảnh đích', choice.target) +
            draft.scenes.map(entry => option(entry.id, sceneName(entry) + ' · ' + chatName(draft, get(draft.chats, entry.chatId)), choice.target)).join(''), choiceBinding('target'))}
          <label class="cr-check"><input type="checkbox" ${choiceBinding('send')}${choice.send ? ' checked' : ''}> Gửi nội dung nút vào chat dưới tên nhân vật nhập vai</label>
          <p class="cr-note">Đi tới: ${target ? button('jump-scene', esc(sceneName(target)) + ' · ' + esc(chatName(draft, get(draft.chats, target.chatId))), attr('id', target.id), 'text') : 'Chưa chọn cảnh'}</p>
        </div>`;
      }).join('') + button('add-choice', 'Thêm lựa chọn');
    }
    if (after.mode === 'end') {
      content = input('Tiêu đề kết quả', after.title, binding('end-title'), {max: 300}) +
        textarea('Lời giải thích cho người chơi', after.body, binding('end-body'));
    }
    return `<div class="cr-panel-heading"><h2>Sau cảnh này</h2></div>
      ${select('Cách chuyển cảnh', [['next', 'Tiếp tục theo thứ tự'], ['choice', 'Đưa ra lựa chọn'], ['end', 'Kết thúc màn']]
        .map(([id, label]) => option(id, label, after.mode)).join(''), binding('after'))}${content}`;
  }

  function compose(draft, scene, openTiming) {
    if (!scene) return '<div class="cr-panel-heading"><h2>Soạn cảnh</h2></div><p class="cr-empty">Thêm một cảnh vào dàn cảnh để viết lời thoại.</p>';
    const binding = field => edit('scene', scene.id, field);
    return `<div class="cr-panel-heading"><h2>Soạn cảnh</h2>${button('remove-scene', 'Xóa cảnh', '', 'quiet')}</div>
      <div class="cr-scene-settings">
        ${input('Tên cảnh', scene.name, binding('name'))}
        <div class="cr-fields">
          ${select('Cuộc chat', draft.chats.map(chat => option(chat.id, chatName(draft, chat), scene.chatId)).join(''), binding('chat'))}
          ${input('Giờ trong truyện', scene.time, binding('time'), {max: 5, extra: 'placeholder="15:42" autocomplete="off"'})}
        </div>
      </div>
      <div class="cr-message-list">${messages(draft, scene, openTiming)}</div>
      ${button('add-message', 'Thêm tin nhắn', '', 'wide')}
      <section class="cr-after" aria-label="Sau cảnh này">${aftermath(draft, scene)}</section>`;
  }

  function people(draft, pendingRemoval) {
    const choose = select('Nhân vật người chơi nhập vai', draft.people
      .map(person => option(person.id, person.name || 'Chưa đặt tên', draft.playerId)).join(''), edit('draft', draft.id, 'player'));
    return choose + draft.people.map((person, index) => {
      const binding = field => edit('person', person.id, field);
      const confirm = pendingRemoval?.id === person.id ? `<div class="cr-removal">
        ${pendingRemoval.scenes.length ? `<p>Nhân vật này có lời thoại trong: <strong>${esc(pendingRemoval.scenes.map(sceneName).join(', '))}</strong>.</p>` : ''}
        ${pendingRemoval.requires ? select('Chuyển sang nhân vật', option('', 'Chọn người thay thế', '') +
          draft.people.filter(entry => entry !== person).map(entry => option(entry.id, entry.name || 'Chưa đặt tên', '')).join(''), 'data-replacement') : ''}
        <div class="cr-tools">${button('confirm-person', 'Xóa nhân vật', attr('id', person.id), 'primary')}${button('cancel-person', 'Hủy')}</div>
      </div>` : '';
      return `<article class="cr-manager-item" ${attr('person', person.id)} data-sort-kind="person" ${attr('sort-id', person.id)}>
        <div class="cr-manager-person">
          ${person.avatar ? `<img class="cr-avatar" src="${esc(person.avatar)}" alt="">` : `<span class="cr-avatar" aria-hidden="true" data-initials>${esc(initials(person.name))}</span>`}
          ${input('Tên nhân vật', person.name, binding('name'))}
          ${sorter('person', person.id, index, draft.people.length, 'nhân vật')}
        </div>
        ${upload('Đổi ảnh đại diện', '', binding('avatar'), '')}
        <div class="cr-tools">
          ${person.avatar ? button('clear-image', 'Dùng chữ cái tên', binding('avatar')) : ''}
          ${button('remove-person', 'Xóa nhân vật', attr('id', person.id) + (draft.people.length < 2 ? ' disabled' : ''), 'quiet')}
        </div>${confirm}
      </article>`;
    }).join('') + button('add-person', 'Thêm nhân vật', '', 'primary');
  }

  function chats(draft) {
    const peopleOptions = draft.people.filter(person => person.id !== draft.playerId);
    const opening = select('Chat mở đầu', draft.chats
      .map(chat => option(chat.id, chatName(draft, chat), draft.startChatId)).join(''), edit('draft', draft.id, 'opening'));
    return opening + '<p class="cr-note">Màn bắt đầu ở cảnh đầu tiên của cuộc chat này trong dàn cảnh.</p>' +
      draft.chats.map(chat => {
        const binding = field => edit('chat', chat.id, field);
        return `<article class="cr-manager-item" ${attr('chat', chat.id)}>
          <h3>${esc(chatName(draft, chat))}</h3>
          <div class="cr-fields">
            ${select('Loại cuộc chat', option('direct', 'Chat riêng', chat.type) + option('group', 'Chat nhóm', chat.type), binding('type'))}
            ${chat.type === 'group' ? input('Tên nhóm', chat.name, binding('name')) : ''}
          </div>
          ${chat.type === 'direct' ? select('Nhắn riêng với', option('', 'Chưa chọn', '') +
            peopleOptions.map(person => option(person.id, person.name || 'Chưa đặt tên', chat.members.find(member => member !== draft.playerId))).join(''), binding('peer')) :
            `<fieldset><legend>Thành viên</legend><div class="cr-members">
              <label class="cr-check"><input type="checkbox" checked disabled> ${esc(get(draft.people, draft.playerId)?.name || 'Bạn')} (nhập vai)</label>
              ${peopleOptions.map(person => `<label class="cr-check"><input type="checkbox" ${binding('member')} value="${person.id}"${chat.members.includes(person.id) ? ' checked' : ''}> ${esc(person.name || 'Chưa đặt tên')}</label>`).join('')}
            </div></fieldset>`}
        </article>`;
      }).join('') + `<div class="cr-tools">
        ${button('add-chat', 'Thêm chat riêng', 'data-kind="direct"')}
        ${button('add-chat', 'Thêm chat nhóm', 'data-kind="group"')}
      </div>`;
  }

  function issues({errors, warnings}) {
    if (!errors.length && !warnings.length) return '';
    return `<div class="cr-validation${errors.length ? ' has-errors' : ''}">
      <strong>${errors.length ? 'Cần sửa trước khi chơi hoặc xuất màn' : 'Cảnh báo về đường đi'}</strong>
      <ul>${[...errors, ...warnings].map((item, index) => `<li>${button('issue', esc(item.text), attr('id', index), 'text')}</li>`).join('')}</ul>
    </div>`;
  }

  window.creatorView = {library, outline, compose, people, chats, issues, formatDelay};
})();
