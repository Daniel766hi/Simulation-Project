#!/usr/bin/env node
// Builds salt-road.html from the parts in salt-road/src, in name order.
//
//   node tools/salt-road-build.mjs          write salt-road.html
//   node tools/salt-road-build.mjs --check  fail if salt-road.html is not what the parts build
//
// The page stays one self-contained file (it plays offline and needs no server), so the sources are plain
// fragments: the page head, the stylesheet, the body markup, then the game script section by section, then the
// closing tags. The script sections share one scope and run in order, and many of them extend functions defined
// in earlier ones, so their order matters. The build also compiles the joined script to catch syntax errors.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "salt-road", "src"), out = join(root, "salt-road.html");
const files = readdirSync(srcDir).filter(f => /^\d{4}-[a-z0-9-]+\.(html|css|js)$/.test(f)).sort();
const html = files.map(f => readFileSync(join(srcDir, f), "utf8")).join("");

const script = html.slice(html.indexOf("<script>") + "<script>".length, html.lastIndexOf("</script>"));
try { new vm.Script(script, { filename: "salt-road.html <script>" }); }
catch (e) {
  // point at the source part the error came from
  const line = Number((e.stack.match(/salt-road\.html <script>:(\d+)/) || [])[1]) || 0, before = html.slice(0, html.indexOf("<script>")).split("\n").length - 1;
  let at = 0, where = "";
  for (const f of files) { const n = readFileSync(join(srcDir, f), "utf8").split("\n").length - 1; if (line + before <= at + n) { where = `${f}:${line + before - at}`; break; } at += n; }
  console.error(`salt-road: syntax error${where ? ` in ${where}` : ""}: ${e.message}`);
  process.exit(1);
}

if (process.argv.includes("--check")) {
  const current = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (current !== html) { console.error("salt-road.html is out of date with salt-road/src. Run: node tools/salt-road-build.mjs"); process.exit(1); }
  console.log(`salt-road.html matches salt-road/src (${files.length} parts, ${(html.length / 1048576).toFixed(2)} MB).`);
} else {
  writeFileSync(out, html);
  console.log(`built salt-road.html from ${files.length} parts (${(html.length / 1048576).toFixed(2)} MB).`);
}
