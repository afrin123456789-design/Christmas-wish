/* Curtain story: scroll parts the velvet, then the scenes turn over as you read. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const section = document.getElementById('christmas-story');
  if (!section) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = section.querySelector('.nat-stage');
  const scenes = [...section.querySelectorAll('.nat-scene')];
  const lines = [...section.querySelectorAll('.nat-line')];
  const countEl = section.querySelector('.nat-count');
  const prev = section.querySelector('[data-nat-prev]');
  const next = section.querySelector('[data-nat-next]');
  const total = scenes.length;
  let current = 0;

  function show(index) {
    current = Math.max(0, Math.min(total - 1, index));
    scenes.forEach((s, i) => s.classList.toggle('on', i === current));
    lines.forEach((l, i) => l.classList.toggle('on', i === current));
    if (countEl) countEl.textContent = `${current + 1} of ${total}`;
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === total - 1;
  }

  prev?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));

  // Starfield inside the story
  section.querySelectorAll('.nat-stars').forEach((host) => {
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      const s = document.createElement('span');
      s.style.left = (rand() * 100).toFixed(2) + '%';
      s.style.top = (rand() * 70).toFixed(2) + '%';
      s.style.animationDelay = (rand() * 4).toFixed(2) + 's';
      s.style.opacity = (0.3 + rand() * 0.7).toFixed(2);
      host.appendChild(s);
    }
  });

  if (motion.matches) {
    show(0);
    return;
  }

  // Scroll mapping: the first 22% of the section draws the curtain, the rest tells the story
  const OPEN_AT = 0.22;
  let ticking = false;
  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const range = section.offsetHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, -rect.top / range));
    const open = Math.max(0, Math.min(1, p / OPEN_AT));
    stage.style.setProperty('--open', open.toFixed(3));
    stage.style.setProperty('--prog', p.toFixed(3));
    section.classList.toggle('is-open', open > 0.02);
    const storyP = Math.max(0, Math.min(0.9999, (p - OPEN_AT) / (1 - OPEN_AT)));
    const index = Math.floor(storyP * total);
    if (index !== current) show(index);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  show(0);
  update();
})();
