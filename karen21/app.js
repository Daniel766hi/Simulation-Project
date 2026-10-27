// 21 stars for Karen: a night sky where 21 stars join into a heart, a cake to blow out, then a letter.
// All text comes from config.js (window.BDAY).
(() => {
  const C = window.BDAY;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = C.stars.length;
  const KEY = "karen21-opened";

  // ── Fill in text ─────────────────────────────────
  $$("[data-name]").forEach((el) => (el.textContent = C.name));
  $$("[data-date]").forEach((el) => (C.date ? (el.textContent = C.date) : el.remove()));
  $("[data-intro]").textContent = C.introLine;
  $("[data-hint]").textContent = C.introHint;
  $("[data-heart]").textContent = C.heartLine;
  $("#cakeLine").textContent = C.cakeLine;
  $("#letterTitle").textContent = C.letterTitle;
  $("#sign").textContent = C.signature;
  $("#moonsTitle").textContent = C.photosTitle;
  $("#footer").textContent = `dibuat dengan 💛 oleh ${C.from}`;
  $("#letterBody").append(...C.letter.map((t) => Object.assign(document.createElement("p"), { className: "reveal", textContent: t })));
  document.querySelector(".count").lastChild.textContent = ` / ${N}`;

  // ── Music ────────────────────────────────────────
  // Plain <audio> elements: iPhones mute Web Audio in silent mode but still play these.
  const night = new Audio("music/night.mp3");
  const song = new Audio("music/song.mp3");
  night.loop = true;
  night.preload = song.preload = "auto";
  let soundOn = true;
  let track = null; // which one should be playing
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
  function play(which) {
    track = which;
    sync();
  }
  function sync() {
    for (const a of [night, song]) {
      const on = soundOn && a === track;
      if (on && a.paused) a.play().catch(() => {});
      if (!on && !a.paused) a.pause();
    }
    $("#sound").classList.toggle("off", !soundOn);
    $("#sound").textContent = soundOn ? "♫" : "🔇";
  }
  song.addEventListener("ended", () => { if (track === song) play(night); });
  $("#sound").addEventListener("click", () => { soundOn = !soundOn; sync(); });
  // pause while the page is hidden (phone locked, app switched)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) [night, song].forEach((a) => a.pause());
    else sync();
  });

  // ── Background stars ─────────────────────────────
  const cv = $("#stars");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, dots = [], shooters = [], bursts = [];
  function sizeCanvas() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((W * H) / 2600);
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() ** 3 * 1.5 + 0.3,
      p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.4,
      warm: Math.random() < 0.18,
    }));
  }
  function shoot(fast) {
    const fromLeft = Math.random() < 0.5;
    shooters.push({
      x: fromLeft ? Math.random() * W * 0.5 : W * (0.5 + Math.random() * 0.5),
      y: Math.random() * H * 0.4,
      vx: (fromLeft ? 1 : -1) * (fast ? 9 : 6 + Math.random() * 3), vy: 3 + Math.random() * 2,
      life: 1,
    });
  }
  function burst(x, y, n = 60) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 4;
      bursts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, hue: Math.random() < 0.5 ? 42 : 340 });
    }
  }
  let nextShoot = performance.now() + 4000;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      const a = reduced ? 0.8 : 0.45 + 0.55 * Math.sin(t / 1000 * d.s + d.p) ** 2;
      ctx.globalAlpha = a;
      ctx.fillStyle = d.warm ? "#ffe7b8" : "#dfe6ff";
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
    }
    if (!reduced && t > nextShoot) { shoot(); nextShoot = t + 5000 + Math.random() * 7000; }
    for (const s of shooters) {
      s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
      g.addColorStop(0, "rgba(255,250,235,1)"); g.addColorStop(1, "rgba(255,250,235,0)");
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); ctx.stroke();
    }
    shooters = shooters.filter((s) => s.life > 0 && s.x > -200 && s.x < W + 200);
    for (const b of bursts) {
      b.x += b.vx; b.y += b.vy; b.vy += 0.05; b.vx *= 0.985; b.life -= 0.011;
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.fillStyle = `hsl(${b.hue} 95% 78%)`;
      ctx.beginPath(); ctx.arc(b.x, b.y, 2.2 * b.life + 0.5, 0, 7); ctx.fill();
    }
    bursts = bursts.filter((b) => b.life > 0);
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  sizeCanvas();
  requestAnimationFrame(frame);

  // ── Scenes ───────────────────────────────────────
  function show(id) {
    $$(".scene").forEach((s) => s.classList.toggle("on", s.id === id));
    $("#sound").classList.toggle("show", id !== "intro");
  }

  // ── The heart of 21 stars ────────────────────────
  // Points spaced evenly along the classic heart curve, starting at the dip at the top, clockwise.
  const unit = (() => {
    const pts = [];
    for (let i = 0; i <= 2000; i++) {
      const t = (i / 2000) * Math.PI * 2;
      pts.push([16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
    }
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1];
    const at = (u) => {
      u = ((u % total) + total) % total;
      let j = 1;
      while (j < len.length - 1 && len[j] < u) j++;
      const f = (u - len[j - 1]) / (len[j] - len[j - 1] || 1);
      return [pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f];
    };
    // Even arc length puts two stars close together where the curve turns sharply (the tip),
    // so relax the spacing until neighbouring stars are about equally far apart in a straight line.
    const u = Array.from({ length: N }, (_, k) => (k / N) * total);
    for (let it = 0; it < 400; it++) {
      const p = u.map(at);
      const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      for (let k = 1; k < N; k++) {
        const prev = d(p[k], p[k - 1]), next = d(p[k], p[(k + 1) % N]);
        u[k] += 0.25 * (next - prev);
      }
    }
    return u.map(at); // x in [-16, 16], y in about [-12, 17]; star 1 sits in the dip at the top
  })();

  const field = $("#field");
  const lineGroup = $("#lineGroup");
  let opened = new Set();
  try { (JSON.parse(localStorage.getItem(KEY)) || []).forEach((i) => i < N && opened.add(i)); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...opened])); } catch (e) {} };
  let pos = [];

  const starSVG = '<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z"/></svg>';
  const starEls = C.stars.map((s, i) => {
    const b = document.createElement("button");
    b.className = "star";
    b.style.setProperty("--d", `${-(i * 0.37) % 2.4}s`);
    b.setAttribute("aria-label", `Bintang ${i + 1}`);
    b.innerHTML = starSVG + `<span class="n">${i + 1}</span>`;
    b.addEventListener("click", () => openStar(i));
    field.appendChild(b);
    return b;
  });

  function layout() {
    const fw = field.clientWidth, fh = field.clientHeight;
    const s = Math.min((fw * 0.8) / 32, (fh * 0.86) / 29);
    const cx = fw / 2, cy = fh / 2 - 2.5 * s;
    pos = unit.map(([x, y]) => [cx + x * s, cy + y * s]);
    $("#lines").setAttribute("viewBox", `0 0 ${fw} ${fh}`);
    starEls.forEach((el, i) => { el.style.left = `${pos[i][0]}px`; el.style.top = `${pos[i][1]}px`; });
    $("#heartFill").setAttribute("d", "M" + pos.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z");
    drawLines(false);
  }

  // A line joins star i and star i+1 (and 21 back to 1) once both are open.
  function drawLines(animateFor) {
    lineGroup.innerHTML = "";
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      if (!opened.has(i) || !opened.has(j)) continue;
      const [x1, y1] = pos[i], [x2, y2] = pos[j];
      const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v.toFixed(1)));
      if (animateFor === i || animateFor === j) {
        const len = Math.hypot(x2 - x1, y2 - y1);
        l.style.setProperty("--len", len);
        l.style.strokeDasharray = len;
        l.style.strokeDashoffset = len;
        l.classList.add("draw");
      }
      lineGroup.appendChild(l);
    }
  }

  function refresh(animateFor) {
    starEls.forEach((el, i) => el.classList.toggle("open", opened.has(i)));
    $("#count").textContent = opened.size;
    drawLines(animateFor);
    const sub = $("#skySub");
    if (opened.size === 0) sub.textContent = "Ketuk bintang yang berkelip ✦";
    else if (opened.size < N) sub.textContent = `Masih ada ${N - opened.size} bintang lagi`;
    else sub.textContent = "Semua bintang sudah menyala";
  }

  // ── Star card ────────────────────────────────────
  const sheet = $("#sheet");
  let current = -1, justOpened = -1;
  function openStar(i) {
    current = i;
    const s = C.stars[i];
    $("#cardKicker").textContent = `Bintang ${i + 1} dari ${N}`;
    $("#cardTitle").textContent = s.title;
    $("#cardText").textContent = s.text;
    const img = $("#cardPhoto");
    if (s.photo) {
      img.onerror = () => img.classList.add("hidden");
      img.src = `photos/${s.photo}`;
      img.style.objectPosition = s.pos || "center";
      img.classList.remove("hidden");
    } else img.classList.add("hidden");
    justOpened = opened.has(i) ? -1 : i;
    opened.add(i);
    save();
    const left = [...Array(N).keys()].filter((k) => !opened.has(k));
    $("#nextStar").classList.toggle("hidden", left.length === 0);
    sheet.classList.add("on");
    $(".card").scrollTop = 0;
    setTimeout(() => $("#nextStar:not(.hidden)")?.focus({ preventScroll: true }), 50);
  }
  function closeCard() {
    if (!sheet.classList.contains("on")) return;
    sheet.classList.remove("on");
    const i = justOpened;
    setTimeout(() => {
      refresh(i);
      if (i >= 0) {
        const r = starEls[i].getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 18);
      }
      if (opened.size === N && i >= 0) complete(true);
    }, 250);
  }
  function nextStar() {
    // the nearest unopened star going round the heart
    let k = current;
    for (let n = 0; n < N; n++) { k = (k + 1) % N; if (!opened.has(k)) break; }
    closeCard();
    setTimeout(() => openStar(k), 900);
  }
  $$("[data-close]").forEach((el) => el.addEventListener("click", closeCard));
  $("#nextStar").addEventListener("click", nextStar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCard(); $("#lightbox").classList.remove("on"); } });
  // swipe the card down to close
  (() => {
    let y0 = null;
    const card = $(".card");
    card.addEventListener("touchstart", (e) => { if (card.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
    card.addEventListener("touchmove", (e) => {
      if (y0 === null) return;
      const dy = e.touches[0].clientY - y0;
      if (dy > 0) card.style.transform = `translate(-50%, ${dy}px)`;
    }, { passive: true });
    card.addEventListener("touchend", (e) => {
      if (y0 === null) return;
      const dy = e.changedTouches[0].clientY - y0;
      card.style.transform = "";
      y0 = null;
      if (dy > 90) closeCard();
    });
  })();

  function complete(celebrate) {
    field.classList.add("complete");
    $("#done").classList.remove("hidden");
    if (!celebrate) return;
    const r = field.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.45, 120);
    if (!reduced) [0, 500, 1100].forEach((d) => setTimeout(() => shoot(true), d));
  }

  // ── Intro → sky ──────────────────────────────────
  $("#go").addEventListener("click", () => {
    // start the loop inside the tap so phones allow it; prime the birthday song too
    play(night);
    song.muted = true;
    song.play().then(() => { song.pause(); song.currentTime = 0; song.muted = false; }).catch(() => { song.muted = false; });
    show("sky");
    requestAnimationFrame(() => {
      layout();
      refresh(-1);
      if (opened.size === N) complete(false);
    });
  });
  addEventListener("resize", () => { sizeCanvas(); if (pos.length) layout(); });

  // ── Cake ─────────────────────────────────────────
  let blown = false, micStream = null, micRAF = 0;
  $("#toCake").addEventListener("click", () => {
    show("cake");
    song.currentTime = 0;
    play(song);
  });
  function blowOut() {
    if (blown) return;
    blown = true;
    stopMic();
    $("#f2").classList.add("out");
    $("#s2").classList.add("on");
    setTimeout(() => { $("#f1").classList.add("out"); $("#s1").classList.add("on"); $("#glow").style.opacity = 0; }, 260);
    setTimeout(() => {
      $("#cakeLine").textContent = C.afterBlow;
      $("#cakeActions").classList.add("hidden");
      $("#afterActions").classList.remove("hidden");
      const r = $("#cakeWrap").getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.15, 140);
      if (!reduced) [0, 400, 900, 1500].forEach((d) => setTimeout(() => shoot(true), d));
      document.body.classList.add("dawn");
      document.querySelector('meta[name="theme-color"]').content = "#6b4f9a";
    }, 900);
  }
  $("#blow").addEventListener("click", blowOut);
  $("#cakeWrap").addEventListener("click", blowOut);

  // Blow into the microphone: a loud, steady rush of air for about a third of a second.
  $("#mic").addEventListener("click", async () => {
    const note = $("#micNote");
    if (!navigator.mediaDevices?.getUserMedia) { note.textContent = "Mikrofon tidak tersedia, ketuk tombol di atas ya."; return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      note.textContent = "Izin mikrofon ditolak, ketuk tombol di atas saja ya.";
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const an = ac.createAnalyser();
    an.fftSize = 1024;
    ac.createMediaStreamSource(micStream).connect(an);
    const buf = new Float32Array(an.fftSize);
    $("#mic").classList.add("hidden");
    $("#meter").classList.remove("hidden");
    note.textContent = "Tiup ke arah mikrofon… 🌬️";
    let loud = 0, last = performance.now();
    const bar = $("#meter i");
    const tick = (now) => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      bar.style.width = `${Math.min(100, (rms / 0.18) * 100)}%`;
      loud = rms > 0.12 ? loud + (now - last) : Math.max(0, loud - (now - last) * 2);
      last = now;
      if (loud > 320) { blowOut(); ac.close(); return; }
      micRAF = requestAnimationFrame(tick);
    };
    micRAF = requestAnimationFrame(tick);
  });
  function stopMic() {
    cancelAnimationFrame(micRAF);
    micStream?.getTracks().forEach((t) => t.stop());
    micStream = null;
    $("#meter").classList.add("hidden");
  }

  // ── Letter ───────────────────────────────────────
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { root: $("#letter"), threshold: 0.15 });
  $("#toLetter").addEventListener("click", () => {
    show("letter");
    $("#letter").scrollTop = 0;
    $$("#letter .reveal").forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 3) * 0.15}s`; io.observe(el); });
  });

  // Photos as a small constellation of moons
  (() => {
    const box = $("#moons");
    // x%, y%, size px: a small constellation for up to 5 photos, a longer winding one for up to 10
    const small = [[22, 24, 104], [70, 16, 86], [50, 52, 116], [20, 80, 84], [76, 78, 96]];
    const tall = [[24, 8, 104], [72, 12, 86], [50, 24, 112], [20, 38, 88], [74, 42, 102],
                  [46, 55, 90], [78, 66, 84], [26, 71, 108], [68, 85, 100], [28, 93, 84]];
    const spots = C.photos.length > 5 ? tall : small;
    if (spots === tall) box.style.height = "620px";
    const ph = C.photos.slice(0, spots.length);
    const svg = $("#moonLines");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    ph.forEach((p, i) => {
      if (i) {
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const [a, b] = [spots[i - 1], spots[i]];
        Object.entries({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] }).forEach(([k, v]) => l.setAttribute(k, v));
        l.setAttribute("vector-effect", "non-scaling-stroke");
        svg.appendChild(l);
      }
      const [x, y, size] = spots[i];
      const b = document.createElement("button");
      b.className = "moon-photo";
      Object.assign(b.style, { left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px` });
      b.setAttribute("aria-label", "Lihat foto");
      const img = new Image();
      img.src = `photos/${p.file}`;
      img.alt = "";
      img.loading = "lazy";
      img.style.objectPosition = p.pos || "center";
      img.onerror = () => { b.remove(); };
      b.appendChild(img);
      b.addEventListener("click", () => {
        const lb = $("#lightbox");
        $("img", lb).src = img.src;
        lb.classList.add("on");
      });
      box.appendChild(b);
    });
    if (!ph.length) { box.remove(); $(".moons-title").remove(); }
  })();
  $("#lightbox").addEventListener("click", () => $("#lightbox").classList.remove("on"));

  if (C.spotifyTrack) {
    $("#spotify").classList.remove("hidden");
    $("#spotifyNote").textContent = C.spotifyNote;
    $("#spotifyFrame").src = `https://open.spotify.com/embed/track/${C.spotifyTrack}?utm_source=generator&theme=0`;
    // the page's own music pauses when she taps play in the Spotify player (the iframe takes focus)
    addEventListener("blur", () => { if (document.activeElement === $("#spotifyFrame")) { track = null; sync(); } });
  }

  $("#replay").addEventListener("click", () => {
    blown = false;
    ["#f1", "#f2", "#s1", "#s2"].forEach((s) => $(s).classList.remove("out", "on"));
    $("#glow").style.opacity = "";
    $("#cakeLine").textContent = C.cakeLine;
    $("#cakeActions").classList.remove("hidden");
    $("#afterActions").classList.add("hidden");
    $("#mic").classList.remove("hidden");
    $("#micNote").textContent = "";
    document.body.classList.remove("dawn");
    document.querySelector('meta[name="theme-color"]').content = "#0a0e2a";
    play(night);
    show("sky");
    requestAnimationFrame(() => { layout(); refresh(-1); });
  });
})();
