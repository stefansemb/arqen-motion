#!/usr/bin/env node
// CLI: render a template to MP4 without the UI.
//   node motion.mjs list
//   node motion.mjs <template> [values.json] [--set key=value ...] [--portrait] [-o out.mp4]
import fs from "node:fs";
import { listTemplates, readTemplate, render, saveAsset } from "./lib/motion.mjs";

const args = process.argv.slice(2);
const usage = `Användning:
  node motion.mjs list [--json]
  node motion.mjs <mall> [värden.json] [--set nyckel=värde ...] [--portrait | --size BxH] [--no-outro] [-o ut.mp4]

  --size      egen storlek, t.ex. 1080x730 (jämna tal)
  --no-outro  håller sista bilden i stället för att tona ut (när klippet klipps in i en video)

Exempel:
  node motion.mjs number --set value=40 --set prefix=$ --set suffix=B --set "label=raised in funding"
  node motion.mjs compare compare.json --portrait -o renders/jamforelse.mp4`;

if (!args.length || args[0] === "-h" || args[0] === "--help") {
  console.log(usage);
  process.exit(0);
}

if (args[0] === "list" && args[1] === "--json") {
  // For other apps (Arqen Studio): template ids, descriptions and fields, without the HTML.
  console.log(JSON.stringify(listTemplates().map(({ html, ...t }) => t), null, 2));
  process.exit(0);
}

if (args[0] === "list") {
  for (const t of listTemplates()) {
    console.log(`\n${t.id} — ${t.title}`);
    for (const v of t.variables) console.log(`  ${v.id.padEnd(10)} ${v.type.padEnd(7)} ${v.label}  [${JSON.stringify(v.default)}]`);
  }
  process.exit(0);
}

const template = args.shift();
let values = {};
let format = "landscape";
let outro = true;
let out;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--portrait") format = "portrait";
  else if (a === "--no-outro") outro = false;
  else if (a === "--size") format = args[++i];
  else if (a === "-o" || a === "--out") out = args[++i];
  else if (a === "--set") {
    const [k, ...rest] = args[++i].split("=");
    values[k] = rest.join("=").replace(/\\n/g, "\n");
  } else if (a.endsWith(".json")) values = { ...values, ...JSON.parse(fs.readFileSync(a, "utf8")) };
  else { console.error(`Okänt argument: ${a}\n\n${usage}`); process.exit(1); }
}

// image variables may be given as local file paths; copy them into assets/
for (const d of readTemplate(template).variables) {
  const v = values[d.id];
  if (d.ui === "image" && v && !v.startsWith("assets/") && fs.existsSync(v)) values[d.id] = saveAsset(v, fs.readFileSync(v));
}

const start = Date.now();
try {
  const file = await render({ template, values, format, outro, out, onLog: process.env.MOTION_VERBOSE ? (l) => console.error(l) : undefined });
  console.error(`Klar på ${((Date.now() - start) / 1000).toFixed(1)} s`);
  console.log(file);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
