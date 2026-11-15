// =====================================================================
//  CREW PHOTO ALBUM — a stack of photos in 3D. Drag left/right (or use
//  the arrows) to send the front photo to the back and bring up the next.
// =====================================================================
const ALBUM = [
  { id: "training", title: "Training Base, Earth", date: "3 years ago", faces: [["marcus", "angry"], ["lead", "happy"], ["diego", "worried"], ["layla", "worried"]],
    note: () => `Everyone is smiling for the camera... except ${CONFIG.NAMES.marcus}. And ${CONFIG.NAMES.diego} and ${CONFIG.NAMES.layla} won't look at ${CONFIG.NAMES.lead}.<br><i>Written on the back: <b>"Commander ${CONFIG.NAMES.lead} — he saved the training!"</b></i>` },
  { id: "launch", title: "Launch Day", date: "Earth", faces: [["layla", "happy"], ["lead", "happy"], ["diego", "happy"], ["marcus", "calm"]], note: () => "The rocket that carried the crew to Mars. Seven months in space!" },
  { id: "sol1", title: "Sol 1 — We made it!", date: "Mars", faces: [["diego", "happy"], ["lead", "happy"], ["layla", "happy"], ["marcus", "happy"]], note: () => "The first photo on Mars, in front of the new base. Even Marcus is smiling." },
  { id: "rosie", title: "Rosie's first breath", date: "Sol 12", faces: [["diego", "happy"]], note: () => `${CONFIG.NAMES.diego} and Rosie, the day she made her first oxygen. He gave her a party hat.` },
  { id: "dinner", title: "Team dinner", date: "Sol 100", faces: [["layla", "happy"], ["diego", "happy"], ["marcus", "calm"], ["lead", "happy"]], note: () => "Space food for 100 sols! Diego told jokes all night." },
  { id: "hope", title: "Hope sprouts", date: "Sol 190", faces: [["layla", "happy"]], note: () => `${CONFIG.NAMES.layla} with Hope, the first sprout. "If it grows, it will be the first food grown on Mars."` },
];
function drawAlbumPhoto(ph) {
  const W = 160, H = 112, c = mkCanvas(W, H), g = c.getContext("2d"); g.imageSmoothingEnabled = false;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const sky = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
  switch (ph.id) {
    case "training": sky("#8ec8f0", "#e8d0a0"); P(0, 70, W, 42, "#d8b070"); P(10, 52, 36, 18, "#e8e8e8"); g.fillStyle = "#e8e8e8"; g.beginPath(); g.arc(28, 52, 18, Math.PI, 0); g.fill(); P(120, 58, 4, 14, "#5a8a40"); P(116, 62, 4, 3, "#5a8a40"); P(124, 60, 4, 3, "#5a8a40"); P(130, 20, 8, 8, "#fff6c0"); break;
    case "launch": sky("#0b1030", "#2a2050"); for (let i = 0; i < 30; i++) P((i * 53) % W, (i * 31) % 60, 1, 1, "#fff"); P(70, 10, 20, 60, "#e8e8f0"); g.fillStyle = "#c83a2a"; g.beginPath(); g.moveTo(70, 10); g.lineTo(80, -6); g.lineTo(90, 10); g.fill(); P(66, 60, 6, 12, "#c83a2a"); P(88, 60, 6, 12, "#c83a2a"); P(72, 72, 16, 10, "#ffb040"); P(75, 82, 10, 8, "#ffe080"); P(0, 92, W, 20, "#3a3a4a"); break;
    case "sol1": sky("#e8a070", "#c86a3a"); P(0, 74, W, 38, "#a8502a"); g.fillStyle = "#d8dce6"; g.beginPath(); g.arc(120, 74, 26, Math.PI, 0); g.fill(); P(108, 64, 24, 3, "#8ac0e8"); P(30, 60, 10, 6, "#7a3a20"); break;
    case "rosie": sky("#3a3040", "#2a2430"); P(0, 84, W, 28, "#4a3a30"); P(90, 30, 46, 56, "#8892ad"); P(94, 36, 38, 22, "#22263a"); P(98, 40, 30, 3, "#5dff8a"); P(98, 46, 20, 3, "#5dff8a"); g.fillStyle = "#ff5aa0"; g.beginPath(); g.moveTo(104, 30); g.lineTo(113, 12); g.lineTo(122, 30); g.fill(); P(112, 10, 3, 3, "#ffd34a"); for (let i = 0; i < 10; i++) P(8 + i * 15, 8 + (i % 3) * 5, 3, 3, ["#ff5a5a", "#5dff8a", "#ffd34a", "#7fd0ff"][i % 4]); break;
    case "dinner": sky("#2a3048", "#1a1e30"); P(0, 86, W, 26, "#5a4a3a"); P(10, 78, 140, 8, "#9aa0b0"); for (let i = 0; i < 5; i++) { P(20 + i * 26, 72, 12, 6, "#e8e8e8"); P(22 + i * 26, 73, 8, 3, ["#c86a3a", "#5ad06a", "#ffd34a"][i % 3]); } P(70, 14, 20, 12, "#ffd34a"); g.fillStyle = "#2a1a10"; g.font = "8px monospace"; g.fillText("100", 72, 23); break;
    case "hope": sky("#3a1e50", "#1e1028"); for (let x = 6; x < W; x += 16) P(x, 2, 10, 2, x % 32 ? "#ff5aa0" : "#6a8aff"); P(60, 80, 40, 26, "#7a5a40"); P(62, 80, 36, 4, "#5a3a20"); P(79, 58, 2, 22, "#3a9a4a"); P(70, 60, 9, 4, "#5ad06a"); P(81, 56, 9, 4, "#5ad06a"); P(70, 96, 20, 6, "#fbedcd"); g.fillStyle = "#3a2a10"; g.font = "5px monospace"; g.fillText("HOPE", 73, 101); break;
  }
  // people (portrait busts)
  const n = ph.faces.length, solo = n === 1;
  ph.faces.forEach(([id, mood], i) => {
    const s = solo ? 1 : 0.92, w = 42 * s, x = solo ? (ph.id === "hope" ? 14 : 28) : W / 2 - (n * 34) / 2 + i * 34 - 4, y = H - w - (solo ? 4 : 2) - (i % 2 ? 0 : 4);
    g.drawImage(moodPortrait(id, false, false, mood), x, y, w, w);
  });
  // photo grain + vignette
  g.fillStyle = "rgba(255,240,210,0.08)"; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.7); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
const PhotoAlbum = {
  open() {
    G.flags.photo = true;
    const html = `<div class="head"><div><h3>CREW QUARTERS</h3><h1>📷 Crew Photo Album</h1></div></div>
      <div class="albumStage"><div class="album"></div><button class="albNav prev">◀</button><button class="albNav next">▶</button></div>
      <div class="albDots"></div><div class="albCap"></div><p class="albHint">🖐️ Drag the photo left or right (or use ◀ ▶ keys)</p>`;
    return UI.card(html, [{ id: "ok", label: "Close", cls: "go" }], {
      cls: "dark wide albumCard", closable: true, onMount: (card) => {
        const album = card.querySelector(".album"), cap = card.querySelector(".albCap"), dots = card.querySelector(".albDots");
        const cards = ALBUM.map((ph, i) => {
          const d = el("div", "photo"); const cv = drawAlbumPhoto(ph); cv.className = "pimg";
          d.appendChild(cv); d.appendChild(el("div", "pcap", `${ph.title}<span>${ph.date}</span>`)); album.appendChild(d);
          return { d, ph, tilt: [-3, 2.5, -1.5, 3, -2.5, 1.5][i % 6] };
        });
        let order = cards.map((_, i) => i); // order[0] = front
        const place = (anim = true) => {
          order.forEach((ci, p) => {
            const c = cards[ci], d = c.d; d.style.transition = anim ? "transform .55s cubic-bezier(.2,.8,.2,1), filter .55s" : "none";
            d.style.zIndex = 100 - p;
            d.style.transform = `translate(-50%,-50%) translate3d(${p * 22}px, ${-p * 14}px, ${-p * 70}px) rotateY(-10deg) rotateZ(${p === 0 ? 0 : c.tilt}deg)`;
            d.style.filter = `brightness(${Math.max(0.45, 1 - p * 0.13)})`; d.style.pointerEvents = p === 0 ? "auto" : "none";
          });
          const front = cards[order[0]].ph; cap.innerHTML = `<b>${front.title}</b> · ${front.date}<br>${front.note()}`;
          dots.innerHTML = cards.map((_, i) => `<span class="${i === order[0] ? "on" : ""}"></span>`).join("");
        };
        const next = () => { const f = cards[order[0]].d; Sound.play("whoosh"); f.style.transition = "transform .28s ease-in"; f.style.transform = "translate(-50%,-50%) translate3d(-115%, 10px, 40px) rotateZ(-14deg)"; setTimeout(() => { order.push(order.shift()); place(); }, 260); };
        const prev = () => { const ci = order.pop(); order.unshift(ci); const b = cards[ci].d; Sound.play("whoosh"); b.style.transition = "none"; b.style.zIndex = 200; b.style.transform = "translate(-50%,-50%) translate3d(115%, 10px, 40px) rotateZ(14deg)"; void b.offsetWidth; place(); };
        place(false);
        card.querySelector(".next").onclick = (e) => { e.stopPropagation(); next(); };
        card.querySelector(".prev").onclick = (e) => { e.stopPropagation(); prev(); };
        // drag the front photo
        let drag = null;
        album.addEventListener("pointerdown", (e) => { const f = cards[order[0]].d; if (!f.contains(e.target)) return; drag = { x: e.clientX, f }; try { album.setPointerCapture(e.pointerId); } catch (er) {} f.style.transition = "none"; });
        album.addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x; drag.dx = dx; drag.f.style.transform = `translate(-50%,-50%) translate3d(${dx}px, ${Math.abs(dx) * 0.05}px, 20px) rotateY(-10deg) rotateZ(${dx * 0.04}deg)`; });
        const up = () => { if (!drag) return; const dx = drag.dx || 0; drag = null; if (dx < -60) next(); else if (dx > 60) { place(); prev(); } else place(); };
        album.addEventListener("pointerup", up); album.addEventListener("pointercancel", up);
        const kd = (e) => { if (!document.body.contains(album)) { window.removeEventListener("keydown", kd); return; } if (e.key === "ArrowLeft") next(); if (e.key === "ArrowRight") prev(); };
        window.addEventListener("keydown", kd);
      },
    });
  },
};
