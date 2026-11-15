// =====================================================================
//  CREW PHOTO ALBUM — a stack of photos in 3D. Drag left/right (or use
//  the arrows) to send the front photo to the back and bring up the next.
// =====================================================================
const ALBUM = [
  { img: "img/crew/1.jpg", title: "Training Base, Earth", date: "3 years ago", note: () => `A selfie in the training hangar. Everyone is laughing... except ${CONFIG.NAMES.marcus}, with his arms crossed.<br><i>Written on the back: <b>"Commander ${CONFIG.NAMES.lead} — he saved the training!"</b></i>` },
  { img: "img/crew/2.jpg", title: "Desert field training", date: "Earth", note: () => `Learning to read rocks and maps in a Mars-like desert. ${CONFIG.NAMES.marcus} checks the compass while everyone else jokes around.` },
  { img: "img/crew/3.jpg", title: "Flight simulator", date: "Earth", note: () => `${CONFIG.NAMES.marcus} reads the checklist step by step. ${CONFIG.NAMES.lead} just grabs the controls.` },
  { img: "img/crew/4.jpg", title: "Greenhouse training", date: "Earth", note: () => `Learning to grow lettuce for space. This is where ${CONFIG.NAMES.layla} first said: "One day, the first food on Mars."` },
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
          const d = el("div", "photo real"); const im = new Image(); im.src = ph.img; im.className = "pimg"; im.draggable = false; im.alt = ph.title;
          d.appendChild(im); d.appendChild(el("div", "pcap", `${ph.title}<span>${ph.date}</span>`)); album.appendChild(d);
          return { d, ph, tilt: [-3, 2.5, -1.5, 3][i % 4] };
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

// =====================================================================
//  MARS WINDOW — look out of the quarters window at a real NASA photo of
//  Mars, shown in chunky pixels to match the game's art.
// =====================================================================
const MARS_VIEW = { id: "PIA20843", title: "Butte M9a, Murray Buttes", rover: "Curiosity rover", date: "Aug 2016", credit: "NASA/JPL-Caltech/MSSS",
  text: "A real view of Mars taken by NASA's Curiosity rover on the slopes of Mount Sharp. The flat-topped hill is about 5 m tall — its layers are old sand dunes turned to rock." };
const MarsWindow = {
  open() {
    G.flags.window = true;
    const v = MARS_VIEW, url = `https://images-assets.nasa.gov/image/${v.id}/${v.id}~medium.jpg`;
    const html = `<div class="mwWin"><canvas class="mwPix" width="200" height="100"></canvas><div class="mwBar"></div><div class="mwGlare"></div></div>
      <div class="mwCap"><b>${v.title}</b> · ${v.rover} · ${v.date}<br>${v.text}<div class="src">📚 Real NASA photo: <a href="https://images.nasa.gov/details/${v.id}" target="_blank" rel="noopener">NASA Image and Video Library — ${v.id}</a> <i>(${v.credit})</i></div></div>`;
    Sound.play("whoosh");
    return UI.card(html, [{ id: "ok", label: "Step back", cls: "go" }], {
      cls: "dark wide mwCard", closable: true, onMount: (card) => {
        const cv = card.querySelector(".mwPix"), g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
        const W = 200, H = 100, small = mkCanvas(W, H), sg = small.getContext("2d");
        let ready = false;
        // fallback: painted pixel Mars until the photo arrives (or if offline)
        const paint = () => { const gr = sg.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#c8743c"); gr.addColorStop(0.55, "#e09a60"); gr.addColorStop(0.56, "#b86a3a"); gr.addColorStop(1, "#8a4426"); sg.fillStyle = gr; sg.fillRect(0, 0, W, H); sg.fillStyle = "#7a3a20"; for (let i = 0; i < 12; i++) sg.fillRect((i * 37) % W, 70 + (i * 13) % 25, 6 + (i % 3) * 4, 3 + (i % 2) * 2); };
        paint();
        const im = new Image(); // no CORS needed: we only draw the photo, never read its pixels
        im.onload = () => { const r = W / H, ir = im.width / im.height; let sw = im.width, sh = im.height, sx = 0, sy = 0; if (ir > r) { sw = im.height * r; sx = (im.width - sw) / 2; } else { sh = im.width / r; sy = (im.height - sh) / 2; } sg.imageSmoothingEnabled = true; sg.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); ready = true; };
        im.onerror = () => { card.querySelector(".mwCap").insertAdjacentHTML("afterbegin", "<i>Can't reach NASA right now — showing a painted view.</i><br>"); };
        im.src = url;
        const dust = Array.from({ length: 26 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, v: 6 + Math.random() * 14, s: Math.random() < 0.3 ? 2 : 1 }));
        let last = performance.now();
        const loop = (now) => {
          if (!document.body.contains(cv)) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
          g.drawImage(small, Math.sin(t * 0.2) * 1.5 - 2, 0, W + 4, H); // tiny drift, like breathing on the glass
          if ((G.storm || 0) > 0) { g.fillStyle = `rgba(150,75,35,${0.2 + G.storm * 0.5})`; g.fillRect(0, 0, W, H); }
          g.fillStyle = "rgba(255,210,170,0.55)"; for (const d of dust) { d.x += d.v * dt; d.y += Math.sin(t + d.x) * 0.05; if (d.x > W) { d.x = -2; d.y = Math.random() * H; } g.fillRect(d.x | 0, d.y | 0, d.s, 1); }
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },
    });
  },
};
