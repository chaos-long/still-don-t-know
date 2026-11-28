(() => {
  const root = document.querySelector('#story-app');
  const data = document.querySelector('#published-story-data');
  if (!root || !data) return;

  try {
    const project = window.creatorProject.validateFile(JSON.parse(data.textContent));
    const story = window.creatorProject.toStory(project);
    story.id = 'published-' + project.id;
    window.mountStoryPlayer(root, story);
  } catch (error) {
    console.error('Không mở được kịch bản đã xuất bản.', error);
    root.innerHTML = '<p>Không mở được bài thực hành.</p><a href="practice.html">Về Thực hành</a>';
  }
})();
