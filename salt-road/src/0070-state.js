  // ================================================================== STATE
  const START = { x: 12 * TILE + 8, y: 47 * TILE + 8 };
  let G;
  function makeHero(id) { const h = HEROES[id]; return { id, name: h.name, level: 1, xp: 0, maxHp: h.hp, hp: h.hp, maxSp: h.sp, sp: h.sp, atk: h.atk, def: h.def, spd: h.spd }; }
  function freshGame() {
    return {
      stage: 0, flags: {}, party: { sable: makeHero("sable") }, members: ["sable"], active: ["sable"],
      items: { salve: 2, tonic: 1, salts: 0, fire: 0 }, coins: 10, keyItems: {},
      px: START.x, py: START.y, checkpoint: { ...START }, defeated: [],
    };
  }
  const player = { dir: "down", walk: 0, moving: false, scarf: [], ghosts: [], sprint: false, stepT: 0, dashT: 0, dashCd: 0, dashX: 0, dashY: 1, lines: [] };
  let mode = "title";        // title | play | dialog | battle | card | roster
  let camX = 0, camY = 0, shake = 0, time = 0, showMap = true;
  let particles = [], popups = [];
  let region = "";

