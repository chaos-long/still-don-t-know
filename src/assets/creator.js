(() => {
  const model = window.creatorProject;
  const view = window.creatorView;
  const byId = key => document.getElementById(key);
  const app = byId('creator-app');
  const library = byId('creator-library');
  const editor = byId('creator-editor');
  const outline = byId('cr-outline');
  const compose = byId('cr-compose');
  const preview = byId('creator-preview');
  const player = byId('creator-player');
  const manager = byId('creator-manager');
  const managerBody = byId('creator-manager-body');
  const title = editor.querySelector('[data-field="title"]');
  const saveStatus = byId('creator-save');
  const importInput = byId('creator-import');
  const grid = editor.querySelector('.cr-grid');
  const timing = new Set();
  const drafts = new Map();
  const saves = new Map();

  let database;
  let draft;
  let sceneId;
  let managerKind;
  let pendingRemoval;
  let cleanupPreview;
  let cleanupPlay;
  let showErrors = false;
  let issues = [];
  let dragged;
  let dropHighlight;

  const currentScene = () => draft && model.get(draft.scenes, sceneId);
  const editField = (root, kind, field) => root?.querySelector(`[data-edit="${kind}"][data-field="${field}"]`);
  const focus = control => {
    if (!control) return;
    control.focus();
    control.scrollIntoView({block: 'nearest', behavior: 'instant'});
  };
  const within = (kind, id, root = compose) => root.querySelector(`[data-${kind}="${CSS.escape(id)}"]`);

  function notice(text = '', isError = false) {
    const region = byId(manager.open ? 'creator-manager-notice' : 'creator-notice');
    region.textContent = text;
    region.hidden = !text;
    region.classList.toggle('has-error', isError);
  }

  function updateSave(status) {
    if (!draft) return;
    const state = status || saves.get(draft.id) || 'saved';
    saveStatus.dataset.state = state;
    saveStatus.textContent = {
      pending: 'Đang lưu…', saved: 'Đã lưu trên thiết bị này',
      quota: 'Không lưu được: thiết bị đã hết dung lượng', error: 'Không lưu được bản nháp trên thiết bị này',
    }[state];
  }

  async function save(project) {
    const revision = model.id('revision');
    project.revision = revision;
    project.updated = Date.now();
    saves.set(project.id, 'pending');
    if (project === draft) updateSave();
    let status = 'saved';
    try {
      if (!database) throw new Error('Không mở được bộ nhớ.');
      await database.save(project);
    } catch (error) { status = error?.name === 'QuotaExceededError' ? 'quota' : 'error'; }
    if (project.revision === revision) {
      saves.set(project.id, status);
      if (project === draft) updateSave();
    }
    return status === 'saved';
  }

  function updateUrl() {
    const url = new URL(location.href);
    if (draft) {
      url.searchParams.set('draft', draft.id);
      if (sceneId) url.searchParams.set('scene', sceneId);
      else url.searchParams.delete('scene');
    } else {
      url.searchParams.delete('draft');
      url.searchParams.delete('scene');
    }
    history.replaceState(null, '', url);
  }

  function drawLibrary() {
    byId('creator-drafts').innerHTML = view.library([...drafts.values()].sort((a, b) => b.updated - a.updated));
  }

  function drawIssues() {
    const result = model.validate(draft);
    if (!showErrors) result.errors = [];
    issues = [...result.errors, ...result.warnings];
    byId('creator-issues').innerHTML = view.issues(result);
  }

  function drawPreview(play = false) {
    cleanupPreview?.();
    cleanupPreview = undefined;
    const scene = currentScene();
    app.querySelector('[data-action="test-scene"]').disabled = !scene || !scene.messages.length;
    if (!scene) {
      preview.innerHTML = '<p class="cr-empty">Chọn một cảnh để xem trước.</p>';
      return;
    }
    cleanupPreview = window.mountStoryPlayer(preview, model.toStory(draft, scene),
      {inline: true, snapshot: !play, saveProgress: false});
    preview.classList.toggle('is-paced', play);
  }

  function drawEditor({resetScroll = false} = {}) {
    outline.innerHTML = view.outline(draft, sceneId);
    compose.innerHTML = view.compose(draft, currentScene(), timing);
    if (resetScroll) compose.scrollTop = 0;
    drawIssues();
    drawPreview();
  }

  function setTab(tab, moveFocus = false) {
    grid.dataset.tab = tab;
    const narrow = matchMedia('(max-width: 920px)').matches;
    for (const control of editor.querySelectorAll('[role="tab"]')) {
      const active = control.dataset.id === tab;
      control.setAttribute('aria-selected', String(active));
      control.tabIndex = active ? 0 : -1;
      const panel = byId(control.getAttribute('aria-controls'));
      if (narrow) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', control.id);
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
      }
      if (active && moveFocus) control.focus();
    }
  }

  function openEditor(project, target) {
    draft = project;
    sceneId = model.get(project.scenes, target)?.id || project.scenes[0]?.id;
    showErrors = false;
    timing.clear();
    notice();
    library.hidden = true;
    editor.hidden = false;
    title.value = draft.title;
    updateSave();
    updateUrl();
    setTab('compose');
    drawEditor({resetScroll: true});
  }

  function openLibrary() {
    cleanupPreview?.();
    cleanupPreview = undefined;
    draft = undefined;
    sceneId = undefined;
    editor.hidden = true;
    library.hidden = false;
    updateUrl();
    drawLibrary();
    notice();
  }

  function selectScene(key) {
    if (!model.get(draft.scenes, key)) return;
    sceneId = key;
    updateUrl();
    setTab('compose');
    drawEditor({resetScroll: true});
  }

  function changed({outline: refreshOutline, compose: refreshCompose, manager: refreshManager} = {}) {
    save(draft);
    if (refreshOutline) outline.innerHTML = view.outline(draft, sceneId);
    if (refreshCompose) compose.innerHTML = view.compose(draft, currentScene(), timing);
    if (refreshManager && manager.open) drawManager();
    drawIssues();
    drawPreview();
  }

  function drawManager() {
    managerBody.innerHTML = managerKind === 'people' ? view.people(draft, pendingRemoval) : view.chats(draft);
  }

  function openManager(kind) {
    managerKind = kind;
    pendingRemoval = undefined;
    byId('creator-manager-title').textContent = kind === 'people' ? 'Nhân vật' : 'Cuộc trò chuyện';
    drawManager();
    if (!manager.open) manager.showModal();
    notice();
  }

  function changeRole(key) {
    draft.playerId = key;
    for (const chat of draft.chats) {
      if (!chat.members.includes(key)) chat.members.unshift(key);
      if (chat.members.length > 2) {
        chat.type = 'group';
        chat.name ||= 'Chat nhóm';
      }
    }
  }

  function onEdit(control) {
    const {edit, id, field} = control.dataset;
    const value = control.type === 'checkbox' ? control.checked : control.value;
    const scene = currentScene();
    if (edit === 'draft') {
      if (field === 'title') draft.title = value;
      if (field === 'opening') draft.startChatId = value;
      if (field === 'player') {
        changeRole(value);
        changed({outline: true, compose: true, manager: true});
        focus(editField(managerBody, 'draft', 'player'));
        return;
      }
      changed({outline: field === 'opening'});
    }

    if (edit === 'scene') {
      if (field === 'chat') scene.chatId = value;
      else scene[field] = value;
      changed({outline: true, compose: field === 'chat'});
      if (field === 'chat') focus(editField(compose, 'scene', 'chat'));
    }

    if (edit === 'message') {
      const message = model.get(scene.messages, id);
      if (field === 'delay') {
        if (value === '') return;
        message.delay = Math.max(0, Math.min(30000, Math.round(Number(value) * 1000)));
        control.closest('details').querySelector('[data-delay-label]').textContent = view.formatDelay(message.delay) + ' giây';
      } else message[field] = value;
      changed({compose: field === 'type'});
      if (field === 'type') focus(editField(within('message', id), 'message', 'type'));
    }

    if (edit === 'after') {
      const after = scene.after;
      if (field === 'after') after.mode = value;
      if (field === 'end-title') after.title = value;
      if (field === 'end-body') after.body = value;
      changed({compose: field === 'after'});
      if (field === 'after') focus(editField(compose, 'after', 'after'));
    }

    if (edit === 'choice') {
      model.get(scene.after.choices, id)[field] = value;
      changed({compose: field === 'target'});
      if (field === 'target') focus(editField(within('choice', id), 'choice', 'target'));
    }

    if (edit === 'person') {
      const person = model.get(draft.people, id);
      person.name = value;
      const card = within('person', person.id, managerBody);
      const badge = card.querySelector('[data-initials]');
      if (badge) badge.textContent = model.initials(person.name);
      const role = editField(managerBody, 'draft', 'player');
      const personOption = [...role.options].find(option => option.value === person.id);
      personOption.textContent = person.name || 'Chưa đặt tên';
      changed({outline: true, compose: true});
    }

    if (edit === 'chat') {
      const chat = model.get(draft.chats, id);
      if (field === 'type') {
        chat.type = value;
        if (value === 'direct') chat.members = [draft.playerId, ...chat.members.filter(key => key !== draft.playerId).slice(0, 1)];
        else chat.name ||= 'Chat nhóm';
      }
      if (field === 'peer') chat.members = value ? [draft.playerId, value] : [draft.playerId];
      if (field === 'member') chat.members = value ? [...new Set([...chat.members, control.value])] : chat.members.filter(key => key !== control.value);
      if (field === 'name') {
        chat.name = value;
        const updatedName = model.chatName(draft, chat);
        within('chat', chat.id, managerBody).querySelector('h3').textContent = updatedName;
        const opening = editField(managerBody, 'draft', 'opening');
        [...opening.options].find(option => option.value === chat.id).textContent = updatedName;
      }
      changed({outline: true, compose: true, manager: field === 'type'});
      if (field === 'type') focus(editField(within('chat', chat.id, managerBody), 'chat', 'type'));
    }
  }

  async function changeImage(control) {
    const file = control.files?.[0];
    if (!file) return;
    const {edit, id} = control.dataset;
    const project = draft;
    const scene = currentScene();
    try {
      const image = await model.readImage(file);
      const record = edit === 'person' ? model.get(project.people, id) :
        project.scenes.includes(scene) && model.get(scene.messages, id);
      if (!record) return;
      record[edit === 'person' ? 'avatar' : 'src'] = image;
      if (project !== draft) {
        save(project);
      } else {
        notice();
        changed({compose: scene === currentScene(), manager: edit === 'person'});
      }
    } catch (error) {
      if (project === draft) notice(error.message, true);
    } finally { control.value = ''; }
  }

  function appendScene() {
    const scene = model.newScene(currentScene()?.chatId || draft.startChatId, draft.scenes.length + 1);
    draft.scenes.push(scene);
    selectScene(scene.id);
    save(draft);
    const name = editField(compose, 'scene', 'name');
    focus(name);
    name.select();
  }

  function removeScene() {
    const scene = currentScene();
    if (!scene || !confirm('Xóa cảnh “' + model.sceneName(scene) + '”?')) return;
    const index = draft.scenes.indexOf(scene);
    draft.scenes.splice(index, 1);
    sceneId = draft.scenes[Math.min(index, draft.scenes.length - 1)]?.id;
    updateUrl();
    drawEditor({resetScroll: true});
    save(draft);
  }

  function addMessage(afterId, duplicate = false) {
    const scene = currentScene();
    const index = scene.messages.findIndex(message => message.id === afterId);
    const chat = model.get(draft.chats, scene.chatId);
    const sender = scene.messages[index]?.sender || chat?.members[0] || '';
    const message = duplicate ? {...scene.messages[index], id: model.id('message')} : model.newMessage(sender);
    scene.messages.splice(index >= 0 ? index + 1 : scene.messages.length, 0, message);
    changed({compose: true});
    const item = within('message', message.id);
    focus(item.querySelector('textarea, input[type="file"]') || editField(item, 'message', 'sender'));
  }

  function addPerson() {
    const person = {id: model.id('person'), name: 'Nhân vật ' + (draft.people.length + 1), avatar: ''};
    draft.people.push(person);
    changed({manager: true, compose: true});
    const name = editField(within('person', person.id, managerBody), 'person', 'name');
    focus(name);
    name.select();
  }

  function removePerson(key) {
    const scenes = draft.scenes.filter(scene => scene.messages.some(message => message.sender === key));
    pendingRemoval = {id: key, scenes, requires: scenes.length > 0 || draft.playerId === key};
    drawManager();
    const person = within('person', key, managerBody);
    focus(person.querySelector('[data-replacement], [data-action="confirm-person"]'));
  }

  function confirmPerson(key) {
    if (draft.people.length < 2 || pendingRemoval?.id !== key) return;
    const replacement = managerBody.querySelector('[data-replacement]')?.value;
    if (pendingRemoval.requires && !replacement) {
      notice('Hãy chọn người thay thế hoặc bấm Hủy.', true);
      focus(managerBody.querySelector('[data-replacement]'));
      return;
    }
    if (draft.playerId === key) draft.playerId = replacement;
    draft.people = draft.people.filter(person => person.id !== key);
    for (const chat of draft.chats) {
      chat.members = [...new Set(chat.members.map(member => member === key ? replacement : member).filter(Boolean))];
      if (!chat.members.includes(draft.playerId)) chat.members.unshift(draft.playerId);
    }
    for (const scene of pendingRemoval.scenes) {
      const chat = model.get(draft.chats, scene.chatId);
      for (const message of scene.messages) {
        if (message.sender === key) message.sender = replacement;
      }
      if (chat && !chat.members.includes(replacement)) chat.members.push(replacement);
    }
    for (const chat of draft.chats) {
      if (chat.type === 'direct' && chat.members.length > 2) {
        chat.type = 'group';
        chat.name ||= 'Chat nhóm';
      }
    }
    pendingRemoval = undefined;
    notice();
    changed({outline: true, compose: true, manager: true});
  }

  function addChat(kind) {
    const group = kind === 'group';
    const chat = {id: model.id('chat'), type: kind, name: group ? 'Chat nhóm' : '', members: [draft.playerId]};
    draft.chats.push(chat);
    changed({manager: true, compose: true});
    const control = editField(within('chat', chat.id, managerBody), 'chat', group ? 'name' : 'peer');
    focus(control);
    if (group) control.select();
  }

  function sortable(kind) {
    if (kind === 'scene') return draft.scenes;
    if (kind === 'message') return currentScene().messages;
    return draft.people;
  }

  function move(kind, key, index, step) {
    const entries = sortable(kind);
    const from = entries.findIndex(item => item.id === key);
    const to = step ? from + Number(step) : index;
    if (from < 0 || to < 0 || to >= entries.length || from === to) return;
    const [item] = entries.splice(from, 1);
    entries.splice(to, 0, item);
    changed({outline: kind !== 'message', compose: kind !== 'person', manager: kind === 'person'});
    if (kind === 'person') compose.innerHTML = view.compose(draft, currentScene(), timing);
    if (step) {
      const region = kind === 'scene' ? outline : kind === 'message' ? compose : managerBody;
      const node = within('sort-id', key, region);
      const controls = node.querySelectorAll('[data-action="move"]');
      focus([...controls].find(control => control.dataset.step === step && !control.disabled) ||
        [...controls].find(control => !control.disabled));
    }
  }

  function seeIssue(index) {
    const entry = issues[index];
    if (!entry) return;
    const place = entry.location;
    if (place.scene) {
      selectScene(place.scene);
      const area = place.message ? within('message', place.message) : place.choice ? within('choice', place.choice) : compose;
      const target = area?.querySelector(`[data-field="${place.field}"]`);
      focus(target || area?.querySelector('button, input, select, textarea'));
    } else if (place.field === 'title') focus(title);
    else {
      openManager(place.field);
      const area = place.person ? within('person', place.person, managerBody) :
        place.chat ? within('chat', place.chat, managerBody) : managerBody;
      focus(area?.querySelector('input, select, button'));
    }
  }

  function checkProject(project) {
    if (!model.validate(project).errors.length) return true;
    if (draft !== project) openEditor(project);
    showErrors = true;
    drawIssues();
    focus(byId('creator-issues').querySelector('button'));
    return false;
  }

  function clone(project) {
    const copy = structuredClone(project);
    copy.id = model.id('draft');
    return copy;
  }

  function newDraft(project) {
    drafts.set(project.id, project);
    openEditor(project);
    save(project);
    focus(title);
    title.select();
  }

  async function importDraft(file) {
    if (!file) return;
    const origin = draft;
    try {
      const project = clone(await model.readProject(file));
      const stored = await save(project);
      if (!stored) throw new Error('Không lưu được file đã nhập trên thiết bị này.');
      drafts.set(project.id, project);
      if (draft === origin) {
        openLibrary();
        notice('Đã nhập “' + project.title + '”. Bấm Chơi để bắt đầu.');
        focus(byId('creator-drafts').querySelector(`[data-action="play-draft"][data-id="${project.id}"]`));
      }
    } catch (error) { notice(error.message, true); }
    finally { importInput.value = ''; }
  }

  function exportDraft() {
    if (!checkProject(draft)) return;
    try {
      model.validateFile(draft);
      const file = new Blob([JSON.stringify(draft)], {type: 'application/json'});
      if (file.size > model.maxFileBytes) throw new Error('Màn lớn hơn 24 MB. Hãy bớt hoặc nén ảnh trước khi xuất.');
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = (draft.title.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 100) || 'man-choi') + '.lab.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice('Đã chuẩn bị file màn chơi. Người nhận có thể dùng Nhập màn để chơi.');
    } catch (error) { notice(error.message, true); }
  }

  function playDraft(project, test = false, trigger) {
    if (!checkProject(project)) return;
    notice();
    app.hidden = true;
    player.hidden = false;
    document.body.classList.add('creator-playing');
    cleanupPreview?.();
    cleanupPreview = undefined;
    const onExit = () => {
      cleanupPlay?.();
      cleanupPlay = undefined;
      player.hidden = true;
      document.body.classList.remove('creator-playing');
      app.hidden = false;
      if (draft) drawPreview();
      trigger?.focus({preventScroll: true});
    };
    cleanupPlay = window.mountStoryPlayer(player, model.toStory(project), {saveProgress: !test, onExit});
    player.querySelector('.sp-history')?.focus({preventScroll: true});
  }

  app.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const {action, id, kind, step, edit, field} = control.dataset;
    const project = drafts.get(id);
    const scene = currentScene();
    switch (action) {
      case 'new-draft': newDraft(model.newDraft()); break;
      case 'edit-draft': openEditor(project); focus(title); break;
      case 'duplicate-draft': {
        const copy = clone(project);
        copy.title = ('Bản sao của ' + copy.title).slice(0, 160);
        newDraft(copy);
        break;
      }
      case 'play-draft': playDraft(project, false, control); break;
      case 'library': openLibrary(); focus(library.querySelector('[data-action="new-draft"]')); break;
      case 'import': importInput.click(); break;
      case 'export': exportDraft(); break;
      case 'test': playDraft(draft, true, control); break;
      case 'test-scene': drawPreview(true); break;
      case 'tab': setTab(id); break;
      case 'scene':
      case 'jump-scene': selectScene(id); focus(editField(compose, 'scene', 'name')); break;
      case 'add-scene': appendScene(); break;
      case 'remove-scene': removeScene(); break;
      case 'move': move(kind, id, null, step); break;
      case 'add-message': addMessage(id); break;
      case 'duplicate-message': addMessage(id, true); break;
      case 'remove-message':
        scene.messages = scene.messages.filter(message => message.id !== id);
        changed({compose: true});
        focus(compose.querySelector('.cr-message-list + button'));
        break;
      case 'add-choice': {
        const key = model.id('choice');
        scene.after.choices.push({id: key, label: '', target: '', send: true});
        changed({compose: true});
        focus(editField(within('choice', key), 'choice', 'label'));
        break;
      }
      case 'remove-choice':
        scene.after.choices = scene.after.choices.filter(choice => choice.id !== id);
        changed({compose: true});
        focus(compose.querySelector('[data-action="add-choice"]'));
        break;
      case 'people':
      case 'chats': openManager(action); break;
      case 'close-manager': manager.close(); break;
      case 'add-person': addPerson(); break;
      case 'remove-person': removePerson(id); break;
      case 'confirm-person': confirmPerson(id); break;
      case 'cancel-person':
        pendingRemoval = undefined;
        notice();
        drawManager();
        break;
      case 'add-chat': addChat(kind); break;
      case 'clear-image': {
        const record = edit === 'person' ? model.get(draft.people, id) : model.get(scene.messages, id);
        record[field] = '';
        changed({compose: edit === 'message', manager: edit === 'person'});
        break;
      }
      case 'issue': seeIssue(Number(id)); break;
    }
  });

  app.addEventListener('input', event => {
    const control = event.target;
    if (control.dataset.edit && control.matches('textarea, input:not([type="checkbox"]):not([type="file"])')) onEdit(control);
  });
  app.addEventListener('change', event => {
    const control = event.target;
    if (control === importInput) importDraft(control.files?.[0]);
    else if (control.dataset.edit && control.matches('input[type="file"]')) changeImage(control);
    else if (control.dataset.edit && control.matches('select, input[type="checkbox"]')) onEdit(control);
  });
  compose.addEventListener('toggle', event => {
    const details = event.target;
    if (!details.dataset.timing || !details.isConnected) return;
    if (details.open) timing.add(details.dataset.timing);
    else timing.delete(details.dataset.timing);
  }, true);
  manager.addEventListener('close', () => {
    if (!manager.open) {
      pendingRemoval = undefined;
      byId('creator-manager-notice').hidden = true;
    }
  });

  editor.querySelector('.cr-tabs').addEventListener('keydown', event => {
    const tabs = ['outline', 'compose', 'preview'];
    const index = tabs.indexOf(grid.dataset.tab);
    const next = {ArrowLeft: (index + 2) % 3, ArrowRight: (index + 1) % 3, Home: 0, End: 2}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setTab(tabs[next], true);
  });
  matchMedia('(max-width: 920px)').addEventListener('change', () => setTab(grid.dataset.tab));

  app.addEventListener('dragstart', event => {
    const handle = event.target.closest('[data-drag]');
    if (!handle) return;
    dragged = {kind: handle.dataset.kind, id: handle.dataset.id};
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragged.id);
  });
  function dropTarget(event) {
    const target = event.target.closest('[data-sort-kind]');
    if (!dragged || !target || target.dataset.sortKind !== dragged.kind) return;
    if (target.dataset.sortId === dragged.id) {
      dropHighlight?.classList.remove('is-drop-before', 'is-drop-after');
      return;
    }
    return target;
  }
  function dropAfter(event, target) {
    const box = target.getBoundingClientRect();
    return event.clientY > box.top + box.height / 2;
  }
  function clearDrop() {
    dropHighlight?.classList.remove('is-drop-before', 'is-drop-after');
    dropHighlight = undefined;
  }
  app.addEventListener('dragover', event => {
    const target = dropTarget(event);
    if (!target) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearDrop();
    dropHighlight = target;
    target.classList.add(dropAfter(event, target) ? 'is-drop-after' : 'is-drop-before');
  });
  app.addEventListener('drop', event => {
    const target = dropTarget(event);
    if (!target) return;
    event.preventDefault();
    const {kind, id} = dragged;
    const entries = sortable(kind);
    const pivot = entries.findIndex(entry => entry.id === target.dataset.sortId);
    const source = entries.findIndex(entry => entry.id === id);
    const destination = pivot + Number(dropAfter(event, target)) - Number(source < pivot);
    clearDrop();
    dragged = undefined;
    move(kind, id, destination);
  });
  app.addEventListener('dragend', () => { clearDrop(); dragged = undefined; });

  async function start() {
    try {
      database = await model.openStore();
      for (const project of await database.readAll()) drafts.set(project.id, project);
    } catch {
      notice('Không mở được bộ nhớ bản nháp. Bạn vẫn có thể soạn và xuất file trong phiên này.', true);
    }
    for (const button of library.querySelectorAll('button[disabled]')) button.disabled = false;
    const params = new URLSearchParams(location.search);
    const project = drafts.get(params.get('draft'));
    if (project) openEditor(project, params.get('scene'));
    else drawLibrary();
  }
  start();
})();
