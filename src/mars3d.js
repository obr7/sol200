// =====================================================================
//  MARS 3D — a real 3D globe of Mars textured with NASA Mars Trek imagery
//  (Viking MDIM 2.1 colour mosaic, streamed live from trek.nasa.gov tiles).
//  • A small hologram spins on the Control Room table.
//  • Using the table opens a big globe you can spin and explore.
//  If Trek can't be reached (offline), a painted Mars texture is used.
// =====================================================================
const TREK_TILES = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/";
const MARS_SITES = [
  { id: "olympus", name: "Olympus Mons", lat: 18.65, lon: -133.8, icon: "🌋", text: "The biggest volcano in the whole Solar System! It is about 22 km tall — around two and a half times taller than Mount Everest." },
  { id: "valles", name: "Valles Marineris", lat: -13.9, lon: -59.2, icon: "🏜️", text: "A giant canyon system more than 4,000 km long and up to 7 km deep. On Earth it would stretch across the whole United States." },
  { id: "gale", name: "Gale Crater", lat: -5.4, lon: 137.8, icon: "🤖", text: "NASA's Curiosity rover landed here in 2012. It has been climbing Mount Sharp, reading the layers of rock like pages of a history book." },
  { id: "jezero", name: "Jezero Crater", lat: 18.4, lon: 77.5, icon: "🚙", text: "Long ago this crater held a lake fed by a river. NASA's Perseverance rover landed here in 2021 and collects rock samples that may show signs of ancient life." },
  { id: "hellas", name: "Hellas Basin", lat: -42.4, lon: 70.5, icon: "☄️", text: "A huge hole made by an ancient impact, about 2,300 km wide. It is the lowest place on Mars, so the air pressure is highest here." },
  { id: "pole", name: "North Polar Cap", lat: 84, lon: 0, icon: "🧊", text: "A thick cap of water ice. In winter, carbon-dioxide frost (dry ice) adds an extra layer on top. Water ice is a key resource for future explorers." },
];

const MarsTex = {
  levels: {}, // level -> {w,h,data:Uint8ClampedArray, real:bool}
  loading: {},
  fallback: null,
  get(level) { return this.levels[level] || this.levels[0] || this.fallbackTex(); },
  isReal() { return !!(this.levels[1] || this.levels[0]); },
  load(level) {
    if (this.levels[level] || this.loading[level]) return this.loading[level];
    const rows = 1 << level, cols = rows * 2, S = 256;
    const cv = mkCanvas(cols * S, rows * S), g = cv.getContext("2d");
    const jobs = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) jobs.push(new Promise((res, rej) => {
      const im = new Image(); im.crossOrigin = "anonymous";
      im.onload = () => { g.drawImage(im, c * S, r * S, S, S); res(); }; im.onerror = rej;
      im.src = `${TREK_TILES}${level}/${r}/${c}.jpg`;
    }));
    this.loading[level] = Promise.all(jobs).then(() => {
      const d = g.getImageData(0, 0, cv.width, cv.height).data;
      this.levels[level] = { w: cv.width, h: cv.height, data: d, real: true };
      return true;
    }).catch(() => false);
    return this.loading[level];
  },
  fallbackTex() {
    if (this.fallback) return this.fallback;
    const w = 256, h = 128, d = new Uint8ClampedArray(w * h * 4);
    const rnd = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = rnd(xi % 64, yi), b = rnd((xi + 1) % 64, yi), c = rnd(xi % 64, yi + 1), e = rnd((xi + 1) % 64, yi + 1); const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let n = 0, f = 1 / 16, amp = 0.5; for (let o = 0; o < 4; o++) { n += noise(x * f * 4 / 4, y * f * 4 / 4) * amp; f *= 2; amp *= 0.5; }
      const lat = 90 - (y / h) * 180, dark = n > 0.55 ? (n - 0.55) * 2.2 : 0;
      let R = 196 - dark * 90 + n * 30, G = 110 - dark * 50 + n * 18, B = 70 - dark * 25 + n * 10;
      if (Math.abs(lat) > 78 - n * 6) { R = 235; G = 225; B = 220; }
      const i = (y * w + x) * 4; d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = 255;
    }
    this.fallback = { w, h, data: d, real: false };
    return this.fallback;
  },
};

// precomputed sphere tables per (size, tilt)
const _sphereCache = {};
function sphereTable(S, tilt) {
  const key = S + ":" + tilt.toFixed(3);
  if (_sphereCache[key]) return _sphereCache[key];
  const n = S * S, lat = new Float32Array(n), lon = new Float32Array(n), shade = new Float32Array(n), inside = new Uint8Array(n), rim = new Float32Array(n);
  const cT = Math.cos(tilt), sT = Math.sin(tilt), L = [-0.55, 0.5, 0.67];
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const u = (px + 0.5) / S * 2 - 1, v = (py + 0.5) / S * 2 - 1, r2 = u * u + v * v, i = py * S + px;
    if (r2 > 1) continue;
    inside[i] = 1;
    const z = Math.sqrt(1 - r2), y = -v;
    const yw = y * cT + z * sT, zw = -y * sT + z * cT;
    lat[i] = Math.asin(Math.max(-1, Math.min(1, yw))); lon[i] = Math.atan2(u, zw);
    const dot = u * L[0] + y * L[1] + z * L[2];
    shade[i] = 0.32 + 0.85 * Math.max(0, dot);
    rim[i] = Math.pow(1 - z, 3);
  }
  return (_sphereCache[key] = { lat, lon, shade, inside, rim });
}
// draw the globe into an ImageData. holo: tint hologram cyan + scanlines
function renderMars(img, S, centerLon, tilt, tex, holo, t) {
  const T = sphereTable(S, tilt), d = img.data, td = tex.data, tw = tex.w, th = tex.h;
  const TAU = Math.PI * 2;
  for (let i = 0, n = S * S; i < n; i++) {
    const o = i * 4;
    if (!T.inside[i]) { d[o + 3] = 0; continue; }
    let lo = T.lon[i] + centerLon; lo = ((lo + Math.PI) % TAU + TAU) % TAU;
    const tx = Math.min(tw - 1, (lo / TAU * tw) | 0), ty = Math.min(th - 1, ((0.5 - T.lat[i] / Math.PI) * th) | 0);
    const ti = (ty * tw + tx) * 4, sh = T.shade[i];
    let r = td[ti] * sh, g = td[ti + 1] * sh, b = td[ti + 2] * sh;
    const rm = T.rim[i]; r += rm * 255 * 0.55; g += rm * 150 * 0.55; b += rm * 110 * 0.55; // thin dusty atmosphere
    if (holo) {
      const row = (i / S) | 0, scan = (row + ((t * 20) | 0)) % 3 === 0 ? 0.7 : 1;
      r = (r * 0.75 + 30) * scan; g = (g * 0.75 + 70) * scan; b = (b * 0.75 + 90) * scan;
      d[o + 3] = 225;
    } else d[o + 3] = 255;
    d[o] = r; d[o + 1] = g; d[o + 2] = b;
  }
}
function projectSite(s, centerLon, tilt) {
  const la = s.lat * Math.PI / 180, dl = s.lon * Math.PI / 180 - centerLon;
  const x = Math.cos(la) * Math.sin(dl), y = Math.sin(la), z = Math.cos(la) * Math.cos(dl);
  const yv = y * Math.cos(tilt) - z * Math.sin(tilt), zv = y * Math.sin(tilt) + z * Math.cos(tilt);
  return { u: x, v: -yv, vis: zv > 0.05, z: zv };
}

// ---------------------------------------------------------------- hologram on the table
let _holoCv, _holoImg, _holoG;
function drawHoloMars(g, p, t) {
  const S = 28;
  if (!_holoCv) { _holoCv = mkCanvas(S, S); _holoG = _holoCv.getContext("2d"); _holoImg = _holoG.createImageData(S, S); MarsTex.load(0); }
  renderMars(_holoImg, S, t * 0.5, 0.35, MarsTex.get(0), true, t);
  _holoG.putImageData(_holoImg, 0, 0);
  const cx = Math.round(p.x + p.pw / 2), base = Math.round(p.y + 6), bob = Math.round(Math.sin(t * 1.8) * 1.5);
  const top = base - 40 + bob;
  // light cone from the emitter
  g.save(); g.globalCompositeOperation = "lighter";
  const gr = g.createLinearGradient(0, base, 0, top);
  gr.addColorStop(0, "rgba(90,220,255,0.45)"); gr.addColorStop(1, "rgba(90,220,255,0.04)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 6, base); g.lineTo(cx + 6, base); g.lineTo(cx + 17, top + 18); g.lineTo(cx - 17, top + 18); g.fill();
  // orbit ring (back half)
  g.strokeStyle = "rgba(120,230,255,0.35)"; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, top + 14, 19, 5, 0, Math.PI, Math.PI * 2); g.stroke();
  g.restore();
  g.drawImage(_holoCv, cx - S / 2, top);
  g.save(); g.globalCompositeOperation = "lighter";
  g.strokeStyle = "rgba(120,230,255,0.6)"; g.beginPath(); g.ellipse(cx, top + 14, 19, 5, 0, 0, Math.PI); g.stroke();
  const a = t * 1.3; g.fillStyle = "#c8f6ff"; g.fillRect(Math.round(cx + Math.cos(a) * 19), Math.round(top + 14 + Math.sin(a) * 5), 2, 1); // little moon (Phobos)
  if (((t * 3) | 0) % 7 === 0) { g.fillStyle = "rgba(160,240,255,0.25)"; g.fillRect(cx - 14, top + ((t * 60) % S), S, 1); } // glitch line
  g.restore();
  glow(cx, top + 14, 34, "#40d0ff", 0.28);
}

// ---------------------------------------------------------------- the big interactive globe
const MarsGlobe = {
  open() {
    Sound.play("power");
    const html = `<div class="head"><div><h3>HOLO-TABLE · NASA MARS TREK DATA</h3><h1>🔴 Explore Mars in 3D</h1></div></div>
      <div class="globeWrap"><div class="globeView"><canvas class="globeCv" width="240" height="240"></canvas><div class="globeHint">🖐️ Drag to spin · tap a pin</div><div class="globeSrc"></div></div>
      <div class="globeSide"><div class="siteList">${MARS_SITES.map((s) => `<button class="siteBtn" data-id="${s.id}">${s.icon} ${s.name}</button>`).join("")}</div>
      <div class="siteInfo"><b>Pick a place on Mars!</b><br>This globe uses real pictures of Mars taken by NASA's Viking orbiters, from NASA Mars Trek.</div></div></div>
      ${UI.srcHtml(["marsTrek"])}`;
    return UI.card(html, [{ id: "trek", label: "Open NASA Mars Trek ↗", cls: "alt" }, { id: "map", label: "🗺️ Base map", cls: "alt" }, { id: "ok", label: "Close", cls: "go" }], {
      cls: "dark wide globeCard", closable: true, onMount: (card, done) => {
        const cv = card.querySelector(".globeCv"), g = cv.getContext("2d"), S = 240, img = g.createImageData(S, S);
        const info = card.querySelector(".siteInfo"), src = card.querySelector(".globeSrc");
        const st = { lon: 0.6, tilt: 0.25, vlon: 0.18, drag: null, goal: null, sel: null, t: 0, alive: true };
        let tex = MarsTex.get(1);
        src.textContent = MarsTex.isReal() ? "" : "Loading NASA imagery…";
        MarsTex.load(1).then((ok) => { if (ok) tex = MarsTex.get(1); src.textContent = ok ? "" : "Offline — showing a painted Mars"; });
        const select = (id) => {
          const s = MARS_SITES.find((x) => x.id === id); if (!s) return;
          st.sel = s; st.goal = { lon: s.lon * Math.PI / 180, tilt: Math.max(-0.9, Math.min(0.9, s.lat * Math.PI / 180 * 0.8)) };
          card.querySelectorAll(".siteBtn").forEach((b) => b.classList.toggle("on", b.dataset.id === id));
          info.innerHTML = `<b>${s.icon} ${s.name}</b><br>${s.text}<br><span class="coord">${Math.abs(s.lat).toFixed(1)}°${s.lat >= 0 ? "N" : "S"}, ${Math.abs(s.lon).toFixed(1)}°${s.lon >= 0 ? "E" : "W"}</span>`;
          Sound.play("click");
          if (!G.flags) G.flags = {}; G.flags["site_" + id] = true;
        };
        card.querySelectorAll(".siteBtn").forEach((b) => b.addEventListener("click", () => select(b.dataset.id)));
        const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * S, y: (e.clientY - r.top) / r.height * S }; };
        cv.addEventListener("pointerdown", (e) => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} const p = pos(e); st.drag = { x: p.x, y: p.y, lon: st.lon, tilt: st.tilt, moved: 0, lx: p.x, t: performance.now() }; st.goal = null; });
        cv.addEventListener("pointermove", (e) => { if (!st.drag) return; const p = pos(e), D = st.drag; D.moved += Math.abs(p.x - D.lx); const now = performance.now(); st.vlon = -(p.x - D.lx) / (S / 2) / Math.max(0.016, (now - D.t) / 1000) * 0.6; D.lx = p.x; D.t = now; st.lon = D.lon - (p.x - D.x) / (S / 2) * 1.4; st.tilt = Math.max(-1.1, Math.min(1.1, D.tilt + (p.y - D.y) / (S / 2) * 1.2)); });
        cv.addEventListener("pointerup", (e) => {
          const D = st.drag; st.drag = null; if (!D) return;
          if (D.moved < 4) { const p = pos(e); let best = null, bd = 14; for (const s of MARS_SITES) { const q = projectSite(s, st.lon, st.tilt); if (!q.vis) continue; const dx = (q.u + 1) * S / 2 - p.x, dy = (q.v + 1) * S / 2 - p.y, dd = Math.hypot(dx, dy); if (dd < bd) { bd = dd; best = s; } } if (best) select(best.id); }
          st.vlon = Math.max(-3, Math.min(3, st.vlon));
        });
        let last = performance.now();
        const loop = (now) => {
          if (!st.alive || !document.body.contains(cv)) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now; st.t += dt;
          if (st.goal) { let dl = st.goal.lon - st.lon; dl = Math.atan2(Math.sin(dl), Math.cos(dl)); st.lon += dl * Math.min(1, dt * 4); st.tilt += (st.goal.tilt - st.tilt) * Math.min(1, dt * 4); st.vlon = 0; }
          else if (!st.drag) { st.lon += st.vlon * dt; st.vlon += (0.18 - st.vlon) * Math.min(1, dt * 1.2); }
          renderMars(img, S, st.lon, st.tilt, tex, false, st.t);
          g.clearRect(0, 0, S, S); g.putImageData(img, 0, 0);
          // pins
          for (const s of MARS_SITES) {
            const q = projectSite(s, st.lon, st.tilt); if (!q.vis) continue;
            const x = Math.round((q.u + 1) * S / 2), y = Math.round((q.v + 1) * S / 2), on = st.sel === s, pul = on ? 2 + Math.sin(st.t * 6) * 1.5 : 0;
            g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(x - 3, y - 2, 7, 6);
            g.fillStyle = on ? "#ffd34a" : "#ffffff"; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = on ? "#ff7a2a" : "#40d0ff"; g.fillRect(x - 1, y - 1, 3, 3);
            if (on) { g.strokeStyle = "rgba(255,211,74,0.8)"; g.lineWidth = 1; g.strokeRect(x - 4 - pul, y - 4 - pul, 9 + pul * 2, 9 + pul * 2); }
            if (q.z > 0.35) { g.font = "8px monospace"; g.fillStyle = "rgba(0,0,0,0.6)"; const w = g.measureText(s.name).width; g.fillRect(x + 5, y - 4, w + 4, 9); g.fillStyle = on ? "#ffd34a" : "#e8f6ff"; g.fillText(s.name, x + 7, y + 3); }
          }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },
    }).then(async (r) => { if (r === "trek") window.open("https://trek.nasa.gov/mars/", "_blank", "noopener"); if (r === "map") await UI.map(); return r; });
  },
};
