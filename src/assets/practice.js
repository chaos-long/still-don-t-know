(() => {
  const search = document.querySelector('#exercise-search');
  const category = document.querySelector('#exercise-category');
  const results = document.querySelector('#exercise-results');
  const cards = Array.from(document.querySelectorAll('#exercise-list .practice-card'));
  if (!search || !category || !results || !cards.length) return;

  // NFD tách dấu thanh; chữ đ cần được thay riêng vì không tách bằng normalize.
  const normalize = value => value.toLocaleLowerCase('vi').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const update = () => {
    const query = normalize(search.value);
    let visible = 0;
    for (const card of cards) {
      const title = card.querySelector('.card-title').textContent;
      const description = card.querySelector('.card-description').textContent;
      const matchesText = normalize(`${title} ${description}`).includes(query);
      const matchesCategory = category.value === 'all' || card.dataset.category === category.value;
      const matches = matchesText && matchesCategory;
      card.hidden = !matches;
      if (matches) visible++;
    }
    results.textContent = visible ? '' : 'Không tìm thấy bài thực hành phù hợp. Hãy thử từ khóa hoặc category khác.';
  };
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  update();
})();
