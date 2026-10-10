  // ================================================================== BATTLE WORDS, ONE AT A TIME
  // Powers, runes and talents all announce themselves over a fighter. When several fire at once the words used to land
  // on top of each other; now each fighter's words go up one after another (a short beat apart), and a word that would
  // wait too long is dropped rather than shown late.
  const WORD_GAP = 0.45, WORD_WAIT_MAX = 1.4, wordAt = new WeakMap();
  const _popupTextQ = popupText;
  popupText = function (u, text, color) {
    if (!battle || !u || typeof u !== "object") return _popupTextQ(u, text, color);
    const now = time, at = Math.max(now, (wordAt.get(u) || -9) + WORD_GAP);
    if (at - now > WORD_WAIT_MAX) return;
    wordAt.set(u, at);
    if (at - now < 0.02) return _popupTextQ(u, text, color);
    const b0 = battle;
    setTimeout(() => { if (battle === b0 && !(u.side === "foe" && u.dead)) _popupTextQ(u, text, color); }, (at - now) * 1000);
  };

  // ================================================================== HOW IT WORKS: A GUIDE THAT GROWS WITH THE ROAD
  // Every system is explained on one page in the pause menu, but only once the player has met it, so the list starts
  // short and grows. A newly added entry is marked "new" and announced once.
  const GUIDE = [
    ["basics", "Battle basics", () => true,
      "Everyone acts in order of speed (the row at the top). On a hero's turn: Attack; a Skill, which costs SP (SP comes back a little every turn); Guard, which halves damage until your next turn and gives 3 SP; an Item; or Flee (not from bosses)."],
    ["dash", "Running and ambushes", () => true,
      "Hold Shift (or K) to run. Dash into a monster on the map to ambush it: your lead hero strikes the whole pack first and your party acts first."],
    ["fury", "Fury and the Chain Assault", () => G.stats && G.stats.wins >= 1,
      "Every hit dealt or taken fills the Fury bar. When it is full, any hero can call a Chain Assault: every standing hero strikes one enemy in turn, and the last blow always lands critical."],
    ["break", "Breaking a big attack", () => G.flags.breakTip,
      "A foe winding up shows CHARGING, and BREAK tells you how much damage stops it. Deal that much before it acts and the attack falls apart: the foe loses its turn and takes 25% more for two rounds. A boss shrugs off stuns for a while after one."],
    ["weak", "Weak spots and resistances", () => G.flags.affTip,
      "Hits come in kinds: blade, blunt, pierce, storm, light, poison and fire. A foe weak to a kind takes 50% more from it; one that resists takes less. What you learn is shown over the foe and kept in the journal."],
    ["phase", "Boss transformations", () => G.flags.butcherDead || (G.flags.kills || {}).butcher,
      "At half health a boss changes into its second form: stronger, faster, and ready to use its worst move. Keep a Chain Assault or your best skills for that moment."],
    ["gear", "Arms and armour", () => G.stage >= 1,
      "Smiths sell a weapon and an armour for each fighter, and stock better pieces as the road opens. Buying fits the piece at once and trades the old one in for half its price."],
    ["forge", "The forge", () => G.stage >= 1,
      "Ilse's forge at Odo's shop (Smithing) upgrades blades and leathers for the whole party at once, including anyone who joins later."],
    ["relic", "Relics", () => (G.relics || []).length > 0,
      "Bosses leave relics behind. Each fighter can carry one: on the Party screen (P), tap a fighter's Relic line to change it."],
    ["talent", "Talents", () => Object.values(G.party || {}).some(h => h.level >= 3),
      "At levels 3, 6, 10 and 14 each fighter chooses one of two talents. The choice comes up after a battle, or on the Party screen, where you can also switch one later for 20 coin."],
    ["champ", "Champions", () => G.flags.champTip || ((G.spoils || {}).champs > 0),
      "Some monsters are champions, marked with a ★ and a glow (some glow on the map too). They are tougher and carry powers: Vampiric heals from you, Ironhide shrugs off a fifth of each blow, Swift strikes twice, Thorned hurts whoever hits it, Frenzied hits harder as it is hurt, Warded has a shell to break first, Undying gets up once. They pay extra coin, salt shards and a champion core."],
    ["anvil", "Spoils and the anvil", () => !!G.spoils,
      "Every win pays salt shards; champions and bosses also give champion cores. At a smith's anvil, shards temper a fighter's weapon and armour (up to +5), and a core sets a rune: weapon runes add bleeding, healing, sparks or armour-breaking, armour runes add thorns, healing each turn, or a guard against the first blow."],
    ["bond", "Bonds", () => G.members.length >= 2,
      "When ★ Sit and talk shows on the Party screen, spend a quiet moment with that companion. There are three bonds for each; the second one also opens that companion's duo technique."],
    ["duo", "Duo techniques", () => DUOS.some(d => d.pair.every(m => G.members.includes(m)) && d.pair.every(bonded)),
      "Pairs who have bonded (a second bond with each, beyond Sable) can act together. When both are fighting, the technique appears with a ★ among either hero's skills; each pays their own share of SP."],
    ["road", "The Long Road", () => G.stage >= 3,
      "In the pause menu: the Deep Stair (an endless climb of harder floors with a boon between them), the Hall of Echoes (beaten bosses again, at higher tiers) and the Weekly Trial. None of them touches the story."],
    ["day", "Days and daily tasks", () => !!G.flags.daily,
      "The world has day and night; some monsters only walk at night. Each day brings small tasks in Today's tasks (pause menu) for coin and renown."],
  ];
  const guideOpen = () => GUIDE.filter(([, , ok]) => { try { return !!ok(); } catch { return false; } });
  function guideHtml() {
    const seen = new Set(G.flags.guideSeen || []), open = guideOpen();
    const rows = open.map(([id, title, , text]) => `<div class="guideRow"><b>${htmlEsc(title)}${seen.has(id) ? "" : ' <span class="gnew">new</span>'}</b><p>${htmlEsc(text)}</p></div>`).join("");
    G.flags.guideSeen = open.map(([id]) => id); save(); markGuideBtn();
    return `<p class="dim" style="font-size:13px;margin:0 0 8px">${open.length} of ${GUIDE.length} topics so far. More appear as you meet them on the road.</p>${rows}`;
  }
  const guideCss = document.createElement("style");
  guideCss.textContent = ".guideRow{margin:0 0 10px;padding:8px 10px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.03)}.guideRow b{font-size:14px}.guideRow p{margin:4px 0 0;font-size:13px;line-height:1.4;color:var(--muted)}.gnew{font-size:10px;padding:1px 5px;border-radius:6px;background:#ffcf4a;color:#1b1633;margin-left:6px;vertical-align:middle}";
  document.head.appendChild(guideCss);
  const guideBtn = document.createElement("button"); guideBtn.type = "button"; guideBtn.dataset.a = "guide"; guideBtn.innerHTML = "How it works";
  { const ctl = $("pauseMain").querySelector('[data-a="controls"]'); if (ctl) ctl.before(guideBtn); else $("pauseMain").appendChild(guideBtn); }
  function markGuideBtn() { if (!G || !G.flags) return; const n = guideOpen().filter(([id]) => !(G.flags.guideSeen || []).includes(id)).length; guideBtn.innerHTML = `How it works${n ? ` <small class="gnew">${n} new</small>` : ""}`; }
  $("pauseUI").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.a === "guide") showPanel("How it works", guideHtml()); });
  // a topic that opens up is announced once (the first two are there from the start and need no fanfare)
  setInterval(() => {
    if (!G || !G.flags || mode === "title") return;
    const known = G.flags.guideKnown || (G.flags.guideKnown = ["basics", "dash"]), fresh = guideOpen().filter(([id]) => !known.includes(id));
    if (!fresh.length) return;
    for (const [id] of fresh) known.push(id);
    markGuideBtn(); toast(`New in How it works (pause menu): ${fresh.map(([, t]) => t).join(", ")}.`);
  }, 2500);
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { guide: () => guideOpen().map(([id]) => id), guideHtml: () => guideHtml() }), 0);

  // ================================================================== THE LAST TIDE: KING AUREL'S FINAL BATTLE
  // The last fight has rules no other fight has, in three tides:
  //   First tide, the Drowned Court (full health to two thirds): the sea rises every round. While his court kneels
  //     around him the King takes a third less damage, so the court comes first.
  //   Second tide, the King Rises (two thirds): he transforms, and every third round he drags a fighter below.
  //     A fighter held below loses their turns and drowns a little each round, until the party hurts the King enough
  //     in one round to make him let go (or two rounds pass).
  //   Third tide, the Last Rain (a quarter): the rain falls upward, the sea rises twice as fast, his Last Rain
  //     comes every third round, and the party's Fury builds half again as fast (the living song answering).
  // Over it all, the water: a level from 0 to 10 drawn rising over the party. From 6 it drowns everyone a little each
  // round; at 10 it becomes the Flood, his strongest blow. Any fighter can spend a turn to Ring the Rain Bell (the Bell
  // Sable carried all this way): the sea falls back 4, the King is exposed for a round, and a wind-up is broken. The Bell
  // needs a round's breath between rings (none in the last tide). The apology's honest duel keeps its own rules.
  const KING_TIDE = [0.85, 0.7], KING_DUEL = [1.25, 1.35];   // health and attack on top of the usual strength (tuned with the simulation: about 11 rounds, and 8 for the apology's duel)
  const KB = () => battle && battle.king;   // the final battle's state, or nothing
  const kingUnit = () => battle && battle.foes.find(f => f.id === "king" && !f.dead);
  const _startBattleTide = startBattle;
  startBattle = function (group, opts = {}) {
    const r = _startBattleTide(group, opts);
    const k0 = battle && group && group[0] === "king" ? battle.foes.find(f => f.id === "king") : null;
    if (k0) {   // his own tuning on top of the usual strength: with the sea and the tides it is the longest fight of the road
      const [hk, ak] = (opts || {}).apology ? (SIM.kingDuel || KING_DUEL) : (SIM.kingTide || KING_TIDE);
      k0.maxHp = k0.hp = Math.round(k0.maxHp * hk); k0.atk = Math.round(k0.atk * ak);
    }
    if (battle && group && group[0] === "king" && !(opts || {}).apology) {
      battle.king = { water: 0, tide: 1, bellReady: 1, below: null, roundDmg: 0, lastRound: 0, souls: [] };
      blog("The floor of the deep is water now, and the water is rising. (Ring the Rain Bell to push the sea back.)");
    }
    return r;
  };
  const kingSplash = (name, sub) => { $("splashName").textContent = name; $("splashSub").textContent = sub; const sp = $("splash"); sp.hidden = true; void sp.offsetWidth; sp.hidden = false; clearTimeout(sp._t); sp._t = setTimeout(() => { sp.hidden = true; }, 2600); };
  const kingSay = (f, text) => { for (let i = RIG_FX.length - 1; i >= 0; i--) if (RIG_FX[i].kind === "say" && RIG_FX[i].unit === f) RIG_FX.splice(i, 1); RIG_FX.push({ kind: "say", text, unit: f, t0: time, dur: 3 }); Voice.say("king", text); };
  function raiseWater(n) {
    const K = KB(); if (!K) return; K.water = Math.max(0, Math.min(10, K.water + n));
    if (n > 0 && K.water >= 10) popupText(kingUnit() || battle.heroes[0], "THE FLOOD COMES", "#9ef0f5");
  }
  // each round, when the King chooses his move
  const _chooseIntentTide = chooseIntent;
  chooseIntent = function (f) {
    const K = KB();
    if (!K || f.id !== "king" || f.dead) return _chooseIntentTide(f);
    if (K.lastRound !== battle.round) {
      K.lastRound = battle.round; K.roundDmg = 0;
      raiseWater(battle.round === 1 ? 0 : K.tide === 3 ? 2 : 1);
      if (K.water >= 6) {   // the sea takes a little from everyone
        const pct = 0.04 * (K.water - 5);
        for (const h of battle.heroes) if (alive(h)) { const d = Math.max(1, Math.round(h.ref.maxHp * pct)); damage(h, d, { silent: true, noFury: true }); popup(h, d, "#4ab8d8"); }
        blog(`The sea is at ${K.water} of 10. Everyone chokes on brine.`);
      }
      if (K.below) {   // a fighter held under
        const h = K.below.unit;
        if (--K.below.rounds <= 0 || !alive(h)) freeBelow(false);
        else { h.st.stun = true; const d = Math.max(1, Math.round(h.ref.maxHp * 0.06)); damage(h, d, { silent: true, noFury: true }); popup(h, d, "#4ab8d8"); }
      }
    }
    if (K.water >= 10) { K.water = 5; return { name: "The Flood", power: 1.9, all: true, kingMove: "flood", announce: "THE FLOOD. The whole sea stands up and falls on you." }; }
    if (K.tide >= 2 && !K.below && battle.round % 3 === 0 && battle.heroes.filter(alive).length > 1) return { name: "Taken Below", kingMove: "below" };
    return _chooseIntentTide(f);
  };
  // the court shields him; the tides turn at two thirds and a quarter; the Last Rain feeds the party's song
  onBattle("damage", ctx => {
    const K = KB(); if (!K || ctx.target.id !== "king" || ctx.target.side !== "foe") return;
    if (battle.foes.some(f => f.summoned && !f.dead) && ctx.amount > 1) ctx.amount = Math.max(1, Math.round(ctx.amount * 0.67));
  });
  onBattle("damaged", (ctx, d) => {
    const K = KB(), f = ctx.target; if (!K || f.id !== "king" || f.side !== "foe" || f.dead) return;
    K.roundDmg += d;
    if (K.below && K.roundDmg >= f.maxHp * 0.08) freeBelow(true);
    if (K.tide === 1 && f.hp <= f.maxHp * 0.66) {
      K.tide = 2; if (!f.phase2) enterPhase2(f);
      setTimeout(() => { if (KB()) kingSplash("The King Rises", "Second tide"); }, 2700);
    }
    if (K.tide === 2 && f.hp <= f.maxHp * 0.25) {
      K.tide = 3; K.bellReady = 0; f.phase3 = true;
      setTimeout(() => { if (!KB()) return; kingSplash("The Last Rain", "Third tide"); kingSay(f, "Then let it all come down."); blog("THE LAST RAIN. The rain falls upward. Your Fury answers faster: the living song against the sea."); flash(1); shake = Math.max(shake, 12); Music.sound("boss"); }, 300);
    }
  });
  const _addFuryTide = addFury;
  addFury = function (n) { const K = KB(); return _addFuryTide(K && K.tide === 3 && n > 0 ? n * 1.5 : n); };
  function freeBelow(early) {
    const K = KB(); if (!K || !K.below) return; const h = K.below.unit; K.below = null; delete h.st.stun; delete h.st.below;
    if (!alive(h)) return;
    popupText(h, early ? "PULLED FREE" : "SURFACES", "#9ef0f5"); Music.sound("heal");
    blog(early ? `You hurt the King enough that he lets go. ${h.name} breaks the surface, gasping.` : `${h.name} claws back to the surface.`);
    const k = kingUnit(); if (early && k) { k.st.exposed = Math.max(k.st.exposed || 0, 2); popupText(k, "EXPOSED", "#ffcf4a"); }
  }
  // his own moves
  const _doFoeTide = doFoe;
  doFoe = async function (f) {
    const K = KB(), mv = f && f.intent;
    if (!K || !mv || !mv.kingMove || f.st.stun) return _doFoeTide(f);
    if (mv.kingMove === "below") {
      const pool = battle.heroes.filter(alive).filter(h => !h.st.taunt), h = pick(pool.length ? pool : battle.heroes.filter(alive)); if (!h) return;
      f.anim = { k: "wind", t0: time }; await wait(300); f.anim = null; if (!KB()) return;
      K.below = { unit: h, rounds: 2 }; h.st.stun = true; h.st.below = true; K.belowT = time;
      shake = Math.max(shake, 9); Music.sound("bleed"); popupText(h, "TAKEN BELOW", "#4ab8d8");
      kingSay(f, pick(["Stay with us. It is quiet here.", "One more for the deep.", "Below, courier. Where they all are."]));
      blog(`The King's hundred hands drag ${h.name} under the water! Hit him hard (${Math.round(f.maxHp * 0.08)} in one round) to make him let go.`);
      await wait(900); return;
    }
    if (mv.kingMove === "flood") {
      blog(mv.announce); flash(1); shake = 14; Music.sound("boss"); await wait(700); if (!KB()) return;
      const texts = []; for (const t of battle.heroes.filter(alive)) { const r = attackRoll(f, t, mv.power); texts.push(r.dodged ? `${t.name} dodges` : `${t.name} ${r.dmg}`); }
      blog(`The Flood: ${texts.join(", ")}. The water falls back to 5.`); await wait(900); return;
    }
    return _doFoeTide(f);
  };
  // the Rain Bell, on every fighter's menu in this battle
  const bellOk = () => { const K = KB(); return K && battle.round >= K.bellReady; };
  const _menuItemsTide = menuItems;
  menuItems = function () {
    const items = _menuItemsTide(), K = KB();
    if (!K || !menuState || menuState.page !== "main") return items;
    const ok = bellOk(), wait2 = K.bellReady - battle.round;
    items.splice(1, 0, { label: "🔔 Ring the Rain Bell", sub: ok ? `Push the sea back 4 (now ${K.water}/10), expose the King for a round, break his wind-up.` : `The Bell is still ringing out (ready in ${wait2} round${wait2 === 1 ? "" : "s"}). The sea: ${K.water}/10.`, disabled: !ok, go: () => finish({ kind: "bell" }) });
    return items;
  };
  const _doHeroTide = doHero;
  doHero = async function (u, act) {
    const K = KB();
    if (!K || !act || act.kind !== "bell") return _doHeroTide(u, act);
    const k = kingUnit(); K.bellReady = battle.round + (K.tide === 3 ? 1 : 2);
    playAct(u, "cast", 0.9); await wait(250); if (!KB()) return;
    raiseWater(-4); K.bellT = time; flash(0.9); shake = Math.max(shake, 8); Music.sound("heal"); Music.sound("crit");
    let extra = "";
    if (k) {
      k.st.exposed = Math.max(k.st.exposed || 0, 2); popupText(k, "EXPOSED", "#ffcf4a");
      if (k.charged || (k.intent && k.intent.release)) { k.charged = false; k.chargeDmg = 0; k.intent = { name: "Staggered" }; k.st.stun = true; extra = " His wind-up breaks apart!"; popupText(k, "BROKEN", "#ffcf4a"); }
      else if (k.intent && k.intent.kingMove === "flood") { k.intent = { name: "Staggered" }; k.st.stun = true; extra = " The Flood breaks before it falls!"; }
    }
    if (G.flags) G.flags.bellRung = (G.flags.bellRung || 0) + 1;
    blog(`${u.name} rings the Rain Bell. The sea shrinks back to ${K.water}.${extra}`); renderCards();
    await wait(800);
  };
  // the souls go up when he falls
  const _victoryTide = victory;
  victory = function () { const K = KB(); if (K) { K.won = time; if (K.below) { const h = K.below.unit; delete h.st.stun; delete h.st.below; K.below = null; } for (let i = 0; i < 60; i++) K.souls.push({ x: rand(20, VIEW_W - 20), y: rand(120, 200), v: rand(14, 34), w: rand(0, 6.28), s: rand(0.6, 1.4) }); } return _victoryTide(); };
  // ---- on screen
  const _drawRigFxTide = drawRigFx;
  drawRigFx = function (k) {
    _drawRigFxTide(k);
    const K = KB(); if (!K) return;
    const X = x => VP.ox + x * k, Y = y => VP.oy + y * k, W = VIEW_W;
    ctx.save();
    // the Last Rain: rain falling upward
    if (K.tide === 3 && !K.won) {
      ctx.strokeStyle = "rgba(158,240,245,0.55)"; ctx.lineWidth = Math.max(1, 0.8 * k);
      for (let i = 0; i < 70; i++) { const px = (i * 37.3) % W, py = 200 - ((time * (90 + (i % 7) * 12) + i * 23) % 220); ctx.beginPath(); ctx.moveTo(X(px), Y(py)); ctx.lineTo(X(px - 1.5), Y(py + 7)); ctx.stroke(); }
    }
    // the water, rising over the party
    const lvl = K.won ? K.water * Math.max(0, 1 - (time - K.won) / 2.5) : K.water, top = 196 - lvl * 9.5;   // it drains away when he falls
    if (lvl > 0 || K.bellT) {
      const g2 = ctx.createLinearGradient(0, Y(top), 0, Y(200)); g2.addColorStop(0, "rgba(62,200,220,0.42)"); g2.addColorStop(1, "rgba(10,40,70,0.7)");
      ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(X(0), Y(210));
      for (let x = 0; x <= W; x += 4) ctx.lineTo(X(x), Y(top + Math.sin(x * 0.06 + time * 2.2) * 1.6 + Math.sin(x * 0.13 - time * 1.4) * 0.8));
      ctx.lineTo(X(W), Y(210)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(220,250,255,0.75)"; ctx.lineWidth = Math.max(1, 1 * k); ctx.beginPath();
      for (let x = 0; x <= W; x += 4) { const y = top + Math.sin(x * 0.06 + time * 2.2) * 1.6 + Math.sin(x * 0.13 - time * 1.4) * 0.8; x ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); } ctx.stroke();
      ctx.fillStyle = "rgba(220,250,255,0.6)";   // bubbles
      for (let i = 0; i < 18; i++) { const s = (time * 0.4 + i / 18) % 1, bx = (i * 53.7) % W, by = 200 - s * (200 - top); ctx.fillRect(X(bx + Math.sin(time * 3 + i) * 2), Y(by), 1.2 * k, 1.2 * k); }
      if (lvl >= 6) {   // drowned hands reaching up through the surface
        ctx.fillStyle = "rgba(150,190,200,0.55)";
        for (let i = 0; i < lvl - 4; i++) { const hx = 24 + ((i * 71) % (W - 48)), rise = 4 + 3 * Math.sin(time * 1.7 + i); ctx.fillRect(X(hx), Y(top - rise), 2 * k, (rise + 3) * k); ctx.fillRect(X(hx - 2), Y(top - rise - 2), 1 * k, 3 * k); ctx.fillRect(X(hx + 2), Y(top - rise - 3), 1 * k, 3 * k); ctx.fillRect(X(hx + 4), Y(top - rise - 1), 1 * k, 3 * k); }
      }
    }
    // the gauge: the sea, and where the Flood comes
    const gx = 8, gy = 40, gh = 90;
    if (!K.won) {
    ctx.fillStyle = "rgba(10,8,24,0.75)"; ctx.fillRect(X(gx - 2), Y(gy - 2), 8 * k, (gh + 4) * k);
    ctx.fillStyle = lvl >= 8 ? "#ff6b6b" : lvl >= 6 ? "#ffcf4a" : "#3ec8dc"; ctx.fillRect(X(gx), Y(gy + gh * (1 - lvl / 10)), 4 * k, gh * lvl / 10 * k);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(X(gx - 2), Y(gy + gh * 0.5), 8 * k, 1 * k);
    ctx.font = `${Math.round(6 * k)}px 'Pixelify Sans', monospace`; ctx.textAlign = "left"; ctx.fillStyle = "#e8f4ff";
    ctx.fillText(`SEA ${lvl}/10`, X(gx - 2), Y(gy - 5)); ctx.fillText(bellOk() ? "BELL ✓" : `BELL ${Math.max(0, K.bellReady - battle.round)}`, X(gx - 2), Y(gy + gh + 10));
    }
    // a fighter held below: a dark column of water and hands
    if (K.below && alive(K.below.unit)) {
      const p = unitPos(K.below.unit), a = Math.min(1, (time - (K.belowT || 0)) / 0.5);
      const g3 = ctx.createLinearGradient(0, Y(p.y - 50), 0, Y(p.y + 4)); g3.addColorStop(0, "rgba(10,40,70,0)"); g3.addColorStop(1, `rgba(10,40,70,${0.78 * a})`);
      ctx.fillStyle = g3; ctx.fillRect(X(p.x - 16), Y(p.y - 50), 32 * k, 56 * k);
      ctx.fillStyle = `rgba(150,190,200,${0.8 * a})`; for (let i = 0; i < 4; i++) { const hx = p.x - 10 + i * 6, hy = p.y - 16 - 10 * Math.abs(Math.sin(time * 2 + i)); ctx.fillRect(X(hx), Y(hy), 2 * k, (p.y - hy) * k); }
      ctx.fillStyle = "#9ef0f5"; ctx.textAlign = "center"; ctx.fillText(`BELOW · ${K.below.rounds}`, X(p.x), Y(p.y - 52));
    }
    // the Bell: rings of gold going out
    if (K.bellT && time - K.bellT < 1.2) {
      const a = (time - K.bellT) / 1.2; ctx.strokeStyle = `rgba(255,207,74,${1 - a})`; ctx.lineWidth = 2 * k;
      for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.arc(X(W / 2), Y(40), (a * 170 + r * 18) * k, 0, Math.PI * 2); ctx.stroke(); }
    }
    // when he falls, the drowned go up toward a surface they can see now
    if (K.won) {
      ctx.globalCompositeOperation = "lighter";
      for (const s of K.souls) {
        const t = time - K.won, y = s.y - t * s.v; if (y < -10) continue;
        const a = Math.min(1, t * 1.5) * Math.max(0, Math.min(1, 1.8 - t * 0.16)), x = s.x + Math.sin(t * 1.5 + s.w) * 5, r = (2.5 + s.s * 2) * k;
        const gl = ctx.createRadialGradient(X(x), Y(y), 0, X(x), Y(y), r * 2.4); gl.addColorStop(0, `rgba(232,248,255,${0.9 * a})`); gl.addColorStop(0.35, `rgba(158,240,245,${0.45 * a})`); gl.addColorStop(1, "rgba(158,240,245,0)");
        ctx.fillStyle = gl; ctx.fillRect(X(x) - r * 2.4, Y(y) - r * 2.4, r * 4.8, r * 4.8);
        ctx.fillStyle = `rgba(158,240,245,${0.35 * a})`; ctx.fillRect(X(x) - 0.5 * k, Y(y), 1 * k, 10 * s.s * k);   // a faint trail below it
      }
    }
    ctx.restore();
  };
  ACHIEVEMENTS.push(["bellking", "The Bell Answers", "Ring the Rain Bell against the Drowned King.", () => (G.flags.bellRung || 0) >= 1]);
  GUIDE.push(["tides", "The last battle: the sea and the Bell", () => !!KB() || !!G.flags.kingDead,
    "Against the Drowned King the sea rises every round (the gauge on the left). From 6 it drowns everyone a little; at 10 it falls on you as the Flood. Any fighter can spend a turn to Ring the Rain Bell: the sea falls back 4, the King is exposed, and his wind-up breaks. The Bell needs a round between rings, except in the last tide. His court shields him until it falls; later he drags a fighter below, and hurting him hard in one round makes him let go."]);
  // the balance simulation's player rings the Bell when the sea is high, or to break a wind-up
  const _simActTide = simAct;
  simAct = function (u) {
    const K = KB(), k = kingUnit();
    if (K && bellOk() && (K.water >= 4 || (k && (k.charged || (k.intent && k.intent.kingMove === "flood"))))) return { kind: "bell" };
    return _simActTide(u);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {
    kingState: () => { const K = KB(), k = battle && battle.foes.find(f => f.id === "king"); return K ? { water: K.water, tide: K.tide, bellReady: K.bellReady, round: battle.round, below: K.below ? K.below.unit.id : null, hp: k && k.hp, maxHp: k && k.maxHp, court: battle.foes.filter(f => f.summoned && !f.dead).length } : null; },
    kingSet: o => { const K = KB(), k = kingUnit(); if (!K) return null; if (o.water !== undefined) K.water = o.water; if (o.hpPct !== undefined && k) { k.hp = Math.round(k.maxHp * o.hpPct); damage(k, 1, { noFury: true }); } return true; },
  }), 0);

  // ================================================================== A HELPING HAND AFTER A DEFEAT
  // Normal is tuned for a party that uses the smiths. A party that falls to the same boss again gets a little help:
  // each defeat (up to three) makes that boss a tenth weaker next time, and the game says so, and what else helps.
  // Winning clears it. The Long Road's challenges keep their own rules.
  const lossesTo = id => ((G.flags.bossLoss || {})[id] || 0);
  const _defeatH = defeat;
  defeat = function () {
    const o = battle && battle.opts, id = o && o.boss;
    if (id && !o.deep && !o.echo && !o.weekly) {
      G.flags.bossLoss = G.flags.bossLoss || {}; const n = G.flags.bossLoss[id] = Math.min(3, lossesTo(id) + 1);
      setTimeout(() => toast(`The salt remembers: next time ${MONSTERS[id].name.split(",")[0]} will be a little weaker (${n} of 3). Better arms from the smiths help too, and Story difficulty is gentler.`), 0);
    }
    return _defeatH();
  };
  const _startBattleH = startBattle;
  startBattle = function (group, opts = {}) {
    const r = _startBattleH(group, opts), o = opts || {}, n = o.boss && !o.deep && !o.echo && !o.weekly ? lossesTo(o.boss) : 0;
    if (battle && n) {
      for (const f of battle.foes) if (f.id === o.boss) { f.maxHp = f.hp = Math.max(1, Math.round(f.maxHp * (1 - 0.1 * n))); f.atk = Math.max(1, Math.round(f.atk * (1 - 0.07 * n))); }
      setTimeout(() => { if (battle) blog(`The salt remembers your last attempt: ${MONSTERS[o.boss].name.split(",")[0]} is a little weaker this time.`); }, 1200);
    }
    return r;
  };
  onBattle("won", B => { const id = B.opts && B.opts.boss; if (id && G.flags.bossLoss && G.flags.bossLoss[id]) delete G.flags.bossLoss[id]; });
