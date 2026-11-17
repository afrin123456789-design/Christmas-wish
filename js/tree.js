/* The little tree: a glowing particle tree on canvas.
   Drag to turn, tap ornaments for notes, make a wish on the star, light it up. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const canvas = document.getElementById('treeCanvas');
  if (!canvas) return;
  const frameEl = document.getElementById('treeFrame');
  const tip = document.getElementById('treeTip');
  const dotsWrap = document.getElementById('ornamentDots');
  const lightBtn = document.getElementById('treeLight');
  const wishBtn = document.getElementById('treeWish');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 600;
  const GOLDEN = 2.39996;

  const MOODS = {
    aurora: {
      needle: [[143, 232, 207], [185, 167, 255]],
      garland: [255, 214, 140],
      star: '#ffe9ad',
      orbs: ['#c9b6ff', '#f2d28b', '#8fe8cf', '#f0a3c4', '#ffffff']
    },
    ember: {
      needle: [[255, 186, 130], [214, 74, 100]],
      garland: [255, 214, 150],
      star: '#ffd98a',
      orbs: ['#f2d28b', '#e0606f', '#ffd9b0', '#f08a6a', '#fff4e0']
    },
    midnight: {
      needle: [[150, 196, 255], [226, 236, 255]],
      garland: [255, 240, 205],
      star: '#fff3cf',
      orbs: ['#e7ecff', '#9fc3ff', '#f2d28b', '#c9b6ff', '#ffffff']
    }
  };

  const NOTES = [
    'Someone out there is glad you exist.',
    'Let this season move a little slower than usual.',
    'Warm tea, soft socks, and a call with someone you miss.',
    "You're allowed to rest. Nothing has to be finished today.",
    'Small kindnesses count for more than we admit.',
    'Set something heavy down, just for tonight.',
    'Here is to the people who make ordinary days feel like home.',
    'Your quiet kindness is noticed more than you know.',
    'May the year ahead be gentler than the one behind it.',
    'Hold on a little longer. The light is coming.',
    'Someone is thinking of you right now.',
    'Christmas is a good time to say the thing you have been holding.'
  ];

  const R = 0.46;                    // cone radius at the base, in tree units
  const N = lowPower ? 1300 : 2400;  // needle count
  const GARLAND = 170;
  const ORNAMENTS = 12;

  // Geometry lives in unit space: y runs from -0.5 (tip) to 0.5 (base).
  const needles = Array.from({ length: N }, () => {
    const u = Math.random();
    const rad = 0.5 + 0.5 * Math.sqrt(Math.random());
    return { u, theta: Math.random() * Math.PI * 2, rad, tone: Math.random(), twinkle: Math.random() * 6.28 };
  });
  const garland = Array.from({ length: GARLAND }, (_, i) => {
    const u = i / (GARLAND - 1);
    return { u, theta: u * 14 * Math.PI, phase: Math.random() * 6.28 };
  });
  const orbs = Array.from({ length: ORNAMENTS }, (_, i) => {
    const u = 0.28 + (i / ORNAMENTS) * 0.6;
    return { u, theta: i * GOLDEN, size: 0.9 + (i % 3) * 0.25, colorIndex: i % 5, note: NOTES[i], glow: 0 };
  });

  let mood = 'aurora';
  let palette = MOODS.aurora;
  let needleColors = [];
  let rot = Math.random() * Math.PI * 2;
  let spin = motion.matches ? 0 : 0.16; // radians per second at rest; still under reduced motion
  let vel = spin;
  let light = 0.35, lightTarget = 0.35; // a gentle glow from the start
  let W = 0, H = 0, dpr = 1, S = 1, cx = 0, cy = 0;
  let bursts = [];
  let raf = 0, last = 0, visible = true;
  let drag = null;

  function paintNeedles() {
    const [a, b] = palette.needle;
    needleColors = needles.map((n) => {
      const t = Math.min(1, n.u * 0.75 + n.tone * 0.25);
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
      ];
    });
  }

  // Project a point from unit space into screen pixels, with perspective.
  function project(x, y, z) {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    const X = x * c + z * s;
    const Z = -x * s + z * c;
    const p = 2.6 / (2.6 - Z);
    return { sx: cx + X * S * p, sy: cy + y * S * p, p, z: Z };
  }

  function unitPoint(u, theta, radius) {
    const y = -0.5 + u;
    const r = R * u * radius;
    return { x: r * Math.cos(theta), y, z: r * Math.sin(theta) };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H * 0.52;
    S = Math.min(W * 0.92, H * 0.9);
    render();
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, W, H);

    // Soft ground glow
    const g = ctx.createRadialGradient(cx, cy + S * 0.48, 0, cx, cy + S * 0.48, S * 0.6);
    g.addColorStop(0, `rgba(${palette.garland.join(',')},${0.12 + light * 0.1})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Needles, drawn back to front
    const pts = needles.map((n, i) => {
      const pos = unitPoint(n.u, n.theta, n.rad);
      const pr = project(pos.x, pos.y, pos.z);
      return { i, pr };
    });
    pts.sort((a, b) => a.pr.z - b.pr.z);
    const t = now * 0.001;
    for (const { i, pr } of pts) {
      const n = needles[i];
      const c = needleColors[i];
      const twinkle = 0.75 + 0.25 * Math.sin(t * 1.4 + n.twinkle);
      const alpha = Math.min(1, (0.42 + 0.5 * n.u) * twinkle * (0.9 + 0.1 * light));
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
      const size = 2.2 * pr.p;
      ctx.fillRect(pr.sx, pr.sy, size, size);
    }

    // Garland of warm lights: a spiral that ignites
    if (light > 0.01) {
      for (const d of garland) {
        const pos = unitPoint(d.u, d.theta, 1.04);
        const pr = project(pos.x, pos.y, pos.z);
        const b = light * (0.55 + 0.45 * Math.sin(t * 2.6 + d.phase));
        const [r, gg, bb] = palette.garland;
        ctx.fillStyle = `rgba(${r},${gg},${bb},${(0.18 * b).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 7 * pr.p, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${r},${gg},${bb},${(0.95 * b).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, 1.9 * pr.p, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ornaments, back to front
    const drawn = orbs.map((o) => {
      const pos = unitPoint(o.u, o.theta, 0.94);
      const pr = project(pos.x, pos.y, pos.z);
      return { o, pr };
    }).sort((a, b) => a.pr.z - b.pr.z);
    for (const { o, pr } of drawn) {
      const color = palette.orbs[o.colorIndex];
      const r = 6.5 * o.size * pr.p;
      const glow = o.glow;
      if (glow > 0.01) {
        ctx.fillStyle = `rgba(255,240,200,${(glow * 0.35).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, r * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.beginPath();
      ctx.arc(pr.sx - r * 0.35, pr.sy - r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Star on top
    const top = project(0, -0.54, 0);
    const pulse = 1 + 0.08 * Math.sin(t * 2.2);
    const starR = S * 0.055 * pulse;
    const sg = ctx.createRadialGradient(top.sx, top.sy, 0, top.sx, top.sy, starR * 3.2);
    sg.addColorStop(0, `rgba(255,236,170,${(0.55 * (0.5 + light * 0.5)).toFixed(3)})`);
    sg.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(top.sx, top.sy, starR * 3.2, 0, Math.PI * 2);
    ctx.fill();
    drawStar(top.sx, top.sy, starR, palette.star);

    // Wish bursts
    bursts = bursts.filter((b) => b.life > 0);
    for (const b of bursts) {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.02;
      b.life -= 0.018;
      ctx.fillStyle = `rgba(255,240,200,${Math.max(0, b.life).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStar(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.42 : r;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = x + rad * Math.cos(a);
      const py = y + rad * Math.sin(a);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function step(dt) {
    // Spin eases back to its resting speed after a drag
    vel += (spin - vel) * Math.min(1, dt * 1.6);
    if (!drag) rot += vel * dt;
    // Lights fade in and out
    light += (lightTarget - light) * Math.min(1, dt * 2.2);
    if (Math.abs(light - lightTarget) < 0.002) light = lightTarget;
    for (const o of orbs) o.glow = Math.max(0, o.glow - dt * 0.9);
  }

  function render(now = performance.now()) {
    drawFrame(now);
  }

  function loop(now) {
    raf = 0;
    if (!visible) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    step(dt);
    drawFrame(now);
    const moving = Math.abs(vel - spin) > 0.001 || Math.abs(light - lightTarget) > 0 || bursts.length || orbs.some((o) => o.glow > 0) || drag;
    if (!motion.matches || moving) raf = requestAnimationFrame(loop);
    else last = 0;
  }

  function kick() {
    if (!raf && visible) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }

  function say(text) {
    if (tip) tip.textContent = text;
  }

  function activateOrnament(index) {
    const o = orbs[index];
    if (!o) return;
    o.glow = 1;
    say(o.note);
    kick();
  }

  function burstAt(x, y) {
    if (motion.matches) return;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.2;
      const sp = 1.2 + Math.random() * 2.2;
      bursts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, r: 1.2 + Math.random() * 1.8, life: 1 });
    }
    kick();
  }

  function hitTest(x, y) {
    let hit = -1;
    let best = 18;
    orbs.forEach((o, i) => {
      const pos = unitPoint(o.u, o.theta, 0.94);
      const pr = project(pos.x, pos.y, pos.z);
      const d = Math.hypot(pr.sx - x, pr.sy - y);
      if (d < best) { best = d; hit = i; }
    });
    if (hit >= 0) return { type: 'orb', index: hit };
    const top = project(0, -0.54, 0);
    if (Math.hypot(top.sx - x, top.sy - y) < 26) return { type: 'star' };
    return null;
  }

  function wish() {
    const top = project(0, -0.54, 0);
    burstAt(top.sx, top.sy);
    lightTarget = 1;
    if (lightBtn) lightBtn.setAttribute('aria-pressed', 'true');
    say('You made a wish, and the star heard it.');
    setLightLabel();
    kick();
  }

  function setLightLabel() {
    if (!lightBtn) return;
    const on = lightTarget === 1;
    lightBtn.textContent = on ? 'Dim the tree' : 'Light the tree';
    lightBtn.setAttribute('aria-pressed', String(on));
  }

  // Pointer: drag to turn, tap to pick
  canvas.addEventListener('pointerdown', (event) => {
    drag = { x: event.clientX, y: event.clientY, moved: 0 };
    canvas.setPointerCapture?.(event.pointerId);
    kick();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    rot += dx * 0.009;
    vel = dx * 0.9;
    drag.x = event.clientX;
    drag.y = event.clientY;
    kick();
  });
  canvas.addEventListener('pointerup', (event) => {
    if (drag && drag.moved < 8) {
      const rect = canvas.getBoundingClientRect();
      const hit = hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (hit?.type === 'orb') activateOrnament(hit.index);
      else if (hit?.type === 'star') wish();
    }
    drag = null;
    kick();
  });
  canvas.addEventListener('pointercancel', () => { drag = null; });

  // Keyboard: arrows turn the tree
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { rot -= 0.12; kick(); event.preventDefault(); }
    if (event.key === 'ArrowRight') { rot += 0.12; kick(); event.preventDefault(); }
  });

  // Accessible ornament buttons
  orbs.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Ornament ${i + 1}: read its note`);
    btn.title = `Ornament ${i + 1}`;
    btn.style.background = palette.orbs[o.colorIndex];
    btn.addEventListener('click', () => activateOrnament(i));
    dotsWrap?.appendChild(btn);
  });

  lightBtn?.addEventListener('click', () => {
    lightTarget = lightTarget === 1 ? 0 : 1;
    setLightLabel();
    say(lightTarget ? 'Every little light is on.' : 'The tree rests in the dark for a moment.');
    kick();
  });
  wishBtn?.addEventListener('click', wish);

  document.querySelectorAll('[data-mood-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      mood = btn.dataset.moodChoice;
      palette = MOODS[mood] || MOODS.aurora;
      if (frameEl) frameEl.dataset.mood = mood;
      document.querySelectorAll('[data-mood-choice]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      paintNeedles();
      dotsWrap?.querySelectorAll('button').forEach((b, i) => {
        b.style.background = palette.orbs[orbs[i].colorIndex];
      });
      render();
      kick();
    });
  });

  // Only animate while the tree is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) kick();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick();
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => resize()).observe(canvas);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  paintNeedles();
  setLightLabel();
  resize();
  if (!motion.matches) kick();

  app.tree = { activateOrnament, wish };
})();
