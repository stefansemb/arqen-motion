// Shared core: reads templates, builds a composition and renders it with HyperFrames.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATES = path.join(ROOT, "templates");
export const ASSETS = path.join(ROOT, "assets");
export const RENDERS = path.join(ROOT, "renders");
const HF_BIN = path.join(ROOT, "node_modules", "hyperframes", "bin", "hyperframes.mjs");

export const FORMATS = {
  landscape: { w: 1920, h: 1080 },
  portrait: { w: 1080, h: 1920 },
};

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/** All templates with their title and variable schema. */
export function listTemplates() {
  return fs.readdirSync(TEMPLATES)
    .filter((f) => f.endsWith(".html"))
    .map((f) => readTemplate(f.replace(/\.html$/, "")));
}

export function readTemplate(id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Okänd mall: ${id}`);
  const file = path.join(TEMPLATES, id + ".html");
  if (!fs.existsSync(file)) throw new Error(`Okänd mall: ${id}`);
  const html = fs.readFileSync(file, "utf8");
  const vars = html.match(/data-composition-variables='([^']*)'/);
  const title = html.match(/<title>([^<]*)<\/title>/);
  return { id, title: title ? title[1] : id, variables: vars ? JSON.parse(decode(vars[1])) : [], html };
}

/** Declared defaults merged with the given values, coerced to the declared types. */
export function resolveVars(tpl, values = {}) {
  const out = {};
  for (const d of tpl.variables) {
    const raw = values[d.id] ?? d.default;
    out[d.id] = d.type === "number" ? Number(raw) || 0 : String(raw ?? "");
  }
  return out;
}

/** Template HTML with size and duration filled in. outro: false holds the last frame instead of fading out. */
export function buildHtml(tpl, vars, format = "landscape", { outro = true } = {}) {
  const f = FORMATS[format] || FORMATS.landscape;
  const duration = Math.max(1, Math.min(60, Number(vars.duration) || 6));
  const html = tpl.html.replaceAll("{{W}}", f.w).replaceAll("{{H}}", f.h).replaceAll("{{DURATION}}", duration);
  return outro ? html : html.replace(/<head>/i, "<head><script>window.__motionNoOutro = true</script>");
}

/** Saves an uploaded image under assets/ and returns the path templates use ("assets/x.png"). */
export function saveAsset(name, buf) {
  const ext = (path.extname(name || "").toLowerCase().match(/^\.(png|jpe?g|webp|svg|gif)$/) || [".png"])[0];
  fs.mkdirSync(ASSETS, { recursive: true });
  const file = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}${ext}`;
  fs.writeFileSync(path.join(ASSETS, file), buf);
  return "assets/" + file;
}

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/**
 * Renders a template to MP4. Resolves with the output path.
 * onLog gets each output line from HyperFrames.
 */
export async function render({ template, values = {}, format = "landscape", outro = true, out, onLog = () => {} }) {
  const tpl = readTemplate(template);
  const vars = resolveVars(tpl, values);
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const work = path.join(RENDERS, ".work", id);
  fs.mkdirSync(work, { recursive: true });
  fs.cpSync(path.join(TEMPLATES, "_shared"), path.join(work, "_shared"), { recursive: true });
  fs.writeFileSync(path.join(work, "index.html"), buildHtml(tpl, vars, format, { outro }));
  // copy uploaded images the variables point at
  for (const val of Object.values(vars)) {
    if (typeof val === "string" && /^assets\/[\w.-]+$/.test(val) && fs.existsSync(path.join(ROOT, val))) {
      fs.mkdirSync(path.join(work, "assets"), { recursive: true });
      fs.copyFileSync(path.join(ROOT, val), path.join(work, val));
    }
  }
  const varsFile = path.join(work, "vars.json");
  fs.writeFileSync(varsFile, JSON.stringify(vars));

  const name = slug(vars.title || vars.label || vars.quote || vars.author) || "clip";
  const output = path.resolve(out || path.join(RENDERS, `${template}-${name}-${format === "portrait" ? "9x16" : "16x9"}-${id}.mp4`));
  fs.mkdirSync(path.dirname(output), { recursive: true });

  try {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [HF_BIN, "render", work, "-o", output, "--variables-file", varsFile, "--quality", "delivery"], {
        cwd: ROOT,
        env: { ...process.env, DO_NOT_TRACK: "1" }, // HyperFrames sends anonymous render telemetry otherwise
      });
      let tail = "";
      const onData = (d) => {
        for (const line of d.toString().split(/\r?\n/)) {
          const clean = line.replace(/\x1b\[[0-9;]*m/g, "").trim();
          if (clean) { onLog(clean); tail = (tail + "\n" + clean).slice(-2000); }
        }
      };
      child.stdout.on("data", onData);
      child.stderr.on("data", onData);
      child.on("error", reject);
      child.on("close", (code) => (code === 0 && fs.existsSync(output) ? resolve() : reject(new Error(`HyperFrames avslutade med kod ${code}\n${tail}`))));
    });
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
  return output;
}
