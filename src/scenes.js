// =====================================================================
//  SCENES — title screen, intro cinematic (drawn in code), chapter end.
// =====================================================================
const Stars = Array.from({ length: 160 }, () => ({ x: Math.random() * VW, y: Math.random() * VH, s: Math.random(), tw: Math.random() * 7 }));
const Scenes = {
  shot: "title", t0: 0, sub: null, parts: [],
  setShot(s) { this.shot = s; this.t0 = performance.now() / 1000; this.parts = []; },

  // ------------------------------------------------------------ drawing
  draw(g, t, dt) {
    const lt = t - this.t0;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const stars = (speed = 0) => { for (const s of Stars) { const x = (s.x - lt * speed * (0.3 + s.s)) % VW; R(x < 0 ? x + VW : x, s.y, 1, 1, `rgba(255,255,255,${0.3 + s.s * 0.6 + Math.sin(t * 2 + s.tw) * 0.2})`); } };
    const planet = (cx, cy, r, base, dark, spots, rot = 0) => {
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
      g.fillStyle = base; g.fillRect(cx - r, cy - r, r * 2, r * 2);
      for (let i = 0; i < spots.length; i++) { const s = spots[i]; g.fillStyle = s.c; g.beginPath(); g.ellipse(cx + ((s.x * r * 2 + rot * r) % (r * 3)) - r * 1.2, cy + s.y * r, s.w * r, s.h * r, 0, 0, 7); g.fill(); }
      const sh = g.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r * 1.1); sh.addColorStop(0, "rgba(255,255,255,0.12)"); sh.addColorStop(0.7, "rgba(0,0,0,0)"); sh.addColorStop(1, dark); g.fillStyle = sh; g.fillRect(cx - r, cy - r, r * 2, r * 2);
      g.restore();
      const at = g.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.15); at.addColorStop(0, hexA(base, 0.35)); at.addColorStop(1, hexA(base, 0)); g.fillStyle = at; g.beginPath(); g.arc(cx, cy, r * 1.15, 0, 7); g.fill();
    };
    const marsSpots = [{ x: 0.2, y: -0.3, w: 0.3, h: 0.12, c: "#8a3a1a" }, { x: 0.6, y: 0.1, w: 0.4, h: 0.15, c: "#a04a22" }, { x: 0.4, y: 0.45, w: 0.25, h: 0.1, c: "#7a3216" }, { x: 0.9, y: -0.1, w: 0.2, h: 0.2, c: "#c86a3a" }, { x: 0.1, y: -0.85, w: 0.5, h: 0.12, c: "#f0e0d0" }];
    const earthSpots = [{ x: 0.2, y: -0.2, w: 0.3, h: 0.2, c: "#3aa04a" }, { x: 0.7, y: 0.3, w: 0.35, h: 0.18, c: "#4ab05a" }, { x: 0.5, y: -0.5, w: 0.5, h: 0.08, c: "#fff" }, { x: 0.1, y: 0.5, w: 0.4, h: 0.07, c: "#fff" }];
    g.fillStyle = "#05060c"; g.fillRect(0, 0, VW, VH);

    switch (this.shot) {
      case "title": {
        stars(2);
        planet(VW / 2, VH + 150, 230, "#c0582c", "rgba(30,5,0,0.85)", marsSpots, t * 0.01);
        // little base on the horizon
        const bx = VW / 2, by = VH - 72;
        g.fillStyle = "rgba(120,255,160,0.25)"; g.beginPath(); g.arc(bx, by, 14, Math.PI, 0); g.fill(); R(bx - 16, by, 32, 3, "#59627c"); R(bx + 18, by - 3, 10, 4, "#2a4aa0"); R(bx - 28, by - 3, 10, 4, "#2a4aa0");
        if ((t * 2 | 0) % 2) R(bx - 1, by - 18, 2, 2, "#ff4040");
        break;
      }
      case "argue": {
        const flash = Math.sin(lt * 7) > 0;
        g.fillStyle = flash ? "#3a0a10" : "#1a0408"; g.fillRect(0, 0, VW, VH);
        for (let i = 0; i < 6; i++) R(i * 70 + ((lt * 10) % 70), 20, 30, 120, "rgba(255,40,40,0.05)");
        const shake = lt < 3.2 ? (Math.random() - 0.5) * 3 : 0;
        const talkL = lt < 3.2 && (lt * 6 | 0) % 2 === 0, talkR = lt < 3.2 && (lt * 5 | 0) % 2 === 1;
        g.save(); g.imageSmoothingEnabled = false;
        g.drawImage(getPortrait("lead", false, talkL, 1), 40 + shake, 20, 126, 126);
        g.translate(VW - 40 + shake, 20); g.scale(-1, 1); g.drawImage(getPortrait("marcus", false, talkR, 1), 0, 0, 126, 126);
        g.restore();
        R(0, VH - 70, VW, 70, "#0a0206");
        if (lt > 3.2) { g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, 0, VW, VH); }
        break;
      }
      case "launch": {
        if (lt < 6) {
          const sky = g.createLinearGradient(0, 0, 0, VH); sky.addColorStop(0, "#0a1a40"); sky.addColorStop(1, "#ff9a5a"); g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
          stars(0);
          R(0, VH - 30, VW, 30, "#2a3a2a"); R(0, VH - 30, VW, 2, "#3a5a3a");
          R(VW / 2 + 16, VH - 120, 6, 90, "#5a5a6a"); for (let i = 0; i < 9; i++) R(VW / 2 + 10, VH - 115 + i * 10, 12, 1, "#5a5a6a");
          const ry = VH - 100 - Math.max(0, lt - 1.2) ** 2.2 * 22;
          // smoke + flame
          if (lt > 0.6) for (let i = 0; i < 4; i++) this.parts.push({ x: VW / 2 + (Math.random() - 0.5) * 10, y: ry + 70, vx: (Math.random() - 0.5) * 60, vy: 10 + Math.random() * 30, l: 1.5, c: Math.random() < 0.5 ? "#ddd" : "#aaa", s: 3 + Math.random() * 4 });
          for (const p of this.parts) { p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.s += dt * 6; g.globalAlpha = Math.max(0, p.l / 1.5) * 0.7; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); }
          g.globalAlpha = 1; this.parts = this.parts.filter((p) => p.l > 0);
          // rocket
          const rx = VW / 2 - 6;
          R(rx, ry, 12, 56, "#eef2f7"); R(rx + 8, ry, 4, 56, "#c3cbd8"); R(rx + 2, ry - 10, 8, 10, "#eef2f7"); R(rx + 4, ry - 14, 4, 4, "#e04848"); R(rx - 5, ry + 40, 5, 16, "#e04848"); R(rx + 12, ry + 40, 5, 16, "#a82c34"); R(rx + 3, ry + 14, 6, 6, "#3a6a9a"); R(rx, ry + 30, 12, 2, "#e04848");
          if (lt > 0.6) { const fl = 14 + Math.random() * 10; R(rx + 2, ry + 56, 8, fl, "#ffd040"); R(rx + 4, ry + 56, 4, fl + 6, "#fff3b0"); }
          if (lt > 0.4 && lt < 0.5 && !this._rumbled) { this._rumbled = 1; Sound.play("rumble", 5); }
        } else {
          stars(30);
          const k = Math.min(1, (lt - 6) / 7);
          planet(80 - k * 30, 120 + k * 20, 70 * (1 - k * 0.85) + 4, "#2a6ad0", "rgba(0,0,30,0.8)", earthSpots, t * 0.05);
          const sx = 200 + Math.sin(lt) * 6 + k * 40, sy = 100 + Math.cos(lt * 0.7) * 4;
          R(sx, sy, 34, 10, "#eef2f7"); R(sx + 34, sy + 2, 6, 6, "#c3cbd8"); R(sx + 8, sy - 8, 4, 26, "#2a4aa0"); R(sx + 20, sy - 8, 4, 26, "#2a4aa0"); R(sx + 4, sy + 3, 4, 3, "#6fd3ff"); R(sx - 6, sy + 3, 6, 4, `rgba(120,200,255,${0.5 + Math.random() * 0.5})`);
        }
        break;
      }
      case "mars": {
        if (lt < 5) {
          stars(10);
          const k = Math.min(1, lt / 5);
          planet(VW / 2 + 40, VH / 2, 20 + k * 140, "#c0582c", "rgba(30,5,0,0.85)", marsSpots, t * 0.02);
          R(60 + k * 20, 120 - k * 10, 20, 6, "#eef2f7"); R(56 + k * 20, 121 - k * 10, 4, 4, `rgba(120,200,255,0.8)`);
        } else {
          const sky = g.createLinearGradient(0, 0, 0, VH * 0.6); sky.addColorStop(0, "#d79a6a"); sky.addColorStop(1, "#f0c090"); g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
          // distant storm
          g.fillStyle = "rgba(140,70,30,0.55)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(VW - 40 - i * 18 + Math.sin(lt + i) * 3, 112 - i * 3, 40, 22 + i * 2, 0, 0, 7); g.fill(); }
          // hills
          g.fillStyle = "#a8562e"; g.beginPath(); g.moveTo(0, 125); for (let x = 0; x <= VW; x += 16) g.lineTo(x, 120 - Math.sin(x * 0.03) * 8 - Math.sin(x * 0.011) * 10); g.lineTo(VW, VH); g.lineTo(0, VH); g.fill();
          R(0, 140, VW, VH - 140, "#c0622f"); for (let i = 0; i < 40; i++) R(hash(i, 1) * VW, 140 + hash(i, 2) * 76, 2, 1, "#a04a22");
          // base
          const bx = 90, by = 150;
          g.fillStyle = "rgba(150,255,170,0.55)"; g.beginPath(); g.arc(bx, by, 26, Math.PI, 0); g.fill(); g.strokeStyle = "#dfe8f5"; g.stroke();
          for (let i = 0; i < 4; i++) R(bx - 20 + i * 10, by - 14, 2, 12, "#2a8a3a");
          R(bx - 30, by, 60, 8, "#59627c"); R(bx + 34, by - 12, 30, 14, "#8892ad"); R(bx + 40, by - 8, 6, 6, "#6fd3ff");
          for (let i = 0; i < 3; i++) { R(bx - 70 + i * 16, by - 4, 12, 6, "#2a4aa0"); R(bx - 65 + i * 16, by + 2, 2, 6, "#5a6070"); }
          // astronauts hopping toward base
          const cols = ["lead_h", "marcus_h", "diego_h", "layla_h"];
          for (let i = 0; i < 4; i++) {
            const x = VW - 30 - (lt - 5) * 22 - i * 22; const hop = Math.abs(Math.sin((lt - 5) * 4 + i)) * 10;
            const set = CharSprites[cols[i]]; const img = set.dirs[2][((lt * 6 | 0) + i) % 4][0];
            if (x > bx + 20) g.drawImage(img, Math.round(x), Math.round(178 - hop), 18 * 1.5, 27 * 1.5);
            g.fillStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.ellipse(x + 13, 218, 8 - hop * 0.3, 2, 0, 0, 7); g.fill();
          }
        }
        break;
      }
      case "black": break;
      case "chapterEnd": {
        stars(1);
        planet(VW - 60, 60, 30, "#c0582c", "rgba(30,5,0,0.85)", marsSpots, t * 0.02);
        break;
      }
    }
  },

  // ------------------------------------------------------------ DOM overlays
  show(name) {
    UI.clear(); this.setShot(name);
    if (name === "title") {
      Game.mode = "title"; $("#hud").classList.add("off");
      const d = el("div"); d.id = "title";
      d.innerHTML = `<h1>${CONFIG.GAME_TITLE}</h1><h2>${CONFIG.SUBTITLE.toUpperCase()}</h2>
        <button class="btn go" id="tStart">▶ Start Mission</button>
        <div><button class="btn alt" id="tSet">⚙️ Settings</button><button class="btn alt" id="tSrc">🛰️ NASA Data</button></div>
        <small>🔊 Best with sound · A game about the real trade-offs of living on Mars · NASA Space Apps Challenge 2026<br>Uses live space-weather data from NASA DONKI</small>`;
      UI.root.appendChild(d);
      d.querySelector("#tStart").onclick = () => { Sound.init(); Sound.play("success"); this.startIntro(); };
      d.querySelector("#tSet").onclick = () => { Sound.init(); UI.settings(); };
      d.querySelector("#tSrc").onclick = () => { Sound.init(); UI.credits(); };
      const startMusic = () => { Sound.init(); Sound.setMood("title"); window.removeEventListener("pointerdown", startMusic); window.removeEventListener("keydown", startMusic); };
      window.addEventListener("pointerdown", startMusic); window.addEventListener("keydown", startMusic);
      Sound.setMood("title");
    }
    if (name === "chapterEnd") {
      Game.mode = "title"; $("#hud").classList.add("off"); Sound.stopLoop("hum");
      const d = el("div"); d.id = "title";
      d.innerHTML = `<h2 style="margin-bottom:.4em">END OF ${STORY.chapterTitle.toUpperCase()}</h2><h1 style="font-size:2.2em">${STORY.nextChapter.replace("{marcus}", CONFIG.NAMES.marcus)}</h1><p style="max-width:28em;font-size:.9em;opacity:.85;margin:1em 0 1.4em">Every choice you made changed the crew. Play again and try different decisions — or explore the base to find all ${Object.keys(FACTS).length} NASA discoveries.</p>
        <div><button class="btn go" id="eAgain">↻ Play again</button><button class="btn alt" id="eJ">📖 Journal (${G.discovered.size}/${Object.keys(FACTS).length})</button><button class="btn alt" id="eSrc">🛰️ NASA Data & Credits</button></div>`;
      UI.root.appendChild(d);
      d.querySelector("#eAgain").onclick = async () => { await UI.fade(true); UI.clear(); Story.start(); };
      d.querySelector("#eJ").onclick = () => UI.journal();
      d.querySelector("#eSrc").onclick = () => UI.credits();
    }
  },

};
