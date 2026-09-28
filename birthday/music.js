// Music for the birthday page, played live with the Web Audio API (no audio files needed).
//  - background: a soft music-box loop over the Canon in D chord progression (public domain)
//  - song: "Selamat Ulang Tahun", sung to the Happy Birthday melody (public domain)
// If config.js sets `backgroundMusic` to an audio file, that file loops instead of the music box.
window.BirthdayMusic = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return { supported: false };

  let ctx, master, bgGain, songGain;
  let enabled = true;      // the speaker button
  let bgPlaying = false;
  let songPlaying = false;

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    bgGain = ctx.createGain();
    bgGain.gain.value = 0;
    bgGain.connect(master);
    songGain = ctx.createGain();
    songGain.gain.value = 1;
    songGain.connect(master);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ctx.suspend();
      else if (enabled) ctx.resume();
    });
  }

  // A bell-like music-box / soft piano note.
  function note(dest, midi, t, len, vol) {
    const f = hz(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(len, 0.3) + 1.2);
    env.connect(dest);
    [[1, 1], [2, 0.35], [3, 0.12], [4.2, 0.05]].forEach(([mult, amp]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * mult;
      g.gain.value = amp;
      o.connect(g).connect(env);
      o.start(t);
      o.stop(t + Math.max(len, 0.3) + 1.3);
    });
  }

  // ── Background: music box ────────────────────────────────
  // Chords (bass, fifth, octave, third, fifth-up) in C: C G Am Em F C F G
  const CHORDS = [
    [48, 55, 60, 64, 67], [43, 50, 55, 59, 62], [45, 52, 57, 60, 64], [40, 47, 52, 55, 59],
    [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]
  ];
  const ARP = [0, 1, 2, 3, 4, 3, 2, 1];
  const MELODIES = [
    [76, 74, 72, 71, 69, 67, 69, 71],
    [72, 71, 69, 67, 65, 64, 65, 62],
    [79, 79, 76, 76, 77, 76, 74, 74]
  ];
  const EIGHTH = 0.4;
  let step = 0, nextT = 0, timer = null;

  function schedule() {
    if (ctx.currentTime > nextT) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.5) {
      const bar = Math.floor(step / 8) % 8;
      const loop = Math.floor(step / 64) % MELODIES.length;
      const i = step % 8;
      note(bgGain, CHORDS[bar][ARP[i]] + 12, nextT, EIGHTH, i === 0 ? 0.09 : 0.06);
      if (i === 0) note(bgGain, MELODIES[loop][bar] + 12, nextT, EIGHTH * 4, 0.11);
      if (loop === 2 && i === 4) note(bgGain, CHORDS[bar][3] + 24, nextT, EIGHTH * 2, 0.07);
      step++;
      nextT += EIGHTH;
    }
  }

  let fileEl = null;
  function startBg() {
    init();
    if (bgPlaying) return;
    bgPlaying = true;
    const file = (window.BIRTHDAY || {}).backgroundMusic;
    if (file) {
      if (!fileEl) {
        fileEl = new Audio(file);
        fileEl.loop = true;
        ctx.createMediaElementSource(fileEl).connect(bgGain);
      }
      fileEl.play().catch(() => {});
    } else {
      nextT = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 120);
      schedule();
    }
    fade(bgGain, 0.8, 1.5);
  }

  function stopBg(sec = 0.8) {
    if (!bgPlaying) return;
    bgPlaying = false;
    fade(bgGain, 0, sec);
    setTimeout(() => {
      if (bgPlaying) return;
      clearInterval(timer);
      timer = null;
      if (fileEl) fileEl.pause();
    }, sec * 1000 + 50);
  }

  function fade(g, to, sec) {
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(to, t + sec);
  }

  // ── Song: Selamat Ulang Tahun (Happy Birthday melody, 3/4) ──
  // [midi, beats] per line; chords are [midi root, start beat within line, beats].
  const LINES = [
    { mel: [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2]], ch: [[48, 1, 3], [43, 4, 2]] },
    { mel: [[67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2]], ch: [[43, 1, 3], [48, 4, 2]] },
    { mel: [[67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2]], ch: [[48, 1, 3], [41, 4, 3]] },
    { mel: [[77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3]], ch: [[48, 1, 2], [43, 3, 1], [48, 4, 3]] }
  ];
  const TRIAD = { 48: [48, 52, 55], 43: [43, 47, 50, 53], 41: [41, 45, 48] };
  const BEAT = 0.5;

  // onLine(i) fires as each lyric line starts; onEnd() when the song finishes.
  function playSong(onLine, onEnd) {
    init();
    if (songPlaying) return;
    songPlaying = true;
    if (enabled) ctx.resume();
    const wasBg = bgPlaying;
    stopBg(0.6);
    let t = ctx.currentTime + 0.8;
    const t0 = t;
    LINES.forEach((line, li) => {
      const lineStart = t;
      setTimeout(() => onLine && onLine(li), (lineStart - ctx.currentTime) * 1000);
      line.mel.forEach(([m, b]) => { note(songGain, m, t, b * BEAT, 0.28); t += b * BEAT; });
      line.ch.forEach(([root, at, b]) => {
        const s = lineStart + at * BEAT;
        TRIAD[root].forEach((m, k) => note(songGain, m, s + k * 0.03, b * BEAT, k === 0 ? 0.12 : 0.07));
        note(songGain, root - 12, s, b * BEAT, 0.12);
      });
    });
    setTimeout(() => {
      songPlaying = false;
      onEnd && onEnd();
      if (wasBg) setTimeout(startBg, 2500);
    }, (t - t0 + 1.2) * 1000);
  }

  function setEnabled(on) {
    init();
    enabled = on;
    fade(master, on ? 0.9 : 0, 0.3);
    if (on) { ctx.resume(); if (!bgPlaying && !songPlaying) startBg(); }
  }

  return {
    supported: true,
    startBg,
    stopBg,
    playSong,
    setEnabled,
    get enabled() { return enabled; },
    get songPlaying() { return songPlaying; }
  };
})();
