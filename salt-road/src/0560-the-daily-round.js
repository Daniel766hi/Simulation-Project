  // ================================================================== THE DAILY ROUND
  // Days are counted. Each dawn brings three tasks for the day; finishing them pays, and finishing all
  // three keeps a streak going. Shops close at night (Mora opens instead), and resting at night sleeps to dawn.
  const DAY_WORKERS = ["odo", "ama", "yusra", "dov", "hake", "abawidow"];   // shops and trades only, never anyone a quest needs
  function npcAsleep(n) {
    try { return !!G && G.stage >= 1 && !G.flags.epilogue && DAY_WORKERS.includes(n.id) && isNight() && !(G.flags.job && G.flags.job.to === n.id && false); } catch { return false; }
  }
  const talkedToday = new Set();
  const sumFish = () => Object.values(G.flags.fishLog || {}).reduce((a, b) => a + b, 0);
  const counters = {
    wins: () => (G.stats && G.stats.wins) || 0, jobs: () => G.flags.jobsDone || 0, fish: sumFish, lore: () => (G.flags.lore || []).length,
    talks: () => talkedToday.size, rests: () => G.flags.restCount || 0, steps: () => Math.floor((G.flags.walked || 0) / TILE),
    brews: () => G.flags.brewCount || 0, pale: () => ((G.flags.kills || {}).wraith || 0) + ((G.flags.kills || {}).moonmother || 0),
    chests: () => Object.keys(G.flags.chests || {}).length, dash: () => G.flags.ambushCount || 0,
  };
  const CHORES = [
    { id: "win3", text: "Win 3 battles", c: "wins", goal: 3, ok: () => true },
    { id: "win6", text: "Win 6 battles", c: "wins", goal: 6, ok: () => G.stage >= 4 },
    { id: "job", text: "Deliver a parcel for Postmistress Ama", c: "jobs", goal: 1, ok: () => G.stage >= 1 && NPCS.some(n => n.id === "ama") },
    { id: "fish2", text: "Catch 2 fish", c: "fish", goal: 2, ok: () => G.flags.hasRod },
    { id: "talk4", text: "Talk with 4 different people", c: "talks", goal: 4, ok: () => true },
    { id: "rest", text: "Rest at a well or campfire", c: "rests", goal: 1, ok: () => true },
    { id: "walk", text: "Walk 400 paces", c: "steps", goal: 400, ok: () => true },
    { id: "brew", text: "Brew something with Kest", c: "brews", goal: 1, ok: () => G.members.includes("kest") },
    { id: "pale", text: "Lay a pale thing to rest after dark", c: "pale", goal: 1, ok: () => G.stage >= 3 && NIGHT_HUNTS.some(h => !G.defeated.includes(h.id) && G.stage >= h.minStage) },
    { id: "ambush", text: "Ambush monsters with a dash (Shift)", c: "dash", goal: 1, ok: () => true },
  ];
  const choreReward = () => ({ coins: 12 + G.stage * 4, item: pick(["salve", "salve", "tonic", "gsalve", "ether", "salts"].filter(k => ITEMS[k] && (k !== "gsalve" && k !== "ether" || G.stage >= 7))) });
  function rollDay() {
    const pool = CHORES.filter(c => c.ok()).sort(() => Math.random() - 0.5), picked = [];
    for (const c of pool) { if (picked.length >= 3) break; if (c.id === "win6" && picked.some(p => p.id === "win3")) continue; if (c.id === "win3" && picked.some(p => p.id === "win6")) continue; picked.push(c); }
    talkedToday.clear();
    G.flags.daily = { day: G.day, chores: picked.map(c => ({ id: c.id, base: counters[c.c](), done: false })), streak: (G.flags.daily && G.flags.daily.streak) || 0 };
    save(); updateHud();
  }
  function choreProgress(ch) { const c = CHORES.find(x => x.id === ch.id); return c ? [Math.min(c.goal, counters[c.c]() - ch.base), c.goal, c.text] : [0, 1, ch.id]; }
  function newDay() {
    const d = G.flags.daily;
    if (d && d.chores.length) { const all = d.chores.every(c => c.done); d.streak = all ? d.streak : 0; }
    G.day = (G.day || 1) + 1;
    rollDay();
    const st = G.flags.daily.streak;
    toast(`Day ${G.day}. ${st ? `A ${st}-day streak. ` : ""}New tasks for today (pause menu or journal).`);
  }
  function checkChores() {
    const d = G.flags.daily; if (!d) return;
    for (const ch of d.chores) {
      if (ch.done) continue;
      const [p, goal, text] = choreProgress(ch); if (p < goal) continue;
      ch.done = true; const r = choreReward(); G.coins += r.coins; if (r.item) G.items[r.item] = (G.items[r.item] || 0) + 1;
      Music.sound("item"); toast(`Task done: ${text}. +${r.coins} coin${r.item ? `, ${ITEMS[r.item].name}` : ""}.`);
      if (d.chores.every(c => c.done)) {
        d.streak = (d.streak || 0) + 1; const bonus = 20 * d.streak;
        G.coins += bonus; for (const id of G.members) { G.party[id].hp = G.party[id].maxHp; G.party[id].sp = G.party[id].maxSp; }
        setTimeout(() => toast(`A good day's work. Streak ${d.streak}: +${bonus} coin, and the whole party feels rested.`), 1800);
        if (d.streak >= 7 && !(G.relics || []).includes("almanac")) setTimeout(() => giveRelic("almanac"), 3600);
      }
      save(); updateHud();
    }
  }
  Object.assign(RELICS, { almanac: { name: "Courier's Almanac", from: "daily", desc: "Seven good days in a row. +2 speed, +2 SP each turn, +5% critical chance.", spd: 2, spRegen: 2, crit: 0.05 } });
  // the day line in the HUD
  const dayLine = document.createElement("div"); dayLine.className = "row"; dayLine.id = "dayLine"; dayLine.style.cssText = "color:var(--muted);margin-top:2px";
  $("partyMini").parentNode.appendChild(dayLine);
  const phaseName = () => { const c = G.clock ?? 0.3; return c < 0.06 ? "Dawn" : c < 0.2 ? "Morning" : c < 0.34 ? "Noon" : c < 0.45 ? "Afternoon" : c < 0.55 ? "Dusk" : c < 0.8 ? "Night" : c < 0.95 ? "Midnight" : "Before dawn"; };
  let prevClock = null, dayTick = 0, closedToastDay = -1;
  const _updateD = update;
  update = function (dt) {
    _updateD(dt);
    if (!G || mode === "title") return;
    if (mode === "play" && player.moving) G.flags.walked = (G.flags.walked || 0) + dt * (player.sprint ? 96 : 64);
    const c = G.clock ?? 0.3;
    if (prevClock !== null && c < prevClock - 0.5 && G.stage >= 1 && !G.flags.epilogue) newDay();
    prevClock = c;
    if (G.stage >= 1 && !G.flags.epilogue && !G.flags.daily) { G.day = G.day || 1; rollDay(); setTimeout(() => toast("New: three tasks each day. See them in the pause menu or the journal."), 1500); }
    if (G.stage >= 1 && !G.flags.epilogue && isNight() && closedToastDay !== G.day && mode === "play") { closedToastDay = G.day; toast("Night. The shops and stalls have closed; Mora's night stall opens in Kessa."); }
    dayTick -= dt; if (dayTick > 0) return; dayTick = 0.5;
    if (G.stage >= 1 && G.flags.daily) checkChores();
    const d = G.flags.daily;
    dayLine.hidden = G.stage < 1 || !!G.flags.epilogue;
    dayLine.textContent = `${isNight() ? "☾" : "☀"} Day ${G.day || 1} · ${phaseName()}${d ? ` · Tasks ${d.chores.filter(x => x.done).length}/${d.chores.length}${d.streak ? ` · Streak ${d.streak}` : ""}` : ""}`;
  };
  const _dialogForD = dialogFor;
  dialogFor = function (n) { talkedToday.add(n.id); if (npcAsleep(n)) { D.__asleep = say(null, `${n.name}'s door is shut and the lamp is out. (Asleep until morning. Shops open at dawn.)`); return "__asleep"; } return _dialogForD(n); };
  const _restD = restParty;
  restParty = function () { G.flags.restCount = (G.flags.restCount || 0) + 1; _restD(); };
  $("pauseUI").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.craft !== undefined && !b.disabled) G.flags.brewCount = (G.flags.brewCount || 0) + 1; }, true);
  function dailyHtml() {
    const d = G.flags.daily; if (!d) return "<p class='dim'>Tasks begin after the prologue.</p>";
    return `<p class="dim" style="font-size:13px;margin:0 0 6px">Day ${G.day || 1}. New tasks every dawn; unfinished ones lapse. Finish all three to grow your streak (bonus coin, a full rest, and a relic at 7 days). Streak: ${d.streak || 0}.</p><ul style="list-style:none;padding:0;display:grid;gap:6px">${d.chores.map(ch => { const [p, g2, t] = choreProgress(ch); return `<li style="padding:6px 10px;border:1px solid var(--edge);border-radius:6px;${ch.done ? "border-color:var(--gold)" : ""}"><b style="color:${ch.done ? "var(--gold)" : "var(--text)"}">${ch.done ? "✔" : "○"} ${t}</b> <span class="dim" style="font-size:12px"> · ${ch.done ? "done" : `${Math.max(0, p)}/${g2}`}</span></li>`; }).join("")}</ul>`;
  }
  $("pauseUI").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.a === "today") showPanel("Today", dailyHtml()); });
  const _extraJournalD = extraJournalHtml;
  extraJournalHtml = function () { return (G.flags.daily ? `<h3>Today (Day ${G.day || 1})</h3>${dailyHtml()}` : "") + _extraJournalD(); };
  ACHIEVEMENTS.push(["streak7", "Every Day, Again", "Finish all of a day's tasks seven days running.", () => (G.flags.daily && G.flags.daily.streak >= 7) || (G.relics || []).includes("almanac")]);

