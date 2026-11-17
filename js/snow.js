/* Layered snowfall. Pauses when hidden, stops completely when turned off. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 600;
  const LAYERS = [
    { share: 0.5, r: [0.45, 1.0], s: [0.15, 0.35], a: [0.18, 0.4] },
    { share: 0.3, r: [0.9, 1.6], s: [0.35, 0.7], a: [0.3, 0.55] },
    { share: 0.2, r: [1.7, 2.8], s: [0.7, 1.2], a: [0.5, 0.85] }
  ];
  const rnd = (a, b) => a + Math.random() * (b - a);
  let w = 0, h = 0, flakes = [], raf = 0, last = 0;
  let on = !motion.matches;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const total = Math.min(lowPower ? 60 : 110, Math.floor(w / 12));
    flakes = [];
    LAYERS.forEach((L) => {
      for (let i = 0; i < Math.round(total * L.share); i++) {
        flakes.push({ x: Math.random() * w, y: Math.random() * h, r: rnd(...L.r), s: rnd(...L.s), a: rnd(...L.a), wob: rnd(-0.15, 0.15), p: Math.random() * 6.28 });
      }
    });
  }

  function frame(ts) {
    raf = 0;
    if (!on || document.hidden) return;
    const dt = last ? Math.min(ts - last, 50) / 16.67 : 1;
    last = ts;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f7f3ff';
    for (const f of flakes) {
      f.p += 0.01 * f.s * dt;
      f.y += f.s * dt;
      f.x += (f.wob + Math.sin(f.p) * 0.3) * dt;
      if (f.y > h + 6) { f.y = -6; f.x = Math.random() * w; }
      if (f.x > w + 6) f.x = -6;
      else if (f.x < -6) f.x = w + 6;
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!on || raf || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    ctx.clearRect(0, 0, w, h);
  }

  app.setSnow = (value) => {
    on = !!value && !motion.matches;
    canvas.style.opacity = on ? '.75' : '0';
    if (on) start(); else stop();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else start();
  });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  }, { passive: true });

  build();
  if (on) start(); else canvas.style.opacity = '0';
})();
