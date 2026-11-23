import { mkdir, copyFile, writeFile, readdir } from 'node:fs/promises';
import { siteName } from '../src/config.js';
import home from '../src/pages/home.js';
import practice from '../src/pages/practice.js';
import knowledge from '../src/pages/knowledge.js';
import exercise from '../src/pages/exercise.js';
import workspace from '../src/pages/workspace.js';
import level2 from '../src/pages/level2.js';
import story from '../src/pages/story.js';

const navPages = [ ['index.html', home], ['practice.html', practice], ['knowledge.html', knowledge] ];
const pages = [...navPages, ['exercise.html', exercise], ['level2.html', level2], ['story.html', story], ['workspace.html', workspace]];
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
await mkdir('dist/assets', { recursive: true });
await Promise.all((await readdir('src/assets')).map(file => copyFile(`src/assets/${file}`, `dist/assets/${file}`)));
for (const [file, page] of pages) {
  const current = ['exercise.html', 'level2.html', 'story.html', 'workspace.html'].includes(file) ? 'practice.html' : file;
  const links = navPages.map(([href, item]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${item.title}</a>`).join('');
  const pageStyles = (page.styles || []).map(asset => `<link rel="stylesheet" href="assets/${asset}">`).join('');
  const pageScripts = (page.scripts || []).map(asset => `<script src="assets/${asset}" defer></script>`).join('');
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(page.description)}"><title>${escape(page.title)} | ${escape(siteName)}</title><link rel="stylesheet" href="assets/style.css">${pageStyles}<script src="assets/menu.js" defer></script>${pageScripts}</head><body><a class="skip-link" href="#main">Chuyển đến nội dung chính</a><header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="${escape(siteName)} - Trang chủ"><span class="brand-mark" aria-hidden="true">✳</span><span>${escape(siteName)}</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="menu-lines" aria-hidden="true"></span><span class="menu-label">Menu</span></button><nav id="site-nav" aria-label="Điều hướng chính">${links}</nav><span class="header-tag">HỌC AN TOÀN SỐ <span>✳</span></span></div></header><main id="main">${page.content}</main><footer class="site-footer"><div class="wrap footer-inner"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark" aria-hidden="true">✳</span><span>${escape(siteName)}</span></a><p>Một không gian nhỏ để học cách an toàn hơn trên mạng.</p></div><div class="footer-right"><span>BẢN DRAFT · NỘI DUNG ĐANG PHÁT TRIỂN</span><nav aria-label="Điều hướng chân trang">${links}</nav></div></div></footer></body></html>`;
  await writeFile(`dist/${file}`, html);
}
console.log(`Đã tạo ${pages.length} trang trong dist/.`);
