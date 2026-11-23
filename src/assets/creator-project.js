(() => {
  const maxImageBytes = 2 * 1024 * 1024;
  const maxFileBytes = 24 * 1024 * 1024;
  const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const acceptImage = imageTypes.join(',');
  const colors = ['#d9e8e2', '#d7dcef', '#f0dcd0', '#e8dfef', '#dbe9d1'];
  const colorFor = key => colors[parseInt(key.slice(-2), 16) % colors.length];

  const id = prefix => prefix + '-' + Array.from(crypto.getRandomValues(new Uint8Array(12)),
    byte => byte.toString(16).padStart(2, '0')).join('');
  const storyTime = /^(?:(?:[01]\d|2[0-3]):[0-5]\d)?$/;
  const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const initials = name => name.trim().split(/\s+/).slice(-2).map(word => [...word][0] || '').join('').toUpperCase() || '•';
  const get = (items, key) => items.find(item => item.id === key);

  function newMessage(sender) {
    return {id: id('message'), sender, type: 'message', text: '', delay: 850, src: '', alt: '',
      title: '', description: '', button: 'Xem chi tiết', body: ''};
  }
  function newScene(chatId, number) {
    return {id: id('scene'), name: 'Cảnh ' + number, chatId, time: '', messages: [],
      after: {mode: 'next', choices: [], title: '', body: ''}};
  }
  function newDraft() {
    const person = {id: id('person'), name: 'Bạn', avatar: ''};
    const chat = {id: id('chat'), type: 'direct', name: '', members: [person.id]};
    return {version: 1, id: id('draft'), revision: id('revision'), title: 'Màn chơi mới',
      updated: Date.now(), playerId: person.id, startChatId: chat.id,
      people: [person], chats: [chat], scenes: [newScene(chat.id, 1)]};
  }

  function chatName(draft, chat) {
    if (!chat) return 'Chưa chọn cuộc chat';
    if (chat.type === 'group') return chat.name.trim() || 'Chat nhóm';
    const peer = chat.members.find(member => member !== draft.playerId);
    return get(draft.people, peer)?.name.trim() || 'Cuộc chat';
  }
  function sceneName(scene) { return scene?.name.trim() || 'Cảnh chưa đặt tên'; }
  function startIndex(draft) { return draft.scenes.findIndex(scene => scene.chatId === draft.startChatId); }

  function validate(draft) {
    const errors = [];
    const warnings = [];
    const issue = (location, text) => errors.push({location, text});
    const opening = startIndex(draft);
    if (!draft.title.trim()) issue({field: 'title'}, 'Bạn chưa đặt tên màn.');
    if (!get(draft.people, draft.playerId)) issue({field: 'people'}, 'Bạn chưa chọn nhân vật nhập vai.');
    if (!get(draft.chats, draft.startChatId) || opening < 0) {
      issue({field: 'chats'}, 'Cuộc chat mở đầu chưa có cảnh. Hãy chọn cuộc chat đã có cảnh hoặc thêm cảnh.');
    }
    for (const person of draft.people) {
      if (!person.name.trim()) issue({field: 'people', person: person.id}, 'Có nhân vật chưa được đặt tên.');
    }
    for (const chat of draft.chats) {
      if (!chat.members.includes(draft.playerId)) {
        issue({field: 'chats', chat: chat.id}, 'Cuộc chat “' + chatName(draft, chat) + '” thiếu nhân vật nhập vai.');
      }
      if (chat.type === 'group' && !chat.name.trim()) {
        issue({field: 'chats', chat: chat.id}, 'Có cuộc chat nhóm chưa được đặt tên.');
      }
    }

    const edges = new Map();
    draft.scenes.forEach((scene, index) => {
      const location = {scene: scene.id};
      const label = 'Cảnh “' + sceneName(scene) + '”';
      const chat = get(draft.chats, scene.chatId);
      if (!chat) issue({...location, field: 'chat'}, label + ' chưa có cuộc chat.');
      if (!storyTime.test(scene.time)) issue({...location, field: 'time'}, label + ' cần giờ theo dạng 15:42.');

      scene.messages.forEach((message, messageIndex) => {
        const where = {...location, message: message.id};
        const line = label + ' → tin ' + (messageIndex + 1);
        if (!get(draft.people, message.sender) || !chat?.members.includes(message.sender)) {
          issue({...where, field: 'sender'}, line + ' chưa có người gửi thuộc cuộc chat này.');
        }
        if (message.type === 'message' && !message.text.trim()) issue({...where, field: 'text'}, line + ' chưa có lời thoại.');
        if (message.type === 'image' && !message.src) issue({...where, field: 'src'}, line + ' chưa có ảnh.');
        if (message.type === 'card' && (!message.title.trim() || !message.button.trim() || !message.body.trim())) {
          issue({...where, field: 'title'}, line + ' cần có tiêu đề, nhãn nút và nội dung thẻ.');
        }
      });

      const targets = [];
      if (scene.after.mode === 'next') {
        const next = draft.scenes[index + 1];
        if (next) targets.push(next.id);
        else issue({...location, field: 'after'}, label + ' nằm cuối dàn cảnh. Hãy đặt kết thúc hoặc chọn cảnh đích.');
      }
      if (scene.after.mode === 'choice') {
        if (!scene.after.choices.length) issue({...location, field: 'after'}, label + ' chưa có lựa chọn.');
        scene.after.choices.forEach((choice, number) => {
          const line = label + ' → lựa chọn ' + (choice.label.trim() ? '“' + choice.label.trim() + '”' : (number + 1));
          const where = {...location, choice: choice.id};
          if (!choice.label.trim()) issue({...where, field: 'label'}, line + ' chưa có nội dung.');
          if (!get(draft.scenes, choice.target)) issue({...where, field: 'target'}, line + ' chưa có cảnh đích.');
          else targets.push(choice.target);
        });
      }
      if (scene.after.mode === 'end' && (!scene.after.title.trim() || !scene.after.body.trim())) {
        issue({...location, field: scene.after.title.trim() ? 'end-body' : 'end-title'}, label + ' cần có tiêu đề kết quả và lời giải thích.');
      }
      edges.set(scene.id, targets);
    });

    if (opening >= 0) {
      const reached = new Set();
      const toVisit = [draft.scenes[opening].id];
      for (const key of toVisit) {
        if (reached.has(key)) continue;
        reached.add(key);
        toVisit.push(...edges.get(key));
      }
      const finishes = new Set(draft.scenes.filter(scene => scene.after.mode === 'end').map(scene => scene.id));
      let previousSize;
      do {
        previousSize = finishes.size;
        for (const [key, targets] of edges) {
          if (targets.some(target => finishes.has(target))) finishes.add(key);
        }
      } while (previousSize !== finishes.size);

      for (const scene of draft.scenes) {
        const location = {scene: scene.id, field: 'after'};
        const label = 'Cảnh “' + sceneName(scene) + '”';
        if (!reached.has(scene.id)) warnings.push({location, text: label + ' chưa có đường đi từ cảnh mở đầu.'});
        else if (!finishes.has(scene.id) && !errors.length) issue(location, label + ' chưa có đường đi đến màn kết.');
      }
    }
    return {errors, warnings};
  }

  function toStory(draft, previewScene) {
    const people = Object.fromEntries(draft.people.map(person => [person.id, {
      name: person.name.trim() || 'Chưa đặt tên', avatar: person.avatar || initials(person.name),
      color: colorFor(person.id),
    }]));
    const chats = Object.fromEntries(draft.chats.map(chat => {
      const peer = chat.members.find(member => member !== draft.playerId);
      return [chat.id, {
        title: chatName(draft, chat), members: [...chat.members], group: chat.type === 'group',
        avatar: (chat.type === 'direct' && people[peer]?.avatar) || initials(chatName(draft, chat)),
        color: (chat.type === 'direct' && people[peer]?.color) || colorFor(chat.id),
      }];
    }));
    if (previewScene && !chats[previewScene.chatId]) {
      chats[previewScene.chatId] = {title: 'Chưa chọn cuộc chat', avatar: '…', members: []};
    }
    const endings = {};
    const sections = (previewScene ? [previewScene] : draft.scenes).map(scene => {
      const events = scene.messages.map(message => {
        const sender = chats[scene.chatId]?.members.includes(message.sender) ? message.sender : '';
        const common = {id: message.id, sender, time: scene.time, delay: message.delay};
        if (message.type === 'image' && message.src) return {...common, type: 'image', src: message.src, alt: message.alt || 'Ảnh trong cuộc trò chuyện'};
        if (message.type === 'card') return {...common, type: 'card',
          title: message.title || 'Tiêu đề thẻ', description: message.description, image: message.src,
          action: {label: message.button || 'Xem chi tiết', title: message.title, body: message.body}};
        return {...common, type: 'message', text: message.type === 'image' ? 'Chưa chọn ảnh' : message.text || '…'};
      });
      const section = {id: scene.id, chat: scene.chatId, label: scene.time, events};
      if (!previewScene && scene.after.mode === 'choice') events.push({
        id: scene.id + '-choice', type: 'choice', sender: draft.playerId, time: scene.time,
        title: 'Bạn sẽ làm gì?', options: scene.after.choices.map(option => ({...option})),
      });
      if (!previewScene && scene.after.mode === 'end') {
        section.ending = scene.id;
        endings[scene.id] = {title: scene.after.title, body: scene.after.body};
      }
      return section;
    });
    return {id: 'custom-' + draft.id, revision: draft.revision, authored: true, title: draft.title,
      playerId: draft.playerId, startChat: previewScene?.chatId ?? draft.startChatId,
      startSection: previewScene ? 0 : startIndex(draft), people, chats, sections, endings};
  }

  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const string = (value, length = 12000) => typeof value === 'string' && value.length <= length;
  const key = (value, prefix) => typeof value === 'string' && new RegExp('^' + prefix + '-[a-f0-9]{24}$').test(value);
  const image = value => value === '' || string(value, Math.ceil(maxImageBytes / 3) * 4 + 32) &&
    /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/]+={0,2}$/i.test(value);
  const collection = (items, maximum, check) => Array.isArray(items) && items.length <= maximum &&
    items.every(check) && new Set(items.map(item => item.id)).size === items.length;

  function validateFile(value) {
    const checkChoice = choice => record(choice) && key(choice.id, 'choice') && string(choice.label, 300) &&
      (choice.target === '' || key(choice.target, 'scene')) && typeof choice.send === 'boolean';
    const checkMessage = message => record(message) && key(message.id, 'message') && key(message.sender, 'person') &&
      ['message', 'image', 'card'].includes(message.type) && Number.isInteger(message.delay) && message.delay >= 0 && message.delay <= 30000 &&
      ['text', 'alt', 'title', 'description', 'button', 'body'].every(field => string(message[field])) && image(message.src);
    const checkScene = scene => record(scene) && key(scene.id, 'scene') && key(scene.chatId, 'chat') && string(scene.name, 160) &&
      typeof scene.time === 'string' && storyTime.test(scene.time) &&
      collection(scene.messages, 300, checkMessage) && record(scene.after) &&
      ['next', 'choice', 'end'].includes(scene.after.mode) && string(scene.after.title, 300) && string(scene.after.body) &&
      collection(scene.after.choices, 40, checkChoice);
    const checkChat = chat => record(chat) && key(chat.id, 'chat') && ['direct', 'group'].includes(chat.type) &&
      string(chat.name, 160) && Array.isArray(chat.members) && chat.members.length <= 100 &&
      chat.members.every(member => key(member, 'person')) && new Set(chat.members).size === chat.members.length;
    if (!record(value) || value.version !== 1 || !key(value.id, 'draft') || !key(value.revision, 'revision') ||
      !string(value.title, 160) || !Number.isFinite(value.updated) || !key(value.playerId, 'person') || !key(value.startChatId, 'chat') ||
      !collection(value.people, 100, person => record(person) && key(person.id, 'person') && string(person.name, 160) && image(person.avatar)) ||
      !collection(value.chats, 100, checkChat) || !collection(value.scenes, 150, checkScene)) {
      throw new Error('File có cấu trúc không hợp lệ hoặc vượt giới hạn của công cụ.');
    }
    const senders = new Set(value.people.map(person => person.id));
    const messageIds = value.scenes.flatMap(scene => scene.messages.map(message => message.id));
    if (new Set(messageIds).size !== messageIds.length ||
      value.chats.some(chat => chat.members.some(member => !senders.has(member)) ||
        (chat.type === 'direct' && chat.members.length > 2))) {
      throw new Error('File có nhân vật, cuộc chat hoặc tin nhắn không hợp lệ.');
    }
    const {errors} = validate(value);
    if (errors.length) throw new Error(errors[0].text);
    return value;
  }

  async function readProject(file) {
    if (file.size > maxFileBytes) throw new Error('File màn chơi lớn hơn 24 MB.');
    let value;
    try { value = JSON.parse(await file.text()); }
    catch { throw new Error('Không đọc được file JSON của màn chơi.'); }
    const draft = validateFile(value);
    const attachments = new Map();
    for (const person of draft.people) {
      if (person.avatar) attachments.set(person.avatar, 'Ảnh đại diện của “' + person.name + '”');
    }
    for (const scene of draft.scenes) {
      scene.messages.forEach((message, index) => {
        if (message.src) attachments.set(message.src, 'Ảnh tin ' + (index + 1) + ' trong cảnh “' + sceneName(scene) + '”');
      });
    }
    for (const [source, label] of attachments) await checkImage(source, label);
    return draft;
  }

  function checkImage(source, label) {
    return new Promise((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => {
        if (preview.naturalWidth * preview.naturalHeight > 24_000_000) {
          reject(new Error(label + ' có kích thước quá lớn. Hãy chọn ảnh nhỏ hơn.'));
        } else resolve(source);
      };
      preview.onerror = () => reject(new Error(label + ' không mở được.'));
      preview.src = source;
    });
  }

  function readImage(file) {
    if (!imageTypes.includes(file.type)) throw new Error('Hãy chọn ảnh PNG, JPG, WebP hoặc GIF.');
    if (file.size > maxImageBytes) throw new Error('Ảnh cần nhỏ hơn 2 MB.');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => checkImage(reader.result, 'Ảnh đã chọn').then(resolve, reject);
      reader.onerror = () => reject(new Error('Không đọc được ảnh đã chọn.'));
      reader.readAsDataURL(file);
    });
  }

  function openStore() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('lab-an-toan-so:creator', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts', {keyPath: 'id'});
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cơ sở dữ liệu đang bị khóa.'));
      request.onsuccess = () => {
        const database = request.result;
        const readAll = () => new Promise((done, fail) => {
          const query = database.transaction('drafts').objectStore('drafts').getAll();
          query.onsuccess = () => done(query.result);
          query.onerror = () => fail(query.error);
        });
        const save = draft => new Promise((done, fail) => {
          const transaction = database.transaction('drafts', 'readwrite');
          transaction.oncomplete = () => done();
          transaction.onabort = () => fail(transaction.error);
          transaction.objectStore('drafts').put(draft);
        });
        resolve({readAll, save});
      };
    });
  }

  window.creatorProject = {id, escape, initials, get, newMessage, newScene, newDraft, chatName, sceneName,
    startIndex, validate, validateFile, toStory, readProject, readImage, openStore, acceptImage, maxFileBytes};
})();
