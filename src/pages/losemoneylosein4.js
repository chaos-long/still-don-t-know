import {readFileSync} from 'node:fs';

const scenario = JSON.parse(readFileSync(new URL('../scenarios/losemoneylosein4.lab.json', import.meta.url), 'utf8'));
// Keep story text out of HTML markup, including any closing script tags in dialogue.
const data = JSON.stringify(scenario).replaceAll('<', '\\u003c');

export default {
  title: scenario.title,
  description: 'Nhận diện dấu hiệu giả danh ngân hàng và chọn cách xử lý khi bị yêu cầu xác minh giao dịch.',
  scripts: ['creator-project.js', 'story-player.js', 'published-story.js'],
  styles: ['story-player.css'],
  content: `<div id="story-app" aria-label="Truyện tin nhắn tương tác"></div>
    <script type="application/json" id="published-story-data">${data}</script>`,
};
