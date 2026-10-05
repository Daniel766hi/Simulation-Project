  // ================================================================== NPCs
  const NPCS = [
    { id: "nadia", name: "Elder Nadia", x: 12, y: 39, look: { robe: "#6a58c0", hair: "#e8e4f0", skin: "#c98d63", extra: "staff" } },
    { id: "ilse", name: "Ilse the Smith", x: 19, y: 39, look: HEROES.ilse.look },
    { id: "odo", name: "Odo the Peddler", x: 22, y: 43, look: { robe: "#c9a227", hair: "#6b3f24", skin: "#8a5a33", extra: "pack" } },
    { id: "tam", name: "Tam", x: 7, y: 48, look: { robe: "#a8403a", hair: "#2b2350", skin: "#f2c39a" } },
    { id: "maru", name: "Maru", x: 36, y: 29, look: HEROES.maru.look },
    { id: "beno", name: "Beno", x: 55, y: 36, look: { robe: "#3f8a5a", hair: "#3a2a1e", skin: "#e0a878", extra: "cap", small: true } },
    { id: "rook", name: "Rook", x: 66, y: 44, look: HEROES.rook.look },
    { id: "ada", name: "Sister Ada", x: 30, y: 17, look: HEROES.ada.look },
    { id: "ren", name: "Captain Ren", x: 58, y: 12, look: HEROES.ren.look },
    { id: "corpse", name: "A dead courier", x: 20, y: 20, look: { robe: "#5a4a3a", hair: "#3a2a1e", skin: "#b8a898", dead: true } },
    { id: "pilgrim", name: "A hanged driver", x: 44, y: 24, look: { robe: "#6b5a3a", hair: "#3a2a1e", skin: "#b8a898", dead: true } },
  ].map(n => ({ ...n, px: n.x * TILE + 8, py: n.y * TILE + 8, bob: hash(n.x, n.y) * 6 }));
  const npcVisible = n => {
    if (n.hidden || npcAsleep(n)) return false;
    if (n.show) return n.show();
    if (["ilse", "maru", "rook", "ada", "ren"].includes(n.id)) return !G.members.includes(n.id);
    if (n.id === "ada") return G.stage >= 4;
    return true;
  };

