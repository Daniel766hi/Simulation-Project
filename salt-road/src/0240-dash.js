  // ================================================================== DASH
  // Shift (or RUN on touch) bursts forward. Dashing into a monster ambushes it: a free hit on every foe and the party acts first.
  const DASH_TIME = 0.2, DASH_SPEED = 270, DASH_COOLDOWN = 0.6;
  function dash() {
    if (mode !== "play" || player.dashCd > 0) return;
    let mx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0) + stick.x;
    let my = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0) + stick.y;
    if (Math.hypot(mx, my) < 0.1) { mx = player.dir === "left" ? -1 : player.dir === "right" ? 1 : 0; my = player.dir === "up" ? -1 : player.dir === "down" ? 1 : 0; }
    const l = Math.hypot(mx, my) || 1;
    player.dashX = mx / l; player.dashY = my / l; player.dashT = DASH_TIME; player.dashCd = DASH_COOLDOWN;
    shake = Math.max(shake, 1.5);
    Music.sound("dash");
    for (let i = 0; i < (REDUCED ? 3 : 10); i++) particles.push({ x: G.px + rand(-4, 4), y: G.py + rand(-1, 2), vx: -player.dashX * rand(20, 60) + rand(-20, 20), vy: -player.dashY * rand(20, 60) - rand(5, 25), life: rand(0.3, 0.6), color: pick(["#d8d0e6", "#c3b8d8", "#ffffff"]), size: 2, world: true });
  }

