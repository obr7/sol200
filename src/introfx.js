// =====================================================================
//  INTRO TOOLKIT — pixel font, particle pools, dither, limbs, and the
//  character puppets (40 px wide-shot figures + 96 px close-up busts).
// =====================================================================
const IW = 480, IH = 270;

// ---------------------------------------------------------------- 5x7 pixel font
const FONT5 = (() => {
  const d = {
    A: [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"], B: ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
    C: [" ### ", "#   #", "#    ", "#    ", "#    ", "#   #", " ### "], D: ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
    E: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"], F: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
    G: [" ### ", "#   #", "#    ", "# ###", "#   #", "#   #", " ####"], H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    I: [" ### ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "], J: ["  ###", "   # ", "   # ", "   # ", "#  # ", "#  # ", " ##  "],
    K: ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"], L: ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
    M: ["#   #", "## ##", "# # #", "# # #", "#   #", "#   #", "#   #"], N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
    O: [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "], P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
    Q: [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"], R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
    S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "], T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
    U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "], V: ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
    W: ["#   #", "#   #", "#   #", "# # #", "# # #", "# # #", " # # "], X: ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
    Y: ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "], Z: ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
    0: [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "], 1: ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
    2: [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"], 3: ["#####", "   # ", "  #  ", "   # ", "    #", "#   #", " ### "],
    4: ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "], 5: ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
    6: ["  ## ", " #   ", "#    ", "#### ", "#   #", "#   #", " ### "], 7: ["#####", "    #", "   # ", "  #  ", " #   ", " #   ", " #   "],
    8: [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "], 9: [" ### ", "#   #", "#   #", " ####", "    #", "   # ", " ##  "],
    ".": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  "], ",": ["     ", "     ", "     ", "     ", " ##  ", "  #  ", " #   "],
    ":": ["     ", " ##  ", " ##  ", "     ", " ##  ", " ##  ", "     "], "-": ["     ", "     ", "     ", "#####", "     ", "     ", "     "],
    "!": ["  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "     ", "  #  "], "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
    "'": ["  #  ", "  #  ", " #   ", "     ", "     ", "     ", "     "], "(": ["   # ", "  #  ", " #   ", " #   ", " #   ", "  #  ", "   # "],
    ")": [" #   ", "  #  ", "   # ", "   # ", "   # ", "  #  ", " #   "], "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
    "%": ["##  #", "##  #", "   # ", "  #  ", " #   ", "#  ##", "#  ##"], " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  };
  return d;
})();
function textW(str, sc = 1) { return str.length * 6 * sc - sc; }
function pxText(g, str, x, y, sc = 1, color = "#fff", shadow = null) {
  str = str.toUpperCase();
  const draw = (ox, oy, col) => {
    g.fillStyle = col;
    for (let i = 0; i < str.length; i++) {
      const gl = FONT5[str[i]] || FONT5["?"];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (gl[r][c] === "#") g.fillRect(Math.round(ox + (i * 6 + c) * sc), Math.round(oy + r * sc), sc, sc);
    }
  };
  if (shadow) draw(x + sc, y + sc, shadow);
  draw(x, y, color);
}
// typewriter: shows the first n characters; plays a blip for each new letter
const _typed = {};
function typeText(g, id, str, x, y, t, t0, cps, sc, color, shadow, cursor = true) {
  if (t < t0) return 0;
  const n = Math.min(str.length, Math.floor((t - t0) * cps));
  if (_typed[id] === undefined || n < _typed[id]) _typed[id] = 0;
  if (n > _typed[id]) { if (str[n - 1] !== " ") Sound.play("type"); _typed[id] = n; }
  pxText(g, str.slice(0, n), x, y, sc, color, shadow);
  if (cursor && (n < str.length || (t * 2 | 0) % 2)) { g.fillStyle = color; g.fillRect(Math.round(x + n * 6 * sc), Math.round(y + 6 * sc), 5 * sc, sc); }
  return n / str.length;
}

// ---------------------------------------------------------------- easing / helpers
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => { k = clamp01(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (k) => 1 - Math.pow(1 - clamp01(k), 3);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const between = (t, a, b) => t >= a && t < b;
function rnd(i, j = 0) { return hash(i * 13 + 7, j * 29 + 3); }
// thick pixel line (limb) stamped with squares — keeps edges crisp
function limb(g, x0, y0, x1, y1, w, color) {
  g.fillStyle = color;
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) { const k = i / n; g.fillRect(Math.round(x0 + (x1 - x0) * k - w / 2), Math.round(y0 + (y1 - y0) * k - w / 2), w, w); }
}
function pxCircle(g, cx, cy, r, color) { g.fillStyle = color; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
function pxEllipse(g, cx, cy, rx, ry, color) { g.fillStyle = color; for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }

// ---------------------------------------------------------------- ordered dither (Bayer 4x4)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const _ditherMasks = [];
function ditherMask(level) { // level 0..16
  level = Math.max(0, Math.min(16, Math.round(level)));
  if (_ditherMasks[level]) return _ditherMasks[level];
  const c = mkCanvas(IW, IH), g = c.getContext("2d"); g.fillStyle = "#000";
  for (let y = 0; y < IH; y += 2) for (let x = 0; x < IW; x += 2) if (BAYER[((y >> 1) % 4) * 4 + ((x >> 1) % 4)] < level) g.fillRect(x, y, 2, 2);
  return (_ditherMasks[level] = c);
}

// ---------------------------------------------------------------- particle pools (no per-frame allocation)
class Pool {
  constructor(n) { this.p = Array.from({ length: n }, () => ({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, s: 1, ds: 0, c: "#fff", g: 0, kind: 0, ph: 0, drag: 0 })); this.i = 0; }
  spawn(o) { const p = this.p[this.i]; this.i = (this.i + 1) % this.p.length; p.on = true; p.x = o.x; p.y = o.y; p.vx = o.vx || 0; p.vy = o.vy || 0; p.life = p.max = o.life || 1; p.s = o.s || 1; p.ds = o.ds || 0; p.c = o.c || "#fff"; p.g = o.g || 0; p.kind = o.kind || 0; p.ph = Math.random() * 7; p.drag = o.drag || 0; return p; }
  clear() { for (const p of this.p) p.on = false; }
  update(dt) { for (const p of this.p) { if (!p.on) continue; p.life -= dt; if (p.life <= 0) { p.on = false; continue; } p.vy += p.g * dt; if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; } p.x += p.vx * dt; p.y += p.vy * dt; p.s += p.ds * dt; } }
  draw(g, t) {
    for (const p of this.p) {
      if (!p.on) continue;
      const a = p.life / p.max;
      if (p.kind === 0) { g.globalAlpha = Math.min(1, a * 1.5); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, Math.round(p.s)), Math.max(1, Math.round(p.s))); }
      else if (p.kind === 1) { g.globalAlpha = Math.min(0.85, a); pxCircle(g, p.x, p.y, Math.max(1, Math.round(p.s)), p.c); } // smoke puff
      else if (p.kind === 2) { // bird
        g.globalAlpha = 1; g.fillStyle = p.c; const up = ((t * 10 + p.ph) | 0) % 2; const x = Math.round(p.x), y = Math.round(p.y);
        if (up) { g.fillRect(x - 2, y - 1, 1, 1); g.fillRect(x - 1, y, 1, 1); g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y - 1, 1, 1); g.fillRect(x + 2, y - 2, 1, 1); g.fillRect(x - 3, y - 2, 1, 1); }
        else { g.fillRect(x - 3, y, 3, 1); g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y, 3, 1); g.fillRect(x - 1, y + 1, 3, 1); }
      } else if (p.kind === 3) { g.globalAlpha = Math.min(1, a * 2); g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.s), 1); } // streak
    }
    g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- character look sheet for the intro
const LOOK = {
  lead:   { skin: "#f2c9a0", skinS: "#d9a07a", skinD: "#b97f5c", hair: "#f0d26a", hairS: "#c49a3a", hairH: "#fff0a8", iris: "#3a6ea8", stripe: "#d63a3a", stripeS: "#a02a30", lip: "#c47a68", style: "short", jaw: "square", brow: "#b8902e" },
  marcus: { skin: "#8a5634", skinS: "#6e4026", skinD: "#55301a", hair: "#221a16", hairS: "#120d0b", hairH: "#a6a09a", iris: "#3b2416", stripe: "#3b7dd8", stripeS: "#285aa8", lip: "#5e3020", style: "buzz", beard: true, glasses: true, tablet: true, brow: "#1a1210" },
  diego:  { skin: "#d39a68", skinS: "#ae7448", skinD: "#8e5a36", hair: "#231a17", hairS: "#120d0c", hairH: "#4a3a33", iris: "#4a2c18", stripe: "#f08a2a", stripeS: "#c0621a", lip: "#9a5440", style: "curly", mustache: true, brow: "#1a1210" },
  layla:  { skin: "#e8b88f", skinS: "#c8946c", skinD: "#a87650", hair: "#2f6b45", hairS: "#214d31", hairH: "#4f9466", iris: "#6b3e1e", stripe: "#4fb35e", stripeS: "#2f8a40", lip: "#b8665a", style: "hijab", magnifier: true, brow: "#3a2a22" },
};
const SUITC = { w: "#f4f1ea", s: "#d8d2c4", d: "#b9b2a2", grey: "#8b93a6", greyS: "#5f6678", boot: "#6a7080", bootS: "#4a5060", gold: "#ffd34a", goldS: "#c9961e", eyeW: "#fbfbf7", dark: "#1b1d2b" };

// ---------------------------------------------------------------- 40 px FRONT figure (ceremony)
// o: ht head turn (-1..1), gx/gy gaze, blink 0..3, mouth, brow, arms, ph (anim phase), lift, star, glint, knuckles, sway
function figFront(g, id, x, y, o = {}) {
  const L = LOOK[id];
  const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); };
  const lift = o.lift || 0, br = o.breathe || 0;
  // legs + boots
  R(-5, -14, 4, 11, SUITC.w); R(1, -14, 4, 11, SUITC.s); R(-5, -4, 4, 4, SUITC.boot); R(1, -4, 4, 4, SUITC.bootS); R(-6, -1, 5, 1, SUITC.bootS); R(1, -1, 5, 1, SUITC.dark);
  const Y = -lift - br;
  // torso
  R(-6, -28 + Y, 12, 14 - Y, SUITC.w); R(3, -28 + Y, 3, 14 - Y, SUITC.s); R(-6, -27 + Y, 1, 12, SUITC.s);
  R(-6, -22 + Y, 12, 2, L.stripe); R(-6, -20 + Y, 12, 1, L.stripeS); R(-6, -15, 12, 1, id === "diego" ? "#7a5232" : SUITC.greyS);
  R(-3, -29 + Y, 6, 2, SUITC.grey);
  if (id === "diego") { R(2, -16, 3, 2, "#9aa3b5"); R(4, -15, 1, 4, "#e07a2a"); }
  if (L.magnifier) { R(-1, -26 + Y, 1, 3, "#7a6a3a"); R(-1, -23 + Y, 3, 3, "#d9b24a"); R(0, -22 + Y, 1, 1, "#bfe8ff"); }
  if (o.star) { const sx = 3, sy = -27 + Y; R(sx, sy, 3, 3, SUITC.gold); R(sx + 1, sy - 1, 1, 1, SUITC.gold); R(sx + 1, sy + 1, 1, 1, "#fff6c0"); if (o.glint) { g.fillStyle = "#fff"; R(sx + 1, sy - 3, 1, 2, "#fff"); R(sx + 1, sy + 3, 1, 2, "#fff"); R(sx - 2, sy + 1, 2, 1, "#fff"); R(sx + 3, sy + 1, 2, 1, "#fff"); } }
  // arms
  const sh = { lx: x - 7, ly: y - 26 + Y, rx: x + 7, ry: y - 26 + Y };
  const hand = (hx, hy, kn) => { g.fillStyle = kn ? mixHex(L.skin, "#ffffff", kn * 0.55) : L.skin; g.fillRect(Math.round(hx - 1), Math.round(hy - 1), 3, 3); };
  const ph = o.ph || 0;
  switch (o.arms || "down") {
    case "clap": case "clapSlow": case "clapHard": {
      const speed = o.arms === "clapSlow" ? 3 : o.arms === "clapHard" ? 9 : 6;
      const open = (Math.sin(ph * speed) + 1) / 2 * (o.arms === "clapHard" ? 4 : 3);
      const hy = y - 22 + Y - (o.arms === "clapHard" ? 2 : 0);
      limb(g, sh.lx, sh.ly, x - 4, y - 18 + Y, 3, SUITC.w); limb(g, x - 4, y - 18 + Y, x - 1 - open, hy, 3, SUITC.w);
      limb(g, sh.rx, sh.ry, x + 4, y - 18 + Y, 3, SUITC.s); limb(g, x + 4, y - 18 + Y, x + 1 + open, hy, 3, SUITC.s);
      hand(x - 1 - open, hy); hand(x + 1 + open, hy); break;
    }
    case "tablet": {
      limb(g, sh.lx, sh.ly, sh.lx - 1, y - 17 + Y, 3, SUITC.w); limb(g, sh.lx - 1, y - 17 + Y, x - 2, y - 20 + Y, 3, SUITC.w);
      limb(g, sh.rx, sh.ry, sh.rx + 1, y - 17 + Y, 3, SUITC.s); limb(g, sh.rx + 1, y - 17 + Y, x + 2, y - 20 + Y, 3, SUITC.s);
      R(-4, -26 + Y, 8, 10, "#26304a"); R(-3, -25 + Y, 6, 8, "#5fb7ff"); R(-3, -25 + Y, 6, 1, "#bfe6ff");
      hand(x - 3, y - 21 + Y, o.knuckles); hand(x + 3, y - 21 + Y, o.knuckles); break;
    }
    case "wrench": {
      limb(g, sh.lx, sh.ly, sh.lx - 1, y - 15, 3, SUITC.w); hand(sh.lx - 1, y - 14);
      limb(g, sh.rx, sh.ry, sh.rx + 1, y - 19, 3, SUITC.s); limb(g, sh.rx + 1, y - 19, x + 4, y - 15, 3, SUITC.s); hand(x + 4, y - 15); break;
    }
    case "twist": {
      const w = Math.sin(ph * 7) > 0 ? 1 : 0;
      limb(g, sh.lx, sh.ly, sh.lx, y - 18 + Y, 3, SUITC.w); limb(g, sh.lx, y - 18 + Y, x - 1 + w, y - 16 + Y, 3, SUITC.w);
      limb(g, sh.rx, sh.ry, sh.rx, y - 18 + Y, 3, SUITC.s); limb(g, sh.rx, y - 18 + Y, x + 1 - w, y - 16 + Y, 3, SUITC.s);
      hand(x - 1 + w, y - 16 + Y); hand(x + 1 - w, y - 15 + Y); break;
    }
    case "wave": {
      const wv = Math.sin(ph * 8) * 2;
      limb(g, sh.lx, sh.ly, sh.lx - 1, y - 14, 3, SUITC.w); hand(sh.lx - 1, y - 13);
      limb(g, sh.rx, sh.ry, sh.rx + 4, y - 32 + Y, 3, SUITC.s); limb(g, sh.rx + 4, y - 32 + Y, sh.rx + 5 + wv, y - 40 + Y, 3, SUITC.s); hand(sh.rx + 5 + wv, y - 41 + Y); break;
    }
    default: {
      limb(g, sh.lx, sh.ly, sh.lx - 1, y - 14 + Y, 3, SUITC.w); hand(sh.lx - 1, y - 13 + Y);
      limb(g, sh.rx, sh.ry, sh.rx + 1, y - 14 + Y, 3, SUITC.s); hand(sh.rx + 1, y - 13 + Y);
    }
  }
  // head
  const ht = Math.round((o.ht || 0) * 2), hy = -41 + Y;
  const H = (dx, dy, w, h, c) => R(dx, hy + dy, w, h, c);
  H(-2, 10, 4, 3, L.skinS); // neck
  if (L.style === "hijab") {
    H(-6, 0, 12, 13, L.hair); H(-7, 3, 14, 10, L.hair); H(-5, -1, 10, 1, L.hair); H(4, 1, 3, 12, L.hairS); H(-6, 12, 12, 3, L.hairS);
    H(-4 + ht, 3, 8, 8, L.skin); H(2 + ht, 3, 2, 8, L.skinS); H(-4 + ht, 3, 8, 1, L.hairS); H(-4, 0, 3, 1, L.hairH);
  } else {
    H(-5, 0, 10, 11, L.skin); H(2 + ht, 1, 3, 10, L.skinS); H(-4, 11, 8, 1, L.skin);
    if (ht <= 0) H(5, 4, 1, 3, L.skinS); if (ht >= 0) H(-6, 4, 1, 3, L.skin);
    if (L.style === "short") { H(-5, -2, 10, 3, L.hair); H(-6, 0, 12, 2, L.hair); H(-6, 2, 1, 2, L.hair); H(5, 2, 1, 2, L.hairS); H(-4 + ht, 2, 5, 1, L.hair); H(-3, -2, 4, 1, L.hairH); }
    if (L.style === "buzz") { H(-5, -1, 10, 2, L.hair); H(-6, 1, 12, 1, L.hair); H(-6, 2, 1, 2, L.hair); H(5, 2, 1, 2, L.hair); H(-2, -1, 1, 1, L.hairS); }
    if (L.style === "curly") { H(-6, -2, 12, 4, L.hair); H(-7, 0, 14, 3, L.hair); [-6, -3, 0, 3].forEach((dx) => H(dx, -3, 2, 1, L.hair)); H(-7, 3, 2, 3, L.hair); H(5, 3, 2, 3, L.hair); [-4, 1].forEach((dx) => H(dx, -1, 1, 1, L.hairH)); }
  }
  // face features
  const ex1 = -3 + ht, ex2 = 1 + ht, ey = 5;
  const blink = o.blink || 0;
  [ex1, ex2].forEach((ex) => {
    if (blink >= 2) { H(ex, ey + 1, 2, 1, SUITC.dark); return; }
    H(ex, ey, 2, 2, SUITC.eyeW);
    const px = (o.gx || 0) < 0 ? 0 : (o.gx || 0) > 0 ? 1 : (ex === ex1 ? 1 : 0);
    const py = (o.gy || 0) > 0 ? 1 : 0;
    H(ex + px, ey + py, 1, py ? 1 : 2, L.iris === "#3a6ea8" ? "#1e3c66" : SUITC.dark);
    if (blink === 1 || blink === 3) H(ex, ey, 2, 1, L.skin);
  });
  // brows
  const bc = L.brow;
  if (o.brow === "angry") { H(ex1, ey - 2, 1, 1, bc); H(ex1 + 1, ey - 1, 1, 1, bc); H(ex2 + 1, ey - 2, 1, 1, bc); H(ex2, ey - 1, 1, 1, bc); }
  else if (o.brow === "worry") { H(ex1, ey - 1, 1, 1, bc); H(ex1 + 1, ey - 2, 1, 1, bc); H(ex2, ey - 2, 1, 1, bc); H(ex2 + 1, ey - 1, 1, 1, bc); }
  else if (L.style !== "hijab" || true) { H(ex1, ey - 2, 2, 1, bc); H(ex2, ey - 2, 2, 1, bc); }
  if (L.glasses) { const gc = "#0e1018"; H(ex1 - 1, ey - 1, 4, 1, gc); H(ex1 - 1, ey + 2, 4, 1, gc); H(ex2 - 1, ey - 1, 4, 1, gc); H(ex2 - 1, ey + 2, 4, 1, gc); H(ex1 + 2, ey, 1, 1, gc); if (o.glassGlint) { H(ex1, ey, 1, 1, "#ffffff"); H(ex2 + 1, ey, 1, 1, "#ffffff"); } }
  const mx = -1 + ht, my = 9;
  if (L.beard) { H(-5, 7, 10, 4, L.hair); H(-4, 11, 8, 1, L.hair); H(-1, 10, 2, 1, L.hairH); H(-5, 7, 1, 2, L.hairH); H(4, 7, 1, 2, L.hairH); H(-2 + ht, 8, 4, 2, L.skin); }
  if (L.mustache) H(-3 + ht, 8, 6, 1, L.hair);
  const m = o.mouth || "closed";
  if (m === "smile" || m === "forced") { H(mx - 1, my, 4, 1, SUITC.dark); H(mx - 2, my - 1, 1, 1, SUITC.dark); H(mx + 3, my - 1, 1, 1, SUITC.dark); if (m === "forced") H(mx, my, 2, 1, "#fff"); }
  else if (m === "half") { H(mx, my, 3, 1, L.lip); H(mx + 3, my - 1, 1, 1, L.lip); }
  else if (m === "talk") { H(mx, my - 1, 2, 2, "#4a1a1e"); }
  else if (m === "tight") { H(mx - 1, my, 4, 1, "#4a1a1e"); }
  else H(mx, my, 2, 1, L.lip);
  if (!L.beard) { H(ex1 - 1, ey + 3, 1, 1, mixHex(L.skin, "#ff7a6a", 0.35)); H(ex2 + 2, ey + 3, 1, 1, mixHex(L.skin, "#ff7a6a", 0.35)); }
}
function mixHex(a, b, k) { const A = hexToRgb(a), B = hexToRgb(b); return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`; }

// ---------------------------------------------------------------- 40 px SIDE figure in a helmet (Mars surface)
// o: f facing (1 right/-1 left), look (head facing, default f), tilt (-1 up), step phase, air (0..1 height), arm pose, band (visor storm reflection)
function figHelmet(g, id, x, y, o = {}) {
  const L = LOOK[id], f = o.f || 1, look = o.look || f;
  const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(f > 0 ? x + dx : x - dx - w), Math.round(y + dy), w, h); };
  const air = o.air || 0, stp = o.step || 0;
  // legs: tucked in the air, stride on the ground
  const tuck = air > 0.15 ? 2 : 0;
  const s1 = Math.round(Math.sin(stp) * 3), s2 = -s1;
  R(-3 + s2, -14 + tuck, 4, 11 - tuck, SUITC.s); R(-3 + s2, -4, 4, 4, SUITC.bootS);
  R(-1 + s1, -14 + tuck, 4, 11 - tuck, SUITC.w); R(-1 + s1, -4, 5, 4, SUITC.boot);
  // backpack
  R(-9, -30, 5, 14, "#e2ddd0"); R(-9, -30, 5, 1, "#ffffff"); R(-8, -26, 3, 2, (o.t * 2 | 0) % 2 ? L.stripe : mixHex(L.stripe, "#000", 0.4));
  // torso
  R(-5, -29, 11, 15, SUITC.w); R(3, -29, 3, 15, SUITC.s); R(-5, -23, 11, 2, L.stripe); R(-5, -21, 11, 1, L.stripeS); R(-5, -15, 11, 1, SUITC.greyS);
  if (id === "marcus") { R(2, -24, 4, 4, "#26304a"); R(3, -23, 2, 2, "#5fb7ff"); }
  if (id === "lead") { R(1, -28, 3, 3, SUITC.gold); }
  // arms
  const sx = x + f * 1, sy = y - 26;
  const P = (dx, dy) => [x + f * dx, y + dy];
  const glove = (hx, hy, c = "#c8ccd6") => { g.fillStyle = c; g.fillRect(Math.round(hx - 1), Math.round(hy - 1), 3, 3); };
  const swing = Math.sin(stp) * 4;
  switch (o.arm) {
    case "point": { const [ex, ey] = P(7, -24), [hx, hy] = P(13, -24); limb(g, sx, sy, ex, ey, 3, SUITC.w); limb(g, ex, ey, hx, hy, 3, SUITC.w); glove(hx, hy); break; }
    case "waveoff": { const k = o.armK || 0; const [ex, ey] = P(-4 - k * 3, -20 - k * 4), [hx, hy] = P(-7 - k * 5, -24 - k * 6); limb(g, sx, sy, ex, ey, 3, SUITC.w); limb(g, ex, ey, hx, hy, 3, SUITC.w); glove(hx, hy); break; }
    case "wave": { const w = Math.sin(o.t * 12) * 3; const [ex, ey] = P(3, -34), [hx, hy] = P(4 + w, -41); limb(g, sx, sy, ex, ey, 3, SUITC.w); limb(g, ex, ey, hx, hy, 3, SUITC.w); glove(hx, hy); break; }
    case "up": { const [ex, ey] = P(4, -31), [hx, hy] = P(7, -36); limb(g, sx, sy, ex, ey, 3, SUITC.w); limb(g, ex, ey, hx, hy, 3, SUITC.w); glove(hx, hy); break; }
    default: { const [ex, ey] = P(swing * 0.5, -19), [hx, hy] = P(swing, -14); limb(g, sx, sy, ex, ey, 3, SUITC.w); limb(g, ex, ey, hx, hy, 3, SUITC.w); glove(hx, hy, o.gloveCheck ? "#ffd34a" : "#c8ccd6"); }
  }
  // helmet (head direction can differ from the body)
  const hx = x + f * 1, hy = y - 36 + (o.tilt || 0);
  pxCircle(g, hx, hy, 7, "#eef0f4"); pxCircle(g, hx, hy, 6, "#dfe3ea");
  const vx = hx + look * 2, vy = hy + (o.tilt || 0) * 0.5;
  pxEllipse(g, vx, vy, 4, 4, "#b8862a"); pxEllipse(g, vx, vy - 0.5, 4, 3, "#e0aa3a");
  g.fillStyle = "#fff4c0"; g.fillRect(Math.round(vx - look * 2 - 1), Math.round(vy - 3), 2, 1); g.fillRect(Math.round(vx - look * 3), Math.round(vy - 2), 1, 1);
  if (o.band) { g.fillStyle = `rgba(60,30,18,${o.band})`; g.fillRect(Math.round(vx - 4), Math.round(vy), 9, 2); }
  g.fillStyle = L.stripe; g.fillRect(Math.round(hx - 7), Math.round(hy + 5), 15, 1);
}

// ---------------------------------------------------------------- 96 px CLOSE bust (detailed face)
// o: f facing (mirror), turn (-1..1 head yaw), bodyTurn, gx/gy gaze, blink 0..3, mouth, brow, arm, armK (0..1), breathe px,
//    highlight (eye glint), star, glint, knuckles, tint
function bust(g, id, x, y, o = {}) {
  const L = LOOK[id], f = o.f || 1;
  const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(f > 0 ? x + dx : x - dx - w), Math.round(y + dy), w, h); };
  const P = (dx, dy) => [x + f * dx, y + dy];
  const br = Math.round(o.breathe || 0);
  const bt = Math.round((o.bodyTurn ?? o.turn ?? 0) * 4);
  const tY = -br;
  // ---- torso
  R(-30 + bt, -44 + tY, 60, 44 - tY + 2, SUITC.w);
  R(-28 + bt, -46 + tY, 56, 2, SUITC.w); R(-24 + bt, -48 + tY, 48, 2, SUITC.w);
  R(14 + bt, -46 + tY, 16, 48, SUITC.s); R(24 + bt, -42 + tY, 6, 44, SUITC.d); // far side shade
  R(-30 + bt, -40 + tY, 2, 40, SUITC.s);
  R(-30 + bt, -26 + tY, 60, 5, L.stripe); R(-30 + bt, -21 + tY, 60, 2, L.stripeS); R(14 + bt, -26 + tY, 16, 7, L.stripeS);
  R(-1 + bt, -44 + tY, 2, 46, SUITC.s); // zipper
  R(-13 + bt, -50 + tY, 26, 5, SUITC.grey); R(-13 + bt, -50 + tY, 26, 1, "#c3cad8"); R(-13 + bt, -46 + tY, 26, 1, SUITC.greyS);
  [-24, 22].forEach((sx) => R(sx + bt, -44 + tY, 2, 6, SUITC.s)); // shoulder seams
  if (L.magnifier) { R(-6 + bt, -44 + tY, 1, 12, "#7a6a3a"); R(5 + bt, -44 + tY, 1, 12, "#7a6a3a"); R(-3 + bt, -33 + tY, 7, 7, "#d9b24a"); R(-2 + bt, -32 + tY, 5, 5, "#bfe8ff"); R(-1 + bt, -31 + tY, 2, 1, "#fff"); }
  if (id === "diego") { R(-30 + bt, -6, 60, 4, "#7a5232"); R(12 + bt, -8, 4, 8, "#9aa3b5"); R(13 + bt, -10, 2, 3, "#e07a2a"); }
  // star on the left shoulder (viewer's right when facing camera)
  if (o.star) {
    const sx = 16 + bt, sy = -43 + tY;
    R(sx + 2, sy, 1, 1, SUITC.gold); R(sx + 1, sy + 1, 3, 1, SUITC.gold); R(sx, sy + 2, 5, 1, SUITC.gold); R(sx + 1, sy + 3, 3, 1, SUITC.gold); R(sx, sy + 4, 2, 1, SUITC.goldS); R(sx + 3, sy + 4, 2, 1, SUITC.goldS); R(sx + 2, sy + 1, 1, 1, "#fff6c0");
    if (o.glint) { const k = o.glint; R(sx + 2, sy - 3 - k, 1, 2 + k, "#ffffff"); R(sx + 2, sy + 5, 1, 2 + k, "#ffffff"); R(sx - 3 - k, sy + 2, 2 + k, 1, "#ffffff"); R(sx + 6, sy + 2, 2 + k, 1, "#ffffff"); }
  }
  // ---- neck
  R(-7 + bt / 2, -56 + tY, 14, 9, L.skinS); R(-7 + bt / 2, -56 + tY, 14, 2, L.skinD);
  // ---- head
  const t = o.turn || 0, c = Math.round(t * 6), HY = -94 + tY;
  const H = (dx, dy, w, h, col) => R(dx, HY + dy, w, h, col);
  const square = L.jaw === "square";
  if (L.style === "hijab") {
    H(-19, -4, 38, 44, L.hair); H(-21, 4, 42, 36, L.hair); H(-15, -6, 30, 2, L.hair); H(-26, 34, 52, 12, L.hair); H(10, -2, 11, 46, L.hairS); H(-26, 42, 52, 4, L.hairS); H(-14, -4, 10, 2, L.hairH); H(-19, 4, 2, 14, L.hairH);
    // face opening
    H(-13 + c, 6, 26, 30, L.skin); H(-11 + c, 36, 22, 2, L.skin); H(-8 + c, 38, 16, 1, L.skin); H(6 + c, 8, 7, 28, L.skinS); H(-13 + c, 6, 26, 2, L.hairS);
  } else {
    H(-16, 4, 32, 30, L.skin); H(-17, 10, 34, 20, L.skin);
    if (square) { H(-15, 34, 30, 3, L.skin); H(-12, 37, 24, 2, L.skin); } else { H(-14, 34, 28, 2, L.skin); H(-10, 36, 20, 2, L.skin); H(-6, 38, 12, 1, L.skin); }
    // shading on the far side
    if (t >= 0) { H(10 + c / 2, 6, 7 - c / 2 + 1, 28, L.skinS); H(12, 34, 3, 3, L.skinS); } else { H(-17, 6, 6 + c / 2, 28, L.skinS); }
    // ears
    if (t < 0.4) { H(-19, 18, 3, 9, L.skin); H(-18, 20, 1, 5, L.skinD); }
    if (t > -0.4) { H(16, 18, 3, 9, L.skinS); H(17, 20, 1, 5, L.skinD); }
    // hair
    if (L.style === "short") { H(-17, -4, 34, 10, L.hair); H(-18, 0, 36, 8, L.hair); H(-18, 8, 3, 9, L.hair); H(15, 8, 3, 9, L.hairS); H(-15 + c, 6, 18, 3, L.hair); H(-15 + c, 9, 8, 2, L.hair); H(-12, -4, 14, 2, L.hairH); H(-8, -2, 10, 1, L.hairH); H(8, -2, 9, 8, L.hairS); H(-17, 3, 2, 3, L.hairS); }
    if (L.style === "buzz") { H(-15, -1, 30, 6, L.hair); H(-17, 3, 34, 4, L.hair); H(-17, 7, 2, 8, L.hair); H(15, 7, 2, 8, L.hair); [[-8, 0], [2, 1], [9, 2], [-3, 3]].forEach(([dx, dy]) => H(dx, dy, 1, 1, L.hairS)); }
    if (L.style === "curly") { H(-19, -5, 38, 13, L.hair); H(-22, 0, 44, 10, L.hair); [[-20, -7], [-12, -9], [-3, -9], [6, -8], [14, -6], [-24, 4], [20, 4]].forEach(([dx, dy]) => H(dx, dy, 8, 5, L.hair)); H(-22, 10, 5, 12, L.hair); H(17, 10, 5, 12, L.hairS); H(-14 + c, 8, 10, 3, L.hair); [[-14, -5], [-4, -6], [6, -4], [-18, 3], [12, 1]].forEach(([dx, dy]) => H(dx, dy, 3, 1, L.hairH)); }
  }
  // ---- eyes
  const blink = o.blink || 0, gx = o.gx || 0, gy = o.gy || 0;
  const eyes = [{ cx: -8 + c, w: t < -0.3 ? 5 : 7 }, { cx: 8 + c, w: t > 0.3 ? 5 : 7 }];
  const ey = 18;
  for (const e of eyes) {
    const ex = e.cx - (e.w >> 1);
    if (blink === 2) { H(ex, ey + 2, e.w, 1, SUITC.dark); H(ex, ey + 1, e.w, 1, L.skinS); continue; }
    H(ex, ey, e.w, 5, SUITC.eyeW);
    const ix = e.cx - 2 + Math.round(gx * 1.6), iy = ey + Math.round(gy * 1);
    H(Math.max(ex, Math.min(ex + e.w - 4, ix)), iy, 4, 5 - Math.abs(Math.round(gy)), L.iris);
    H(Math.max(ex + 1, Math.min(ex + e.w - 3, ix + 1)), iy + 1, 2, 3, "#0d0a10");
    H(Math.max(ex, Math.min(ex + e.w - 4, ix)), iy, 1, 1, "#ffffff");
    if (o.highlight) H(Math.max(ex, Math.min(ex + e.w - 4, ix)) + 1, iy, 1, 2, "#ffffff");
    H(ex - 1, ey - 1, e.w + 2, 1, SUITC.dark); // upper lash line
    if (blink === 1 || blink === 3) { H(ex, ey, e.w, 3, L.skin); H(ex, ey + 2, e.w, 1, SUITC.dark); }
  }
  // ---- brows
  const bc = L.brow, bw = 8;
  for (let i = 0; i < 2; i++) {
    const e = eyes[i], bx = e.cx - 4;
    for (let k = 0; k < bw; k++) {
      const inner = i === 0 ? k / (bw - 1) : 1 - k / (bw - 1); // 1 at the inner end
      let dy = 0;
      if (o.brow === "angry") dy = Math.round(inner * 3) - 1;
      else if (o.brow === "worry") dy = -Math.round(inner * 3) + 1;
      else if (o.brow === "proud") dy = -Math.round(Math.sin((k / (bw - 1)) * Math.PI) * 1.5);
      else if (o.brow === "firm") dy = Math.round(inner * 1);
      H(bx + k, 14 + dy, 1, square ? 2 : 2, bc);
    }
  }
  // ---- glasses
  if (L.glasses) {
    const gc = "#0b0d14";
    for (const e of eyes) { const fx = e.cx - 6, fw = 12; H(fx, ey - 3, fw, 1, gc); H(fx, ey + 7, fw, 1, gc); H(fx, ey - 3, 1, 11, gc); H(fx + fw - 1, ey - 3, 1, 11, gc); g.fillStyle = "rgba(170,210,255,0.12)"; R(fx + 1, HY + ey - 2, fw - 2, 9, "rgba(170,210,255,0.12)"); }
    H(eyes[0].cx + 6, ey - 1, eyes[1].cx - eyes[0].cx - 12, 1, gc);
    if (o.glassGlint) { H(eyes[0].cx - 4, ey - 2, 3, 1, "#ffffff"); H(eyes[0].cx - 4, ey - 1, 1, 2, "#ffffff"); H(eyes[1].cx + 2, ey - 2, 2, 1, "#e8f6ff"); }
  }
  // ---- nose
  const nx = c + (t >= 0 ? 2 : -3);
  H(nx, 22, 1, 7, L.skinS); H(nx - 2, 29, 5, 1, L.skinS); H(nx - 2, 30, 4, 1, L.skinD);
  // ---- cheeks
  if (!L.beard) { H(eyes[0].cx - 4, 26, 4, 1, mixHex(L.skin, "#ff7a6a", 0.35)); H(eyes[1].cx + 1, 26, 4, 1, mixHex(L.skin, "#ff7a6a", 0.35)); }
  // ---- beard / moustache
  if (L.beard) {
    H(-16, 26, 32, 10, L.hair); H(-14, 36, 28, 3, L.hair); H(-10, 39, 20, 2, L.hair); H(-17, 14, 3, 14, L.hair); H(14, 14, 3, 14, L.hair);
    [[-17, 15], [-16, 18], [15, 16], [14, 20], [-3, 39], [0, 40], [3, 39], [-6, 38], [5, 38]].forEach(([dx, dy]) => H(dx, dy, 1, 1, L.hairH)); // grey on chin + sideburns
    H(-6 + c, 31, 12, 4, L.skinS);
  }
  if (L.mustache) { H(-8 + c, 30, 16, 2, L.hair); H(-9 + c, 31, 2, 2, L.hair); H(7 + c, 31, 2, 2, L.hair); }
  // ---- mouth
  const mx = c, my = 33, m = o.mouth || "closed";
  if (m === "talk") { H(mx - 4, my - 1, 8, 4, "#3a1418"); H(mx - 3, my - 1, 6, 1, "#f4f0e8"); H(mx - 2, my + 2, 4, 1, "#b24a4e"); }
  else if (m === "tight") { H(mx - 5, my, 10, 1, "#3a1418"); H(mx - 4, my + 1, 8, 1, L.skinS); }
  else if (m === "smile") { H(mx - 4, my, 8, 1, "#3a1418"); H(mx - 5, my - 1, 1, 1, "#3a1418"); H(mx + 4, my - 1, 1, 1, "#3a1418"); H(mx - 3, my + 1, 6, 1, L.lip); }
  else if (m === "half") { H(mx - 3, my, 7, 1, "#3a1418"); H(mx + 4, my - 1, 1, 1, "#3a1418"); H(mx + 5, my - 2, 1, 1, "#3a1418"); H(mx - 2, my + 1, 5, 1, L.lip); }
  else if (m === "forced") { H(mx - 6, my - 1, 12, 3, "#3a1418"); H(mx - 5, my - 1, 10, 1, "#f4f0e8"); H(mx - 7, my - 2, 1, 1, "#3a1418"); H(mx + 6, my - 2, 1, 1, "#3a1418"); }
  else if (m === "surprised") { H(mx - 2, my - 2, 4, 5, "#3a1418"); }
  else { H(mx - 4, my, 8, 1, L.lip); H(mx - 3, my + 1, 6, 1, L.skinS); }
  if (square && !L.beard) { H(-12, 37, 2, 1, L.skinS); H(10, 37, 2, 1, L.skinS); H(-2 + c, 37, 4, 1, L.skinS); } // jaw line + chin dimple
  // ---- arms
  const k = o.armK ?? 1;
  const sh = P(22 + bt, -40 + tY), shL = P(-24 + bt, -40 + tY);
  const hand = (hx, hy, w = 7, h = 6, kn = 0) => { const col = kn ? mixHex(L.skin, "#ffffff", kn * 0.5) : L.skin; g.fillStyle = col; g.fillRect(Math.round(hx - w / 2), Math.round(hy - h / 2), w, h); g.fillStyle = L.skinS; g.fillRect(Math.round(hx - w / 2), Math.round(hy + h / 2 - 1), w, 1); };
  switch (o.arm) {
    case "point": {
      const ex = lerp(24, 42, k), ey = lerp(-10, -36, k), hx = lerp(26, 66, k), hy = lerp(4, -38, k);
      const [EX, EY] = P(ex, ey), [HX, HY2] = P(hx, hy);
      limb(g, sh[0], sh[1], EX, EY, 9, SUITC.w); limb(g, EX, EY, HX, HY2, 8, SUITC.s);
      hand(HX + f * 2, HY2, 7, 7); if (k > 0.7) { g.fillStyle = L.skin; g.fillRect(Math.round(HX + f * (f > 0 ? 5 : -10)), Math.round(HY2 - 3), 6, 2); }
      break;
    }
    case "tablet": {
      const [ax, ay] = P(-8, -16 + tY), [bx2, by2] = P(10, -18 + tY);
      limb(g, shL[0], shL[1], ...P(-26, -14 + tY), 9, SUITC.w); limb(g, ...P(-26, -14 + tY), ax, ay, 8, SUITC.w);
      R(-10 + bt, -44 + tY, 22, 30, "#1c2236"); R(-8 + bt, -42 + tY, 18, 24, "#4fa8f0"); R(-8 + bt, -42 + tY, 18, 2, "#bfe6ff"); R(-6 + bt, -37 + tY, 10, 1, "#d8f2ff"); R(-6 + bt, -34 + tY, 13, 1, "#a8dcff"); R(-6 + bt, -31 + tY, 8, 1, "#a8dcff");
      g.globalAlpha = 0.18; pxCircle(g, x + f * (1 + bt), y - 30 + tY, 16, "#6fc8ff"); g.globalAlpha = 1;
      limb(g, sh[0], sh[1], ...P(24, -14 + tY), 9, SUITC.s); limb(g, ...P(24, -14 + tY), bx2, by2, 8, SUITC.s);
      hand(ax, ay, 7, 6, o.knuckles); hand(bx2, by2, 7, 6, o.knuckles);
      if (o.knuckles > 0.5) { g.fillStyle = "#ffffff"; g.fillRect(Math.round(bx2 - 3), Math.round(by2 - 3), 1, 1); g.fillRect(Math.round(bx2 - 1), Math.round(by2 - 3), 1, 1); g.fillRect(Math.round(bx2 + 1), Math.round(by2 - 3), 1, 1); }
      break;
    }
    case "star": { // opposite hand rests on the shoulder star
      const [elx, ely] = P(lerp(-24, -4, k), lerp(4, -18, k)), [hx, hy] = P(lerp(-22, 18, k), lerp(8, -40, k));
      limb(g, shL[0], shL[1], elx, ely, 9, SUITC.w); limb(g, elx, ely, hx, hy, 8, SUITC.w); hand(hx, hy, 8, 6);
      limb(g, sh[0], sh[1], ...P(30, 2), 9, SUITC.s);
      break;
    }
    case "console": {
      limb(g, shL[0], shL[1], ...P(-30, -10), 9, SUITC.w); limb(g, ...P(-30, -10), ...P(-22, 4), 8, SUITC.w);
      limb(g, sh[0], sh[1], ...P(30, -10), 9, SUITC.s); limb(g, ...P(30, -10), ...P(24, 4), 8, SUITC.s);
      break;
    }
    default: {
      limb(g, shL[0], shL[1], ...P(-32, 4), 9, SUITC.w); limb(g, sh[0], sh[1], ...P(32, 4), 9, SUITC.s);
    }
  }
  if (o.star && o.arm === "star" && k > 0.95) { /* hand covers the star */ }
}
// back view (Marcus at the weather screen)
function bustBack(g, id, x, y, o = {}) {
  const L = LOOK[id];
  const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); };
  const br = Math.round(o.breathe || 0);
  R(-30, -44 - br, 60, 46 + br, SUITC.w); R(-28, -46 - br, 56, 2, SUITC.w); R(-24, -48 - br, 48, 2, SUITC.w); R(14, -46 - br, 16, 48, SUITC.s);
  R(-30, -26 - br, 60, 5, L.stripe); R(-30, -21 - br, 60, 2, L.stripeS);
  R(-10, -44 - br, 20, 3, SUITC.s); R(-13, -50 - br, 26, 5, SUITC.grey);
  R(-7, -56 - br, 14, 9, L.skinS);
  const HY = -94 - br;
  R(-16, HY + 4, 32, 32, L.skinS); R(-19, HY + 18, 3, 9, L.skin); R(16, HY + 18, 3, 9, L.skinS);
  R(-16, HY - 1, 32, 30, L.hair); R(-17, HY + 4, 34, 22, L.hair); R(-14, HY + 29, 28, 3, L.hairS);
  [[-8, 4], [3, 8], [9, 14], [-11, 18], [0, 20]].forEach(([dx, dy]) => R(dx, HY + dy, 1, 1, L.hairS));
  if (L.glasses) { R(-18, HY + 18, 3, 1, "#0b0d14"); R(15, HY + 18, 3, 1, "#0b0d14"); }
  if (L.beard) { R(-17, HY + 26, 3, 8, L.hair); R(14, HY + 26, 3, 8, L.hair); }
  // tablet held at the side
  limb(g, x + 24, y - 40 - br, x + 32, y - 14, 9, SUITC.s); R(26, -26, 10, 16, "#1c2236"); R(27, -25, 8, 13, "#4fa8f0");
}
