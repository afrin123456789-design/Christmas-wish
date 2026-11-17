/* Postcard download (PNG) and WhatsApp sharing. Everything is drawn on the device. */
(() => {
  const app = (window.ChristmasMagic ||= {});
  const downloadBtn = document.getElementById('downloadCard');
  const shareBtn = document.getElementById('shareGift');
  if (!downloadBtn || !shareBtn) return;

  const PAPER = {
    kraft: { top: '#f1e4c4', bottom: '#dcc49a', ink: '#3a2a1f', accent: '#8a3b4f', rule: 'rgba(90,60,40,.32)' },
    aurora: { top: '#f5f1ff', bottom: '#d9cdfd', ink: '#2a2160', accent: '#2f8f7b', rule: 'rgba(42,33,96,.28)' },
    ember: { top: '#6e2540', bottom: '#3a1224', ink: '#f7e6cf', accent: '#e8c27a', rule: 'rgba(232,194,122,.4)' }
  };

  const FONTS = {
    hand: { to: (s) => `600 ${s}px Caveat`, message: (s) => `500 ${s}px Caveat`, startTo: 150, startMsg: 62, lead: 1.22 },
    serif: { to: (s) => `500 ${s}px Fraunces`, message: (s) => `400 ${s}px Fraunces`, startTo: 118, startMsg: 42, lead: 1.5 },
    italic: { to: (s) => `italic 400 ${s}px Fraunces`, message: (s) => `italic 400 ${s}px Fraunces`, startTo: 118, startMsg: 42, lead: 1.5 }
  };

  const setSpacing = (ctx, value) => {
    if ('letterSpacing' in ctx) ctx.letterSpacing = value;
  };

  function wrapParagraph(ctx, text, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  const wrapAll = (ctx, text, maxWidth) =>
    text.split(/\n+/).flatMap((p) => wrapParagraph(ctx, p, maxWidth));

  // Shrink the letter until it fits the card, so nothing is cut off.
  function fitMessage(ctx, text, font, maxWidth, maxHeight) {
    for (let size = font.startMsg; size >= 24; size -= 2) {
      ctx.font = font.message(size);
      const lines = wrapAll(ctx, text, maxWidth);
      const lineHeight = size * font.lead;
      if (lines.length * lineHeight <= maxHeight) return { lines, size, lineHeight };
    }
    ctx.font = font.message(24);
    return { lines: wrapAll(ctx, text, maxWidth), size: 24, lineHeight: 24 * font.lead };
  }

  async function drawCard(data) {
    const font = FONTS[data.typeface] || FONTS.hand;
    const paper = PAPER[data.theme] || PAPER.kraft;
    if (document.fonts && document.fonts.load) {
      await Promise.allSettled([
        document.fonts.load('600 80px Caveat'),
        document.fonts.load('500 40px Caveat'),
        document.fonts.load('500 40px Fraunces'),
        document.fonts.load('italic 400 40px Fraunces'),
        document.fonts.load('600 24px Manrope')
      ]);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'alphabetic';

    // Paper
    const bg = ctx.createLinearGradient(0, 0, 1200, 1500);
    bg.addColorStop(0, paper.top);
    bg.addColorStop(1, paper.bottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 1500);

    // Frame
    ctx.strokeStyle = paper.rule;
    ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, 1108, 1408);
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(70, 70, 1060, 1360);
    ctx.setLineDash([]);

    // Stamp
    ctx.save();
    ctx.translate(1040, 150);
    ctx.rotate(0.05);
    ctx.strokeStyle = paper.accent;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(-112, -82, 224, 178);
    ctx.setLineDash([]);
    ctx.fillStyle = paper.accent;
    ctx.textAlign = 'center';
    setSpacing(ctx, '4px');
    ctx.font = '600 22px Manrope';
    ctx.fillText('MERRY', 0, -20);
    ctx.fillText('CHRISTMAS', 0, 10);
    ctx.font = '600 30px Fraunces';
    setSpacing(ctx, '2px');
    ctx.fillText('2026', 0, 58);
    setSpacing(ctx, '0px');
    ctx.restore();

    // Kicker
    ctx.textAlign = 'left';
    ctx.fillStyle = paper.accent;
    setSpacing(ctx, '6px');
    ctx.font = '600 24px Manrope';
    ctx.fillText((app.OCCASIONS && app.OCCASIONS[data.occasion]) || 'A little warmth for', 110, 200);
    setSpacing(ctx, '0px');

    // Recipient
    ctx.fillStyle = paper.ink;
    let toSize = font.startTo;
    ctx.font = font.to(toSize);
    while (toSize > 60 && ctx.measureText(data.recipient).width > 980) {
      toSize -= 6;
      ctx.font = font.to(toSize);
    }
    ctx.fillText(data.recipient, 110, 330);

    // Rule under the name
    ctx.strokeStyle = paper.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 375);
    ctx.lineTo(560, 375);
    ctx.stroke();

    // Message
    ctx.fillStyle = paper.ink;
    const { lines, lineHeight } = fitMessage(ctx, data.message, font, 980, 700);
    let y = 460;
    lines.forEach((line) => {
      ctx.fillText(line, 110, y);
      y += lineHeight;
    });

    // Sign-off
    const signY = Math.min(y + 60, 1250);
    ctx.font = '500 52px Caveat';
    ctx.fillText('With love,', 110, signY);
    ctx.font = '600 84px Caveat';
    ctx.fillStyle = paper.accent;
    let senderSize = 84;
    while (senderSize > 40 && ctx.measureText(data.sender).width > 980) {
      senderSize -= 4;
      ctx.font = `600 ${senderSize}px Caveat`;
    }
    ctx.fillText(data.sender, 110, signY + 90);

    // Barcode (decorative)
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    ctx.fillStyle = paper.ink;
    let bx = 110;
    while (bx < 1090) {
      const w = 2 + Math.floor(rand() * 5);
      ctx.globalAlpha = 0.7;
      ctx.fillRect(bx, 1280, w, 66);
      bx += w + 2 + Math.floor(rand() * 5);
    }
    ctx.globalAlpha = 1;

    // Footer
    ctx.fillStyle = paper.accent;
    setSpacing(ctx, '5px');
    ctx.font = '600 20px Manrope';
    ctx.fillText('EVERYDAY WITH AFRIN', 110, 1392);
    setSpacing(ctx, '0px');

    return canvas;
  }

  downloadBtn.addEventListener('click', async () => {
    const data = app.currentGift;
    if (!data) return;
    try {
      const canvas = await drawCard(data);
      const slug = data.recipient.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'letter';
      canvas.toBlob((blob) => {
        if (!blob) {
          app.toast?.('Could not create the postcard on this device.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `christmas-postcard-${slug}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        app.toast?.('Your postcard is ready to keep.');
      }, 'image/png');
    } catch (error) {
      app.toast?.('Could not create the postcard on this device.');
    }
  });

  shareBtn.addEventListener('click', () => {
    const d = app.currentGift;
    if (!d) return;
    const text = `A little Christmas letter for ${d.recipient}\n\n${d.message}\n\nWith love, ${d.sender}\n\nMade with a little Christmas magic.`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
  });
})();
