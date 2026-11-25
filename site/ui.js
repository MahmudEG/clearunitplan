// Menu, scroll reveals and the word by word tagline. The pages stay readable if this never runs.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-print]').forEach(button => {
  button.addEventListener('click', () => window.print());
});
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const template = document.getElementById(button.dataset.copy);
    const status = document.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(template.textContent);
      status.textContent = 'Template copied. Replace the bracketed text before sending.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(template);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select Copy from your browser menu to copy the highlighted template.';
    }
  });
});
root.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');
function setMenu(open) {
  navbar.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
  for (const part of document.querySelectorAll('main, footer')) part.inert = open;
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
navbar?.querySelector('.menu').addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
addEventListener('keydown', event => {
  if (event.key === 'Escape' && navbar?.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
});
matchMedia('(min-width: 641px)').addEventListener('change', () => setMenu(false));

if ('IntersectionObserver' in window) {
  const sections = document.querySelectorAll('.reveal');
  const revealer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('seen');
      revealer.unobserve(entry.target);
    }
  }, {rootMargin: '0px 0px -10% 0px'});
  if (sections.length) root.classList.add('reveal-ready');
  sections.forEach(section => revealer.observe(section));

  const tagline = document.querySelector('[data-words]');
  if (tagline && !reduced) {
    for (const node of [...tagline.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(part => {
        if (!part.trim()) return document.createTextNode(part);
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        return word;
      }));
    }
    tagline.classList.add('words-ready');
    const words = [...tagline.querySelectorAll('.word')];
    // Words light in reading order once the line they sit on crosses the trigger line.
    let queued = 0;
    const lighter = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue;
        entry.target.style.transitionDelay = `${queued++ * 90}ms`;
        entry.target.classList.add('lit');
        lighter.unobserve(entry.target);
      }
      queued = 0;
    }, {rootMargin: '0px 0px -30% 0px'});
    words.forEach(word => lighter.observe(word));
  }
}
