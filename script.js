const mapButtons = [...document.querySelectorAll('[data-map]')];
const firstMap = document.getElementById('map814');
const secondMap = document.getElementById('map1000');
mapButtons.forEach(button => button.addEventListener('click', () => {
  const mode = button.dataset.map;
  firstMap.hidden = mode === '1000';
  secondMap.hidden = mode === '814';
  mapButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
const navLinks = [...document.querySelectorAll('.sidebar nav a')];
const chapters = [...document.querySelectorAll('.chapter')];
const masthead = document.querySelector('.masthead');
let landingChapter = null;
let frame = 0;
function readingTop() { return 28; }
function updateChapter() {
  const threshold = readingTop() + 8;
  const currentChapter = chapters.filter(section => section.querySelector('.chapter-heading').getBoundingClientRect().top <= threshold).at(-1);
  navLinks.forEach(link => {
    const current = currentChapter && link.hash === '#' + currentChapter.id;
    link.classList.toggle('active', Boolean(current));
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function alignLanding() {
  if (landingChapter) {
    const heading = landingChapter.querySelector('.chapter-heading');
    window.scrollTo({ top: window.scrollY + heading.getBoundingClientRect().top - readingTop(), behavior: 'instant' });
  }
  updateChapter();
}
function scheduleAlignment() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(alignLanding);
}
function followHash() {
  landingChapter = chapters.find(section => '#' + section.id === location.hash) || null;
  scheduleAlignment();
}
function releaseLanding() { landingChapter = null; }
window.addEventListener('wheel', releaseLanding, { passive: true });
window.addEventListener('touchstart', releaseLanding, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) releaseLanding();
});
window.addEventListener('pointerdown', event => {
  if (!event.target.closest('.sidebar nav a')) releaseLanding();
});
navLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  history.pushState(null, '', link.hash);
  followHash();
}));
window.addEventListener('hashchange', followHash);
window.addEventListener('popstate', followHash);
window.addEventListener('scroll', updateChapter, { passive: true });
window.addEventListener('resize', scheduleAlignment);
document.addEventListener('load', scheduleAlignment, true);
document.addEventListener('toggle', () => { releaseLanding(); scheduleAlignment(); }, true);
new ResizeObserver(scheduleAlignment).observe(document.querySelector('main'));
if (document.fonts) document.fonts.ready.then(scheduleAlignment);
followHash();
