// =====================================================================
//  DETAILED PROPS (v2) — bigger, readable machines so a child can tell
//  what each one does. Each has a small icon sign on the wall above it.
//  Types not listed here fall back to the original drawings.
// =====================================================================
function signPlate(g, x, y, icon, col = "#2b3550", t = 0) {
  // small wall sign with a pixel icon (drawn above a device)
  const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); };
  R(-7, -6, 14, 11, "#1b1d2b"); R(-6, -5, 12, 9, col); R(-6, -5, 12, 1, "rgba(255,255,255,0.25)");
  const I = (pts, c) => { g.fillStyle = c; for (const [a, b, w = 1, h = 1] of pts) g.fillRect(Math.round(x + a), Math.round(y + b), w, h); };
  switch (icon) {
    case "sun": I([[-2, -3, 4, 5], [-3, -2, 6, 3]], "#ffb43a"); I([[-5, -1], [4, -1], [-1, -5], [-1, 3]], "#ffe08a"); break;
    case "cloud": I([[-4, -1, 8, 3], [-2, -3, 4, 2]], "#e8d0b8"); I([[-3, 3], [0, 3], [3, 3]], "#c86a3a"); break;
    case "dish": I([[-4, -3, 1, 4], [-3, 0, 4, 1], [-3, -2, 3, 1], [0, -1, 1, 1]], "#d8e0f0"); I([[2, -3], [3, -2], [4, -3]], "#5fd0ff"); I([[-1, 1, 1, 3], [-3, 3, 5, 1]], "#8b93a6"); break;
    case "bolt": I([[0, -4, 2, 2], [-1, -2, 2, 2], [-2, 0, 4, 1], [0, 1, 2, 2], [-1, 3, 1, 1]], "#ffe040"); break;
    case "o2": I([[-5, -3, 3, 1], [-5, 1, 3, 1], [-5, -2, 1, 3], [-3, -2, 1, 3], [-1, -3, 3, 1], [1, -2, 1, 1], [0, -1, 1, 1], [-1, 0, 1, 1], [-1, 1, 3, 1]], "#7dffb0"); I([[3, -3], [4, -1], [3, 1]], "#bfe8ff"); break;
    case "drop": I([[-1, -4, 2, 2], [-2, -2, 4, 2], [-3, 0, 6, 2], [-2, 2, 4, 1]], "#5fb7ff"); I([[-1, -1]], "#ffffff"); break;
    case "leaf": I([[0, -4, 2, 1], [-1, -3, 3, 2], [-2, -1, 3, 2], [-2, 1, 1, 3]], "#5dd06a"); I([[1, -2, 1, 1]], "#b8ffb0"); break;
    case "flask": I([[-1, -4, 2, 2], [-2, -2, 4, 1], [-3, -1, 6, 3], [-2, 2, 4, 1]], "#d8e0f0"); I([[-2, 0, 4, 2]], "#c86a3a"); break;
    case "suit": I([[-2, -4, 4, 3], [-3, -1, 6, 4], [-3, 3, 2, 1], [1, 3, 2, 1]], "#f0f0f6"); I([[-1, -3, 2, 1]], "#3a6a9a"); break;
    case "tools": I([[-4, -3, 1, 6], [-5, -4, 3, 1]], "#c8d0dc"); I([[1, -4, 2, 3], [2, -1, 1, 4]], "#f08a2a"); break;
  }
}

function drawPropV2(g, p, t) {
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(p.x + x), Math.round(p.y + y), w, h); };
  const W = p.pw, H = p.ph;
  switch (p.type) {
    // ---------------------------------------------------------- CONTROL ROOM CONSOLES
    case "console": {
      const icon = { sun: "sun", radar: "cloud", comms: "dish" }[p.screen];
      signPlate(g, p.x + W / 2, p.y - 34, icon, p.screen === "sun" ? "#4a2a1a" : p.screen === "radar" ? "#1a3a2a" : "#1a2a4a");
      // monitor on a stand
      R(2, -26, W - 4, 20, "#151927"); R(3, -25, W - 6, 18, "#22283c"); R(W / 2 - 2, -6, 4, 4, "#3a4056");
      const sx = p.x + 5, sy = p.y - 23, sw = W - 10, sh = 14;
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      if (p.screen === "sun") {
        g.fillStyle = "#1a0e26"; g.fillRect(sx, sy, sw, sh);
        const pulse = Math.sin(t * 3) * 0.6;
        g.fillStyle = "#ff8a20"; g.beginPath(); g.arc(sx + 10, sy + 7, 5 + pulse, 0, 7); g.fill();
        g.fillStyle = "#ffd060"; g.beginPath(); g.arc(sx + 10, sy + 7, 3, 0, 7); g.fill();
        const lv = SpaceWeather.status === "loading" || SpaceWeather.status === "idle" ? 1 : { quiet: 1, M: 2, X: 3 }[SpaceWeather.risk()];
        for (let i = 0; i < 3; i++) { g.fillStyle = i < lv ? ["#5dff8a", "#ffb020", "#ff4a4a"][i] : "#2a2440"; g.fillRect(sx + sw - 14 + i * 4, sy + 10 - i * 3, 3, 3 + i * 3); }
        if (SpaceWeather.status === "live") { g.fillStyle = (t * 2 | 0) % 2 ? "#5dff8a" : "#1a5a2a"; g.fillRect(sx + sw - 3, sy + 1, 2, 2); }
      } else if (p.screen === "radar") {
        g.fillStyle = "#0a2418"; g.fillRect(sx, sy, sw, sh);
        g.fillStyle = "#1a4a30"; g.fillRect(sx + 4, sy + 3, 14, 4); g.fillRect(sx + 24, sy + 6, 18, 5); g.fillRect(sx + 50, sy + 2, 12, 6);
        const storm = G.storm || 0, cx = sx + sw * (0.65 - storm * 0.25), cy = sy + 9;
        for (let i = 0; i < 26; i++) { const a = i * 0.5 + t * 1.6, r = 1 + i * (0.25 + storm * 0.25); g.fillStyle = i % 3 ? "#e0763a" : "#ffb070"; g.fillRect(Math.round(cx + Math.cos(a) * r * 1.6), Math.round(cy + Math.sin(a) * r * 0.7), 2, 1); }
        const sweep = (t * 2) % (Math.PI * 2); g.strokeStyle = "rgba(90,255,150,0.8)"; g.beginPath(); g.moveTo(sx + 10, sy + 7); g.lineTo(sx + 10 + Math.cos(sweep) * 10, sy + 7 + Math.sin(sweep) * 6); g.stroke();
        g.fillStyle = "rgba(90,255,150,0.15)"; for (let x = sx; x < sx + sw; x += 6) g.fillRect(x, sy, 1, sh);
      } else {
        g.fillStyle = "#081c2a"; g.fillRect(sx, sy, sw, sh);
        for (let i = 0; i < sw - 14; i += 2) { const h = 2 + Math.abs(Math.sin(t * 5 + i * 0.6)) * 8; g.fillStyle = "#4fd8ff"; g.fillRect(sx + 12 + i, sy + sh - h - 1, 1, h); }
        g.fillStyle = "#d8e0f0"; g.fillRect(sx + 2, sy + 4, 6, 1); g.fillRect(sx + 4, sy + 5, 1, 6); g.fillRect(sx + 2, sy + 10, 5, 1);
        if (((t * 1.5) | 0) % 3 === 0) { g.fillStyle = "#ffd34a"; g.fillRect(sx + 7, sy + 2, 2, 2); }
      }
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(sx, sy, sw, 2);
      g.restore();
      // desk with keyboard + buttons
      R(0, -2, W, H + 2, "#4a5270"); R(0, -2, W, 3, "#6a7494"); R(0, H - 3, W, 3, "#2c3248");
      R(4, 2, W - 22, 5, "#20263a"); for (let i = 5; i < W - 19; i += 3) R(i, 3, 2, 1, "#5a6488"); for (let i = 5; i < W - 19; i += 3) R(i, 5, 2, 1, "#4a5478");
      for (let i = 0; i < 3; i++) R(W - 15 + i * 4, 3, 3, 3, ["#ff5050", "#50ff90", "#ffd040"][(i + ((t * 2) | 0)) % 3]);
      R(W - 16, 9, 12, 2, "#2c3248");
      glow(p.x + W / 2, p.y - 16, 30, p.screen === "sun" ? "#ffa040" : p.screen === "radar" ? "#40ff90" : "#40c0ff", 0.3);
      break;
    }
    case "power": {
      signPlate(g, p.x + W / 2, p.y - 34, "bolt", "#4a3a10");
      R(0, -26, W, 26 + H, "#3a3f55"); R(1, -25, W - 2, 24 + H, "#4a5068"); R(W - 4, -25, 3, 24 + H, "#2e3346");
      // battery cells
      const lv = G.power ?? 1, cells = 4, on = Math.round(lv * cells);
      for (let i = 0; i < cells; i++) { const y = -21 + i * 6; R(4, y, 10, 4, "#1a1d2a"); R(14, y + 1, 1, 2, "#1a1d2a"); if (cells - 1 - i < on) R(5, y + 1, 8, 2, lv < 0.4 ? "#ff5a40" : lv < 0.7 ? "#ffd040" : "#5dff8a"); }
      // lever + gauge
      R(19, -22, 8, 8, "#1a1d2a"); g.strokeStyle = "#ff5a40"; g.beginPath(); const a = Math.PI * (1 - lv); g.moveTo(p.x + 23, p.y - 15); g.lineTo(p.x + 23 + Math.cos(a) * 3.5, p.y - 15 - Math.sin(a) * 3.5); g.stroke();
      R(20, -10, 6, 10, "#2a2e3e"); R(22, -14 + Math.round((1 - lv) * 6), 2, 6, "#c8d0dc"); R(21, -15 + Math.round((1 - lv) * 6), 4, 2, "#ff4040");
      for (let i = 0; i < W; i += 4) { R(i, H - 4, 2, 3, "#e8c040"); R(i + 2, H - 4, 2, 3, "#1b1b1b"); }
      glow(p.x + W / 2, p.y - 10, 20, lv < 0.4 ? "#ff5040" : "#50ff90", 0.28);
      break;
    }
    // ---------------------------------------------------------- WORKSHOP
    case "rosie": {
      const broken = G.rosieBroken;
      signPlate(g, p.x + W / 2, p.y - 40, "o2", "#1a3a2a");
      // pipes up into the wall
      R(6, -34, 4, 14, "#7a8aa0"); R(W - 10, -34, 4, 14, "#7a8aa0"); R(6, -34, 4, 1, "#aab8cc");
      // body
      R(0, -22, W, H + 22, "#5a6684"); R(2, -20, W - 4, H + 16, "#8a96b4"); R(W - 6, -20, 4, H + 16, "#6a7694"); R(0, H - 4, W, 4, "#353c56");
      // oxygen tank (cylinder) on the right
      R(W - 18, -18, 14, 28, "#d8e0ec"); R(W - 18, -18, 3, 28, "#ffffff"); R(W - 7, -18, 3, 28, "#a8b4c8"); R(W - 16, -10, 10, 6, "#2a6ad0"); g.fillStyle = "#fff"; g.font = "bold 5px monospace"; g.fillText("O2", p.x + W - 15, p.y - 5.5);
      const fill = broken ? 0.25 + Math.sin(t * 6) * 0.03 : 0.75 + Math.sin(t) * 0.05; R(W - 15, 8 - Math.round(fill * 14), 8, 1, "#9ad8ff");
      // intake fan
      const fx = p.x + 13, fy = p.y - 4;
      g.fillStyle = "#1e2338"; g.beginPath(); g.arc(fx, fy, 10, 0, 7); g.fill(); g.fillStyle = "#3a4260"; g.beginPath(); g.arc(fx, fy, 9, 0, 7); g.fill();
      const ang = broken ? 0.4 : t * 14; g.fillStyle = "#cfd8ec";
      for (let i = 0; i < 5; i++) { const aa = ang + (i * Math.PI * 2) / 5; g.beginPath(); g.moveTo(fx, fy); g.arc(fx, fy, 8, aa, aa + 0.6); g.fill(); }
      g.fillStyle = "#59627c"; g.fillRect(fx - 1, fy - 1, 3, 3);
      g.strokeStyle = "#1e2338"; for (let i = -8; i <= 8; i += 4) { g.beginPath(); g.moveTo(fx - 9, fy + i); g.lineTo(fx + 9, fy + i); g.stroke(); }
      // gauge + status lights
      R(25, -18, 10, 9, "#1a1d2a"); g.strokeStyle = broken ? "#ff4040" : "#5dff8a"; g.beginPath(); const ga = broken ? Math.PI * 0.9 : Math.PI * (0.3 + Math.sin(t * 2) * 0.05); g.moveTo(p.x + 30, p.y - 11); g.lineTo(p.x + 30 + Math.cos(ga) * 4, p.y - 11 - Math.sin(ga) * 4); g.stroke();
      R(25, -6, 3, 3, broken ? ((t * 4 | 0) % 2 ? "#ff3030" : "#601010") : "#40ff80"); R(30, -6, 3, 3, broken ? "#401010" : (t * 2 | 0) % 2 ? "#40ff80" : "#1a6a3a");
      // output tube with bubbles
      R(24, 2, 12, 4, "#2a5a9a"); if (!broken) for (let i = 0; i < 3; i++) R(25 + ((t * 12 + i * 4) % 10), 3, 1, 2, "#bfe8ff");
      if (broken) { if (Math.random() < 0.2) Particles.spark(p.x + 10 + Math.random() * 30, p.y - 8); if (Math.random() < 0.1) Particles.dust(p.x + 14, p.y - 14, 2, "#8a8a8a"); glow(p.x + W / 2, p.y - 4, 34, "#ff3020", 0.3 + Math.sin(t * 8) * 0.1); }
      else glow(p.x + W / 2, p.y - 4, 30, "#40ff90", 0.22);
      break;
    }
    case "bench": {
      signPlate(g, p.x + W / 2, p.y - 36, "tools", "#3a2a1a");
      // pegboard with tools
      R(2, -28, W - 4, 16, "#8a6a4a"); for (let x = 5; x < W - 4; x += 4) for (let y = -26; y < -13; y += 4) R(x, y, 1, 1, "#6a4a30");
      R(6, -25, 2, 10, "#c8d0dc"); R(5, -26, 4, 2, "#c8d0dc"); R(14, -24, 2, 8, "#f08a2a"); R(13, -25, 4, 2, "#9aa3b5"); R(22, -26, 8, 3, "#d04040"); R(25, -23, 2, 7, "#5a5a5a"); R(34, -24, 3, 8, "#ffd34a");
      // bench top + dust sample jar
      R(0, -8, W, 8 + H, "#6a4a30"); R(0, -8, W, 3, "#8a6644"); R(2, H - 2, 3, 2, "#3a2a1a"); R(W - 5, H - 2, 3, 2, "#3a2a1a");
      R(6, -15, 8, 9, "rgba(200,230,255,0.55)"); R(7, -11, 6, 5, "#c0592c"); R(6, -16, 8, 1, "#9aa3b5"); R(8, -10, 2, 1, "#e08a5a");
      R(20, -11, 12, 3, "#3a3f55"); R(21, -10, 10, 1, "#5fd0ff");
      break;
    }
    case "watertank": {
      signPlate(g, p.x + 8, p.y - 30, "drop", "#1a2a4a");
      R(0, -20, 16, H + 20, "#3a5a7a"); R(1, -19, 14, H + 18, "#4a6a8a");
      const lvl = 0.62 + Math.sin(t * 0.5) * 0.04, top = -16, hgt = H + 12;
      R(3, top, 10, hgt, "#1a2a3a"); R(3, top + Math.round(hgt * (1 - lvl)), 10, Math.round(hgt * lvl), "#3a9ae0"); R(3, top + Math.round(hgt * (1 - lvl)), 10, 1, "#9ad8ff");
      for (let i = 0; i < 2; i++) R(5 + i * 5, top + hgt - 2 - ((t * 14 + i * 9) % (hgt * lvl)), 1, 1, "#d8f2ff");
      R(4, top + 2, 2, hgt - 4, "rgba(255,255,255,0.25)"); R(-4, 4, 4, 3, "#7a8aa0"); R(-4, 4, 1, 12, "#7a8aa0");
      glow(p.x + 8, p.y + 2, 20, "#40a0ff", 0.2);
      break;
    }
    case "veggie": drawProp1(g, p, t); signPlate(g, p.x + W / 2, p.y - 24, "leaf", "#3a1a3a"); break;
    case "soil": drawProp1(g, p, t); signPlate(g, p.x + W / 2, p.y - 22, "flask", "#3a2a1a"); break;
    case "suits": {
      signPlate(g, p.x + W / 2, p.y - 32, "suit", "#3a3a2a");
      for (let i = 0; i < 2; i++) {
        const x = 2 + i * 15, col = i ? "#f08a2a" : "#e04848";
        R(x + 1, -14, 11, 16, "#e8ecf4"); R(x + 9, -14, 3, 16, "#c8d0dc"); R(x + 1, -7, 11, 2, col);
        R(x + 2, -22, 9, 8, "#dfe3ea"); R(x + 3, -21, 7, 5, "#b8862a"); R(x + 4, -20, 2, 1, "#fff4c0");
        R(x - 1, -13, 2, 9, "#e8ecf4"); R(x + 12, -13, 2, 9, "#c8d0dc");
      }
      R(0, H - 3, W, 3, "#3a3f55");
      break;
    }
    case "bunk": {
      R(0, -10, W, 10 + H, "#4a3a4a"); R(0, -10, W, 2, "#6a5a6a");
      R(2, -7, W - 4, H + 4, "#e8e8f2"); R(2, 1, W - 4, H - 4, p.color); R(2, 1, W - 4, 2, shade(p.color, 0.35)); R(2, H - 4, W - 4, 1, shade(p.color, -0.3));
      R(4, -6, 12, 6, "#ffffff"); R(5, -5, 10, 1, "#e0e0ec"); // pillow
      R(W - 9, 4, 5, 4, shade(p.color, -0.2)); // folded item
      break;
    }
    case "tray": {
      drawProp1(g, p, t);
      break;
    }
    default: drawProp1(g, p, t);
  }
}
function drawProp(g, p, t) { drawPropV2(g, p, t); }
