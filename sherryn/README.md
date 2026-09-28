# Gift page for Sherryn

A small, self-contained web page for a best friend's birthday: a gift box to tap open, confetti,
a polaroid photo wall, a "things I love about you" list, a handwritten-style letter and a cake
with candles to blow out.

## How to personalise it

1. **Text:** open `config.js` and change the name, tagline, letter, reasons and who it's from.
2. **Photos:** upload images into `photos/`, then list their file names (and captions) in
   `config.js`. On GitHub: open the `sherryn/photos` folder → **Add file → Upload files**.
3. **Preview:** open `index.html` in a browser (double-click it after downloading the folder), or
   use the deployed site at `/sherryn/`.

Keep photo files reasonably small (under ~2 MB each) so the page loads quickly on a phone.

## Music

- `music/song.mp3` (Selamat Ulang Tahun) and `music/loop.mp3` (upbeat background loop) are rendered by
  `tools/make_gift_music.py`; `music/song-timing.js` holds the lyric timings for the karaoke.
- `spotifyTrack` in `config.js` embeds a song through Spotify's own player (full song for people
  logged in to Spotify in that browser, a 30-second preview otherwise). While it plays, the page's
  own music pauses.
