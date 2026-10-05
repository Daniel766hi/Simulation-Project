  // ================================================================== GOALS
  const KEY_CHEST = { x: 40, y: 17 };
  const CHARM = { x: 11 * TILE + 8, y: 15 * TILE + 8 };
  const MOTHER_POS = { x: 62 * TILE + 8, y: 43 * TILE + 8 };
  const VOSS_POS = { x: 34 * TILE + 8, y: 7 * TILE + 8 };
  const HOLLIS_POS = { x: 61 * TILE + 8, y: 12 * TILE + 8 };
  const WYRM_POS = { x: 7 * TILE + 8, y: 11 * TILE + 8 };
  const SHARDS = [{ id: 0, x: 4, y: 50, node: "memory_0" }, { id: 1, x: 66, y: 48, node: "memory_1" }, { id: 2, x: 45, y: 5, node: "memory_2" }];
  const CHESTS = [{ id: "flats", x: 8, y: 24, coins: 10 }, { id: "grove", x: 66, y: 34, item: "salts" }, { id: "hall", x: 26, y: 15, item: "tonic" },
                  { id: "east", x: 60, y: 24, coins: 8 }, { id: "north", x: 20, y: 6, item: "fire" }, { id: "bridge", x: 51, y: 18, item: "salts" }];
  const REGIONS = [
    { name: "Kessa", x0: 3, y0: 33, x1: 25, y1: 51, music: "village" }, { name: "The Well of Nine", x0: 31, y0: 22, x1: 41, y1: 30, music: "flats" },
    { name: "The Drowned Grove", x0: 52, y0: 32, x1: 68, y1: 50, music: "grove" }, { name: "The Salt Cathedral", x0: 25, y0: 4, x1: 43, y1: 18, music: "cathedral" },
    { name: "Gates of Oru", x0: 50, y0: 11, x1: 69, y1: 16, music: "flats" },
    { name: "The Guild Hall", x0: 78, y0: 4, x1: 90, y1: 10, music: "oru" }, { name: "Oru", x0: 74, y0: 2, x1: 104, y1: 32, music: "oru" },
    { name: "Reedholm", x0: 28, y0: 62, x1: 46, y1: 72, music: "marsh" }, { name: "The Bog Heart", x0: 5, y0: 77, x1: 21, y1: 88, music: "marsh" },
    { name: "The Drowning Marsh", x0: 2, y0: 55, x1: 61, y1: 89, music: "marsh" }, { name: "The Wreck Coast", x0: 62, y0: 55, x1: 128, y1: 89, music: "coast" },
    { name: "The Storm Spire", x0: 110, y0: 1, x1: 126, y1: 31, music: "spire" }, { name: "The Storm Road", x0: 106, y0: 32, x1: 128, y1: 54, music: "spire" },
    { name: "The Deep", x0: 74, y0: 36, x1: 104, y1: 53, music: "deep" },
    { name: "The Salt Galleries", x0: 130, y0: 0, x1: 169, y1: 19, music: "deep" }, { name: "The Sluice Works", x0: 130, y0: 20, x1: 169, y1: 37, music: "deep" },
    { name: "Corvin's Vault", x0: 130, y0: 38, x1: 169, y1: 56, music: "deep" },
    { name: "The Glass Flats", x0: 0, y0: 0, x1: W, y1: H, music: "flats" },
  ];
  function goal() {
    if (G.stage >= 7) return goalAct2();
    const found = G.flags.shards || [];
    switch (G.stage) {
      case 0: return { ch: "Prologue · The Stolen Bell", text: "Talk to Elder Nadia in Kessa.", x: 12, y: 39 };
      case 1: return { ch: "Chapter I · The Stolen Bell", text: "Recruit Ilse at the smithy.", x: 19, y: 39 };
      case 2: return { ch: "Chapter II · The Butcher of the Well", text: "Go to the Well of Nine and find Maru.", x: 36, y: 29 };
      case 3:
        if (!G.flags.metBeno) return { ch: "Chapter III · The Drowned Grove", text: "Enter the Drowned Grove east of the Well.", x: 55, y: 36 };
        if (!G.flags.metRook) return { ch: "Chapter III · The Drowned Grove", text: "Find Voss's archer in the east corner of the grove.", x: 66, y: 44 };
        if (!G.flags.motherDead) return { ch: "Chapter III · The Drowned Grove", text: "Slay the Mother of Leeches on the south bank of the pond.", x: 62, y: 43 };
        return { ch: "Chapter III · The Drowned Grove", text: "Talk to Rook.", x: 66, y: 44 };
      case 4: {
        const inside = tileAt(G.px, G.py) === T.DARK;
        if (!inside && !G.flags.unlocked && !G.keyItems.key) return { ch: "Chapter IV · The Salt Cathedral", text: "Break Voss's blood-seal on the Cathedral door.", x: 34, y: 20 };
        if (!G.members.includes("ada")) return { ch: "Chapter IV · The Salt Cathedral", text: "Someone is chained in the lower hall. Find them.", x: 30, y: 17 };
        if (!G.keyItems.key && !G.flags.unlocked) return { ch: "Chapter IV · The Salt Cathedral", text: G.flags.choirDead ? "Open the chest by the east wall." : "Take the key from the Choirmaster's chest.", x: KEY_CHEST.x, y: KEY_CHEST.y };
        return { ch: "Chapter IV · The Salt Cathedral", text: "Unlock the rain-drop door.", x: 34, y: 12 };
      }
      case 5:
        if (G.flags.shardQuest && !G.flags.wardenFree) {
          if (found.length >= 3) return { ch: "Chapter V · The Salt-Flayed", text: "Bring the shards to the chained Warden.", x: 34, y: 8 };
          const left = SHARDS.filter(s => !found.includes(s.id));
          const near = left.reduce((a, b) => Math.hypot(a.x * TILE - G.px, a.y * TILE - G.py) < Math.hypot(b.x * TILE - G.px, b.y * TILE - G.py) ? a : b);
          return { ch: "Chapter V · The Salt-Flayed", text: `Find the Warden's memory shards (${found.length}/3), or face Voss now.`, x: near.x, y: near.y };
        }
        if (G.flags.vossDead && !G.keyItems.bell) return { ch: "Chapter V · The Salt-Flayed", text: "Take the Rain Bell from the pedestal.", x: 34, y: 6 };
        return { ch: "Chapter V · The Salt-Flayed", text: G.flags.wardenFree ? "Face Voss, with the Warden at your side." : "Confront the thief in the upper hall.", x: 34, y: 8 };
      case 6:
        if (!G.flags.renJoined) return { ch: "Chapter VI · The Drowned Gate", text: "Take the Bell to Captain Ren at the gates of Oru.", x: 58, y: 12 };
        return { ch: "Chapter VI · The Drowned Gate", text: "Face Guild Master Hollis at the gate.", x: 61, y: 12 };
    }
    return { ch: "", text: "", x: 12, y: 39 };
  }

  function areaAt(tx, ty, f) {
    const t0 = get(tx, ty);
    if (t0 === T.DARK) return "cathedral";
    if (tx >= 74 && tx <= 104 && ty <= 32) return t0 === T.FLOOR ? "hall" : "oru";
    if (tx >= 130) return "cathedral";
    if (tx >= 106 && ty <= 54) return ty <= 31 ? "spireIn" : "spire";
    if (tx >= 74 && tx <= 104 && ty >= 36 && ty <= 53) return "deep";
    if (ty >= 55) return tx <= 61 ? "marsh" : "coast";
    if (t0 === T.GRASS || t0 === T.MUD) return "grove";
    return f && f.minStage === 6 ? "gate" : "flats";
  }

