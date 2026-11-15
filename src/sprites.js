// =====================================================================
//  PIXEL-ART CHARACTERS — drawn in code (no image files).
//  Walk-cycle frames for 4 directions + blink/talk portraits.
// =====================================================================
const CHAR_SPECS = {
  lead:   { skin: "#f2c9a0", skinS: "#d9a07a", hair: "#f0d26a", hairS: "#c49a3a", hairH: "#fff0a8", style: "short", stripe: "#e04848", stripeS: "#a82c34", badge: true, blush: "#f59a8a" },
  marcus: { skin: "#8a5634", skinS: "#6a3e24", hair: "#2a201c", hairS: "#1a1412", hairH: "#8f8a86", style: "buzz", stripe: "#3b7dd8", stripeS: "#285aa8", beard: true, glasses: true, tablet: true, blush: "#a85a48" },
  diego:  { skin: "#d39a68", skinS: "#ae7448", hair: "#231a17", hairS: "#120d0c", hairH: "#4a3a33", style: "curly", stripe: "#f08a2a", stripeS: "#c0621a", mustache: true, wrench: true, blush: "#e0866a" },
  layla:  { skin: "#e8b88f", skinS: "#c8946c", hair: "#2f6b45", hairS: "#214d31", hairH: "#4f9466", style: "hijab", stripe: "#4fb35e", stripeS: "#2f8a40", magnifier: true, blush: "#f29a8a" },
};
const SUIT = { w: "#eef2f7", s: "#c3cbd8", d: "#9aa3b5", belt: "#5b6378", boot: "#4a5068", bootS: "#363b4f", gold: "#ffd34a", eye: "#231c2c", out: "#1b1d2b", mouth: "#9c4e46", mouthO: "#5a1f24" };

function outlineCanvas(cv, color = SUIT.out) {
  const g = cv.getContext("2d"), w = cv.width, h = cv.height;
  const id = g.getImageData(0, 0, w, h), d = id.data, out = new Uint8ClampedArray(d);
  const rgb = hexToRgb(color);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] > 0) continue;
    let n = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && d[(Y * w + X) * 4 + 3] > 200) { n = true; break; } }
    if (n) { out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = 255; }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
  return cv;
}
function hexToRgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mkCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

// ---------------------------------------------------------------- body sprite 16x24 (+1px border)
function drawCharFrame(s, dir, frame, blink, helmet) {
  const cv = mkCanvas(18, 27), g = cv.getContext("2d");
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x + 1, y + 2, w, h); };
  const bob = frame === 1 || frame === 3 ? -1 : 0;
  const side = dir === 2; // left profile (right = mirrored)
  // ---- legs
  const legY = 19;
  if (!side) {
    const lUp = frame === 1 ? 1 : 0, rUp = frame === 3 ? 1 : 0;
    R(4, legY, 3, 3 - lUp, SUIT.s); R(9, legY, 3, 3 - rUp, SUIT.s);
    R(4, legY, 3, 1, SUIT.w); R(9, legY, 3, 1, SUIT.w);
    R(4, 22 - lUp, 3, 2, SUIT.boot); R(9, 22 - rUp, 3, 2, SUIT.boot);
    R(4, 23 - lUp, 3, 1, SUIT.bootS); R(9, 23 - rUp, 3, 1, SUIT.bootS);
  } else {
    if (frame === 1 || frame === 3) {
      const a = frame === 1 ? 4 : 9, b = frame === 1 ? 9 : 4;
      R(b, legY, 3, 3, SUIT.d); R(b, 22, 3, 2, SUIT.bootS);
      R(a, legY, 3, 3, SUIT.s); R(a, 22, 3, 2, SUIT.boot);
    } else { R(6, legY, 4, 3, SUIT.s); R(6, 22, 4, 2, SUIT.boot); R(6, 23, 4, 1, SUIT.bootS); }
  }
  const B = (x, y, w, h, c) => R(x, y + bob, w, h, c);
  // ---- arms (behind body for side)
  const swing = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  if (!side) {
    B(1, 12 + swing, 2, 6, SUIT.w); B(1, 17 + swing, 2, 1, SUIT.s); B(1, 18 + swing, 2, 1, s.skin);
    B(13, 12 - swing, 2, 6, SUIT.s); B(13, 18 - swing, 2, 1, s.skinS);
  }
  // ---- torso
  const bx = side ? 5 : 3, bw = side ? 6 : 10;
  B(bx, 11, bw, 7, SUIT.w);
  B(bx + bw - 2, 11, 2, 7, SUIT.s);
  B(bx, 13, bw, 2, s.stripe); B(bx, 14, bw, 1, s.stripeS);
  B(bx, 18, bw, 1, s.wrench ? "#7a5232" : SUIT.belt);
  if (!side && dir === 0) B(7, 18, 2, 1, SUIT.gold);
  if (s.badge && dir === 0) { B(4, 11, 2, 1, SUIT.gold); B(4, 12, 1, 1, SUIT.gold); }
  if (s.magnifier && dir !== 1) { B(side ? 6 : 7, 15, 2, 2, "#d9b24a"); B(side ? 6 : 7, 15, 1, 1, "#bfe8ff"); }
  if (s.wrench && dir !== 1) { B(side ? 9 : 11, 18, 1, 3, "#9aa3b5"); B(side ? 8 : 10, 20, 3, 1, "#9aa3b5"); }
  if (side) { // front arm
    B(7 + swing, 12, 3, 5, SUIT.w); B(7 + swing, 16, 3, 1, SUIT.s); B(7 + swing, 17, 3, 1, s.skin);
    if (s.tablet) { B(5 + swing, 14, 3, 4, "#2b3550"); B(5 + swing, 15, 2, 2, "#6fd3ff"); }
  } else if (s.tablet && dir === 0) { B(12, 14 - swing, 4, 5, "#2b3550"); B(13, 15 - swing, 2, 3, "#6fd3ff"); }
  // ---- head
  const H = (x, y, w, h, c) => B(x, y, w, h, c);
  if (s.style === "hijab") {
    if (!side) {
      H(2, 1, 12, 11, s.hair); H(1, 4, 14, 8, s.hair); H(3, 0, 10, 1, s.hair); H(12, 2, 2, 9, s.hairS); H(3, 11, 10, 2, s.hairS);
      if (dir === 0) { H(4, 3, 8, 7, s.skin); H(4, 3, 8, 1, s.hairS); H(4, 9, 1, 1, s.hair); H(11, 9, 1, 1, s.hair); H(4, 4, 1, 1, s.hairH); }
      H(4, 1, 3, 1, s.hairH);
    } else {
      H(3, 0, 9, 1, s.hair); H(2, 1, 11, 11, s.hair); H(9, 2, 4, 10, s.hairS); H(3, 3, 5, 7, s.skin); H(2, 7, 1, 1, s.skin); H(3, 3, 5, 1, s.hairS); H(4, 1, 3, 1, s.hairH);
    }
  } else {
    if (!side) { H(3, 3, 10, 8, s.skin); H(3, 10, 1, 1, "rgba(0,0,0,0)"); H(2, 6, 1, 2, s.skinS); H(13, 6, 1, 2, s.skinS); H(11, 4, 2, 6, s.skinS); H(6, 11, 4, 1, s.skinS); }
    else { H(4, 3, 7, 8, s.skin); H(3, 7, 1, 1, s.skin); H(9, 6, 1, 2, s.skinS); H(6, 11, 4, 1, s.skinS); }
    if (dir === 1) H(3, 3, 10, 8, s.hair);
    // hair styles
    if (s.style === "short") {
      if (!side) { H(4, 1, 8, 2, s.hair); H(3, 2, 10, 2, s.hair); if (dir === 0) { H(4, 4, 6, 1, s.hair); H(3, 4, 1, 2, s.hair); H(12, 4, 1, 2, s.hairS); } H(5, 1, 3, 1, s.hairH); if (dir === 1) { H(3, 4, 10, 5, s.hair); H(10, 3, 3, 6, s.hairS); } }
      else { H(4, 1, 7, 2, s.hair); H(4, 3, 7, 1, s.hair); H(4, 4, 2, 1, s.hair); H(9, 4, 2, 4, s.hair); H(10, 3, 1, 5, s.hairS); H(5, 1, 3, 1, s.hairH); }
    } else if (s.style === "buzz") {
      if (!side) { H(4, 2, 8, 1, s.hair); H(3, 3, 10, 1, s.hair); if (dir === 0) { H(3, 4, 1, 2, s.hair); H(12, 4, 1, 2, s.hair); } H(6, 2, 1, 1, s.hairH); H(9, 3, 1, 1, s.hairH); if (dir === 1) { H(3, 4, 10, 4, s.hair); H(5, 5, 1, 1, s.hairH); } }
      else { H(5, 2, 6, 1, s.hair); H(4, 3, 7, 1, s.hair); H(9, 4, 2, 3, s.hair); H(7, 2, 1, 1, s.hairH); }
    } else if (s.style === "curly") {
      if (!side) { H(3, 1, 10, 3, s.hair); H(2, 2, 12, 2, s.hair); [3, 6, 9, 12].forEach((x) => H(x, 0, 2, 1, s.hair)); if (dir === 0) { H(2, 4, 2, 3, s.hair); H(12, 4, 2, 3, s.hair); H(5, 4, 2, 1, s.hair); H(9, 4, 1, 1, s.hair); } [4, 8, 11].forEach((x) => H(x, 1, 1, 1, s.hairH)); if (dir === 1) { H(2, 4, 12, 6, s.hair); H(4, 5, 1, 1, s.hairH); H(9, 7, 1, 1, s.hairH); } }
      else { H(3, 1, 9, 3, s.hair); [4, 7, 10].forEach((x) => H(x, 0, 2, 1, s.hair)); H(3, 4, 2, 1, s.hair); H(8, 4, 4, 5, s.hair); H(11, 3, 2, 5, s.hairS); [5, 9].forEach((x) => H(x, 1, 1, 1, s.hairH)); }
    }
    // face
    if (dir === 0) {
      if (blink) { H(5, 7, 1, 1, SUIT.eye); H(10, 7, 1, 1, SUIT.eye); } else { H(5, 6, 1, 2, SUIT.eye); H(10, 6, 1, 2, SUIT.eye); }
      H(4, 8, 1, 1, s.blush); H(11, 8, 1, 1, s.blush);
      if (s.glasses) { g.fillStyle = "#11131c"; [[4, 5, 3, 1], [4, 8, 3, 1], [4, 5, 1, 4], [6, 5, 1, 4], [9, 5, 3, 1], [9, 8, 3, 1], [9, 5, 1, 4], [11, 5, 1, 4], [7, 6, 2, 1]].forEach(([x, y, w, h]) => g.fillRect(x + 1, y + 2 + bob, w, h)); }
      if (s.beard) { H(3, 8, 1, 3, s.hair); H(12, 8, 1, 3, s.hair); H(4, 9, 8, 2, s.hair); H(5, 10, 1, 1, s.hairH); H(9, 9, 1, 1, s.hairH); H(7, 9, 2, 1, SUIT.mouth); }
      else if (s.mustache) { H(5, 8, 6, 1, s.hair); H(7, 9, 2, 1, SUIT.mouth); }
      else H(7, 9, 2, 1, SUIT.mouth);
    } else if (side) {
      if (blink) H(5, 7, 1, 1, SUIT.eye); else H(5, 6, 1, 2, SUIT.eye);
      H(5, 8, 1, 1, s.blush);
      if (s.glasses) { g.fillStyle = "#11131c"; g.fillRect(5, 7 + bob, 3, 1); g.fillRect(5, 10 + bob, 3, 1); g.fillRect(5, 7 + bob, 1, 4); g.fillRect(7, 7 + bob, 1, 4); g.fillRect(8, 8 + bob, 2, 1); }
      if (s.beard) { H(4, 9, 6, 2, s.hair); H(9, 7, 1, 3, s.hair); H(4, 9, 2, 1, SUIT.mouth); }
      else if (s.mustache) { H(3, 8, 3, 1, s.hair); H(4, 9, 1, 1, SUIT.mouth); }
      else H(4, 9, 1, 1, SUIT.mouth);
    }
  }
  if (helmet) {
    g.fillStyle = "rgba(170,220,255,0.28)"; g.beginPath(); g.ellipse(9, 8 + bob, 8, 7.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#dfe8f5"; g.lineWidth = 1; g.beginPath(); g.ellipse(9, 8.5 + bob, 7.5, 7, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(4, 4 + bob, 2, 1); g.fillRect(3, 5 + bob, 1, 2);
    g.fillStyle = SUIT.s; g.fillRect(4, 14 + bob, 10, 1);
  }
  return outlineCanvas(cv);
}

const CharSprites = {};
function buildCharSprites() {
  for (const id in CHAR_SPECS) {
    for (const helmet of [false, true]) {
      const key = id + (helmet ? "_h" : "");
      const set = { dirs: [] };
      for (let dir = 0; dir < 4; dir++) {
        const frames = [];
        for (let f = 0; f < 4; f++) {
          const pair = [];
          for (const blink of [false, true]) {
            let c = drawCharFrame(CHAR_SPECS[id], dir === 3 ? 2 : dir, f, blink, helmet);
            if (dir === 3) { const m = mkCanvas(c.width, c.height), mg = m.getContext("2d"); mg.translate(c.width, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); c = m; }
            pair.push(c);
          }
          frames.push(pair);
        }
        set.dirs.push(frames);
      }
      CharSprites[key] = set;
    }
  }
}

// ---------------------------------------------------------------- portraits 40x40
function drawPortrait(s, blink, talk, mood = 0) {
  const cv = mkCanvas(42, 42), g = cv.getContext("2d");
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x + 1, y + 1, w, h); };
  // shoulders / suit
  R(4, 31, 32, 9, SUIT.w); R(6, 30, 28, 1, SUIT.w); R(28, 31, 8, 9, SUIT.s); R(4, 35, 32, 2, s.stripe); R(4, 37, 32, 1, s.stripeS);
  R(14, 29, 12, 3, SUIT.s); R(15, 30, 10, 1, SUIT.d);
  if (s.badge) { R(8, 32, 3, 1, SUIT.gold); R(9, 31, 1, 3, SUIT.gold); }
  if (s.magnifier) { R(18, 32, 4, 4, "#d9b24a"); R(19, 33, 2, 2, "#bfe8ff"); R(17, 30, 1, 3, "#7a6a3a"); R(22, 30, 1, 3, "#7a6a3a"); }
  if (s.wrench) { R(29, 31, 2, 9, "#9aa3b5"); R(28, 31, 4, 2, "#9aa3b5"); R(29, 31, 2, 1, "#c8d0dc"); }
  if (s.tablet) { R(26, 32, 9, 8, "#2b3550"); R(27, 33, 7, 5, "#6fd3ff"); R(28, 34, 4, 1, "#d9f4ff"); }
  // neck
  R(16, 26, 8, 4, s.skinS);
  if (s.style === "hijab") {
    R(7, 4, 26, 28, s.hair); R(5, 10, 30, 22, s.hair); R(9, 2, 22, 2, s.hair); R(4, 22, 32, 10, s.hair); R(27, 6, 6, 26, s.hairS); R(4, 28, 32, 3, s.hairS);
    R(11, 9, 18, 18, s.skin); R(12, 8, 16, 1, s.skin); R(13, 27, 14, 1, s.skin); R(11, 9, 18, 2, s.hairS); R(11, 26, 2, 1, s.hair); R(27, 26, 2, 1, s.hair);
    R(10, 4, 8, 2, s.hairH); R(8, 7, 2, 6, s.hairH);
    R(24, 12, 4, 13, s.skinS);
  } else {
    R(10, 8, 20, 18, s.skin); R(11, 26, 18, 1, s.skin); R(13, 27, 14, 1, s.skin); R(8, 15, 2, 5, s.skin); R(30, 15, 2, 5, s.skinS); R(25, 9, 5, 17, s.skinS);
    if (s.style === "short") { R(10, 3, 20, 6, s.hair); R(9, 5, 22, 6, s.hair); R(9, 11, 2, 4, s.hair); R(29, 11, 2, 4, s.hairS); R(11, 11, 10, 2, s.hair); R(11, 13, 4, 1, s.hair); R(13, 4, 7, 2, s.hairH); R(26, 5, 4, 6, s.hairS); }
    if (s.style === "buzz") { R(11, 5, 18, 3, s.hair); R(10, 7, 20, 3, s.hair); R(10, 10, 1, 4, s.hair); R(29, 10, 1, 4, s.hair); [[22, 7], [15, 8]].forEach(([x, y]) => R(x, y, 1, 1, s.hairS)); }
    if (s.style === "curly") { R(8, 3, 24, 9, s.hair); R(6, 6, 28, 6, s.hair); [[8, 2], [13, 1], [18, 1], [23, 1], [28, 2], [5, 8], [33, 8]].forEach(([x, y]) => R(x, y, 4, 3, s.hair)); R(6, 12, 4, 7, s.hair); R(30, 12, 4, 7, s.hairS); R(12, 12, 6, 2, s.hair); [[10, 4], [16, 3], [22, 4], [27, 5], [9, 9]].forEach(([x, y]) => R(x, y, 2, 1, s.hairH)); }
  }
  // brows + eyes
  const browC = s.style === "hijab" ? "#3a2a22" : s.hairS;
  const by = mood === 1 ? 13 : 12;
  R(13, by, 4, 1, browC); R(23, by, 4, 1, browC);
  if (mood === 1) { R(16, by - 1, 1, 1, browC); R(23, by - 1, 1, 1, browC); }
  if (blink) { R(13, 17, 4, 1, SUIT.eye); R(23, 17, 4, 1, SUIT.eye); }
  else { R(14, 15, 2, 3, SUIT.eye); R(24, 15, 2, 3, SUIT.eye); R(14, 15, 1, 1, "#ffffff"); R(24, 15, 1, 1, "#ffffff"); }
  R(12, 20, 2, 1, s.blush); R(26, 20, 2, 1, s.blush);
  R(19, 19, 2, 1, s.skinS); R(20, 18, 1, 1, s.skinS);
  if (s.glasses) { g.fillStyle = "#11131c"; [[11, 13, 8, 1], [11, 19, 8, 1], [11, 13, 1, 7], [18, 13, 1, 7], [21, 13, 8, 1], [21, 19, 8, 1], [21, 13, 1, 7], [28, 13, 1, 7], [19, 15, 2, 1], [9, 15, 2, 1], [29, 15, 2, 1]].forEach(([x, y, w, h]) => g.fillRect(x + 1, y + 1, w, h)); g.fillStyle = "rgba(160,220,255,0.25)"; g.fillRect(13, 15, 6, 5); g.fillRect(23, 15, 6, 5); }
  // mouth
  const mouth = () => { if (talk) { R(17, 23, 6, 2, SUIT.mouthO); R(18, 25, 4, 1, SUIT.mouthO); R(18, 23, 4, 1, "#f4f4f4"); } else if (mood === 1) { R(17, 24, 6, 1, SUIT.mouth); } else { R(17, 23, 6, 1, SUIT.mouth); R(16, 22, 1, 1, SUIT.mouth); R(23, 22, 1, 1, SUIT.mouth); } };
  if (s.beard) { R(10, 20, 20, 7, s.hair); R(12, 27, 16, 1, s.hair); R(9, 15, 2, 6, s.hair); R(29, 15, 2, 6, s.hair); [[12, 22], [27, 21], [26, 25]].forEach(([x, y]) => R(x, y, 1, 1, s.hairH)); R(16, 22, 8, 3, s.skin); mouth(); }
  else if (s.mustache) { R(14, 21, 12, 2, s.hair); R(13, 22, 1, 2, s.hair); R(26, 22, 1, 2, s.hair); mouth(); }
  else mouth();
  return outlineCanvas(cv);
}
const Portraits = {};
function buildPortraits() {
  for (const id in CHAR_SPECS) {
    Portraits[id] = [];
    for (const mood of [0, 1]) for (const blink of [false, true]) for (const talk of [false, true]) Portraits[id].push(drawPortrait(CHAR_SPECS[id], blink, talk, mood));
  }
}
function getPortrait(id, blink, talk, mood = 0) { return Portraits[id][mood * 4 + (blink ? 2 : 0) + (talk ? 1 : 0)]; }
