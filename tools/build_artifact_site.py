"""Build copies of the four pages for hosting as a single Claude Artifact (repo pages untouched).

Changes only what the host requires: no html/head/body wrapper, plain page names as titles,
the OS light/dark setting respected, the sticky header clear of phone safe areas, and
index.html (reserved by the host) renamed to mine.html. Output: build/site/.
"""
import re, shutil
from pathlib import Path
SRC = Path(__file__).resolve().parents[1]
OUT = SRC / "build" / "site"
OUT.mkdir(parents=True, exist_ok=True); (OUT / "vendor").mkdir(exist_ok=True)
shutil.copy(SRC / "vendor/chart.umd.min.js", OUT / "vendor/chart.umd.min.js")
TITLES = {"m5.html": "M5 Demand Forecasting", "index.html": "Mine Economics Simulator",
          "abm.html": "Supply Chain Bullwhip", "bass.html": "Bass Diffusion"}
for name, title in TITLES.items():
    h = (SRC / name).read_text()
    # the host adds doctype/html/head/body and charset/viewport meta
    for pat in [r"<!DOCTYPE html>\s*", r"<html[^>]*>\s*", r"</html>\s*", r"<head>\s*", r"</head>\s*",
                r"<body>\s*", r"</body>\s*", r'<meta charset="UTF-8">\s*', r'<meta name="viewport"[^>]*>\s*']:
        h = re.sub(pat, "", h, flags=re.I)
    h = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", h, count=1)
    # sticky header clears the phone's safe area
    h = h.replace("position:sticky;top:0;", "position:sticky;top:env(safe-area-inset-top,0px);")
    # follow the viewer's OS theme when nothing is stamped: reuse the light token block
    m = re.search(r'\[data-theme="light"\]\{(.*?)\n  \}', h, re.S)
    light = m.group(1)
    media = ('  @media (prefers-color-scheme: light){\n    :root:not([data-theme="dark"]){' + light + '\n    }\n  }\n')
    h = h.replace(m.group(0), m.group(0) + "\n" + media, 1)
    # page toggle stamps an explicit choice both ways, so it beats the OS setting
    h = h.replace("""  if(t === 'light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');""",
                  """  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');""")
    h = h.replace("""  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');""",
                  """  const isLight = document.documentElement.getAttribute('data-theme') === 'light' ||
    (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: light)').matches);
  applyTheme(isLight ? 'dark' : 'light');""")
    h = h.replace("""try{ if(localStorage.getItem(THEME_KEY) === 'light') applyTheme('light'); }catch(e){}""",
                  """try{ const s = localStorage.getItem(THEME_KEY); if(s === 'light' || s === 'dark') applyTheme(s); }catch(e){}""")
    h = h.replace("""  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';""",
                  """  const isLight = document.documentElement.getAttribute('data-theme') === 'light' ||
    (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: light)').matches);
  const next = isLight ? 'dark' : 'light';""")
    h = h.replace('href="index.html"', 'href="mine.html"')   # index.html is reserved by the host
    (OUT / ("mine.html" if name == "index.html" else name)).write_text(h)
    print(name, len(h), "light-media" in h or "prefers-color-scheme: light" in h, "setAttribute('data-theme', t" in h)
