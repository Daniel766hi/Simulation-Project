"""Render the music for the 21st-birthday page in karen21/ to MP3.

    pip install numpy lameenc
    python3 tools/make_karen21_music.py

Writes:
  karen21/music/night.mp3   an original, slow music-box loop for the night sky (repeats seamlessly)
  karen21/music/song.mp3    "Selamat Ulang Tahun" (Happy Birthday melody, public domain) as a soft lullaby
Reuses the instruments from make_gift_music.py.
"""
import os
import numpy as np
import make_gift_music as g
from make_gift_music import SR, add, bell, pluck, hz, env, master, write_mp3

OUT = os.path.join(os.path.dirname(__file__), "..", "karen21", "music")


def pad(notes, length, vol=0.12):
    """Soft, slowly swelling chord: detuned sines with a gentle attack and release."""
    n = int(length * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        f = hz(m)
        for d in (-0.15, 0.15):
            s += np.sin(2 * np.pi * f * (1 + d / 100) * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    a = min(n, int(0.9 * SR))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 2
    r = min(n, int(1.2 * SR))
    e[-r:] *= np.linspace(1, 0, r)
    return vol * s * e / len(notes)


def soft_bass(m, vol=0.35, length=2.4):
    n = int(length * SR)
    t = np.arange(n) / SR
    return vol * np.sin(2 * np.pi * hz(m) * t) * env(n, 0.02, 0.9)


# ── Night sky: Fmaj7 – Em7 – Dm7 – Cmaj7, 72 bpm, music box over a pad ──
def make_night():
    Q = 60 / 72  # quarter note
    prog = [  # pad notes, bass
        ([65, 69, 72, 76], 41), ([64, 67, 71, 74], 40), ([62, 65, 69, 72], 38), ([60, 64, 67, 71], 36),
    ]
    _ = None
    melody = [  # eighth notes per bar
        [84, _, 81, _, 79, 77, 76, _], [79, _, 76, _, 74, _, 71, _],
        [77, _, 74, _, 72, 74, 76, _], [72, _, _, 71, 72, _, 79, _],
        [84, _, 88, _, 86, 84, 81, _], [83, _, 79, _, 76, _, 74, 76],
        [77, _, 81, _, 79, _, 77, 74], [76, _, _, _, 72, _, _, _],
    ]
    bars = 16
    bar_len = 4 * Q
    length = bars * bar_len
    buf = np.zeros(int((length + 4) * SR))
    for bar in range(bars):
        notes, root = prog[bar % 4]
        t0 = bar * bar_len
        add(buf, pad(notes, bar_len + 1.0), t0)
        add(buf, soft_bass(root), t0)
        add(buf, soft_bass(root + 7, 0.18), t0 + 2 * Q)
        for i, m in enumerate(melody[bar % 8]):
            if m is None:
                continue
            t = t0 + i * Q / 2
            add(buf, bell(m, 0.30, 2.0), t)
            if bar >= 8:  # second time round: a quiet echo an octave down
                add(buf, pluck(m - 12, 0.10, 0.8, 0.5), t + Q / 4)
        # a few high twinkles
        for k in (3, 7):
            if (bar + k) % 3 == 0:
                add(buf, bell(notes[-1] + 24, 0.06, 1.2), t0 + k * Q / 2 + Q / 4)
    n = int(length * SR)
    buf[: len(buf) - n] += buf[n:]
    write_mp3(os.path.join(OUT, "night.mp3"), master(buf[:n]) * 0.8, kbps=112)


# ── Selamat Ulang Tahun as a lullaby (3/4, slow, no drums) ──
def make_song():
    B = 0.62
    lines = [
        ([(67, .75), (67, .25), (69, 1), (67, 1), (72, 1), (71, 2)], ["C", "G7"]),
        ([(67, .75), (67, .25), (69, 1), (67, 1), (74, 1), (72, 2)], ["G7", "C"]),
        ([(67, .75), (67, .25), (79, 1), (76, 1), (72, 1), (71, 1), (69, 1)], ["C", "F"]),
        ([(77, .75), (77, .25), (76, 1), (72, 1), (74, 1), (72, 2)], ["G7", "C"]),
    ]
    padn = {"C": [60, 64, 67, 72], "G7": [59, 62, 65, 67], "F": [60, 65, 69, 72]}
    total = 3 + 2 * sum(sum(b for _, b in mel) for mel, _ in lines) + 8
    buf = np.zeros(int((total * B + 4) * SR))
    t = 2 * B  # the pickup
    add(buf, pad(padn["C"], 3 * B), 0)
    for verse in range(2):
        for mel, chords in lines:
            start = t
            beats = sum(b for _, b in mel)
            half = beats / 2
            for k, name in enumerate(chords):
                add(buf, pad(padn[name], half * B + 0.8, 0.14), start + k * half * B)
                add(buf, soft_bass(g.ROOT[name] + 12 if g.ROOT[name] < 45 else g.ROOT[name], 0.3), start + k * half * B)
            for m, b in mel:
                add(buf, bell(m, 0.5, 2.2), t)
                if verse == 1:
                    add(buf, bell(m + 12, 0.14, 1.5), t)
                t += b * B
    t += B
    add(buf, pad([60, 64, 67, 72, 76], 4.0, 0.16), t)
    for k, m in enumerate([72, 76, 79, 84, 88, 91]):
        add(buf, bell(m, 0.22, 2.5), t + k * 0.09)
    buf = buf[: int((t + 4.0) * SR)]
    write_mp3(os.path.join(OUT, "song.mp3"), master(buf))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make_night()
    make_song()
