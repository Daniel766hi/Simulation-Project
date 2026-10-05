  // ================================================================== WARPS & MAP FOG
  // Passages between regions. Stepping onto a warp tile moves the party; a closed one explains why.
  const WARPS = [
    { x: 61, y: 11, to: [89, 30], req: () => G.stage >= 7 },
    { x: 89, y: 31, to: [61, 13] },
    { x: 12, y: 51, to: [14, 58], req: () => G.stage >= 8, msg: "The road south is flooded knee-deep, and the water is still rising. (Chapter VIII)" },
    { x: 14, y: 57, to: [12, 49] },
    { x: 104, y: 17, to: [109, 50], req: () => G.stage >= 10, msg: "The east gate is barred. A sign reads: STORM ROAD CLOSED BY ORDER OF THE MAYOR. (Chapter X)" },
    { x: 108, y: 50, to: [102, 17] },
    { x: 118, y: 32, to: [118, 29], req: () => G.stage >= 11, msg: "The Spire door is sealed by a storm-ward that crackles against your fingers. (Chapter XI)" },
    { x: 118, y: 30, to: [118, 34] },
    { x: 125, y: 23, to: [124, 18] }, { x: 125, y: 19, to: [124, 24] },
    { x: 111, y: 13, to: [112, 8] }, { x: 111, y: 9, to: [112, 14] },
    { x: 117, y: 86, to: [89, 50], req: () => G.stage >= 12 && G.flags.bellReady, msg: "A whirlpool churns below the pier. Without Nell's diving bell, you'd drown. (Chapter XII)" },
    { x: 89, y: 52, to: [117, 84] },
    { x: 38, y: 29, to: [135, 16], req: () => G.flags.minesOpen },
    { x: 133, y: 16, to: [37, 29] },
    { x: 166, y: 4, to: [165, 22] }, { x: 167, y: 22, to: [166, 5] },
    { x: 134, y: 34, to: [135, 40] }, { x: 133, y: 40, to: [135, 34] },
  ];
  let warpFade = 0;
  // Safety net: if the party ever ends up inside something solid (an old save, a push), step to the nearest free spot.
  function unstick() {
    if (!blocked(G.px, G.py)) return;
    for (let r = 4; r <= 96; r += 4) for (let a = 0; a < 16; a++) {
      const x = G.px + Math.cos(a / 16 * Math.PI * 2) * r, y = G.py + Math.sin(a / 16 * Math.PI * 2) * r;
      if (!blocked(x, y)) { G.px = x; G.py = y; player.scarf = []; return; }
    }
    G.px = G.checkpoint.x; G.py = G.checkpoint.y;
  }
  function checkWarp() {
    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE), key = tx + "," + ty;
    if (player.lastTile === key) return;
    player.lastTile = key;
    const w = WARPS.find(w => w.x === tx && w.y === ty);
    if (!w) return;
    if (w.req && !w.req()) { if (w.msg) once("warp" + key, () => toast(w.msg)); return; }
    G.px = w.to[0] * TILE + 8; G.py = w.to[1] * TILE + 8;
    player.lastTile = w.to[0] + "," + w.to[1]; player.scarf = []; player.dashT = 0;
    camX = clamp(G.px - VIEW_W / 2, 0, W * TILE - VIEW_W); camY = clamp(G.py - VIEW_H / 2 - 8, 0, H * TILE - VIEW_H);
    warpFade = 1; Music.sound("dash");
  }
  const FOG = 10, FW = Math.ceil(W / FOG), FH = Math.ceil(H / FOG);
  function reveal() {
    const cx = Math.floor(G.px / TILE / FOG), cy = Math.floor(G.py / TILE / FOG);
    let s2 = G.flags.fog || "0".repeat(FW * FH), changed = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= FW || y >= FH) continue;
      if (regionOf(x * FOG + 5, y * FOG + 5) !== regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE)) && (dx || dy)) continue;
      const i = y * FW + x; if (s2[i] !== "1") { s2 = s2.slice(0, i) + "1" + s2.slice(i + 1); changed = true; }
    }
    if (changed) { G.flags.fog = s2; miniDirty = true; }
  }

