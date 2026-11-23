const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs/promises');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const worktree = path.join(__dirname, '..');
let server, driver, scratch, prefix, base, session;

async function freePort() {
  const listener = net.createServer();
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolve);
  });
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  return port;
}

async function until(check, description) {
  for (let attempt = 0; attempt < 90; attempt++) {
    try { if (await check()) return; } catch {}
    await wait(100);
  }
  throw new Error('Hết thời gian chờ: ' + description);
}

async function request(method, endpoint, body) {
  const response = await fetch(prefix + endpoint, {
    method, headers: {'Content-Type': 'application/json'}, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const {value} = await response.json();
  if (!response.ok || value?.error) throw new Error(method + ' ' + endpoint + ': ' + JSON.stringify(value));
  return value;
}

const command = (method, endpoint, body) => request(method, '/session/' + session + endpoint, body);
const js = (script, ...args) => command('POST', '/execute/sync', {script, args});
const show = selector => js('const e = document.querySelector(arguments[0]); return Boolean(e?.getClientRects().length)', selector);
const text = selector => js('return document.querySelector(arguments[0])?.innerText ?? ""', selector);
const value = selector => js('return document.querySelector(arguments[0])?.value ?? ""', selector);

async function element(selector) {
  return (await command('POST', '/element', {using: 'css selector', value: selector}))['element-6066-11e4-a52e-4f735466cecf'];
}

async function click(selector) {
  await until(() => show(selector), selector);
  await js('document.querySelector(arguments[0]).scrollIntoView({block: "center", behavior: "instant"})', selector);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await command('POST', '/element/' + await element(selector) + '/click', {});
      return;
    } catch (error) {
      if (attempt === 2 || !error.message.includes('stale element reference')) {
        throw new Error('Không bấm được ' + selector, {cause: error});
      }
    }
  }
}

async function fill(selector, nextValue) {
  await click(selector);
  const target = '/element/' + await element(selector);
  await command('POST', target + '/clear', {});
  await command('POST', target + '/value', {text: nextValue});
}

async function select(selector, nextValue) {
  const selected = await js(`
    const element = document.querySelector(arguments[0]);
    const match = [...element.options].find(option => option.value === arguments[1] || option.textContent.trim() === arguments[1]);
    if (!match) return false;
    element.value = match.value;
    element.dispatchEvent(new Event('change', {bubbles: true}));
    return true;
  `, selector, nextValue);
  assert.equal(selected, true, 'Lựa chọn ' + nextValue + ' trong ' + selector);
}

async function upload(selector, filename) {
  await command('POST', '/element/' + await element(selector) + '/value', {text: filename});
}

async function navigate(route) {
  await command('POST', '/url', {url: base + route});
  await until(() => js('return document.readyState === "complete"'), route);
}

async function launch(profile) {
  const options = {
    args: ['--headless=new', '--disable-dev-shm-usage', '--window-size=1440,1420', '--user-data-dir=' + profile,
      ...(process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : [])],
    prefs: {'download.default_directory': scratch, 'download.prompt_for_download': false},
  };
  if (process.env.CHROME_BINARY) options.binary = process.env.CHROME_BINARY;
  const result = await request('POST', '/session', {capabilities: {
    alwaysMatch: {browserName: 'chrome', 'goog:chromeOptions': options},
  }});
  session = result.sessionId;
}

const field = (type, name) => `[data-edit="${type}"][data-field="${name}"]`;
const action = key => `[data-action="${key}"]`;
const message = number => `.cr-message:nth-child(${number})`;
const chat = number => `.cr-manager-item:nth-of-type(${number})`;
const play = '#creator-player';
const preview = '#creator-preview';

async function dragMessage() {
  const points = await js(`
    window.scrollTo({top: 0, behavior: 'instant'});
    document.querySelector('#cr-compose').scrollTop = 0;
    const bottom = document.querySelector('.cr-message:nth-child(3) [data-drag]');
    const top = document.querySelector('.cr-message:first-child');
    const start = bottom.getBoundingClientRect();
    const finish = top.getBoundingClientRect();
    return [start.left + start.width / 2, start.top + start.height / 2, finish.left + 55, finish.top + 30]
      .map(Math.round);
  `);
  const [x, y, toX, toY] = points;
  assert.ok(toY >= 0 && y <= 1400, 'Cần thấy vị trí kéo và vị trí thả: ' + points);
  await command('POST', '/actions', {actions: [{
    type: 'pointer', id: 'mouse', parameters: {pointerType: 'mouse'},
    actions: [
      {type: 'pointerMove', duration: 0, x, y},
      {type: 'pointerDown', button: 0},
      {type: 'pointerMove', duration: 150, x: x - 15, y: y - 15},
      {type: 'pointerMove', duration: 500, x: toX, y: toY},
      {type: 'pointerMove', duration: 150, x: toX + 6, y: toY + 4},
      {type: 'pause', duration: 180},
      {type: 'pointerUp', button: 0},
    ],
  }]});
  await command('DELETE', '/actions');
}

async function waitSaved() {
  await until(async () => (await text('#creator-save')).includes('Đã lưu trên thiết bị này'), 'bản nháp đã lưu');
}

async function setEnding(heading, explanation) {
  await select(field('after', 'after'), 'end');
  await fill(field('after', 'end-title'), heading);
  await fill(field('after', 'end-body'), explanation);
}

async function setDelay(number, seconds) {
  const row = message(number);
  await click(row + ' summary');
  await js(`
    const element = document.querySelector(arguments[0]);
    element.value = arguments[1];
    element.dispatchEvent(new Event('input', {bubbles: true}));
  `, row + ' ' + field('message', 'delay'), seconds);
  await click(row + ' summary');
}

async function pickScene(number) {
  await click(`.cr-scene-row:nth-child(${number}) ` + action('scene'));
}

async function playBranch(option, heading, peer, sent, switching = '[data-sp="open"].sp-row.active') {
  await until(() => show(play + ' [data-option="' + option + '"]'), 'lựa chọn trong trình phát');
  const open = (await js('return [...document.querySelectorAll("#creator-player [data-sp=choose]")].find(e => e.dataset.option === arguments[0]).textContent', option));
  await click(play + ' [data-option="' + option + '"]');
  assert.equal((await text(play + ' .sp-history')).includes(open), sent);
  await until(() => show(play + ' .sp-next-chat [data-sp="open"]'), 'thông báo chat khác');
  assert.match(await text(play + ' .sp-next-chat'), new RegExp(peer));
  await click(play + ' .sp-next-chat [data-sp="open"]');
  await until(async () => (await text(play + ' .sp-end strong')) === heading, heading);
  assert.match(await text(play + ' .sp-header-copy'), new RegExp(peer));
  assert.equal(await show(play + ' ' + switching), true);
}

(async () => {
  scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'lab-creator-browser-'));
  const [serverPort, driverPort] = await Promise.all([freePort(), freePort()]);
  base = 'http://127.0.0.1:' + serverPort + '/';
  prefix = 'http://127.0.0.1:' + driverPort;
  server = spawn(process.execPath, ['scripts/serve.js'], {
    cwd: worktree, env: {...process.env, HOST: '127.0.0.1', PORT: String(serverPort)}, stdio: 'ignore',
  });
  driver = spawn(process.env.CHROMEDRIVER || 'chromedriver', ['--port=' + driverPort], {stdio: 'ignore'});
  let driverError;
  driver.on('error', error => { driverError = error; });
  await until(async () => !driverError && (await request('GET', '/status')).ready && (await fetch(base)).ok, 'ChromeDriver và máy chủ');
  await launch(path.join(scratch, 'author'));
  const imageFile = path.join(scratch, 'attachment.png');
  await fs.writeFile(imageFile, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kvX8AAAAASUVORK5CYII=', 'base64'));

  await navigate('practice.html');
  await click('a[href="creator.html"]');
  await until(() => js('return !document.querySelector("[data-action=new-draft]").disabled'), 'Màn của tôi');
  await click(action('new-draft'));
  await fill(field('draft', 'title'), 'Kiểm tra thông tin');
  await click(action('test'));
  assert.match(await text('#creator-issues'), /nằm cuối dàn cảnh/);
  await click('#creator-issues ' + action('issue'));
  assert.equal(await js('return document.activeElement.dataset.field'), 'after');

  await click(action('people'));
  await click(action('add-person'));
  await fill('.cr-manager-item:last-of-type ' + field('person', 'name'), 'Vy');
  await click(action('add-person'));
  await fill('.cr-manager-item:last-of-type ' + field('person', 'name'), 'Minh');
  await upload('.cr-manager-item:nth-of-type(2) input[type="file"]', imageFile);
  await until(() => show('.cr-manager-item:nth-of-type(2) img.cr-avatar'), 'ảnh đại diện');
  await click(action('close-manager'));
  await click(action('chats'));
  await select(chat(1) + ' ' + field('chat', 'peer'), 'Vy');
  await click('[data-action="add-chat"][data-kind="direct"]');
  await select(chat(2) + ' ' + field('chat', 'peer'), 'Minh');
  await click('[data-action="add-chat"][data-kind="group"]');
  await fill(chat(3) + ' ' + field('chat', 'name'), 'Nhóm sân khấu');
  for (let index = 1; index <= 2; index++) await click(chat(3) + ' .cr-members label:nth-child(' + (index + 1) + ') input');
  await select(field('draft', 'opening'), 'Nhóm sân khấu');
  await click(action('close-manager'));

  await fill(field('scene', 'name'), 'Trong nhóm lớp');
  await select(field('scene', 'chat'), 'Nhóm sân khấu');
  await js(`
    const input = document.querySelector('[data-field=time]');
    input.value = '15:42'; input.dispatchEvent(new Event('input', {bubbles: true}));
  `);
  const line1 = 'Vy nhắc cả nhóm.';
  const line2 = 'Kiểm tra lại thông tin nhé.';
  const line3 = 'Sắp đến giờ rồi.';
  for (const [index, [line, sender]] of [[line1, 'Vy'], [line2, 'Minh'], [line3, 'Bạn']].entries()) {
    const row = message(index + 1);
    await click('.cr-message-list + ' + action('add-message'));
    assert.equal(await js('return document.activeElement.dataset.field'), 'text');
    await fill(row + ' ' + field('message', 'text'), line);
    await select(row + ' ' + field('message', 'sender'), sender);
    await setDelay(index + 1, index === 2 ? '0.6' : '0.02');
  }
  await dragMessage();
  const bubbles = () => js('return [...document.querySelectorAll("#creator-preview .sp-bubble")].map(e => e.textContent)');
  assert.deepEqual(await bubbles(), [line3, line1, line2]);
  assert.match(await text(preview + ' .sp-message:last-of-type') || await text(preview), /Minh/);
  assert.equal(await text(preview + ' .sp-time-label'), '15:42');
  await click(action('test-scene'));
  assert.deepEqual(await bubbles(), []);
  await until(async () => (await bubbles()).length === 3, 'ba bong bóng phát theo nhịp');
  assert.deepEqual(await bubbles(), [line3, line1, line2]);
  console.log('PASS Tạo nhân vật và chat, kéo tin lên đầu, cập nhật người gửi và phát thử cảnh');

  await click(action('add-scene'));
  await fill(field('scene', 'name'), 'Hỏi Vy');
  await select(field('scene', 'chat'), 'Vy');
  await click('.cr-message-list + ' + action('add-message'));
  await fill(field('message', 'text'), 'Mình sẽ hỏi lại trước khi trả lời.');
  await select(field('message', 'sender'), 'Vy');
  await setDelay(1, '0');
  await setEnding('Kết quả A', 'Bạn đã kiểm tra thông tin với Vy.');

  await click(action('add-scene'));
  await fill(field('scene', 'name'), 'Hỏi Minh');
  await select(field('scene', 'chat'), 'Minh');
  await click('.cr-message-list + ' + action('add-message'));
  await select(field('message', 'type'), 'image');
  await select(field('message', 'sender'), 'Minh');
  await upload(field('message', 'src'), imageFile);
  await until(() => show('.cr-thumbnail'), 'ảnh thu nhỏ trong editor');
  await fill(field('message', 'alt'), 'Ảnh đính kèm đã xuất');
  await setDelay(1, '0');
  await setEnding('Kết quả B', 'Bạn đã đọc thông tin trong cuộc chat riêng.');

  await pickScene(1);
  await select(field('after', 'after'), 'choice');
  for (const [index, [label, name]] of [['Nhắn Vy', 'Hỏi Vy'], ['Xem chat riêng', 'Hỏi Minh']].entries()) {
    await click(action('add-choice'));
    const row = '.cr-choice:nth-last-of-type(1)';
    await fill(row + ' ' + field('choice', 'label'), label);
    const destination = await js('return [...document.querySelectorAll("[data-field=target]")].at(-1).options[' + (index + 2) + '].value');
    await select(row + ' ' + field('choice', 'target'), destination);
    assert.match(await text(row + ' .cr-note'), new RegExp(name));
  }
  await click('.cr-choice:nth-last-of-type(1) ' + field('choice', 'send'));
  await click('.cr-choice:nth-last-of-type(1) ' + action('jump-scene'));
  assert.equal(await value(field('scene', 'name')), 'Hỏi Minh');
  await click('.cr-scene-row:nth-child(3) [data-action="move"][data-step="-1"]');
  await click(action('people'));
  await fill('.cr-manager-item:nth-of-type(3) ' + field('person', 'name'), 'Nam');
  await click('.cr-manager-item:nth-of-type(3) ' + action('remove-person'));
  assert.match(await text('.cr-removal'), /Trong nhóm lớp, Hỏi Minh/);
  await click(action('cancel-person'));
  await click(action('close-manager'));
  assert.equal(await value(field('scene', 'name')), 'Hỏi Minh');
  assert.match(await text(preview + ' .sp-header-copy'), /Nam/);
  const optionIds = await js('return [...document.querySelectorAll("[data-edit=choice][data-field=target]")].map(e => e.value)');
  assert.equal(optionIds.length, 0);

  await click(action('test'));
  const [optionA, optionB] = await (async () => {
    await until(() => show(play + ' [data-sp="choose"]'), 'hai lựa chọn');
    assert.match(await text(play + ' .sp-history'), /Nam/);
    return js('return [...document.querySelectorAll("#creator-player [data-sp=choose]")].map(e => e.dataset.option)');
  })();
  await playBranch(optionA, 'Kết quả A', 'Vy', true);
  assert.equal(await show(play + ' .sp-header img.sp-avatar'), true);
  await click(play + ' .sp-exit');
  assert.equal(await value(field('scene', 'name')), 'Hỏi Minh');
  await click(action('test'));
  await playBranch(optionB, 'Kết quả B', 'Nam', false);
  await click(play + ' .sp-image-button');
  assert.equal(await show(play + ' .sp-dialog[open] img'), true);
  await click(play + ' .sp-dialog [data-sp="close"]');
  await click(play + ' .sp-row:first-child');
  assert.match(await text(play + ' .sp-history'), /Kiểm tra lại thông tin nhé/);
  assert.doesNotMatch(await text(play + ' .sp-history'), /Xem chat riêng/);
  await click(play + ' .sp-exit');
  console.log('PASS Hai nhánh khác chat, đổi tên nhân vật, dời cảnh đích, ảnh và lịch sử chat');

  await pickScene(1);
  await fill(message(1) + ' ' + field('message', 'text'), 'Câu đã lưu sau khi sửa.');
  await waitSaved();
  await command('POST', '/refresh', {});
  await until(() => show(message(1) + ' textarea'), 'mở lại cảnh sau tải lại');
  assert.equal(await value(message(1) + ' textarea'), 'Câu đã lưu sau khi sửa.');
  assert.equal(await value(field('scene', 'name')), 'Trong nhóm lớp');

  await command('POST', '/goog/cdp/execute', {cmd: 'Emulation.setDeviceMetricsOverride', params: {
    width: 390, height: 850, mobile: true, deviceScaleFactor: 1,
  }});
  await click('#cr-tab-outline');
  await click('#cr-tab-preview');
  assert.match(await text(preview), /Câu đã lưu/);
  await click('#cr-tab-compose');
  assert.equal(await value(field('scene', 'name')), 'Trong nhóm lớp');
  assert.equal(await js('return document.documentElement.scrollWidth === innerWidth'), true);
  await command('POST', '/goog/cdp/execute', {cmd: 'Emulation.clearDeviceMetricsOverride', params: {}});
  await click(action('export'));
  let exported;
  await until(async () => {
    exported = (await fs.readdir(scratch)).find(filename => filename.endsWith('.lab.json'));
    return Boolean(exported);
  }, 'file xuất');
  const transfer = path.join(scratch, exported);
  await command('DELETE', '');
  session = undefined;
  await launch(path.join(scratch, 'recipient'));
  await navigate('creator.html');
  await until(() => js('return !document.querySelector("[data-action=import]").disabled'), 'thư viện người nhận');
  await upload('#creator-import', transfer);
  await until(() => show(action('play-draft')), 'màn đã nhập hiện trong thư viện');
  assert.match(await text('#creator-drafts'), /Kiểm tra thông tin/);
  const invalid = path.join(scratch, 'invalid.json');
  await fs.writeFile(invalid, '{"version":1,"title":"Lỗi"}');
  await upload('#creator-import', invalid);
  await until(async () => (await text('#creator-notice')).includes('không hợp lệ'), 'file lỗi bị từ chối');
  assert.equal(await js('return document.querySelectorAll(".cr-library-card").length'), 1);

  await click(action('play-draft'));
  await playBranch(optionB, 'Kết quả B', 'Nam', false);
  assert.equal(await js(`return document.querySelector('#creator-player .sp-image-button img').naturalWidth`), 1);
  await click(play + ' .sp-exit');
  await click(action('edit-draft'));
  await click(action('test'));
  await playBranch(optionA, 'Kết quả A', 'Vy', true);
  await click(play + ' .sp-exit');
  await click(action('library'));
  await click(action('play-draft'));
  assert.equal(await text(play + ' .sp-end strong'), 'Kết quả B');
  await click(play + ' .sp-exit');
  await click(action('duplicate-draft'));
  assert.match(await value(field('draft', 'title')), /^Bản sao của/);
  await waitSaved();
  console.log('PASS Lưu nháp, đổi tab trên mobile, xuất–nhập kèm ảnh, chơi thật và tách tiến độ chơi thử');

  await select(field('after', 'after'), 'next');
  assert.match(await text('.cr-after'), /Đi tới: Hỏi Minh/);
  assert.match(await text('#creator-issues'), /Hỏi Vy.*chưa có đường đi/);
  await click('.cr-scene-row:nth-child(3) [data-action="move"][data-step="-1"]');
  assert.match(await text('.cr-after'), /Đi tới: Hỏi Vy/);
  await click(action('test'));
  await click(play + ' [data-sp="continue"]');
  assert.match(await text(play + ' .sp-next-chat'), /Vy/);
  await click(play + ' .sp-next-chat [data-sp="open"]');
  await until(async () => (await text(play + ' .sp-end strong')) === 'Kết quả A', 'kết thúc theo thứ tự mới');
  await click(play + ' .sp-exit');
  console.log('PASS Tiếp tục theo dàn cảnh mới và cảnh báo về cảnh chưa có đường đi');

  await navigate('practice.html');
  await click('a[href="story.html"]');
  await until(() => show('#story-app [data-sp="continue"]'), 'màn Trước giờ tổng duyệt cũ');
  await click('#story-app [data-sp="continue"]');
  await until(() => show('#story-app .sp-next-chat [data-sp="open"]'), 'chuyển chat màn cũ');
  await click('#story-app .sp-next-chat [data-sp="open"]');
  assert.match(await text('#story-app .sp-header-copy'), /Văn nghệ 11A2/);
  console.log('PASS Mở màn cũ từ Thực hành và tiếp tục sang cuộc chat kế tiếp');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (session) await command('DELETE', '').catch(() => {});
  driver?.kill();
  server?.kill();
  if (scratch) await fs.rm(scratch, {recursive: true, force: true, maxRetries: 3});
});
