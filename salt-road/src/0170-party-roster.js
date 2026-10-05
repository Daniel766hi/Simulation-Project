  // ================================================================== PARTY ROSTER
  function openRoster() {
    mode = "roster"; renderRoster(); $("rosterUI").hidden = false; Music.sound("click");
  }
  function closeRoster() { $("rosterUI").hidden = true; mode = "play"; save(); updateHud(); }
  function renderRoster() {
    const list = $("rosterList"); list.innerHTML = "";
    for (const id of G.members) {
      const h = G.party[id], def = HEROES[id], on = G.active.includes(id);
      const wrap = document.createElement("div"); wrap.className = "rcard";
      const b = document.createElement("button"); b.type = "button"; b.className = on ? "on" : "";
      b.innerHTML = `<b><span>${h.name}</span><span class="tag">${on ? "Fighting" : "Resting"}</span></b>
        <small>${def.role} · strikes ${heroType(id)} · Lv ${h.level} · HP ${h.hp}/${h.maxHp} · SP ${h.maxSp} · ATK ${h.atk} · DEF ${h.def} · SPD ${h.spd}</small>
        <small>${def.bio}</small><small style="color:var(--text)">${def.skills.map(s => s.name).join(" · ")}</small>`;
      b.addEventListener("click", () => {
        if (on) { if (G.active.length > 1) G.active = G.active.filter(x => x !== id); else toast("Someone has to fight."); }
        else if (G.active.length < 4) G.active.push(id); else toast("Four fighters at most. Rest someone first.");
        Music.sound("click"); renderRoster();
      });
      wrap.appendChild(b);
      if ((G.relics || []).length) {
        G.equip = G.equip || {};
        const cur = G.equip[id], rb = document.createElement("button"); rb.type = "button"; rb.className = "relic";
        rb.innerHTML = cur ? `Relic: <b>${RELICS[cur].name}</b> <small>${RELICS[cur].desc}</small>` : `Relic: none <small>(tap to equip)</small>`;
        rb.addEventListener("click", () => {
          const taken = new Set(Object.entries(G.equip).filter(([h]) => h !== id).map(([, r]) => r));
          const opts = [null, ...G.relics.filter(r => !taken.has(r))];
          const next = opts[(opts.indexOf(cur || null) + 1) % opts.length];
          if (next) G.equip[id] = next; else delete G.equip[id];
          Music.sound("click"); renderRoster();
        });
        wrap.appendChild(rb);
      }
      if (BONDS[id] && bondAvailable(id)) {
        const tb = document.createElement("button"); tb.type = "button"; tb.className = "relic talk";
        tb.innerHTML = `★ Sit and talk with ${h.name} <small>${BONDS[id].talks[bondLevel(id)].title} · bond ${bondLevel(id) + 1}/3</small>`;
        tb.addEventListener("click", () => { closeRoster(); startBond(id); });
        wrap.appendChild(tb);
      } else if (BONDS[id]) {
        const tb = document.createElement("div"); tb.className = "bondline"; tb.textContent = `Bond ${bondLevel(id)}/3${bondLevel(id) >= 3 ? " · bonded" : ""}`; wrap.appendChild(tb);
      }
      list.appendChild(wrap);
    }
  }
  $("rosterClose").addEventListener("click", closeRoster);

