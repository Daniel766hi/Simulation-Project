# 21 Bintang untuk Karen

A 21st-birthday page for Karen, from Daniel. Until midnight on 28 October (WIB) it shows a
countdown (add `?lihat` to the link to skip it). Then a night sky with 21 stars: each one opens a
small card (a wish, a memory, a photo), and opening all 21 joins them into a heart; a secret 22nd
star then falls across the sky until she catches it. Next a cake with "2" and "1" candles to blow
out (tap, or blow into the microphone), a wish she can write and send up to the stars (it isn't
saved anywhere), the sky turns to dawn, and a letter signed "with love, Daniel". The last surprise
draws "love u, sayang" in stars. "Serta Mulia" by Sal Priadi plays from the first screen in a
Spotify player docked at the bottom.

- **Text and photos:** everything is in `config.js`. Lines marked `✏️ ISI` are placeholders to
  personalise (the 21 star cards, the letter, the date, an optional Spotify song).
- **Photos:** `photos/` (copied from `karen/photos/`).
- **Music:** the Spotify song in `config.js`. If Spotify can't play (or stops), the page falls back
  to `music/night.mp3` (an original music-box loop) and `music/song.mp3` ("Selamat Ulang Tahun" as
  a lullaby; the melody is public domain), rendered by `tools/make_karen21_music.py`.
- **Progress:** opened stars are remembered on her phone, so she can come back to the heart later.
- **Preview:** open `index.html` through a local server (`python3 -m http.server`, then
  `/karen21/`), or use the deployed site at `/karen21/`.
