// End-to-end tests for Level 3 — “Góc khuất khung hình”
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

const base = pathToFileURL(path.join(__dirname, '..', 'dist') + path.sep).href;
let port, prefix, driver, driverError, profile, sid = '';

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const selected = server.address().port;
      server.close(error => error ? reject(error) : resolve(selected));
    });
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function req(method, url, data) {
  const response = await fetch(prefix + url, {
    method,
    headers: {'Content-Type': 'application/json'},
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok || result.value?.error) {
    throw Error(`${method} ${url}: ${JSON.stringify(result.value)}`);
  }
  return result.value;
}

const command = (method, url, data) => req(method, `/session/${sid}${url}`, data);
const js = (script, ...args) => command('POST', '/execute/sync', {script, args});

async function waitFor(fn, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return;
    } catch {}
    await delay(100);
  }
  throw Error('waitFor timeout');
}

async function nav(file) {
  await command('POST', '/url', {url: base + file});
  await waitFor(() => js('return document.readyState === "complete"'));
}

async function element(selector) {
  return (await command('POST', '/element', {using: 'css selector', value: selector}))['element-6066-11e4-a52e-4f735466cecf'];
}

async function click(selector) {
  await js('document.querySelector(arguments[0])?.scrollIntoView({behavior:"instant",block:"center"})', selector);
  await delay(80);
  return command('POST', `/element/${await element(selector)}/click`, {});
}

async function textInput(selector, value) {
  const id = await element(selector);
  await command('POST', `/element/${id}/clear`, {});
  return command('POST', `/element/${id}/value`, {text: value});
}

const visible = selector => js('const e=document.querySelector(arguments[0]);return !!e && !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);', selector);

const test = async (name, fn) => {
  await fn();
  console.log('PASS ' + name);
};

async function action(name) {
  const selector = `[data-m3="${name}"]`;
  await waitFor(() => visible(selector));
  await click(selector);
}

const selectNav = target => click(`#m3-appnav [data-m3="nav"][data-target="${target}"]`);
const mainText = () => js('return document.querySelector("#m3-main")?.innerText || ""');
const getState = () => js('return JSON.parse(localStorage.getItem("lab-an-toan-so:exercise:level3"))');

async function fresh() {
  await nav('practice.html');
  await js('localStorage.clear()');
  await nav('level3.html');
  await action('start');
  const notification = '#m3-main [data-m3="nav"][data-target="chat-scammer"]';
  await waitFor(() => visible(notification));
  await click(notification);
}

(async () => {
  port = await availablePort();
  prefix = `http://127.0.0.1:${port}`;
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-browser-level3-'));
  driver = spawn(process.env.CHROMEDRIVER || 'chromedriver', [`--port=${port}`], {stdio: 'ignore'});
  driver.on('error', error => { driverError = error; });

  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (driverError) throw driverError;
    try {
      await req('GET', '/status');
      ready = true;
      break;
    } catch {
      await delay(100);
    }
  }
  if (!ready) throw new Error('ChromeDriver did not become ready');

  const session = await req('POST', '/session', {
    capabilities: {
      alwaysMatch: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          ...(process.env.CHROME_BINARY ? {binary: process.env.CHROME_BINARY} : {}),
          args: [
            '--headless=new',
            '--disable-dev-shm-usage',
            '--window-size=1280,900',
            `--user-data-dir=${profile}`,
            ...(process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : [])
          ]
        }
      }
    }
  });
  sid = session.sessionId;

  await test('Thẻ Màn 3 hiển thị trên trang Thực hành', async () => {
    await nav('practice.html');
    await js('localStorage.clear()');
    assert.match(await js('return document.body.innerText'), /Góc khuất khung hình/);
    await textInput('#exercise-search', 'khung hinh');
    assert.equal(
      await js('return [...document.querySelectorAll(".practice-card")].filter(e=>!e.hidden).map(e=>e.querySelector(".card-title").textContent).join()'),
      'Góc khuất khung hình'
    );
  });

  await test('Màn khởi đầu và nhận tin đe dọa kèm video deepfake an toàn', async () => {
    await fresh();
    const log = '[data-m3-message-log]';
    const messages = () => js('return [...document.querySelectorAll(arguments[0] + " .m3-bubble")].map(e => e.textContent)', log);
    
    // Tin đầu tiên từ kẻ gian
    await waitFor(async () => (await messages()).length >= 1);
    assert.match((await messages())[0], /Confession trường|bạn bè/);

    // Chờ nhận đủ 3 tin
    await waitFor(async () => (await messages()).length >= 3);
    assert.match((await messages())[2], /2\.000\.000đ/);

    // Kiểm tra card video đính kèm
    assert.ok(await visible('.m3-video-card'));
    assert.ok(await visible('[data-m3="inspect-frame"]'));
  });

  await test('Soi chi tiết khung hình phát hiện dấu vết cắt ghép khuôn mặt', async () => {
    await fresh();
    await waitFor(() => visible('[data-m3="inspect-frame"]'));
    await action('inspect-frame');

    // Dialog mở ra
    assert.ok(await visible('#m3-dialog[open]'));
    assert.match(await js('return document.querySelector("#m3-dialog").innerText'), /Trình kiểm tra khung hình/);
    assert.match(await js('return document.querySelector("#m3-dialog").innerText'), /Viền cằm và cổ/);
    assert.match(await js('return document.querySelector("#m3-dialog").innerText'), /vàng đèn bàn/);

    // Đóng dialog
    await action('close-dialog');
    await waitFor(async () => !(await visible('#m3-dialog[open]')));
    assert.equal((await getState()).has_inspected_frame, true);
  });

  await test('Đối chiếu Story cũ và khóa quyền riêng tư (Branch 1 - Safe Defense)', async () => {
    await fresh();
    await selectNav('profile');
    assert.match(await mainText(), /Story cách đây 3 ngày/);

    // Xem chi tiết story cũ
    await action('view-old-story');
    assert.ok(await visible('#m3-dialog[open]'));
    assert.match(await js('return document.querySelector("#m3-dialog").innerText'), /Kho Story cũ/);
    await action('close-dialog');
    assert.equal((await getState()).has_checked_old_story, true);

    // Khóa danh sách bạn bè và story
    await action('toggle-privacy-friends');
    await action('toggle-privacy-story');
    assert.equal((await getState()).has_locked_privacy, true);

    // Lưu bằng chứng và báo cáo
    await selectNav('chat-scammer');
    await action('save-evidence');
    assert.equal((await getState()).has_saved_evidence, true);
    await action('report-scammer');
    await action('submit-report');
    assert.equal((await getState()).has_reported_scammer, true);
    assert.equal((await getState()).is_blocked, true);

    // Nhắn Khánh và nộp bài
    await selectNav('chat-khanh');
    await waitFor(() => visible('[data-m3="talk-khanh"]'));
    await action('talk-khanh');
    await waitFor(() => visible('[data-m3="finish-check"]'));
    await action('finish-check');

    // Màn kết quả
    assert.equal((await getState()).result, 'safe');
    assert.equal((await getState()).balance, 1500000);
    assert.match(await mainText(), /Ví còn nguyên 1\.500\.000đ/);
    assert.match(await mainText(), /Hoàn thành bài thuyết trình đúng hạn/);
  });

  await test('Gọi điện hỗ trợ tư vấn Khánh và Tổng đài 111 (Branch 2 - Support Call)', async () => {
    await fresh();
    await selectNav('contacts');
    assert.match(await mainText(), /Quốc Khánh/);
    assert.match(await mainText(), /Tổng đài 111/);

    // Gọi Khánh
    await action('call-khanh');
    assert.match(await mainText(), /CUỘC GỌI ĐÃ KẾT NỐI/);
    await waitFor(async () => (await js('return document.querySelectorAll(".m3-bubble").length')) >= 2);
    assert.match(await mainText(), /hít thở sâu đi/);

    // Trở về danh bạ và gọi 111
    await selectNav('contacts');
    await action('call-lan');
    await waitFor(async () => (await js('return document.querySelectorAll(".m3-bubble").length')) >= 2);
    assert.match(await mainText(), /Chị Lan nghe đây em/);
    assert.equal((await getState()).has_called_support, true);
  });

  await test('Chuyển tiền bị tống tiếp và dừng lại đúng lúc (Branch 3 - Accidental Transfer)', async () => {
    await fresh();
    await selectNav('wallet');
    assert.match(await mainText(), /1\.500\.000đ/);

    // Bấm chuẩn bị chuyển tiền -> màn xác nhận
    await action('confirm-transfer');
    assert.match(await mainText(), /XÁC NHẬN CHUYỂN TIỀN/);
    assert.match(await mainText(), /NGUYEN HOANG PHUC/);

    // Xác nhận chuyển
    await action('do-transfer');
    assert.equal((await getState()).balance, 0);
    assert.equal((await getState()).has_paid_scammer, true);
    assert.match(await mainText(), /0đ/);

    // Xem lịch sử giao dịch ví
    await action('history');
    assert.match(await mainText(), /DF-GUARD-2115/);

    // Quay lại chat kẻ gian -> tin đòi tiền lần 2 xuất hiện
    await selectNav('chat-scammer');
    await waitFor(async () => (await js('return document.body.innerText')).includes('ĐÒI TIỀN LẦN HAI'));
    assert.match(await mainText(), /3\.000\.000đ/);

    // Khóa riêng tư và hoàn tất
    await action('block-scammer');
    await action('finish-check');
    assert.equal((await getState()).result, 'paid');
    assert.match(await mainText(), /Ví còn 0đ/);
    assert.match(await mainText(), /đã kịp dừng lại khi kẻ gian tiếp tục đòi thêm 3\.000\.000đ/);
  });

  await test('Hủy thao tác ở màn hình xác nhận ví (Branch 4 - Last minute cancel)', async () => {
    await fresh();
    await selectNav('wallet');
    await action('confirm-transfer');
    // Bấm quay lại giữ tiền
    await action('wallet');
    assert.equal((await getState()).balance, 1500000);
    assert.equal((await getState()).has_paid_scammer, false);
    assert.match(await mainText(), /1\.500\.000đ/);
  });

  await test('Chặn tài khoản sớm không bị khóa cụt đường (Branch 5 - Early Block)', async () => {
    await fresh();
    await action('block-scammer');
    assert.equal((await getState()).is_blocked, true);
    assert.match(await mainText(), /TÀI KHOẢN ĐÃ CHẶN/);
    assert.ok(await visible('[data-m3="profile"]'));
    assert.ok(await visible('[data-m3="chat-khanh"]'));

    // Vẫn sang profile bình thường
    await action('profile');
    assert.match(await mainText(), /TRANG CÁ NHÂN/);
  });

  await test('Thử một lựa chọn khác reset toàn bộ trạng thái (Branch 6 - Replay Reset)', async () => {
    await fresh();
    await selectNav('chat-khanh');
    await action('finish-check');
    assert.match(await mainText(), /KẾT QUẢ TÌNH HUỐNG/);

    // Bấm Thử một lựa chọn khác
    await action('retry');
    const s = await getState();
    assert.equal(s.screen, 'lock');
    assert.equal(s.balance, 1500000);
    assert.equal(s.has_paid_scammer, false);
    assert.equal(s.is_blocked, false);
    assert.match(await mainText(), /Còn 45 phút ghép slide/);
  });

  await test('Đảm bảo kích thước điện thoại di động (390x844 không bị tràn ngang)', async () => {
    await command('POST', '/window/rect', {width: 390, height: 844});
    await fresh();
    for (const target of ['chat-scammer', 'profile', 'contacts', 'wallet']) {
      await selectNav(target);
      const metrics = await js('return {width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth}');
      assert.ok(metrics.scroll <= metrics.width + 1, `${target} layout overflow: ${JSON.stringify(metrics)}`);
    }
  });

  console.log('TẤT CẢ KIỂM THỬ MÀN 3 THÀNH CÔNG');
})().catch(e => {
  console.error('FAIL', e.stack);
  process.exitCode = 1;
}).finally(async () => {
  if (sid) {
    try { await req('DELETE', `/session/${sid}`); } catch {}
  }
  if (driver) driver.kill();
  if (profile) fs.rmSync(profile, {recursive: true, force: true});
});
