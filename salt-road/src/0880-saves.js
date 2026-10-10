  // ================================================================== SAVES: FOR EVERY PLAYER
  // The game saves itself as you play, into this browser (see the store at the top). Where the browser refuses to
  // keep anything, progress is held with this tab and the title screen says so. Either way a save file or a save
  // code (a line of text) carries a game to another browser or device.
  const saveCss = document.createElement("style");
  saveCss.textContent = "#saveNote{display:flex;align-items:center;gap:8px;justify-content:center;margin:10px auto 0;font-size:13px;color:var(--muted);max-width:92%;text-align:center}#saveNote b{color:var(--text)}#saveNote.warn{color:#ffcf4a}"
    + ".savebar{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.savebar .pbtn{flex:1 1 140px}.savecode{width:100%;min-height:74px;margin-top:8px;font:11px/1.35 ui-monospace,monospace;background:#0e0b1e;color:#f3efe6;border:2px solid #5e5680;padding:6px;word-break:break-all;resize:vertical}";
  document.head.appendChild(saveCss);
  const noteEl = document.createElement("div"); noteEl.id = "saveNote";
  $("newBtn").insertAdjacentElement("afterend", noteEl);
  function saveNote() {
    const tab = localStorage.where !== "browser";
    noteEl.classList.toggle("warn", tab);
    noteEl.textContent = tab ? "This browser won't let the game store data, so your progress is kept only while this tab stays open. Pause > Save & load > Save code keeps it for good."
      : "Your progress saves automatically in this browser.";
  }
  saveNote();
  const snapshotOf = () => { const t = goal(); return { when: Date.now(), label: t.ch || "Prologue", party: G.members.map(id => G.party[id].name + " " + G.party[id].level).join(", "), time: (G.stats && G.stats.time) || 0, state: JSON.stringify(G) }; };
  function applyState(state) {   // put a saved game behind the title screen's Continue button
    newGame(false); Object.assign(G, state);
    if (!G.active || !G.active.length) G.active = G.members.slice(0, 4);
    applyWorldState(); miniDirty = true; spawnField(); camX = G.px - VIEW_W / 2; camY = G.py - VIEW_H / 2;
    $("startBtn").textContent = "Continue"; $("newBtn").hidden = false; updateHud();
  }
  // a game kept in IndexedDB by an earlier visit (when local storage is blocked) arrives a moment after start-up
  localStorage.ready.then(found => { if (found && mode === "title" && G.stage === 0) { const st = load(); if (st && st.stage > 0) try { applyState(st); toast("Found your saved game."); } catch { /* damaged */ } } saveNote(); });
  // in a browser that keeps nothing, a reminder at each new chapter
  let lastStage = null;
  const _saveS = save;
  save = function () {
    _saveS();
    if (localStorage.where !== "browser" && mode !== "title" && lastStage !== null && G.stage > lastStage) toast("Progress is only kept in this tab. Pause > Save & load > Save code to keep it.");
    lastStage = G.stage; saveNote();
  };
  // save codes: the whole game as one line of text, compressed where the browser can
  const b64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
  async function pipe(u8, T) { return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new T("gzip"))).arrayBuffer()); }
  async function makeCode() {
    const u8 = new TextEncoder().encode(JSON.stringify({ game: "The Salt Road", ...snapshotOf() }));
    if (typeof CompressionStream === "function") try { return "SR2:" + b64(await pipe(u8, CompressionStream)); } catch { /* fall back */ }
    return "SR1:" + b64(u8);
  }
  async function readCode(code) {
    code = String(code).replace(/\s+/g, "");
    const kind = code.slice(0, 4); let u8 = unb64(code.slice(4));
    if (kind === "SR2:") u8 = await pipe(u8, DecompressionStream); else if (kind !== "SR1:") throw new Error("not a save code");
    return JSON.parse(new TextDecoder().decode(u8));
  }
  const stateFrom = d => { const st = d && d.state ? JSON.parse(d.state) : d && (d.G || d); if (!st || !st.party || !st.members) throw new Error("not a save"); return st; };
  const _showSlotsS = showSlots;
  showSlots = function () {
    _showSlotsS();
    const panel = $("pausePanel"); if (!panel) return;
    const body = panel.querySelector(".slot") ? panel.querySelector(".slot").parentNode : panel;
    const box = document.createElement("div");
    box.innerHTML = `<h3 style="margin:12px 0 4px">Keep your game</h3><p class="dim" style="font-size:12px;margin:0 0 6px">${localStorage.where === "browser"
      ? "The game saves in this browser as you play. To carry on somewhere else, take a save code or a save file with you."
      : "This browser won't store data: your progress lasts only while this tab is open. Copy a save code and keep it somewhere safe."}</p>`
      + `<div class="savebar"><button type="button" class="pbtn" data-a="code">Copy a save code</button><button type="button" class="pbtn" data-a="entercode">Enter a save code</button></div>`
      + `<div class="savebar"><button type="button" class="pbtn" data-a="export">Export a save file</button><button type="button" class="pbtn" data-a="import">Import a save file</button></div><div class="codebox"></div>`;
    const backBtn = [...panel.querySelectorAll("button")].find(x => /^Back/.test(x.textContent.trim()));
    if (backBtn) backBtn.before(box); else body.appendChild(box);
  };
  const fileIn = document.createElement("input"); fileIn.type = "file"; fileIn.accept = ".json,.txt,application/json,text/plain"; fileIn.hidden = true; document.body.appendChild(fileIn);
  fileIn.addEventListener("change", async () => {
    const f = fileIn.files && fileIn.files[0]; fileIn.value = ""; if (!f) return;
    try { const txt = (await f.text()).trim(), d = /^SR\d:/.test(txt) ? await readCode(txt) : JSON.parse(txt);
      loadState(stateFrom(d)); save(); toast(`Imported ${d.label || "your save"}.`); resumeGame(); }
    catch { toast("That file isn't a Salt Road save."); }
  });
  $("pausePanel").addEventListener("click", async ev => {
    const b = ev.target.closest("button[data-a]"); if (!b) return;
    const a = b.dataset.a;
    if (!["code", "entercode", "loadcode", "export", "import"].includes(a)) return;
    ev.stopPropagation();
    const cb = $("pausePanel").querySelector(".codebox");
    if (a === "code") {
      const code = await makeCode();
      cb.innerHTML = `<textarea class="savecode" readonly aria-label="Your save code"></textarea><p class="dim" style="font-size:12px;margin:4px 0 0">Keep this text somewhere safe (a note, a message to yourself). Enter it on any device to carry on.</p>`;
      const ta = cb.querySelector("textarea"); ta.value = code; ta.focus(); ta.select();
      let copied = false; try { await navigator.clipboard.writeText(code); copied = true; } catch { try { copied = document.execCommand("copy"); } catch { /* select it by hand */ } }
      toast(copied ? "Save code copied." : "Select the code and copy it.");
    }
    if (a === "entercode") {
      cb.innerHTML = `<textarea class="savecode" aria-label="Paste a save code" placeholder="Paste a save code (it starts with SR)"></textarea><div class="savebar"><button type="button" class="pbtn" data-a="loadcode">Load this code</button></div>`;
      cb.querySelector("textarea").focus();
    }
    if (a === "loadcode") {
      const txt = cb.querySelector("textarea").value.trim(); if (!txt) return;
      if (battle) { toast("Finish the battle first."); return; }
      try { const d = await readCode(txt); loadState(stateFrom(d)); save(); toast(`Loaded ${d.label || "your save"}.`); resumeGame(); }
      catch { toast("That isn't a Salt Road save code."); }
    }
    if (a === "export") {
      const data = JSON.stringify({ game: "The Salt Road", ...snapshotOf() }), filename = `salt-road-${(goal().ch || "save").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
      const dl = window.claude && typeof window.claude.use === "function" ? await window.claude.use("downloads").catch(() => null) : null;   // inside the claude.ai viewer, files go through its download prompt
      if (dl) { try { await dl.save({ filename, data }); toast("Save file ready."); } catch (e) { if (!e || e.code !== "declined") toast("Couldn't offer the file here. Use a save code."); } return; }
      try { const u = URL.createObjectURL(new Blob([data], { type: "application/json" })), l = document.createElement("a"); l.href = u; l.download = filename; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast("Save file downloading. If nothing arrives, use a save code."); }
      catch { toast("This browser won't download files here. Use a save code."); }
    }
    if (a === "import") fileIn.click();
  }, true);

  // the fine boss art is drawn after every other module has set up how picture text is flushed
  const _flushHiArt = flushHiText;
  flushHiText = function () {
    if (HIRES_Q.length) {
      const k = VP.k;
      for (const q of HIRES_Q) {   // scaled about the feet for squash and stretch, with afterimages behind a lunge
        const W2 = q.w * (q.sx || 1), H2 = q.h * (q.sy || 1), X2 = q.x + (q.w - W2) / 2, Y2 = q.y + q.h - H2;
        ctx.save(); ctx.imageSmoothingEnabled = k < ART_D;
        if (q.ghosts) for (const gh of q.ghosts) { ctx.globalAlpha = q.alpha * gh.a; ctx.drawImage(q.fr, Math.round(VP.ox + X2 * k), Math.round(VP.oy + (Y2 + gh.dy) * k), Math.round(W2 * k), Math.round(H2 * k)); }
        ctx.globalAlpha = q.alpha; ctx.drawImage(q.fr, Math.round(VP.ox + X2 * k), Math.round(VP.oy + Y2 * k), Math.round(W2 * k), Math.round(H2 * k));
        ctx.restore();
      }
      // what the picture drew in front of the boss comes back on top of it: blood and sparks, and the hit flash
      if (battle) {
        for (const p of particles) if (!p.world) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(Math.round(VP.ox + p.x * k), Math.round(VP.oy + p.y * k), Math.ceil(p.size * k), Math.ceil(p.size * k)); }
        if (battle.flash > 0) { ctx.globalAlpha = battle.flash * 0.6; ctx.fillStyle = "#ffffff"; for (const q of HIRES_Q) ctx.fillRect(Math.round(VP.ox + q.x * k), Math.round(VP.oy + q.y * k), Math.round(q.w * k), Math.round(q.h * k)); }
        ctx.globalAlpha = 1;
      }
      HIRES_Q.length = 0;
      if (battle) drawRigFx(k);
    }
    _flushHiArt();
  };

