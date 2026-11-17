/* Story page motion: scroll-driven 3D, chapter tracking, tilt, glitter. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  // Overall scroll progress drives --p (0 to 1) across the whole page.
  let ticking = false;
  const updateProgress = () => {
    ticking = false;
    const max = root.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    root.style.setProperty('--p', p.toFixed(4));
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  // Chapters: the current one turns the diorama and lights up its text.
  const diorama = document.getElementById('diorama');
  const caption = document.getElementById('stageCaption');
  const chapters = [...document.querySelectorAll('.chapter')];
  const setChapter = (index) => {
    if (diorama) diorama.style.setProperty('--ch', String(index));
    chapters.forEach((c, i) => c.classList.toggle('is-current', i === index));
    if (caption) caption.textContent = `Chapter ${index + 1} of ${chapters.length}`;
  };
  if ('IntersectionObserver' in window && chapters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setChapter(Number(entry.target.dataset.ch));
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    chapters.forEach((c) => io.observe(c));
  }

  // The sharing cards react to the pointer with a light that follows it.
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const r = card.getBoundingClientRect();
      const x = event.clientX - r.left;
      const y = event.clientY - r.top;
      card.style.setProperty('--mx', (x / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y / r.height * 100).toFixed(1) + '%');
      if (!motion.matches) {
        const rx = (0.5 - y / r.height) * 12;
        const ry = (x / r.width - 0.5) * 14;
        card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(0)`;
      }
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // Entrance for the sharing deck
  const deck = document.querySelector('.s-share');
  if (deck && 'IntersectionObserver' in window && !motion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          deck.classList.add('is-in');
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(deck);
  } else if (deck) {
    deck.classList.add('is-in');
  }

  // Glitter burst on the hero cube tower when tapped
  const hero = document.querySelector('.hero3d');
  if (hero && !motion.matches) {
    hero.addEventListener('pointerdown', (event) => {
      const r = hero.getBoundingClientRect();
      const x = event.clientX - r.left;
      const y = event.clientY - r.top;
      for (let i = 0; i < 26; i++) {
        const dot = document.createElement('span');
        dot.className = 'glitter';
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 120;
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px');
        dot.style.setProperty('--dy', (Math.sin(a) * d).toFixed(1) + 'px');
        hero.appendChild(dot);
        setTimeout(() => dot.remove(), 1100);
      }
    });
  }
})();
