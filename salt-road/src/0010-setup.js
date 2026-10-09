(() => {
  "use strict";
  // ---- Saving that works for every player. Browsers can refuse storage (private windows, blocked site data, some
  //      embedded frames). Everything in the game reads and writes through this store: the browser's local storage
  //      when it works; when it doesn't (or fills up), a copy kept with this tab, which survives reloads, and in
  //      IndexedDB when that is allowed. A save code (Pause > Save & load) carries a game anywhere, whatever the
  //      browser allows.
  const localStorage = (() => {
    let real = null;
    try { const ls = window.localStorage, k = "salt-road-probe"; ls.setItem(k, "1"); ls.removeItem(k); real = ls; } catch { /* blocked */ }
    const mem = new Map();
    try { if (window.name && window.name.startsWith("saltroad:")) for (const [k, v] of Object.entries(JSON.parse(window.name.slice(9)))) mem.set(k, v); } catch { /* nothing kept with this tab */ }
    let tabOk = true, idb = null;
    const mirror = (k, v) => {
      if (tabOk) try { window.name = "saltroad:" + JSON.stringify(Object.fromEntries(mem)); } catch { tabOk = false; }
      if (idb) try { const st = idb.transaction("kv", "readwrite").objectStore("kv"); if (v === null) st.delete(k); else st.put(v, k); } catch { /* IndexedDB refused */ }
    };
    const S = {
      where: real ? "browser" : "tab",
      getItem(k) { if (S.where === "browser") try { return real.getItem(k); } catch { /* fall through */ } return mem.has(k) ? mem.get(k) : null; },
      setItem(k, v) {
        v = String(v);
        if (S.where === "browser") try { real.setItem(k, v); return; } catch {   // full or revoked: carry on with this tab's copy
          S.where = "tab"; try { for (let i = 0; i < real.length; i++) { const key = real.key(i); if (/^salt-road/.test(key) && !mem.has(key)) mem.set(key, real.getItem(key)); } } catch { /* unreadable */ }
          S.open();
        }
        mem.set(k, v); mirror(k, v);
      },
      removeItem(k) { if (S.where === "browser") try { real.removeItem(k); } catch { /* ignore */ } mem.delete(k); mirror(k, null); },
      ready: Promise.resolve(false),
      open() {   // IndexedDB: read what an earlier visit kept there, then keep writing to it
        if (S.ready !== S._r0) return S.ready;
        S.ready = new Promise(res => { try { const r = indexedDB.open("salt-road", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch { res(null); } })
          .then(db => new Promise(res => { idb = db; if (!db) return res(false); let found = false;
            try { const req = db.transaction("kv").objectStore("kv").openCursor();
              req.onsuccess = () => { const c = req.result; if (c) { if (!mem.has(c.key)) { mem.set(c.key, c.value); found = true; } c.continue(); } else { for (const [k, v] of mem) mirror(k, v); res(found); } };
              req.onerror = () => res(false); } catch { res(false); } }));
        return S.ready;
      },
    };
    S._r0 = S.ready;
    if (!real) S.open();
    return S;
  })();
  const $ = id => document.getElementById(id);
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TILE = 16, W = 170, H = 190, OW = 72, OH = 54, VIEW_W = 320, VIEW_H = 192;
  const SETTINGS = { music: 0.8, sfx: 0.8, text: "normal", battle: "normal", shake: true };
  try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem("salt-road-settings") || "{}")); } catch { /* storage unavailable */ }
  // text drawn on the picture (intents, damage, names) follows Settings > Comfort > Font, like the panels
  const canvasFont = (px, bold) => SETTINGS.font === "pixel" ? `${bold ? "700 " : ""}${px}px 'Pixelify Sans', 'Courier New', monospace` : `700 ${px}px 'Atkinson Hyperlegible', 'Segoe UI', Arial, sans-serif`;
  let paused = false;
  // Battle pacing waits while paused, and runs faster on the "fast" battle speed
  const wait = ms => new Promise(r => {
    const go = () => { if (paused) { setTimeout(go, 100); return; } setTimeout(r, REDUCED ? Math.min(ms, 120) : SETTINGS.battle === "fast" ? ms * 0.45 : ms); };
    go();
  });
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

