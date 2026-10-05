  // ================================================================== MORE CUTSCENES
  // Maru's song on the Spire, Rook's last shot, Ren holding the door, Hollis unmasked, and the Drowned King rising.
  const [MC, mcx] = offC(160, 120);
  function monster(g2, sprite, k, x, y, o = {}) {   // a battle sprite, enlarged by a whole number, feet at (x, y)
    const bid = Object.keys(MONSTERS).find(i => MONSTERS[i].boss && MONSTERS[i].sprite === sprite), A = bid && bossArtFor({ id: bid, sprite });
    if (A) {   // bosses: the fine art, drawn straight at the shot's size so a close-up keeps its detail
      const fr = artFrame(A, A.key, Math.floor(((time * 0.9) % 1) * ART_FRAMES), !!o.hurt), sm = g2.imageSmoothingEnabled;
      g2.imageSmoothingEnabled = true; g2.drawImage(fr, Math.round(x - A.w * k / 2), Math.round(y - (A.h - 2) * k), A.w * k, A.h * k); g2.imageSmoothingEnabled = sm; return;
    }
    mcx.clearRect(0, 0, 160, 120);
    drawBattleMonster(mcx, { sprite, hurt: o.hurt ? 0.02 : 0, st: {}, phase2: !!o.phase2, hp: 1, maxHp: 1, boss: true }, 80, 116);
    blit(g2, MC, x - 80 * k, y - 116 * k, k);
  }
  const lightning = (g2, t, every = 2.3) => { if ((t % every) < 0.08) PR(g2, 0, 0, VIEW_W, VIEW_H, "rgba(230,240,255,.55)"); };
  const stormBg = (g2, t) => { PX.bands(g2, ["#05070f", "#0a0e1c", "#10162a", "#182038", "#202a48"]); for (let i = 0; i < 6; i++) PR(g2, wrap(i * 70 + t * 12, VIEW_W + 80) - 80, 10 + (i % 3) * 16, 90, 10, "#141a30"); PX.rain(g2, t, 140); lightning(g2, t); };
  const deepBg = (g2, t) => { PX.bands(g2, ["#020812", "#04101e", "#06182a", "#082036", "#0a2842"]); for (let i = 0; i < 18; i++) { const ph = (t * 0.2 + hash(i, 5)) % 1; PR(g2, hash(i, 3) * VIEW_W, VIEW_H - ph * VIEW_H, 2, 2, "rgba(160,210,255,.5)"); } };
  const MARU_SONG = [
    { dur: 4.2, fadeIn: 0.6, line: ["Maru", "Don't look so sad. A song isn't a prison, Sable. It's a shape. Watch me sing it well."], draw: (g2, t) => {
      stormBg(g2, t); PR(g2, 0, 150, VIEW_W, 42, "#1c1830"); PR(g2, 0, 148, 190, 3, "#2a2644");
      chibi(g2, HEROES.maru.look, { dir: "right" }, 3, 176, 164); PR(g2, 196, 118, 5, 6, OUT); PR(g2, 197, 119, 3, 4, "#ffcf4a");
      chibi(g2, HEROES.sable.look, { dir: "right", hero: true }, 2, 70, 166); chibi(g2, HEROES.ilse.look, { dir: "right" }, 2, 40, 168);
    } },
    { dur: 4.4, line: [null, "She sings. The storm hears its own name for the first time in four hundred years."], draw: portraitShot(HEROES.maru.look, { mouth: "open", tears: true, light: "#c8d8ff" }, stormBg) },
    { dur: 4.6, line: [null, "With every note her voice grows brighter, and her body fainter, until she is only light, and then only song."], draw: (g2, t, k) => {
      stormBg(g2, t); PR(g2, 0, 150, VIEW_W, 42, "#1c1830");
      for (let r = 0; r < 6; r++) { const w = 18 + r * 10 + Math.round(k * 30); PR(g2, 176 - w, 0, w * 2, 150, `rgba(255,248,210,${0.05 + k * 0.06})`); }
      for (let i = 0; i < 16; i++) { const ph = (t * 0.4 + i / 16) % 1, a = i * 1.7 + t; PR(g2, 176 + Math.cos(a) * (10 + ph * 50), 150 - ph * 150, 2, 3, "#fff2c0"); PR(g2, 178 + Math.cos(a) * (10 + ph * 50), 147 - ph * 150, 1, 3, "#fff2c0"); }
      g2.globalAlpha = Math.max(0, 1 - k * 1.2); chibi(g2, HEROES.maru.look, { dir: "down" }, 3, 176, 164); g2.globalAlpha = 1;
    } },
    { dur: 4.2, fadeOut: 0.8, line: [null, "The rain stops. On the stone at the edge of the Spire, her lantern is still lit."], draw: (g2, t) => {
      detail(g2, (c2, tt) => {
        PR(c2, 0, 0, 80, 32, "#182038"); PR(c2, 0, 32, 80, 16, "#1c1830"); PR(c2, 0, 31, 80, 2, "#2a2644");
        PR(c2, 34, 18, 12, 14, OUT); PR(c2, 35, 19, 10, 12, "#6b5a44"); PR(c2, 37, 21, 6, 8, "#ffcf4a"); PR(c2, 38, 22 + (Math.sin(tt * 8) > 0 ? 1 : 0), 4, 5, "#fff2c0"); PR(c2, 36, 15, 8, 3, OUT); PR(c2, 38, 12, 4, 4, OUT);
        c2.fillStyle = "rgba(255,210,120,.12)"; c2.fillRect(24, 10, 32, 30);
        for (let i = 0; i < 6; i++) PR(c2, wrap(hash(i, 41) * 80 - tt * 4, 80), wrap(hash(i, 43) * 30 + tt * 20, 30), 1, 2, "#b8cef0");
      }, t);
    } },
  ];
  const ROOK_LAST = [
    { dur: 3.4, fadeIn: 0.5, shake: 3, line: [null, "Old Gulp shudders. Something inside it is still fighting."], draw: (g2, t) => {
      PX.bands(g2, ["#0e1410", "#141e16", "#1c2a1c", "#243422", "#2c3e28"]); PR(g2, 0, 150, VIEW_W, 42, "#1a2418"); for (let i = 0; i < 30; i++) PR(g2, hash(i, 9) * VIEW_W, 146 + (i % 4), 1, 6 + (i % 5), "#3a5a30");
      monster(g2, "gulp", 1, 160 + Math.round(Math.sin(t * 30) * 2), 170, { hurt: Math.sin(t * 12) > 0.6 });
    } },
    { dur: 4, line: ["Rook", "Told you I could make the shot. Didn't say from which side."], draw: portraitShot(HEROES.rook.look, { brows: "fierce", mouth: "grit", smudge: true, light: "#ff9a4a" }, (g2, t) => { PX.bands(g2, ["#1a0608", "#2a0a0c", "#3a1010", "#4a1612"]); for (let i = 0; i < 10; i++) PR(g2, hash(i, 61) * VIEW_W, hash(i, 63) * VIEW_H, 4, 4, Math.sin(t * 2 + i) > 0 ? "#5a1c14" : "#3a1010"); PX.fire(g2, 250, 150, 10, 16, t); }) },
    { dur: 2.6, sound: "crit", line: [null, "He draws the last arrow with a torch tied to its head."], draw: (g2, t, k) => {
      PX.bands(g2, ["#1a0608", "#2a0a0c", "#3a1010"]);
      detail(g2, c2 => {
        for (let r = 0; r < 36; r++) { const x = 20 + Math.round(Math.sqrt(Math.max(0, 324 - (r - 18) * (r - 18))) * 0.6); PR(c2, x - 1, 6 + r, 3, 1, OUT); PR(c2, x, 6 + r, 1, 1, "#8a5a33"); }
        const pull = k < 0.7 ? Math.round(k * 12) : 0; PR(c2, 20, 6, 1, 18 - 0, "#e8e2d0"); PR(c2, 20 - pull, 24, 1, 1, "#e8e2d0"); PR(c2, 20, 24, 1, 18, "#e8e2d0");
        const ax = k < 0.7 ? 14 - pull : 14 + Math.round((k - 0.7) * 300); PR(c2, ax, 23, 40, 2, "#6b3f24"); PX.fire(c2, ax + 40, 25, 4, 5, t); PR(c2, ax - 2, 22, 4, 4, "#c8c8d8");
      }, t);
      if (k > 0.7 && k < 0.78) PR(g2, 0, 0, VIEW_W, VIEW_H, "rgba(255,230,180,.6)");
    } },
    { dur: 3.4, flash: true, shake: 7, sound: "boss", line: [null, "Old Gulp's belly splits open from the inside, full of light."], draw: (g2, t, k) => {
      PX.bands(g2, ["#0e1410", "#141e16", "#1c2a1c", "#243422"]); PR(g2, 0, 150, VIEW_W, 42, "#1a2418");
      monster(g2, "gulp", 1, 160, 170, { hurt: true });
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r0 = 10 + k * 20, r1 = r0 + 20 + k * 140; for (let s = r0; s < r1; s += 3) PR(g2, 160 + Math.cos(a) * s, 110 + Math.sin(a) * s * 0.7, 2, 2, "rgba(255,240,190,.7)"); }
      chibi(g2, HEROES.rook.look, { rot: 1 }, 2, 160 + Math.round(k * 50), 150 + Math.round(k * 20));
    } },
    { dur: 4.6, fadeOut: 1, line: [null, "The swallowed dead come out with him. Rook is the only one still breathing. Not for long."], draw: (g2, t) => {
      PX.bands(g2, ["#1a2230", "#223040", "#2a3a4a", "#344450"]); PR(g2, 0, 140, VIEW_W, 52, "#1a2418"); for (let i = 0; i < 40; i++) PR(g2, hash(i, 9) * VIEW_W, 136 + (i % 5), 1, 6 + (i % 6), "#3a5a30");
      chibi(g2, HEROES.rook.look, { rot: 1 }, 3, 140, 186); PR(g2, 176, 172, 16, 2, "#8a5a33"); PR(g2, 192, 168, 2, 6, "#8a5a33");
      chibi(g2, HEROES.ilse.look, { dir: "left" }, 2, 214, 176); chibi(g2, HEROES.sable.look, { dir: "left", hero: true }, 2, 244, 178);
    } },
  ];
  const REN_DOOR = [
    { dur: 4.2, fadeIn: 0.4, shake: 3, line: [null, "The drowned palace is coming down. Water thunders through the walls and the great doors swing shut, pushed by the whole sea."], draw: (g2, t) => {
      deepBg(g2, t); PR(g2, 0, 150, VIEW_W, 42, "#0e1a28");
      for (const x of [40, 90, 230, 280]) { const h = 150 - ((t * 200 + x) % 60); PR(g2, x, 0, 12, 150, "rgba(120,180,230,.35)"); PR(g2, x + 3, (t * 300 + x) % 150, 6, 20, "#b8e0ff"); }
      const sh = Math.round(Math.sin(t * 20) * 1); PR(g2, 110 + sh, 40, 50, 112, OUT); PR(g2, 111 + sh, 41, 48, 110, "#3a5a6a"); PR(g2, 162 - sh, 40, 50, 112, OUT); PR(g2, 163 - sh, 41, 48, 110, "#34525f");
      for (let r = 0; r < 110; r += 14) { PR(g2, 111 + sh, 41 + r, 48, 2, "#2a4250"); PR(g2, 163 - sh, 41 + r, 48, 2, "#2a4250"); }
      chibi(g2, HEROES.ren.look, { dir: "up" }, 3, 160, 190);
    } },
    { dur: 4.2, line: ["Ren", "Somebody has to hold the door, and I've had practice. I kept a gate shut for money once. Let me hold this one for free."], draw: portraitShot(HEROES.ren.look, { brows: "fierce", mouth: "grit", light: "#8ad0ff" }, deepBg) },
    { dur: 3.4, fadeOut: 0.8, line: [null, "The shield buckles, and holds. Water sprays white around its edges."], draw: (g2, t) => {
      detail(g2, (c2, tt) => {
        PR(c2, 0, 0, 80, 48, "#34525f"); for (let r = 0; r < 48; r += 7) PR(c2, 0, r, 80, 1, "#2a4250"); PR(c2, 39, 0, 2, 48, OUT);
        PR(c2, 26, 10, 28, 30, OUT); PR(c2, 27, 11, 26, 28, "#8a90a8"); PR(c2, 27, 11, 26, 2, "#d8dce8"); PR(c2, 36, 18, 8, 10, "#4a5a8a"); PR(c2, 38, 20, 4, 4, "#ffcf4a");
        for (const [x, y] of [[30, 16], [48, 30], [33, 33]]) { PR(c2, x, y, 3, 1, OUT); PR(c2, x + 2, y + 1, 2, 1, OUT); }
        for (let i = 0; i < 20; i++) { const ph = (tt * 2 + i / 20) % 1, side = i % 2 ? 1 : -1; PR(c2, 40 + side * (14 + ph * 24), 8 + (i * 7) % 34 - ph * 6, 2, 1, `rgba(220,240,255,${1 - ph})`); }
      }, t);
    } },
  ];
  const HOLLIS_UNMASKED = [
    { dur: 3.2, fadeIn: 0.3, line: ["Hollis", "Kneel, or be kneeled on."], draw: (g2, t) => { PX.bands(g2, ["#1a1208", "#2a1c0c", "#3a2810", "#4a3414"]); monster(g2, "hollis", 2, 160, 262); } },
    { dur: 3.2, flash: true, shake: 6, sound: "boss", line: [null, "His jaw splits sideways into a ring of leech-mouths. Water pours from his gold coat."], draw: (g2, t) => { PX.bands(g2, ["#0a0a14", "#12121e", "#1a1a28", "#22222e"]); monster(g2, "hollis", 2, 160, 262, { phase2: true, hurt: t < 0.4 }); for (let i = 0; i < 14; i++) PR(g2, 110 + hash(i, 3) * 100, wrap(hash(i, 5) * 190 + t * 160, 190), 2, 6, "#8ab8e0"); } },
  ];
  const KING_RISES = [
    { dur: 4.2, fadeIn: 1, line: [null, "Nell's diving bell sinks through the whirlpool into the dark. The last light goes blue, then green, then nothing."], draw: (g2, t, k) => {
      PX.bands(g2, [["#2a5a7a", "#123048", "#040c18"][Math.min(2, Math.floor(k * 3))], "#0a1a2c", "#061222", "#040c18"]);
      for (let i = 0; i < 5; i++) PR(g2, 60 + i * 50, 0, 6, 120 - k * 100, `rgba(160,220,255,${0.15 * (1 - k)})`);
      const y = Math.round(40 + Math.sin(t) * 3); PR(g2, 139, y - 1, 42, 42, OUT); PR(g2, 140, y, 40, 40, "#b8902a"); PR(g2, 140, y, 40, 4, "#e8b83a"); PR(g2, 152, y + 10, 16, 14, OUT); PR(g2, 153, y + 11, 14, 12, "#ffe08a"); PR(g2, 159, 0, 2, y, "#6b5a44");
      for (let i = 0; i < 12; i++) { const ph = (t * 0.6 + i / 12) % 1; PR(g2, 150 + hash(i, 7) * 24, y - ph * 60, 2, 2, "rgba(200,230,255,.7)"); }
    } },
    { dur: 4.6, shake: 2, line: [null, "At the bottom of the sea, on a throne of fused bones, something made of the drowned lifts its crowned head."], draw: (g2, t, k) => {
      deepBg(g2, t); PR(g2, 0, 164, VIEW_W, 28, "#0a1420"); for (let i = 0; i < 40; i++) PR(g2, 40 + i * 6, 158 + (i % 3) * 2, 5, 6, "#c8c0a8");
      monster(g2, "king", 1, 160, 166 + Math.round((1 - ease(k)) * 60));
    } },
    { dur: 4, fadeOut: 0.6, sound: "boss", line: ["The Drowned King", "Courier. Four hundred years I waited for someone to answer my question."], draw: (g2, t) => { deepBg(g2, t); monster(g2, "king", 2, 160, 250); } },
  ];
  const CINE_BEFORE = {
    sing_maru2: { shots: MARU_SONG, music: "cine_storm" },
    gulp_after: { shots: ROOK_LAST, music: "cine_grief", when: () => G.members.includes("rook") },
    ren_hold: { shots: REN_DOOR, music: "cine_deep" },
    hollis_scene2: { shots: HOLLIS_UNMASKED, music: "cine_dread" },
    king_scene: { shots: KING_RISES, music: "cine_deep" },
  };
  const _openDialogC = openDialog;
  openDialog = function (id) {
    const c = CINE_BEFORE[id];
    if (c && !G.flags["cine_" + id] && (!c.when || c.when())) { G.flags["cine_" + id] = true; save(); playCine(c.shots, () => _openDialogC(id), { music: c.music }); return; }
    _openDialogC(id);
  };

