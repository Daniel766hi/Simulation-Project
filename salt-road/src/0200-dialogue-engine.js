  // ================================================================== DIALOGUE ENGINE
  let dlg = null, sel = 0, typed = 0;
  // a node's text and go may be functions, for lines that depend on the story so far; text is resolved once on open
  const val = v => typeof v === "function" ? v() : v;
  const nodeOf = id => {
    const n = D[id]; if (!n) return null;
    const r = typeof n.text === "function" ? { ...n, text: n.text() } : n;
    if (typeof r.text !== "string") { console.warn(`dialogue node ${id} has no text; skipped`); return null; }
    return r;
  };
  function openDialog(id) {
    const n = id && nodeOf(id); if (!n) return;
    mode = "dialog"; dlg = n; sel = 0; typed = REDUCED ? 9999 : 0;
    $("dialog").hidden = false;
    renderDialog();
  }
  function renderDialog() {
    const npc = NPCS.find(n => n.id === dlg.who) || (dlg.who === "sable" ? { id: "sable", name: "Sable", look: HEROES.sable.look } : null);
    $("who").textContent = npc ? npc.name : SPEAKERS[dlg.who] || (dlg.text.startsWith("A memory") ? "Memory shard" : "");
    $("line").textContent = dlg.text.slice(0, Math.floor(typed));
    const done = typed >= dlg.text.length;
    const opts = $("opts"); opts.innerHTML = "";
    if (done && dlg.choices) dlg.choices.forEach((c, i) => {
      const b = document.createElement("button");
      const ok = !c.req || c.req();
      const label = typeof c.t === "function" ? c.t() : c.t, need = typeof c.reqText === "function" ? c.reqText() : c.reqText;
      b.textContent = `${i + 1}. ${label}${!ok && need ? ` (needs ${need})` : ""}`;
      b.disabled = !ok;
      if (i === sel) b.classList.add("sel");
      b.addEventListener("click", () => pickChoice(i));
      opts.appendChild(b);
    });
    $("next").hidden = !done || !!dlg.choices;
    drawPortrait(npc, dlg.who);
  }
  function moveSel(d) { if (dlg && dlg.choices) { sel = (sel + d + dlg.choices.length) % dlg.choices.length; Music.sound("click"); renderDialog(); } }
  function pickChoice(i) {
    if (!dlg || !dlg.choices || typed < dlg.text.length) return;
    const c = dlg.choices[i]; if (!c || (c.req && !c.req())) return;
    Music.sound("click");
    closeDialogFor(val(c.go), c.act);
  }
  function dialogAdvance() {
    if (!dlg) return;
    if (typed < dlg.text.length) { typed = dlg.text.length; renderDialog(); return; }
    if (dlg.choices) { pickChoice(sel); return; }
    closeDialogFor(val(dlg.go), dlg.act);
  }
  function closeDialogFor(next, act) {
    const nn = next && nodeOf(next);
    if (nn) { if (act) act(); if (mode === "dialog") { dlg = nn; sel = 0; typed = REDUCED ? 9999 : 0; renderDialog(); } return; }
    dlg = null; $("dialog").hidden = true;
    if (mode === "dialog") mode = "play";
    if (act) act();
    updateHud();
  }

