// Local web UI: pick a template, fill it in, preview live, render to MP4.
//   node server.mjs   ->  http://localhost:4320
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT, TEMPLATES, ASSETS, RENDERS, listTemplates, readTemplate, resolveVars, buildHtml, saveAsset, render } from "./lib/motion.mjs";

const PORT = Number(process.env.PORT) || 4320;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif", ".mp4": "video/mp4" };

// One render at a time; jobs live in memory.
const jobs = new Map();
let queue = Promise.resolve();

function startJob(body) {
  const id = Date.now().toString(36);
  const job = { id, template: body.template, format: body.format, status: "queued", log: [], started: null, file: null, error: null };
  jobs.set(id, job);
  queue = queue.then(async () => {
    job.status = "rendering";
    job.started = Date.now();
    try {
      const file = await render({ ...body, onLog: (l) => { job.log.push(l); if (job.log.length > 30) job.log.shift(); } });
      job.file = path.basename(file);
      job.status = "done";
    } catch (e) {
      job.error = e.message;
      job.status = "error";
    }
    job.seconds = Math.round((Date.now() - job.started) / 1000);
  });
  return job;
}

/** Template HTML for the browser: runtime shim for variables, plus a looping player. */
function previewHtml(id, values, format) {
  const tpl = readTemplate(id);
  const vars = resolveVars(tpl, values);
  const shim = `<base href="/t/"><script>window.__hyperframes={getVariables:()=>(${JSON.stringify(vars).replace(/</g, "\\u003c")})}</script>`;
  const player = `<script>addEventListener("load",()=>{const r=document.querySelector("[data-composition-id]");const d=+r.dataset.duration;const tls=Object.values(window.__timelines||{});const t0=performance.now();(function f(){const t=((performance.now()-t0)/1000)%d;tls.forEach(tl=>tl.seek(t,false));parent.postMessage({motionTime:t,duration:d},"*");requestAnimationFrame(f)})()})</script>`;
  return buildHtml(tpl, vars, format).replace(/<head>/i, "<head>" + shim).replace(/<\/body>/i, player + "</body>");
}

function sendFile(res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, "Not found");
  res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(res);
}

/** Resolves a URL path inside a directory, refusing anything that escapes it. */
function inside(dir, rel) {
  const file = path.resolve(dir, decodeURIComponent(rel));
  return file.startsWith(path.resolve(dir) + path.sep) ? file : null;
}

function send(res, code, body) {
  const json = typeof body !== "string";
  res.writeHead(code, { "content-type": json ? "application/json" : "text/plain; charset=utf-8" });
  res.end(json ? JSON.stringify(body) : body);
}

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => resolve(Buffer.concat(chunks)));
  req.on("error", reject);
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  try {
    if (p === "/") return sendFile(res, path.join(ROOT, "ui", "index.html"));
    if (p === "/api/templates") return send(res, 200, listTemplates().map(({ html, ...t }) => t));
    if (p.startsWith("/preview/")) {
      const values = url.searchParams.get("v") ? JSON.parse(url.searchParams.get("v")) : {};
      res.writeHead(200, { "content-type": TYPES[".html"], "cache-control": "no-store" });
      return res.end(previewHtml(p.slice(9), values, url.searchParams.get("f") || "landscape"));
    }
    if (p.startsWith("/t/assets/")) return sendFile(res, inside(ASSETS, p.slice(10)) || "");
    if (p.startsWith("/t/")) return sendFile(res, inside(TEMPLATES, p.slice(3)) || "");
    if (p.startsWith("/renders/")) return sendFile(res, inside(RENDERS, p.slice(9)) || "");
    if (p === "/api/upload" && req.method === "POST") {
      return send(res, 200, { path: saveAsset(req.headers["x-filename"] || "logo.png", await readBody(req)) });
    }
    if (p === "/api/render" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)).toString() || "{}");
      readTemplate(body.template); // validates the id
      return send(res, 200, startJob({ template: body.template, values: body.values || {}, format: body.format === "portrait" ? "portrait" : "landscape" }));
    }
    if (p.startsWith("/api/jobs/")) {
      const job = jobs.get(p.slice(10));
      return job ? send(res, 200, job) : send(res, 404, { error: "Unknown job" });
    }
    if (p === "/api/renders") {
      fs.mkdirSync(RENDERS, { recursive: true });
      const files = fs.readdirSync(RENDERS).filter((f) => f.endsWith(".mp4"))
        .map((f) => ({ file: f, mtime: fs.statSync(path.join(RENDERS, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime).slice(0, 24);
      return send(res, 200, files);
    }
    send(res, 404, "Not found");
  } catch (e) {
    send(res, 400, { error: e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`Arqen Motion: http://localhost:${PORT}`));
