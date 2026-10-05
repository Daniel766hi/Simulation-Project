  // ================================================================== OVERWORLD MONSTERS
  const FIELD = [
    { id: "j1", x: 12, y: 30, group: ["jackal", "jackal"] }, { id: "j2", x: 22, y: 26, group: ["jackal", "jackal", "jackal"] },
    { id: "g1", x: 16, y: 18, group: ["ghoul"] }, { id: "g2", x: 26, y: 22, group: ["ghoul", "jackal"] },
    { id: "g3", x: 8, y: 13, group: ["ghoul", "ghoul"] }, { id: "l1", x: 44, y: 30, group: ["leech", "jackal"] },
    { id: "l2", x: 57, y: 46, group: ["leech", "leech"] }, { id: "l3", x: 53, y: 41, group: ["leech", "spawn", "spawn"] },
    { id: "g4", x: 54, y: 24, group: ["ghoul", "ghoul", "jackal"] }, { id: "j3", x: 40, y: 40, group: ["jackal", "jackal"] },
    { id: "g5", x: 44, y: 9, group: ["ghoul", "leech"] }, { id: "g6", x: 18, y: 8, group: ["ghoul", "ghoul", "jackal"] },
    { id: "c1", x: 29, y: 14, group: ["choir", "ghoul"], dark: true }, { id: "c2", x: 38, y: 16, group: ["choir", "choir"], dark: true },
    { id: "c3", x: 42, y: 13, group: ["choir", "ghoul", "ghoul"], dark: true },
    { id: "d1", x: 53, y: 15, group: ["drowned", "drowned"], minStage: 6 }, { id: "d2", x: 54, y: 12, group: ["drowned", "ghoul", "drowned"], minStage: 6 },
    { id: "d3", x: 46, y: 17, group: ["drowned", "leech"], minStage: 6 },
    { id: "w1", x: 20, y: 14, group: ["wraith", "ghoul"], minStage: 4 }, { id: "w2", x: 38, y: 36, group: ["wraith", "wraith"], minStage: 4 },
    { id: "b1", x: 14, y: 10, group: ["crawler", "jackal", "jackal"], minStage: 4 }, { id: "b2", x: 58, y: 28, group: ["crawler", "wraith"], minStage: 5 },
    { id: "b3", x: 10, y: 6, group: ["crawler", "crawler"], minStage: 4 },
  ];
  let field = [];
  function spawnField() {
    field = FIELD.filter(f => !G.defeated.includes(f.id) && (f.minStage || 0) <= G.stage && (!f.req || f.req()))
      .map(f => ({ ...f, px: f.x * TILE + 8, py: f.y * TILE + 8, hx: f.x * TILE + 8, hy: f.y * TILE + 8, t: hash(f.x, f.y) * 10, cool: 0 }));
  }

