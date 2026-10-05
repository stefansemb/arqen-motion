// Shared helpers, loaded by every template after its markup. Exposes window.M.
(function () {
  const root = document.querySelector("[data-composition-id]");
  const W = +root.dataset.width;
  const H = +root.dataset.height;
  const v = window.__hyperframes.getVariables();

  root.style.width = W + "px";
  root.style.height = H + "px";
  root.style.setProperty("--u", Math.min(W, H) / 100 + "px");
  if (H > W) root.classList.add("portrait");
  if (v.accent) root.style.setProperty("--accent", v.accent);
  if (v.accent2) root.style.setProperty("--accent2", v.accent2);

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  window.M = {
    root, W, H, v,
    dur: +root.dataset.duration,
    portrait: H > W,
    esc,
    /** Escaped text where *word* is highlighted in the accent color. */
    rich: (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>"),
    /** Non-empty trimmed lines of a multiline variable. */
    lines: (s) => String(s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
    /** "a | b | c" -> ["a", "b", "c"] */
    cells: (line) => line.split("|").map((x) => x.trim()),
    /** Fills el with one span per word (class "w"), keeping *highlight* markers. */
    words(el, s) {
      let on = false;
      el.innerHTML = String(s || "").trim().split(/\s+/).map((t) => {
        if (t.startsWith("*")) { on = true; t = t.slice(1); }
        const close = t.endsWith("*");
        if (close) t = t.slice(0, -1);
        const hl = on;
        if (close) on = false;
        return `<span class="w${hl ? " hl" : ""}" style="display:inline-block">${esc(t)}</span>`;
      }).join(" ");
      return el.querySelectorAll(".w");
    },
    /** Shrinks the font until the element is no wider than maxW (and no taller than maxH). */
    fit(el, maxW, maxH = Infinity) {
      let fs = parseFloat(getComputedStyle(el).fontSize);
      for (let i = 0; i < 80 && (el.scrollWidth > maxW || el.scrollHeight > maxH); i++) {
        fs *= 0.95;
        el.style.fontSize = fs + "px";
      }
    },
    /** Parses "1M", "$15", "82%", "1,200" to a number, or null. */
    num(s) {
      const m = String(s).replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*([kmbt])?/i);
      if (!m) return null;
      const mult = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }[(m[2] || "").toLowerCase()] || 1;
      return parseFloat(m[1]) * mult;
    },
    /**
     * Draws an SVG path on the timeline from t over d seconds, with an optional dot riding its tip.
     * Uses one proxy tween, so seeking to any frame gives the same picture.
     */
    draw(tl, path, t, d, dot) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      const place = (p) => {
        path.style.strokeDashoffset = len * (1 - p);
        if (dot) {
          const pt = path.getPointAtLength(len * p);
          dot.setAttribute("cx", pt.x);
          dot.setAttribute("cy", pt.y);
          dot.style.opacity = p > 0 ? 1 : 0;
        }
      };
      place(0);
      const o = { p: 0 };
      tl.to(o, { p: 1, duration: d, ease: "power2.inOut", onUpdate: () => place(o.p) }, t);
    },
    /**
     * Times (seconds) at which each of n items should appear, from the optional "cues" variable
     * ("1.2,2.5,4"), e.g. when the narration names them; null when absent or the count differs.
     */
    cues(n) {
      const c = String(v.cues || "").split(",").map((x) => parseFloat(x)).filter((x) => Number.isFinite(x));
      return c.length === n && n > 0 ? c : null;
    },
    /** A paused timeline registered for the runtime. */
    timeline() {
      const tl = gsap.timeline({ paused: true });
      window.__timelines = window.__timelines || {};
      window.__timelines[root.dataset.compositionId] = tl;
      return tl;
    },
    /** Fades in the source line, fades content out at the end (unless rendered with --no-outro) and pins the length. */
    finish(tl) {
      const src = root.querySelector(".source");
      if (src && v.source) {
        src.textContent = "Source: " + v.source;
        tl.from(src, { opacity: 0, duration: 0.5 }, 0.8);
      }
      if (!window.__motionNoOutro) {
        const out = root.querySelectorAll(".stage, .title, .source");
        tl.to(out, { opacity: 0, duration: 0.45, ease: "power1.in" }, M.dur - 0.45);
      }
      tl.set({}, {}, M.dur);
    },
  };
})();
