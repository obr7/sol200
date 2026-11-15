// =====================================================================
//  INTRO — timeline-driven cinematic (script-01-intro.md v2).
//  One master clock (Web Audio time). Each shot is a function that
//  draws itself at script time s. Narration files (if present) set the
//  real line lengths and the following shots shift to match.
// =====================================================================
const Intro = {
  out: null, og: null, B: null, bg: null, tmp: null,
  running: false, s: 0, last: 0, cues: [], narr: {}, shot: null, debug: false, dissolve: 0,
  pools: null,

  init() {
    this.out = mkCanvas(IW, IH); this.og = this.out.getContext("2d");
    this.B = mkCanvas(IW * 2, IH * 2); this.bg = this.B.getContext("2d");
    this.tmp = mkCanvas(IW, IH);
    this.pools = { smoke: new Pool(260), dust: new Pool(260), spark: new Pool(160), birds: new Pool(24), streak: new Pool(120), fx: new Pool(120) };
    this.debug = /[?&]debug=1/.test(location.search);
    this.planetCache = {};
    this.footprints = [];
  },

  // ------------------------------------------------------------ clock
  // Master clock = Web Audio time. Script time s = real seconds / PACE.
  now() { const c = Sound.ctx; return c && c.state === "running" ? c.currentTime : performance.now() / 1000; },
  get pace() { return INTRO_TIMING.PACE || 1; },

  // Narration plan in REAL seconds from the intro start. n1..n4a at their anchors (x PACE);
  // n4b = n4a end + gap, n4c = n4b end + gap. "end" = when the voice stops (trailing silence excluded).
  planNarration() {
    const N = INTRO_TIMING.narration, M = CONFIG.NARRATION_META || {}, P = this.pace, gaps = INTRO_TIMING.N4_GAPS || [0.8, 0.8];
    const plan = {};
    for (const k of ["N1", "N2", "N3", "N4A", "N4B", "N4C"]) {
      const n = N[k], f = this.narr[k] || {}, meta = M[k] || {};
      const dur = f.buf ? f.buf.duration : null;
      const lead = f.buf ? (meta.lead ?? 0) : 0, trail = f.buf ? (meta.trail ?? 0) : 0;
      const skip = lead > 0.15 ? lead : 0;            // trim leading silence at playback
      const voiceLen = f.buf ? dur - skip - trail : n.est; // how long the voice is heard
      let start;
      if (n.after) start = plan[n.after].end + gaps[n.after === "N4A" ? 0 : 1];
      else start = n.at * P - (lead > 0.15 ? 0 : lead); // voice starts on the anchor
      plan[k] = { k, start, end: start + voiceLen, skip, buf: f.buf || null, text: n.text, voiceLen };
    }
    this.plan = plan;
    // beats tied to the narration (converted to script seconds)
    const T = INTRO_TIMING, s = (w) => w / P;
    const Bt = Object.assign({}, T.beats);
    Bt.atDoor = s(plan.N4A.start);
    Bt.insideCut = Math.max(52.8, Math.min(56, s(plan.N4B.start - 0.8)));
    Bt.damonLook = Bt.insideCut + 1.0;
    Bt.starTouch = Math.max(Bt.damonLook + 1.3, s(plan.N4C.start));
    Bt.breath = Bt.starTouch + 1.5;
    const ft = s(plan.N4C.end) + T.finalWait;
    Bt.finalText = [ft, ft + T.finalType];
    Bt.dissolve = ft + T.finalType + T.finalHold;
    this.Bt = Bt;
    this.shots = T.shots.map((x) => ({ ...x }));
    this.shots[this.shots.length - 1].end = Bt.dissolve + T.dissolveLen;
    this.endT = this.shots[this.shots.length - 1].end;
  },

  // ------------------------------------------------------------ click-to-start
  showStart() {
    UI.clear(); Game.mode = "title"; Scenes.setShot("title"); $("#hud").classList.add("off");
    const d = el("div"); d.id = "title";
    d.innerHTML = `<div class="clickstart">
      <div class="gtitle">${CONFIG.GAME_TITLE}</div>
      <div class="gsub">${CONFIG.SUBTITLE.toUpperCase()}</div>
      <p class="solnote"><b>What is a sol?</b> A day on Mars is called a <b>sol</b>. Mars spins a little slower than Earth, so one sol is about <b>24 hours and 40 minutes</b> — about 40 minutes longer than a day on Earth. Astronauts say “sol” so they never mix up Mars days and Earth days. Our story starts on the crew’s <b>200th sol</b> on Mars!</p>
      <button class="btn go" id="tStart">▶ Start</button>
      <p class="cs-hint">🎧 Best with sound on</p>
      <div><button class="btn alt" id="tFull">⛶ Full screen</button><button class="btn alt" id="tSet">⚙️ Settings</button><button class="btn alt" id="tSrc">🛰️ NASA Data</button></div></div>
      <small>A game about the real trade-offs of living on Mars · NASA Space Apps Challenge 2026 · Uses live space-weather data from NASA DONKI</small>`;
    UI.root.appendChild(d);
    d.querySelector("#tStart").onclick = async () => { Sound.init(); if (document.body.classList.contains("touch")) Game.fullscreen(true); d.querySelector("#tStart").textContent = "Loading…"; await this.start(); };
    d.querySelector("#tFull").onclick = () => Game.fullscreen();
    d.querySelector("#tSet").onclick = () => { Sound.init(); UI.settings(); };
    d.querySelector("#tSrc").onclick = () => { Sound.init(); UI.credits(); };
  },

  async loadAudio() {
    const files = CONFIG.NARRATION_FILES || {}, ctx = Sound.ctx;
    const narr = Promise.all(["N1", "N2", "N3", "N4A", "N4B", "N4C"].map(async (k) => {
      this.narr[k] = {};
      const url = files[k]; if (!url || !ctx) return;
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 5000);
        const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
        if (!r.ok) throw 0;
        this.narr[k] = { buf: await ctx.decodeAudioData(await r.arrayBuffer()) };
      } catch (e) { this.narr[k] = {}; }
    }));
    await Promise.all([narr, Sound.loadFiles(CONFIG.SFX_FILES, 5000), Sound.loadFiles(CONFIG.INTRO_MUSIC_FILES, 6000)]);
  },

  async start(fromShot) {
    if (!this.out) this.init();
    SpaceWeather.load(); // never blocks the intro
    await this.loadAudio();
    this.planNarration();
    UI.clear();
    const sub = el("div"); sub.id = "isub"; sub.className = "hidden"; UI.root.appendChild(sub);
    this.subEl = sub;
    const sk = el("button", "", "Skip ⏭"); sk.id = "iskip"; sk.onclick = (e) => { e.stopPropagation(); this.skip(); }; UI.root.appendChild(sk); this.skipEl = sk;
    if (this.debug) { const d = el("div"); d.id = "idebug"; UI.root.appendChild(d); this.dbgEl = d; }
    const q = location.search.match(/[?&]intro=([\d.]+)/);
    const jump = fromShot ?? (q ? parseFloat(q[1]) : null);
    let s0 = 0;
    if (jump) { const sh = this.shots.find((x) => x.n === jump) || this.shots.find((x) => x.id === jump); if (sh) s0 = sh.start; }
    this.w0 = this.now() - s0 * this.pace;
    this.s = s0; this.prevS = s0 - 0.001;
    this.buildCues(s0);
    for (const p of Object.values(this.pools)) p.clear();
    this.footprints = []; this.handedOff = false; this.shot = null;
    Sound.stopLoop("hum"); Sound.setMood(null); if (this.music) { this.music.h.stop(0.1); this.music = null; }
    Game.mode = "intro"; this.running = true;
    this.log = []; this.playing = null;
  },

  // ------------------------------------------------------------ cues (sound + music); narration runs on real time
  buildCues(s0) {
    const B = this.Bt, C = [], rec = (k) => Sound.hasFile(k);
    const at = (s, fn) => C.push({ s, fn });
    // shot 1
    at(0, () => { Sound.startLoop("alarm"); Sound.startLoop("hum"); if (rec("argument")) Sound.play("argument"); });
    at(B.argFreeze, () => { Sound.play("thud"); });
    at(B.argBlack + B.alarmTail, () => { Sound.stopLoop("alarm"); Sound.stopLoop("hum"); });
    // title
    at(B.titleIn, () => { Sound.play("whoosh"); Sound.play("glint"); });
    // ceremony
    at(8.0, () => { if (rec("applause")) Sound.playFile("applause", { fade: 0.4 }); else Sound.play("applause", 2.2); });
    if (!rec("applause")) at(9.2, () => Sound.play("applause", 1.2));
    at(B.cerPin, () => { Sound.play("pin"); Sound.play("glint"); Sound.play("flash"); if (!rec("applause")) Sound.play("applause", 1.6); });
    at(B.cerPin + 0.25, () => Sound.play("flash"));
    at(B.cerBreak, () => { if (!rec("applause")) Sound.play("applause", 1.2); });
    at(B.cerFlash, () => Sound.play("flash"));
    // launch
    at(17.0, () => { Sound.startLoop("steam"); });
    at(B.ignition - 0.3, () => { if (rec("launch")) { Sound.stopLoop("steam"); Sound.play("launch"); } });
    at(B.ignition, () => { Sound.stopLoop("steam"); Sound.play("birds"); if (!rec("launch")) { Sound.play("ignition"); Sound.play("rumble", 6); Sound.startLoop("crackle"); } });
    at(B.separation, () => { Sound.play("separation"); Sound.stopLoop("crackle", true); });
    // space
    at(27.0, () => { Sound.startLoop("engine"); });
    at(B.windowCut[0], () => Sound.play("whoosh"));
    at(B.matchCut, () => Sound.play("whoosh"));
    // mars
    at(33.0, () => { Sound.stopLoop("engine"); });
    at(B.retro, () => Sound.play("retro"));
    at(B.entry, () => Sound.play("entry"));
    at(B.touchdown, () => { Sound.play("thud"); Sound.play("rumble", 1.5); });
    at(B.dustWipe, () => Sound.play("whoosh"));
    // arrival
    at(41.0, () => { Sound.startLoop("wind"); });
    at(B.camSlide, () => { if (rec("storm")) Sound.startLoop("storm"); else Sound.play("rumble", 3); });
    at(B.doorOpen, () => Sound.play("airlock"));
    // control room
    at(52.0, () => { Sound.stopLoop("wind"); Sound.stopLoop("storm"); });
    at(B.insideCut, () => { Sound.startLoop("hum"); });
    at(B.dissolve, () => Sound.play("whoosh"));
    // per-shot music tracks (second audio channel)
    for (const [k, m] of Object.entries(CONFIG.INTRO_MUSIC_META || {})) { const sh = this.shots.find((x) => x.id === m.shot); if (sh) at(sh.start, () => this.playMusic(k)); }
    this.cues = C.filter((c) => c.s >= s0).sort((a, b) => a.s - b.s);
    this.narrCues = Object.values(this.plan).filter((p) => p.start >= s0 * this.pace - 0.01).map((p) => ({ p, started: false, ended: false }));
  },
  playMusic(k) {
    if (this.music) { this.music.h.stop(0.25); this.music = null; }
    const m = (CONFIG.INTRO_MUSIC_META || {})[k] || {};
    const h = Sound.playFile(k, { bus: Sound.musicBus, vol: (m.gain || 1) * 1.6 });
    this.log.push(`${k} ${h ? "start" : "MISSING (silence)"} @ ${this.s.toFixed(2)}`);
    if (h) { this.music = { k, h }; h.src.onended = () => { if (this.music && this.music.h === h) this.music = null; }; }
  },
  runCues() {
    for (const c of this.cues) if (!c.done && this.s >= c.s) { c.done = true; try { c.fn(); } catch (e) {} }
    const w = this.now() - this.w0;
    for (const n of this.narrCues) {
      const N = n.p;
      if (!n.started && w >= N.start) {
        n.started = true; Sound.duck(true); this.playing = N.k;
        if (N.buf && !Sound.settings.muted) { const src = Sound.ctx.createBufferSource(); src.buffer = N.buf; const g = Sound.ctx.createGain(); g.gain.value = 1.0; src.connect(g).connect(Sound.ctx.destination); src.start(0, N.skip); n.src = src; }
        else Sound.speak(Array.isArray(N.text) ? N.text.join(" ") : N.text);
        this.log.push(`${N.k} start @ ${(w / this.pace).toFixed(2)} (real ${w.toFixed(2)})${N.buf ? " file" : " speech"}`);
      }
      if (n.started && !n.ended) {
        // subtitle: one strip per file; n4a shows its two sentences one after the other (timed by length)
        let txt = N.text;
        if (Array.isArray(txt)) { const tot = txt.reduce((a, b) => a + b.length, 0); const k = (w - N.start) / (N.end - N.start); let acc = 0, pick = txt[txt.length - 1]; for (const part of txt) { acc += part.length / tot; if (k < acc) { pick = part; break; } } txt = pick; }
        if (this.subEl.textContent !== txt) { this.subEl.textContent = txt; this.subEl.classList.remove("hidden"); }
      }
      if (n.started && !n.ended && w >= N.end + 0.6) {
        n.ended = true; this.log.push(`${N.k} end @ ${(w / this.pace).toFixed(2)} (real ${w.toFixed(2)})`);
        const next = this.narrCues.find((x) => x.started && !x.ended);
        if (!next) { Sound.duck(false); this.subEl.classList.add("hidden"); this.playing = null; }
      }
    }
  },

  // ------------------------------------------------------------ per-frame
  frame(dt, t) {
    if (!this.running) return;
    let w = this.now() - this.w0;
    if (this.holdAt != null && w / this.pace >= this.holdAt) { const want = this.holdAt * this.pace; this.w0 += w - want; w = want; }
    this.s = w / this.pace;
    this.runCues();
    const sh = this.shots.find((x) => this.s >= x.start && this.s < x.end) || this.shots[this.shots.length - 1];
    if (sh !== this.shot) { this.shot = sh; this.log.push(`shot ${sh.id} @ ${this.s.toFixed(2)}`); for (const p of Object.values(this.pools)) p.clear(); }
    const sdt = dt / this.pace;
    for (const p of Object.values(this.pools)) p.update(sdt);
    const g = this.og; g.imageSmoothingEnabled = false;
    g.fillStyle = "#000"; g.fillRect(0, 0, IW, IH);
    const fn = this["shot_" + sh.id];
    const ls = this.s - sh.start;
    if (fn) fn.call(this, g, this.s, ls, sdt, t);
    if (this.debug) this.drawDebug(g);
    if (this.s >= this.Bt.dissolve && !this.handedOff) { this.handedOff = true; Story.setup(); }
    if (this.s >= this.endT) this.finish();
    this.prevS = this.s;
  },
  skip() {
    if (!this.running || this.skipping) return;
    this.skipping = true; Sound.play("click");
    for (const n of this.narrCues || []) { if (n.src) try { n.src.stop(); } catch (e) {} n.started = n.ended = true; }
    try { speechSynthesis.cancel(); } catch (e) {}
    ["alarm", "hum", "steam", "engine", "wind", "storm", "crackle"].forEach((k) => Sound.stopLoop(k));
    this.finish();
  },
  finish() {
    if (!this.running) return;
    this.running = false; if (this.subEl) this.subEl.remove(); if (this.skipEl) this.skipEl.remove(); if (this.dbgEl) this.dbgEl.remove();
    if (this.music) { this.music.h.stop(0.6); this.music = null; } // gameplay music takes over (crossfade)
    Sound.duck(false);
    if (!this.handedOff) Story.setup();
    Game.introSeen = true; Game.saveProgress();
    Story.begin();
  },
  drawDebug(g) {
    g.fillStyle = "rgba(0,0,0,0.65)"; g.fillRect(0, 0, IW, 32);
    const tot = this.endT;
    for (const sh of this.shots) { const x = (sh.start / tot) * (IW - 8) + 4; g.fillStyle = sh === this.shot ? "#ffd34a" : "#5a6390"; g.fillRect(Math.round(x), 14, Math.max(1, Math.round(((sh.end - sh.start) / tot) * (IW - 8)) - 1), 5); }
    for (const p of Object.values(this.plan)) { const x = (p.start / this.pace / tot) * (IW - 8) + 4, w = (p.voiceLen / this.pace / tot) * (IW - 8); g.fillStyle = p.k === this.playing ? "#5dff8a" : "#2f7a46"; g.fillRect(Math.round(x), 22, Math.max(1, Math.round(w)), 3); }
    g.fillStyle = "#fff"; g.fillRect(Math.round((this.s / tot) * (IW - 8) + 4), 12, 1, 15);
    pxText(g, `T ${this.s.toFixed(2)} REAL ${(this.s * this.pace).toFixed(2)}  ${this.shot ? this.shot.id.toUpperCase() : ""}  VOICE ${this.playing || "-"}  MUSIC ${this.music ? this.music.k.toUpperCase() : "-"}`, 4, 3, 1, "#ffd34a");
  },

  // blit a region of the world buffer B with a camera (sub-pixel position, zoom)
  cam(g, cx, cy, zoom, shake = 0) {
    const w = IW / zoom, h = IH / zoom;
    const sx = cx - w / 2 + (shake ? (Math.random() - 0.5) * shake : 0), sy = cy - h / 2 + (shake ? (Math.random() - 0.5) * shake : 0);
    g.imageSmoothingEnabled = false; g.drawImage(this.B, sx, sy, w, h, 0, 0, IW, IH);
  },
  q(s) { return Math.floor(s * 12) / 12; }, // 12 fps sprite time
  blink(s, off, period = 4) { const p = (s + off) % period; if (p < 1 / 12) return 1; if (p < 2 / 12) return 2; if (p < 3 / 12) return 3; return 0; },
  breathe(s, off = 0) { return ((s + off) % 2.5) < 1.1 ? 1 : 0; },
  flash(g, a, col = "255,255,255") { if (a <= 0) return; g.fillStyle = `rgba(${col},${Math.min(1, a)})`; g.fillRect(0, 0, IW, IH); },

  // ================================================================ SHOT 1 — the argument
  drawControlRoom(g, s, calm) {
    // wall
    const wall = g.createLinearGradient(0, 0, 0, IH); wall.addColorStop(0, calm ? "#3a3f52" : "#1c1f30"); wall.addColorStop(1, calm ? "#2a2e3e" : "#121420"); g.fillStyle = wall; g.fillRect(0, 0, IW, IH);
    for (let x = 0; x < IW; x += 48) { g.fillStyle = calm ? "#32374a" : "#181b2a"; g.fillRect(x, 34, 1, 140); }
    // ceiling + pipes
    g.fillStyle = calm ? "#2a2e3e" : "#0e1018"; g.fillRect(0, 0, IW, 32);
    [[8, 5, "#4a5068"], [17, 4, "#5a4a3a"], [24, 3, "#3e5a5a"]].forEach(([y, h, c]) => { g.fillStyle = c; g.fillRect(0, y, IW, h); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, y, IW, 1); for (let x = 30; x < IW; x += 70) { g.fillStyle = "#2a2e3e"; g.fillRect(x, y - 1, 4, h + 2); } });
    // slit window with a dusty red sky
    g.fillStyle = "#0a0b12"; g.fillRect(18, 46, 104, 18);
    const sky = g.createLinearGradient(0, 48, 0, 62); sky.addColorStop(0, calm ? "#d89a6a" : "#b0502a"); sky.addColorStop(1, calm ? "#f0c090" : "#d8763a"); g.fillStyle = sky; g.fillRect(20, 48, 100, 14);
    g.fillStyle = calm ? "#a8603a" : "#7a3018"; g.fillRect(20, 58, 100, 4);
    for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(255,200,150,0.6)"; g.fillRect(20 + ((i * 37 + s * (20 + i * 3)) % 100), 49 + (i * 7) % 12, 2, 1); }
    // big screen with the dust map
    const sx = 150, sy = 42, sw = 180, sh = 92;
    g.fillStyle = "#0b0d16"; g.fillRect(sx - 4, sy - 4, sw + 8, sh + 8); g.fillStyle = "#0e2a24"; g.fillRect(sx, sy, sw, sh);
    g.fillStyle = "rgba(90,255,170,0.12)"; for (let x = sx; x < sx + sw; x += 12) g.fillRect(x, sy, 1, sh); for (let y = sy; y < sy + sh; y += 12) g.fillRect(sx, y, sw, 1);
    g.fillStyle = "#2a5a40"; [[20, 18, 50, 20], [90, 10, 60, 26], [40, 50, 70, 18], [120, 52, 40, 24]].forEach(([x, y, w, h]) => g.fillRect(sx + x, sy + y, w, h));
    // orange dust swirl in the south
    const scx = sx + 110, scy = sy + 70;
    for (let i = 0; i < 60; i++) { const a = i * 0.35 + s * (calm ? 0.6 : 1.4), r = 2 + i * 0.32; g.fillStyle = i % 3 ? "#e0763a" : "#ffb070"; g.fillRect(Math.round(scx + Math.cos(a) * r * 1.4), Math.round(scy + Math.sin(a) * r * 0.7), 2, 1); }
    if (((s * 2) | 0) % 2) { g.fillStyle = "#ff4040"; g.fillRect(scx - 1, scy - 1, 3, 3); }
    pxText(g, "DUST MAP", sx + 4, sy + 4, 1, "#7dffb0");
    // consoles with LEDs
    g.fillStyle = "#2c3144"; g.fillRect(0, 150, IW, 30); g.fillStyle = "#3c4258"; g.fillRect(0, 150, IW, 3);
    for (let x = 12; x < IW; x += 9) { const on = rnd(x, (s * 3) | 0) > 0.45; g.fillStyle = on ? ["#ff4a4a", "#5dff8a", "#ffb020"][x % 3] : "#1a1d2a"; g.fillRect(x, 160 + (x % 2) * 6, 3, 2); }
    // floor shadow
    g.fillStyle = calm ? "#22252f" : "#0c0d14"; g.fillRect(0, 180, IW, 90);
    // beacon
    g.fillStyle = "#3a3e50"; g.fillRect(232, 28, 16, 6); g.fillStyle = calm ? "#5a2222" : (Math.sin(s * 3.2) > 0 ? "#ff4a4a" : "#a82020"); g.fillRect(234, 33, 12, 6);
  },
  beaconCone(g, s) {
    const a = s * 3.2, dir = Math.sin(a), face = Math.cos(a);
    const bx = 240, by = 38, tx = 240 + dir * 260, spread = 60 + Math.abs(face) * 70;
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createLinearGradient(bx, by, tx, IH); gr.addColorStop(0, `rgba(230,57,70,${0.45 + face * 0.15})`); gr.addColorStop(1, "rgba(230,57,70,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(bx - 4, by); g.lineTo(bx + 4, by); g.lineTo(tx + spread, IH); g.lineTo(tx - spread, IH); g.closePath(); g.fill();
    if (face > 0.7) { g.fillStyle = `rgba(230,57,70,${(face - 0.7) * 0.5})`; g.fillRect(0, 0, IW, IH); }
    g.restore();
  },
  shot_argument(g, s, ls, dt, t) {
    const Bt = this.Bt, frozen = s >= Bt.argFreeze, S = frozen ? Bt.argFreeze : s, q = this.q(S);
    if (s >= Bt.argBlack) { return; } // black (alarm continues)
    const b = this.bg; b.clearRect(0, 0, IW, IH);
    this.drawControlRoom(b, S, false);
    const pointK = clamp01(Math.floor((q - Bt.argPoint) * 12) / 4);
    const step = easeOut(seg(q, Bt.argStep, Bt.argStep + 0.25)) * 5;
    const hl = q > Bt.argFreeze - 1;
    const talkD = ((q * 6) | 0) % 3 !== 0 && q < Bt.argFreeze;
    const talkM = ((q * 5 + 1) | 0) % 2 === 0 && q < Bt.argFreeze;
    if (talkD && !this._tD) Sound.play("blip", "lead", 0.7); if (talkM && !this._tM) Sound.play("blip", "marcus", 0.7); this._tD = talkD; this._tM = talkM;
    bust(b, "marcus", 336 - step, 252, { f: -1, turn: 0.55, gx: 1, brow: "angry", mouth: talkM ? "talk" : "tight", arm: "tablet", knuckles: 0.6, breathe: this.breathe(q, 0.7), highlight: hl });
    bust(b, "lead", 146, 252, { f: 1, turn: 0.55, gx: 1, brow: "angry", mouth: talkD ? "talk" : "tight", arm: pointK > 0 ? "point" : "none", armK: pointK, star: true, glint: pointK >= 1 && ((q * 12) | 0) % 6 < 2 ? 1 : 0, breathe: this.breathe(q), highlight: hl });
    b.fillStyle = "#262a3a"; b.fillRect(0, 238, IW, 40); b.fillStyle = "#3c4258"; b.fillRect(0, 236, IW, 3); b.fillStyle = "#4e5672"; b.fillRect(0, 236, IW, 1);
    for (let x = 16; x < IW; x += 22) { b.fillStyle = ["#ff4a4a", "#5dff8a", "#ffb020"][(x / 22 | 0) % 3]; if (rnd(x, (S * 4) | 0) > 0.3) b.fillRect(x, 246, 2, 2); }
    this.beaconCone(b, S);
    const z = lerp(1, 1.18, ease(seg(S, 0, Bt.argPushEnd)));
    this.cam(g, 240, 160, z, frozen ? 0 : 1.2);
    if (between(s, Bt.argFreeze, Bt.argFreeze + 1 / 12)) this.flash(g, 0.7, "230,57,70");
    if (frozen) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, IW, IH); }
    // letterbox
    g.fillStyle = "#000"; g.fillRect(0, 0, IW, 14); g.fillRect(0, IH - 14, IW, 14);
  },

  // ================================================================ TITLE
  shot_title(g, s, ls) {
    const Bt = this.Bt;
    if (Math.random() < 0.6) this.pools.dust.spawn({ x: -4, y: Math.random() * IH, vx: 20 + Math.random() * 30, vy: (Math.random() - 0.5) * 4, life: 8, s: 1, c: Math.random() < 0.5 ? "#e0a96d" : "#b07a48" });
    this.pools.dust.draw(g, s);
    if (s < Bt.titleIn || s >= Bt.titleOut) return;
    const k = s - Bt.titleIn, fr = Math.floor(k * 12);
    const on = fr >= 10 || [1, 2, 5, 6, 8].includes(fr); // 3 flickers over ~0.8 s
    if (!on) return;
    const a = s > Bt.titleHoldEnd ? 1 - seg(s, Bt.titleHoldEnd, Bt.titleOut) : 1;
    g.globalAlpha = a;
    const str = "SOL 200", sc = 8, w = textW(str, sc);
    pxText(g, str, Math.round((IW - w) / 2), 100, sc, "#e0a96d", "#6a2a10");
    g.fillStyle = "rgba(0,0,0,0.12)"; for (let y = 100; y < 100 + 7 * sc; y += 3) g.fillRect(0, y, IW, 1);
    g.globalAlpha = 1;
  },

  // ================================================================ SHOT 2 — the ceremony
  shot_ceremony(g, s, ls, dt, t) {
    const Bt = this.Bt, q = this.q(s), b = this.bg;
    b.fillStyle = "#e8eef6"; b.fillRect(0, 0, IW, 420);
    // hall: cool white + light blue
    const wall = b.createLinearGradient(0, 0, 0, 230); wall.addColorStop(0, "#f2f6fb"); wall.addColorStop(1, "#c9d7e6"); b.fillStyle = wall; b.fillRect(0, 0, IW, 232);
    for (let x = 0; x < IW; x += 40) { b.fillStyle = "#d5e0ec"; b.fillRect(x, 0, 2, 232); }
    b.fillStyle = "#ffffff"; for (let x = 20; x < IW; x += 80) b.fillRect(x, 4, 40, 3);
    // huge screen
    const sx = 112, sy = 18, sw = 256, sh = 120;
    b.fillStyle = "#1a2236"; b.fillRect(sx - 4, sy - 4, sw + 8, sh + 8); b.fillStyle = "#0e1a33"; b.fillRect(sx, sy, sw, sh);
    const typing = s >= Bt.cerTypeStart;
    if (!typing) {
      // simple globe + invented emblem (circle and star)
      const gx = sx + 70, gy = sy + 60;
      pxCircle(b, gx, gy, 38, "#2a5aa8"); for (let i = -2; i <= 2; i++) { b.fillStyle = "#4a7ad0"; const ox = Math.round(Math.sin(s * 0.8 + i) * 30); b.fillRect(gx + ox, gy - 34, 1, 68); }
      b.fillStyle = "#3aa04a"; [[-20, -14, 18, 10], [6, -4, 16, 16], [-12, 12, 12, 8]].forEach(([x, y, w, h]) => b.fillRect(gx + x + Math.round(Math.sin(s * 0.5) * 3), gy + y, w, h));
      const ex = sx + 186, ey = sy + 60;
      pxCircle(b, ex, ey, 34, "#ffd34a"); pxCircle(b, ex, ey, 30, "#0e1a33"); pxCircle(b, ex, ey, 27, "#16284a");
      b.fillStyle = "#ffd34a"; [[0, -16, 2, 32], [-16, -2, 32, 4], [-8, -8, 16, 16]].forEach(([x, y, w, h]) => b.fillRect(ex + x - 1, ey + y, w, h));
      pxText(b, "MISSION CREW", sx + 128 - textW("MISSION CREW") / 2, sy + 104, 1, "#9ec2ff");
    } else {
      b.fillStyle = "#0b1428"; b.fillRect(sx + 6, sy + 6, sw - 12, sh - 12);
      const T = INTRO_TIMING.texts, L2 = T.report2.replace("DAMON CARTER", CONFIG.FULL_NAMES.lead.toUpperCase());
      const span = Bt.cerTypeEnd - Bt.cerTypeStart, cps = (T.report1.length + L2.length + T.report3.length) / (span * 0.95);
      typeText(b, "rep1", T.report1, sx + 14, sy + 14, s, Bt.cerTypeStart, cps, 2, "#ffd34a", null, false);
      typeText(b, "rep2", L2, sx + 14, sy + 46, s, Bt.cerTypeStart + T.report1.length / cps, cps, 1, "#d8ecff", null, false);
      typeText(b, "rep3", T.report3, sx + 14, sy + 60, s, Bt.cerTypeStart + (T.report1.length + L2.length) / cps, cps, 2, "#ffffff", null, s < Bt.cerTypeEnd + 0.5);
    }
    // screen light on the stage
    b.save(); b.globalCompositeOperation = "lighter"; const lg = b.createRadialGradient(240, 140, 10, 240, 160, 160); lg.addColorStop(0, typing ? "rgba(255,210,90,0.18)" : "rgba(120,170,255,0.15)"); lg.addColorStop(1, "rgba(0,0,0,0)"); b.fillStyle = lg; b.fillRect(60, 60, 360, 200); b.restore();
    // plants
    [[86, 228], [394, 228]].forEach(([x, y]) => { b.fillStyle = "#5a6a7a"; b.fillRect(x - 7, y - 12, 14, 12); b.fillStyle = "#2f7a46"; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.35 + Math.sin(s + i) * 0.04; limb(b, x, y - 12, x + Math.cos(a) * 16, y - 12 + Math.sin(a) * 18, 2, i % 2 ? "#3a9a58" : "#2f7a46"); } });
    // stage floor (polished)
    b.fillStyle = "#dfe6ee"; b.fillRect(0, 230, IW, 30); for (let x = 0; x < IW; x += 24) { b.fillStyle = "#cfd8e2"; b.fillRect(x, 230, 1, 30); } b.fillStyle = "#b9c4d2"; b.fillRect(0, 258, IW, 6); b.fillStyle = "#8a96a8"; b.fillRect(0, 264, IW, 3);
    // --- characters
    const look = between(s, Bt.cerLook, Bt.cerBreak);
    // Marcus (behind, half a step to the left)
    let mA = "clapSlow", mHt = 0.6, mGx = 1, mGy = 0, mKn = 0, mBrow = "neutral", mMouth = "closed", mBlink = this.blink(q, 1.3, 3.7), mGlint = false;
    if (s >= Bt.cerPin) { mA = "tablet"; mHt = 1; mGx = 1; mGy = -1; mKn = clamp01((s - Bt.cerPin - 0.3) / 0.7); mMouth = "tight"; }
    if (between(s, Bt.cerTypeStart, Bt.cerTypeEnd + 0.3)) { mGlint = ((q * 6) | 0) % 2 === 0; mHt = 1; mGy = -1; }
    if (s >= Bt.cerLook) { mHt = 1; mGx = 1; mGy = 0; mBrow = "angry"; mBlink = 0; }
    if (s >= Bt.cerBreak + 0.4) { mGy = 1; mHt = 0.5; }
    figFront(b, "marcus", 204, 226, { arms: mA, ph: s, ht: mHt, gx: mGx, gy: mGy, knuckles: mKn, brow: mBrow, mouth: mMouth, blink: mBlink, glassGlint: mGlint, breathe: this.breathe(q, 0.4) });
    // podium
    b.fillStyle = "#c4cfdc"; b.fillRect(180, 196, 20, 34); b.fillStyle = "#e6edf5"; b.fillRect(178, 192, 24, 5); b.fillStyle = "#9aa6b6"; b.fillRect(198, 196, 2, 34);
    b.fillStyle = "#2a2e3a"; b.fillRect(192, 184, 1, 9); b.fillRect(190, 182, 4, 3);
    pxCircle(b, 190, 212, 5, "#ffd34a"); pxCircle(b, 190, 212, 3, "#c4cfdc");
    // Damon
    let dHt = 0, dGx = 0, dGy = 0, dMouth = "smile", dBrow = "neutral", dArms = "down", dLift = 0, dBlink = this.blink(q, 0.2, 3.3);
    const star = s >= Bt.cerPin, glint = between(s, Bt.cerPin, Bt.cerPin + 0.25);
    if (s >= Bt.cerPin) { dMouth = "half"; if (between(s, Bt.cerPin + 0.1, Bt.cerPin + 0.7)) { dGx = 1; dGy = 1; dHt = 0.5; } if (s >= Bt.cerPin + 0.8) dLift = 1; }
    if (s >= Bt.cerTypeStart) { dBrow = "proud"; }
    if (look) { dHt = -1; dGx = -1; dGy = 0; dMouth = "closed"; dBrow = "worry"; dBlink = 0; }
    if (s >= Bt.cerBreak) { dHt = 0; dGx = 0; dMouth = "forced"; dBrow = "neutral"; if (s > Bt.cerBreak + 0.1) dArms = "wave"; }
    figFront(b, "lead", 226, 230, { arms: dArms, ph: s, ht: dHt, gx: dGx, gy: dGy, mouth: dMouth, brow: dBrow, lift: dLift, star, glint, blink: dBlink, breathe: this.breathe(q) });
    // Diego + Layla (right, in a line)
    let gArms = "clapHard", gMouth = "smile", gGy = 0, gGx = 0;
    if (s >= Bt.cerTypeStart + 0.2) { gArms = "wrench"; gMouth = "closed"; gGy = 1; }
    figFront(b, "diego", 266, 230, { arms: gArms, ph: s, mouth: gMouth, gy: gGy, gx: gGx, blink: this.blink(q, 2.1, 3.1), breathe: this.breathe(q, 1.1) });
    let lArms = "clap", lHt = -0.5, lGx = -1, lGy = 0, lMouth = "smile";
    if (s >= 13.0) { lArms = "twist"; lMouth = "closed"; }
    if (between(s, 13.0, 13.4)) { lHt = -1; lGx = -1; } else if (between(s, 13.4, 13.8)) { lHt = -1; lGx = -1; lGy = 0; } else if (between(s, 13.8, 14.2)) { lHt = -0.5; lGx = -1; lGy = -1; } else if (s >= 14.2) { lHt = 0; lGx = 0; lGy = 1; }
    figFront(b, "layla", 290, 230, { arms: lArms, ph: s * 0.7, ht: lHt, gx: lGx, gy: lGy, mouth: lMouth, blink: s >= 13 && s < 14.2 ? 0 : this.blink(q, 0.7, 3.9), breathe: this.breathe(q, 1.7) });
    // the hand with the star (dark sleeve, no face)
    if (between(s, Bt.cerHand, Bt.cerPin + 0.6)) {
      const k = s < Bt.cerPin ? ease(seg(s, Bt.cerHand, Bt.cerHand + 0.8)) : 1 - ease(seg(s, Bt.cerPin, Bt.cerPin + 0.6));
      const hx = lerp(150, 231, k), hy = lerp(208, 203, k);
      const ex = hx - 26, ey = hy + 8; limb(b, hx - 52, hy + 18, ex, ey, 6, "#22283a"); limb(b, ex, ey, hx - 6, hy + 1, 5, "#22283a"); limb(b, hx - 52, hy + 16, ex, ey - 2, 1, "#3a4256"); b.fillStyle = "#f4f1ea"; b.fillRect(Math.round(hx - 7), Math.round(hy - 2), 2, 5); b.fillStyle = "#3a4256"; b.fillRect(Math.round(hx - 8), Math.round(hy - 2), 3, 7); b.fillStyle = "#e8c09a"; b.fillRect(Math.round(hx - 4), Math.round(hy - 2), 6, 5); b.fillStyle = "#c89a78"; b.fillRect(Math.round(hx - 4), Math.round(hy + 2), 6, 1);
      if (s < Bt.cerPin) { b.fillStyle = "#ffd34a"; b.fillRect(Math.round(hx + 1), Math.round(hy - 3), 3, 3); }
    }
    // floor reflections
    b.save(); b.globalAlpha = 0.16; b.translate(0, 460); b.scale(1, -1); b.drawImage(this.B, 150, 186, 180, 44, 150, 186, 180, 44); b.restore();
    // crowd (foreground silhouettes)
    b.fillStyle = "#1a2030"; b.fillRect(0, 267, IW, 160);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 17; i++) {
      const x = i * 30 + (row % 2) * 15 - 6 + rnd(i, row) * 6, y = 300 + row * 26 + Math.sin(s * 3 + i * 1.7 + row) * 1.5;
      const c = row === 2 ? "#0a0d16" : row === 1 ? "#121726" : "#1b2134";
      pxCircle(b, x, y, 7, c); b.fillStyle = c; b.fillRect(Math.round(x - 12), Math.round(y + 6), 24, 30);
      const clap = (Math.sin(s * (8 + rnd(i, row + 5) * 4) + i) + 1) / 2;
      if (rnd(i, row + 9) > 0.35) { b.fillRect(Math.round(x - 6 - clap * 3), Math.round(y - 4), 3, 3); b.fillRect(Math.round(x + 4 + clap * 3), Math.round(y - 4), 3, 3); }
      b.fillStyle = "rgba(160,190,230,0.18)"; b.fillRect(Math.round(x - 6), Math.round(y - 7), 12, 1);
    }
    // camera flashes in the crowd
    const flashes = (s >= Bt.cerPin && s < Bt.cerPin + 0.5) ? 5 : 1;
    for (let i = 0; i < flashes; i++) if (rnd(i, (q * 12) | 0) > (flashes > 1 ? 0.55 : 0.93)) { const fx = 20 + rnd(i * 3, (q * 12) | 0) * 440, fy = 296 + rnd(i * 5, (q * 12) | 0) * 60; b.fillStyle = "#ffffff"; b.fillRect(Math.round(fx) - 3, Math.round(fy), 7, 1); b.fillRect(Math.round(fx), Math.round(fy) - 3, 1, 7); b.globalAlpha = 0.4; pxCircle(b, fx, fy, 4, "#ffffff"); b.globalAlpha = 1; }
    // camera: glide from the crowd to the stage, push in on the look
    let cx = 240, cy = 150, z = 1;
    const gl = ease(seg(s, 8.0, Bt.cerGlideEnd)); cy = lerp(300, 150, gl); z = lerp(1.15, 1.0, gl);
    const pk = ease(seg(s, Bt.cerHand - 0.2, Bt.cerPin + 0.3)) - ease(seg(s, Bt.cerTypeStart - 0.6, Bt.cerTypeStart));
    z += pk * 0.9; cx = lerp(cx, 222, pk); cy = lerp(cy, 196, pk);
    const rd = ease(seg(s, Bt.cerTypeStart - 0.6, Bt.cerTypeStart)) - ease(seg(s, Bt.cerTypeEnd, Bt.cerLook));
    cy = lerp(cy, 118, rd); z += rd * 0.15;
    const lk = ease(seg(s, Bt.cerLook - 0.05, Bt.cerLook + 0.4)) - ease(seg(s, Bt.cerBreak + 0.3, Bt.cerBreak + 1.0)) * 0.6;
    z += lk * 1.3; cx = lerp(cx, 216, lk); cy = lerp(cy, 202, lk);
    this.cam(g, cx, cy, z);
    if (s >= Bt.cerFlash) this.flash(g, ease(seg(s, Bt.cerFlash, Bt.cerFlash + 0.25)));
  },

  // ================================================================ SHOT 3 — launch
  shot_launch(g, s, ls, dt, t) {
    const Bt = this.Bt, q = this.q(s), P = this.pools;
    const GROUND = 930;
    const lift = s > Bt.liftoff ? 34 * Math.pow(s - Bt.liftoff, 2) : 0;
    const base = GROUND - lift;
    const camT = Math.min(690, base - 190 + 40);
    const camY = Math.round(lerp(690, camT, ease(seg(s, Bt.liftoff, Bt.liftoff + 1.5))));
    const shake = s > Bt.ignition && s < Bt.ignition + 3 ? (1 - seg(s, Bt.ignition, Bt.ignition + 3)) * 4 : s > Bt.liftoff && s < Bt.separation ? 1 : 0;
    const sh = Math.round((Math.random() - 0.5) * shake), shY = Math.round((Math.random() - 0.5) * shake);
    // sky (by altitude) + darkening
    const skyAt = (y) => { const stops = [[-400, [11, 16, 38]], [300, [24, 22, 70]], [600, [80, 50, 120]], [800, [224, 122, 138]], [930, [240, 160, 80]]]; let a = stops[0], c = stops[stops.length - 1]; for (let i = 0; i < stops.length - 1; i++) if (y >= stops[i][0] && y <= stops[i + 1][0]) { a = stops[i]; c = stops[i + 1]; break; } if (y < stops[0][0]) return stops[0][1]; if (y > c[0]) return c[1]; const k = (y - a[0]) / (c[0] - a[0]); return a[1].map((v, j) => Math.round(v + (c[1][j] - v) * k)); };
    for (let y = 0; y < IH; y += 6) { const col = skyAt(camY + y); g.fillStyle = `rgb(${col})`; g.fillRect(0, y, IW, 6); }
    const dark = seg(s, Bt.skyDark, Bt.skyDark + 3);
    if (dark > 0) { g.fillStyle = `rgba(8,10,28,${dark * 0.7})`; g.fillRect(0, 0, IW, IH); }
    // stars
    const starA = clamp01((500 - camY) / 500) * 0.8 + dark * 0.3;
    if (starA > 0) for (let i = 0; i < 90; i++) { g.globalAlpha = starA * (0.4 + rnd(i, 1) * 0.6); g.fillStyle = "#fff"; g.fillRect(Math.round(rnd(i, 2) * IW), Math.round((rnd(i, 3) * 400 - camY * 0.08 + 800) % IH), 1, 1); }
    g.globalAlpha = 1;
    // mountains (parallax)
    const mtn = (yBase, fac, col, amp, seed) => { const y0 = Math.round(yBase + (690 - camY) * fac); if (y0 > IH + 40) return; g.fillStyle = col; for (let x = 0; x < IW; x += 2) { const h = amp * (0.5 + 0.5 * Math.sin(x * 0.013 + seed) * Math.sin(x * 0.031 + seed * 2)) + amp * 0.3; g.fillRect(x, Math.round(y0 - h), 2, Math.round(h) + 300); } };
    mtn(222, 0.15, "#5a3a62", 46, 1); mtn(234, 0.4, "#3a2444", 30, 4);
    // world layer (1:1 with camera)
    g.save(); g.translate(sh, -camY + shY);
    // clouds band that tears when the rocket passes
    const tear = seg(s, Bt.skyDark - 0.6, Bt.skyDark + 1.2);
    for (let i = 0; i < 9; i++) { const cx = i * 60 + 10, cy = 600 + (i % 3) * 14; const off = cx < 240 ? -tear * 60 : tear * 60; g.globalAlpha = 0.75 - tear * 0.3; pxEllipse(g, cx + off, cy, 34, 7, "#f0a8b0"); pxEllipse(g, cx + off + 6, cy - 3, 20, 5, "#ffd0c8"); }
    g.globalAlpha = 1;
    // ground + pad
    g.fillStyle = "#b07a50"; g.fillRect(-10, GROUND, IW + 20, 120); g.fillStyle = "#8a5a3a"; g.fillRect(-10, GROUND, IW + 20, 2);
    for (let i = 0; i < 40; i++) { g.fillStyle = "#9a6a44"; g.fillRect(Math.round(rnd(i, 7) * IW), GROUND + 4 + Math.round(rnd(i, 8) * 30), 3, 1); }
    g.fillStyle = "#6e7480"; g.fillRect(196, GROUND - 6, 88, 8); g.fillStyle = "#8a909c"; g.fillRect(196, GROUND - 6, 88, 2); g.fillStyle = "#2a2a30"; g.fillRect(228, GROUND - 4, 24, 6);
    // viewing area silhouettes
    g.fillStyle = "#3a2a30"; g.fillRect(40, GROUND - 3, 90, 3);
    for (let i = 0; i < 10; i++) { const x = 46 + i * 8, up = s > Bt.ignition + 0.3 && (i + ((q * 4) | 0)) % 3 !== 0; g.fillStyle = "#2a1e26"; g.fillRect(x, GROUND - 10, 3, 7); g.fillRect(x, GROUND - 12, 3, 2); if (up) { g.fillRect(x - 1, GROUND - 15, 1, 4); g.fillRect(x + 3, GROUND - 15, 1, 4); } }
    // tower
    g.fillStyle = "#5a5e6a"; g.fillRect(268, GROUND - 140, 10, 140); for (let y = GROUND - 136; y < GROUND; y += 8) { g.fillStyle = "#3e424e"; g.fillRect(268, y, 10, 1); limb(g, 268, y, 277, y + 7, 1, "#3e424e"); }
    g.fillStyle = "#ff4040"; if (((s * 2) | 0) % 2) g.fillRect(272, GROUND - 144, 2, 3);
    const armK = ease(seg(s, 17.0, Bt.ignition - 0.3));
    [GROUND - 100, GROUND - 70, GROUND - 40].forEach((y) => { const len = Math.round(lerp(16, 3, armK)); g.fillStyle = "#7a7e8a"; g.fillRect(268 - len, y, len, 3); });
    // rocket
    const rx = 240;
    const sep = s >= Bt.separation ? s - Bt.separation : -1;
    const drawRocket = (by) => {
      const top = by - 112;
      // boosters
      if (sep < 0) { [[-16, 6], [10, 6]].forEach(([dx, w]) => { g.fillStyle = "#e8e4da"; g.fillRect(rx + dx, by - 54, w, 50); g.fillStyle = "#c8c2b4"; g.fillRect(rx + dx + w - 2, by - 54, 2, 50); g.fillStyle = "#2a2e3a"; g.fillRect(rx + dx + 1, by - 60, w - 2, 6); g.fillRect(rx + dx + 2, by - 62, w - 4, 2); g.fillStyle = "#8b93a6"; g.fillRect(rx + dx, by - 4, w, 4); }); }
      g.fillStyle = "#f4f1ea"; g.fillRect(rx - 8, top + 16, 16, 96); g.fillStyle = "#d8d2c4"; g.fillRect(rx + 4, top + 16, 4, 96);
      g.fillStyle = "#2a2e3a"; for (let i = 0; i < 16; i++) { const w = Math.round(16 * (i / 16)); g.fillRect(rx - w / 2, top + i, Math.max(2, w), 1); }
      g.fillStyle = "#d63a3a"; g.fillRect(rx - 8, top + 60, 16, 4);
      // mission patch: green leaf + 4 small stars
      pxCircle(g, rx - 1, top + 40, 5, "#0e1a33"); g.fillStyle = "#4ade80"; g.fillRect(rx - 3, top + 38, 3, 3); g.fillRect(rx - 2, top + 37, 2, 1); g.fillRect(rx, top + 41, 1, 2);
      g.fillStyle = "#fff"; [[-5, -3], [3, -3], [-5, 3], [3, 3]].forEach(([dx, dy]) => g.fillRect(rx - 1 + dx, top + 40 + dy, 1, 1));
      g.fillStyle = "#8b93a6"; g.fillRect(rx - 12, by - 16, 4, 14); g.fillRect(rx + 8, by - 16, 4, 14); g.fillStyle = "#6a7080"; g.fillRect(rx - 6, by, 12, 4);
    };
    drawRocket(base);
    if (sep >= 0) { // boosters fall away
      [[-1, -16], [1, 10]].forEach(([d, dx]) => { const ox = d * (6 + sep * 22), oy = sep * sep * 40; g.save(); g.translate(rx + dx + 3 + ox, base - 30 + oy); g.rotate(d * sep * 0.6); g.fillStyle = "#e8e4da"; g.fillRect(-3, -25, 6, 50); g.fillStyle = "#2a2e3a"; g.fillRect(-2, -31, 4, 6); g.restore(); });
    }
    // flame + glow
    if (s >= Bt.ignition) {
      const fl = (s < Bt.liftoff ? 14 : 30) + Math.random() * 12;
      g.fillStyle = "#ff7a2a"; g.fillRect(rx - 6, base + 4, 12, Math.round(fl)); g.fillStyle = "#ffd040"; g.fillRect(rx - 4, base + 4, 8, Math.round(fl * 0.75)); g.fillStyle = "#fff6d0"; g.fillRect(rx - 2, base + 4, 4, Math.round(fl * 0.45));
      if (sep < 0) { [-13, 13].forEach((dx) => { g.fillStyle = "#ffb040"; g.fillRect(rx + dx - 2, base, 4, Math.round(fl * 0.6)); }); }
      g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createRadialGradient(rx, base + 10, 2, rx, base + 10, 90); gr.addColorStop(0, "rgba(255,170,60,0.55)"); gr.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = gr; g.fillRect(rx - 90, base - 80, 180, 180); g.restore();
      // fire spreading along the ground
      if (s < Bt.liftoff + 2) { const spread = easeOut(seg(s, Bt.ignition, Bt.ignition + 0.8)) * 190 * (1 - seg(s, Bt.liftoff + 0.5, Bt.liftoff + 2)); for (let x = -spread; x <= spread; x += 3) { const h = 3 + Math.random() * 8 * (1 - Math.abs(x) / (spread + 1)); g.fillStyle = Math.random() < 0.5 ? "#ff9a30" : "#ffd040"; g.fillRect(Math.round(rx + x), Math.round(GROUND - h), 3, Math.round(h)); } }
      // smoke + trail
      const n = s < Bt.liftoff + 1 ? 6 : 3;
      for (let i = 0; i < n; i++) { const side = Math.random() < 0.5 ? -1 : 1; if (s < Bt.liftoff + 1.5) P.smoke.spawn({ x: rx + side * (10 + Math.random() * 30), y: GROUND - 6 - Math.random() * 8, vx: side * (40 + Math.random() * 80), vy: -Math.random() * 12, life: 3, s: 3, ds: 5, c: Math.random() < 0.5 ? "#e8e4e0" : "#c8c2c0", kind: 1, drag: 0.6 }); }
      if (s > Bt.liftoff) P.smoke.spawn({ x: rx + (Math.random() - 0.5) * 8, y: base + 30, vx: (Math.random() - 0.5) * 16, vy: 30, life: 2.5, s: 2, ds: 4, c: "#d8d4d0", kind: 1, drag: 0.4 });
    } else if (s > 17.0) { // steam venting before ignition
      if (Math.random() < 0.7) { const side = Math.random() < 0.5 ? -1 : 1; P.smoke.spawn({ x: rx + side * 12, y: GROUND - 10, vx: side * (14 + Math.random() * 18), vy: -6 - Math.random() * 8, life: 1.6, s: 1, ds: 3, c: "#f4f4f8", kind: 1, drag: 0.5 }); }
    }
    // birds scatter at ignition
    if (this.prevS < Bt.ignition && s >= Bt.ignition) for (let i = 0; i < 16; i++) P.birds.spawn({ x: 60 + Math.random() * 360, y: GROUND - 20 - Math.random() * 30, vx: (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60), vy: -40 - Math.random() * 40, life: 4, c: "#2a1e26", kind: 2 });
    P.smoke.draw(g, s); P.birds.draw(g, s);
    g.restore();
    // heat shimmer under the engine (row displacement)
    if (s > Bt.ignition && s < Bt.skyDark) {
      const y0 = Math.round(base + 6 - camY), x0 = rx - 30;
      for (let y = y0; y < y0 + 40 && y < IH; y += 2) { if (y < 0) continue; const off = Math.round(Math.sin(y * 0.7 + s * 30) * 1.5); if (off) g.drawImage(this.out, x0, y, 60, 2, x0 + off, y, 60, 2); }
    }
    if (between(s, Bt.ignition, Bt.ignition + 0.35)) this.flash(g, 1 - seg(s, Bt.ignition, Bt.ignition + 0.35));
    if (s < 17.4) this.flash(g, 1 - seg(s, 17.0, 17.4)); // the camera flash becomes the launch
    if (s > 26.4) { g.fillStyle = `rgba(4,6,18,${seg(s, 26.4, 27.0)})`; g.fillRect(0, 0, IW, IH); }
  },

  // ================================================================ planets (rendered pixel by pixel, cached)
  planet(kind, r, rot, extra = 0, tilt = 0) {
    r = Math.max(2, Math.round(r));
    const key = kind + r + ":" + Math.round(rot * 200) + ":" + Math.round(extra * 50) + ":" + tilt;
    if (this.planetCache[key]) return this.planetCache[key];
    if (Object.keys(this.planetCache).length > 40) this.planetCache = {};
    const size = r * 2 + 1, c = mkCanvas(size, size), g = c.getContext("2d"), id = g.createImageData(size, size), d = id.data;
    const sun = kind === "earth" ? [0.75, -0.3, 0.6] : [-0.55, -0.35, 0.75];
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const nx = x / r, ny = y / r, rr = nx * nx + ny * ny; if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr), cb = Math.cos(tilt), sb = Math.sin(tilt);
      const Y = ny * cb - nz * sb, Z = ny * sb + nz * cb;
      const lon = Math.atan2(nx, Z) + rot, lat = Math.asin(Math.max(-1, Math.min(1, Y)));
      let col;
      const light = nx * sun[0] + ny * sun[1] + nz * sun[2];
      const dith = (BAYER[((y + r) % 4) * 4 + ((x + r) % 4)] / 16 - 0.5) * 0.18;
      const L = light + dith;
      if (kind === "earth") {
        const land = noise2(lon * 0.45, lat * 0.6) > 0.53, ice = Math.abs(lat) > 1.22;
        const cloud = noise2(lon * 0.7 + extra * 3, lat * 1.6 + 7) > 0.6;
        col = ice ? [236, 242, 250] : land ? (noise2(lon * 1.2, lat * 1.2) > 0.5 ? [70, 150, 70] : [150, 130, 80]) : [36, 90, 170];
        if (cloud) col = [245, 245, 250];
        if (L < 0.05) { col = land && !cloud && hash((lon * 300) | 0, (lat * 300) | 0) > 0.93 ? [255, 214, 90] : [10, 18, 40]; }
        else if (L < 0.3) col = col.map((v) => v * 0.55);
      } else {
        const plains = noise2(lon * 0.5, lat * 0.7) > 0.54;
        col = plains ? [138, 58, 20] : [193, 68, 14];
        if (noise2(lon * 1.4, lat * 1.4) > 0.64) col = [214, 110, 50];
        // canyon scar
        const cl = ((lon % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (cl > 0.6 && cl < 1.9 && Math.abs(lat + 0.12 + Math.sin(cl * 3) * 0.04) < 0.035) col = [90, 30, 12];
        if (lat < -1.32 + noise2(lon * 2, 0) * 0.1) col = [240, 236, 228];
        // dust swirl in the south (seed of the storm)
        const dl = cl - 2.6, dla = lat - 0.62; const dd = Math.hypot(dl, dla * 1.4);
        if (dd < 0.45) { const ang = Math.atan2(dla, dl) + dd * 9 - extra * 2; if (Math.sin(ang * 2) > 0.2) col = [224, 169, 109]; }
        if (L < 0.06) col = col.map((v) => v * 0.15); else if (L < 0.3) col = col.map((v) => v * 0.55);
      }
      const i = ((y + r) * size + (x + r)) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    return (this.planetCache[key] = c);
  },
  drawPlanet(g, kind, cx, cy, r, rot, extra, tilt = 0) {
    const half = r > 90, c = this.planet(kind, half ? r / 2 : r, rot, extra, tilt), R = half ? Math.round(r / 2) * 2 : Math.round(r);
    g.imageSmoothingEnabled = false; g.drawImage(c, Math.round(cx - R), Math.round(cy - R), c.width * (half ? 2 : 1), c.height * (half ? 2 : 1));
    // atmosphere rim
    g.save(); g.globalCompositeOperation = "lighter";
    const gr = g.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.08); gr.addColorStop(0, kind === "earth" ? "rgba(120,180,255,0.35)" : "rgba(255,190,150,0.25)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * 1.08, 0, 7); g.fill(); g.restore();
  },
  starfield(g, s, speed, layers = 3) {
    for (let l = 0; l < layers; l++) { const sp = speed * (0.3 + l * 0.5), n = 40 + l * 20; for (let i = 0; i < n; i++) { const x = ((rnd(i, l) * IW * 3 - s * sp) % IW + IW) % IW, y = rnd(i, l + 9) * IH; g.fillStyle = l === 2 ? "#ffffff" : l === 1 ? "#b8c4e8" : "#6a7498"; g.fillRect(Math.round(x), Math.round(y), l === 2 && rnd(i, 4) > 0.8 ? 2 : 1, 1); } }
  },

  // ================================================================ SHOT 4 — space
  shot_space(g, s, ls, dt, t) {
    const Bt = this.Bt;
    g.fillStyle = "#0b1026"; g.fillRect(0, 0, IW, IH);
    this.starfield(g, s, 22);
    // Earth shrinking in the back right
    const k = ease(seg(s, 27.0, 33.0)), er = lerp(120, 30, k);
    this.drawPlanet(g, "earth", lerp(420, 400, k), lerp(70, 80, k), er, Math.round(s * 60) / 1000, Math.round(s * 20) / 400, 0.25);
    // the ship
    const bob = Math.sin(s * 1.3) * 2, sx = 170, sy = 140 + bob;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(sx + x), Math.round(sy + y), w, h); };
    // solar arrays (blue + gold)
    [-1, 1].forEach((d) => { R(-4, d < 0 ? -26 : 8, 2, 18, "#8b93a6"); for (let i = 0; i < 3; i++) { R(-28 + i * 17, d < 0 ? -38 : 22, 15, 14, "#d4a020"); R(-27 + i * 17, d < 0 ? -37 : 23, 13, 12, "#2a4aa0"); for (let j = 0; j < 3; j++) R(-27 + i * 17, (d < 0 ? -37 : 23) + j * 4, 13, 1, "#4a7ad0"); } });
    R(-30, -8, 60, 16, "#f4f1ea"); R(-30, 4, 60, 4, "#d8d2c4"); R(-30, -8, 60, 1, "#ffffff");
    for (let x = -22; x < 30; x += 12) R(x, -8, 1, 16, "#c8c2b4");
    R(30, -6, 10, 12, "#e8e4da"); R(40, -4, 4, 8, "#d8d2c4"); R(44, -2, 2, 4, "#8b93a6");
    R(-36, -6, 6, 12, "#8b93a6"); R(-40, -5, 4, 10, "#5f6678");
    const gl = 0.6 + Math.sin(s * 3) * 0.2; R(8, -4, 5, 4, `rgba(74,222,128,${gl})`); R(9, -3, 2, 1, "#d8ffe0"); // green-lit window (the seeds)
    g.save(); g.globalCompositeOperation = "lighter"; const wg = g.createRadialGradient(sx + 10, sy - 2, 1, sx + 10, sy - 2, 10); wg.addColorStop(0, "rgba(74,222,128,0.4)"); wg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = wg; g.fillRect(sx - 2, sy - 14, 24, 24); g.restore();
    // blue engine flame
    const fl = 10 + Math.random() * 6; R(-40 - fl, -3, fl, 6, "#3a7aff"); R(-40 - fl * 0.6, -2, fl * 0.6, 4, "#9ad0ff"); R(-40 - fl * 0.3, -1, fl * 0.3, 2, "#ffffff");
    // dotted path + red dot ahead
    if (s >= Bt.dotLine) {
      const k2 = seg(s, Bt.dotLine, Bt.dotLine + 1.0);
      for (let x = sx + 52; x < lerp(sx + 52, 452, k2); x += 6) { g.fillStyle = "#e0a96d"; g.fillRect(Math.round(x), Math.round(sy), 2, 1); }
      if (k2 >= 1) { const pr = s < Bt.matchCut ? 2 + Math.sin(s * 6) * 0.5 : 2; pxCircle(g, 460, sy, Math.round(pr), "#c1440e"); }
    }
    // the red dot grows into the planet (match cut)
    if (s >= Bt.matchCut) {
      const m = ease(seg(s, Bt.matchCut, 33.0)), r = lerp(2, 40, m), x = lerp(460, 300, m), y = lerp(sy, 135, m);
      g.fillStyle = `rgba(11,16,38,${m})`; g.fillRect(0, 0, IW, IH);
      if (r > 6) this.drawPlanet(g, "mars", x, y, r, 0.4, 0); else pxCircle(g, x, y, Math.round(r), "#c1440e");
    }
    // code text
    // cut-in on the window: a hand on the glass, Earth reflected
    if (between(s, Bt.windowCut[0], Bt.windowCut[1])) {
      g.fillStyle = "#e8e4da"; g.fillRect(0, 0, IW, IH); for (let y = 0; y < IH; y += 30) { g.fillStyle = "#d4cebe"; g.fillRect(0, y, IW, 1); } for (let x = 0; x < IW; x += 60) { g.fillStyle = "#d4cebe"; g.fillRect(x, 0, 1, IH); }
      pxCircle(g, 240, 135, 84, "#8b93a6"); pxCircle(g, 240, 135, 76, "#0e2a1c");
      g.save(); g.globalCompositeOperation = "lighter"; const ig = g.createRadialGradient(240, 150, 4, 240, 150, 80); ig.addColorStop(0, "rgba(74,222,128,0.5)"); ig.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = ig; g.fillRect(160, 60, 160, 160); g.restore();
      for (let i = 0; i < 9; i++) { limb(g, 190 + i * 12, 210, 190 + i * 12 + Math.sin(i) * 4, 170 - (i % 3) * 8, 2, "#2f7a46"); }
      g.globalAlpha = 0.3; this.drawPlanet(g, "earth", 280, 100, 22, s * 0.12, 0); g.globalAlpha = 1;
      // hand silhouette pressed on the glass
      const hx = 216, hy = 116; g.fillStyle = "#16241c"; g.fillRect(hx, hy, 22, 22); [[0, -16, 4], [6, -20, 4], [12, -19, 4], [18, -14, 4]].forEach(([dx, dy, w]) => g.fillRect(hx + dx, hy + dy, w, -dy + 2)); g.fillRect(hx - 9, hy + 6, 10, 5); g.fillRect(hx + 2, hy + 22, 18, 30);
      g.fillStyle = "rgba(255,255,255,0.25)"; for (let i = 0; i < 6; i++) g.fillRect(190 + i * 3, 74 + i * 2, 18, 1);
    }
    // code text (stays on screen, also over the window cut-in)
    if (between(s, Bt.spaceText[0], Bt.matchCut)) { g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(16, 206, textW(INTRO_TIMING.texts.space, 2) + 16, 26); typeText(g, "space", INTRO_TIMING.texts.space, 24, 212, s, Bt.spaceText[0], INTRO_TIMING.texts.space.length / (Bt.spaceText[1] - Bt.spaceText[0]), 2, "#e0a96d", "#000"); }
  },

  // ================================================================ SHOT 5 — Mars approach
  shot_mars(g, s, ls, dt, t) {
    const Bt = this.Bt, P = this.pools;
    g.fillStyle = "#0b1026"; g.fillRect(0, 0, IW, IH);
    if (s < Bt.entry) {
      this.starfield(g, s, 6);
      const k = ease(seg(s, 33.0, Bt.entry)), r = lerp(40, 300, k);
      this.drawPlanet(g, "mars", lerp(300, 260, k), lerp(135, 440, k), r, 0.4 + Math.round(s * 30) / 1000, Math.round(s * 4) / 4, 0.3);
      // capsule ahead of the planet
      const cx = lerp(150, 230, k), cy = lerp(130, 120, k);
      g.fillStyle = "#e8e4da"; g.fillRect(Math.round(cx - 6), Math.round(cy - 4), 12, 8); g.fillStyle = "#5a3a2a"; g.fillRect(Math.round(cx + 6), Math.round(cy - 5), 3, 10);
      if (s >= Bt.retro) { const fl = 6 + Math.random() * 6; g.fillStyle = "#ffd040"; g.fillRect(Math.round(cx + 9), Math.round(cy - 2), Math.round(fl), 4); g.fillStyle = "#fff"; g.fillRect(Math.round(cx + 9), Math.round(cy - 1), Math.round(fl * 0.4), 2); }
    } else if (s < Bt.touchdown) {
      // atmosphere entry: glowing heat shield, sparks, strong shake
      const sh = s < Bt.entry + 1.6 ? 5 : 2;
      const ox = Math.round((Math.random() - 0.5) * sh), oy = Math.round((Math.random() - 0.5) * sh);
      const sky = g.createLinearGradient(0, 0, 0, IH); sky.addColorStop(0, "#1a0e1e"); sky.addColorStop(1, "#7a3a2a"); g.fillStyle = sky; g.fillRect(0, 0, IW, IH);
      this.drawPlanet(g, "mars", 240 + ox, 780 + oy, 640, 0.9, 0, 1.45);
      const cx = 240 + ox, cy = 110 + oy;
      for (let i = 0; i < 6; i++) P.streak.spawn({ x: cx - 30 + Math.random() * 60, y: cy + 10 + Math.random() * 10, vx: -60 - Math.random() * 80, vy: -120 - Math.random() * 120, life: 0.5, s: 4 + Math.random() * 8, c: Math.random() < 0.5 ? "#ff9a40" : "#ffd070", kind: 3 });
      for (let i = 0; i < 3; i++) P.spark.spawn({ x: cx + (Math.random() - 0.5) * 24, y: cy + 14, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 100, life: 0.6, s: 1, c: "#fff0a0", g: 60 });
      g.save(); g.globalCompositeOperation = "lighter"; const eg = g.createRadialGradient(cx, cy + 16, 4, cx, cy + 6, 70); eg.addColorStop(0, "rgba(255,120,40,0.85)"); eg.addColorStop(0.5, "rgba(230,57,70,0.35)"); eg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = eg; g.fillRect(cx - 80, cy - 70, 160, 160); g.restore();
      P.streak.draw(g, s); P.spark.draw(g, s);
      // capsule (heat shield first)
      g.fillStyle = "#e8e4da"; for (let i = 0; i < 18; i++) { const w = Math.round(12 + i * 1.2); g.fillRect(cx - w / 2, cy - 14 + i, w, 1); }
      g.fillStyle = "#5a2a1a"; g.fillRect(cx - 17, cy + 4, 34, 4); g.fillStyle = "#ffb060"; g.fillRect(cx - 16, cy + 7, 32, 2);
      this.tempText(g, s);
    } else {
      // touchdown on the surface + dust cloud
      const sky = g.createLinearGradient(0, 0, 0, 170); sky.addColorStop(0, "#c8955a"); sky.addColorStop(1, "#f2c49a"); g.fillStyle = sky; g.fillRect(0, 0, IW, IH);
      g.fillStyle = "#b4643a"; for (let x = 0; x < IW; x += 2) g.fillRect(x, Math.round(160 - Math.sin(x * 0.02) * 6 - Math.sin(x * 0.05) * 3), 2, 120);
      g.fillStyle = "#c87a48"; g.fillRect(0, 190, IW, 80);
      const k = seg(s, Bt.touchdown - 0.3, Bt.touchdown), ly = lerp(150, 182, easeOut(k));
      g.fillStyle = "#e8e4da"; g.fillRect(226, Math.round(ly - 16), 28, 14); g.fillStyle = "#8b93a6"; g.fillRect(222, Math.round(ly - 2), 4, 8); g.fillRect(254, Math.round(ly - 2), 4, 8); g.fillRect(220, Math.round(ly + 6), 8, 2); g.fillRect(252, Math.round(ly + 6), 8, 2);
      g.fillStyle = "#4ade80"; g.fillRect(236, Math.round(ly - 12), 8, 3);
      if (this.prevS < Bt.touchdown && s >= Bt.touchdown) for (let i = 0; i < 120; i++) { const a = Math.PI + Math.random() * Math.PI; P.smoke.spawn({ x: 240 + (Math.random() - 0.5) * 30, y: 188, vx: Math.cos(a) * (40 + Math.random() * 140), vy: Math.sin(a) * (10 + Math.random() * 50), life: 2.5, s: 3, ds: 6, c: Math.random() < 0.5 ? "#d9a070" : "#c0804c", kind: 1, drag: 0.9 }); }
      P.smoke.draw(g, s);
      if (s < Bt.touchdown + 0.4) { const sh = 4 * (1 - seg(s, Bt.touchdown, Bt.touchdown + 0.4)); g.drawImage(this.out, Math.round((Math.random() - 0.5) * sh), Math.round((Math.random() - 0.5) * sh)); }
      if (s < Bt.dustWipe) this.tempText(g, s);
      // dust-cloud wipe into the next shot
      if (s >= Bt.dustWipe) { const w = ease(seg(s, Bt.dustWipe, 41.0)) * (IW + 160) - 60; g.fillStyle = "#a8683c"; if (w > 0) g.fillRect(0, 0, Math.round(w), IH); for (let y = -10; y < IH + 20; y += 16) { const e = Math.sin(y * 0.3 + s * 6) * 8; pxCircle(g, w + e, y, 16, "#b8784a"); pxCircle(g, w + e - 6, y + 6, 13, "#a8683c"); } }
    }
  },

  tempText(g, s) {
    const Bt = this.Bt, T = INTRO_TIMING.texts.temp;
    if (s < Bt.tempText[0]) return;
    g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(16, 14, textW(T, 2) + 16, 26);
    typeText(g, "temp", T, 24, 20, s, Bt.tempText[0], T.length / (Bt.tempText[1] - Bt.tempText[0]), 2, "#ffe0b0", "#000");
  },

  // ================================================================ SHOT 6 — arrival at the base
  shot_arrival(g, s, ls, dt, t) {
    const Bt = this.Bt, P = this.pools, q = this.q(s);
    // camera follows the group, then slides right to reveal the storm wall
    const lead = this.crewX(s, "lead");
    const follow = Math.max(0, Math.min(420, lead - 180));
    const camX = Math.round(lerp(follow, 420, ease(seg(s, Bt.camSlide, Bt.camSlide + 2.0))));
    // sky
    const sky = g.createLinearGradient(0, 0, 0, 160); sky.addColorStop(0, "#c8955a"); sky.addColorStop(1, "#f2c49a"); g.fillStyle = sky; g.fillRect(0, 0, IW, IH);
    pxCircle(g, 380 - camX * 0.05, 40, 4, "#f8f2e4"); g.globalAlpha = 0.35; pxCircle(g, 380 - camX * 0.05, 40, 7, "#e8f0ff"); g.globalAlpha = 1;
    const phx = Math.round(70 + s * 1.5 - camX * 0.05); // Phobos: small potato-shaped moon
    g.fillStyle = "#9a8a78"; g.fillRect(phx, 48, 11, 6); g.fillRect(phx + 2, 46, 6, 2); g.fillRect(phx + 1, 54, 7, 2); g.fillStyle = "#6a5a4a"; g.fillRect(phx + 7, 48, 4, 6); g.fillRect(phx + 3, 50, 2, 2); g.fillStyle = "#b8a894"; g.fillRect(phx + 2, 47, 3, 1);
    g.save(); g.translate(0, -24);
    // far: the storm wall (slowly closer), a boiling dark-brown front
    const near = seg(s, 41, 52);
    this.stormWall(g, 300 - near * 80 - camX * 0.35, 150, 70 + near * 40, s);
    // mid: dunes + rocky slopes + dust devil
    const mid = camX * 0.5;
    g.fillStyle = "#b4643a"; for (let x = 0; x < IW; x += 2) { const wx = x + mid; g.fillRect(x, Math.round(158 - Math.sin(wx * 0.017) * 10 - Math.sin(wx * 0.043) * 4), 2, 120); }
    for (let i = 0; i < 4; i++) { const mx = Math.round(i * 260 + 120 - mid * 0.9); if (mx < -80 || mx > IW + 80) continue; g.fillStyle = "#a25a34"; for (let x = -40; x <= 40; x += 2) { const h = 14 * Math.sqrt(1 - (x / 40) ** 2) + (Math.abs(x) < 26 ? 4 : 0); g.fillRect(mx + x, Math.round(160 - h), 2, Math.round(h)); } g.fillStyle = "#b8683c"; g.fillRect(mx - 24, 142, 30, 2); }
    const ddx = 300 - mid + Math.sin(s) * 10; for (let i = 0; i < 30; i++) { const y = 160 - i * 2, a = s * 8 + i * 0.6, w = 2 + i * 0.25; g.fillStyle = "rgba(220,170,120,0.5)"; g.fillRect(Math.round(ddx + Math.sin(a) * w), y, 2, 1); }
    // ground (1:1)
    g.fillStyle = "#c87a48"; g.fillRect(0, 186, IW, 120);
    for (let i = 0; i < 70; i++) { const wx = rnd(i, 3) * 1400, x = Math.round(wx - camX); if (x < -4 || x > IW) continue; g.fillStyle = rnd(i, 4) > 0.5 ? "#b06a3c" : "#d98e58"; g.fillRect(x, 192 + Math.round(rnd(i, 5) * 70), 3, 1); }
    g.save(); g.translate(-camX, 0);
    // footprints
    for (const f of this.footprints) { g.fillStyle = "#a8603a"; g.fillRect(Math.round(f.x) - 2, Math.round(f.y), 4, 1); }
    // --- the base (right)
    const bx = 600;
    for (let i = 0; i < 6; i++) { const px = bx - 150 + i * 22; g.fillStyle = "#5a6070"; g.fillRect(px + 8, 200, 2, 18); g.fillStyle = "#1a2a5a"; g.fillRect(px, 190, 18, 11); g.fillStyle = "#2a4aa0"; g.fillRect(px + 1, 191, 16, 9); g.fillStyle = "rgba(170,100,50,0.55)"; g.fillRect(px + 1, 191, 16, 9); g.fillStyle = "#4a7ad0"; g.fillRect(px + 1, 195, 16, 1); }
    g.fillStyle = "#d8d4cc"; g.fillRect(bx - 10, 176, 90, 46); g.fillStyle = "#f4f1ea"; g.fillRect(bx - 10, 176, 90, 3); g.fillStyle = "#b8b2a6"; g.fillRect(bx + 70, 179, 10, 43); g.fillStyle = "#f08a2a"; g.fillRect(bx - 10, 196, 90, 3);
    for (let i = 0; i < 3; i++) { g.fillStyle = "#2a3a5a"; g.fillRect(bx + 30 + i * 14, 184, 8, 6); g.fillStyle = "#ffd890"; g.fillRect(bx + 31 + i * 14, 185, 6, 4); }
    // airlock door
    const doorOpen = s >= Bt.doorOpen ? ease(seg(s, Bt.doorOpen, Bt.doorOpen + 0.5)) : 0;
    g.fillStyle = "#5a5e6a"; g.fillRect(bx, 194, 20, 28); g.fillStyle = "#ffb84a"; g.fillRect(bx + 2, 196, 16, 26);
    g.save(); g.beginPath(); g.rect(bx + 2, 196, 16, 26); g.clip();
    g.fillStyle = "#8b93a6"; g.fillRect(bx + 2, Math.round(196 - doorOpen * 26), 16, 26); g.fillStyle = "#e8c040"; for (let y = 0; y < 26; y += 6) g.fillRect(bx + 2, Math.round(196 - doorOpen * 26 + y), 16, 2);
    g.restore();
    if (doorOpen > 0) { g.save(); g.globalCompositeOperation = "lighter"; const dg = g.createRadialGradient(bx + 10, 214, 2, bx + 10, 214, 60); dg.addColorStop(0, `rgba(255,184,74,${0.6 * doorOpen})`); dg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = dg; g.fillRect(bx - 50, 160, 120, 110); g.restore(); }
    // green dome with a faint purple glow + plant silhouettes
    const dx = bx + 120, dy = 222;
    g.save(); g.globalCompositeOperation = "lighter"; const pg = g.createRadialGradient(dx, dy - 16, 4, dx, dy - 16, 50); pg.addColorStop(0, "rgba(155,93,229,0.35)"); pg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = pg; g.fillRect(dx - 60, dy - 70, 120, 80); g.restore();
    for (let y = -38; y <= 0; y++) { const w = Math.round(Math.sqrt(38 * 38 - y * y) * 1.1); g.fillStyle = y < -36 ? "#c8ffd8" : "rgba(74,222,128,0.55)"; g.fillRect(dx - w, dy + y, w * 2, 1); }
    for (let i = -4; i <= 4; i++) { g.fillStyle = "#1f6a3a"; g.fillRect(dx + i * 8, dy - 12 - (i % 2 ? 6 : 0), 2, 12 + (i % 2 ? 6 : 0)); g.fillRect(dx + i * 8 - 2, dy - 14 - (i % 2 ? 6 : 0), 6, 3); }
    g.strokeStyle = "#e8fff0"; g.lineWidth = 1; g.fillStyle = "#e8fff0"; g.fillRect(dx - 42, dy, 84, 1);
    // antenna + rover
    g.fillStyle = "#8b93a6"; g.fillRect(bx + 60, 140, 2, 36); g.fillRect(bx + 54, 140, 14, 2); pxEllipse(g, bx + 61, 136, 7, 3, "#d8d4cc"); if (((s * 2) | 0) % 2) { g.fillStyle = "#ff4040"; g.fillRect(bx + 60, 130, 2, 2); }
    const rvx = bx + 190; g.fillStyle = "#d8d4cc"; g.fillRect(rvx, 210, 28, 8); g.fillStyle = "#3a3e4a"; [2, 12, 22].forEach((o) => pxCircle(g, rvx + o + 2, 220, 3, "#3a3e4a")); g.fillStyle = "#8b93a6"; g.fillRect(rvx + 20, 200, 2, 10); g.fillRect(rvx + 18, 198, 6, 3);
    // --- the crew
    const crew = [["layla", 2], ["marcus", 1], ["diego", 3], ["lead", 0]];
    for (const [id] of crew) this.drawCrewMember(g, s, q, id);
    P.dust.draw(g, s);
    g.restore();
    // front: rocks + blowing dust
    for (let i = 0; i < 5; i++) { const x = Math.round(((i * 230 + 60) - camX * 1.4) % 1150); if (x < -40 || x > IW) continue; const w = 14 + rnd(i, 1) * 22, h = 8 + rnd(i, 2) * 10; g.fillStyle = "#6a3018"; g.fillRect(x, Math.round(282 - h), Math.round(w), Math.round(h)); g.fillStyle = "#8a4426"; g.fillRect(x + 2, Math.round(280 - h), Math.round(w - 6), Math.round(h * 0.6)); g.fillStyle = "#b05a30"; g.fillRect(x + 4, Math.round(281 - h), Math.round(w * 0.35), 2); }
    g.restore();
    if (Math.random() < 0.9) P.fx.spawn({ x: IW + 2, y: 120 + Math.random() * 150, vx: -80 - Math.random() * 120, vy: Math.random() * 6, life: 5, s: 4 + Math.random() * 6, c: "rgba(230,170,110,0.5)", kind: 3 });
    P.fx.draw(g, s);
    // the storm dims the light (about 10 %)
    g.fillStyle = `rgba(40,16,8,${near * 0.1})`; g.fillRect(0, 0, IW, IH);
    // door -> window transition
    if (s >= Bt.doorToWindow) { const k = ease(seg(s, Bt.doorToWindow, 52.0)); const cx = 600 + 10 - camX, w = lerp(16, IW * 2.2, k), h = lerp(26, IH * 2.2, k); g.fillStyle = "#ffb84a"; g.fillRect(Math.round(cx - w / 2), Math.round(185 - h / 2), Math.round(w), Math.round(h)); }
  },
  stormWall(g, x0, baseY, height, s) {
    const top = (x) => { const d = x - x0; if (d < 0) return baseY; const k = Math.min(1, d / 140); return baseY - height * (k * k * (3 - 2 * k)); };
    // body
    g.fillStyle = "#4a2414";
    for (let x = Math.max(0, Math.floor(x0)); x < IW; x += 2) { const ty = top(x) + 6; g.fillRect(x, Math.round(ty), 2, Math.round(baseY - ty + 2)); }
    // boiling billows along the edge
    for (let i = 0; i < 40; i++) {
      const x = x0 + i * 11 + Math.sin(s * 0.7 + i) * 2; if (x > IW + 20) break; if (x < -20) continue;
      const r = 8 + (i % 3) * 3 + Math.round(Math.sin(s * 2.2 + i * 1.7) * 1.5), y = top(x) + 6;
      pxCircle(g, x, y - 2, r, "#7a4426"); pxCircle(g, x + 1, y, r - 1, "#5e3018"); pxCircle(g, x + 2, y + 4, r - 2, "#4a2414");
    }
    // inner swirls
    for (let i = 0; i < 30; i++) { const x = x0 + 30 + rnd(i, 3) * 400, y = baseY - rnd(i, 4) * height * 0.8; if (x > IW || y < top(x) + 10) continue; g.fillStyle = "rgba(140,80,46,0.6)"; g.fillRect(Math.round(x + Math.sin(s + i) * 3), Math.round(y), 6, 1); }
  },
  // crew paths (world x) — hops toward the door, then the door positions
  crewX(s, id) {
    const Bt = this.Bt;
    const start = { lead: 150, layla: 118, marcus: 70, diego: 96 }[id];
    const door = { lead: 588, diego: 610, marcus: 634, layla: 556 }[id];
    let x = lerp(start, door, ease(seg(s, 41.0, Bt.atDoor)) * 0.15 + seg(s, 41.0, Bt.atDoor) * 0.85);
    if (id === "layla") { // catches up, stops at the glove moment, then follows
      const k = seg(s, 41.0, Bt.atDoor);
      x = lerp(start, door, k);
      if (between(s, 41.8, Bt.laylaGlove)) x = lerp(lerp(start, door, seg(41.8, 41.0, Bt.atDoor)), this.crewX(Bt.laylaGlove, "lead") - 14, seg(s, 41.8, Bt.laylaGlove));
      if (between(s, Bt.laylaGlove, 44.2)) x = this.crewX(Bt.laylaGlove, "lead") - 14 + (s < 43.5 ? (s - Bt.laylaGlove) * 30 : 30);
      if (s >= 44.2) x = lerp(this.crewX(Bt.laylaGlove, "lead") + 16, door, ease(seg(s, 44.2, Bt.atDoor + 0.6)));
    }
    if (s >= Bt.doorOpen + 0.3) { // walk into the airlock one by one
      const order = { lead: 0, diego: 1, marcus: 2, layla: 3 }[id], k = seg(s, Bt.doorOpen + 0.3 + order * 0.25, Bt.doorOpen + 0.8 + order * 0.25);
      x = lerp(x, 610, k);
    }
    return x;
  },
  drawCrewMember(g, s, q, id) {
    const Bt = this.Bt;
    if (s >= Bt.doorOpen + 0.3) { const order = { lead: 0, diego: 1, marcus: 2, layla: 3 }[id]; if (s > Bt.doorOpen + 0.8 + order * 0.25) return; }
    const x = this.crewX(s, id);
    const moving = s < Bt.atDoor + (id === "layla" ? 0.6 : 0) && !(id === "layla" && between(s, 43.5, 44.2));
    const cfg = { lead: { off: 0, h: 18 }, layla: { off: 0.4, h: 16 }, marcus: { off: 0.75, h: 15 }, diego: { off: 0.2, h: 24 } }[id];
    const cyc = 1.15, ph = ((s + cfg.off) % cyc) / cyc, airT = 0.9 / cyc;
    let air = 0;
    if (moving && ph < airT) air = Math.sin((ph / airT) * Math.PI);
    const y = 228 + ({ lead: 0, layla: -3, marcus: -6, diego: 3 }[id]) - Math.round(air * cfg.h);
    // landing puff + footprint + footstep
    const key = "_land_" + id, landed = moving && ph >= airT;
    if (landed && !this[key]) { for (let i = 0; i < 8; i++) this.pools.dust.spawn({ x: x + (Math.random() - 0.5) * 8, y: y - 1, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 14, life: 0.34, s: 2, c: Math.random() < 0.5 ? "#e0a96d" : "#c88a58", g: 30 }); this.footprints.push({ x, y }); if (this.footprints.length > 80) this.footprints.shift(); if (id === "lead") Sound.play("step", "sand"); }
    this[key] = landed;
    const o = { f: 1, look: 1, step: moving ? s * 9 : 0, air, t: s, tilt: 0 };
    if (id === "lead") {
      o.tilt = 1; o.band = 0.55 + seg(s, 41, 52) * 0.4; // storm in the visor he never looks at
      if (between(s, Bt.laylaGlove, Bt.laylaGlove + 1.0)) o.gloveCheck = true;
      if (between(s, Bt.laylaGlove + 0.4, Bt.laylaGlove + 0.9)) { o.arm = "waveoff"; o.armK = Math.sin(seg(s, Bt.laylaGlove + 0.4, Bt.laylaGlove + 0.9) * Math.PI); }
    }
    if (id === "layla") {
      if (between(s, Bt.laylaGlove, Bt.laylaGlove + 1.0)) { o.arm = "point"; o.look = 1; o.tilt = 2; }
      if (between(s, 43.5, 44.2)) { o.tilt = -1; o.look = 1; o.step = 0; } // stops, head tilted
      if (s >= Bt.atDoor) { o.look = 1; o.tilt = -3; } // looks at the dome
    }
    if (id === "marcus") {
      o.tilt = -3; o.arm = "tablet"; // watching the storm
      if (between(s, Bt.laylaGlove + 0.3, Bt.laylaGlove + 0.7)) o.tilt = 1;
      if (s >= Bt.atDoor) { o.look = -1; o.tilt = 0; }
    }
    if (id === "diego") {
      o.look = ((q / 0.6) | 0) % 2 ? 1 : -1;
      if (((s / 2.3) | 0) % 2 === 0 && moving) o.arm = "wave";
      if (s >= Bt.atDoor) o.look = ((q / 0.5) | 0) % 2 ? -1 : 1;
    }
    if (o.arm === "tablet") o.arm = undefined;
    figHelmet(g, id, x, y, o);
  },

  // ================================================================ SHOT 7 — control room
  shot_control(g, s, ls, dt, t) {
    const Bt = this.Bt, q = this.q(s), b = this.bg;
    if (s < Bt.insideCut) {
      // push-in on a round window: dusty glass, the storm reflected
      b.fillStyle = "#cfcac0"; b.fillRect(0, 0, IW, IH);
      for (let y = 0; y < IH; y += 34) { b.fillStyle = "#b8b2a6"; b.fillRect(0, y, IW, 1); } for (let x = 0; x < IW; x += 70) { b.fillStyle = "#b8b2a6"; b.fillRect(x, 0, 1, IH); }
      for (let i = 0; i < 40; i++) { b.fillStyle = "#8a8478"; b.fillRect(Math.round(rnd(i, 1) * IW), Math.round(rnd(i, 2) * IH), 1, 1); }
      pxCircle(b, 240, 135, 82, "#6a6e7a"); pxCircle(b, 240, 135, 76, "#8b93a6"); pxCircle(b, 240, 135, 70, "#2a1e1a");
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; b.fillStyle = "#4a4e5a"; b.fillRect(Math.round(240 + Math.cos(a) * 79) - 1, Math.round(135 + Math.sin(a) * 79) - 1, 3, 3); }
      // reflected storm
      b.save(); b.beginPath(); b.arc(240, 135, 70, 0, 7); b.clip();
      const sk = b.createLinearGradient(0, 65, 0, 205); sk.addColorStop(0, "#c8955a"); sk.addColorStop(1, "#7a4a2a"); b.fillStyle = sk; b.fillRect(170, 65, 140, 140);
      b.fillStyle = "#a25a34"; b.fillRect(170, 168, 140, 40);
      this.stormWall(b, 150, 170, 70, s);
      b.fillStyle = "rgba(200,150,110,0.35)"; b.fillRect(170, 65, 140, 140);
      for (let i = 0; i < 70; i++) { b.fillStyle = "rgba(255,230,200,0.45)"; b.fillRect(170 + Math.round(rnd(i, 7) * 140), 65 + Math.round(rnd(i, 8) * 140), 1, 1); }
      b.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 5; i++) b.fillRect(196 + i * 3, 92 + i * 3, 22, 1);
      b.restore();
      this.cam(g, 240, 135, lerp(1, 1.35, ease(seg(s, 52.0, Bt.insideCut))));
      if (s < 52.4) { g.fillStyle = `rgba(255,184,74,${1 - seg(s, 52.0, 52.4)})`; g.fillRect(0, 0, IW, IH); }
      return;
    }
    // inside: same room as shot 1, calm and warm
    this.drawControlRoom(b, s, true);
    const lvl = (() => { const SW = SpaceWeather; if (SW.status !== "live" && SW.status !== "archived") return "...";  const r = SW.risk(); return ({ quiet: "LOW", M: "MEDIUM", X: "HIGH" })[r] + (SW.status === "archived" ? " (ARCHIVED)" : ""); })();
    b.fillStyle = "#0e2a24"; b.fillRect(152, 112, 176, 20); pxText(b, "SOLAR ACTIVITY TODAY:", 156, 114, 1, "#ffd34a"); pxText(b, lvl, 156, 123, 1, "#ffffff");
    b.save(); b.globalCompositeOperation = "lighter"; const wg = b.createRadialGradient(240, 60, 10, 240, 120, 260); wg.addColorStop(0, "rgba(255,226,180,0.2)"); wg.addColorStop(1, "rgba(0,0,0,0)"); b.fillStyle = wg; b.fillRect(0, 0, IW, IH); b.restore();
    bustBack(b, "marcus", 338, 198, { breathe: this.breathe(q, 0.6) });
    // Damon: three-quarter view, hands on the console edge
    let turn = 0.25, gx = 0.6, gy = 0, brow = "neutral", arm = "console", armK = 1, breathe = this.breathe(q), mouth = "closed";
    if (s >= Bt.damonLook && s < Bt.damonLook + 1.2) { turn = 0.6; gx = 1; brow = "worry"; }
    if (s >= Bt.starTouch) { arm = "star"; armK = ease(seg(s, Bt.starTouch, Bt.starTouch + 0.8)); gx = 0.2; }
    if (s >= Bt.breath) { const k = seg(s, Bt.breath, Bt.breath + 0.8) - seg(s, Bt.breath + 1.4, Bt.breath + 2.2); breathe = Math.round(k * 2); if (between(s, Bt.breath + 0.1, Bt.breath + 0.8)) gy = 1; if (s >= Bt.breath + 0.8) { brow = "firm"; gy = 0; gx = 0; } }
    const bodyTurn = s >= Bt.damonLook + 2 / 12 && s < Bt.damonLook + 1.2 + 2 / 12 ? 0.6 : 0.25; // body follows the head 2 frames later
    bust(b, "lead", 160, 240, { f: 1, turn, bodyTurn, gx, gy, brow, mouth, arm, armK, star: true, glint: s >= Bt.starTouch + 0.8 && s < Bt.starTouch + 1.05 ? 1 : 0, breathe, blink: s < Bt.damonLook ? this.blink(q, 0.3, 3.6) : s > Bt.breath + 1 ? this.blink(q, 0.9, 4) : 0 });
    // console rail in front
    b.fillStyle = "#3c4258"; b.fillRect(0, 252, IW, 18); b.fillStyle = "#5a6280"; b.fillRect(0, 252, IW, 2);
    for (let x = 20; x < IW; x += 14) { b.fillStyle = rnd(x, (s * 2) | 0) > 0.5 ? "#5dff8a" : "#1a1d2a"; b.fillRect(x, 260, 3, 2); }
    const z = lerp(1, 1.08, ease(seg(s, Bt.insideCut, 63.5)));
    this.cam(g, 236, 146, z);
    // final line
    if (s >= Bt.finalText[0]) { g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(0, 20, IW, 30); typeText(g, "final", INTRO_TIMING.texts.final, Math.round((IW - textW(INTRO_TIMING.texts.final, 2)) / 2), 28, s, Bt.finalText[0], INTRO_TIMING.texts.final.length / (Bt.finalText[1] - Bt.finalText[0]), 2, "#e0a96d", "#000"); }
    // pixel dither dissolve into the top-down game room
    if (s >= Bt.dissolve) {
      const k = seg(s, Bt.dissolve, this.endT);
      renderWorld(Game.lg, t, dt);
      const tg = this.tmp.getContext("2d"); tg.imageSmoothingEnabled = false; tg.globalCompositeOperation = "source-over"; tg.clearRect(0, 0, IW, IH);
      tg.drawImage(Game.low, 0, 0, IW, IH);
      tg.globalCompositeOperation = "destination-in"; tg.drawImage(ditherMask(k * 16), 0, 0);
      g.drawImage(this.tmp, 0, 0);
    }
  },
};

// smooth value noise used by the planets
const _ng = Array.from({ length: 64 * 32 }, (_, i) => hash(i % 64, (i / 64) | 0));
function noise2(x, y) {
  let tot = 0, amp = 1, norm = 0;
  for (let o = 0; o < 3; o++) {
    const fx = (x * 64) / (Math.PI * 2) * (1 << o), fy = ((y + Math.PI / 2) / Math.PI) * 32 * (1 << o);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    const v = (a, b) => _ng[((((b % 32) + 32) % 32) * 64) + (((a % 64) + 64) % 64)];
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const n = lerp(lerp(v(x0, y0), v(x0 + 1, y0), sx), lerp(v(x0, y0 + 1), v(x0 + 1, y0 + 1), sx), sy);
    tot += n * amp; norm += amp; amp *= 0.5;
  }
  return tot / norm;
}
