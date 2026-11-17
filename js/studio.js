/* Letter studio: form, validation and the live postcard preview. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const form = document.getElementById('giftForm');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const LIMIT = 420;
  const DEFAULT_MESSAGE = 'May your days be gentle, your heart be light, and your Christmas be filled with little things that make you smile.';

  app.OCCASIONS = {
    warmth: 'A little warmth for',
    gratitude: 'With gratitude for',
    joy: 'Joy & laughter for',
    friendship: "A friend's wish for",
    love: 'All my love to'
  };

  const recipient = $('recipient');
  const sender = $('sender');
  const message = $('message');
  const occasion = $('occasion');
  const typeface = $('typeface');
  const music = $('music');
  const card = $('postcard');
  const count = $('charCount');
  let theme = 'kraft';

  function paint() {
    card.classList.remove('theme-kraft', 'theme-aurora', 'theme-ember');
    card.classList.add('theme-' + theme);
    card.classList.remove('type-hand', 'type-serif', 'type-italic');
    card.classList.add('type-' + typeface.value);

    const name = recipient.value.trim();
    const from = sender.value.trim();
    const text = message.value.trim();
    $('pcRecipient').textContent = name || 'Someone special';
    $('pcSender').textContent = from || 'someone who cares';
    $('pcMessage').textContent = text || DEFAULT_MESSAGE;
    $('pcKicker').textContent = app.OCCASIONS[occasion.value] || app.OCCASIONS.warmth;
    card.classList.toggle('is-long', text.length > 240);
    count.textContent = message.value.length;
    count.parentElement.style.color = message.value.length > LIMIT * 0.9 ? 'var(--gold)' : '';
  }

  [recipient, sender, message, occasion, typeface].forEach((el) => {
    el.addEventListener('input', paint);
    el.addEventListener('change', paint);
  });

  document.querySelectorAll('.swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      theme = btn.dataset.theme;
      document.querySelectorAll('.swatch').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      paint();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      recipient: recipient.value.trim(),
      sender: sender.value.trim(),
      message: message.value.trim(),
      occasion: occasion.value,
      typeface: typeface.value,
      music: music.value,
      theme
    };
    if (!data.recipient || !data.sender || !data.message) {
      app.toast?.('Add both names and a little message first.');
      return;
    }
    if (data.message.length > LIMIT) {
      app.toast?.('Your letter is a little too long.');
      return;
    }
    app.currentGift = data;
    app.openReveal?.(data);
  });

  paint();
})();
