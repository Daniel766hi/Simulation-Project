  // ================================================================== OVERWORLD LOGIC
  const tileAt = (x, y) => get(Math.floor(x / TILE), Math.floor(y / TILE));
  const sealOpen = () => G.keyItems.lantern && G.keyItems.signet;
  function blocked(x, y, r = 4) {
    for (const [dx, dy] of [[-r, -2], [r, -2], [-r, 3], [r, 3]]) {
      const t = tileAt(x + dx, y + dy);
      if (SOLID.has(t)) return t;
      if (t === T.LDOOR && !sealOpen()) return t;
      if (propAt(x + dx, y + dy)) return T.ROCK;
    }
    return 0;
  }
  function nearestNpc() {
    let best = null, bd = 22;
    for (const n of NPCS) {
      if (!npcVisible(n) || (n.id === "beno" && G.flags.benoFollows)) continue;
      if (n.id === "ada" && G.stage < 4) continue;
      const d = Math.hypot(n.px - G.px, n.py - G.py) + (n.wander ? 12 : 0);   // named people first, passers-by second
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  const near = (p, r) => Math.hypot(G.px - p.x, G.py - p.y) < r;
  function interact() {
    const n = nearestNpc();
    if (n) { if (!n.look.dead) n.dir = Math.abs(G.px - n.px) > Math.abs(G.py - n.py) ? (G.px > n.px ? "right" : "left") : (G.py > n.py ? "down" : "up"); openDialog(dialogFor(n)); return true; }
    if (interactAct2()) return true;
    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]]) if (get(tx + dx, ty + dy) === T.WELL) { openDialog("well_rest"); return true; }
    if (near({ x: 36 * TILE + 8, y: 28 * TILE + 8 }, 30) && G.flags.butcherDead) { openDialog("pool_rest"); return true; }
    if (near({ x: 60 * TILE + 8, y: 44 * TILE + 8 }, 30) && G.flags.motherDead) { openDialog("grove_rest"); return true; }
    if (near({ x: 56 * TILE + 8, y: 14 * TILE + 8 }, 28) && G.stage >= 6) { openDialog("gate_rest"); return true; }
    for (const l of LORE) if (near({ x: l.x * TILE + 8, y: l.y * TILE + 8 }, 20)) { readLore(l); return true; }
    for (const pr of PROPS) if (pr.type === "sign" && near({ x: pr.px, y: pr.py }, 20)) { D.__sign = say(null, pr.text); openDialog("__sign"); return true; }
    if (near(VOSS_POS, 34) && G.flags.unlocked && !G.flags.vossDead) { openDialog(G.flags.shardQuest && (G.flags.shards || []).length >= 3 && !G.flags.wardenFree ? "warden_free" : G.flags.metVoss ? "voss_return" : "voss_0"); G.flags.metVoss = true; return true; }
    if (G.flags.vossDead && !G.keyItems.bell && near({ x: 34 * TILE + 8, y: 6 * TILE + 8 }, 26)) {
      G.keyItems.bell = true; toast("You take the Rain Bell. It is still warm."); Music.sound("item"); burst(G.px, G.py - 8, "#ffcf4a", 30); save(); updateHud();
      openDialog("voss_dying"); return true;
    }
    return false;
  }

