// Music for the gift page.
//  - song: music/song.mp3, "Selamat Ulang Tahun" (rendered by tools/make_gift_music.py)
//  - loop: music/loop.mp3, an upbeat background loop (or config.backgroundMusic if set)
//  - Spotify: an embedded track (config.spotifyTrack); while it plays, the page's own music pauses
// Plain <audio> elements are used because iPhones mute Web Audio in silent mode but still play these.
window.GiftMusic = (() => {
  const C = window.BIRTHDAY || {};
  const song = new Audio("music/song.mp3");
  const loop = new Audio(C.backgroundMusic || "music/loop.mp3");
  song.preload = "auto";
  loop.preload = "auto";
  loop.loop = true;
  loop.volume = 0.8;

  let enabled = true;        // the ♫ button
  let spotifyPlaying = false;
  let songPlaying = false;
  let wantLoop = false;
  let raf = null;
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());

  // Ask iOS 17+ to treat this page's sound as media playback (ignores the silent switch).
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}

  // Must run inside a tap: lets both elements play later without another tap (iOS).
  function unlock() {
    loop.muted = true;
    const p = loop.play();
    if (p && p.then) p.then(() => { if (!wantLoop) loop.pause(); loop.muted = false; }).catch(() => { loop.muted = false; });
    else { loop.pause(); loop.muted = false; }
  }

  function syncLoop() {
    const on = enabled && wantLoop && !songPlaying && !spotifyPlaying;
    if (on && loop.paused) loop.play().catch(() => {});
    if (!on && !loop.paused) loop.pause();
    notify();
  }

  function startLoop() { wantLoop = true; syncLoop(); }

  // onLine(i) fires as each lyric line starts (i counts across both verses); onEnd() at the end.
  function playSong(onLine, onEnd) {
    const times = window.SONG_TIMING || [];
    songPlaying = true;
    syncLoop();
    song.currentTime = 0;
    let line = -1;
    const tick = () => {
      let i = -1;
      for (let k = 0; k < times.length; k++) if (song.currentTime >= times[k]) i = k;
      if (i !== line) { line = i; if (i >= 0 && onLine) onLine(i); }
      if (songPlaying) raf = requestAnimationFrame(tick);
    };
    const finish = () => {
      if (!songPlaying) return;
      songPlaying = false;
      cancelAnimationFrame(raf);
      song.removeEventListener("ended", finish);
      onEnd && onEnd();
      syncLoop();
    };
    song.addEventListener("ended", finish);
    song.muted = !enabled;
    const p = song.play();
    if (p && p.catch) p.catch(finish);
    raf = requestAnimationFrame(tick);
    return () => { song.pause(); finish(); };  // stop early
  }

  function setEnabled(on) {
    enabled = on;
    song.muted = !on;
    if (on) wantLoop = true;
    syncLoop();
  }

  function setSpotifyPlaying(on) { spotifyPlaying = on; if (on) wantLoop = true; syncLoop(); }

  return {
    unlock, startLoop, playSong, setEnabled, setSpotifyPlaying,
    onChange: (fn) => listeners.add(fn),
    get enabled() { return enabled; },
    get songPlaying() { return songPlaying; },
    get spotifyPlaying() { return spotifyPlaying; }
  };
})();
