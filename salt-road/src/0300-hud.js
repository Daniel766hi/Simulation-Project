  // ================================================================== HUD
  function updateHud() {
    if (!G) return;
    $("partyMini").innerHTML = G.active.map(id => { const h = G.party[id]; return `<div class="pm"><span>${h.name} <small style="color:var(--muted)">${h.level}</small></span><span><div class="bar hp"><i style="width:${h.hp / h.maxHp * 100}%"></i></div><div class="bar sp" style="height:4px;margin-top:2px"><i style="width:${h.sp / h.maxSp * 100}%"></i></div></span></div>`; }).join("")
      + (G.members.length > G.active.length ? `<div style="font-size:11px;color:var(--muted)">+${G.members.length - G.active.length} resting (P)</div>` : "");
    $("coins").textContent = `◆ ${G.coins}`;
    const talkReady = typeof bondAvailable === "function" && G.members.some(id => bondAvailable(id));
    $("partyBtn").classList.toggle("glow", talkReady); $("partyBtn").textContent = talkReady ? "Party (P) ★ talk" : "Party (P)";
    // short names, unless two would read the same (a Salve and a Greater Salve)
    const held = Object.entries(G.items).filter(([, n]) => n > 0), short = k => ITEMS[k].name.split(" ").pop();
    $("items").textContent = held.map(([k, n]) => `${held.filter(([j]) => short(j) === short(k)).length > 1 ? ITEMS[k].name : short(k)} ×${n}`).join(" · ");
    const t = goal();
    $("goalText").textContent = t.text; $("chapter").textContent = t.ch || "Goal";
    $("goal").hidden = !t.text;
  }
  // conditions with what is left of them. Counted ones tick down as their holder's turn starts, so a Weak of 2 lasts
  // one more of its turns; Bleed hurts once per turn for as many turns as it shows.
  function statusTags(u) {
    const st = (u && u.st) || {}, out = [], left = v => Math.max(1, (Number(v) || 1) - 1), s = n => n === 1 ? "" : "s";
    if (st.bleed) out.push({ k: "bleed", name: "Bleed", n: st.bleed.turns, tip: `Bleeding: loses ${st.bleed.dmg} health at the start of each turn, for ${st.bleed.turns} more turn${s(st.bleed.turns)}.` });
    if (st.stun) out.push({ k: "stun", name: "Stun", tip: "Stunned: loses its next turn." });
    if (st.weak) out.push({ k: "weak", name: "Weak", n: left(st.weak), tip: `Weakened: hits 30% softer for ${left(st.weak)} more turn${s(left(st.weak))}.` });
    if (st.strong) out.push({ k: "strong", name: "Strong", n: left(st.strong), tip: `Strengthened: hits 30% harder for ${left(st.strong)} more turn${s(left(st.strong))}.` });
    if (st.brk) out.push({ k: "brk", name: "Broken", n: left(st.brk), tip: `Armour broken: its defence counts for almost nothing, for ${left(st.brk)} more turn${s(left(st.brk))}.` });
    if (st.taunt) out.push({ k: "taunt", name: "Taunt", n: left(st.taunt), tip: `Drawing the enemies' attacks for ${left(st.taunt)} more turn${s(left(st.taunt))}.` });
    if (st.guard) out.push({ k: "guard", name: "Guard", tip: "Guarded: takes half damage until the guard's next turn." });
    if (st.veil) out.push({ k: "veil", name: "Veil", tip: "Veiled: the next blow misses." });
    if (st.mark) out.push({ k: "mark", name: "Marked", tip: "Marked: the next hit on it is critical." });
    return out;
  }
  const statusLine = u => statusTags(u).map(t => t.name + (t.n ? " " + t.n : "")).join(" · ");
  function renderCards() {
    if (!battle) return;
    const picking = menuState && menuState.page === "target" ? menuState.options.map(o => o.unit) : [];
    $("cards").innerHTML = "";
    for (const h of battle.heroes) {
      const r = h.ref, el = document.createElement("div");
      el.className = "card" + (battle.current === h ? " active" : "") + (!alive(h) ? " ko" : "") + (picking.includes(h) ? " pick" : "");
      const chips = statusTags(h).map(t => `<span class="chip ${t.k}" title="${t.tip}">${t.name}${t.n ? `<i>${t.n}</i>` : ""}</span>`).join("");
      el.innerHTML = `<div class="nm">${r.name}<small>Lv ${r.level}</small></div>
        <div class="bar hp"><i style="width:${r.hp / r.maxHp * 100}%"></i></div><div class="nums"><span>HP ${r.hp}/${r.maxHp}</span><span>SP ${r.sp}/${r.maxSp}</span></div>
        <div class="bar sp"><i style="width:${r.sp / r.maxSp * 100}%"></i></div>
        <div class="chips">${chips}</div>`;
      if (picking.includes(h)) el.addEventListener("click", () => { const i = menuState.options.findIndex(o => o.unit === h); if (i >= 0) menuItems()[i].go(); });
      $("cards").appendChild(el);
    }
  }
  function renderTurnbar() {
    if (!battle) return;
    $("turnbar").innerHTML = battle.queue.filter(u => u.side === "hero" ? alive(u) : !u.dead).map(u => `<span class="${u.side === "foe" ? "foe" : ""}${u === battle.current ? " now" : ""}">${u.name.split(",")[0]}</span>`).join("");
  }
  canvas.addEventListener("click", e => {
    if (!battle || !menuState || menuState.page !== "target") return;
    const r = canvas.getBoundingClientRect(), dv = canvas.width / r.width, x = ((e.clientX - r.left) * dv - VP.ox) / VP.k, y = ((e.clientY - r.top) * dv - VP.oy) / VP.k;
    menuState.options.forEach((o, i) => { if (o.unit.side === "foe") { const p = unitPos(o.unit); if (Math.abs(x - p.x) < (o.unit.boss ? 34 : 20) && y < p.y + 4 && y > p.y - (o.unit.boss ? 110 : 70)) menuItems()[i].go(); } });
  });

