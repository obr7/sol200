// =====================================================================
//  RENDER — props, characters, lights, Among-Us style room darkness,
//  dust storm, particles, camera.
// =====================================================================
const VW = 384, VH = 216;
const Cam = { x: 0, y: 0, shake: 0 };
let glows = [];
const glow = (x, y, r, color, a = 0.5) => glows.push({ x, y, r, color, a });

function drawProp1(g, p, t) {
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(p.x + x), Math.round(p.y + y), w, h); };
  const W = p.pw, H = p.ph, st = p.state;
  switch (p.type) {
    case "console": {
      R(0, -12, W, 12, "#1d2233"); R(1, -11, W - 2, 10, "#0d1a2a");
      // screen content
      const sx = p.x + 2, sy = p.y - 10, sw = W - 4, sh = 8;
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      if (p.screen === "radar") {
        g.fillStyle = "#0c2a1c"; g.fillRect(sx, sy, sw, sh);
        const storm = G.storm || 0;
        for (let i = 0; i < 18; i++) { const a = hash(i, 3); g.fillStyle = `rgba(${200},${120 + a * 60},60,${0.3 + storm * 0.5})`; g.fillRect(sx + ((a * sw + t * 6 * (0.5 + a)) % sw), sy + hash(i, 9) * sh, 2, 1); }
        const sweep = (t * 2) % (Math.PI * 2); g.strokeStyle = "rgba(90,255,150,0.8)"; g.beginPath(); g.moveTo(sx + sw / 2, sy + sh / 2); g.lineTo(sx + sw / 2 + Math.cos(sweep) * 14, sy + sh / 2 + Math.sin(sweep) * 5); g.stroke();
        g.fillStyle = "#e05040"; g.fillRect(sx + 4 + storm * 20, sy + 5, 3 + storm * 6, 2);
      } else if (p.screen === "sun") {
        g.fillStyle = "#1a1030"; g.fillRect(sx, sy, sw, sh);
        g.fillStyle = "#ffb43a"; g.beginPath(); g.arc(sx + 8, sy + 4, 3 + Math.sin(t * 3) * 0.5, 0, 7); g.fill();
        g.fillStyle = "#ff6a2a"; g.fillRect(sx + 12, sy + 3, ((t * 10) % 20) | 0, 1);
        if (SpaceWeather.status === "live") { g.fillStyle = (t * 2 | 0) % 2 ? "#5dff8a" : "#2a8a4a"; g.fillRect(sx + sw - 4, sy + 1, 2, 2); }
      } else if (p.screen === "comms") {
        g.fillStyle = "#08202a"; g.fillRect(sx, sy, sw, sh);
        for (let i = 0; i < sw; i += 2) { const h = 2 + Math.abs(Math.sin(t * 4 + i * 0.7)) * 4; g.fillStyle = "#4fd8ff"; g.fillRect(sx + i, sy + sh - h, 1, h); }
      }
      g.restore();
      R(0, 0, W, H, "#59627c"); R(0, 0, W, 3, "#7a84a0"); R(0, H - 3, W, 3, "#3c4358");
      for (let i = 4; i < W - 4; i += 5) R(i, 6, 2, 2, ["#ff5050", "#50ff90", "#ffd040", "#50b0ff"][((i + (t * 3 | 0)) % 4)]);
      glow(p.x + W / 2, p.y - 6, 26, p.screen === "sun" ? "#ffa040" : p.screen === "radar" ? "#40ff90" : "#40c0ff", 0.25);
      break;
    }
    case "power": {
      R(0, -12, W, 12 + H, "#3a3f55"); R(2, -10, W - 4, 22, "#22263a");
      const lv = G.power ?? 1; const bars = Math.round(lv * 5);
      for (let i = 0; i < 5; i++) R(5, 9 - i * 4, W - 10, 3, i < bars ? (lv < 0.4 ? "#ff5a40" : "#5dff8a") : "#30354a");
      glow(p.x + W / 2, p.y - 2, 18, lv < 0.4 ? "#ff5040" : "#50ff90", 0.25);
      break;
    }
    case "holotable": {
      R(2, 4, W - 4, H - 4, "#3b4560"); R(0, 0, W, H - 6, "#525d7a"); R(2, 2, W - 4, H - 10, "#1a2a44");
      const cx = p.x + W / 2, cy = p.y + 8;
      g.fillStyle = "rgba(80,220,255,0.55)"; g.beginPath(); g.ellipse(cx, cy - 2 + Math.sin(t * 2), 9, 6, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(220,110,60,0.9)"; g.beginPath(); g.ellipse(cx, cy - 2 + Math.sin(t * 2), 7, 5, 0, 0, 7); g.fill();
      g.fillStyle = "rgba(255,200,160,0.9)"; g.fillRect(cx - 3 + Math.cos(t) * 4, cy - 4, 2, 1);
      glow(cx, cy, 30, "#40d0ff", 0.3);
      break;
    }
    case "chair": R(3, 2, 10, 8, "#2b3045"); R(4, 3, 8, 3, "#47506e"); R(7, 10, 2, 4, "#1d2030"); break;
    case "potplant": R(4, 8, 8, 7, "#7a5a40"); R(5, 9, 6, 1, "#9a7a58"); R(6, 0, 4, 8, "#3a8a4a"); R(3, 3, 3, 4, "#4aa85a"); R(10, 2, 3, 4, "#4aa85a"); R(7, -2, 2, 3, "#5ac06a"); break;
    case "rosie": {
      const broken = G.rosieBroken;
      R(0, -14, W, H + 14, "#6a7590"); R(2, -12, W - 4, H + 8, "#8892ad"); R(0, H - 4, W, 4, "#3e4560");
      // fan
      const fx = p.x + 14, fy = p.y + 2; g.fillStyle = "#2a3048"; g.beginPath(); g.arc(fx, fy, 9, 0, 7); g.fill();
      const ang = broken ? 0.3 : t * 14; g.fillStyle = "#c9d2e6";
      for (let i = 0; i < 4; i++) { const a = ang + i * Math.PI / 2; g.beginPath(); g.moveTo(fx, fy); g.arc(fx, fy, 7, a, a + 0.7); g.fill(); }
      g.fillStyle = "#59627c"; g.fillRect(fx - 1, fy - 1, 3, 3);
      // lights + tubes
      R(28, -8, 14, 6, "#1d2233"); R(30, -6, 3, 2, broken ? ((t * 4 | 0) % 2 ? "#ff3030" : "#601010") : "#40ff80"); R(35, -6, 3, 2, broken ? "#401010" : (t * 2 | 0) % 2 ? "#40ff80" : "#1a6a3a");
      R(30, 4, 14, 3, "#3d8adf"); R(31, 5, (broken ? 2 : (8 + Math.sin(t * 3) * 4)) | 0, 1, "#bfe8ff");
      R(4, -12, 10, 3, "#ffd34a"); g.fillStyle = "#1d2233"; g.font = "5px monospace"; g.fillText("O2", p.x + 5, p.y - 9.5);
      if (broken) { if (Math.random() < 0.15) Particles.spark(p.x + 20 + Math.random() * 20, p.y - 4); glow(p.x + W / 2, p.y, 30, "#ff3020", 0.3 + Math.sin(t * 8) * 0.1); }
      else glow(p.x + W / 2, p.y, 26, "#40ff90", 0.2);
      break;
    }
    case "bench": {
      R(0, -6, W, 6 + H, "#6a4a30"); R(0, -6, W, 3, "#8a6644"); R(2, H - 2, 3, 2, "#3a2a1a"); R(W - 5, H - 2, 3, 2, "#3a2a1a");
      R(6, -12, 6, 7, "rgba(200,230,255,0.5)"); R(7, -8, 4, 3, "#c0592c"); R(6, -13, 6, 1, "#9aa3b5");
      R(20, -9, 10, 2, "#9aa3b5"); R(22, -11, 2, 4, "#9aa3b5"); R(36, -10, 12, 4, "#d04040"); R(37, -9, 10, 1, "#ff7070");
      break;
    }
    case "shelf": R(0, -14, W, 14 + H, "#4a3a2e"); for (let i = 0; i < 3; i++) { R(1, -12 + i * 8, W - 2, 1, "#2e241c"); R(3 + i * 7, -18 + i * 8 + 6, 5, 5, ["#d0a040", "#4a80c0", "#a0a0a0"][i]); } break;
    case "crates": R(0, 0, W, H, "#8a6a3a"); R(1, 1, W - 2, H - 2, "#a07a44"); R(0, H / 2, W, 1, "#6a4a2a"); R(W / 2, 0, 1, H, "#6a4a2a"); R(2, 2, 6, 3, "#ffd34a"); break;
    case "tank": R(2, -16, 12, 16 + H, "#5a7a9a"); R(3, -15, 4, 26, "#7a9aba"); R(0, H - 3, 16, 3, "#3a4a5a"); break;
    case "tray": {
      const n = p.n, tr = (G.trays && G.trays[n]) || {};
      R(0, -2, W, H + 2, "#5a6680"); R(1, -1, W - 2, 5, "#2a6a9a"); R(1, 0, W - 2, 1, "#5ab0e0");
      R(2, H - 3, W - 4, 3, "#3e4860");
      // lamp bar above
      const lampOn = !tr.lightOff && !tr.dead;
      R(-1, -22, W + 2, 3, "#3a3f55"); R(1, -19, W - 2, 1, lampOn ? "#d080ff" : "#3a2a4a");
      if (lampOn) glow(p.x + W / 2, p.y - 6, 30, "#c060ff", 0.35);
      // plants
      for (let i = 0; i < 6; i++) {
        const px = 4 + i * 7, sway = Math.sin(t * 1.5 + i + n) * 1;
        if (tr.dead) { R(px, -4, 3, 3, "#6a5a3a"); R(px + 1, -6, 1, 2, "#5a4a2a"); continue; }
        const sick = tr.problem && !tr.fixed;
        const c1 = sick ? "#8aa040" : "#3aa04a", c2 = sick ? "#a0b050" : "#5ac860";
        R(px + 1, -6, 1, 4, "#2a7a3a"); R(px - 1 + sway, -9, 3, 3, c1); R(px + 2 + sway, -10, 3, 3, c2); R(px + 1 + sway, -12, 2, 2, c2);
      }
      if (tr.problem && !tr.fixed) {
        const ic = { water: "💧", light: "💡", heat: "🌡️" }[tr.problem];
        const bob = Math.sin(t * 4) * 2;
        g.fillStyle = "#fff"; g.fillRect(p.x + W / 2 - 7, p.y - 38 + bob, 14, 12); g.fillStyle = "#1b1d2b"; g.fillRect(p.x + W / 2 - 1, p.y - 26 + bob, 2, 2);
        g.font = "9px sans-serif"; g.textAlign = "center"; g.fillText(ic, p.x + W / 2, p.y - 29 + bob); g.textAlign = "left";
      } else if (tr.fixed) { R(W / 2 - 2, -30, 4, 4, "#5dff8a"); }
      break;
    }
    case "hope": {
      R(3, 6, 10, 8, "#c97a4a"); R(2, 5, 12, 2, "#e09060"); R(4, 13, 8, 2, "#a05a34");
      if (G.hopeDead) { R(7, 0, 2, 6, "#6a5a3a"); break; }
      const s = Math.sin(t * 2) * 0.8;
      R(7, -2, 2, 8, "#2a8a3a"); R(3 + s, -4, 5, 3, "#5ad06a"); R(8 + s, -6, 5, 3, "#6ae07a"); R(6 + s, -8, 3, 3, "#7af08a");
      if (G.hopeNewLeaf) R(2 + s, -9, 3, 2, "#a0ff9a");
      glow(p.x + 8, p.y - 2, 16, "#90ff90", 0.25 + Math.sin(t * 2) * 0.08);
      break;
    }
    case "veggie": {
      R(0, -14, W, 14 + H, "#3a4258"); R(2, -12, W - 4, 18, "#2a1a3a");
      for (let i = 0; i < 4; i++) { R(5 + i * 6, 0, 2, 4, "#2a7a3a"); R(4 + i * 6, -3, 4, 3, "#c0405a"); R(5 + i * 6, -5, 2, 2, "#e0607a"); }
      R(2, -12, W - 4, 2, "#ff60c0"); glow(p.x + W / 2, p.y - 4, 22, "#ff50d0", 0.35);
      break;
    }
    case "soil": { R(0, -6, W, 6 + H, "#59627c"); R(2, -4, W - 4, 4, "#2a2f45"); R(4, -12, 8, 8, "rgba(200,230,255,0.4)"); R(5, -8, 6, 4, "#b85a2a"); R(18, -10, 8, 6, "#2a2f45"); R(19, -9, 6, 4, ((t * 2) | 0) % 2 ? "#ffd040" : "#806020"); break; }
    case "watertank": { R(1, -10, 14, H + 10, "#4a6a8a"); const lvl = 0.6 + Math.sin(t * 0.5) * 0.05; R(3, -8 + (H + 6) * (1 - lvl), 10, (H + 6) * lvl, "#3a9ae0"); R(3, -8, 10, 1, "#9ad8ff"); R(4, -6, 2, H, "rgba(255,255,255,0.3)"); glow(p.x + 8, p.y + 6, 18, "#40a0ff", 0.18); break; }
    case "bunk": {
      R(0, -6, W, 6 + H, "#5a4a5a"); R(2, -4, W - 4, H, "#d8d8e8"); R(2, 4, W - 4, H - 8, p.color); R(2, 4, W - 4, 2, shade(p.color, 0.3)); R(4, -3, 10, 5, "#f4f4ff");
      break;
    }
    case "table": { R(0, -4, W, 4 + H, "#8a6a4a"); R(0, -4, W, 2, "#a8845e"); R(4, -12, 10, 9, "#d9b24a"); R(5, -11, 8, 7, "#6a90c0"); R(6, -8, 2, 3, "#f2c9a0"); R(9, -8, 2, 3, "#8a5634"); R(7, -6, 1, 2, "#d39a68"); R(11, -6, 1, 2, "#e8b88f"); R(20, -8, 6, 6, "#e0e0e0"); R(21, -7, 4, 1, "#888"); break; }
    case "scale": { R(2, 6, 12, 8, "#9aa3b5"); R(3, 7, 10, 6, "#c8d0dc"); R(5, 8, 6, 3, "#1a2a3a"); R(6, 9, 4, 1, "#5dff8a"); break; }
    case "clock": { R(2, -10, 12, 22, "#3a3f55"); R(3, -8, 10, 8, "#0a1a1a"); g.fillStyle = "#ffb040"; g.font = "5px monospace"; g.fillText("SOL", p.x + 4, p.y - 3.5); R(4, 2, 8, 5, "#0a1a1a"); g.fillStyle = "#5dff8a"; g.fillText("200", p.x + 4, p.y + 6.5); break; }
    case "viewport": {
      R(0, -4, W, H + 8, "#3a3f55"); R(2, -2, W - 4, H + 4, "#c86a3a");
      R(2, H - 6, W - 4, 8, "#9a4a2a");
      const st = G.storm || 0; if (st > 0) R(2, -2, W - 4, H + 4, `rgba(150,80,40,${0.3 + st * 0.6})`);
      glow(p.x + 8, p.y + 14, 20, "#ff9a5a", 0.25);
      break;
    }
    case "suits": {
      for (let i = 0; i < 2; i++) { const x = 2 + i * 15; R(x, -14, 12, 16, "#e8ecf4"); R(x + 2, -20, 8, 7, "#c8d0dc"); R(x + 3, -19, 6, 4, "#3a6a9a"); R(x + 1, -6, 10, 2, i ? "#f08a2a" : "#e04848"); }
      R(0, H - 3, W, 3, "#3a3f55");
      break;
    }
    case "hatch": {
      const open = G.hatchOpen;
      R(-2, -16, 4, H + 16, "#2c3146");
      if (!open) { R(0, 0, 16, H, "#7a7a62"); R(2, 2, 12, H - 4, "#9a9a7a"); for (let i = 0; i < H; i += 6) R(2, i + 2, 12, 2, (i / 6) % 2 ? "#e8c040" : "#222"); R(6, H / 2 - 3, 4, 6, ((t * 2) | 0) % 2 ? "#ff4040" : "#801010"); }
      else { R(0, 0, 3, H, "#5a5a4a"); }
      break;
    }
    case "panel": {
      const n = p.n, d = (G.panels && G.panels[n] !== undefined) ? G.panels[n] : 0.85;
      R(W / 2 - 2, H - 6, 4, 6, "#5a6070");
      R(0, 0, W, H - 6, "#1a2a5a"); R(1, 1, W - 2, H - 8, "#2a4aa0");
      for (let i = 4; i < W; i += 8) R(i, 1, 1, H - 8, "#4a7ad0"); R(1, (H - 6) / 2, W - 2, 1, "#4a7ad0");
      if (d > 0) { g.fillStyle = `rgba(190,100,50,${0.25 + d * 0.7})`; g.fillRect(p.x + 1, p.y + 1, W - 2, H - 8); for (let i = 0; i < 10 * d; i++) R(2 + hash(n, i) * (W - 5), 2 + hash(i, n) * (H - 10), 2, 1, "#d98a55"); }
      else { R(3, 2, 6, 1, "rgba(255,255,255,0.7)"); glow(p.x + W / 2, p.y + 8, 20, "#80b0ff", 0.25); }
      if (p.state.progress) { R(0, -6, W, 3, "#222"); R(0, -6, W * p.state.progress, 3, "#5dff8a"); }
      break;
    }
    case "rock": R(0, 4, W, H - 4, "#7a3a20"); R(1, 2, W - 2, H - 6, "#9a4c2a"); R(3, 3, W - 8, 3, "#b56236"); break;
  }
}

// ---------------------------------------------------------------- characters
function drawCharacter(g, c, t) {
  const set = CharSprites[c.sprite + (c.helmet ? "_h" : "")];
  if (!set) return;
  const frame = c.moving ? (Math.floor(c.walkT * 8) % 4) : 0;
  const blink = (t + c.blinkOff) % 4 < 0.12;
  const img = set.dirs[c.dir][frame][blink ? 1 : 0];
  const breathe = !c.moving && Math.sin(t * 2 + c.blinkOff) > 0.6 ? 1 : 0;
  // shadow
  g.fillStyle = "rgba(0,0,0,0.28)"; g.beginPath(); g.ellipse(Math.round(c.x), Math.round(c.y) - 1, 6, 2.5, 0, 0, 7); g.fill();
  g.drawImage(img, Math.round(c.x - 9), Math.round(c.y - 26 + breathe));
  if (c.hurt) { g.fillStyle = "#fff"; g.fillRect(Math.round(c.x) + 3, Math.round(c.y) - 12, 3, 3); g.fillStyle = "#e04040"; g.fillRect(Math.round(c.x) + 4, Math.round(c.y) - 12, 1, 3); g.fillRect(Math.round(c.x) + 3, Math.round(c.y) - 11, 3, 1); }
}

// ---------------------------------------------------------------- particles
const Particles = {
  list: [],
  spark(x, y) { for (let i = 0; i < 3; i++) this.list.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 50, life: 0.4, max: 0.4, c: "#ffd040", s: 1, grav: 150 }); },
  dust(x, y, n = 6, c = "#d98a55") { for (let i = 0; i < n; i++) this.list.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 20, life: 0.6, max: 0.6, c, s: 1, grav: 20 }); },
  sparkle(x, y) { for (let i = 0; i < 10; i++) { const a = Math.random() * 7; this.list.push({ x, y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 0.7, max: 0.7, c: ["#fff", "#5dff8a", "#ffd34a"][i % 3], s: 1, grav: 0 }); } },
  update(dt) { for (const p of this.list) { p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; } this.list = this.list.filter((p) => p.life > 0); },
  draw(g) { for (const p of this.list) { g.globalAlpha = Math.max(0, p.life / p.max); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); } g.globalAlpha = 1; },
};
const Motes = [];
for (let i = 0; i < 70; i++) Motes.push({ x: Math.random() * MW * T, y: Math.random() * MH * T, s: Math.random() * 0.6 + 0.2, ph: Math.random() * 7 });
const StormDust = [];
for (let i = 0; i < 160; i++) StormDust.push({ x: Math.random() * VW, y: Math.random() * VH, v: 60 + Math.random() * 120, l: 2 + Math.random() * 6 });

// ---------------------------------------------------------------- frame
let darkCv, darkG;
function renderWorld(g, t, dt) {
  const P = Game.player;
  // camera
  const tx = P.x - VW / 2, ty = P.y - 12 - VH / 2;
  Cam.x += (tx - Cam.x) * Math.min(1, dt * 8); Cam.y += (ty - Cam.y) * Math.min(1, dt * 8);
  Cam.x = Math.max(-8, Math.min(MW * T - VW + 8, Cam.x)); Cam.y = Math.max(-44, Math.min(MH * T - VH + 8, Cam.y));
  let sx = 0, sy = 0; if (Cam.shake > 0) { Cam.shake -= dt; sx = (Math.random() - 0.5) * 4; sy = (Math.random() - 0.5) * 4; }
  const cx = Math.round(Cam.x + sx), cy = Math.round(Cam.y + sy);
  g.fillStyle = "#05060c"; g.fillRect(0, 0, VW, VH);
  g.save(); g.translate(-cx, -cy);
  g.drawImage(MapCanvas, cx, cy, VW, VH, cx, cy, VW, VH);
  glows = [];
  const curRoom = roomAt(P.x, P.y - 4);
  const visR = curRoom === "outside" ? 150 - (G.storm || 0) * 85 : 78;
  const visible = (x, y) => { const r = roomAt(x, y); if (r && r === curRoom && !(r === "outside" && (G.storm || 0) > 0.2)) return true; return curRoom === "outside" && r === "outside" && Math.hypot(x - P.x, y - P.y) < visR; };
  // drawables
  const list = [];
  for (const p of PROPS) {
    if (p.x + p.pw < cx - 20 || p.x > cx + VW + 20 || p.y + p.ph < cy - 40 || p.y > cy + VH + 20) continue;
    list.push({ y: p.y + p.ph, d: () => drawProp(g, p, t) });
  }
  for (const c of Game.chars) { if (!c.visible) continue; if (c !== P && !visible(c.x, c.y - 4)) continue; list.push({ y: c.y, d: () => drawCharacter(g, c, t) }); }
  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.d();
  Particles.draw(g);
  // ambient motes in current room
  g.fillStyle = curRoom === "outside" ? "rgba(255,180,120,0.5)" : "rgba(255,255,255,0.35)";
  for (const m of Motes) { const x = m.x + Math.sin(t * m.s + m.ph) * 6, y = (m.y - t * 4 * m.s) % (MH * T); const yy = y < 0 ? y + MH * T : y; if (x > cx && x < cx + VW && yy > cy && yy < cy + VH) g.fillRect(x | 0, yy | 0, 1, 1); }
  // glows
  g.globalCompositeOperation = "lighter";
  for (const L of glows) { const gr = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r); gr.addColorStop(0, hexA(L.color, L.a)); gr.addColorStop(1, hexA(L.color, 0)); g.fillStyle = gr; g.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2); }
  g.globalCompositeOperation = "source-over";
  // interaction marker / objective marker in world
  Game.drawWorldMarkers(g, t, visible);
  g.restore();

  // darkness (Among-Us style)
  if (!darkCv) { darkCv = mkCanvas(VW, VH); darkG = darkCv.getContext("2d"); }
  darkG.globalCompositeOperation = "source-over"; darkG.clearRect(0, 0, VW, VH);
  darkG.fillStyle = curRoom === "outside" ? "rgba(20,8,4,0.86)" : "rgba(3,4,12,0.9)"; darkG.fillRect(0, 0, VW, VH);
  darkG.globalCompositeOperation = "destination-out";
  darkG.fillStyle = "#000";
  const stormOut = curRoom === "outside" && (G.storm || 0) > 0.2;
  if (curRoom && ROOMS[curRoom] && !stormOut) {
    const r = ROOMS[curRoom];
    darkG.fillRect(r.x * T - cx - 16, (r.y - 2) * T - cy, (r.w + 2) * T, (r.h + 3) * T);
  } else if (curRoom === "corridor") {
    // the whole corridor network lights up
    darkG.drawImage(corridorMask(), cx, cy, VW, VH, 0, 0, VW, VH);
  }
  if (curRoom === "outside" || !curRoom) {
    const px = P.x - cx, py = P.y - 10 - cy;
    const gr = darkG.createRadialGradient(px, py, visR * 0.45, px, py, visR);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    darkG.fillStyle = gr; darkG.fillRect(px - visR, py - visR, visR * 2, visR * 2);
  }
  g.drawImage(darkCv, 0, 0);

  // storm overlay
  const storm = G.storm || 0;
  if (storm > 0) {
    const outside = curRoom === "outside";
    g.fillStyle = `rgba(150,75,35,${storm * (outside ? 0.45 : 0.12)})`; g.fillRect(0, 0, VW, VH);
    if (outside) { g.fillStyle = `rgba(230,150,90,${0.5 * storm})`; for (const d of StormDust) { d.x += d.v * dt * storm; d.y += d.v * 0.2 * dt; if (d.x > VW) { d.x = -10; d.y = Math.random() * VH; } if (d.y > VH) d.y = 0; g.fillRect(d.x | 0, d.y | 0, d.l, 1); } }
  }
  // alarm
  if (G.alarm) { g.fillStyle = `rgba(255,30,30,${0.12 + Math.sin(t * 6) * 0.1})`; g.fillRect(0, 0, VW, VH); }
  // vignette
  const vg = g.createRadialGradient(VW / 2, VH / 2, VH * 0.4, VW / 2, VH / 2, VW * 0.65); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)"); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  return curRoom;
}
let _cMask = null;
function corridorMask() {
  if (_cMask) return _cMask;
  _cMask = mkCanvas(MW * T, MH * T); const g = _cMask.getContext("2d"); g.fillStyle = "#000";
  const isCor = (x, y) => isFloor(x, y) && !roomMap[idx(x, y)] && x < 54;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (roomMap[idx(x, y)]) continue;
    let lit = isCor(x, y);
    if (!lit && !isFloor(x, y)) for (let dy = -1; dy <= 2 && !lit; dy++) for (let dx = -1; dx <= 1; dx++) if (isCor(x + dx, y + dy)) { lit = true; break; }
    if (lit) g.fillRect(x * T, y * T, T, T);
  }
  return _cMask;
}
function hexA(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
