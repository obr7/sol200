// =====================================================================
//  MAIN — game loop, input (keyboard / mouse / touch), characters,
//  path-finding, interactions, objectives.
// =====================================================================
const G = {
  meters: { ...BALANCE.start }, discovered: new Set(), storm: 0, alarm: false, power: 1, rosieBroken: false,
  trays: [{}, {}, {}, {}, {}, {}], panels: [0.85, 0.85, 0.85, 0.85, 0.85, 0.85], hatchOpen: false, d1: null, d2: null, hopeNewLeaf: false, flags: {},
};
function resetState() {
  Object.assign(G, { meters: { ...BALANCE.start }, storm: 0, alarm: false, power: 1, rosieBroken: false, trays: [{}, {}, {}, {}, {}, {}], panels: [0.85, 0.85, 0.85, 0.85, 0.85, 0.85], hatchOpen: false, d1: null, d2: null, hopeNewLeaf: false, hopeDead: false, flags: {} });
}

function makeChar(id, sprite, tx, ty) { return { id, sprite, x: tx * T + 8, y: ty * T + 12, dir: 0, moving: false, walkT: 0, blinkOff: Math.random() * 4, visible: true, path: null, speed: 52, follow: null, helmet: false, hurt: false }; }

const Game = {
  chars: [], player: null, npc: {}, interactables: [], mode: "boot", room: null, target: null, guidePath: null, guideT: 0,
  keys: {}, joy: { x: 0, y: 0 }, trail: [], lastStepSound: 0, onRoomEnter: null, freeze: false,

  init() {
    buildMap(); initProps(); renderStaticMap(); buildCharSprites(); buildCharSprites2(); buildPortraits();
    this.player = makeChar("lead", "lead", 29, 9); this.player.speed = 78; this.player.dir = 1;
    this.npc.marcus = makeChar("marcus", "marcus", 28, 4); this.npc.marcus.dir = 1;
    this.npc.diego = makeChar("diego", "diego", 12, 25);
    this.npc.layla = makeChar("layla", "layla", 34, 22);
    this.chars = [this.player, this.npc.marcus, this.npc.diego, this.npc.layla];
    try { const s = JSON.parse(localStorage.getItem("sol200_progress") || "{}"); (s.discovered || []).forEach((k) => G.discovered.add(k)); this.introSeen = !!s.introSeen; } catch (e) {}
    this.buildFactInteractables();
    UI.init(); UI.buildMeters(); this.updateJournal();
    this.setupInput(); this.resize(); window.addEventListener("resize", () => this.resize());
    this.canvas = $("#screen"); this.low = mkCanvas(VW, VH); this.lg = this.low.getContext("2d"); this.lg.imageSmoothingEnabled = false;
    this.last = performance.now(); requestAnimationFrame((t) => this.loop(t));
  },
  fullscreen(force) {
    try {
      const d = document, on = !!(d.fullscreenElement || d.webkitFullscreenElement);
      if (on && !force) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      if (on) return;
      const el = d.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) { const p = req.call(el, { navigationUI: "hide" }); if (p && p.catch) p.catch(() => {}); if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }
      else UI.toast("Full screen isn't supported here. Tip: add the page to your Home Screen.");
    } catch (e) {}
  },
  saveProgress() { try { localStorage.setItem("sol200_progress", JSON.stringify({ discovered: [...G.discovered], introSeen: this.introSeen })); } catch (e) {} },
  updateJournal() { $("#jcount").textContent = G.discovered.size; },

  // ------------------------------------------------------------ resize (16:9 letterbox)
  resize() {
    const W = window.innerWidth, H = window.innerHeight;
    let w = W, h = W * 9 / 16; if (h > H) { h = H; w = H * 16 / 9; }
    const st = $("#stage"); st.style.width = w + "px"; st.style.height = h + "px"; st.style.fontSize = Math.max(9, w / 56) + "px";
    const c = $("#screen"), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    this.scale = w / VW; this.stageW = w; this.stageH = h;
  },

  // ------------------------------------------------------------ input
  setupInput() {
    window.addEventListener("keydown", (e) => {
      Sound.init();
      if (e.target && e.target.tagName === "INPUT") return;
      const k = keyOf(e);
      if (UI.busy()) {
        if (k === " " || k === "Enter" || k === "e" || k === "E") { e.preventDefault(); if (!e.repeat) UI.action(); return; }
        UI.key(k.length === 1 ? k.toLowerCase() : k); if (k.startsWith("Arrow") || k === " ") e.preventDefault(); return;
      }
      this.keys[k.toLowerCase()] = true;
      if (k === " " || k === "Enter" || k === "e" || k === "E") { e.preventDefault(); if (!e.repeat) this.tryInteract(); }
      if (k.startsWith("Arrow")) e.preventDefault();
      if (this.mode === "play" && !this.freeze) { if (k === "m" || k === "M") UI.map(); if (k === "j" || k === "J") UI.journal(); }
      if (this.debugKeys && k === "F2") Story.debugSkip && Story.debugSkip();
    });
    window.addEventListener("keyup", (e) => { this.keys[keyOf(e).toLowerCase()] = false; });
    window.addEventListener("blur", () => { this.keys = {}; });
    const cv = $("#stage");
    cv.addEventListener("pointerdown", (e) => {
      Sound.init();
      if (e.target.id !== "screen") return;
      if (this.mode !== "play" || UI.busy() || this.freeze) return;
      if (e.pointerType === "touch") return; // touch uses joystick + A
      const r = $("#screen").getBoundingClientRect();
      const wx = (e.clientX - r.left) / r.width * VW + Cam.x, wy = (e.clientY - r.top) / r.height * VH + Cam.y;
      // clicked an interactable?
      const it = this.interactables.filter((i) => i.enabled()).find((i) => Math.hypot(i.x - wx, i.y - 8 - wy) < 18 && roomVisible(i));
      if (it) { this.walkPlayerTo(it.x, it.y + 4, () => this.useInteractable(it)); return; }
      this.walkPlayerTo(wx, wy + 6);
    });
    // touch
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) document.body.classList.add("touch");
    const stick = $("#stick"), knob = $("#knob"); let sid = null, sc = null;
    stick.addEventListener("pointerdown", (e) => { Sound.init(); sid = e.pointerId; const r = stick.getBoundingClientRect(); sc = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; stick.setPointerCapture(sid); move(e); });
    const move = (e) => { if (e.pointerId !== sid) return; let dx = e.clientX - sc.x, dy = e.clientY - sc.y; const d = Math.hypot(dx, dy), m = sc.r * 0.8; if (d > m) { dx *= m / d; dy *= m / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; this.joy = { x: dx / m, y: dy / m }; };
    stick.addEventListener("pointermove", move);
    const end = (e) => { if (e.pointerId !== sid) return; sid = null; knob.style.transform = ""; this.joy = { x: 0, y: 0 }; };
    stick.addEventListener("pointerup", end); stick.addEventListener("pointercancel", end);
    $("#abtn").addEventListener("pointerdown", (e) => { e.preventDefault(); Sound.init(); if (UI.busy()) UI.action(); else this.tryInteract(); });
    $("#btnMap").onclick = () => { if (!UI.busy()) UI.map(); };
    $("#btnFull").onclick = () => this.fullscreen();
    document.addEventListener("fullscreenchange", () => setTimeout(() => this.resize(), 100));
    $("#minimapWrap").onclick = () => { if (!UI.busy() && this.mode === "play") UI.map(); };
    $("#btnJournal").onclick = () => { if (!UI.busy()) UI.journal(); };
    $("#btnSettings").onclick = () => { if (!UI.busy()) UI.settings(); };
  },

  // ------------------------------------------------------------ path-finding (BFS on tiles)
  blockedTile(x, y) {
    if (!isFloor(x, y) || dynSolid.has(idx(x, y))) return true;
    const px = x * T + 8, py = y * T + 10;
    for (const p of PROPS) if (p.solid && px >= p.x - 3 && px < p.x + p.pw + 3 && py >= p.y && py < p.y + p.ph + 5) return true;
    return false;
  },
  findPath(sx, sy, ex, ey) {
    const s = [Math.floor(sx / T), Math.floor(sy / T)];
    let e = [Math.floor(ex / T), Math.floor(ey / T)];
    if (this.blockedTile(...e)) { // nearest free tile to target
      let best = null, bd = 1e9;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = e[0] + dx, y = e[1] + dy; if (!this.blockedTile(x, y)) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [x, y]; } } }
      if (!best) return null; e = best;
    }
    const prev = new Map(), q = [s], key = (x, y) => y * MW + x; prev.set(key(...s), null);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === e[0] && y === e[1]) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (prev.has(k) || this.blockedTile(nx, ny)) continue; prev.set(k, key(x, y)); q.push([nx, ny]); }
    }
    if (!prev.has(key(...e))) return null;
    const path = []; let k = key(...e);
    while (k !== null) { path.unshift({ x: (k % MW) * T + 8, y: Math.floor(k / MW) * T + 11 }); k = prev.get(k); }
    path.shift();
    if (path.length) { path[path.length - 1] = { x: ex, y: ey }; if (!boxFree(ex, ey)) path[path.length - 1] = { x: e[0] * T + 8, y: e[1] * T + 11 }; }
    return path;
  },
  walkPlayerTo(x, y, then) { const p = this.findPath(this.player.x, this.player.y, x, y); if (!p) return; this.player.path = p; this.player.onArrive = then; },
  walkNpc(c, x, y, opt = {}) { return new Promise((res) => { const p = this.findPath(c.x, c.y, x, y); if (!p || !p.length) { if (!p) { c.x = x; c.y = y; } res(); return; } const sp0 = c.speed; if (opt.speed) c.speed = opt.speed; const fin = () => { c.speed = sp0; res(); }; c.path = p; c.onArrive = fin; setTimeout(() => { if (c.onArrive === fin) { c.path = null; c.onArrive = null; if (opt.snap) { c.x = x; c.y = y; } fin(); } }, opt.timeout || 6000); }); },
  runTo(c, tx, ty, dir) { return this.walkNpc(c, tx * T + 8, ty * T + 12, { speed: 96, timeout: 25000, snap: true }).then(() => { c.dir = dir; }); },
  place(c, tx, ty, dir = 0) { c.x = tx * T + 8; c.y = ty * T + 12; c.dir = dir; c.path = null; },

  // ------------------------------------------------------------ interactables
  buildFactInteractables() {
    for (const p of PROPS) {
      if (p.fact) this.addInteract({ id: "fact_" + p.id, x: p.x + p.pw / 2, y: p.y + p.ph + 8, label: "Inspect", name: p.label, fact: p.fact, use: () => UI.fact(p.fact), marker: () => !G.discovered.has(p.fact) ? "?" : null });
    }
    const pt = propById.photo_table; this.addInteract({ id: "photo", x: pt.x + pt.pw / 2, y: pt.y + pt.ph + 8, label: "Look", name: "Crew photo album", use: () => PhotoAlbum.open(), marker: () => G.flags && G.flags.photo ? null : "?" });
    const ht = propById.holo_table; this.addInteract({ id: "holo", x: ht.x + ht.pw / 2, y: ht.y + ht.ph + 8, label: "Explore", name: "Mars hologram", use: () => MarsGlobe.open() });
    const hp = propById.hope; this.addInteract({ id: "hope", x: hp.x + 8, y: hp.y + hp.ph + 8, label: "Look", name: "Hope", use: () => Story.hope() });
  },
  addInteract(o) { o.r = o.r || 24; o.enabled = o.enabled || (() => true); this.interactables = this.interactables.filter((i) => i.id !== o.id); this.interactables.push(o); return o; },
  removeInteract(id) { this.interactables = this.interactables.filter((i) => i.id !== id); },
  nearestInteract() {
    const P = this.player; let best = null, bd = 1e9;
    for (const i of this.interactables) { if (!i.enabled()) continue; const raw = Math.hypot(i.x - P.x, i.y - P.y); const d = raw - (i.marker && i.marker() === "!" ? 40 : 0); if (raw < i.r && d < bd && roomVisible(i)) { bd = d; best = i; } }
    return best;
  },
  tryInteract() { if (this.mode !== "play" || this.freeze || UI.busy()) return; const it = this.nearestInteract(); if (it) this.useInteractable(it); },
  async useInteractable(it) {
    if (UI.busy() || this.freeze) return;
    const P = this.player; const dx = it.x - P.x, dy = (it.y - 10) - P.y;
    P.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    if (it.npc) { const n = it.npc; const ddx = P.x - n.x, ddy = P.y - n.y; n.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 2 : 3) : (ddy < 0 ? 1 : 0); }
    Sound.play("click");
    this.freeze = true; try { await it.use(); } finally { this.freeze = false; }
  },
  // wait until the player interacts with an NPC / thing
  waitTalk(id, npc, label = "Talk", extra = {}) {
    return new Promise((res) => {
      const c = npc;
      this.addInteract({ id, npc: c, get x() { return c.x; }, get y() { return c.y + 6; }, r: 26, label, name: c ? CONFIG.NAMES[c.id] : extra.name, marker: () => "!", use: async () => { this.removeInteract(id); res(); }, ...extra });
    });
  },
  waitRoom(room) { return new Promise((res) => { if (this.room === room) { res(); return; } this.onRoomEnter = (r) => { if (r === room) { this.onRoomEnter = null; res(); } }; }); },
  setTarget(t) { this.target = t; this.guidePath = null; this.guideT = 0; },

  // ------------------------------------------------------------ minimap (top-right) with route line
  drawMinimap(t) {
    const c = $("#minimap"); if (!c) return; const g = c.getContext("2d");
    const S = 3, ox = 0, oy = 0, P = this.player; // 80x40 tiles -> 240x120 (+12 for margin)
    g.clearRect(0, 0, c.width, c.height);
    const mx = (x) => ox + x / T * S, my = (y) => oy + 6 + y / T * S;
    // corridors
    g.fillStyle = this.room === "corridor" ? "#5a6390" : "#2c3250";
    for (const [x, y, w, h] of CORRIDORS) g.fillRect(x * S, 6 + y * S, w * S, h * S);
    // rooms
    for (const [id, r] of Object.entries(ROOMS)) {
      const here = this.room === id, isTarget = this.target && roomAt(this.target.x, this.target.y) === id;
      g.fillStyle = id === "outside" ? (here ? "#b5602f" : "#5a2c16") : here ? shade(r.wall, 0.35) : shade(r.wall, -0.45);
      g.fillRect(r.x * S, 6 + r.y * S, r.w * S, r.h * S);
      g.strokeStyle = isTarget ? `rgba(255,211,74,${0.6 + Math.sin(t * 6) * 0.4})` : here ? "#ffffff" : "rgba(255,255,255,0.15)";
      g.lineWidth = isTarget || here ? 2 : 1; g.strokeRect(r.x * S + 0.5, 6 + r.y * S + 0.5, r.w * S - 1, r.h * S - 1);
    }
    if (!G.hatchOpen) { g.fillStyle = "#e8c040"; g.fillRect(53 * S, 6 + 8 * S, S, 2 * S); }
    // route
    const label = $("#mmLabel");
    if (this.target && this.guidePath && this.guidePath.length > 1) {
      g.save(); g.strokeStyle = "#ffd34a"; g.lineWidth = 2; g.setLineDash([4, 3]); g.lineDashOffset = -t * 12; g.lineJoin = "round";
      g.beginPath(); this.guidePath.forEach((p, i) => i ? g.lineTo(mx(p.x), my(p.y)) : g.moveTo(mx(p.x), my(p.y))); g.stroke(); g.restore();
      const tx = mx(this.target.x), ty = my(this.target.y);
      g.fillStyle = "#ffd34a"; g.beginPath(); g.arc(tx, ty, 3 + Math.sin(t * 6), 0, 7); g.fill();
      g.strokeStyle = `rgba(255,211,74,${0.8 - ((t * 1.5) % 1) * 0.8})`; g.lineWidth = 1.5; g.beginPath(); g.arc(tx, ty, 3 + ((t * 1.5) % 1) * 9, 0, 7); g.stroke();
      const tr = roomAt(this.target.x, this.target.y);
      label.innerHTML = tr && ROOMS[tr] ? `GO TO <b>${ROOMS[tr].name}</b>` : "FOLLOW THE LINE";
    } else label.textContent = this.room && ROOMS[this.room] ? ROOMS[this.room].name : this.room === "corridor" ? "CORRIDOR" : "";
    // player
    const px = mx(P.x), py = my(P.y);
    g.fillStyle = "#fff"; g.beginPath(); g.arc(px, py, 3.5, 0, 7); g.fill();
    g.fillStyle = "#e04848"; g.beginPath(); g.arc(px, py, 2.5, 0, 7); g.fill();
  },

  // ------------------------------------------------------------ world markers (drawn inside world transform)
  drawWorldMarkers(g, t, visible) {
    for (const i of this.interactables) {
      if (!i.enabled() || !i.marker) continue;
      const m = i.marker(); if (!m) continue;
      const x = Math.round(i.x), y = Math.round((i.npc ? i.npc.y - charHeadOffset() : i.y - 30) + Math.sin(t * 4) * 2);
      if (!visible(i.x, i.y - 10)) continue;
      g.fillStyle = m === "!" ? "#ffd34a" : "#7ad8ff"; g.fillRect(x - 4, y - 6, 9, 10); g.fillStyle = "#1b1d2b"; g.fillRect(x - 4, y + 4, 9, 1); g.fillRect(x, y + 4, 1, 2);
      g.font = "bold 8px monospace"; g.fillStyle = "#1b1d2b"; g.textAlign = "center"; g.fillText(m, x + 0.5, y + 2.5); g.textAlign = "left";
    }
    // guide arrow toward objective
    if (this.target && this.guidePath && this.guidePath.length > 2) {
      // glowing breadcrumbs on the floor
      const n = Math.min(this.guidePath.length - 1, 14);
      for (let i = 2; i <= n; i++) {
        const p = this.guidePath[i], ph = (t * 3 - i * 0.35) % 1.2;
        const a = Math.max(0.15, 1 - i / (n + 2)) * (ph > 0 && ph < 0.4 ? 1 : 0.45);
        g.fillStyle = `rgba(255,211,74,${a})`; g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 3, 3, 3);
      }
    }
    if (this.target && this.guidePath && this.guidePath.length > 1) {
      const P = this.player;
      const a = Math.atan2(this.target.y - P.y, this.target.x - P.x), r = 34 + Math.sin(t * 6) * 3;
      const ax = P.x + Math.cos(a) * r, ay = P.y - 4 + Math.sin(a) * r;
      g.save(); g.translate(Math.round(ax), Math.round(ay)); g.rotate(a); g.fillStyle = "#ffd34a"; g.strokeStyle = "#5a2e10"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(9, 0); g.lineTo(-4, -7); g.lineTo(-1, 0); g.lineTo(-4, 7); g.closePath(); g.stroke(); g.fill(); g.restore();
    }
    if (this.target && this.target.mark !== false) {
      const tx = this.target.x, ty = this.target.y; const d = Math.hypot(tx - this.player.x, ty - this.player.y);
      if (d > 30 && visible(tx, ty - 8)) { const y = ty - 40 + Math.sin(t * 5) * 3; g.fillStyle = "#ffd34a"; g.beginPath(); g.moveTo(tx - 5, y); g.lineTo(tx + 5, y); g.lineTo(tx, y + 7); g.fill(); }
    }
  },

  // ------------------------------------------------------------ update
  updateChar(c, dt) {
    let vx = 0, vy = 0;
    if (c === this.player && this.mode === "play" && !this.freeze && !UI.busy()) {
      const K = this.keys;
      vx = (K["arrowright"] || K["d"] ? 1 : 0) - (K["arrowleft"] || K["a"] ? 1 : 0);
      vy = (K["arrowdown"] || K["s"] ? 1 : 0) - (K["arrowup"] || K["w"] ? 1 : 0);
      if (Math.abs(this.joy.x) > 0.2 || Math.abs(this.joy.y) > 0.2) { vx = this.joy.x; vy = this.joy.y; }
      if (vx || vy) c.path = null;
    }
    if (c.follow && !c.path) {
      const tr = this.trail; const tgt = tr[Math.max(0, tr.length - 14)];
      if (tgt && Math.hypot(tgt.x - c.x, tgt.y - c.y) > 6 && Math.hypot(c.follow.x - c.x, c.follow.y - c.y) > 18) { vx = tgt.x - c.x; vy = tgt.y - c.y; }
      if (Math.hypot(c.follow.x - c.x, c.follow.y - c.y) > 140) { c.x = c.follow.x; c.y = c.follow.y - 2; }
    }
    if (c.path && c.path.length && !(c === this.player && UI.busy())) {
      const wp = c.path[0]; const dx = wp.x - c.x, dy = wp.y - c.y, d = Math.hypot(dx, dy);
      if (d < 2) { c.path.shift(); if (!c.path.length) { c.path = null; const cb = c.onArrive; c.onArrive = null; if (cb) cb(); } }
      else { vx = dx / d; vy = dy / d; }
    }
    if (c !== this.player && !c.path && !c.follow && !vx && !vy && this.mode === "play") { const P = this.player, dx = P.x - c.x, dy = P.y - c.y; if (Math.hypot(dx, dy) < 44) c.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); }
    let len = Math.hypot(vx, vy);
    // smooth start / stop for the player (ease in and out instead of instant speed)
    if (c === this.player) {
      const want = len > 0 ? 1 : 0;
      c.sv = (c.sv || 0) + (want - (c.sv || 0)) * Math.min(1, dt * (want ? 11 : 18));
      if (len > 0) { c.lvx = vx / Math.max(1, len); c.lvy = vy / Math.max(1, len); }
      else if (c.sv > 0.05 && !c.path && (c.lvx || c.lvy)) { vx = c.lvx; vy = c.lvy; len = 1; }
      if (UI.busy() || this.freeze) { c.sv = 0; if (!c.path) len = 0; }
    }
    if (len > 0) {
      vx /= Math.max(1, len); vy /= Math.max(1, len);
      const ease = c === this.player && !c.path ? Math.max(0.15, c.sv || 0) : 1;
      const sp = c.speed * ease * (c === this.player && this.room === "outside" ? 0.85 : 1) * (c.follow ? 1.15 : 1);
      const ox = c.x, oy = c.y;
      const nx = c.x + vx * sp * dt, ny = c.y + vy * sp * dt;
      const ignore = !!c.path && c !== this.player && c.ghost;
      let moved = false;
      if (ignore || boxFree(nx, c.y)) { c.x = nx; moved = true; }
      if (ignore || boxFree(c.x, ny)) { c.y = ny; moved = true; }
      if (!moved && c.path) { c.path = null; const cb = c.onArrive; c.onArrive = null; if (cb) cb(); }
      c.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 2 : 3) : (vy < 0 ? 1 : 0);
      const dist = Math.hypot(c.x - ox, c.y - oy);
      c.moving = moved && dist > 0.05; c.walkT += dt; c.walkDist = (c.walkDist || 0) + dist; c.idleT = 0;
      if (c.moving && c === this.player) { const st = Math.floor(c.walkDist / 16); if (st !== this._lf) { this._lf = st; Sound.play("step", this.room === "outside" ? "sand" : "metal"); } }
    } else { c.moving = false; c.walkT = 0; c.idleT = (c.idleT || 0) + dt; }
  },
  loop(now) {
    document.body.classList.toggle("playing", this.mode === "play");
    // the alarm sound always follows the red alarm light (they start and stop together)
    { const want = !!G.alarm && (this.mode === "play" || this.mode === "cutscene"); if (want && !this._alarmOn) { this._alarmOn = true; Sound.startLoop("alarm"); } else if (!want && this._alarmOn) { this._alarmOn = false; Sound.stopLoop("alarm"); } } // alarm sound always follows the red light
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; const t = now / 1000;
    { const kh = $("#keysHint"); if (kh && UI._keysOn) { this.keysHintT = (this.keysHintT || 0) + dt; if (this.keysHintT > 25 || (this.keysHintT > 8 && (this.player.walkDist || 0) > 400)) UI._keysOn = false; } if (kh) kh.classList.toggle("hidden", !(UI._keysOn && this.mode === "play" && !UI.busy())); }
    if (this.mode === "play" || this.mode === "cutscene") {
      for (const c of this.chars) this.updateChar(c, dt);
      const P = this.player; const lt = this.trail[this.trail.length - 1];
      if (!lt || Math.hypot(lt.x - P.x, lt.y - P.y) > 2) { this.trail.push({ x: P.x, y: P.y }); if (this.trail.length > 60) this.trail.shift(); }
      Particles.update(dt);
      const g = this.lg;
      const room = renderWorld(g, t, dt);
      if (room !== this.room) { const prev = this.room; this.room = room; if (room && ROOMS[room] && this.mode === "play") { UI.banner(ROOMS[room].name); Sound.play("door"); } if (this.onRoomEnter) this.onRoomEnter(room, prev); Story.onRoom && Story.onRoom(room); }
      // guide path refresh
      this.guideT -= dt;
      if (this.target && this.guideT <= 0) { this.guideT = 0.4; this.guidePath = this.findPath(P.x, P.y, this.target.x, this.target.y); if (this.guidePath) this.guidePath.unshift({ x: P.x, y: P.y }); }
      if (Story.update) Story.update(dt, t);
      this.drawMinimap(t);
      // prompt
      const pr = $("#prompt");
      const it = this.mode === "play" && !this.freeze && !UI.busy() ? this.nearestInteract() : null;
      if (it) { pr.classList.remove("hidden"); const sx = (it.x - Cam.x) * this.scale, sy = ((it.npc ? it.npc.y - (charHeadOffset() - 4) : it.y - 26) - Cam.y) * this.scale; pr.style.left = sx + "px"; pr.style.top = sy + "px"; const key = document.body.classList.contains("touch") ? "A" : "Space"; pr.innerHTML = `<kbd>${key}</kbd>${it.label}${it.name ? " · " + fill(it.name) : ""}`; $("#abtn").textContent = it.label.split(" ")[0]; }
      else { pr.classList.add("hidden"); $("#abtn").textContent = "A"; }
    } else if (this.mode === "intro") {
      Intro.frame(dt, t);
      // integer scaling for the 480x270 intro canvas
      const c = this.canvas, g2 = c.getContext("2d"); g2.imageSmoothingEnabled = false;
      const sc = Math.max(1, Math.floor(Math.min(c.width / IW, c.height / IH)));
      const w = IW * sc, h = IH * sc;
      if (w < c.width * 0.8) { g2.drawImage(Intro.out, 0, 0, c.width, c.height); } // very small screens: fill
      else { g2.fillStyle = "#000"; g2.fillRect(0, 0, c.width, c.height); g2.drawImage(Intro.out, Math.floor((c.width - w) / 2), Math.floor((c.height - h) / 2), w, h); }
      requestAnimationFrame((tt) => this.loop(tt)); return;
    } else if (this.mode === "title") {
      Scenes.draw(this.lg, t, dt);
    }
    const c = this.canvas, g2 = c.getContext("2d"); g2.imageSmoothingEnabled = false; g2.drawImage(this.low, 0, 0, c.width, c.height);
    requestAnimationFrame((tt) => this.loop(tt));
  },
};
// Physical key position (works with Arabic or any keyboard layout)
function keyOf(e) {
  const c = e.code || "";
  let m = c.match(/^Key([A-Z])$/); if (m) return e.shiftKey ? m[1] : m[1].toLowerCase();
  m = c.match(/^(Digit|Numpad)(\d)$/); if (m) return m[2];
  if (c === "Space") return " ";
  if (c === "Enter" || c === "NumpadEnter") return "Enter";
  return e.key || "";
}
function roomVisible(i) { const P = Game.player; const r = roomAt(i.x, i.y - 10), pr = Game.room; if (r && r === pr) return true; return Math.hypot(i.x - P.x, i.y - P.y) < 40; }

// meters helper
function meter(changes, reason) {
  for (const k in changes) {
    const d = changes[k]; if (!d) continue;
    G.meters[k] = Math.max(0, Math.min(100, G.meters[k] + d));
    UI.meterDelta(k, d);
  }
  const anyUp = Object.values(changes).some((v) => v > 0), anyDown = Object.values(changes).some((v) => v < 0);
  Sound.play(anyDown && !anyUp ? "meterDown" : "meterUp");
  if (reason) UI.toast(reason, 2600);
}
