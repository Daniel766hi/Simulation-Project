# 21 Bintang untuk Karen

A 21st-birthday page for Karen, from Daniel. A night sky with 21 stars: each one opens a small
card (a wish, a memory, a photo), and opening all 21 joins them into a heart. Then a cake with
"2" and "1" candles to blow out (tap, or blow into the microphone), the sky turns to dawn, and a
letter signed "with love, Daniel" closes it.

- **Text and photos:** everything is in `config.js`. Lines marked `✏️ ISI` are placeholders to
  personalise (the 21 star cards, the letter, the date, an optional Spotify song).
- **Photos:** `photos/` (copied from `karen/photos/`).
- **Music:** `music/night.mp3` (an original music-box loop) and `music/song.mp3` ("Selamat Ulang
  Tahun" as a lullaby; the melody is public domain), rendered by `tools/make_karen21_music.py`.
- **Progress:** opened stars are remembered on her phone, so she can come back to the heart later.
- **Preview:** open `index.html` through a local server (`python3 -m http.server`, then
  `/karen21/`), or use the deployed site at `/karen21/`.
