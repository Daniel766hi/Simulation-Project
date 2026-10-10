  // ================================================================== COURIER JOBS
  // Postmistress Ama in Kessa hands out timed deliveries. The clock only runs while you walk.
  const JOB_TO = [
    ["odo", 1], ["tam", 1], ["abawidow", 1], ["hake", 2], ["beno", 2], ["yusra", 7], ["bram", 7], ["dov", 7], ["sela", 8], ["oskar", 8],
    ["hale", 8], ["nell", 9], ["ansel", 9], ["tamsin", 9], ["orla", 10],
  ];
  const JOB_ITEMS = ["a sealed jar that sloshes when you walk", "a bundle of seed potatoes wrapped in a wedding dress", "a love letter, badly spelled, smelling of lavender",
    "a child's shoe, only the left one", "a box of teeth, labelled 'for the dentist's widow'", "a bottle of rainwater from before the drought", "a locked tin that ticks",
    "a map with one town crossed out", "a lock of grey hair tied with ribbon", "a heavy book titled 'On Forgiveness', half the pages cut out", "a very angry chicken in a basket",
    "a coffin nail, one of a set", "a cake, slightly sat on", "a debt receipt marked PAID IN FULL in someone else's handwriting"];
  const JOB_REPLIES = ["(They take it without a word, and hold it against their chest.) ...Thank you. I didn't think it would come.", "Oh! Oh, the fool. The dear fool. Tell them I said yes.",
    "Is this... no. No, it's fine. It's fine. Don't ask. Here's your coin.", "About time! ...Sorry. It's not your fault. Nothing's ever anyone's fault out here.",
    "(They open it, look inside, and close it again very quickly.) Right. Right. Thank you, courier. Forget you saw my face.", "You ran all the way? With this? Sit down, have some water. We have water now. Isn't that strange?"];
  npc2({ id: "ama", name: "Postmistress Ama", x: 9, y: 43, look: { robe: "#3b2f7a", hair: "#c8c0b0", skin: "#8a5a33", style: { hair: "bun", dress: true, eye: "#3a2a1a" } }, show: () => G.stage >= 1 && !G.flags.epilogue });
  const jobBadge = document.createElement("div");
  jobBadge.hidden = true; jobBadge.style.cssText = "position:absolute;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(18,15,36,.9);border:1px solid var(--gold);border-radius:8px;padding:3px 10px;font-size:13px;z-index:4;pointer-events:none;color:var(--gold)";
  $("toast").parentNode.appendChild(jobBadge);
  function newJob() {
    const opts = JOB_TO.filter(([id, st]) => G.stage >= st && NPCS.find(n => n.id === id) && npcVisible(NPCS.find(n => n.id === id)));
    if (!opts.length) return null;
    const [to] = pick(opts), n = NPCS.find(x => x.id === to), ama = NPCS.find(x => x.id === "ama");
    const dist = Math.hypot(n.x - ama.x, n.y - ama.y), cross = regionOf(n.x, n.y) !== regionOf(ama.x, ama.y);
    return { to, item: pick(JOB_ITEMS), time: Math.round(20 + dist * 0.6 + (cross ? 35 : 0)), pay: Math.round(12 + dist / 2 + (cross ? 15 : 0)) };
  }
  Object.assign(D, {
    ama_0: say("ama", "(An old woman sorts letters into pigeonholes that have been empty for three years.) The post's open again, courier. People have things to say now they're not so busy dying. I've got more parcels than legs.", "ama_1"),
    ama_1: say("ama", "Forty years I ran this office. Your mother came through here once, you know. Bought a stamp, wrote one letter, sealed it and never sent it. I always wondered who it was for.", "ama_offer", () => { G.flags.amaMet = true; save(); }),
    ama_offer: { who: "ama", text: "", choices: [
      { t: "Take the parcel.", go: null, act: () => { const j = G.flags.jobOffer; G.flags.job = { ...j, left: j.time }; G.flags.jobOffer = null; toast(`Deliver ${j.item} to ${NPCS.find(n => n.id === j.to).name}. Clock's running.`); Music.sound("item"); save(); updateHud(); } },
      { t: "Not now.", go: null } ] },
    ama_busy: say("ama", ""),
    ama_none: say("ama", "Nothing going out right now. The roads are too dangerous even for me to ask. Come back when the valley's a little further along."),
  });
  function amaDialog() {
    const f = G.flags;
    if (f.job) { D.ama_busy.text = `You've still got ${f.job.item} for ${NPCS.find(n => n.id === f.job.to).name}. Off you go! Parcels don't deliver themselves. Believe me, I've watched.`; return "ama_busy"; }
    if (!f.jobOffer) f.jobOffer = newJob();
    const j = f.jobOffer;
    if (j) { const n = NPCS.find(x => x.id === j.to); D.ama_offer.text = `${f.jobsDone ? `${f.jobsDone} delivered so far. ` : ""}This one's ${j.item}, for ${n.name}. ${j.time} seconds of walking, if you're quick. ${j.pay} coin on time, half if late.`; }
    D.ama_1.go = j ? "ama_offer" : "ama_none";
    if (!f.amaMet) return "ama_0";
    return j ? "ama_offer" : "ama_none";
  }
  function deliverJob(n) {
    const f = G.flags, j = f.job, late = j.left <= 0, pay = late ? Math.round(j.pay / 2) : j.pay;
    f.job = null; f.jobsDone = (f.jobsDone || 0) + 1; if (!late) f.jobsOnTime = (f.jobsOnTime || 0) + 1; G.coins += pay;
    let extra = "";
    if (f.jobsOnTime >= 5 && !(G.relics || []).includes("postbell")) { giveRelic("postbell"); extra = " Ama will want to hear about this. (Relic: the Post Bell.)"; }
    if (f.jobsOnTime >= 10 && !(G.relics || []).includes("sandals")) { giveRelic("sandals"); extra = " Word travels. You're the fastest courier in the valley. (Relic: Winged Sandals.)"; }
    D.__job = say(n.id, `${pick(JOB_REPLIES)} (${late ? "Late. " : "On time! "}+${pay} coin.)${extra}`);
    Music.sound("victory"); save(); updateHud(); return "__job";
  }
  Object.assign(RELICS, {
    postbell: { name: "The Post Bell", from: "ama", desc: "+1 attack, +1 defence, +1 speed, +1 SP each turn.", atk: 1, def: 1, spd: 1, spRegen: 1 },
    sandals: { name: "Winged Sandals", from: "ama", desc: "+3 speed, +10% critical chance.", spd: 3, crit: 0.1 },
  });
  const _dialogForJ = dialogFor;
  dialogFor = function (n) {
    if (n.id === "ama") return amaDialog();
    if (G.flags.job && G.flags.job.to === n.id) return deliverJob(n);
    return _dialogForJ(n);
  };
  const _updateJ = update;
  update = function (dt) {
    _updateJ(dt);
    const j = G && G.flags.job;
    if (!j) { if (!jobBadge.hidden) jobBadge.hidden = true; return; }
    if (mode === "play" && !npcAsleep(NPCS.find(x => x.id === j.to) || {})) { const was = j.left > 0; j.left -= dt; if (was && j.left <= 0) toast("The parcel's late. Deliver it anyway: half pay is still pay."); }
    const n = NPCS.find(x => x.id === j.to);
    jobBadge.hidden = mode === "title" || !!battle;
    jobBadge.textContent = `📦 ${n ? n.name : j.to}: ${n && npcAsleep(n) ? "asleep until dawn (clock paused)" : j.left > 0 ? Math.ceil(j.left) + "s" : "late"}`;
    jobBadge.style.color = j.left > 10 ? "var(--gold)" : "#ff6b6b";
  };
  const _goalJ = goal;
  goal = function () { const t = _goalJ(), j = G.flags.job; if (!j || G.flags.epilogue) return t; const n = NPCS.find(x => x.id === j.to); return n ? { ch: "Delivery", text: `Take ${j.item} to ${n.name}.`, x: n.x, y: n.y } : t; };
  const _extraJournalJ = extraJournalHtml;
  extraJournalHtml = function () { const f = G.flags; if (!f.amaMet) return _extraJournalJ();
    return _extraJournalJ() + `<h3>The Post</h3><p class="dim" style="font-size:13px">${f.jobsDone || 0} parcels delivered, ${f.jobsOnTime || 0} on time.${f.job ? ` Carrying ${f.job.item} for ${NPCS.find(n => n.id === f.job.to).name}.` : " Postmistress Ama in Kessa has more."}</p>`; };
  ACHIEVEMENTS.push(["post10", "Swiftest in the Valley", "Deliver ten parcels on time.", () => (G.flags.jobsOnTime || 0) >= 10]);

