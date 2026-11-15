// =====================================================================
//  CHARACTERS v2 — bigger (22x32), more detailed pixel art with an
//  8-frame walk cycle, breathing, blinking, idle head turns and a
//  per-character idle gesture. Toggle in Settings (New / Classic).
// =====================================================================
const CHAR_STYLE_KEY = "sol200_charstyle";
let CHAR_STYLE = (() => { try { const v = localStorage.getItem(CHAR_STYLE_KEY); return v === "v1" || v === "v2" || v === "team" ? (v === "v2" && !localStorage.getItem("sol200_teamseen") ? "team" : v) : "team"; } catch (e) { return "team"; } })();
function setCharStyle(v) { CHAR_STYLE = v; try { localStorage.setItem(CHAR_STYLE_KEY, v); localStorage.setItem("sol200_teamseen", "1"); } catch (e) {} }

const V2 = {
  suit: "#f2f4f8", suitS: "#d3d9e4", suitD: "#aab3c4", suitL: "#ffffff",
  grey: "#8b93a6", greyD: "#5f6678", boot: "#4d5468", bootD: "#33384a", sole: "#22252f",
  glove: "#c9ced9", gloveD: "#9ea5b5", gold: "#ffd34a", goldD: "#c9961e",
  eye: "#241c2c", white: "#ffffff",
};
const IRIS = { lead: "#2f5f9e", marcus: "#3b2416", diego: "#4a2c18", layla: "#6b3e1e" };

// colored outline: transparent pixels next to the sprite take a darkened neighbor color
function outlineColored(cv) {
  const g = cv.getContext("2d"), w = cv.width, h = cv.height;
  const id = g.getImageData(0, 0, w, h), d = id.data, out = new Uint8ClampedArray(d);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (d[i + 3] > 0) continue;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const j = (Y * w + X) * 4; if (d[j + 3] < 200) continue;
      out[i] = d[j] * 0.28 + 14; out[i + 1] = d[j + 1] * 0.26 + 10; out[i + 2] = d[j + 2] * 0.3 + 22; out[i + 3] = 255; break;
    }
  }
  g.putImageData(new ImageData(out, w, h), 0, 0);
  return cv;
}

// pose: { dir 0 down / 1 up / 2 left, f walk frame 0..7 or -1, breath 0/1, blink, look (-1/0/1 head turn when facing down), gest 0/1/2, helmet }
function drawCharV2(id, pose) {
  const s = CHAR_SPECS[id], cv = mkCanvas(24, 34), g = cv.getContext("2d");
  const R = (x, y, w, h, c) => { if (w <= 0 || h <= 0) return; g.fillStyle = c; g.fillRect(x + 1, y + 1, w, h); };
  const { dir, f, breath, blink, look = 0, gest = 0 } = pose;
  const walking = f >= 0, ph = walking ? (f / 8) * Math.PI * 2 : 0;
  const bob = walking ? (f % 4 === 1 || f % 4 === 2 ? -1 : 0) : -(breath || 0);
  const side = dir === 2;
  // ------------------------------------------------ legs + boots
  const leg = (x, lift, shade, fwd = 0) => {
    const top = 24, len = 5 - lift;
    R(x + fwd, top, 4, len, shade ? V2.suitS : V2.suit); R(x + fwd + 3, top, 1, len, shade ? V2.suitD : V2.suitS);
    R(x + fwd, top + len - 1, 4, 1, shade ? V2.suitD : V2.suitS); // knee crease
    const by = top + len;
    R(x + fwd, by, 4, 2, shade ? V2.bootD : V2.boot); R(x + fwd, by + 2, 4, 1, V2.sole); R(x + fwd, by, 2, 1, shade ? V2.boot : "#6a7286");
    if (side) R(x + fwd - 1, by + 1, 1, 2, shade ? V2.bootD : V2.boot); // toe
  };
  if (!side) {
    const lL = walking ? Math.max(0, Math.round(Math.sin(ph) * 2)) : 0, lR = walking ? Math.max(0, Math.round(-Math.sin(ph) * 2)) : 0;
    leg(6, lL, dir === 1 ? 0 : 0); leg(12, lR, 1);
  } else {
    const st = walking ? Math.round(Math.sin(ph) * 3) : 0;
    const liftB = walking && Math.cos(ph) > 0.5 ? 1 : 0, liftF = walking && Math.cos(ph) < -0.5 ? 1 : 0;
    leg(9, liftB, 1, -st); leg(8, liftF, 0, st);
  }
  // ------------------------------------------------ torso
  const T = (x, y, w, h, c) => R(x, y + bob, w, h, c);
  const swing = walking ? Math.sin(ph) : 0;
  const armBack = () => { // far arm for side view
    const dx = Math.round(-swing * 2); T(10 + dx, 15, 3, 6, V2.suitS); T(10 + dx, 21, 3, 1, s.stripeS); T(10 + dx, 22, 3, 2, V2.gloveD);
  };
  if (side) armBack();
  const bx = side ? 7 : 5, bw = side ? 9 : 13;
  T(bx + 1, 14, bw - 2, 1, V2.suit); T(bx, 15, bw, 8, V2.suit);
  T(bx, 15, 1, 7, V2.suitL); T(bx + bw - 3, 15, 3, 8, V2.suitS); T(bx + bw - 1, 16, 1, 7, V2.suitD);
  T(bx, 19, bw, 2, s.stripe); T(bx, 20, bw, 1, s.stripeS); T(bx + bw - 3, 19, 3, 2, s.stripeS);
  // belt
  T(bx, 23, bw, 1, s.wrench ? "#7a5232" : V2.greyD);
  if (!side && dir === 0) T(10, 23, 2, 1, s.wrench ? "#c9a46a" : V2.gold);
  // collar
  if (dir !== 1) { T(side ? 8 : 8, 13, side ? 6 : 6, 2, V2.grey); T(side ? 8 : 8, 13, side ? 6 : 6, 1, "#b8c0d0"); }
  else T(7, 13, 8, 2, V2.grey);
  if (dir === 0) { T(10, 15, 1, 8, V2.suitS); T(11, 15, 1, 4, V2.suitL); } // zipper
  if (dir === 1) { T(7, 16, 8, 3, V2.suitS); T(7, 16, 8, 1, V2.suitL); } // back panel
  // badge / patch
  if (dir === 0) {
    if (s.badge) { T(6, 15, 3, 1, V2.gold); T(7, 14, 1, 3, V2.gold); T(7, 15, 1, 1, "#fff6c0"); }
    else T(6, 16, 2, 2, s.stripe);
    if (s.magnifier) { T(10, 14, 1, 4, "#7a6a3a"); T(9, 17, 3, 3, "#d9b24a"); T(10, 18, 1, 1, "#bfe8ff"); }
  }
  if (side && s.badge) { T(9, 15, 2, 2, V2.gold); }
  if (s.wrench && dir !== 1) { const wx = side ? 13 : 14; T(wx, 23, 1, 4, "#9aa3b5"); T(wx - 1, 26, 3, 1, "#9aa3b5"); T(wx, 22, 1, 1, "#e07a2a"); }
  // ------------------------------------------------ arms (front/back)
  const hand = (x, y) => { T(x, y, 3, 2, V2.glove); T(x, y + 1, 3, 1, V2.gloveD); };
  if (!side) {
    const ls = Math.round(swing * 1.5), rs = -ls;
    // Marcus always holds his tablet in front when facing down
    if (s.tablet && dir === 0) {
      T(3, 15, 3, 5, V2.suit); T(16, 15, 3, 5, V2.suitS);
      T(5, 19, 3, 2, V2.suit); T(14, 19, 3, 2, V2.suitS);
      T(7, 17, 8, 6, "#26304a"); T(8, 18, 6, 4, gest ? "#8fe0ff" : "#4fa8f0"); T(8, 18, 6, 1, "#d8f2ff");
      hand(6, 20); hand(13, 20);
    } else if (gest === 1 && dir === 0 && s.badge) { // Damon: hands on hips
      T(2, 15, 3, 4, V2.suit); T(2, 19, 2, 2, V2.suit); hand(3, 21);
      T(17, 15, 3, 4, V2.suitS); T(18, 19, 2, 2, V2.suitS); hand(16, 21);
    } else if (gest === 1 && dir === 0 && s.magnifier) { // Layla raises the magnifier
      T(3, 15 + ls, 3, 6, V2.suit); hand(3, 21 + ls);
      T(16, 13, 3, 5, V2.suitS); hand(15, 11); T(14, 8, 4, 4, "#d9b24a"); T(15, 9, 2, 2, "#bfe8ff");
    } else if (gest && dir === 0 && s.wrench) { // Diego spins his wrench
      T(3, 15 + ls, 3, 6, V2.suit); hand(3, 21 + ls);
      T(16, 15, 3, 4, V2.suitS); hand(16, 19);
      if (gest === 1) { T(17, 14, 1, 5, "#c8d0dc"); T(16, 13, 3, 1, "#c8d0dc"); T(17, 19, 1, 2, "#e07a2a"); }
      else { T(14, 19, 6, 1, "#c8d0dc"); T(19, 18, 1, 3, "#c8d0dc"); T(13, 19, 1, 1, "#e07a2a"); }
    } else {
      T(3, 15 + ls, 3, 6, dir === 1 ? V2.suitS : V2.suit); T(3, 15 + ls, 1, 6, V2.suitL); T(3, 20 + ls, 3, 1, s.stripe); hand(3, 21 + ls);
      T(16, 15 + rs, 3, 6, V2.suitS); T(18, 15 + rs, 1, 6, V2.suitD); T(16, 20 + rs, 3, 1, s.stripeS); hand(16, 21 + rs);
    }
  }
  // ------------------------------------------------ head
  const hb = bob + (walking && (f === 2 || f === 6) ? -1 : 0) * 0;
  const H = (x, y, w, h, c) => R(x, y + hb, w, h, c);
  H(9, 12, 4, 2, s.skinS); // neck
  if (s.style === "hijab") {
    if (!side) {
      H(5, 1, 12, 13, s.hair); H(4, 3, 14, 10, s.hair); H(6, 0, 10, 1, s.hair); H(4, 12, 14, 3, s.hairS); H(5, 14, 12, 2, s.hair);
      H(14, 2, 3, 11, s.hairS); H(6, 1, 4, 1, s.hairH); H(5, 3, 1, 5, s.hairH);
      if (dir === 0) {
        const lx = look;
        H(7 + lx, 4, 8, 8, s.skin); H(8 + lx, 12, 6, 1, s.skin); H(13 + lx, 5, 2, 7, s.skinS); H(7 + lx, 4, 8, 1, s.hairS);
      } else { H(6, 13, 10, 2, s.hairS); H(9, 4, 4, 6, s.hairS); }
    } else {
      H(6, 0, 10, 1, s.hair); H(5, 1, 12, 13, s.hair); H(12, 2, 5, 12, s.hairS); H(6, 13, 11, 3, s.hairS);
      H(5, 4, 6, 8, s.skin); H(4, 8, 1, 2, s.skin); H(5, 4, 6, 1, s.hairS); H(7, 1, 3, 1, s.hairH);
    }
  } else {
    // head shape
    if (!side) {
      H(7, 1, 8, 1, s.skin); H(6, 2, 10, 1, s.skin); H(5, 3, 12, 8, s.skin); H(6, 11, 10, 1, s.skin); H(7, 12, 8, 1, s.skin);
      H(14, 3, 3, 8, s.skinS); H(13, 11, 3, 1, s.skinS);
      H(4, 6, 1, 3, s.skin); H(17, 6, 1, 3, s.skinS); H(4, 7, 1, 1, s.skinS);
    } else {
      H(7, 1, 7, 1, s.skin); H(6, 2, 9, 1, s.skin); H(5, 3, 10, 8, s.skin); H(6, 11, 8, 1, s.skin); H(7, 12, 6, 1, s.skin);
      H(4, 7, 1, 2, s.skin); H(11, 6, 2, 3, s.skinS); H(12, 7, 1, 1, s.skin);
    }
    if (dir === 1) { H(5, 2, 12, 10, s.hair); H(6, 11, 10, 1, s.hairS); H(14, 3, 3, 8, s.hairS); }
    const hairStyles = {
      short() {
        if (!side) { H(6, 0, 10, 1, s.hair); H(5, 1, 12, 3, s.hair); H(4, 3, 2, 4, s.hair); H(16, 3, 2, 4, s.hairS); H(14, 1, 3, 3, s.hairS); H(7, 0, 4, 1, s.hairH); H(6, 1, 5, 1, s.hairH);
          if (dir === 0) { H(6 + look, 4, 6, 1, s.hair); H(6 + look, 5, 2, 1, s.hair); H(13 + look, 4, 1, 1, s.hair); } }
        else { H(6, 0, 8, 1, s.hair); H(5, 1, 10, 3, s.hair); H(11, 3, 4, 5, s.hair); H(13, 2, 2, 6, s.hairS); H(5, 4, 3, 1, s.hair); H(7, 0, 4, 1, s.hairH); }
      },
      buzz() {
        if (!side) { H(6, 1, 10, 2, s.hair); H(5, 2, 12, 2, s.hair); H(5, 4, 1, 3, s.hair); H(16, 4, 1, 3, s.hair); }
        else { H(6, 1, 8, 2, s.hair); H(5, 2, 10, 2, s.hair); H(12, 4, 3, 4, s.hair); H(9, 1, 1, 1, s.hairH); }
      },
      curly() {
        if (!side) { H(5, 0, 12, 4, s.hair); H(3, 2, 16, 3, s.hair); [4, 7, 10, 13, 16].forEach((x) => H(x, -1, 2, 1, s.hair)); H(3, 5, 3, 4, s.hair); H(16, 5, 3, 4, s.hairS); [6, 10, 14].forEach((x) => H(x, 1, 1, 1, s.hairH)); [4, 17].forEach((x) => H(x, 6, 1, 1, s.hairH));
          if (dir === 0) { H(7 + look, 4, 3, 1, s.hair); H(12 + look, 4, 2, 1, s.hair); } }
        else { H(5, 0, 10, 4, s.hair); [5, 8, 11, 14].forEach((x) => H(x, -1, 2, 1, s.hair)); H(10, 3, 6, 6, s.hair); H(14, 4, 2, 6, s.hairS); H(5, 4, 3, 1, s.hair); [7, 12].forEach((x) => H(x, 1, 1, 1, s.hairH)); }
      },
    };
    hairStyles[s.style] && hairStyles[s.style]();
  }
    // face
  const iris = IRIS[id] || V2.eye;
  if (dir === 0) {
    const lx = look, ex = [7 + lx, 13 + lx];
    for (const x of ex) {
      if (blink) { H(x, 8, 2, 1, V2.eye); }
      else { H(x, 6, 2, 3, V2.eye); H(x, 8, 2, 1, iris); H(x, 6, 1, 1, V2.white); }
    }
    // brows
    H(ex[0] - 1, 5, 3, 1, s.hairS === "#1a1412" ? "#1a1210" : s.style === "hijab" ? "#3a2a22" : s.hairS);
    H(ex[1], 5, 3, 1, s.style === "hijab" ? "#3a2a22" : s.hairS);
    H(11 + lx, 9, 1, 1, s.skinS); // nose
    H(6 + lx, 9, 2, 1, s.blush); H(14 + lx, 9, 2, 1, s.blush);
    if (s.glasses) { const gc = "#0e1018"; for (const x of ex) { H(x - 1, 5, 4, 1, gc); H(x - 1, 9, 4, 1, gc); H(x - 1, 5, 1, 5, gc); H(x + 2, 5, 1, 5, gc); if (!blink) { H(x, 6, 2, 3, "#e8eef6"); H(x + (look < 0 ? 0 : 1), 7, 1, 2, V2.eye); H(x, 6, 1, 1, "#ffffff"); } } H(ex[0] + 3, 6, ex[1] - ex[0] - 3, 1, gc); }
    if (s.beard) { H(5, 9, 2, 3, s.hair); H(15, 9, 2, 3, s.hair); H(6, 11, 10, 2, s.hair); H(7, 13, 8, 1, s.hair); H(9 + lx, 10, 4, 1, s.hair); H(10 + lx, 11, 2, 1, "#9c4e46"); [7, 11, 14].forEach((x) => H(x, 12, 1, 1, s.hairH)); H(5, 9, 1, 1, s.hairH); H(16, 9, 1, 1, s.hairH); }
    else if (s.mustache) { H(8 + lx, 10, 6, 1, s.hair); H(10 + lx, 11, 2, 1, "#9c4e46"); }
    else { H(10 + lx, 11, 2, 1, "#9c4e46"); H(9 + lx, 10, 1, 1, s.skinS); }
  } else if (side) {
    if (blink) H(6, 8, 2, 1, V2.eye); else { H(6, 6, 2, 3, V2.eye); H(6, 8, 2, 1, iris); H(6, 6, 1, 1, V2.white); }
    H(6, 5, 3, 1, s.style === "hijab" ? "#3a2a22" : s.hairS);
    H(4, 8, 1, 2, s.skin); H(4, 10, 1, 1, s.skinS); // nose
    H(7, 9, 2, 1, s.blush);
    if (s.glasses) { const gc = "#0e1018"; H(5, 5, 4, 1, gc); H(5, 9, 4, 1, gc); H(5, 5, 1, 5, gc); H(8, 5, 1, 5, gc); H(9, 6, 3, 1, gc); }
    if (s.beard) { H(5, 10, 7, 3, s.hair); H(10, 7, 2, 4, s.hair); H(6, 13, 5, 1, s.hair); H(5, 11, 2, 1, "#9c4e46"); H(7, 12, 1, 1, s.hairH); }
    else if (s.mustache) { H(4, 10, 4, 1, s.hair); H(5, 11, 2, 1, "#9c4e46"); }
    else H(5, 11, 2, 1, "#9c4e46");
  }
  // ------------------------------------------------ side front arm (on top)
  if (side) {
    const dx = Math.round(swing * 2);
    if (s.tablet) { T(8, 15, 3, 4, V2.suit); T(6, 18, 3, 2, V2.suit); T(3, 16, 4, 6, "#26304a"); T(4, 17, 2, 4, gest ? "#8fe0ff" : "#4fa8f0"); hand(5, 19); }
    else { T(9 + dx, 15, 3, 6, V2.suit); T(9 + dx, 15, 1, 6, V2.suitL); T(9 + dx, 20, 3, 1, s.stripe); hand(9 + dx, 21); }
  }
  // ------------------------------------------------ helmet (outside)
  if (pose.helmet) {
    g.fillStyle = "rgba(170,220,255,0.26)"; g.beginPath(); g.ellipse(12, 8 + hb, 10, 9.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#e6eef8"; g.lineWidth = 1; g.beginPath(); g.ellipse(12, 8.5 + hb, 9.5, 9, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.75)"; g.fillRect(5, 3 + hb, 3, 1); g.fillRect(4, 4 + hb, 1, 3);
    g.fillStyle = V2.grey; g.fillRect(4, 16 + hb, 16, 1);
  }
  return outlineColored(cv);
}

const CharSprites2 = {};
function buildCharSprites2() {
  for (const id in CHAR_SPECS) for (const helmet of [false, true]) {
    const set = { walk: [], idle: [], look: [], gest: [] };
    for (let dir = 0; dir < 4; dir++) {
      const d = dir === 3 ? 2 : dir;
      const mk = (pose) => { let c = drawCharV2(id, { ...pose, dir: d, helmet }); if (dir === 3) { const m = mkCanvas(c.width, c.height), mg = m.getContext("2d"); mg.translate(c.width, 0); mg.scale(-1, 1); mg.drawImage(c, 0, 0); c = m; } return c; };
      set.walk[dir] = []; for (let f = 0; f < 8; f++) set.walk[dir].push([mk({ f, blink: false }), mk({ f, blink: true })]);
      set.idle[dir] = []; for (let b = 0; b < 2; b++) set.idle[dir].push([mk({ f: -1, breath: b, blink: false }), mk({ f: -1, breath: b, blink: true })]);
      if (dir === 0) { set.look = [-1, 1].map((l) => mk({ f: -1, breath: 0, blink: false, look: l })); set.gest = [1, 2].map((gs) => mk({ f: -1, breath: 0, blink: false, gest: gs })); }
    }
    CharSprites2[id + (helmet ? "_h" : "")] = set;
  }
}

// draw with the v2 set: walk frame follows distance walked (no foot sliding), idle breathes,
// NPCs glance around and do their own gesture now and then
function drawCharacterV2(g, c, t) {
  const set = CharSprites2[c.sprite + (c.helmet ? "_h" : "")]; if (!set) return;
  const blink = (t + c.blinkOff) % 3.7 < 0.13;
  let img;
  if (c.moving) {
    const f = Math.floor((c.walkDist || 0) / 4) % 8;
    img = set.walk[c.dir][f][blink ? 1 : 0];
  } else {
    const breath = Math.sin(t * 2.2 + c.blinkOff) > 0.35 ? 1 : 0;
    img = set.idle[c.dir][breath][blink ? 1 : 0];
    if (c.dir === 0 && c !== Game.player && !c.follow) {
      const cyc = (t + c.blinkOff * 3) % 9;
      if (cyc > 3 && cyc < 4.2) img = set.look[0];
      else if (cyc > 4.2 && cyc < 5.2) img = set.look[1];
      else if (cyc > 6.5 && cyc < 8.3) img = set.gest[c.sprite === "diego" ? (((t * 6) | 0) % 2) : 0];
    } else if (c.dir === 0 && c === Game.player && (c.idleT || 0) > 5) img = set.gest[0]; // hands on hips after standing still
  }
  // soft shadow
  g.fillStyle = "rgba(0,0,0,0.3)"; g.beginPath(); g.ellipse(Math.round(c.x), Math.round(c.y) - 1, 7, 2.8, 0, 0, 7); g.fill();
  g.drawImage(img, Math.round(c.x - 12), Math.round(c.y - 33));
  if (c.hurt) { const x = Math.round(c.x) + 5, y = Math.round(c.y) - 13; g.fillStyle = "#fff"; g.fillRect(x, y, 3, 3); g.fillStyle = "#e04040"; g.fillRect(x + 1, y, 1, 3); g.fillRect(x, y + 1, 3, 1); }
}
