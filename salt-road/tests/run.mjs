#!/usr/bin/env node
// Plays salt-road.html in a headless browser and checks that it still works.
//
//   node salt-road/tests/run.mjs                 every suite
//   node salt-road/tests/run.mjs saves kessa     only these
//
// Needs Playwright with a Chromium (npm i -D playwright; npx playwright install chromium). Suites drive the game
// through its test hooks (window.__saltRoad) and its real buttons, and fail on any page error.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const server = createServer((q, r) => { try { const f = join(root, decodeURIComponent(q.url.split("?")[0])); r.writeHead(200, { "content-type": { ".html": "text/html", ".js": "text/javascript" }[extname(f)] || "application/octet-stream" }); r.end(readFileSync(f)); } catch { r.writeHead(404); r.end(); } });
await new Promise(res => server.listen(0, res));
const URL = `http://localhost:${server.address().port}/salt-road.html?skipprologue`;
const browser = await chromium.launch();

async function open(o = {}) {
  const ctx = await browser.newContext({ viewport: o.vp || { width: 1280, height: 800 }, isMobile: !!o.mobile, hasTouch: !!o.mobile, reducedMotion: "reduce" });
  if (o.blockStorage) await ctx.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(700);
  p.errs = async () => [...errs, ...(await p.evaluate(() => window.__saltRoadErrors || []))];
  p.clear = async () => { for (let i = 0; i < 10; i++) { await p.waitForTimeout(200); if (await p.isVisible("#cardBtn")) await p.click("#cardBtn"); else if (await p.isVisible("#dialog")) await p.evaluate(() => window.__saltRoad.closeDlg()); else if (i > 2) break; } };
  p.start = async () => { await p.click("#startBtn"); await p.waitForTimeout(400); await p.clear(); };
  p.done = () => ctx.close();
  return p;
}
const setup = (p, stage, ids = ["ilse", "maru", "rook"], lvl = 10) => p.evaluate(([stage, ids, lvl]) => {
  const R = window.__saltRoad, G = R.state(), sim = R.sim(); G.stage = stage; G.flags.intro = true; G.flags.kessaHint = true;
  for (const id of ids) if (!G.members.includes(id)) { G.party[id] = sim.makeHero(id); G.members.push(id); }
  G.active = G.members.slice(0, 4); for (const id of G.members) while (G.party[id].level < lvl) sim.levelUp(G.party[id]);
}, [stage, ids, lvl]);

let failed = 0;
const ok = (cond, what) => { console.log(`  ${cond ? "ok  " : "FAIL"} ${what}`); if (!cond) failed++; };
const noErrors = async p => { const e = await p.errs(); ok(!e.length, `no page errors${e.length ? ": " + e.slice(0, 3).join(" | ") : ""}`); };

const SUITES = {
  async battles() {   // a fight against every monster and boss, won
    const p = await open(); await p.start();
    const r = await p.evaluate(async () => {
      const R = window.__saltRoad, M = R.sim().MONSTERS, sleep = ms => new Promise(s => setTimeout(s, ms)), bad = [];
      for (const id of R.monIds()) { R.closeDlg(); R.endCine(); R.battle(M[id].boss ? [id] : [id, id], M[id].boss ? { boss: id } : {}); await sleep(250); if (!R.forceWin()) bad.push(id); await sleep(150); R.cont(); await sleep(150); }
      return { n: R.monIds().length, bad, mode: R.mode() };
    });
    ok(r.n > 40 && !r.bad.length, `${r.n} monsters fought and beaten`); await noErrors(p); await p.done();
  },
  async scenes() {   // cutscenes and the four endings
    for (const o of [{}, { vp: { width: 390, height: 844 }, mobile: true }]) {
      const p = await open(o); await p.start();
      for (const k of ["butcher", "quill", "maw", "vela", "corvin", "mother", "maru", "rook", "ren", "hollis", "king", "salt", "teodor", "lanterns", "whistle"]) { await p.evaluate(k => { window.__saltRoad.closeDlg(); window.__saltRoad.cineTest(k); }, k); await p.waitForTimeout(500); await p.evaluate(() => window.__saltRoad.endCine()); }
      for (const k of ["ring", "crown", "keeper", "sleep"]) { await p.evaluate(k => { const G = window.__saltRoad.state(); G.flags.homecomingSeen = G.flags.endcine_crown = G.flags.endcine_keeper = true; window.__saltRoad.end(k); }, k); await p.waitForTimeout(400); await p.evaluate(() => document.getElementById("cardBtn").click()); await p.waitForTimeout(300); }
      ok(true, `15 cutscenes and 4 endings (${o.mobile ? "phone" : "desktop"})`); await noErrors(p); await p.done();
    }
  },
  async saves() {   // continue, the ending, New Game+, start over, blocked storage
    let p = await open(); await p.start(); await setup(p, 6);
    await p.evaluate(() => window.__saltRoad.rest()); await p.reload(); await p.waitForTimeout(700);
    ok((await p.textContent("#startBtn")) === "Continue" && /Chapter VI/.test(await p.textContent("#saveSum")), "a saved game continues, with its chapter on the title");
    await p.start(); await p.evaluate(() => { const R = window.__saltRoad, G = R.state(); G.stage = 12; G.flags.homecomingSeen = G.flags.endcine_keeper = true; R.end("keeper"); }); await p.waitForTimeout(3000);
    ok(!(await p.evaluate(() => localStorage.getItem("salt-road-six"))), "nothing is saved after an ending");
    await p.reload(); await p.waitForTimeout(700);
    ok(await p.isVisible("#ngBtn"), "New Game+ waits on the title after a reload");
    await p.click("#ngBtn"); await p.waitForTimeout(800); ok(await p.evaluate(() => window.__saltRoad.state().ng === 1), "New Game+ starts");
    await p.evaluate(() => { const G = window.__saltRoad.state(); G.stage = 1; window.__saltRoad.rest(); }); await p.reload(); await p.waitForTimeout(700);
    await p.click("#newBtn"); await p.waitForTimeout(200); ok(await p.isVisible("#title"), "Start over asks before erasing");
    await noErrors(p); await p.done();
    p = await open({ blockStorage: true }); ok(/won't let the game store data/.test(await p.textContent("#saveNote")), "blocked storage is explained on the title");
    await p.start(); await setup(p, 3); await p.evaluate(() => window.__saltRoad.rest()); await p.reload(); await p.waitForTimeout(800);
    ok((await p.textContent("#startBtn")) === "Continue", "with storage blocked, the game is kept with the tab"); await noErrors(p); await p.done();
  },
  async phone() {   // upright phone: HUD under the picture, tall toasts, full-screen pause
    const p = await open({ vp: { width: 390, height: 844 }, mobile: true }); await p.start(); await setup(p, 7);
    const lay = await p.evaluate(() => { const c = document.getElementById("game").getBoundingClientRect(), h = document.querySelector("#hud > div").getBoundingClientRect(); return h.top >= c.bottom; });
    ok(lay, "the HUD sits under the picture");
    for (let i = 0; i < 3; i++) { await p.evaluate(() => window.__saltRoad.battle(["jackal", "ghoul", "clerk", "eel"])); await p.waitForTimeout(1200); await p.evaluate(() => window.__saltRoad.flee()); await p.waitForTimeout(1200); }
    await p.clear(); await p.click("#pauseBtn"); await p.waitForTimeout(300);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById("pauseUI")).position === "fixed"), "pause uses the whole screen");
    await noErrors(p); await p.done();
  },
  async kessa() {   // order, wait for dawn, effects, persistence
    const p = await open(); await p.start(); await setup(p, 7);
    await p.evaluate(() => { const R = window.__saltRoad; R.state().coins = 3000; R.giveSpoils(100, 0); for (const id of ["herbs", "inn", "market", "forge", "yard", "post"]) { R.kessaProject(id); document.querySelector("#opts button").click(); } R.closeDlg(); });
    await p.clear(); await p.evaluate(() => { window.__saltRoad.state().clock = 0.9997; }); await p.waitForTimeout(3500);
    ok(await p.evaluate(() => Object.values(window.__saltRoad.kessa()).every(r => r.lv === 1)), "six places ordered and finished at dawn");
    await p.clear();
    const r = await p.evaluate(async () => { const R = window.__saltRoad; for (const id of ["herbs", "inn", "market", "forge", "yard", "post"]) R.kessaBuild(id, 2);
      const salve = R.dialogs().odo_0.choices.map(c => typeof c.t === "function" ? c.t() : c.t).find(t => /Salve/.test(t));
      R.battle(["jackal"]); await new Promise(s => setTimeout(s, 300)); const fury = document.getElementById("furyFill").style.width; R.flee(); return { salve, fury, reach: R.reach() }; });
    ok(/heal 40/.test(r.salve) && r.fury === "30%", "the garden and the yard work"); ok(!r.reach.length, "every story spot is still reachable");
    await p.reload(); await p.waitForTimeout(700); await p.start();
    ok(await p.evaluate(() => window.__saltRoad.kessa().inn.lv >= 1), "the buildings survive a reload");   // level 2 above came from the test hook, which does not save
    await noErrors(p); await p.done();
  },
  async deep() {   // the Daily Descent is the same in two browsers
    const runOnce = async () => {
      const p = await open(); await p.start(); await setup(p, 6, ["ilse", "maru", "rook"], 12);
      await p.clear(); await p.click("#pauseBtn"); await p.waitForTimeout(200); await p.click("#pauseMain [data-a=road]"); await p.waitForTimeout(200); await p.click("[data-road=deepdaily]"); await p.waitForTimeout(700);
      const floors = [];
      for (let f = 1; f <= 6; f++) {
        for (let t = 0; t < 30 && (await p.evaluate(() => window.__saltRoad.mode())) !== "battle"; t++) await p.waitForTimeout(200);
        floors.push(await p.evaluate(() => [window.__saltRoad.battleState(), JSON.parse(window.__saltRoad.bopts()).area]));
        await p.evaluate(() => window.__saltRoad.forceWin()); await p.waitForTimeout(400); await p.evaluate(() => window.__saltRoad.cont());
        for (let t = 0; t < 30 && !(await p.isVisible("#dialog")); t++) { await p.waitForTimeout(200); if (await p.isVisible("#cardBtn")) await p.click("#cardBtn"); }
        await p.click(f === 6 ? "#opts button:last-child" : "#opts button:first-child"); await p.waitForTimeout(250);
      }
      const e = await p.errs(); await p.done(); return { floors, e };
    };
    const a = await runOnce(), b = await runOnce();
    if (JSON.stringify(a.floors) !== JSON.stringify(b.floors)) console.log(JSON.stringify(a.floors), "\n", JSON.stringify(b.floors));
    ok(JSON.stringify(a.floors) === JSON.stringify(b.floors), "the Daily Descent gives everyone the same floors");
    ok(a.floors[5][1] === "marsh", "floor 6 is in the Drowned Galleries"); ok(!a.e.length && !b.e.length, "no page errors");
  },
  async comfort() {   // a controller, AZERTY keys, a rebound key
    const p = await open({ init: () => { const btn = () => ({ pressed: false, value: 0 }); window.__pad = { id: "Test Pad", mapping: "standard", buttons: Array.from({ length: 17 }, btn), axes: [0, 0, 0, 0], on: true }; navigator.getGamepads = () => window.__pad.on ? [window.__pad] : []; } });
    const pad = async fn => { await p.evaluate(fn); await p.waitForTimeout(250); };
    await pad(() => { window.__pad.buttons[0].pressed = true; }); await pad(() => { window.__pad.buttons[0].pressed = false; });
    ok((await p.evaluate(() => window.__saltRoad.mode())) !== "title", "A on a controller starts the game"); await p.clear();
    await pad(() => { window.__pad.buttons[9].pressed = true; }); await pad(() => { window.__pad.buttons[9].pressed = false; });
    ok(await p.isVisible("#pauseUI"), "Start pauses"); await pad(() => { window.__pad.buttons[1].pressed = true; }); await pad(() => { window.__pad.buttons[1].pressed = false; });
    await pad(() => { window.__pad.on = false; });
    await p.keyboard.press("Escape"); await p.click("#pauseMain [data-a=settings]"); await p.waitForTimeout(200); await p.click("[data-keyset=azerty]"); await p.keyboard.press("Escape"); await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    const y = await p.evaluate(() => window.__saltRoad.state().py); await p.keyboard.down("z"); await p.waitForTimeout(400); await p.keyboard.up("z");
    ok(await p.evaluate(y => window.__saltRoad.state().py < y - 8, y), "Z walks up on AZERTY");
    await noErrors(p); await p.done();
  },
  async rime() {   // Act III, part 1: the stair, Kelda, the Ice House, Saint Isolde and her choice
    const p = await open(); await p.start(); await setup(p, 10, ["ilse", "maru", "rook"], 24); await p.clear();
    await p.evaluate(() => { const R = window.__saltRoad; R.state().flags.rimeHint = true; R.tp(100, 135); R.clearField(); });
    await p.waitForTimeout(300); await p.keyboard.down("s"); await p.waitForTimeout(1600); await p.keyboard.up("s"); await p.waitForTimeout(500);
    ok(await p.evaluate(() => window.__saltRoad.state().py / 16 >= 141) && /white sky/.test(await p.evaluate(() => (window.__saltRoad.dlg() || {}).text || "")), "the stair from the Dry Sea leads down into the Rime");
    await p.clear();
    await p.evaluate(() => { window.__saltRoad.tp(73, 157); window.__saltRoad.open(window.__saltRoad.talkTo("hild")); }); await p.waitForTimeout(400);
    for (let i = 0; i < 14 && await p.isVisible("#dialog"); i++) { await p.keyboard.press("e"); await p.waitForTimeout(200); if (await p.isVisible("#opts button")) { await p.keyboard.press("1"); await p.waitForTimeout(200); } }
    ok(await p.evaluate(() => window.__saltRoad.rime().flags.gate && window.__saltRoad.tile(140, 175) !== 36), "Mother Hild's lullaby opens the Ice House");
    await p.evaluate(() => window.__saltRoad.tp(140, 161)); await p.waitForTimeout(500); await p.clear(); await p.keyboard.press("e"); await p.waitForTimeout(300);
    for (let i = 0; i < 10 && (await p.evaluate(() => window.__saltRoad.mode())) !== "battle"; i++) { await p.keyboard.press("e"); await p.waitForTimeout(250); if (await p.isVisible("#opts button")) { await p.keyboard.press("1"); await p.waitForTimeout(250); } }
    ok(/Saint Isolde/.test(await p.evaluate(() => window.__saltRoad.battleState() || "")), "Saint Isolde waits on her throne");
    const ph = await p.evaluate(() => window.__saltRoad.bossPhaseTest()); ok(ph && ph.after.phase2, "she becomes the Thaw at half health");
    await p.evaluate(() => window.__saltRoad.forceWin()); await p.waitForTimeout(400); await p.evaluate(() => window.__saltRoad.cont()); await p.waitForTimeout(700);
    for (let i = 0; i < 8 && !(await p.isVisible("#opts button")); i++) { await p.keyboard.press("e"); await p.waitForTimeout(250); }
    await p.keyboard.press("2"); await p.waitForTimeout(300); for (let i = 0; i < 4; i++) { await p.keyboard.press("e"); await p.waitForTimeout(250); }
    const r = await p.evaluate(() => ({ f: window.__saltRoad.rime().flags, relics: window.__saltRoad.state().relics || [] }));
    ok(r.f.done && r.f.choice === "keep" && r.relics.includes("rimeheart"), "the choice is kept, with Isolde's relic");
    await p.clear(); ok(!(await p.evaluate(() => window.__saltRoad.reach())).length, "every story spot is still reachable");
    await p.reload(); await p.waitForTimeout(700); await p.start();
    ok(await p.evaluate(() => window.__saltRoad.rime().flags.done), "the Rime's ending survives a reload");
    await noErrors(p); await p.done();
  },
  async reading() {   // cutscene lines wait to be read, statuses say how long they last, the font setting
    const p = await open(); await p.start();
    const line = () => p.evaluate(() => document.querySelector("#cineBox .tx").textContent);
    await p.evaluate(() => window.__saltRoad.cineTest("butcher")); await p.waitForTimeout(6000);
    const first = await line();
    ok(/butcher's apron/.test(first) && (await p.evaluate(() => window.__saltRoad.mode())) === "cine", "a cutscene line waits for the player (6 s on, still the first line)");
    await p.keyboard.press("e"); await p.waitForTimeout(900);
    ok((await line()) !== first && (await p.evaluate(() => window.__saltRoad.mode())) === "cine", "E moves on to the next line, without skipping the cutscene");
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    ok((await p.evaluate(() => window.__saltRoad.mode())) !== "cine", "Esc skips the cutscene");
    await p.evaluate(() => window.__saltRoad.sceneTest()); await p.waitForTimeout(3500);
    ok(/first line/.test(await p.textContent("#banter")), "a scene line waits too");
    await p.keyboard.press("e"); await p.waitForTimeout(400); ok(/second line/.test(await p.textContent("#banter")), "E moves the scene on");
    await p.keyboard.press("e"); await p.waitForTimeout(400); ok(await p.evaluate(() => !!window.__sceneDone), "the scene ends after its last line");
    await p.evaluate(() => { const R = window.__saltRoad; R.battle(["jackal", "ghoul"]); });
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.__saltRoad.setStatus("hero", 0, { bleed: { dmg: 4, turns: 3 }, weak: 3 }));
    const chips = await p.$$eval("#cards .card:first-child .chip", cs => cs.map(c => c.textContent + "|" + c.title));
    ok(chips.some(c => /^Bleed3\|.*4 health.*3 more turns/.test(c)) && chips.some(c => /^Weak2\|/.test(c)), "hero statuses show turns left, with an explanation");
    ok(await p.evaluate(() => window.__saltRoad.furyFull()) && await p.isVisible(".menu button.chain") && /Ready/.test(await p.textContent("#furyPct")), "full Fury reads Ready, with Chain Assault picked out in the menu");
    await p.evaluate(() => window.__saltRoad.flee()); await p.waitForTimeout(400); await p.clear();
    const fontOf = () => p.evaluate(() => getComputedStyle(document.querySelector(".help")).fontFamily);
    ok(/Atkinson/.test(await fontOf()), "reading text uses the easy-to-read font");
    await p.keyboard.press("Escape"); await p.click("#pauseMain [data-a=settings]"); await p.waitForTimeout(200); await p.click("[data-set=font][data-v=pixel]"); await p.waitForTimeout(200);
    ok(/Pixelify/.test(await fontOf()), "Settings can switch it to the pixel font");
    await noErrors(p); await p.done();
  },
};
const pickd = process.argv.slice(2).filter(a => SUITES[a]);
for (const name of pickd.length ? pickd : Object.keys(SUITES)) { console.log(name); try { await SUITES[name](); } catch (e) { ok(false, `${name} crashed: ${e.message.split("\n")[0]}`); } }
await browser.close(); server.close();
console.log(failed ? `${failed} check(s) failed` : "all checks passed");
process.exit(failed ? 1 : 0);
