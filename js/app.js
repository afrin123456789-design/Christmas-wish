/* Shared namespace, motion preference, toast, scroll reveals, snow toggle */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  app.reduced = motion.matches;

  app.toast = (message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(app._toastTimer);
    app._toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !app.reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  const snowButton = document.getElementById('snowToggle');
  if (snowButton) {
    const label = snowButton.querySelector('.snow-label');
    const paint = (on) => {
      snowButton.setAttribute('aria-pressed', String(on));
      if (label) label.textContent = on ? 'Snow on' : 'Snow off';
    };
    paint(!app.reduced);
    snowButton.addEventListener('click', () => {
      if (app.reduced) {
        app.toast('Snow is paused while reduced motion is on.');
        return;
      }
      const on = snowButton.getAttribute('aria-pressed') !== 'true';
      paint(on);
      app.setSnow?.(on);
    });
  }
})();
