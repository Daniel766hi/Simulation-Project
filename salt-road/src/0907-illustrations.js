  // ================================================================== ILLUSTRATIONS: PICTURES BEHIND THE STORY CARDS
  // Next to the page, salt-road/art holds free-licensed illustrations (CC0 and CC-BY, credited in Settings and in
  // salt-road/art/CREDITS.md). When the folder is there, each chapter, act, arrival and ending card shows its scene
  // behind the words, under a dark veil so the text stays easy to read. (The title keeps its own pixel scene.) They
  // ease in slowly (still with reduced motion). Settings has an Illustrations switch. Without the folder, cards stay plain.
  const ART = { base: "salt-road/art/", cards: {}, ready: false };
  const ART_BY_TITLE = {
    "The Last Dry Day": "prologue", "The Stolen Bell": "prologue", "The Butcher of the Well": "ch2_well", "The Drowned Grove": "ch3_grove",
    "The Salt Cathedral": "ch4_cathedral", "The Salt-Flayed": "ch5_flayed", "The Drowned Gate": "ch6_gate", "The Open Gate": "ch7_city",
    "The Drowning Marsh": "ch8_marsh", "The Wreck Coast": "ch9_coast", "The Three Tones": "ch10_shrines", "The Storm Spire": "ch11_spire",
    "The Drowned King": "ch12_king", "The Rains": "act2_rains", "The Dry Sea": "drysea", "The Walk Home": "epilogue", "Home Again": "home", "Morning": "home",
    "The Water Goes Where It Was Given": "ending",
  };
  const artOn = () => ART.ready && SETTINGS.illustrations !== "off";
  function artKey(kicker, title) {
    const k = String(kicker || ""), t = String(title || "");
    if (ART_BY_TITLE[t]) return ART_BY_TITLE[t];
    if (/The Rime/.test(k)) return "rime"; if (/The Weir/.test(k)) return "weir"; if (/The Cistern/.test(k)) return "cistern";
    if (/ending|Ending|In memory/.test(k)) return "ending";
    return null;
  }
  const artUrl = key => key && ART.cards[key] ? ART.base + ART.cards[key].file : null;
  const VEIL = "linear-gradient(rgba(10,8,22,.55), rgba(10,8,22,.82) 55%, rgba(10,8,22,.94))";
  function showArt(el, url) {
    if (!el) return;
    if (!url || !artOn()) { el.style.backgroundImage = ""; el.classList.remove("art"); return; }
    el.style.backgroundImage = `${VEIL}, url("${url}")`; el.style.backgroundSize = "cover"; el.style.backgroundPosition = "center"; el.classList.add("art");
  }
  const _showNextCardArt = showNextCard;
  showNextCard = function () {
    const next = cardQueue[0];
    _showNextCardArt();
    if (next) { const key = artKey(next.kicker, next.title); showArt($("card"), artUrl(key)); $("card").dataset.art = key || ""; }
  };
  const artStyle = document.createElement("style");
  artStyle.textContent = `#card.art, #title.art { animation: artIn 1.6s ease-out both; } @keyframes artIn { from { background-size: cover, cover; filter: brightness(.4); } to { filter: none; } }`;
  document.head.appendChild(artStyle);
  function titleArt() { /* the title screen keeps the game's own pixel scene */ }
  try {
    if (location.protocol !== "file:") fetch(ART.base + "manifest.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).then(m => {
      if (!m || !m.cards) return; ART.cards = m.cards; ART.ready = Object.keys(m.cards).length > 0; titleArt();
      for (const k of Object.keys(ART.cards)) { const im = new Image(); im.src = ART.base + ART.cards[k].file; }   // warm the cache so a card's picture is there when it opens
    }).catch(() => {});
  } catch { /* no fetch */ }
  // Settings: the switch, and the pictures in the credits
  const _showSettingsArt = showSettings;
  showSettings = function (focusKey) {
    _showSettingsArt(focusKey);
    if (!ART.ready) return;
    const panel = $("pausePanel"), anchor = panel && (panel.querySelector('[data-set="ambience"]') || panel.querySelector('[data-set="sfxStyle"]') || panel.querySelector('[data-set="musicStyle"]')); if (!anchor) return;
    const row = document.createElement("div"), on = SETTINGS.illustrations !== "off";
    row.innerHTML = `<div class="setrow"><span>Illustrations</span><div class="seg"><button type="button" data-set="illustrations" data-v="on" class="${on ? "on" : ""}">On</button><button type="button" data-set="illustrations" data-v="off" class="${on ? "" : "on"}">Off</button></div><span></span></div>`;
    anchor.closest(".setrow").parentNode.after(row);
    const ul = panel.querySelector("details.credits ul");
    if (ul) ul.insertAdjacentHTML("beforeend", Object.entries(ART.cards).map(([k, m]) => `<li>Picture, ${escRec(k)}: "${escRec(m.title)}" by ${escRec(m.author)}, ${escRec(m.license)}${m.url ? ` (<a href="${escRec(m.url)}" target="_blank" rel="noopener">source</a>)` : ""}</li>`).join(""));
    if (focusKey === "illustrations") { const f = panel.querySelector('[data-set="illustrations"].on'); if (f) f.focus({ preventScroll: true }); }
    titleArt();
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { art: () => ({ ready: ART.ready, cards: Object.keys(ART.cards), card: $("card").dataset.art || null, title: !!$("title").style.backgroundImage }), artKey, showCard: (k, t, text) => card(k, t, text) }), 0);
