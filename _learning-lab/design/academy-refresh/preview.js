// Navigation locale uniquement : aucun appel de connexion, aucune donnée étudiante.
const navButtons = document.querySelectorAll('[data-view]');
const search = document.querySelector('#course-search');
const cards = [...document.querySelectorAll('[data-search]')];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function filterCourses() {
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const card of cards) {
    card.hidden = !terms.every(term => normalize(card.dataset.search).includes(term));
    if (!card.hidden) count++;
  }
  document.querySelector('#search-status').textContent = `${count} cours affiché${count > 1 ? 's' : ''} dans cet aperçu`;
  document.querySelector('.preview-empty').hidden = count !== 0;
}
function setView(view) {
  document.body.dataset.preview = view;
  navButtons.forEach(button => {
    if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelector('.preview-search').hidden = view !== 'catalogue';
  search.value = '';
  filterCourses();
  window.scrollTo(0, 0);
}
navButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelector('.preview-brand').addEventListener('click', event => { event.preventDefault(); setView('home'); });
search.addEventListener('input', filterCourses);
