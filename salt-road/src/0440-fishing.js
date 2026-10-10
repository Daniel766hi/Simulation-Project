  // ================================================================== FISHING
  // Old Hake lends you a rod. Stand by open water and press E. Hold E / Space (or press and hold the bar) to lift the float;
  // keep it on the fish until the line is reeled in. Every region has its own catch, and the Deep has something very old.
  const FISH = {
    minnow:  { name: "Salt Minnow", where: "old", rare: 0, pay: 3, lore: "Tiny, silver, and so salty you can eat it raw. Kessa children catch them with their hands." },
    carp:    { name: "Grove Carp", where: "old", rare: 1, pay: 6, lore: "Fat and slow. Its scales grow in rings like a tree's. This one is older than you." },
    blind:   { name: "Pale Blindfish", where: "old", rare: 2, pay: 14, lore: "No eyes. Where the eyes should be, smooth skin. In its mouth, a row of small flat teeth, uncomfortably like a child's." },
    perch:   { name: "Bog Perch", where: "south", rare: 0, pay: 4, lore: "Mud-brown and bad-tempered. Reedholm fries them in rendered fat and calls it a feast." },
    weeper:  { name: "Weeping Pike", where: "south", rare: 1, pay: 9, lore: "It makes a thin crying sound out of the water. Marsh folk throw them back. Nobody likes to eat something that cries." },
    ledger:  { name: "Ledger Eel", where: "south", rare: 2, pay: 16, lore: "Black with rows of pale spots like tally marks. The marsh folk say each spot is a debt somebody drowned owing." },
    herring: { name: "Fountain Herring", where: "oru", rare: 0, pay: 4, lore: "Oru's great fountain is fed by the old canals under the city, and the canals are full of them. They grew fat on the granary's spill while the rest of the city starved." },
    tithe:   { name: "Tithe-fish", where: "oru", rare: 2, pay: 18, lore: "Something is stuck under one gill: an old Oru coin, stamped with the Guild seal. The fish has grown around it." },
    storm:   { name: "Storm Char", where: "spire", rare: 1, pay: 10, lore: "Its fins crackle when they're wet. Orla says the shrines taught the fish to sing before they taught people." },
    bellfish:{ name: "Bell-fish", where: "spire", rare: 2, pay: 18, lore: "Its swim bladder rings when you tap it: one clear note, the same note as the Rain Bell. Nobody knows which copied which." },
    choir:   { name: "Choir Grouper", where: "deep", rare: 1, pay: 12, lore: "It hums. Low, three notes, over and over. Ada goes very quiet when she hears it." },
    ringfish:{ name: "Drowned Carp", where: "deep", rare: 2, pay: 20, lore: "In its belly: a wedding ring, green with age. Somebody's promise, swallowed and carried for a hundred years." },
    leech:   { name: "Cave Leechfish", where: "mines", rare: 1, pay: 12, lore: "It clings to the rock in the flooded shafts, sucking the salt out of the stone. The miners called them 'little foremen'." },
  };
  const FISH_IDS = Object.keys(FISH);
  const WATERY = new Set([T.WATER, T.FOUNTAIN]);
  // the Deep itself is walked, not fished: its fish are hooked from the whirlpool pier above it
  const fishRegion = () => { const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE); return tx >= 114 && tx <= 119 && ty >= 74 ? "deep" : regionOf(tx, ty); };
  MONSTERS.oldmouth = { name: "The Old Mouth", hp: 520, atk: 20, def: 7, spd: 6, xp: 300, coin: [80, 80], sprite: "angler", boss: true, music: "boss",
    pal: { "#2a4a5a": "#3a2a1e", "#8ab0b8": "#c8b890" },
    moves: [{ name: "Swallow the Line", w: 3, power: 1.5, bleed: [4, 3] }, { name: "Undertow", w: 2, power: 0.9, all: true }, { name: "Old Hunger", w: 1, guard: true, heal: 30 }] };
  Object.assign(RELICS, {
    float: { name: "Hake's Lucky Float", from: "hake", desc: "+12% critical chance, +1 speed.", crit: 0.12, spd: 1 },
    tooth: { name: "Old Mouth's Tooth", from: "oldmouth", desc: "+4 attack. Plain attacks make the target bleed.", atk: 4, bleedHit: true },
  });
  const fishHere = () => { const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (WATERY.has(get(tx + dx, ty + dy))) return true;
    const [fx, fy] = { left: [-2, 0], right: [2, 0], up: [0, -2], down: [0, 2] }[player.dir] || [0, 0]; return WATERY.has(get(tx + fx, ty + fy)); };
  const species = () => FISH_IDS.filter(k => (G.flags.fishLog || {})[k]);
  function rollFish() {
    const reg = fishRegion();
    if (reg === "deep" && species().length >= 10 && !G.flags.oldMouthDead && Math.random() < 0.35) return "oldmouth";
    const pool = FISH_IDS.filter(k => FISH[k].where === reg && (!FISH[k].night || isNight())); if (!pool.length) return null;
    const w = pool.map(k => [3, 2, 1][FISH[k].rare]); let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; } return pool[0];
  }
  let fishing = null;
  function startFishing() {
    const id = rollFish();
    if (!id) { toast("Nothing bites here. Try water in another region."); return; }
    const hard = id === "oldmouth" ? 3 : FISH[id].rare;
    fishing = { id, float: 0.5, fv: 0, fish: 0.5, target: 0.5, zone: [0.28, 0.23, 0.19, 0.17][hard], speed: [0.3, 0.45, 0.62, 0.8][hard], prog: 0.3, t: 0, hold: false, bite: 0.8 + Math.random() * 1.2, done: false };
    mode = "fish"; $("fishUI").hidden = false; $("fishMsg").textContent = "Waiting for a bite..."; Music.sound("click");
    let last = performance.now();
    const loop = now => { if (!fishing) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!paused) fishTick(dt); drawFishing(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  function fishTick(dt) {
    const f = fishing; if (f.done) return;
    if (f.bite > 0) { f.bite -= dt; if (f.bite <= 0) { $("fishMsg").textContent = f.id === "oldmouth" ? "The whole lake leans toward your line. Something enormous has it." : "A bite! Hold E / Space to lift the float and stay on the fish."; Music.sound("hit"); } return; }
    f.t += dt;
    if (Math.random() < dt * (1 + f.speed * 1.5)) f.target = Math.random();
    f.fish += (f.target - f.fish) * Math.min(1, dt * f.speed * 3);
    f.fv += ((f.hold || keys[" "] || keys.e) ? 2.4 : -2.0) * dt; f.fv *= 0.94; f.float = clamp(f.float + f.fv * dt, 0, 1);
    if ((f.float === 0 && f.fv < 0) || (f.float === 1 && f.fv > 0)) f.fv *= -0.3;
    const on = Math.abs(f.float - f.fish) < f.zone / 2 + 0.04;
    f.prog = clamp(f.prog + (on ? 0.32 : -0.24 - f.speed * 0.08) * dt, 0, 1);
    if (f.prog >= 1) endFishing(true); else if (f.prog <= 0) endFishing(false);
  }
  function drawFishing() {
    const c = $("fishCanvas"), g = c.getContext("2d"), f = fishing; if (!f) return; const Wc = c.width, Hc = c.height;
    g.fillStyle = "#0a1a2a"; g.fillRect(0, 0, Wc, Hc);
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(120,180,220,${0.05 + 0.05 * Math.sin(time * 2 + i)})`; g.fillRect(0, (i * 11 + time * 8) % Hc, Wc, 1); }
    const bx = 30, bw = 26, top = 10, bh = Hc - 20;
    g.fillStyle = "#1a2a3a"; g.fillRect(bx, top, bw, bh);
    const zh = f.zone * bh, zy = top + (1 - f.float) * (bh - zh);
    g.fillStyle = f.bite > 0 ? "rgba(255,255,255,.12)" : "rgba(107,255,154,.35)"; g.fillRect(bx, zy, bw, zh); g.strokeStyle = "#6bff9a"; g.strokeRect(bx + .5, zy + .5, bw - 1, zh - 1);
    if (f.bite <= 0) { const fy = top + (1 - f.fish) * (bh - 10); g.fillStyle = f.id === "oldmouth" ? "#c8b890" : "#9ef0f5"; g.fillRect(bx + 7, fy + 2, 12, 6); g.fillRect(bx + 3, fy + 3 + Math.sin(time * 12) * 1.5, 4, 4); g.fillStyle = "#0a1a2a"; g.fillRect(bx + 16, fy + 4, 1, 1); }
    g.fillStyle = "#2a1a10"; g.fillRect(bx + bw + 10, top, 8, bh); g.fillStyle = f.prog > 0.66 ? "#6bff9a" : f.prog > 0.33 ? "#ffcf4a" : "#ff5a5a"; g.fillRect(bx + bw + 10, top + bh * (1 - f.prog), 8, bh * f.prog);
    g.fillStyle = "#e8e2d0"; g.font = canvasFont(11); g.fillText(f.bite > 0 ? "..." : "REEL", bx + bw + 24, top + 10);
    const k = species().length; g.fillStyle = "#8a90b8"; g.fillText(`${k}/${FISH_IDS.length} species`, bx + bw + 24, Hc - 12);
  }
  function endFishing(caught, quiet) {
    const f = fishing; if (!f) return; f.done = true;
    const close = () => { fishing = null; $("fishUI").hidden = true; if (mode === "fish") mode = "play"; };
    if (quiet) { close(); return; }
    if (!caught) { $("fishMsg").textContent = "The line goes slack. It got away."; Music.sound("miss"); setTimeout(close, 900); return; }
    if (f.id === "oldmouth") {
      $("fishMsg").textContent = "You pull. It pulls back. The water opens like a mouth, and then it IS a mouth.";
      setTimeout(() => { close(); startBattle(["oldmouth"], { boss: "oldmouth", area: "deep" }); }, 1200); return;
    }
    const fi = FISH[f.id]; G.flags.fishLog = G.flags.fishLog || {}; const first = !G.flags.fishLog[f.id];
    G.flags.fishLog[f.id] = (G.flags.fishLog[f.id] || 0) + 1; G.flags.fishBag = (G.flags.fishBag || 0) + fi.pay;
    $("fishMsg").textContent = `${first ? "New species! " : ""}${fi.name}. ${first ? fi.lore : "Into the basket. Hake will pay for it."}`;
    Music.sound(first ? "victory" : "item"); save(); updateHud(); setTimeout(close, first ? 3200 : 1300);
  }
  addEventListener("keydown", e => {
    if (mode !== "fish" || paused) return;
    const k = e.key.toLowerCase();
    if (k === "escape" || k === "q") { e.stopImmediatePropagation(); endFishing(false, true); toast("You reel in and put the rod away."); return; }
    if (["e", " ", "enter", "arrowup", "w"].includes(k) && fishing) { fishing.hold = true; e.preventDefault(); }
    e.stopImmediatePropagation();
  }, true);
  addEventListener("keyup", e => { if (fishing && ["e", " ", "enter", "arrowup", "w"].includes(e.key.toLowerCase())) fishing.hold = false; });
  $("fishCanvas").addEventListener("pointerdown", e => { if (fishing) { fishing.hold = true; e.preventDefault(); } });
  addEventListener("pointerup", () => { if (fishing) fishing.hold = false; });
  const _interactF = interact;
  interact = function () {
    if (_interactF()) return true;
    if (G.flags.hasRod && fishHere()) { startFishing(); return true; }
    return false;
  };
  const _bossEndF = act2BossEndB;
  act2BossEndB = function (boss) {
    if (boss === "oldmouth") { G.flags.oldMouthDead = true; giveRelic("tooth"); save(); setTimeout(() => openDialog("oldmouth_after"), 300); return; }
    return _bossEndF(boss);
  };

  // Old Hake, the fisherman at the Butcher's Pool
  npc2({ id: "hake", name: "Old Hake", x: 33, y: 24, look: { robe: "#4a5a3a", hair: "#c8c8c0", skin: "#a8784e", style: { hair: "cap", beard: true, coat: true, eye: "#3a3020" } }, show: () => G.stage >= 2 });
  Object.assign(D, {
    hake_0: say("hake", "(An old man sits on an upturned bucket with a line in the water. He doesn't look up.) Pool's been quiet since you killed the thing in it. Fish came back the next morning. Fish always know before people do.", "hake_1"),
    hake_1: say("hake", "Thirty years I've fished. The Rains took my boat and my boy the same night. I sat on the bank for a week and waited for the water to give him back. It gave me a carp instead. So I cooked the carp. You have to eat.", "hake_2"),
    hake_2: { who: "hake", text: "People think fishing's about the catching. It's about the waiting. Sitting with the water and not asking it for anything back. ...Here. My spare rod. Hold it up when it bites, let it drop when it runs. Bring me what you catch. I'll pay.", choices: [
      { t: "\"Why do you let most of them go?\"", go: "hake_3" },
      { t: "\"Thank you. I'll bring you something good.\"", go: null, act: () => { G.flags.hasRod = true; toast("You have a fishing rod. Stand by open water and press E."); save(); updateHud(); } } ] },
    hake_3: say("hake", "Because the water took something of mine, and I'd like to be better than the water. That's all. That's all a man can be, some days. A little better than the thing that hurt him.", null, () => { G.flags.hasRod = true; toast("You have a fishing rod. Stand by open water and press E."); save(); updateHud(); }),
    hake_sell: say("hake", "", null),
    hake_idle: say("hake", "Different water, different fish. The marsh and the coast, Oru's old fountain, the storm pool on the Spire road, the whirlpool off the Gull's pier. Even the flooded mines, if you're mad enough. Bring me the whole set and I'll tell you about the one I never caught."),
    hake_legend: say("hake", "(He sets down his rod for the first time.) In the Deep there's a fish the size of a house. My father called it the Old Mouth. It ate the boat. It ate my boy's knife, and maybe my boy. You've caught ten kinds of fish. You're ready, if anyone is. Drop a line into the whirlpool off the pier. Don't let go.", null, () => { G.flags.hakeLegend = true; save(); updateHud(); }),
    oldmouth_after: say("sable", "(When the Old Mouth finally stops moving, something glints between its teeth: a small fishing knife, the handle carved with an H.) ...Hake's boy. I'm taking this home.", null, () => { G.flags.hakeKnife = true; save(); updateHud(); }),
    hake_knife: say("hake", "(He holds the little knife for a long time. His thumb finds the H without looking.) I carved that for his ninth birthday. He cut his finger the first day and didn't cry. ...Thirty years. Thank you, courier. I think I can stop waiting now. I think I'll just fish.", null, () => { G.flags.hakeDone = true; G.coins += 100; toast("Hake gives you 100 coin, and the first smile anyone in Kessa has seen on him."); save(); updateHud(); }),
    hake_after: say("hake", "(He's fishing, and humming, and letting every one of them go.) They'll be here tomorrow. So will I. That's a good thing to be able to say."),
  });
  function hakeSell() {
    const f = G.flags, bag = f.fishBag || 0, n = species().length; const lines = [];
    if (bag) { G.coins += bag; lines.push(`(He weighs your basket.) ${bag} coin's worth. Fair price, and I'll let the little ones go.`); f.fishBag = 0; }
    if (n >= 4 && !f.hakeGift1) { f.hakeGift1 = true; G.items.gsalve = (G.items.gsalve || 0) + 2; lines.push("Four kinds already. Here, two of my wife's salves. She'd have liked you."); }
    if (n >= 8 && !f.hakeGift2) { f.hakeGift2 = true; giveRelic("float"); lines.push("Eight kinds! Take my lucky float. It's never caught me anything but luck."); }
    D.hake_sell.text = lines.join(" ") || "Nothing in the basket yet? Go on. The water won't come to you."; save(); updateHud(); return "hake_sell";
  }
  const _dialogForF = dialogFor;
  dialogFor = function (n) {
    if (n.id !== "hake") return _dialogForF(n);
    const f = G.flags;
    if (!f.hasRod) return "hake_0";
    if (f.hakeKnife && !f.hakeDone) return "hake_knife";
    if (f.hakeDone) return f.fishBag ? hakeSell() : "hake_after";
    if (species().length >= 10 && !f.hakeLegend) return "hake_legend";
    if (f.fishBag || (species().length >= 4 && !f.hakeGift1) || (species().length >= 8 && !f.hakeGift2)) return hakeSell();
    return "hake_idle";
  };
  const _extraJournalF = extraJournalHtml;
  extraJournalHtml = function () {
    const log = G.flags.fishLog || {}; if (!G.flags.hasRod) return _extraJournalF();
    const rows = FISH_IDS.map(k => log[k] ? `<li><b>${FISH[k].name}</b> ×${log[k]}. ${FISH[k].lore}</li>` : `<li class="dim">??? (${{ old: "Old Kessa", south: "the south", oru: "Oru", spire: "the Storm Road", deep: "the whirlpool pier", mines: "the mines" }[FISH[k].where]})</li>`).join("");
    const hk = G.flags.hakeDone ? "Done." : G.flags.hakeLegend ? (G.flags.hakeKnife ? "Take the knife back to Hake at the Butcher's Pool." : "Hook the Old Mouth in the whirlpool off the pier.") : `Catch ten kinds of fish (${species().length}/10), then talk to Hake.`;
    return _extraJournalF() + `<h3>Fishing (${species().length}/${FISH_IDS.length})</h3><p class="dim" style="font-size:13px">Old Hake's legend: ${hk} Basket: ${G.flags.fishBag || 0} coin.</p><ul>${rows}</ul>`;
  };
  const _extraFatesF = extraFates;
  extraFates = function () { const out = _extraFatesF(); if (G.flags.hakeDone) out.push("Old Hake still fishes the Butcher's Pool every morning. He lets them all go now, and hums while he does it."); return out; };
  ACHIEVEMENTS.push(["angler", "Better Than the Water", "Catch every kind of fish.", () => species().length >= FISH_IDS.length], ["oldmouth", "Don't Let Go", "Land the Old Mouth.", () => G.flags.oldMouthDead]);

