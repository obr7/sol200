// =====================================================================
//  SUIT BRIEFING CARDS — one big "legendary" card with two faces.
//  Face 1: why astronauts wear spacesuits. Click → it flips with a burst of
//  gold, the screen shakes, and Face 2 shows a real person: Salam Abu Alhayjaa.
//  Each fact is a small flip card (emoji front, sentence back).
// =====================================================================
// TODO: confirm with Salam — card 2 text and photo need her approval before publishing.
const SUIT_CARDS = {
  front: {
    title: "Why do astronauts wear spacesuits?",
    intro: "A spacesuit is like a tiny spaceship you wear, so every part of the suit has a job:",
    facts: [
      { e: "🛡️", label: "Pressure layers", c: "#4a8aff", text: "<b>Pressure layers</b> hold the air around your body." },
      { e: "🫁", label: "Oxygen tank", c: "#2ec4b6", text: "<b>An oxygen tank</b> gives you air to breathe." },
      { e: "🔥", label: "Heating system", c: "#ff8a3a", text: "<b>A heating system</b> keeps you warm." },
      { e: "🧤", label: "Sealed gloves", c: "#b07adf", text: "<b>Sealed gloves and joints</b> keep the dust out." },
    ],
  },
  back: {
    badge: "REAL PERSON",
    title: "Salam Abu Alhayjaa, from Jordan.",
    intro: "Real engineers build these suits, and Salam is one of them. She is a Jordanian mechanical engineer who:",
    facts: [
      { e: "🛠️", label: "4 spacesuits", c: "#e0a93a", text: "<b>designed four spacesuits</b> over two years," },
      { e: "🚀", label: "A first for Jordan", c: "#2f9e5a", text: "was chosen as the <b>first Jordanian woman astronaut candidate</b> for an advanced space training program in the USA." },
    ],
    outro: "Real people are building the suits for Mars right now.",
    img: "img/salam.jpg",
    source: { name: "Al Jazeera", url: "https://www.ajnet.me/family/2025/6/15/%D8%A3%D9%88%D9%84-%D8%A3%D8%B1%D8%AF%D9%86%D9%8A%D8%A9-%D8%AA%D8%B1%D8%B4%D8%AD-%D9%84%D8%B1%D8%AD%D9%84%D8%A9-%D9%81%D8%B6%D8%A7%D8%A6%D9%8A%D8%A9-%D8%B3%D9%84%D8%A7%D9%85" },
  },
};
const ASSETS = { salamPortrait: SUIT_CARDS.back.img };

const SuitCards = {
  open() {
    const F = SUIT_CARDS.front, B = SUIT_CARDS.back;
    const mini = (f) => `<div class="mini" style="--c:${f.c}"><div class="mIn"><div class="mF"><span class="mE">${f.e}</span><span class="mL">${f.label}</span><span class="mT">tap</span></div><div class="mB">${f.text}</div></div></div>`;
    const html = `<div class="lgWrap"><div class="lgRays"></div>
      <div class="lgScene"><div class="lgCard">
        <div class="lgFace lgFront"><div class="lgNum">1 / 2</div>
          <div class="lgFrontGrid"><div><div class="lgIco">🧑‍🚀</div><h3>SUIT UP · BRIEFING</h3><h1>${F.title}</h1><p>${F.intro}</p>
          <div class="lgHint">✨ Tap each small card to learn what it does <span class="lgCount">(0/4)</span></div>
          <button class="lgFlipBtn">↻ Flip the card</button></div>
          <div class="minis four">${F.facts.map(mini).join("")}</div></div></div>
        <div class="lgFace lgBack"><div class="lgNum">2 / 2</div>
          <div class="lgBackGrid"><div class="lgPhoto"><img src="${ASSETS.salamPortrait}" alt="Salam Abu Alhayjaa" draggable="false"><span class="badge">${B.badge}</span></div>
          <div class="lgText"><h3>${B.badge}</h3><h1>${B.title}</h1><p>${B.intro}</p><div class="minis two">${B.facts.map(mini).join("")}</div><p class="lgOut">${B.outro}</p>
          <div class="src">📚 Source: <a href="${B.source.url}" target="_blank" rel="noopener">${B.source.name}</a></div>
          <button class="btn go lgGo">Suit up! ▶</button></div></div></div>
      </div></div><canvas class="lgFx"></canvas></div>`;
    return UI.card(html, [], {
      cls: "legendCard", noKey: true, onMount: (card, done) => {
        const wrap = card.querySelector(".lgWrap"), lg = card.querySelector(".lgCard"), fx = card.querySelector(".lgFx"), g = fx.getContext("2d");
        const parts = []; let hoverEl = null, flipped = false, alive = true;
        const size = () => { const r = wrap.getBoundingClientRect(); fx.width = r.width; fx.height = r.height; };
        size(); window.addEventListener("resize", size);
        const rel = (el) => { const a = el.getBoundingClientRect(), b = wrap.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
        const spawnEdge = (r, n, big) => { for (let i = 0; i < n; i++) { const s = Math.random() * 2 * (r.w + r.h); let x, y; if (s < r.w) { x = r.x + s; y = r.y; } else if (s < r.w + r.h) { x = r.x + r.w; y = r.y + s - r.w; } else if (s < 2 * r.w + r.h) { x = r.x + s - r.w - r.h; y = r.y + r.h; } else { x = r.x; y = r.y + s - 2 * r.w - r.h; } parts.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: -15 - Math.random() * 30, life: 1, max: 0.8 + Math.random() * 0.8, s: big ? 2 + Math.random() * 2.5 : 1.2 + Math.random() * 1.6, tw: Math.random() * 6 }); } };
        const burst = (cx, cy, n) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 420; parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 1, max: 1 + Math.random() * 1.2, s: 2 + Math.random() * 3.5, tw: Math.random() * 6, drag: 1 }); } };
        card.querySelectorAll(".mini").forEach((m) => {
          m.addEventListener("pointerenter", () => { hoverEl = m; Sound.play("hover"); });
          m.addEventListener("pointerleave", () => { if (hoverEl === m) hoverEl = null; });
          m.addEventListener("click", (e) => { e.stopPropagation(); m.dataset.seen = 1; const fr = card.querySelector(".lgFront"), n = fr.querySelectorAll(".mini[data-seen]").length; const cnt = fr.querySelector(".lgCount"); if (cnt) cnt.textContent = `(${n}/4)`; if (n >= 4 && !fr.classList.contains("ready")) { fr.classList.add("ready"); Sound.play("good"); const r2 = rel(fr.querySelector(".lgFlipBtn")); burst(r2.x + r2.w / 2, r2.y + r2.h / 2, 40); } const inn = m.querySelector(".mIn"); inn.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 160, easing: "ease-in" }).onfinish = () => { m.classList.toggle("open"); inn.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1.06)" }, { transform: "scaleX(1)" }], { duration: 260, easing: "ease-out" }); }; Sound.play("click"); const r = rel(m); burst(r.x + r.w / 2, r.y + r.h / 2, 18); });
        });
        lg.addEventListener("pointerenter", () => { if (!hoverEl) hoverEl = lg; });
        lg.addEventListener("pointermove", () => { if (!hoverEl) hoverEl = lg; });
        lg.addEventListener("pointerleave", () => { if (hoverEl === lg) hoverEl = null; });
        const flip = () => {
          if (flipped) return; flipped = true; hoverEl = null;
          lg.classList.add("flipped"); wrap.classList.add("reveal");
          Sound.play("success"); Sound.play("power"); setTimeout(() => Sound.play("good"), 450);
          Cam.shake = 0.5;
          wrap.animate([{ transform: "translate(0,0)" }, { transform: "translate(-9px,5px)" }, { transform: "translate(8px,-6px)" }, { transform: "translate(-6px,-4px)" }, { transform: "translate(5px,6px)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(0,0)" }], { duration: 520, easing: "ease-out" });
          const r = rel(lg); setTimeout(() => burst(r.x + r.w / 2, r.y + r.h / 2, 160), 280);
        };
        lg.addEventListener("click", (e) => { if (e.target.closest(".mini, a, .lgGo")) return; flip(); });
        card.querySelector(".lgFlipBtn").addEventListener("pointerenter", () => { hoverEl = lg; });
        card.querySelector(".lgGo").addEventListener("click", (e) => { e.stopPropagation(); Sound.play("click"); alive = false; window.removeEventListener("resize", size); done("ok"); });
        // keyboard: Space/Enter flips, then continues
        UI.active.onAction = () => { if (!flipped) flip(); else card.querySelector(".lgGo").click(); };
        let last = performance.now();
        const loop = (now) => {
          if (!alive || !document.body.contains(fx)) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          if (hoverEl) spawnEdge(rel(hoverEl), hoverEl === lg ? 2 : 1, hoverEl === lg);
          g.clearRect(0, 0, fx.width, fx.height); g.globalCompositeOperation = "lighter";
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i]; p.life -= dt / p.max; if (p.life <= 0) { parts.splice(i, 1); continue; }
            if (p.drag) { p.vx *= Math.pow(0.15, dt); p.vy = p.vy * Math.pow(0.15, dt) + 40 * dt; }
            p.x += p.vx * dt; p.y += p.vy * dt; p.tw += dt * 10;
            const a = p.life * (0.6 + Math.sin(p.tw) * 0.4), s = p.s;
            g.fillStyle = `rgba(255,${200 + ((p.tw * 7) % 50) | 0},${90 + ((p.tw * 13) % 60) | 0},${a})`;
            g.beginPath(); g.arc(p.x, p.y, s, 0, 7); g.fill();
            if (s > 2.5) { g.fillStyle = `rgba(255,240,190,${a * 0.5})`; g.fillRect(p.x - s * 2, p.y - 0.5, s * 4, 1); g.fillRect(p.x - 0.5, p.y - s * 2, 1, s * 4); }
          }
          g.globalCompositeOperation = "source-over";
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },
    });
  },
};
