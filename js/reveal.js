/* The reveal: box, ribbon, envelope, letter. The step lives in data-step on the modal. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const modal = document.getElementById('revealModal');
  if (!modal) return;
  const $ = (id) => document.getElementById(id);
  const giftBox = $('giftBox');
  const envelope = $('envelope');
  const letter = $('letter');
  const hint = $('stepHint');
  const actions = $('modalActions');
  const muteBtn = $('muteMusic');
  const skipBtn = $('skipReveal');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const HINTS = {
    box: 'Tap the box to open it.',
    opening: 'A little magic, just for you…',
    envelope: 'There is a letter inside. Tap the envelope.',
    flap: '',
    letter: ''
  };

  let lastFocus = null;
  let current = null;
  let player = null;
  let timers = [];

  // Soft generated music. Nothing is downloaded or uploaded.
  function startMusic(kind) {
    stopMusic();
    if (!kind || kind === 'none') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let ctx;
    try { ctx = new AC(); } catch (error) { return; }
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.5);
    let timer = 0;
    let alive = true;

    if (kind === 'pad') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 950;
      filter.connect(master);
      [130.81, 196, 261.63, 329.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 5;
        gain.gain.value = 0.22;
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
      });
    } else {
      const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
      const chime = () => {
        if (!alive) return;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + 2.7);
        timer = setTimeout(chime, 1100 + Math.random() * 1300);
      };
      chime();
    }

    player = {
      ctx,
      master,
      muted: false,
      stop() {
        alive = false;
        clearTimeout(timer);
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        setTimeout(() => ctx.close().catch(() => {}), 800);
      }
    };
    muteBtn.hidden = false;
    muteBtn.textContent = 'Mute music';
  }

  function stopMusic() {
    if (player) {
      player.stop();
      player = null;
    }
    muteBtn.hidden = true;
  }

  muteBtn.addEventListener('click', () => {
    if (!player) return;
    player.muted = !player.muted;
    player.master.gain.setTargetAtTime(player.muted ? 0 : 0.14, player.ctx.currentTime, 0.2);
    muteBtn.textContent = player.muted ? 'Play music' : 'Mute music';
  });

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, motion.matches ? 0 : ms));
  }

  function setStep(step) {
    modal.dataset.step = step;
    hint.textContent = HINTS[step] || '';
    actions.hidden = step !== 'letter';
    if (step === 'letter') {
      sparkle();
      $('downloadCard').focus({ preventScroll: true });
    }
    if (step === 'box') giftBox.focus({ preventScroll: true });
    if (step === 'envelope') envelope.focus({ preventScroll: true });
  }

  function openBox() {
    if (modal.dataset.step !== 'box') return;
    setStep('opening');
    startMusic(current && current.music);
    later(() => setStep('envelope'), 1000);
  }

  function openEnvelope() {
    if (modal.dataset.step !== 'envelope') return;
    setStep('flap');
    later(() => setStep('letter'), 800);
  }

  function skip() {
    clearTimers();
    if (modal.dataset.step !== 'letter' && current && current.music !== 'none' && !player) {
      startMusic(current.music);
    }
    setStep('letter');
  }

  function replay() {
    clearTimers();
    stopMusic();
    setStep('box');
  }

  function sparkle() {
    if (motion.matches) return;
    const stage = $('letter').parentElement;
    for (let i = 0; i < 24; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      spark.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      spark.style.setProperty('--y', (30 + Math.random() * 60).toFixed(1) + '%');
      spark.style.setProperty('--d', (0.9 + Math.random() * 0.9).toFixed(2) + 's');
      spark.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
      stage.appendChild(spark);
      setTimeout(() => spark.remove(), 2600);
    }
  }

  function openReveal(data) {
    current = data;
    lastFocus = document.activeElement;
    stopMusic();
    clearTimers();
    $('resultRecipient').textContent = data.recipient;
    $('resultSender').textContent = data.sender;
    $('resultMessage').textContent = data.message;
    letter.className = `letter theme-${data.theme} type-${data.typeface}`;
    modal.dataset.step = 'box';
    hint.textContent = HINTS.box;
    actions.hidden = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    setTimeout(() => giftBox.focus({ preventScroll: true }), 120);
  }

  function close() {
    if (!modal.classList.contains('open')) return;
    clearTimers();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    stopMusic();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  giftBox.addEventListener('click', openBox);
  envelope.addEventListener('click', openEnvelope);
  skipBtn.addEventListener('click', skip);
  $('replayGift').addEventListener('click', replay);
  $('modalClose').addEventListener('click', close);
  modal.querySelector('.modal-backdrop').addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button')].filter((node) => !node.disabled && node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const inside = modal.contains(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  });

  app.openReveal = openReveal;
  app.closeReveal = close;
})();
