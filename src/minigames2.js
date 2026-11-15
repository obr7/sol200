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
    api.state = { plants }; const { g } = api;
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
      // held tool follows the pointer
      if (sel && pt.inside && pt.y < 212) drawTool(g, sel, pt.x, pt.y, t, !!tgt);
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
const PANEL_JOBS = ["brush", "pebbles", "tilt", "brush", "tilt", "pebbles"];
Minigames.panelJob = function (n, getTime) {
  const kind = PANEL_JOBS[n % PANEL_JOBS.length];
  return Minigames["panel_" + kind](n, getTime);
};
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
  return canvasGame({ title: `Panel ${n + 1}: Brush the dust`, tag: "SOLAR PANEL", speaker: "diego", sub: "Hold and <b>move the brush</b> over the panel to sweep the dust away. Dust blocks sunlight, so a dusty panel makes less power.", hint: "Sweep, sweep, sweep! Dust is soft like flour." }, (api) => {
    const { g } = api; const PXW = 300, PXH = 150, ox = 90, oy = 52;
    const dust = mkCanvas(PXW, PXH), dg = dust.getContext("2d");
    for (let i = 0; i < 3500; i++) { dg.fillStyle = ["#b8743e", "#c8854a", "#a8642e", "#d89a5e"][i % 4]; dg.fillRect((Math.random() * PXW) | 0, (Math.random() * PXH) | 0, 3 + ((Math.random() * 4) | 0), 2 + ((Math.random() * 3) | 0)); }
    dg.fillStyle = "rgba(184,116,62,0.9)"; dg.fillRect(0, 0, PXW, PXH);
    for (let i = 0; i < 900; i++) { dg.fillStyle = Math.random() < 0.5 ? "#d89a5e" : "#9a5a2e"; dg.fillRect((Math.random() * PXW) | 0, (Math.random() * PXH) | 0, 2, 1); }
    const parts = new Pool(160); let lastP = null, pct = 0, checkT = 0, done = false;
    const measure = () => { const d = dg.getImageData(0, 0, PXW, PXH).data; let clear = 0, tot = 0; for (let y = 2; y < PXH; y += 6) for (let x = 2; x < PXW; x += 6) { tot++; if (d[(y * PXW + x) * 4 + 3] < 60) clear++; } return clear / tot; };
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
      if (!done && pct >= 0.9) { done = true; dg.clearRect(0, 0, PXW, PXH); Sound.play("success"); api.say("diego", "Shiny! The Sun can reach the cells again."); api.finish({ ok: true, delay: 900 }); }
      parts.update(dt);
      panelBackdrop(g, t, G.storm || 0);
      drawPanelFace(g, ox, oy, PXW, PXH); g.drawImage(dust, ox, oy);
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
  return canvasGame({ title: `Panel ${n + 1}: Flick off the pebbles`, tag: "SOLAR PANEL", speaker: "diego", sub: "The wind blew sand and small rocks onto this panel. <b>Tap each pebble</b> to flick it off — watch out, the wind brings more!", hint: "Quick fingers, Commander!" }, (api) => {
    const { g } = api; const ox = 90, oy = 52, W = 300, H = 150;
    const mk = () => ({ x: ox + 15 + Math.random() * (W - 30), y: oy + 15 + Math.random() * (H - 30), r: 5 + Math.random() * 4, fly: 0, vx: 0, vy: 0, rot: 0, ph: Math.random() * 7, c: ["#7a3a20", "#9a4c2a", "#6a3018"][(Math.random() * 3) | 0] });
    const pebbles = Array.from({ length: 7 }, mk); let extra = 2, gust = 1.6, done = false;
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
      drawPanelFace(g, ox, oy, W, H);
      g.fillStyle = "rgba(184,116,62,0.25)"; g.fillRect(ox, oy, W, H);
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
  return canvasGame({ title: `Panel ${n + 1}: Point it at the Sun`, tag: "SOLAR PANEL", speaker: "diego", sub: "The storm wind knocked this panel crooked. <b>Drag left/right</b> (or use the arrow keys) to tilt it so it faces the Sun. Hold it in the green zone!", hint: "Panels make the most power when they face the Sun straight on." }, (api) => {
    const { g } = api; let ang = Math.random() < 0.5 ? -0.9 : 0.85, vel = 0, hold = 0, done = false, gustT = 1.2, gustF = 0, drag = null;
    const sunA = -0.35; // the Sun's direction (radians from straight up)
    api.onDown = (pt) => { drag = { x: pt.x, a: ang }; };
    api.onUp = () => { drag = null; };
    api.state = { get ang() { return ang; }, sunA };
    api.frame = (dt, t) => {
      gustT -= dt; if (gustT <= 0) { gustT = 1 + Math.random() * 1.2; gustF = (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.6); Sound.play("whoosh"); }
      gustF *= Math.pow(0.2, dt);
      if (drag && api.ptr.down) ang = drag.a + (api.ptr.x - drag.x) / 160;
      else { const k = (api.keys.ArrowLeft || api.keys.a ? -1 : 0) + (api.keys.ArrowRight || api.keys.d ? 1 : 0); vel += k * 3.2 * dt; }
      vel += gustF * dt * 1.2; vel *= Math.pow(0.08, dt); ang += vel * dt * 2; if (drag) { drag.a += gustF * dt * 0.5; }
      ang = Math.max(-1.3, Math.min(1.3, ang));
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
      g.fillStyle = "#1b1d2b"; g.fillRect(-72, -10, 144, 12); g.fillStyle = "#2a4aa0"; g.fillRect(-70, -9, 140, 9); g.fillStyle = "#4a7ad0"; for (let k = -70; k < 70; k += 14) g.fillRect(k, -9, 1, 9);
      g.fillStyle = `rgba(255,255,220,${power * 0.6})`; g.fillRect(-70, -9, 140, 2);
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
