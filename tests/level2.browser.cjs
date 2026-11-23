// End-to-end checks use a temporary Chromium profile. User browser data is never touched.
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
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function req(method,url,data){const response=await fetch(prefix+url,{method,headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});const result=await response.json();if(!response.ok||result.value?.error)throw Error(`${method} ${url}: ${JSON.stringify(result.value)}`);return result.value;}
const command=(method,url,data)=>req(method,`/session/${sid}${url}`,data);
const js=(script,...args)=>command('POST','/execute/sync',{script,args});
async function waitFor(fn){for(let i=0;i<50;i++){try{if(await fn())return}catch{}await delay(100)}throw Error('waitFor timeout');}
async function nav(file){await command('POST','/url',{url:base+file});
  await waitFor(()=>js('return document.readyState === "complete"'));}
async function element(selector){return (await command('POST','/element',{using:'css selector',value:selector}))['element-6066-11e4-a52e-4f735466cecf'];}
async function click(selector){await js('document.querySelector(arguments[0]).scrollIntoView({behavior:"instant",block:"center"})',selector);
  await delay(100);return command('POST',`/element/${await element(selector)}/click`,{});}
async function textInput(selector,value){const id=await element(selector);
  await command('POST',`/element/${id}/clear`,{});return command('POST',`/element/${id}/value`,{text:value});}
const visible=selector=>js('const e=document.querySelector(arguments[0]);return !!e && !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);',selector);
const test=async(name,fn)=>{await fn();console.log('PASS '+name)};
async function action(name) {
  if (['ask-song','ask-quote','decline'].includes(name)) {
    const field = '.m2-reply-select';
    await waitFor(() => visible(field));
    await js('const field = document.querySelector(".m2-reply-select"); field.value = arguments[0]; field.dispatchEvent(new Event("change", {bubbles:true}));', name);
    await click('.m2-send');
    return;
  }
  const selector = `[data-m2="${name}"]`;
  await waitFor(() => visible(selector));
  await click(selector);
}
const selectTab=(target)=>click(`#m2-appnav [data-m2="nav"][data-target="${target}"]`);
const mainText=()=>js('return document.querySelector("#m2-main").innerText');
const getState=()=>js('return JSON.parse(localStorage.getItem("lab-an-toan-so:exercise:level2"))');
async function fresh(){await nav('practice.html');
  await js('localStorage.clear()');
  await nav('level2.html');
  await action('start');
  const notification = '#m2-main [data-m2="nav"][data-target="chat"]';
  await waitFor(() => visible(notification));
  await click(notification);
}
(async()=>{
 port=await availablePort();
 prefix=`http://127.0.0.1:${port}`;
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'lab-browser-test-'));
 driver=spawn(process.env.CHROMEDRIVER || 'chromedriver',[`--port=${port}`],{stdio:'ignore'});
 driver.on('error',error=>{driverError=error});
 let ready=false;
 for(let i=0;i<100;i++){
  if(driverError)throw driverError;
  try{await req('GET','/status');ready=true;break}catch{await delay(100)}
 }
 if(!ready)throw new Error('ChromeDriver did not become ready; check CHROMEDRIVER and Chromium installation.');
 const session=await req('POST','/session',{capabilities:{alwaysMatch:{browserName:'chrome','goog:chromeOptions':{...(process.env.CHROME_BINARY ? {binary:process.env.CHROME_BINARY} : {}),args:['--headless=new','--disable-dev-shm-usage','--window-size=1280,900',`--user-data-dir=${profile}`,...(process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : [])]}}}});sid=session.sessionId;
 await test('Danh sách thực hành và lọc',async()=>{
  await nav('practice.html');
  await js('localStorage.clear()');
  assert.match(await js('return document.body.innerText'),/Tao đây, Minh đây/);
  await textInput('#exercise-search','tao day minh day');
  assert.equal(await js('return [...document.querySelectorAll(".practice-card")].filter(e=>!e.hidden).map(e=>e.querySelector(".card-title").textContent).join()'),'Tao đây, Minh đây');
  await js('const e=document.querySelector("#exercise-category");e.value="Chat/Call App";e.dispatchEvent(new Event("change",{bubbles:true}))');
  assert.equal(await js('return [...document.querySelectorAll(".practice-card")].filter(e=>!e.hidden).length'),1)
 });
 await test('Chat nhận từng tin theo đúng thứ tự và giữ lịch sử qua tải lại', async () => {
  await fresh();
  const log = '[data-m2-message-log]';
  const messages = () => js('return [...document.querySelectorAll(arguments[0] + " .m2-bubble")].map(e => e.textContent)', log);
  assert.deepEqual(await messages(), []);
  assert.ok(await visible('.m2-typing'));
  await waitFor(async () => (await messages()).length === 1);
  assert.match((await messages())[0], /200k cọc loa/);
  assert.equal(await visible('[data-m2="wallet"]'), false);
  await selectTab('wallet');
  assert.equal(await visible('[data-m2="confirm"]'), false);
  await selectTab('chat');
  await waitFor(async () => (await messages()).length === 2);
  assert.match((await messages())[1], /NGUYEN VAN NAM/);
  assert.equal(await js('return document.querySelector(".m2-send").disabled'), true);
  await textInput('#m2-inbox-search', 'danh ba');
  assert.equal(await visible('#m2-appnav [data-target="chat"]'), false);
  assert.equal(await visible('#m2-appnav [data-target="contacts"]'), true);
  await textInput('#m2-inbox-search', '');
  assert.equal(await visible('#m2-appnav [data-target="group"]'), true);
  await action('ask-quote');
  assert.equal((await messages()).length, 3);
  assert.match((await messages())[2], /gửi biên nhận/);
  assert.equal(await visible('[data-m2="quote"]'), false);
  await selectTab('group');
  await selectTab('chat');
  await waitFor(() => visible('[data-m2="quote"]'));
  await action('ask-song');
  await waitFor(async () => (await messages()).length === 6);
  const conversation = await messages();
  assert.match(conversation[3], /Xem ảnh Minh gửi/);
  assert.match(conversation[4], /M đang tập bài gì/);
  assert.match(conversation[5], /Nắng sân trường/);
  await command('POST','/refresh',{});
  assert.deepEqual(await messages(), conversation);
  assert.equal(await visible('.m2-typing'), false);
 });
 await test('Chưa tiết lộ đáp án và phân biệt hai cuộc gọi',async()=>{
  await fresh();
  assert.doesNotMatch(await mainText(),/bị chiếm|lừa đảo|giả mạo/i);
  await action('chat-call');
  assert.match(await mainText(),/chưa đủ để kết luận/);
  assert.equal((await getState()).verifiedMinh,false);
  await action('contacts');
  await action('call');
  await waitFor(() => visible('[data-m2="minh-report"]'));
  assert.match(await mainText(),/Đâu có/);
  assert.equal((await getState()).verifiedMinh,true)
 });
 await test('Phân biệt phiếu báo giá và biên nhận',async()=>{
  await fresh();
  await action('ask-quote');
  await action('quote');
  assert.match(await js('return document.querySelector("#m2-dialog").innerText'),/BÁO GIÁ|Báo giá/i);
  await action('close-dialog');
  await selectTab('group');
  await action('receipt');
  assert.match(await js('return document.querySelector("#m2-dialog").innerText'),/ĐÃ THANH TOÁN/);
  await action('compare');
  assert.match(await js('return document.querySelector("#m2-dialog").innerText'),/Phiếu báo giá/);
  assert.match(await js('return document.querySelector("#m2-dialog").innerText'),/Biên nhận/);
  await action('close-dialog')
 });
 await test('Nhánh A: gọi số cá nhân và báo nhóm',async()=>{
  await fresh();
  await selectTab('contacts');
  await action('call');
  await waitFor(() => visible('[data-m2="minh-report"]'));
  assert.match(await mainText(),/Đâu có/);
  await action('minh-report');
  assert.match(await mainText(),/500\.000/);
  assert.equal((await getState()).status,'completed')
 });
 await test('Nhánh B: tìm cọc, xem biên nhận và nhận loa',async()=>{
  await fresh();
  await selectTab('group');
  await textInput('#m2-search','cọc');
  assert.match(await mainText(),/200k cọc rồi/);
  await action('receipt');
  assert.ok(await visible('#m2-dialog'));
  await action('close-dialog');
  await action('vy');
  await action('vy-self');
  assert.match(await mainText(),/500\.000/);
  assert.equal((await getState()).status,'completed')
 });
 await test('Nhánh C: từ chối và nhận loa',async()=>{
  await fresh();
  await action('decline');
  await action('continue-decline');
  await action('decline-self');
  assert.match(await mainText(),/500\.000/);
  assert.equal((await getState()).status,'completed')
 });
 await test('Nhánh D: xem xác nhận, chuyển và xử lý',async()=>{
  await fresh();
  await action('wallet');
  assert.match(await mainText(),/500\.000/);
  await action('confirm');
  assert.match(await mainText(),/NGUYEN VAN NAM/);
  assert.equal((await getState()).transferred,false);
  await action('wallet');
  assert.match(await mainText(),/500\.000/);
  assert.equal((await getState()).transferred,false);
  await action('confirm');
  await action('transfer');
  assert.equal((await getState()).transferred,true);
  assert.match(await mainText(),/300\.000/);
  assert.doesNotMatch(await mainText(),/Bên kia bảo chưa thấy tiền/);
  await waitFor(async () => /Tớ gửi lại biên nhận/.test(await mainText()));
  assert.doesNotMatch(await mainText(),/Bên kia bảo chưa thấy tiền/);
  await waitFor(async () => /Bên kia bảo chưa thấy tiền/.test(await mainText()));
  await action('history');
  assert.equal(await js('return document.querySelector("#m2-transaction-code").value'),'MO-PHONG-1126');
  await action('copy-tx');
  await waitFor(()=>js('return document.querySelector("#m2-copy-status").textContent.length > 0'));
  await action('support');
  await action('send-support');
  assert.match(await mainText(),/Đã gửi yêu cầu hỗ trợ/);
  await action('after-transfer');
  await action('warn-group');
  assert.doesNotMatch(await mainText(), /đã hủy giao dịch/);
  await waitFor(async () => /đã hủy giao dịch/.test(await mainText()));
  await action('finish-transfer');
  assert.equal((await getState()).status,'completed');
  assert.match(await mainText(),/300\.000/)
 });
 await test('Khôi phục khi dữ liệu lưu không hợp lệ',async()=>{
  await nav('practice.html');
  await js('localStorage.setItem("lab-an-toan-so:exercise:level2","{invalid")');
  await nav('level2.html');
  assert.ok(await visible('#m2-intro'));
  assert.equal(await visible('#m2-storage-warning'),false);
  await action('start');
  assert.equal((await getState()).status,'active')
 });
 await test('Hoàn thành lại để kiểm tra chơi lại',async()=>{
  await fresh();
  await action('decline');
  await action('continue-decline');
  await action('decline-self');
  assert.equal((await getState()).status,'completed')
 });
 await test('Chơi lại và Workspace màn 2',async()=>{
  await action('retry');
  assert.equal((await getState()).status,'active');
  assert.equal((await getState()).screen,'chat');
  await nav('workspace.html');
  await waitFor(()=>js('return location.pathname.endsWith("level2.html")'));
  assert.ok(await visible('#m2-game'));
  await command('POST','/refresh',{});
  await waitFor(()=>visible('#m2-game'));
  assert.equal((await getState()).screen,'chat')
 });
 await test('Workspace hai bài đang làm',async()=>{
  await js('localStorage.setItem("lab-an-toan-so:exercise:cong-an-gia","active")');
  await nav('workspace.html');
  assert.ok(await visible('#workspace-selection'));
  assert.deepEqual(await js('return [...document.querySelectorAll("#workspace-selection a")].map(a=>a.getAttribute("href")).filter(h=>h==="exercise.html"||h==="level2.html").sort()'),['exercise.html','level2.html']);
  await js('localStorage.removeItem("lab-an-toan-so:exercise:cong-an-gia")')
 });
 await test('Màn 1 chặn vẫn hoàn thành',async()=>{
  await nav('practice.html');
  await js('localStorage.clear()');
  await nav('exercise.html');
  await click('#start-exercise');
  await textInput('#chat-input','xin chao');
  await click('#chat-compose .send-button');
  assert.ok(await visible('#exercise-dialog'));
  assert.match(await js('return document.querySelector("#exercise-dialog").innerText'),/Công an sẽ không làm việc/);
  await click('#dialog-close');
  await click('#block-person');
  assert.ok(await visible('#exercise-dialog'));
  assert.equal(await js('return localStorage.getItem("lab-an-toan-so:exercise:cong-an-gia")'),'completed');
 });
 await test('Điện thoại không tràn ngang',async()=>{
  await command('POST','/window/rect',{width:390,height:844});
  for(const p of ['index.html','practice.html','level2.html','workspace.html']){await nav(p);const d=await js('return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}');
  assert.ok(d.scroll<=d.width,`${p}: ${JSON.stringify(d)}`)}
 });
 await test('Chặn không tự mở lại chat hay chuyển tiền',async()=>{
  await fresh();
  await action('block');
  assert.equal((await getState()).blocked,true);
  await selectTab('chat');
  assert.match(await mainText(),/đã chặn/i);
  assert.equal(await js('return !!document.querySelector("[data-m2=wallet]")'),false);
  await selectTab('wallet');
  assert.equal(await js('return !!document.querySelector("[data-m2=confirm]")'),false);
  assert.equal((await getState()).transferred,false)
 });
 await test('Hỏi ảnh không đồng nghĩa đã xem, hình kết quả nhánh Vy',async()=>{
  await fresh();
  await action('ask-quote');
  assert.equal((await getState()).askedQuote,true);
  assert.equal((await getState()).viewedQuote,false);
  await selectTab('group');
  await action('receipt');
  assert.equal(await js('return !!document.querySelector("#m2-dialog [data-m2=compare]")'),false);
  await action('close-dialog');
  await action('vy');
  await action('vy-self');
  assert.ok(await visible('.m2-scene'));
  assert.match(await js('return document.querySelector(".m2-scene").getAttribute("aria-label")'),/loa đỏ/)
 });
 await test('Báo nhóm trước chuyển chưa tính là cảnh báo sau chuyển',async()=>{
  await fresh();
  await selectTab('contacts');
  await action('call');
  await waitFor(() => visible('[data-m2="minh-report"]'));
  await selectTab('group');
  await action('warn-group');
  assert.equal((await getState()).groupWarned,true);
  await selectTab('chat');
  await action('wallet');
  await action('confirm');
  await action('transfer');
  assert.equal((await getState()).warnedAfterTransfer,false);
  assert.doesNotMatch(await mainText(),/hủy một giao dịch/);
  assert.equal(await js('return !!document.querySelector("[data-m2=finish-transfer]")'),false);
  await action('warn-group');
  assert.equal((await getState()).warnedAfterTransfer,true);
  await waitFor(async () => /đã hủy giao dịch/.test(await mainText()));
  await action('finish-transfer');
  assert.match(await mainText(),/Chặn lần chuyển thứ hai/)
 });
 await test('Hỏi Vy trước chuyển chưa tính là báo Vy sau chuyển',async()=>{
  await fresh();
  await selectTab('group');
  await action('vy');
  assert.equal((await getState()).talkedVy,true);
  await selectTab('chat');
  await action('wallet');
  await action('confirm');
  await action('transfer');
  assert.equal((await getState()).vyAfterTransfer,false);
  assert.equal(await js('return !!document.querySelector("[data-m2=finish-transfer]")'),false);
  await action('vy');
  assert.equal((await getState()).vyAfterTransfer,true);
  await action('vy-friend');
  await action('finish-transfer');
  assert.match(await mainText(),/báo Vy/)
 });
 await test('Điện thoại trong các màn trò chơi',async()=>{
  await fresh();
  await waitFor(() => visible('[data-m2="wallet"]'));
  for(const tab of ['chat','group','wallet']){await selectTab(tab);
  let d=await js('return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}');
  assert.ok(d.scroll<=d.width,`${tab}: ${JSON.stringify(d)}`)}await action('confirm');
  let d=await js('return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}');
  assert.ok(d.scroll<=d.width,JSON.stringify(d));
  await action('transfer');
  assert.match(await mainText(),/300\.000/)});
 await test('Truyện tin nhắn: phát tuần tự, chuyển chat, nội dung bắt buộc và kết thúc',async()=>{
  await nav('practice.html');
  await js('localStorage.clear()');
  await nav('story.html');
  const storyState=()=>js('return JSON.parse(localStorage.getItem("lab-an-toan-so:story:truoc-gio-tong-duyet"))');
  const count=()=>js('return document.querySelectorAll(".sp-history .sp-message").length');
  assert.equal(await count(),0);
  await waitFor(async()=>await count()===4);
  assert.equal((await storyState()).phase,'ready');
  await click('[data-sp="continue"]');
  assert.equal((await storyState()).phase,'switch');
  assert.equal(await js('return document.querySelector(".sp-row[data-chat=lop] .sp-badge").textContent'),'1');
  assert.match(await js('return document.querySelector(".sp-next-chat").textContent'),/Văn nghệ 11A2/);
  await click('.sp-next-chat [data-sp="open"]');
  assert.equal(await js('return document.querySelectorAll("[data-event=g1]").length'),1);
  await waitFor(async()=>await count()===4);
  assert.equal((await storyState()).phase,'waiting');
  await click('[data-sp="image"]');
  assert.ok(await visible('.sp-dialog'));
  await click('.sp-dialog [data-sp="close"]');
  assert.equal((await storyState()).phase,'waiting');
  await click('.sp-action-tray [data-sp="card"]');
  assert.ok(await visible('.sp-dialog'));
  await click('.sp-dialog [data-sp="close"]');
  assert.equal((await storyState()).phase,'ready');
  await click('[data-sp="continue"]');
  assert.equal((await storyState()).phase,'switch');
  await click('.sp-next-chat [data-sp="open"]');
  await click('[data-sp="back"]');
  const before=(await storyState()).eventIndex;
  await delay(1300);
  assert.equal((await storyState()).eventIndex,before);
  await click('.sp-row[data-chat=vy]');
  await waitFor(async()=>await count()===3);
  await click('[data-sp="continue"]');
  await click('.sp-next-chat [data-sp="open"]');
  await waitFor(()=>visible('[data-sp="choose"]'));
  await click('[data-option="bao-nhom"]');
  assert.equal((await storyState()).ending,'safe');
  assert.match(await js('return document.querySelector(".sp-end").textContent'),/đối chiếu biên nhận/);
  await click('[data-sp="restart"]');
  assert.equal((await storyState()).sectionIndex,0);
  assert.equal(await count(),0);
 });
 console.log('TẤT CẢ KIỂM THỬ TRÌNH DUYỆT THÀNH CÔNG');
})().catch(e=>{console.error('FAIL',e.stack);process.exitCode=1}).finally(async()=>{if(sid)try{await req('DELETE',`/session/${sid}`)}catch{}if(driver)driver.kill();if(profile)fs.rmSync(profile,{recursive:true,force:true})});
