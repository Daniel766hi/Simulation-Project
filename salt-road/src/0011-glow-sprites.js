  // ================================================================== GLOW SPRITES
  // A soft round glow, drawn once per colour and then stamped wherever a lamp, fire, window or firefly shines (or
  // wherever the dark has a hole cut in it). Building a fresh gradient for every light on every frame was the most
  // expensive thing the effects did; a cached sprite costs one image draw.
  const GLOW = new Map();
  function glowSprite(rgb) {
    let c = GLOW.get(rgb); if (c) return c;
    c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    const gr = x.createRadialGradient(32, 32, 0.5, 32, 32, 32); gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); GLOW.set(rgb, c); return c;
  }
  function drawGlow(ctx2, rgb, x, y, r, a) {
    if (a <= 0.003 || r <= 0) return;
    const was = ctx2.globalAlpha; ctx2.globalAlpha = was * Math.min(1, a); ctx2.drawImage(glowSprite(rgb), x - r, y - r, r * 2, r * 2); ctx2.globalAlpha = was;
  }
