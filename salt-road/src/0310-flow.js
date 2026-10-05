  // ================================================================== FLOW
  function resize() {
    // Fit the 5:3 game to the window: desktops and laptops keep room for the key hints below, phones held upright
    // keep room for the stick and buttons below, and phones held sideways put the controls in the side margins.
    const frame = $("frame"), iw = window.innerWidth, ih = window.innerHeight;
    const coarse = matchMedia("(pointer: coarse)").matches, narrow = matchMedia("(max-width: 700px)").matches, land = iw > ih;
    let availW, availH;
    if (coarse && land) { availW = iw - 260; availH = ih - 8; }
    else if (coarse || narrow) { availW = iw - 8; availH = ih - 150; }
    else { availW = Math.min(iw - 32, 1400); availH = ih - 70; }
    const scale = Math.max(0.8, Math.min(availW / VIEW_W, availH / VIEW_H));
    // "Fill" (default): render at the next whole-number scale up, then let the browser shrink it smoothly to fit
    // the window (sharp-bilinear): the game fills the screen and every pixel stays even. "Pixel-perfect": round
    // down to a whole number of device pixels per game pixel instead (smaller, but exact).
    const dpr = window.devicePixelRatio || 1, fill = (typeof SETTINGS === "undefined" || SETTINGS.screen !== "exact");
    const dev = fill ? Math.max(1, Math.ceil(scale * dpr - 0.01)) : Math.max(1, Math.floor(scale * dpr));
    canvas.width = VIEW_W * dev; canvas.height = VIEW_H * dev;
    const cssW = fill ? Math.floor(VIEW_W * scale) : canvas.width / dpr, cssH = fill ? Math.round(cssW * VIEW_H / VIEW_W) : canvas.height / dpr;
    canvas.style.width = cssW + "px"; canvas.style.height = cssH + "px";
    canvas.style.imageRendering = fill && Math.abs(cssW * dpr - canvas.width) > 1 ? "auto" : "pixelated";
    frame.style.maxWidth = cssW + "px";
  }
  const SAVE_KEY = "salt-road-six";
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch { /* storage unavailable */ } }
  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } }
  function startGame() {
    Music.init(); $("pauseBtn").hidden = false;
    $("title").hidden = true; mode = "play"; updateHud();
    if (G.stage === 0 && !G.flags.intro) { G.flags.intro = true; card("Prologue", "The Stolen Bell", "The night the Rain Bell was cut from its tower, the jackals on the salt stopped eating carrion and started hunting. Elder Nadia is waiting for you by the village well. Follow the gold arrow."); }
  }
  function newGame(persist = true) {
    G = freshGame(); buildMap(); buildProps(); miniDirty = true; region = ""; spawnField(); particles = []; popups = [];
    player.scarf = []; player.ghosts = []; camX = G.px - VIEW_W / 2; camY = G.py - VIEW_H / 2;
    const b = NPCS.find(n => n.id === "beno"); b.px = b.x * TILE + 8; b.py = b.y * TILE + 8; b.walking = false;
    if (persist) save();
    updateHud();
  }
  function ending(kind) {
    mode = "card";
    Music.play("ending");
    const f = G.flags, alive = id => G.members.includes(id), fallen = id => (f.fallen || []).includes(id);
    const fates = [
      alive("ilse") ? (f.quillFate === "killed" ? "Ilse goes back to her forge in Kessa. She never speaks of Quill. She makes ploughs now, only ploughs, and her hands never shake." : "Ilse testifies at Quill's trial, then goes home and forges a bell for Reedholm, higher than any flood.") : "",
      fallen("rook") ? "On the highest stilt of Reedholm, Rook's grave has a new arrow every spring. Nobody admits to leaving them." : "",
      fallen("maru") ? "Every storm that crosses the valley afterwards sounds a little like singing. The children of Kessa say it is Maru, getting the ending right." : (f.velaSang ? "Maru lives, and teaches a new generation of storm-singers two lessons, and makes them remember both." : ""),
      alive("ada") ? (f.adaVoice ? "Sister Ada never sings again. She whispers the waking-words to every child born in the valley, and somehow they are all louder for it." : "Sister Ada teaches Kessa a hymn for waking the living.") : "",
      fallen("ren") ? "At the gate of Oru they hang Ren's shield, dented once in the middle, like a bell. The magistrates record his fine as paid." : "",
      alive("kest") ? "Kest melts down the last Iron Clerk and casts it into a water pump for Reedholm. She engraves the names of the debtors on its handle." : "",
      alive("nell") ? "Nell sails the Gull up and down the flooded valley, carrying anyone, anywhere, for free. There is an eleventh name on the rail now, for her father's crew." : "",
      f.tamThanked ? "Tam carves Pell's name on the courier's cairn." : "",
      f.tobinThanked ? "Tobin becomes the most feared auditor in Oru. He is scrupulously kind." : "",
      f.benoFollows ? "Beno grows up to find things for a living. The first thing he finds is Rook's lost quiver." : "",
      ...extraFates(kind),
    ].filter(Boolean).join(" ");
    let title, text;
    if (kind === "ring") {
      title = "A Bell for Everyone";
      text = `You ring the Bell three times at the bottom of the sea, in the three old tones, and this time you answer the question aloud: "We will. The living. All of us, together, on the same hills." The drowned close their eyes. The sea stays, but the gates of every high place in the valley are broken open, and no one sells the hills again. Not for a long time. Maybe not forever, but for a long time. ${fates}`;
    } else if (kind === "crown") {
      title = "The Equal Sea";
      text = `You lift the drowned crown and put it on. It is heavy with hands. The sea comes up over the valley, over Kessa and Oru and Reedholm, gently, like a blanket. No one owns anything. No one is poor. No one is above anyone else. There is no one left to disagree. From your throne of bones you rule a perfectly just kingdom, and it is perfectly silent. ${fates.split(". ").slice(0, 2).join(". ")}.`;
    } else {
      title = "The Keeper of the Deep";
      text = `You give the Rain Bell to the Warden and stay. "Someone has to sing for the ones below," you say. "I've never dropped a package. I won't drop this one." The Warden carries the Bell up into the light and rings it for everyone. You sit on the drowned throne and sing to the dead, badly at first, then better, for as long as there are dead to sing to. Up above, the courier's cairn gets a new stone with a scarf carved on it. Every year, somebody leaves a letter there, addressed to you. ${fates}`;
    }
    $("cardKicker").textContent = "Ending"; setScene(title);
    $("cardTitle").textContent = title;
    $("cardText").textContent = text;
    $("cardBtn").textContent = "Play again"; $("cardBtn").dataset.ending = "1";
    $("card").hidden = false;
    $("cardBtn").onclick = () => { delete $("cardBtn").dataset.ending; $("cardBtn").onclick = null; $("cardBtn").textContent = "Continue"; $("card").hidden = true; newGame(); startGame(); };
    try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
  }
  function renderDiff() { for (const b of $("diffRow").children) b.classList.toggle("on", b.dataset.d === difficulty); $("diffNote").textContent = DIFFS[difficulty].note; }
  for (const b of $("diffRow").children) b.addEventListener("click", () => { difficulty = b.dataset.d; try { localStorage.setItem("salt-road-diff", difficulty); } catch { /* storage unavailable */ } renderDiff(); });
  renderDiff();
  $("startBtn").addEventListener("click", startGame);
  // "Start over" erases the saved game, so it asks once before it does
  let newArmed = 0;
  $("newBtn").addEventListener("click", () => {
    const b = $("newBtn");
    if (Date.now() - newArmed > 5000) { newArmed = Date.now(); b.dataset.label = b.dataset.label || b.textContent; b.textContent = "Erase your saved game and start over? Press again"; b.classList.add("armed"); setTimeout(() => { if (Date.now() - newArmed >= 5000) { b.textContent = b.dataset.label; b.classList.remove("armed"); } }, 5000); return; }
    newArmed = 0; b.textContent = b.dataset.label; b.classList.remove("armed"); newGame(); startGame();
  });

