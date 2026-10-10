# The Salt Road: source

`salt-road.html` at the repository root is the game, one self-contained page that plays offline. It is built from
the parts in `src/`. Edit the parts, not the page:

```
node tools/salt-road-build.mjs          # rebuild salt-road.html
node tools/salt-road-build.mjs --check  # CI: fails if salt-road.html and src/ disagree
```

The build joins the parts in name order and compiles the joined script, so a syntax error is reported with the
part and line it came from.

## How the parts fit

| Parts | What they are |
|---|---|
| `0000-head.html`, `0001-style.css`, `0002-body.html` | the page head, the stylesheet and the markup up to `<script>` |
| `0010-setup.js` … `0920-boot.js` | the game script, one section each, in the order they run |
| `9999-tail.html` | the closing tags |

The script sections are fragments of one function and share one scope. Later sections often extend earlier
ones by wrapping their functions, for example:

```js
const _victoryK = victory;
victory = function () { /* before */ _victoryK(); /* after */ };
```

So order matters. A section can use and wrap anything defined above it, and `0920-boot.js` runs last. Numbers go
up in tens, which leaves room between them. To add something, such as a new region, write a new part with a
number before `0910` and rebuild.

## Tests

The tests play the built page in headless Chromium through its test hooks (`window.__saltRoad`) and its real
buttons. They need Playwright (`npm i -D playwright && npx playwright install chromium`), or set `PLAYWRIGHT` to
where it is installed.

```
node salt-road/tests/run.mjs                 # every suite: battles scenes saves phone kessa deep comfort
node salt-road/tests/run.mjs saves kessa     # some of them
node salt-road/tests/balance.mjs             # boss win rates per chapter (N, DIFF, ONLY, PATCH: see the file)
```
