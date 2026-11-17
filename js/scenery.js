/* Procedural winter scenery and starfields. Seeded, so each visit draws the same landscape. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };
  const rng = (seed) => {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  const gens = {
    ridge(svg, rand, o) {
      let d = `M0 ${o.base} L0 ${Math.round(o.top + rand() * 110)}`;
      let x = 0;
      let up = true;
      while (x < 1440) {
        x += 140 + rand() * 180;
        const y = up ? o.top + rand() * 70 : o.top + 140 + rand() * 110;
        d += ` L${Math.round(x)} ${Math.round(y)}`;
        up = !up;
      }
      d += ` L1440 ${o.base} Z`;
      svg.appendChild(mk('path', { d, fill: o.color }));
    },

    pines(svg, rand, o) {
      let d = '';
      for (let x = -10; x < 1450; x += 16 + rand() * 22) {
        const hgt = o.min + rand() * (o.max - o.min);
        const wid = hgt * (0.24 + rand() * 0.05);
        const top = o.base - hgt;
        const mid = o.base - hgt * 0.45;
        d += `M${Math.round(x)} ${Math.round(top)} L${Math.round(x + wid * 0.6)} ${Math.round(mid)} L${Math.round(x + wid)} ${o.base} L${Math.round(x - wid)} ${o.base} L${Math.round(x - wid * 0.6)} ${Math.round(mid)} Z `;
      }
      svg.appendChild(mk('path', { d, fill: o.color }));
    },

    village(svg, rand, o) {
      for (let x = 20; x < 1460;) {
        const width = 40 + rand() * 34;
        const height = 34 + rand() * 30;
        const roof = 20 + rand() * 12;
        const base = o.base + Math.round(Math.sin(x / 210) * 26);
        const top = base - height;
        const x0 = Math.round(x);
        const x1 = Math.round(x + width);
        svg.appendChild(mk('rect', { x: x0, y: Math.round(top), width: x1 - x0, height: Math.round(height), fill: o.color }));
        svg.appendChild(mk('path', {
          d: `M${x0 - 6} ${Math.round(top)} L${Math.round((x0 + x1) / 2)} ${Math.round(top - roof)} L${x1 + 6} ${Math.round(top)} Z`,
          fill: o.roof
        }));
        const wins = 1 + Math.floor(rand() * 2);
        for (let k = 0; k < wins; k++) {
          svg.appendChild(mk('rect', {
            x: Math.round(x0 + (x1 - x0) * (0.2 + (0.5 * k) / wins)),
            y: Math.round(top + height * 0.4),
            width: 7,
            height: 9,
            class: rand() < 0.75 ? 'lamp' : 'lamp dim',
            style: `animation-delay:${(rand() * 4).toFixed(2)}s`
          }));
        }
        x += width + 14 + rand() * 30;
      }
    },

    snowfield(svg) {
      svg.appendChild(mk('path', {
        d: 'M0 520 Q360 470 720 506 T1440 492 L1440 600 L0 600 Z',
        fill: svg.dataset.fill || '#efe8f8'
      }));
    }
  };

  document.querySelectorAll('[data-scenery] [data-gen]').forEach((host) => {
    const ds = host.dataset;
    const svg = mk('svg', { viewBox: '0 0 1440 600', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' });
    svg.dataset.fill = ds.color;
    host.appendChild(svg);
    gens[ds.gen]?.(svg, rng(Number(ds.seed || 1)), {
      base: Number(ds.base || 600),
      top: Number(ds.top || 200),
      min: Number(ds.min || 120),
      max: Number(ds.max || 200),
      color: ds.color || '#2a1f50',
      roof: ds.roof || '#f3efff'
    });
  });

  document.querySelectorAll('[data-stars]').forEach((host) => {
    const rand = rng(77);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 150; i++) {
      const star = document.createElement('span');
      star.className = 'twinkle';
      const size = rand() < 0.12 ? 3 : rand() < 0.4 ? 2 : 1.5;
      star.style.cssText = `position:absolute;left:${(rand() * 100).toFixed(2)}%;top:${(rand() * 100).toFixed(2)}%;width:${size}px;height:${size}px;border-radius:50%;background:#fff6dc;box-shadow:0 0 6px rgba(255,240,200,.6);animation:twinkle ${(3 + rand() * 4).toFixed(2)}s ease-in-out ${(rand() * 5).toFixed(2)}s infinite`;
      frag.appendChild(star);
    }
    host.appendChild(frag);
  });
})();
