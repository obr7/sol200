// =====================================================================
//  MINI-GAMES v2 — hands-on, animated versions:
//   • Garden Check: inside the grow chamber, pick up a tool (water /
//     grow lamp / heater) and hold it over the plant that needs it.
//     Too much water drowns roots, too much heat burns leaves.
//   • Solar panels: 3 different jobs — brush the dust, flick off the
//     pebbles, tilt the panel to face the Sun.
// =====================================================================
const MW2 = 480, MH2 = 270;

// open a modal with a pixel canvas; returns helpers. fn(api) runs the game; api.finish(result) closes it.
function canvasGame({ title, sub, tag = "MINI-TASK", speaker = "layla", hint, wide = true }, setup) {
  return new Promise((resolve) => {
    const html = `<div class="head"><div><h3>${tag}</h3><h1>${title}</h1></div><div class="tmr mgtimer"></div></div>
      <p style="font-size:.8em;margin:.2em 0 .4em">${sub}</p>
      <div class="cgwrap"><canvas class="cg" width="${MW2}" height="${MH2}"></canvas></div><div class="say"></div>`;
    UI.card(html, [], {
      cls: "mg " + (wide ? "wide cgcard" : ""), noKey: true, onMount: (card, done) => {
        const cv = card.querySelector(".cg"), g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
        const sayBox = card.querySelector(".say"), tmr = card.querySelector(".mgtimer");
        const api = {
          cv, g, card, t: 0, ptr: { x: -99, y: -99, down: false, inside: false },
          say: (who, txt) => mgSay(sayBox, who, txt),
          timer: (txt) => { tmr.innerHTML = txt || ""; },
          finished: false,
          finish(res) { if (api.finished) return; api.finished = true; cancelAnimationFrame(api.raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); Minigames.cancelCurrent = null; setTimeout(() => { done("ok"); resolve(res); }, res && res.delay != null ? res.delay : 0); },
          keys: {},
        };
        if (hint) api.say(speaker, hint);
        const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * MW2, y: (e.clientY - r.top) / r.height * MH2 }; };
        cv.addEventListener("pointerdown", (e) => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} Object.assign(api.ptr, pos(e), { down: true, inside: true, touch: e.pointerType === "touch" }); api.onDown && api.onDown(api.ptr); });
        cv.addEventListener("pointermove", (e) => { Object.assign(api.ptr, pos(e), { inside: true }); api.onMove && api.onMove(api.ptr); });
        cv.addEventListener("pointerup", (e) => { api.ptr.down = false; api.onUp && api.onUp(api.ptr); });
        cv.addEventListener("pointercancel", () => { api.ptr.down = false; });
        cv.addEventListener("pointerleave", () => { if (!api.ptr.down) api.ptr.inside = false; });
        const kd = (e) => { api.keys[e.key] = true; if (api.onKey) api.onKey(e.key, true); }, ku = (e) => { api.keys[e.key] = false; };
        window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
        Minigames.cancelCurrent = (res) => api.finish(res || { cancelled: true });
        let last = performance.now();
        const loop = (now) => {
          if (api.finished) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now; api.t += dt;
          g.imageSmoothingEnabled = false;
          try { api.frame && api.frame(dt, api.t); } catch (er) { console.error(er); }
          api.raf = requestAnimationFrame(loop);
        };
        window.__mg = api; setup(api);
        api.raf = requestAnimationFrame(loop);
      },
    });
  });
}
const PX = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// =====================================================================
//  GARDEN CHECK
// =====================================================================
Minigames.garden = function () {
  Sound.setMood("task");
  const ZONE = [45, 75], NEED = { water: "💧", light: "💡", heat: "🌡️" };
  const probs = G.trays.slice(0, 3).map((t) => t.problem);
  const plants = probs.map((p, i) => {
    const st = { water: 52 + Math.random() * 12, light: 52 + Math.random() * 12, heat: 52 + Math.random() * 12 };
    st[p] = 12 + Math.random() * 8;
    return { i, x: 104 + i * 136, need: p, st, dmg: 0, fixed: false, leaves: 7, happy: 0, burn: 0, flood: 0, bleach: 0, warned: {} };
  });
  const tools = [
    { k: "water", name: "Water", x: 170 },
    { k: "light", name: "Grow lamp", x: 240 },
    { k: "heat", name: "Heater", x: 310 },
  ];
  const parts = new Pool(220);
  let sel = null, damage = 0, celebrating = 0, lastLine = 0;
  const lines = {
    fixed: { water: "The roots are drinking now. Water is precious here, so we reuse it again and again.", light: "Without light, the plant can't make its food. Now it can!", heat: "Warm again! Notice that all of this needs power." },
    warn: { water: "Careful — that's enough water!", light: "That's plenty of light!", heat: "Easy, it's getting hot!" },
    dmg: { water: "Oh no, too much water! The roots can't breathe and a leaf fell off.", light: "Too much light — the leaf got scorched!", heat: "Ouch! Too hot — that leaf burned!" },
  };
  return canvasGame({
    title: "Garden Check", sub: "Pick a tool, then <b>hold it over the plant</b> that needs it. Watch the meters — the green band is just right!",
    hint: "Look at the little signs above each plant. Which one needs what?",
  }, (api) => {
    api.state = { plants }; const { g } = api; api.cv.style.cursor = "pointer";
    const plantAt = (x, y) => plants.find((p) => Math.abs(x - p.x) < 52 && y > 40 && y < 210);
    api.onDown = (pt) => {
      const tl = tools.find((tl) => Math.abs(pt.x - tl.x) < 30 && pt.y > 212);
      if (tl) { sel = tl.k; Sound.play("click"); return; }
    };
    api.frame = (dt, t) => {
      // ------------------------------------------------ apply tool
      const pt = api.ptr, holding = sel && pt.inside && pt.down;
      const tgt = holding ? plantAt(pt.x, pt.y + 20) : null;
      if (tgt && !celebrating) {
        const p = tgt; p.st[sel] += 24 * dt;
        if (sel === "water" && Math.random() < 0.8) for (let k = 0; k < 2; k++) parts.spawn({ x: pt.x - 14 + Math.random() * 6, y: pt.y + 4, vx: -10 + Math.random() * 20, vy: 60 + Math.random() * 40, life: 0.6, s: 2, c: Math.random() < 0.5 ? "#7fd0ff" : "#c8ecff", g: 160 });
        if (sel === "heat" && Math.random() < 0.6) parts.spawn({ x: p.x - 20 + Math.random() * 40, y: 160 + Math.random() * 20, vx: 0, vy: -30 - Math.random() * 20, life: 0.8, s: 2, c: Math.random() < 0.5 ? "#ff9a40" : "#ffd070", g: -10 });
        if (((t * 8) | 0) % 2 === 0 && Math.random() < 0.15) Sound.play(sel === "water" ? "scrub" : sel === "heat" ? "zap" : "hover");
        const v = p.st[sel];
        if (v > ZONE[1] + 6 && !p.warned[sel]) { p.warned[sel] = 1; api.say("layla", lines.warn[sel]); Sound.play("error"); }
        if (v >= 96) { // over-application => damage
          p.st[sel] = ZONE[1] + 4; p.dmg++; damage++; p.leaves = Math.max(3, p.leaves - 1); p.warned[sel] = 0;
          if (sel === "heat") p.burn = 1.5; if (sel === "water") p.flood = 2; if (sel === "light") p.bleach = 1.5;
          api.say("layla", lines.dmg[sel]); Sound.play("fail"); for (let k = 0; k < 14; k++) parts.spawn({ x: p.x, y: 130, vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 60, life: 0.9, s: 2, c: sel === "heat" ? "#555" : sel === "water" ? "#7fd0ff" : "#fff6b0", g: 90 });
        }
      }
      // plant state — anything over the green band slowly drains / cools back down
      for (const p of plants) {
        for (const k of ["water", "light", "heat"]) if (p.st[k] > ZONE[1] && !(tgt === p && sel === k)) p.st[k] = Math.max(ZONE[1] - 2, p.st[k] - 7 * dt);
        const ok = ["water", "light", "heat"].every((k) => p.st[k] >= ZONE[0] && p.st[k] <= ZONE[1] + 8);
        if (ok && !p.fixed) { p.fixed = true; p.happy = 1.2; Sound.play("good"); for (let k = 0; k < 16; k++) parts.spawn({ x: p.x, y: 120, vx: (Math.random() - 0.5) * 90, vy: -50 - Math.random() * 50, life: 1, s: 2, c: ["#fff", "#5dff8a", "#ffd34a"][k % 3], g: 60 }); api.say("layla", lines.fixed[p.need]); G.trays[p.i].fixed = true; G.trays[p.i].lightOff = false; }
        if (!ok && p.fixed && p.st[p.need] < ZONE[0]) p.fixed = false;
        p.happy = Math.max(0, p.happy - dt); p.burn = Math.max(0, p.burn - dt); p.flood = Math.max(0, p.flood - dt); p.bleach = Math.max(0, p.bleach - dt);
      }
      parts.update(dt);
      if (!celebrating && plants.every((p) => p.fixed) && !pt.down) { celebrating = 2.2; Sound.play("success"); api.say("layla", damage ? `All three are healthy! (${damage} ${damage > 1 ? "leaves" : "leaf"} lost — gentle next time.)` : "All three are healthy — perfect care, Commander!"); }
      if (celebrating) { celebrating -= dt; if (celebrating <= 0) { Sound.setMood("calm"); api.finish({ damage }); } }

      // ------------------------------------------------ draw: inside the grow chamber
      const bg = g.createLinearGradient(0, 0, 0, MH2); bg.addColorStop(0, "#2a1640"); bg.addColorStop(1, "#140a22"); g.fillStyle = bg; g.fillRect(0, 0, MW2, MH2);
      // grow lights bar
      PX(g, 0, 0, MW2, 14, "#2a2f45"); for (let x = 12; x < MW2; x += 24) { PX(g, x, 10, 14, 3, x % 48 ? "#ff5aa0" : "#6a8aff"); }
      g.save(); g.globalCompositeOperation = "lighter"; for (const p of plants) { const lamp = p.st.light / 100; const gr = g.createLinearGradient(0, 14, 0, 180); gr.addColorStop(0, `rgba(200,110,255,${0.25 * lamp + 0.05})`); gr.addColorStop(1, "rgba(200,110,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(p.x - 30, 14); g.lineTo(p.x + 30, 14); g.lineTo(p.x + 58, 180); g.lineTo(p.x - 58, 180); g.fill(); } g.restore();
      // glass reflections + drops
      g.fillStyle = "rgba(255,255,255,0.05)"; g.beginPath(); g.moveTo(30, 14); g.lineTo(70, 14); g.lineTo(20, 210); g.lineTo(-20, 210); g.fill();
      for (let k = 0; k < 18; k++) { const x = (k * 53) % MW2, y = 24 + ((k * 37 + t * 6 * (k % 3 + 1)) % 150); PX(g, x, y, 1, 2, "rgba(190,230,255,0.35)"); }
      // trays + plants
      for (const p of plants) {
        const x = p.x, sway = Math.sin(t * 1.6 + p.i) * 1.2;
        const health = Math.min(1, Math.min(...["water", "light", "heat"].map((k) => Math.min(p.st[k], 100 - Math.max(0, p.st[k] - ZONE[1] - 10) * 2))) / ZONE[0]);
        const droop = (1 - health) * 10 + (p.flood ? 4 : 0);
        // tray with water
        PX(g, x - 50, 172, 100, 20, "#4a5470"); PX(g, x - 48, 174, 96, 6, `rgba(70,160,230,${0.4 + p.st.water / 160})`); PX(g, x - 48, 174, 96, 1, "#9ad8ff"); PX(g, x - 50, 190, 100, 2, "#2a3048");
        // roots in water
        for (let r = -2; r <= 2; r++) { g.strokeStyle = "rgba(240,230,200,0.5)"; g.beginPath(); g.moveTo(x + r * 4, 176); g.lineTo(x + r * 6 + Math.sin(t + r) * 2, 188); g.stroke(); }
        if (p.flood) { PX(g, x - 56, 186, 112, 4, `rgba(70,160,230,${p.flood / 2})`); }
        // stem
        const top = 92 + droop;
        g.strokeStyle = "#2f8a40"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 172); g.quadraticCurveTo(x + sway * 3, 140, x + sway * 6 + droop * 0.6, top); g.stroke();
        // leaves
        const leafCol = p.burn ? "#6a4a2a" : p.bleach ? "#d8e0a0" : health > 0.85 ? "#5ad06a" : health > 0.5 ? "#9ab84a" : "#b8a040";
        for (let k = 0; k < p.leaves; k++) {
          const side = k % 2 ? 1 : -1, ly = 160 - k * 10 + droop * (k / 7);
          const lx = x + sway * (k / 3) + side * (12 + (k % 3) * 3), len = 14 - k * 0.6, tilt = droop * 0.06 * side;
          g.fillStyle = leafCol; g.beginPath(); g.ellipse(lx, ly + droop * 0.4, len, 5, side * (0.5 + tilt) + (p.happy ? Math.sin(t * 20) * 0.1 : 0), 0, Math.PI * 2); g.fill();
          g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - side * len * 0.8, ly + droop * 0.4); g.lineTo(lx + side * len * 0.6, ly + droop * 0.4 - side * 2); g.stroke();
        }
        if (p.burn > 0 && Math.random() < 0.4) parts.spawn({ x: x + (Math.random() - 0.5) * 30, y: 110, vx: 0, vy: -20, life: 1, s: 3, c: "rgba(80,80,80,0.7)", g: -5 });
        // need sign
        const bob = Math.sin(t * 4 + p.i) * 2;
        PX(g, x - 11, 34 + bob, 22, 18, p.fixed ? "#1f6a3a" : "#fbedcd"); PX(g, x - 11, 34 + bob, 22, 1, "#fff");
        g.font = "13px sans-serif"; g.textAlign = "center"; g.fillText(p.fixed ? "✅" : NEED[p.need], x, 48 + bob); g.textAlign = "left";
        PX(g, x - 1, 52 + bob, 2, 3, p.fixed ? "#1f6a3a" : "#fbedcd");
        // gauges
        ["water", "light", "heat"].forEach((k, gi) => {
          const gx = x - 46, gy = 196 + gi * 6, w = 92, v = Math.min(100, p.st[k]);
          PX(g, gx, gy, w, 4, "#0b0d18"); PX(g, gx + w * ZONE[0] / 100, gy, w * (ZONE[1] - ZONE[0]) / 100, 4, "rgba(93,255,138,0.35)");
          const hot = v > ZONE[1] + 6; PX(g, gx, gy + 1, Math.round(w * v / 100), 2, hot ? ((t * 8 | 0) % 2 ? "#ff4a4a" : "#ffb020") : k === "water" ? "#5fb7ff" : k === "light" ? "#ffe060" : "#ff8a40");
          PX(g, gx - 8, gy, 6, 4, k === "water" ? "#5fb7ff" : k === "light" ? "#ffe060" : "#ff8a40");
        });
      }
      // beam / heat waves from the held tool
      if (tgt && sel === "light") { g.save(); g.globalCompositeOperation = "lighter"; const gr = g.createLinearGradient(pt.x, pt.y, tgt.x, 140); gr.addColorStop(0, "rgba(255,240,150,0.6)"); gr.addColorStop(1, "rgba(255,240,150,0.05)"); g.fillStyle = gr; g.beginPath(); g.moveTo(pt.x - 4, pt.y + 6); g.lineTo(pt.x + 4, pt.y + 6); g.lineTo(tgt.x + 36, 165); g.lineTo(tgt.x - 36, 165); g.fill(); g.restore(); }
      if (tgt && sel === "heat") { g.strokeStyle = "rgba(255,150,60,0.6)"; for (let k = 0; k < 3; k++) { g.beginPath(); for (let yy = 0; yy < 40; yy += 2) g.lineTo(pt.x - 8 + k * 8 + Math.sin(yy * 0.4 + t * 12) * 2, pt.y + 8 + yy); g.stroke(); } }
      parts.draw(g, t);
      // tool tray
      PX(g, 0, 212, MW2, 58, "#1b2038"); PX(g, 0, 212, MW2, 2, "#3a4170");
      for (const tl of tools) {
        const on = sel === tl.k; PX(g, tl.x - 28, 220, 56, 44, on ? "#3a4a80" : "#262c4a"); if (on) { g.strokeStyle = "#ffd34a"; g.lineWidth = 2; g.strokeRect(tl.x - 27, 221, 54, 42); }
        if (!on || !pt.inside || pt.y > 212) drawTool(g, tl.k, tl.x, 238, t, false);
        g.fillStyle = "#cfd8ff"; g.font = "8px monospace"; g.textAlign = "center"; g.fillText(tl.name, tl.x, 260); g.textAlign = "left";
      }
      PX(g, 20, 230, 110, 26, "rgba(0,0,0,0.25)"); g.fillStyle = "#cfd8ff"; g.font = "8px monospace"; g.fillText(sel ? "Hold on a plant" : "1. Pick a tool", 26, 241); g.fillText(sel ? "to use it" : "2. Hold it on a plant", 26, 251);
      PX(g, 360, 230, 104, 26, "rgba(0,0,0,0.25)"); g.fillStyle = damage ? "#ff9a8a" : "#9affb0"; g.fillText(`Leaves lost: ${damage}`, 368, 246);
      // held tool follows the pointer (the real cursor hides only while a tool is in hand)
      const toolOn = sel && pt.inside && pt.y < 212; api.cv.style.cursor = toolOn ? "none" : "pointer";
      if (toolOn) drawTool(g, sel, pt.x, pt.y, t, !!tgt);
    };
  });
};
function drawTool(g, k, x, y, t, active) {
  x = Math.round(x); y = Math.round(y);
  if (k === "water") { PX(g, x - 10, y - 6, 16, 12, "#5fa8e0"); PX(g, x - 10, y - 6, 16, 2, "#9ad8ff"); PX(g, x - 18, y - 4, 8, 3, "#5fa8e0"); PX(g, x - 20, y - 6, 3, 3, "#9ad8ff"); PX(g, x + 6, y - 8, 4, 10, "#3a78b0"); PX(g, x - 6, y - 9, 8, 2, "#3a78b0"); if (active) PX(g, x - 21, y - 2, 2, 2, "#c8ecff"); }
  else if (k === "light") { PX(g, x - 2, y - 14, 4, 8, "#8b93a6"); PX(g, x - 10, y - 6, 20, 8, "#d8dce6"); PX(g, x - 9, y + 2, 18, 3, active || ((t * 2) | 0) % 2 ? "#fff3a0" : "#c8b860"); }
  else { PX(g, x - 10, y - 8, 20, 16, "#5a5e6a"); for (let i = 0; i < 4; i++) PX(g, x - 8 + i * 5, y - 6, 2, 12, active ? "#ff8a30" : "#a05a30"); PX(g, x - 10, y + 8, 20, 2, "#3a3e4a"); }
}

// =====================================================================
//  SOLAR PANELS — 3 kinds of job
// =====================================================================
const PANEL_JOBS = ["brush", "pebbles", "tilt"]; // one job per pair of panels
Minigames.panelJob = function (k, getTime) { return Minigames["panel_" + PANEL_JOBS[k % 3]](k, getTime); };
const pairName = (k) => `Panels ${k * 2 + 1} + ${k * 2 + 2}`;
// two panels joined by a cable (gap in the middle)
const PGAP = [144, 156];
function drawPanelPair(g, x, y, w, h) {
  const half = (w - (PGAP[1] - PGAP[0])) / 2;
  drawPanelFace(g, x, y, half, h); drawPanelFace(g, x + w - half, y, half, h);
  PX(g, x + half + 2, y + h / 2 - 2, PGAP[1] - PGAP[0] - 4, 4, "#15161f"); PX(g, x + half + 3, y + h / 2 - 5, 6, 10, "#5a6070");
}
function panelBackdrop(g, t, storm) {
  const sky = g.createLinearGradient(0, 0, 0, MH2); sky.addColorStop(0, "#7a3a20"); sky.addColorStop(1, "#c86a3a"); g.fillStyle = sky; g.fillRect(0, 0, MW2, MH2);
  g.fillStyle = `rgba(230,150,90,${0.25 + storm * 0.3})`; for (let k = 0; k < 40; k++) { const x = ((k * 97 + t * (90 + k * 4)) % (MW2 + 40)) - 20, y = (k * 53) % MH2; g.fillRect(Math.round(x), y, 6 + (k % 4) * 3, 1); }
}
function drawPanelFace(g, x, y, w, h) {
  PX(g, x - 4, y - 4, w + 8, h + 8, "#1b1d2b"); PX(g, x - 3, y - 3, w + 6, h + 6, "#8b93a6");
  PX(g, x, y, w, h, "#1a2f6a");
  for (let cx = 0; cx < w; cx += 30) for (let cy = 0; cy < h; cy += 30) { PX(g, x + cx + 1, y + cy + 1, 28, 28, "#2a4aa0"); PX(g, x + cx + 2, y + cy + 2, 26, 1, "#4a7ad0"); PX(g, x + cx + 14, y + cy + 1, 1, 28, "#24408a"); }
}
// ---------------------------------------------------------- 1) brush the dust
Minigames.panel_brush = function (n, getTime) {
  return canvasGame({ title: `${pairName(n)}: Brush the dust`, tag: "SOLAR PANEL", speaker: "diego", sub: "Hold and <b>move the brush</b> over the panel to sweep the dust away. Dust blocks sunlight, so a dusty panel makes less power.", hint: "Sweep, sweep, sweep! Dust is soft like flour." }, (api) => {
    const { g } = api; const PXW = 300, PXH = 150, ox = 90, oy = 52;
    const dust = mkCanvas(PXW, PXH), dg = dust.getContext("2d");
    for (let i = 0; i < 3500; i++) { dg.fillStyle = ["#b8743e", "#c8854a", "#a8642e", "#d89a5e"][i % 4]; dg.fillRect((Math.random() * PXW) | 0, (Math.random() * PXH) | 0, 3 + ((Math.random() * 4) | 0), 2 + ((Math.random() * 3) | 0)); }
    dg.fillStyle = "rgba(184,116,62,0.9)"; dg.fillRect(0, 0, PXW, PXH);
    for (let i = 0; i < 900; i++) { dg.fillStyle = Math.random() < 0.5 ? "#d89a5e" : "#9a5a2e"; dg.fillRect((Math.random() * PXW) | 0, (Math.random() * PXH) | 0, 2, 1); }
    dg.clearRect(PGAP[0] - 3, 0, PGAP[1] - PGAP[0] + 6, PXH); // no dust over the cable gap
    const parts = new Pool(160); let lastP = null, pct = 0, checkT = 0, done = false;
    const measure = () => { const d = dg.getImageData(0, 0, PXW, PXH).data; let clear = 0, tot = 0; for (let y = 2; y < PXH; y += 6) for (let x = 2; x < PXW; x += 6) { if (x >= PGAP[0] - 3 && x < PGAP[1] + 3) continue; tot++; if (d[(y * PXW + x) * 4 + 3] < 60) clear++; } return clear / tot; };
    api.frame = (dt, t) => {
      const pt = api.ptr;
      if (pt.down && pt.inside && !done) {
        const p = { x: pt.x - ox, y: pt.y - oy };
        dg.globalCompositeOperation = "destination-out"; dg.lineCap = "round"; dg.lineWidth = 30; dg.strokeStyle = "#000";
        dg.beginPath(); dg.moveTo((lastP || p).x, (lastP || p).y); dg.lineTo(p.x, p.y); dg.stroke(); dg.globalCompositeOperation = "source-over";
        if (lastP && Math.hypot(p.x - lastP.x, p.y - lastP.y) > 3) { for (let k = 0; k < 3; k++) parts.spawn({ x: pt.x + (Math.random() - 0.5) * 24, y: pt.y + 6, vx: (Math.random() - 0.5) * 60, vy: 20 + Math.random() * 40, life: 0.6, s: 2, c: "#c8854a", g: 120 }); if (Math.random() < 0.25) Sound.play("scrub"); }
        lastP = p;
      } else lastP = null;
      checkT -= dt; if (checkT <= 0) { checkT = 0.15; pct = measure(); }
      if (!done && pct >= 0.9) { done = true; dg.clearRect(0, 0, PXW, PXH); Sound.play("success"); api.say("diego", "Shiny! Both panels can catch sunlight again."); api.finish({ ok: true, delay: 900 }); }
      parts.update(dt);
      panelBackdrop(g, t, G.storm || 0);
      drawPanelPair(g, ox, oy, PXW, PXH); g.drawImage(dust, ox, oy);
      if (done) { g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(160,200,255,${0.3 + Math.sin(t * 10) * 0.1})`; g.fillRect(ox, oy, PXW, PXH); g.restore(); }
      parts.draw(g, t);
      // progress
      PX(g, 90, 222, 300, 10, "#0b0d18"); PX(g, 91, 223, Math.round(298 * Math.min(1, pct / 0.9)), 8, "#5dff8a");
      g.fillStyle = "#fff"; g.font = "9px monospace"; g.fillText(`Clean: ${Math.round(Math.min(100, (pct / 0.9) * 100))}%`, 92, 245);
      api.timer(getTime ? `⏱ ${Math.ceil(getTime())}` : "");
      // brush cursor
      if (pt.inside) { const x = Math.round(pt.x), y = Math.round(pt.y), wob = pt.down ? Math.sin(t * 30) * 2 : 0; PX(g, x - 3 + wob, y - 26, 6, 16, "#a0642e"); PX(g, x - 12 + wob, y - 12, 24, 6, "#5a5e6a"); for (let k = 0; k < 11; k++) PX(g, x - 11 + k * 2 + wob, y - 6, 1, 6 + (k % 2), "#ffd34a"); }
    };
  });
};
// ---------------------------------------------------------- 2) flick off the pebbles
Minigames.panel_pebbles = function (n, getTime) {
  return canvasGame({ title: `${pairName(n)}: Flick off the pebbles`, tag: "SOLAR PANEL", speaker: "diego", sub: "The wind blew sand and small rocks onto this panel. <b>Tap each pebble</b> to flick it off — watch out, the wind brings more!", hint: "Quick fingers, Commander!" }, (api) => {
    const { g } = api; const ox = 90, oy = 52, W = 300, H = 150;
    const mk = () => ({ x: (() => { let x = 15 + Math.random() * (W - 30); if (x > PGAP[0] - 8 && x < PGAP[1] + 8) x += 24; return ox + x; })(), y: oy + 15 + Math.random() * (H - 30), r: 5 + Math.random() * 4, fly: 0, vx: 0, vy: 0, rot: 0, ph: Math.random() * 7, c: ["#7a3a20", "#9a4c2a", "#6a3018"][(Math.random() * 3) | 0] });
    const pebbles = Array.from({ length: 8 }, mk); let extra = 2, gust = 1.6, done = false;
    api.onDown = (pt) => {
      if (done) return;
      const p = pebbles.find((p) => !p.fly && Math.hypot(pt.x - p.x, pt.y - p.y) < p.r + 9);
      if (p) { p.fly = 1; p.vx = (p.x - pt.x) * 10 + (Math.random() < 0.5 ? -1 : 1) * 160; p.vy = -180 - Math.random() * 80; Sound.play("click"); Sound.play("thud"); }
      else Sound.play("hover");
    };
    api.frame = (dt, t) => {
      gust -= dt;
      if (gust <= 0 && extra > 0 && !done) { gust = 1.8; extra--; pebbles.push(Object.assign(mk(), { x: ox + 4, drift: 1 })); Sound.play("whoosh"); }
      for (const p of pebbles) {
        if (p.fly) { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 14; p.fly += dt; }
        else if (p.drift) { p.x += 70 * dt; if (p.x > ox + 60 + Math.random() * 180) p.drift = 0; }
      }
      const left = pebbles.filter((p) => !p.fly).length;
      if (!done && left === 0 && extra === 0) { done = true; Sound.play("success"); api.say("diego", "All clear! Even small rocks cast shadows on the cells."); api.finish({ ok: true, delay: 900 }); }
      panelBackdrop(g, t, G.storm || 0);
      drawPanelPair(g, ox, oy, W, H);
      g.fillStyle = "rgba(184,116,62,0.25)"; g.fillRect(ox, oy, PGAP[0], H); g.fillRect(ox + PGAP[1], oy, W - PGAP[1], H);
      for (const p of pebbles) {
        if (p.fly > 1.2) continue;
        g.save(); g.translate(p.x, p.y + (p.fly ? 0 : Math.sin(t * 6 + p.ph) * 0.6)); g.rotate(p.rot);
        g.fillStyle = "rgba(0,0,0,0.35)"; if (!p.fly) { g.beginPath(); g.ellipse(2, 3, p.r, p.r * 0.6, 0, 0, 7); g.fill(); }
        g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.r, p.r * 0.8, 0.4, 0, 7); g.fill(); g.fillStyle = "rgba(255,200,150,0.5)"; g.fillRect(-p.r / 2, -p.r / 2, 2, 2);
        g.restore();
        if (!p.fly && ((t * 3 + p.ph) | 0) % 3 === 0) { g.strokeStyle = "rgba(255,211,74,0.6)"; g.beginPath(); g.arc(p.x, p.y, p.r + 4, 0, 7); g.stroke(); }
      }
      g.fillStyle = "#fff"; g.font = "9px monospace"; g.fillText(`Pebbles left: ${left + extra}`, 92, 240);
      api.timer(getTime ? `⏱ ${Math.ceil(getTime())}` : "");
      if (api.ptr.inside) { const x = Math.round(api.ptr.x), y = Math.round(api.ptr.y); PX(g, x - 1, y - 6, 2, 12, "#fff"); PX(g, x - 6, y - 1, 12, 2, "#fff"); }
    };
  });
};
// ---------------------------------------------------------- 3) tilt toward the Sun
Minigames.panel_tilt = function (n, getTime) {
  return canvasGame({ title: `${pairName(n)}: Point them at the Sun`, tag: "SOLAR PANEL", speaker: "diego", sub: "The storm wind knocked these two panels crooked. They share one frame. <b>Drag left/right</b> (or use the arrow keys) to tilt them so they face the Sun. Hold it in the green zone!", hint: "Panels make the most power when they face the Sun straight on." }, (api) => {
    const { g } = api; let ang = Math.random() < 0.5 ? -0.85 : 0.8, vel = 0, hold = 0, done = false, gustT = 1.2, gustF = 0, drag = null;
    const sunA = -0.35; // the Sun's direction (radians from straight up)
    api.onDown = (pt) => { drag = { x: pt.x, a: ang }; };
    api.onUp = () => { drag = null; };
    api.state = { get ang() { return ang; }, sunA }; api.cv.style.cursor = "grab";
    api.frame = (dt, t) => {
      gustT -= dt; if (gustT <= 0) { gustT = 1 + Math.random() * 1.2; gustF = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.6); Sound.play("whoosh"); }
      gustF *= Math.pow(0.2, dt);
      if (drag && api.ptr.down) ang = drag.a + (api.ptr.x - drag.x) / 160;
      else { const k = (api.keys.ArrowLeft || api.keys.a ? -1 : 0) + (api.keys.ArrowRight || api.keys.d ? 1 : 0); vel += k * 3.2 * dt; }
      vel += gustF * dt * 1.2; vel *= Math.pow(0.08, dt); ang += vel * dt * 2; if (drag) { drag.a += gustF * dt * 0.5; }
      ang = Math.max(-1.0, Math.min(1.0, ang));
      const diff = Math.abs(ang - sunA), power = Math.max(0, Math.cos(Math.min(Math.PI / 2, diff)));
      const inZone = diff < 0.17;
      if (!done) { hold = inZone ? hold + dt : Math.max(0, hold - dt * 0.8); if (hold >= 1.2) { done = true; Sound.play("success"); Sound.play("power"); api.say("diego", "Locked! Facing the Sun means the most power."); api.finish({ ok: true, delay: 900 }); } }
      // draw
      panelBackdrop(g, t, (G.storm || 0) * 0.5);
      const sx = 240 + Math.sin(sunA) * 200, sy = 230 - Math.cos(sunA) * 200;
      g.fillStyle = "#fff6d0"; g.beginPath(); g.arc(sx, sy, 12, 0, 7); g.fill(); g.save(); g.globalCompositeOperation = "lighter"; const sg = g.createRadialGradient(sx, sy, 4, sx, sy, 50); sg.addColorStop(0, "rgba(255,230,160,0.6)"); sg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = sg; g.fillRect(sx - 50, sy - 50, 100, 100); g.restore();
      // green zone arc
      g.strokeStyle = "rgba(93,255,138,0.5)"; g.lineWidth = 6; g.beginPath(); g.arc(240, 230, 96, -Math.PI / 2 + sunA - 0.17, -Math.PI / 2 + sunA + 0.17); g.stroke();
      // sun rays to the panel
      g.strokeStyle = `rgba(255,240,170,${0.15 + power * 0.5})`; g.lineWidth = 1; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(sx + k * 6, sy); g.lineTo(240 + k * 14, 214); g.stroke(); }
      // ground + mount + panel
      PX(g, 0, 236, MW2, 34, "#9a4c2a"); PX(g, 0, 236, MW2, 2, "#b56236");
      PX(g, 236, 214, 8, 24, "#5a6070");
      g.save(); g.translate(240, 214); g.rotate(ang);
      g.fillStyle = "#1b1d2b"; g.fillRect(-120, -10, 240, 12);
      for (const sx of [-118, 6]) { g.fillStyle = "#2a4aa0"; g.fillRect(sx, -9, 112, 9); g.fillStyle = "#4a7ad0"; for (let k = sx; k < sx + 112; k += 14) g.fillRect(k, -9, 1, 9); g.fillStyle = `rgba(255,255,220,${power * 0.6})`; g.fillRect(sx, -9, 112, 2); }
      g.fillStyle = "#5a6070"; g.fillRect(-4, -11, 8, 12);
      g.fillStyle = "#ffd34a"; g.fillRect(-2, -16, 4, 6); // normal pointer
      g.restore();
      // power meter
      PX(g, 20, 20, 16, 120, "#0b0d18"); const ph = Math.round(118 * power); PX(g, 21, 21 + 118 - ph, 14, ph, power > 0.95 ? "#5dff8a" : power > 0.7 ? "#ffd040" : "#ff6a4a");
      g.fillStyle = "#fff"; g.font = "9px monospace"; g.fillText("POWER", 12, 152); g.fillText(`${Math.round(power * 100)}%`, 14, 164);
      PX(g, 380, 20, 80, 8, "#0b0d18"); PX(g, 381, 21, Math.round(78 * Math.min(1, hold / 1.2)), 6, "#5dff8a"); g.fillText("HOLD", 380, 40);
      api.timer(getTime ? `⏱ ${Math.ceil(getTime())}` : "");
    };
  });
};

// =====================================================================
//  SUIT UP — follow the checklist, dress the astronaut layer by layer,
//  then pump the suit to the right pressure (leak check).
// =====================================================================
const SUIT_PARTS = [
  { k: "cool", name: "Cooling suit", line: "This underwear has thin water tubes inside. They keep your body cool while you work." },
  { k: "suit", name: "Pressure suit", line: "The suit is like a tiny spaceship shaped like you. It holds air in and keeps dust out." },
  { k: "boots", name: "Boots", line: "Strong boots for sharp Mars rocks!" },
  { k: "pack", name: "Oxygen pack", line: "The backpack gives you oxygen and cleans the air you breathe out." },
  { k: "gloves", name: "Gloves", line: "Gloves are the trickiest part — your fingers still need to work!" },
  { k: "helmet", name: "Helmet", line: "The gold visor blocks the Sun's glare. Click — locked!" },
];
Minigames.suitUp = function () {
  Sound.setMood("task");
  return canvasGame({ title: "Suit Up!", tag: "AIRLOCK", speaker: "diego", sub: "Real astronauts suit up with a <b>checklist</b>. Drag each part onto the astronaut <b>in the right order</b> (or tap it).", hint: "Follow the checklist, step by step. Safety first, Commander!" }, (api) => {
    const { g } = api, CX = 190, parts = new Pool(160);
    const order = SUIT_PARTS.map((p) => p.k);
    const slots = order.slice().sort(() => Math.random() - 0.5).map((k, i) => ({ k, hx: 34 + i * 54, hy: 244, x: 34 + i * 54, y: 244, rot: 0, used: false, shake: 0, fly: null }));
    let step = 0, mistakes = 0, held = null, phase = "dress", snapFlash = 0, wobble = 0;
    // phase 2
    let psi = 0, holdOk = 0, pumping = false, vent = 0, done = false;
    const face = portraitFor("lead");
    const has = (k) => order.indexOf(k) < step;
    const slotAt = (x, y) => slots.find((s) => !s.used && !s.fly && Math.abs(x - s.x) < 24 && Math.abs(y - s.y) < 22);
    const onBody = (x, y) => Math.abs(x - CX) < 54 && y > 20 && y < 212;
    const equip = (s) => {
      s.used = true; step++; snapFlash = 0.35; wobble = 0.5; Sound.play("good"); Sound.play("click");
      for (let k = 0; k < 18; k++) parts.spawn({ x: CX + (Math.random() - 0.5) * 60, y: 60 + Math.random() * 130, vx: (Math.random() - 0.5) * 50, vy: -30 - Math.random() * 40, life: 0.8, s: 2, c: ["#fff", "#ffd34a", "#9ad8ff"][k % 3], g: 40 });
      const P = SUIT_PARTS.find((p) => p.k === s.k); api.say("diego", P.line);
      if (step === order.length) setTimeout(() => { phase = "pump"; api.say("diego", "Last step: the leak check! Hold PUMP to fill the suit with air. Stop in the green zone."); }, 900);
    };
    const reject = (s) => { mistakes++; s.shake = 0.5; Sound.play("error"); api.say("diego", `Not yet! The checklist says: ${SUIT_PARTS[step].name} first.`); };
    const tryUse = (s, fromX, fromY) => {
      if (s.k === order[step]) { s.fly = { x0: fromX, y0: fromY, t: 0 }; }
      else { reject(s); s.x = s.hx; s.y = s.hy; }
    };
    const pumpBtn = { x: 352, y: 196, w: 108, h: 34 };
    const inPump = (pt) => pt.x > pumpBtn.x && pt.x < pumpBtn.x + pumpBtn.w && pt.y > pumpBtn.y && pt.y < pumpBtn.y + pumpBtn.h;
    api.onDown = (pt) => {
      if (phase === "dress") { const s = slotAt(pt.x, pt.y); if (s) { held = { s, ox: pt.x - s.x, oy: pt.y - s.y, sx: pt.x, sy: pt.y, lx: pt.x, moved: 0 }; Sound.play("hover"); } }
      else if (phase === "pump" && inPump(pt)) pumping = true;
    };
    api.onMove = (pt) => { if (held) { held.moved += Math.abs(pt.x - held.lx); held.s.rot = Math.max(-0.5, Math.min(0.5, held.s.rot + (pt.x - held.lx) * 0.03)); held.lx = pt.x; held.s.x = pt.x - held.ox; held.s.y = pt.y - held.oy; } };
    api.onUp = (pt) => {
      pumping = false;
      if (!held) return; const h = held; held = null;
      if (h.moved < 6 && Math.hypot(pt.x - h.sx, pt.y - h.sy) < 8) tryUse(h.s, h.s.x, h.s.y); // a tap
      else if (onBody(pt.x, pt.y)) tryUse(h.s, h.s.x, h.s.y);
      else { h.s.fly = null; h.s.back = 1; }
    };
    api.onKey = (k, down) => { if (k === " " && phase === "pump") pumping = down; };
    window.addEventListener("keyup", function ku(e) { if (e.key === " ") pumping = false; if (api.finished) window.removeEventListener("keyup", ku); });

    api.frame = (dt, t) => {
      // ---- update
      for (const s of slots) {
        s.shake = Math.max(0, s.shake - dt); s.rot *= Math.pow(0.02, dt);
        if (s.back) { s.x += (s.hx - s.x) * Math.min(1, dt * 10); s.y += (s.hy - s.y) * Math.min(1, dt * 10); if (Math.hypot(s.x - s.hx, s.y - s.hy) < 1) { s.back = 0; s.x = s.hx; s.y = s.hy; } }
        if (s.fly) { s.fly.t += dt * 3.2; const e = Math.min(1, s.fly.t), q = e * e * (3 - 2 * e); s.x = s.fly.x0 + (CX - s.fly.x0) * q; s.y = s.fly.y0 + (110 - s.fly.y0) * q - Math.sin(q * Math.PI) * 40; if (e >= 1) { s.fly = null; equip(s); } }
      }
      snapFlash = Math.max(0, snapFlash - dt); wobble = Math.max(0, wobble - dt); parts.update(dt);
      if (phase === "pump" && !done) {
        if (pumping) { psi += dt * 1.6; if (((t * 10) | 0) % 2 === 0 && Math.random() < 0.3) Sound.play("hover"); }
        else psi = Math.max(0, psi - dt * 0.05); // tiny leak
        if (psi > 5.4) { psi = 3.2; vent = 0.8; Sound.play("whoosh"); Sound.play("error"); mistakes++; api.say("diego", "Too much! The safety valve let air out. Try again — gently."); }
        vent = Math.max(0, vent - dt);
        const ok = psi >= 4.0 && psi <= 4.6;
        holdOk = ok && !pumping ? holdOk + dt : 0;
        if (holdOk > 1.2) { done = true; phase = "done"; Sound.play("success"); Sound.play("door"); api.say("diego", "Pressure holds at 4.3 psi — about a third of Earth's air pressure. Suit check complete!"); for (let k = 0; k < 30; k++) parts.spawn({ x: CX, y: 60, vx: (Math.random() - 0.5) * 160, vy: -40 - Math.random() * 90, life: 1.2, s: 2, c: ["#ffd34a", "#5dff8a", "#fff"][k % 3], g: 90 }); api.finish({ mistakes, delay: 2200 }); }
      }

      // ---- draw: airlock interior
      g.fillStyle = "#2a2e3c"; g.fillRect(0, 0, MW2, MH2);
      for (let x = 0; x < MW2; x += 32) { PX(g, x, 0, 31, 200, "#323748"); PX(g, x, 0, 1, 200, "#3e4458"); }
      for (let x = 0; x < MW2; x += 16) PX(g, x, 200, 8, 6, ((x / 16) | 0) % 2 ? "#e8c040" : "#1b1d2b");
      PX(g, 0, 206, MW2, 64, "#20242f");
      // lockers with spare suits on the left
      for (let i = 0; i < 2; i++) { PX(g, 8 + i * 34, 30, 30, 160, "#3a4052"); PX(g, 10 + i * 34, 32, 26, 156, "#2a2e3c"); PX(g, 15 + i * 34, 50, 16, 40, "#c8ccd8"); PX(g, 17 + i * 34, 40, 12, 10, "#9aa6c0"); PX(g, 15 + i * 34, 92, 7, 40, "#c8ccd8"); PX(g, 24 + i * 34, 92, 7, 40, "#c8ccd8"); }
      // hatch window on the right (dusty Mars outside)
      g.fillStyle = "#1b1d2b"; g.beginPath(); g.arc(300, 70, 30, 0, 7); g.fill(); g.fillStyle = "#c86a3a"; g.beginPath(); g.arc(300, 70, 25, 0, 7); g.fill();
      g.fillStyle = "rgba(230,150,90,0.6)"; for (let k = 0; k < 8; k++) g.fillRect(278 + ((k * 13 + t * 60) % 44), 52 + k * 5, 6, 1);
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(286, 56, 6, 2);
      // rotating warning light
      const wl = (Math.sin(t * 5) + 1) / 2; PX(g, 296, 8, 10, 6, "#5a2020"); PX(g, 297, 9, 8, 4, `rgba(255,${80 + wl * 60},40,${0.5 + wl * 0.5})`);
      // pedestal
      PX(g, CX - 46, 196, 92, 8, "#4a5068"); PX(g, CX - 46, 196, 92, 2, "#6a7090");
      // ---- the astronaut, layer by layer
      const by = Math.round(Math.sin(t * 2) * 1 + (wobble ? Math.sin(wobble * 30) * 1.5 : 0));
      const B = (x, y, w, h, c) => PX(g, CX + x, y + by, w, h, c);
      if (has("pack")) { B(-30, 66, 60, 54, "#b8bdca"); B(-28, 68, 56, 50, "#d8dce6"); B(-26, 114, 52, 4, "#9aa0b0"); }
      // base body: thermal underwear
      const body = has("cool") ? ["#9ad8ff", "#5fa8e0"] : ["#555b74", "#3e4358"];
      B(-20, 72, 40, 54, body[0]); B(-32, 74, 12, 46, body[0]); B(20, 74, 12, 46, body[0]); B(-18, 126, 16, 60, body[0]); B(2, 126, 16, 60, body[0]);
      if (has("cool")) for (let y = 78; y < 182; y += 7) { B(-18, y, 36, 1, body[1]); }
      if (!has("gloves")) { B(-32, 120, 12, 8, "#e0a37a"); B(20, 120, 12, 8, "#e0a37a"); }
      if (!has("boots")) { B(-20, 186, 18, 8, "#3a3e4a"); B(2, 186, 18, 8, "#3a3e4a"); }
      if (has("suit")) {
        B(-25, 70, 50, 60, "#eef0f4"); B(-25, 124, 50, 6, "#c8ccd8");
        B(-37, 72, 15, 50, "#eef0f4"); B(22, 72, 15, 50, "#eef0f4"); B(-37, 94, 15, 3, "#c8ccd8"); B(22, 94, 15, 3, "#c8ccd8");
        B(-21, 128, 20, 60, "#eef0f4"); B(1, 128, 20, 60, "#eef0f4"); B(-21, 154, 20, 3, "#c8ccd8"); B(1, 154, 20, 3, "#c8ccd8");
        B(-25, 108, 50, 3, "#d24a3a"); B(-37, 82, 15, 2, "#4a7ad0"); B(22, 82, 15, 2, "#4a7ad0");
      }
      if (has("pack")) { B(-12, 82, 24, 16, "#5a6070"); B(-10, 84, 20, 12, "#3a3e4a"); B(-8, 86, 3, 2, "#5dff8a"); B(-3, 86, 3, 2, ((t * 3) | 0) % 2 ? "#ffd34a" : "#6a5a20"); B(2, 86, 6, 2, "#40d0ff"); B(-28, 76, 3, 20, "#9aa0b0"); B(25, 76, 3, 20, "#9aa0b0"); }
      if (has("boots")) { B(-23, 180, 23, 16, "#8b93a6"); B(0, 180, 23, 16, "#8b93a6"); B(-23, 192, 23, 4, "#3a3e4a"); B(0, 192, 23, 4, "#3a3e4a"); B(-23, 180, 23, 2, "#aab2c4"); B(0, 180, 23, 2, "#aab2c4"); }
      if (has("gloves")) { B(-38, 118, 17, 13, "#dfe3ea"); B(21, 118, 17, 13, "#dfe3ea"); B(-38, 118, 17, 2, "#4a7ad0"); B(21, 118, 17, 2, "#4a7ad0"); }
      // head
      if (face) g.drawImage(face, CX - 18, 34 + by, 36, 36); else B(-14, 38, 28, 30, "#e0a37a");
      if (has("helmet")) {
        B(-22, 68, 44, 6, "#9aa0b0");
        g.fillStyle = "rgba(170,215,255,0.28)"; g.beginPath(); g.arc(CX, 50 + by, 27, 0, 7); g.fill();
        g.strokeStyle = "#dfe3ea"; g.lineWidth = 3; g.beginPath(); g.arc(CX, 50 + by, 27, 0, 7); g.stroke();
        g.fillStyle = "rgba(255,190,70,0.42)"; g.beginPath(); g.arc(CX, 50 + by, 25, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(CX, 46 + by); g.fill();
        g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(CX - 16, 34 + by, 6, 2); g.fillRect(CX - 18, 37 + by, 3, 4);
      }
      if (snapFlash) { g.fillStyle = `rgba(255,255,255,${snapFlash * 1.6})`; g.fillRect(CX - 40, 24, 80, 176); }
      // drop hint glow
      if (held && onBody(api.ptr.x, api.ptr.y)) { g.strokeStyle = "rgba(255,211,74,0.7)"; g.lineWidth = 2; g.setLineDash([4, 3]); g.strokeRect(CX - 48, 24, 96, 176); g.setLineDash([]); }
      // ---- right side: checklist or pressure gauge
      PX(g, 344, 14, 126, 170, "rgba(10,12,22,0.75)"); PX(g, 344, 14, 126, 2, "#ffd34a");
      g.font = "8px monospace";
      if (phase === "dress") {
        g.fillStyle = "#ffd34a"; g.fillText("SUIT-UP CHECKLIST", 352, 30);
        SUIT_PARTS.forEach((p, i) => { const y = 48 + i * 21, cur = i === step; if (cur) PX(g, 348, y - 10, 118, 16, `rgba(255,211,74,${0.18 + Math.sin(t * 5) * 0.08})`); PX(g, 352, y - 7, 9, 9, i < step ? "#5dff8a" : "#3a4060"); if (i < step) { g.fillStyle = "#0b2a14"; g.fillText("✓", 353, y); } g.fillStyle = i < step ? "#8a9ab0" : cur ? "#ffffff" : "#b8c0d8"; g.fillText(`${i + 1}. ${p.name}`, 366, y); if (i < step) PX(g, 366, y - 3, g.measureText(`${i + 1}. ${p.name}`).width, 1, "#8a9ab0"); });
      } else {
        g.fillStyle = "#ffd34a"; g.fillText("LEAK CHECK", 352, 30);
        const gx = 407, gy = 108, R = 46, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, toA = (v) => a0 + (a1 - a0) * Math.min(1, v / 6);
        g.lineWidth = 7; g.strokeStyle = "#1b1d2b"; g.beginPath(); g.arc(gx, gy, R, a0, a1); g.stroke();
        g.strokeStyle = "#5dff8a"; g.beginPath(); g.arc(gx, gy, R, toA(4.0), toA(4.6)); g.stroke();
        g.strokeStyle = "#ff5a40"; g.beginPath(); g.arc(gx, gy, R, toA(5.2), a1); g.stroke();
        const na = toA(psi) + (vent ? Math.sin(t * 60) * 0.05 : 0); g.strokeStyle = "#fff"; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(na) * (R - 6), gy + Math.sin(na) * (R - 6)); g.stroke();
        PX(g, gx - 3, gy - 3, 6, 6, "#ffd34a");
        g.fillStyle = "#fff"; g.font = "10px monospace"; g.textAlign = "center"; g.fillText(`${psi.toFixed(1)} psi`, gx, gy + 26); g.font = "8px monospace"; g.fillStyle = "#9affb0"; g.fillText(holdOk > 0 ? "HOLDING…" : "target 4.0–4.6", gx, gy + 38); g.textAlign = "left";
        if (vent) for (let k = 0; k < 3; k++) parts.spawn({ x: CX + 22, y: 90, vx: 60 + Math.random() * 40, vy: -20 + Math.random() * 40, life: 0.5, s: 2, c: "rgba(220,240,255,0.8)", g: 0 });
      }
      // pump button
      if (phase !== "dress") {
        const pr = pumping ? 2 : 0; PX(g, pumpBtn.x, pumpBtn.y + pr, pumpBtn.w, pumpBtn.h - pr, pumping ? "#2f8a50" : "#3fb070"); PX(g, pumpBtn.x, pumpBtn.y + pumpBtn.h - 4, pumpBtn.w, 4, "#1f5a34");
        g.fillStyle = "#fff"; g.font = "10px monospace"; g.textAlign = "center"; g.fillText(phase === "done" ? "SEALED ✓" : "HOLD: PUMP", pumpBtn.x + pumpBtn.w / 2, pumpBtn.y + 21 + pr); g.textAlign = "left";
      }
      // ---- tray with the parts
      PX(g, 0, 214, 340, 56, "#161a28"); PX(g, 0, 214, 340, 2, "#3a4170");
      for (const s of slots) {
        if (s.used) continue;
        if (s !== (held && held.s) && !s.fly) { PX(g, s.hx - 24, s.hy - 22, 48, 44, "#232842"); }
        const sx = s.x + (s.shake ? Math.sin(s.shake * 50) * 4 : 0);
        g.save(); g.translate(Math.round(sx), Math.round(s.y)); g.rotate(s.rot); drawSuitPart(g, s.k, t); g.restore();
      }
      if (phase === "dress" && !held) { const nx = slots.find((s) => s.k === order[step] && !s.used); if (nx && mistakes > 1) { g.strokeStyle = `rgba(255,211,74,${0.5 + Math.sin(t * 6) * 0.4})`; g.lineWidth = 1; g.strokeRect(nx.hx - 25, nx.hy - 23, 50, 46); } }
      parts.draw(g, t); g.globalAlpha = 1;
      // hand cursor
      if (api.ptr.inside && !held) { const x = Math.round(api.ptr.x), y = Math.round(api.ptr.y); PX(g, x - 1, y - 1, 3, 3, "#fff"); PX(g, x, y, 1, 1, "#000"); }
    };
  });
};
function drawSuitPart(g, k, t) {
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  switch (k) {
    case "cool": P(-12, -14, 24, 22, "#9ad8ff"); P(-18, -13, 6, 16, "#9ad8ff"); P(12, -13, 6, 16, "#9ad8ff"); for (let y = -11; y < 8; y += 4) P(-11, y, 22, 1, "#5fa8e0"); P(-5, -14, 10, 3, "#5fa8e0"); break;
    case "suit": P(-13, -18, 26, 22, "#eef0f4"); P(-19, -17, 7, 18, "#eef0f4"); P(12, -17, 7, 18, "#eef0f4"); P(-11, 4, 10, 14, "#eef0f4"); P(1, 4, 10, 14, "#eef0f4"); P(-13, 0, 26, 2, "#d24a3a"); P(-19, -11, 7, 1, "#4a7ad0"); P(12, -11, 7, 1, "#4a7ad0"); break;
    case "boots": P(-17, -4, 14, 14, "#8b93a6"); P(3, -4, 14, 14, "#8b93a6"); P(-17, 7, 14, 4, "#3a3e4a"); P(3, 7, 14, 4, "#3a3e4a"); P(-17, -4, 14, 2, "#aab2c4"); P(3, -4, 14, 2, "#aab2c4"); break;
    case "pack": P(-14, -16, 28, 30, "#d8dce6"); P(-12, -14, 24, 26, "#b8bdca"); P(-8, -10, 16, 8, "#5a6070"); P(-6, -8, 3, 2, "#5dff8a"); P(-1, -8, 3, 2, "#ffd34a"); P(4, -8, 2, 2, "#40d0ff"); P(-10, 4, 20, 2, "#9aa0b0"); break;
    case "gloves": P(-17, -8, 12, 14, "#dfe3ea"); P(5, -8, 12, 14, "#dfe3ea"); P(-17, 4, 12, 3, "#4a7ad0"); P(5, 4, 12, 3, "#4a7ad0"); P(-19, -6, 3, 6, "#dfe3ea"); P(16, -6, 3, 6, "#dfe3ea"); break;
    case "helmet": g.fillStyle = "rgba(170,215,255,0.35)"; g.beginPath(); g.arc(0, -2, 15, 0, 7); g.fill(); g.strokeStyle = "#dfe3ea"; g.lineWidth = 2; g.beginPath(); g.arc(0, -2, 15, 0, 7); g.stroke(); g.fillStyle = "rgba(255,190,70,0.6)"; g.beginPath(); g.arc(0, -2, 13, Math.PI * 1.05, Math.PI * 1.95); g.fill(); P(-12, 12, 24, 4, "#9aa0b0"); P(-8, -12, 4, 2, "#fff"); break;
  }
  g.fillStyle = "#cfd8ff"; g.font = "7px monospace"; g.textAlign = "center"; g.fillText(SUIT_PARTS.find((p) => p.k === k).name, 0, 21); g.textAlign = "left";
}

// =====================================================================
//  RESTART ROSIE — reconnect the 4 cut wires (any order, match colours).
//  Each wire brings one part of the oxygen machine back to life, and the
//  machine view above shows what that part does (based on NASA's MOXIE).
// =====================================================================
const ROSIE_PARTS = [
  { k: "power", name: "Power", c: "#ff4a4a", line: "Power on! Rosie gets her energy from our solar panels." },
  { k: "fan", name: "Air pump", c: "#4a8aff", line: "The pump pulls Mars air inside. It is mostly carbon dioxide — CO₂." },
  { k: "filter", name: "Dust filter", c: "#ffd040", line: "The filter catches the dust, so it can't break Rosie again." },
  { k: "heat", name: "Heater", c: "#5dd06a", line: "The heater makes the air super hot — about 800 °C — so CO₂ can split apart." },
];
Minigames.wires = function ({ time, hints }) {
  Sound.setMood("task");
  const who = hints ? "marcus" : "diego";
  return canvasGame({ title: "Restart Rosie", sub: "Dust cut Rosie's wires! <b>Drag each wire to the plug with the same colour</b> — any order. Watch what each part does.", hint: hints ? "Match the colours. I'll tell you what each part does." : "Match each wire to its colour. Quick, Commander!", speaker: who }, (api) => {
    const { g } = api; api.cv.style.cursor = "grab";
    const L = ROSIE_PARTS.map((p) => p).sort(() => Math.random() - 0.5), R = ROSIE_PARTS.map((p) => p).sort(() => Math.random() - 0.5);
    const rowY = (i) => 140 + i * 32;
    const ends = L.map((p, i) => ({ p, x: 40, y: rowY(i), done: false, tx: 40, ty: rowY(i) }));
    const plugs = R.map((p, i) => ({ p, x: 398, y: rowY(i), on: 0 }));
    const parts = new Pool(200), on = {};
    let drag = null, tLeft = time || 0, ended = false, flowT = 0, wrong = 0, sparkT = 0;
    api.state = { ends, plugs };
    api.onDown = (pt) => { if (ended) return; const e = ends.find((e) => !e.done && Math.hypot(pt.x - e.tx, pt.y - e.ty) < 18); if (e) { drag = e; api.cv.style.cursor = "grabbing"; Sound.play("click"); } };
    api.onUp = (pt) => {
      api.cv.style.cursor = "grab"; if (!drag) return; const e = drag; drag = null;
      const pl = plugs.find((q) => Math.hypot(pt.x - q.x, pt.y - q.y) < 26);
      if (pl && pl.p === e.p) { e.done = true; e.tx = pl.x - 10; e.ty = pl.y; on[e.p.k] = 1; pl.on = 1; Sound.play("wire"); Sound.play("good"); for (let k = 0; k < 14; k++) parts.spawn({ x: pl.x - 10, y: pl.y, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 80, life: 0.5, s: 2, c: "#fff6b0", g: 200 }); api.say(who, e.p.line); }
      else if (pl) { Sound.play("zap"); sparkT = 0.3; wrong++; for (let k = 0; k < 10; k++) parts.spawn({ x: pl.x - 10, y: pl.y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, life: 0.3, s: 2, c: "#7fd0ff", g: 0 }); if (time) { tLeft -= BALANCE.rosie.wrongPenalty; api.say(who, `Zap! Wrong colour. (−${BALANCE.rosie.wrongPenalty} seconds)`); } else api.say(who, "Zap! Match the same colour."); }
    };
    api.frame = (dt, t) => {
      const pt = api.ptr;
      if (drag) { drag.tx += (pt.x - drag.tx) * Math.min(1, dt * 25); drag.ty += (pt.y - drag.ty) * Math.min(1, dt * 25); }
      for (const e of ends) if (!e.done && e !== drag) { e.tx += (e.x - e.tx) * Math.min(1, dt * 12); e.ty += (e.y - e.ty) * Math.min(1, dt * 12); }
      const all = ends.every((e) => e.done);
      if (time && !ended && !all) { tLeft -= dt; if (tLeft < 10 && ((tLeft * 10) | 0) % 10 === 0) Sound.play("heart"); if (tLeft <= 0) { ended = true; api.say(who, "Oxygen is too low!"); api.finish({ ok: false, delay: 400 }); } }
      api.timer(time ? `⏱ ${Math.max(0, Math.ceil(tLeft))}` : "No timer");
      if (all && !ended) { ended = true; flowT = 0.001; Sound.play("power"); Sound.play("success"); api.say(who, "CO₂ splits into oxygen (O₂) for us — the rest goes back outside. Just like NASA's MOXIE on Mars!"); api.finish({ ok: true, delay: 3200 }); }
      if (flowT) flowT += dt;
      parts.update(dt); sparkT = Math.max(0, sparkT - dt);
      // ---------------- machine view
      PX(g, 0, 0, MW2, MH2, "#161a2a");
      PX(g, 0, 0, MW2, 112, "#1e2336"); PX(g, 0, 111, MW2, 2, "#3a4170");
      // pipe
      PX(g, 20, 52, 400, 14, "#3a4052"); PX(g, 20, 54, 400, 10, "#262b3c");
      // inlet
      PX(g, 6, 38, 22, 40, "#5a6070"); for (let y = 42; y < 76; y += 4) PX(g, 8, y, 18, 2, "#2a2e3c");
      g.fillStyle = "#e8e0d0"; g.font = "7px monospace"; g.fillText("MARS AIR", 4, 34);
      const box = (x, k, label) => {
        const lit = on[k], col = ROSIE_PARTS.find((p) => p.k === k).c;
        PX(g, x - 30, 30, 60, 58, lit ? "#3a4566" : "#262b3c"); PX(g, x - 30, 30, 60, 2, lit ? col : "#3a4052");
        g.fillStyle = lit ? "#fff" : "#7a8098"; g.font = "8px monospace"; g.textAlign = "center"; g.fillText(label, x, 100); g.textAlign = "left";
        return lit;
      };
      // fan
      if (box(95, "fan", "AIR PUMP")) { g.save(); g.translate(95, 59); g.rotate(t * 14); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillStyle = "#9ad0ff"; g.fillRect(0, -3, 16, 6); } g.restore(); } else { g.save(); g.translate(95, 59); for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.fillStyle = "#4a5068"; g.fillRect(0, -3, 16, 6); } g.restore(); }
      // filter
      const fl = box(185, "filter", "DUST FILTER"); for (let x = 165; x < 205; x += 4) PX(g, x, 38, 2, 42, fl ? "#ffd040" : "#4a5068");
      // heater
      const hl = box(275, "heat", "HEATER 800°C"); for (let i = 0; i < 4; i++) PX(g, 255 + i * 11, 40, 6, 38, hl ? `rgb(255,${110 + Math.sin(t * 6 + i) * 40},40)` : "#4a5068");
      // tank
      PX(g, 350, 24, 70, 70, "#2a3048"); PX(g, 352, 26, 66, 66, "#141826");
      const lvl = Math.min(1, flowT / 2.6); PX(g, 352, 26 + 66 * (1 - lvl), 66, 66 * lvl, "rgba(120,200,255,0.55)");
      g.fillStyle = "#cfe8ff"; g.font = "10px monospace"; g.textAlign = "center"; g.fillText("O₂", 385, 64); g.font = "8px monospace"; g.fillText("OXYGEN", 385, 104); g.textAlign = "left";
      // power box
      const pl = on.power; PX(g, 130, 4, 110, 16, pl ? "#4a2a2a" : "#2a2230"); g.fillStyle = pl ? "#ffb0a0" : "#7a6878"; g.font = "8px monospace"; g.fillText(pl ? "⚡ POWER ON" : "⚡ NO POWER", 142, 15);
      if (pl) for (const x of [95, 185, 275]) PX(g, x - 1, 20, 2, 10, ((t * 8 + x) | 0) % 3 ? "#ff6a4a" : "#ffd040");
      // molecules flowing once everything works
      if (flowT) {
        for (let i = 0; i < 9; i++) {
          const u = ((flowT * 0.5 + i / 9) % 1), x = 20 + u * 330, y = 59 + Math.sin(u * 20 + i) * 2;
          if (x < 275) { PX(g, x - 1, y - 1, 3, 3, "#1b1b1b"); PX(g, x - 5, y - 1, 3, 3, "#ff5a5a"); PX(g, x + 3, y - 1, 3, 3, "#ff5a5a"); } // CO₂
          else { PX(g, x - 3, y - 1, 3, 3, "#ff5a5a"); PX(g, x + 1, y - 1, 3, 3, "#ff5a5a"); } // O₂
        }
        g.fillStyle = "#ffd34a"; g.font = "8px monospace"; g.fillText("CO₂ → O₂", 296, 22);
      }
      // ---------------- oxygen bar
      if (time) { const k = Math.max(0, tLeft / time); PX(g, 60, 118, 360, 6, "#0b0d18"); PX(g, 61, 119, Math.round(358 * k), 4, k > 0.5 ? "#5fb7ff" : k > 0.25 ? "#ffd040" : ((t * 6) | 0) % 2 ? "#ff4a4a" : "#a02020"); g.fillStyle = "#cfd8ff"; g.font = "8px monospace"; g.fillText("O₂", 44, 125); }
      // ---------------- wiring panel
      PX(g, 14, 128, 452, 136, "#20263a"); PX(g, 14, 128, 452, 2, "#3a4170");
      for (const q of plugs) {
        PX(g, q.x - 6, q.y - 11, 26, 22, "#11141f"); PX(g, q.x - 4, q.y - 9, 22, 18, q.p.c); PX(g, q.x - 1, q.y - 4, 8, 8, q.on ? "#ffffff" : "#1b1d2b");
        g.fillStyle = "#e8eeff"; g.font = "8px monospace"; g.fillText(q.p.name, q.x + 24, q.y + 3);
        if (hints && drag && drag.p === q.p) { g.strokeStyle = `rgba(255,255,255,${0.5 + Math.sin(t * 10) * 0.4})`; g.lineWidth = 2; g.strokeRect(q.x - 8, q.y - 13, 30, 26); }
      }
      for (const e of ends) {
        // wire: thick sagging curve from the stub to its end
        const sx = 26, sy = e.y, ex = e.tx, ey = e.ty, sag = e.done ? 6 : 14 + Math.abs(ex - sx) * 0.05;
        g.strokeStyle = "#0b0d18"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(sx, sy); g.bezierCurveTo(sx + (ex - sx) * 0.35, sy + sag, sx + (ex - sx) * 0.65, ey + sag, ex, ey); g.stroke();
        g.strokeStyle = e.p.c; g.lineWidth = 6; g.stroke();
        g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, sy - 2); g.bezierCurveTo(sx + (ex - sx) * 0.35, sy + sag - 2, sx + (ex - sx) * 0.65, ey + sag - 2, ex, ey - 2); g.stroke();
        PX(g, 14, e.y - 8, 14, 16, "#3a4052");
        if (!e.done) { PX(g, ex - 5, ey - 5, 10, 10, "#c8ccd8"); PX(g, ex + 4, ey - 2, 4, 1, "#ffd34a"); PX(g, ex + 4, ey + 1, 4, 1, "#ffd34a"); if (!drag && ((t * 2) | 0) % 2) { g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 1; g.strokeRect(ex - 7, ey - 7, 14, 14); } }
      }
      if (sparkT) { g.fillStyle = `rgba(120,200,255,${sparkT})`; g.fillRect(0, 128, MW2, 136); }
      parts.draw(g, t); g.globalAlpha = 1;
    };
  }).then((r) => !!(r && r.ok));
};
