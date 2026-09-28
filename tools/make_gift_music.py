"""Render the music for the gift page in sherryn/ to MP3.

    pip install numpy lameenc
    python3 tools/make_gift_music.py

Writes:
  sherryn/music/song.mp3        "Selamat Ulang Tahun" (Happy Birthday melody, public domain), two verses
  sherryn/music/loop.mp3        an original, upbeat background loop that repeats seamlessly
  sherryn/music/song-timing.js  when each lyric line starts in song.mp3, for the karaoke lyrics
"""
import os
import numpy as np
import lameenc

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "sherryn", "music")
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, attack, decay):
    t = np.arange(n) / SR
    e = np.exp(-t / decay)
    a = max(1, int(attack * SR))
    e[:a] *= np.linspace(0, 1, a)
    return e


def add(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


# ── Instruments ─────────────────────────────────────────────
def bell(m, vol=1.0, length=1.6):
    """Glockenspiel / music box: inharmonic partials, bright and cute."""
    n = int(length * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = (np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.55)
         + 0.45 * np.sin(2 * np.pi * f * 2.0 * t) * env(n, 0.002, 0.25)
         + 0.22 * np.sin(2 * np.pi * f * 3.01 * t) * env(n, 0.001, 0.12)
         + 0.10 * np.sin(2 * np.pi * f * 4.2 * t) * env(n, 0.001, 0.06))
    return vol * s


def pluck(m, vol=1.0, length=0.9, decay=0.35):
    """Ukulele-ish pluck: bright harmonics that die away faster than the fundamental."""
    n = int(length * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.zeros(n)
    for k, a in [(1, 1.0), (2, 0.6), (3, 0.35), (4, 0.2), (5, 0.1)]:
        s += a * np.sin(2 * np.pi * f * k * t) * env(n, 0.003, decay / k ** 0.6)
    return vol * s


def bass(m, vol=1.0, length=0.7):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * np.sin(2 * np.pi * 3 * f * t))
    return vol * s * env(n, 0.004, 0.28)


def clap(vol=1.0):
    n = int(0.18 * SR)
    noise = rng.standard_normal(n)
    # crude band-pass: difference of two moving averages
    lo = np.convolve(noise, np.ones(4) / 4, "same")
    lo2 = np.convolve(noise, np.ones(18) / 18, "same")
    s = lo - lo2
    e = np.zeros(n)
    for d in (0.0, 0.011, 0.022):  # a few quick hands
        i = int(d * SR)
        e[i:] += env(n - i, 0.0005, 0.012 if d < 0.02 else 0.05)
    return vol * s * e


def shaker(vol=1.0):
    n = int(0.07 * SR)
    noise = rng.standard_normal(n)
    s = noise - np.convolve(noise, np.ones(3) / 3, "same")
    return vol * s * env(n, 0.01, 0.018)


def kick(vol=1.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 110 * np.exp(-t / 0.04) + 45
    ph = 2 * np.pi * np.cumsum(f) / SR
    return vol * np.sin(ph) * env(n, 0.001, 0.09)


def sparkle(t0, buf, top=96, vol=0.25):
    """Quick upward glissando of bells, for endings."""
    for k, m in enumerate(range(72, top, 2)):
        add(buf, bell(m, vol * (0.6 + k * 0.03), 0.9), t0 + k * 0.035)


def master(buf):
    buf = buf / (np.max(np.abs(buf)) + 1e-9) * 1.25
    buf = np.tanh(buf)  # soft limiter
    return buf / np.max(np.abs(buf)) * 0.93


def write_mp3(path, buf, kbps=128):
    pcm = (np.clip(buf, -1, 1) * 32767).astype(np.int16)
    enc = lameenc.Encoder()
    enc.set_bit_rate(kbps)
    enc.set_in_sample_rate(SR)
    enc.set_channels(1)
    enc.set_quality(2)
    data = enc.encode(pcm.tobytes()) + enc.flush()
    with open(path, "wb") as f:
        f.write(data)
    print(f"{os.path.relpath(path)}: {len(buf) / SR:.1f}s, {len(data) // 1024} KB")


CHORD = {  # triads used for strums (midi)
    "C": [60, 64, 67], "G": [59, 62, 67], "G7": [59, 62, 65, 67], "F": [60, 65, 69], "Am": [60, 64, 69],
}
ROOT = {"C": 48, "G": 43, "G7": 43, "F": 41, "Am": 45}


def strum(buf, name, t, vol=0.28, length=0.5):
    for k, m in enumerate(CHORD[name]):
        add(buf, pluck(m, vol, length, 0.22), t + k * 0.012)


# ── Song: Selamat Ulang Tahun (3/4) ─────────────────────────
def make_song():
    B = 0.5  # seconds per beat
    # melody lines: (midi, beats); chords per line: (name, start beat, beats)
    lines = [
        ([(67, .75), (67, .25), (69, 1), (67, 1), (72, 1), (71, 2)], [("C", 1, 3), ("G7", 4, 2)]),
        ([(67, .75), (67, .25), (69, 1), (67, 1), (74, 1), (72, 2)], [("G7", 1, 3), ("C", 4, 2)]),
        ([(67, .75), (67, .25), (79, 1), (76, 1), (72, 1), (71, 1), (69, 1)], [("C", 1, 3), ("F", 4, 2)]),
        ([(77, .75), (77, .25), (76, 1), (72, 1), (74, 1), (72, 2)], [("C", 1, 2), ("G7", 3, 1), ("C", 4, 2)]),
    ]
    total_beats = 3 + 2 * sum(sum(b for _, b in mel) for mel, _ in lines) + 6
    buf = np.zeros(int((total_beats * B + 3) * SR))
    timing = []

    t = 0.0
    # intro: one bar of "oom-pah-pah" on C, ending on the pickup
    add(buf, bass(ROOT["C"], 0.5), t)
    strum(buf, "C", t + B)
    strum(buf, "C", t + 2 * B)
    t += 3 * B

    for verse in range(2):
        full = verse == 1
        for mel, chords in lines:
            start = t
            timing.append(round(start, 3))
            # melody: bells, doubled an octave up in the second verse
            for m, b in mel:
                add(buf, bell(m, 0.55), t)
                if full:
                    add(buf, bell(m + 12, 0.18), t)
                    add(buf, pluck(m, 0.25, 0.6), t)
                t += b * B
            # waltz accompaniment: bass on 1, strums on 2 and 3
            for name, at, beats in chords:
                for k in range(beats):
                    bt = start + (at + k) * B
                    if (at + k - 1) % 3 == 0:
                        add(buf, bass(ROOT[name], 0.55), bt)
                        if full:
                            add(buf, kick(0.35), bt)
                    else:
                        strum(buf, name, bt, 0.22)
                        if full:
                            add(buf, clap(0.35), bt)
                    add(buf, shaker(0.08 if full else 0.04), bt + B / 2)
    # ending: big C chord with a sparkle on the next downbeat
    t += B
    add(buf, bass(ROOT["C"], 0.6, 1.5), t)
    add(buf, kick(0.4), t)
    for k, m in enumerate([60, 64, 67, 72, 76, 79, 84]):
        add(buf, bell(m, 0.3, 2.5), t + k * 0.04)
    sparkle(t + 0.35, buf)
    end = t + 3.0
    buf = buf[: int(end * SR)]
    write_mp3(os.path.join(OUT, "song.mp3"), master(buf))
    return timing


# ── Background: an original, bouncy loop (4/4, C–Am–F–G) ────
def make_loop():
    E = 60 / 116 / 2  # eighth note at 116 bpm
    prog = ["C", "Am", "F", "G", "C", "Am", "F", "G"]
    _ = None
    melody = [
        [76, _, 79, _, 84, _, 79, 76], [81, _, 79, _, 76, _, 72, _],
        [77, _, 81, _, 84, _, 81, 77], [79, _, _, 74, 79, _, 83, _],
        [76, 79, 84, _, 83, _, 79, _], [81, _, 76, _, 81, 84, 83, 81],
        [77, 81, 79, 77, 76, _, 74, _], [74, _, 79, _, 71, _, 72, _],
    ]
    bars = 16  # the 8-bar tune twice; the second time with bells an octave down and more percussion
    length = bars * 8 * E
    tail = 2.0
    buf = np.zeros(int((length + tail) * SR))
    for bar in range(bars):
        name = prog[bar % 8]
        second = bar >= 8
        for i in range(8):
            t = (bar * 8 + i) * E
            m = melody[bar % 8][i]
            if m is not None:
                add(buf, bell(m, 0.42, 1.2), t)
                if second:
                    add(buf, pluck(m - 12, 0.22, 0.5), t)
            if i in (0, 4):
                add(buf, bass(ROOT[name] + (7 if i == 4 and bar % 2 else 0), 0.5), t)
                add(buf, kick(0.3 if i == 0 else 0.2), t)
            if i in (2, 6):
                strum(buf, name, t, 0.2, 0.35)
                add(buf, clap(0.28 if second or i == 6 else 0.18), t)
            add(buf, shaker(0.05 if i % 2 else 0.03), t)
    # wrap the tail round to the start so the loop joins seamlessly
    n = int(length * SR)
    buf[: len(buf) - n] += buf[n:]
    write_mp3(os.path.join(OUT, "loop.mp3"), master(buf[:n]), kbps=112)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    timing = make_song()
    make_loop()
    with open(os.path.join(OUT, "song-timing.js"), "w") as f:
        f.write("// Generated by tools/make_gift_music.py: start time (seconds) of each lyric line in song.mp3\n")
        f.write(f"window.SONG_TIMING = {timing};\n")
    print("timing", timing)
