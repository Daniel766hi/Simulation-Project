#!/usr/bin/env node
// Balance check: a bot plays real boss battles (attack, skills, salves, smelling salts, Chain Assault) with the
// party, level and shop gear each chapter gives, and reports wins. "all fights" is the level a player reaches by
// beating every field group once; "-3" is three levels under it. Battles run with timers shortened.
//
//   node salt-road/tests/balance.mjs                    Normal, 6 fights per point
//   N=16 DIFF=hard ONLY=hollis,quill node salt-road/tests/balance.mjs
//   PATCH="M.hollis.hp=380" ...                         try a change to MONSTERS (M) before the fights
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const server = createServer((q, r) => { try { r.writeHead(200, { "content-type": "text/html" }); r.end(readFileSync(join(root, "salt-road.html"))); } catch { r.writeHead(404); r.end(); } });
await new Promise(res => server.listen(0, res));
const N = +process.env.N || 6, DIFF = process.env.DIFF || 'normal', ONLY = process.env.ONLY, PATCH = process.env.PATCH || '';
const PLAN = [
  ['butcher', 2, ['butcher'], ['sable', 'ilse']], ['mother', 3, ['mother'], ['sable', 'ilse', 'maru']],
  ['choirmaster', 4, ['choirmaster', 'choir'], ['sable', 'ilse', 'maru', 'rook']], ['voss', 5, ['voss'], ['sable', 'ilse', 'maru', 'rook', 'ada']],
  ['hollis', 6, ['hollis', 'drowned'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren']], ['quill', 7, ['quill', 'clerk'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest']],
  ['gulp', 8, ['gulp', 'toad'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest']], ['maw', 9, ['maw', 'sailor'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest', 'warden']],
  ['isolde', 11, ['isolde'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest', 'warden', 'nell']], ['vela', 11, ['vela', 'singer'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest', 'warden', 'nell']], ['king', 12, ['king'], ['sable', 'ilse', 'maru', 'rook', 'ada', 'ren', 'kest', 'warden', 'nell']],
];
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, Math.min(ms || 0, 2), ...a); });
  const p = await ctx.newPage(); await p.goto(`http://localhost:${server.address().port}/salt-road.html?skipprologue`); await p.waitForTimeout(500);
  await p.click('#startBtn'); await p.waitForTimeout(300);
  const out = await p.evaluate(async ({ PLAN, N, DIFF, ONLY, PATCH }) => {
    const R = window.__saltRoad, sim = R.sim(), G = R.state(); sim.setDiff(DIFF); if (PATCH) (new Function('M', PATCH))(sim.MONSTERS);
    const sleep = ms => new Promise(r => requestAnimationFrame(() => r()));
    // XP a player has by a stage if they beat every field group once and every story boss before it
    const xpBy = stage => { let x = 0; for (const f of sim.FIELD) if ((f.minStage || 0) <= stage - 1 && !f.req) x += f.group.reduce((s, id) => s + (sim.MONSTERS[id] ? sim.MONSTERS[id].xp : 0), 0);
      for (const [boss, st] of PLAN) if (st < stage) x += sim.MONSTERS[boss].xp; return x; };
    const lvlFor = xp => { let L = 1; while (xp >= sim.xpNeed(L)) { xp -= sim.xpNeed(L); L++; } return L; };
    const tierAt = s => s >= 10 ? 5 : s >= 7 ? 4 : s >= 5 ? 3 : s >= 3 ? 2 : 1;
    const res = [];
    for (const [boss, stage, group, members] of PLAN) {
      if (ONLY && !ONLY.split(',').includes(boss)) continue;
      const full = lvlFor(xpBy(stage));
      for (const L of [full - 3, full]) {
        let wins = 0, rounds = 0, hpLeft = 0;
        for (let n = 0; n < N; n++) {
          G.stage = stage; G.party = {}; G.members = []; G.gear = {}; G.temper = {}; G.talents = {}; G.relics = [];
          for (const id of members) { G.party[id] = sim.makeHero(id); G.members.push(id); for (let i = 1; i < L; i++) sim.levelUp(G.party[id]); }
          G.active = members.slice(0, 4); const t = Math.max(0, tierAt(stage) - 1); for (const id of G.active) R.gearTest(id, t, t);
          for (const id of members) { const h = G.party[id]; h.hp = h.maxHp; h.sp = h.maxSp; }
          G.items = { salve: 4, tonic: 2, salts: 1, fire: 1 };
          R.battle(group, { boss }); let result = null, guard = 0, usedItem = 0;
          while (!result && guard++ < 40000) {
            await sleep();
            const menu = document.getElementById('menu'), title = (menu.querySelector('.title') || {}).textContent || '';
            const btns = [...menu.querySelectorAll('button')].filter(x => !x.disabled), lab = x => x.childNodes[0].textContent;
            if (title === 'Victory') { result = 'win'; break; } if (title === 'Defeat') { result = 'loss'; break; }
            if (!btns.length) continue;
            const hurt = G.active.map(id => G.party[id]).filter(h => h.hp > 0 && h.hp < h.maxHp * 0.35).sort((a, c) => a.hp / a.maxHp - c.hp / c.maxHp)[0];
            const down = G.active.some(id => G.party[id].hp <= 0);
            if (title === 'Choose target') {
              const opts = btns.filter(x => lab(x) !== 'Back');
              const hpOf = x => { const m = (x.querySelector('small') || {}).textContent; const r = m && m.match(/(\d+)\/(\d+)/); return r ? +r[1] : 1e9; };
              const ally = opts.some(x => G.members.some(id => G.party[id].name === lab(x)));
              (ally && hurt ? (opts.find(x => lab(x) === hurt.name) || opts[0]) : opts.sort((a, c) => hpOf(a) - hpOf(c))[0]).click(); continue;
            }
            if (title === 'Items') { const want = down && G.items.salts > 0 ? 'Smelling Salts' : 'Salve'; const it = btns.find(x => lab(x).startsWith(want)); (it || btns.find(x => lab(x) === 'Back')).click(); continue; }
            if (title.startsWith('Skills')) { const sk = btns.filter(x => lab(x) !== 'Back'); (sk.length ? sk[Math.floor(Math.random() * sk.length)] : btns.find(x => lab(x) === 'Back')).click(); continue; }
            const by = name => btns.find(x => lab(x).includes(name));
            if (by('Chain Assault')) { by('Chain Assault').click(); continue; }
            if (((hurt && G.items.salve > 0) || (down && G.items.salts > 0)) && by('Items') && usedItem < 12) { usedItem++; by('Items').click(); continue; }
            if (by('Skills') && Math.random() < 0.45) { by('Skills').click(); continue; }
            if (by('Attack')) by('Attack').click();
          }
          rounds += 0; hpLeft += G.active.reduce((s, id) => s + Math.max(0, G.party[id].hp) / G.party[id].maxHp, 0) / G.active.length;
          if (result === 'win') wins++;
          R.cont(); for (let i = 0; i < 5; i++) await sleep(); R.closeDlg(); R.endCine(); document.getElementById('card').hidden = true;
        }
        res.push(`${boss.padEnd(12)} stage ${String(stage).padStart(2)} lvl ${String(L).padStart(2)}${L === full ? ' (all fights)' : ' (-3)       '} gear t${Math.max(0, tierAt(stage) - 1)}  wins ${wins}/${N}  avg hp left ${(hpLeft / N * 100).toFixed(0)}%`);
      }
    }
    return res.join('\n');
  }, { PLAN, N, DIFF, ONLY, PATCH });
  console.log(DIFF + '\n' + out); await b.close();
server.close();
