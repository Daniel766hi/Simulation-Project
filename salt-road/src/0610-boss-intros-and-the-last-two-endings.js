  // ================================================================== BOSS INTROS AND THE LAST TWO ENDINGS
  // Every chapter boss gets an entrance: a wide shot in its own place, then an enlarged close-up for its first words.
  const AREA_BG = {
    oasis: (g2, t) => { PX.bands(g2, ["#e8b070", "#f0c080", "#f4d098"], 0, 120); PR(g2, 0, 120, VIEW_W, 72, "#d8b878"); PR(g2, 110, 132, 100, 14, "#2a7fae"); PR(g2, 110, 132, 100, 2, "#6fb8e8"); for (const x of [40, 270]) { PR(g2, x, 70, 4, 60, "#6b3f24"); PR(g2, x - 14, 64, 32, 10, "#2a6f40"); } },
    grove: (g2, t) => { PX.bands(g2, ["#0e1a12", "#142418", "#1a2e1c", "#223a22"], 0, 130); PR(g2, 0, 130, VIEW_W, 62, "#1a2418"); PR(g2, 60, 140, 200, 20, "#0a0e0a"); for (const x of [20, 70, 240, 290]) { PR(g2, x, 50, 5, 90, "#3a2a1e"); PR(g2, x - 16, 44, 36, 12, "#1e3a22"); } },
    cathedral: (g2, t) => { PX.bands(g2, ["#0c0a18", "#141024", "#1a1430"], 0, 150); for (const x of [30, 100, 210, 280]) { PR(g2, x, 20, 14, 130, "#241c3e"); PR(g2, x - 2, 20, 18, 6, "#2e2650"); } PR(g2, 0, 150, VIEW_W, 42, "#1a1430"); for (let i = 0; i < 6; i++) PX.fire(g2, 40 + i * 50, 150, 2, 4, t + i); },
    hall: (g2, t) => { PX.bands(g2, ["#2a1c0c", "#3a2810", "#4a3414"], 0, 150); for (let x = 0; x < VIEW_W; x += 40) PR(g2, x, 0, 30, 150, "#3a2a14"); PR(g2, 0, 150, VIEW_W, 42, "#6b2a2a"); PR(g2, 0, 150, VIEW_W, 3, "#8a3a3a"); for (let i = 0; i < 14; i++) PR(g2, 20 + i * 22, 40 + (i % 3) * 30, 12, 16, "#e8e2d0"); },
    marsh: (g2, t) => { PX.bands(g2, ["#1a2230", "#223040", "#2a3a4a"], 0, 140); PR(g2, 0, 140, VIEW_W, 52, "#1e2e28"); for (let i = 0; i < 40; i++) PR(g2, hash(i, 9) * VIEW_W, 134 + (i % 5), 1, 8 + (i % 6), "#3a5a30"); },
    wreck: (g2, t) => { PX.bands(g2, ["#0e0c10", "#18141a", "#221c22"]); for (let x = 0; x < VIEW_W; x += 18) PR(g2, x, 0, 12, VIEW_H, "#2a2018"); PR(g2, 0, 160, VIEW_W, 32, "#1a1410"); for (let i = 0; i < 8; i++) PR(g2, 20 + i * 40, 150 + (i % 2) * 6, 22, 12, "#3a2a1e"); },
    spire: (g2, t) => stormBg(g2, t),
    vault: (g2, t) => { PX.bands(g2, ["#0a0808", "#141010", "#1c1616"], 0, 150); PR(g2, 0, 150, VIEW_W, 42, "#2a2220"); for (let i = 0; i < 20; i++) PR(g2, 10 + i * 16, 60 + (i % 4) * 20, 10, 12, "#c8b890"); for (const x of [60, 250]) PX.fire(g2, x, 150, 4, 8, t); },
    flats: (g2, t) => { nightBg(g2, t); PR(g2, 0, 140, VIEW_W, 52, "#c8c2d8"); PR(g2, 130, 60, 60, 80, "#241c3e"); PR(g2, 126, 56, 68, 6, "#3a2040"); },
  };
  const bossIntro = (sprite, area, wideLine, closeLine, o = {}) => [
    { dur: o.wideDur || 4.2, fadeIn: 0.5, shake: 2, line: wideLine, draw: (g2, t, k) => { AREA_BG[area](g2, t); monster(g2, sprite, 1, 160, o.feet || 176, { hurt: k < 0.08 }); } },
    { dur: 3.6, sound: "boss", line: closeLine, draw: (g2, t) => { AREA_BG[area](g2, t); monster(g2, sprite, 2, 160, o.closeFeet || 250); } },
  ];
  Object.assign(CINE_BEFORE, {
    maru_scene0: { music: "boss", shots: bossIntro("butcher", "oasis", [null, "At the Well of Nine, a butcher's apron circles the pool. The travellers hanging from the palms were his customers."], ["The Well Butcher", "Fresh meat walks to the well on its own. Saves me the carrying."]) },
    mother_scene: { music: "boss", shots: bossIntro("mother", "grove", [null, "The mud heaves. Something the size of a cart unfolds from the bank, covered in small round mouths."], ["Mother of Leeches", "Hush, little ones. Mother is feeding."], { closeFeet: 196 }) },
    choir_scene: { music: "boss", shots: bossIntro("choirmaster", "cathedral", [null, "In the nave, the drowned choir stands in rows, mouths sewn into smiles. Their conductor turns."], ["The Choirmaster", "A courier in my Cathedral. Stay for the performance. You will be the finale."]) },
    quill_scene: { music: "boss", shots: bossIntro("quill", "hall", [null, "Behind a desk of ledgers sits Treasurer Quill, dipping an enormous quill into a pot that is not ink."], ["Treasurer Quill", "The courier. And the smith. You still owe the Guild for the chains you refused to forge."]) },
    maw_scene: { music: "boss", shots: bossIntro("maw", "wreck", [null, "In the belly of the Great Wreck, a huge drowned man sits on a throne of barnacled cargo, singing to a crew that isn't there."], ["Captain Maw", "Come aboard, little sailors. The sea's got room for all of you."]) },
    vela_scene: { music: "cine_storm", shots: bossIntro("vela", "spire", [null, "At the top of the Storm Spire, a nun made of lightning hangs in the air, her habit full of rain."], ["Sister Vela", "Another singer come to steal my storm? Sing, then. Let's hear how you end."]) },
    corvin_scene: { music: "cine_dread", shots: bossIntro("corvin", "vault", [null, "At the bottom of the vault, among salt-cured miners, sits the man who founded the Guild, preserved in his own ledgers."], ["Corvin", "Every debt is paid in the end, courier. I simply decide who pays it."]) },
    wyrm_scene0: { music: "boss", shots: bossIntro("wyrm", "flats", [null, "Under the old watchtower the salt breathes. Something long and white turns over beneath it."], [null, "The Salt Wyrm rises out of the Flats, older than the Guild, older than Kessa."]) },
    gulp_scene: { music: "boss", shots: bossIntro("gulp", "marsh", [null, "The Bog Heart. A toad the size of a house squats in the black water, its belly full of shapes."], ["Old Gulp", "Hungry. Always hungry. You smell like the ones who got away."]) },
  });
  // the two endings that had no scene of their own
  const CROWN_END = [
    { dur: 4.4, fadeIn: 1, line: [null, "You lift the drowned crown and put it on. It is heavy with hands."], draw: portraitShot(HEROES.sable.look, { eyes: "closed", mouth: "line", light: "#8ad0ff", crown: true }, deepBg) },
    { dur: 5.2, line: [null, "The sea comes up over the valley, over Kessa and Oru and Reedholm, gently, like a blanket."], draw: (g2, t, k) => {
      PX.bands(g2, ["#e8a878", "#d89070", "#8a6a7a", "#4a4a6a"], 0, 150); PR(g2, 0, 150, VIEW_W, 42, "#d8c8b0"); PX.village(g2, 150, "#3a2a3a"); PX.tower(g2, 160, 150, t, { bell: false });
      const lvl = Math.round(190 - ease(k) * 170); PR(g2, 0, lvl, VIEW_W, VIEW_H - lvl, "rgba(20,60,110,.85)"); for (let x = 0; x < VIEW_W; x += 6) PR(g2, x, lvl + (Math.floor(x / 6 + t * 4) % 2), 4, 1, "#8ad0ff");
    } },
    { dur: 5, fadeOut: 1.4, line: [null, "No one owns anything. No one is poor. No one is above anyone else. There is no one left to be."], draw: (g2, t) => { deepBg(g2, t); PX.village(g2, 170, "#0e2438"); PX.tower(g2, 160, 170, t, { bell: false }); for (let i = 0; i < 12; i++) chibi(g2, { robe: "#2a4a5a", hair: "#1a2a3a", skin: "#8ab0b8" }, { dir: "down" }, 1, 30 + i * 24, 176 - (i % 3) * 4); } },
  ];
  const KEEPER_END = [
    { dur: 4.4, fadeIn: 1, line: ["Sable", "Someone has to sing for the ones below. I've never dropped a package. I won't drop this one."], draw: portraitShot(HEROES.sable.look, { mouth: "smile", tears: true, light: "#8ad0ff" }, deepBg) },
    { dur: 5, line: [null, "The Warden carries the Bell up through the dark water, into the light, and rings it for everyone."], draw: (g2, t, k) => {
      deepBg(g2, t); for (let r = 0; r < 5; r++) PR(g2, 150 - r * 6, 0, 20 + r * 12, VIEW_H, `rgba(200,240,255,${0.05 + r * 0.01})`);
      chibi(g2, HEROES.warden.look, { dir: "up" }, 2, 160, Math.round(190 - k * 160)); for (let rr = 0; rr < 9; rr++) { const w = 4 + Math.round(rr * 0.5); PR(g2, 160 - w, Math.round(130 - k * 160) + rr, w * 2, 1, "#e8b83a"); }
      chibi(g2, HEROES.sable.look, { dir: "up", hero: true }, 2, 70, 186);
    } },
    { dur: 5.2, fadeOut: 1.4, line: [null, "You sit on the drowned throne and sing, badly, and the dead listen. It is the best audience a courier ever had."], draw: (g2, t) => {
      deepBg(g2, t); PR(g2, 0, 164, VIEW_W, 28, "#0a1420"); PR(g2, 132, 110, 56, 56, OUT); PR(g2, 133, 111, 54, 54, "#c8c0a8"); PR(g2, 138, 116, 44, 20, "#a8a088");
      chibi(g2, HEROES.sable.look, { dir: "down", hero: true }, 2, 160, 160); for (let i = 0; i < 10; i++) chibi(g2, { robe: "#2a4a5a", hair: "#1a2a3a", skin: "#8ab0b8", glowEyes: true }, { dir: "up" }, 1, 30 + i * 28 + (i > 4 ? 60 : 0), 188);
      for (let i = 0; i < 6; i++) { const ph = (t * 0.4 + i / 6) % 1; PR(g2, 165 + Math.sin(i + t) * 20, 120 - ph * 90, 2, 3, "#fff2c0"); }
    } },
  ];
  const _endingK = ending;
  ending = function (kind) {
    const shots = kind === "crown" ? CROWN_END : kind === "keeper" ? KEEPER_END : null;
    if (shots && !G.flags["endcine_" + kind]) { G.flags["endcine_" + kind] = true; playCine(shots, () => _endingK(kind), { music: "ending" }); return; }
    _endingK(kind);
  };

