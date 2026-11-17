/* Shareable letter links. The whole letter is packed into the URL fragment (after #),
   which browsers never send to the host, so GitHub Pages needs no backend. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  app.OCCASIONS ||= {
    warmth: 'A little warmth for',
    gratitude: 'With gratitude for',
    joy: 'Joy & laughter for',
    friendship: "A friend's wish for",
    love: 'All my love to'
  };

  const TYPES = ['hand', 'serif', 'italic'];
  const THEMES = ['kraft', 'aurora', 'ember'];
  const MUSIC = ['none', 'bells', 'pad'];
  const OCCASION_KEYS = Object.keys(app.OCCASIONS);
  const pick = (value, list, fallback) => (list.includes(value) ? value : fallback);

  function encode(data) {
    const payload = {
      r: data.recipient, s: data.sender, m: data.message,
      t: data.typeface, h: data.theme, u: data.music, o: data.occasion
    };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decode(token) {
    if (!token || token.length > 4000 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    let payload;
    try {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      payload = JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      return null;
    }
    const text = (value, max) => (typeof value === 'string' ? value.slice(0, max).trim() : '');
    const data = {
      recipient: text(payload.r, 36),
      sender: text(payload.s, 36),
      message: text(payload.m, 420),
      typeface: pick(payload.t, TYPES, 'hand'),
      theme: pick(payload.h, THEMES, 'kraft'),
      music: pick(payload.u, MUSIC, 'none'),
      occasion: pick(payload.o, OCCASION_KEYS, 'warmth')
    };
    if (!data.recipient || !data.sender || !data.message) return null;
    return data;
  }

  const baseUrl = () => window.location.href.split('#')[0];
  const linkFor = (token) => `${baseUrl()}#letter=${token}`;
  const tokenFromHash = () => {
    const match = window.location.hash.match(/^#letter=([A-Za-z0-9_-]+)$/);
    return match ? match[1] : null;
  };

  // ----- The link maker on this page -----
  const form = document.getElementById('linkForm');
  if (form) {
    const $ = (id) => document.getElementById(id);
    const count = $('s-count');
    const out = $('linkOut');
    const field = $('linkField');
    const wa = $('waLink');
    let lastData = null;

    const CHRISTMAS_MESSAGE =
      'And the angel said unto them, Fear not: for, behold, I bring you good tidings of great joy, which shall be to all people. ' +
      'For unto you is born this day in the city of David a Saviour, which is Christ the Lord. ' +
      'Glory to God in the highest, and on earth peace, good will toward men. (Luke 2:10–11, 14, King James Version)';

    const preset = $('s-preset');
    const syncCount = () => { count.textContent = $('s-message').value.length; };
    $('s-message').addEventListener('input', syncCount);
    if (preset) {
      preset.addEventListener('change', () => {
        if (preset.value === 'christmas') {
          $('s-message').value = CHRISTMAS_MESSAGE;
          app.toast?.('The Christmas message is in. Add your name and make it yours.');
        }
        syncCount();
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = {
        recipient: $('s-recipient').value.trim(),
        sender: $('s-sender').value.trim(),
        message: $('s-message').value.trim(),
        typeface: $('s-typeface').value,
        theme: $('s-theme').value,
        music: $('s-music').value,
        occasion: 'warmth'
      };
      if (!data.recipient || !data.sender || !data.message) {
        app.toast?.('Add both names and a little message first.');
        return;
      }
      const url = linkFor(encode(data));
      lastData = data;
      app.currentGift = data;
      field.value = url;
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(
        `A little Christmas letter for ${data.recipient}, from ${data.sender}.\n\nOpen it here: ${url}`
      );
      out.hidden = false;
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    $('copyLink').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(field.value);
        app.toast?.('Link copied. Send it to them.');
      } catch (error) {
        field.select();
        app.toast?.('Press and hold the link to copy it.');
      }
    });

    $('previewLink').addEventListener('click', () => {
      if (!lastData) return;
      const token = field.value.split('#letter=')[1];
      if (token && window.location.hash !== '#letter=' + token) {
        window.location.hash = 'letter=' + token;
      } else {
        app.openReveal?.(lastData);
      }
    });
  }

  // ----- Opening a shared link -----
  function openFromHash() {
    const hash = window.location.hash;
    if (!hash.startsWith('#letter=')) return;
    const data = decode(hash.slice('#letter='.length));
    if (!data) {
      app.toast?.('This link looks incomplete. Ask for it to be sent again.');
      return;
    }
    app.currentGift = data;
    app.openReveal?.(data);
  }

  window.addEventListener('hashchange', openFromHash);
  if (window.location.hash.startsWith('#letter=')) setTimeout(openFromHash, 350);

  app.encodeLetter = encode;
  app.decodeLetter = decode;
})();
