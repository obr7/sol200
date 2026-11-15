// =====================================================================
//  MINI-GAMES — Garden Check, Clean the Panels, Share the Power,
//  Restart Rosie, and the flip cards.
// =====================================================================
function miniPortrait(id) { const c = mkCanvas(42, 42); c.getContext("2d").drawImage(portraitFor(id, false, false), 0, 0); c.style.background = shade(CHAR_SPECS[id].stripe, 0.4); c.style.borderRadius = ".3em"; return c; }
function mgSay(box, id, text) { box.innerHTML = ""; box.appendChild(miniPortrait(id)); box.appendChild(el("span", "", fill(text))); box.animate([{ transform: "scale(1.04)" }, { transform: "scale(1)" }], { duration: 250 }); }

const Minigames = {
  // ------------------------------------------------------------ flip cards
  flipCards() {
    return new Promise((resolve) => {
      let flipped = new Set();
      const html = `<h3>LAYLA'S GREENHOUSE</h3><h1>Tap a card to flip it!</h1><div class="flipgrid">${STORY.gardenCards.map((c, i) => `<div class="flip" data-i="${i}"><div class="in"><div class="f"><span>${c.i}</span>${c.q}</div><div class="b">${c.a}</div></div></div>`).join("")}</div><div class="src" style="margin-top:.6em">📚 ${UI.srcHtml(["veggie", "csaFarming", "redPlanet"]).replace('<div class="src">', "").replace("</div>", "")}</div>`;
      UI.card(html, [{ id: "ok", label: "Flip all cards first", cls: "go" }], {
        noKey: true, onMount: (c, done) => {
          const btn = c.querySelector(".btn"); btn.disabled = true;
          c.querySelectorAll(".flip").forEach((f) => f.onclick = () => { f.classList.toggle("on"); Sound.play("whoosh"); flipped.add(f.dataset.i); if (flipped.size >= STORY.gardenCards.length) { btn.disabled = false; btn.textContent = "Let's check the plants!"; } });
        },
      }).then(resolve);
    });
  },

  // ------------------------------------------------------------ garden check
  garden() {
    Sound.setMood("task");
    return new Promise((resolve) => {
      const TOOL = { water: "💧 Water", light: "💡 Light", heat: "🔥 Heat" };
      const ICON = { water: "💧", light: "💡", heat: "🌡️" };
      const SAY = { water: "The roots are drinking now. Water is precious here, so we reuse it again and again.", light: "Without light, the plant can't make its food.", heat: "The heater is working. Notice that all of this needs power." };
      let sel = 0;
      const html = `<div class="head"><div><h3>MINI-TASK</h3><h1>Garden Check</h1></div></div><p style="font-size:.85em">Look at the sign above each tray. Pick a tray, then the right tool.</p><div class="trays"></div><div class="tools">${Object.keys(TOOL).map((k) => `<button class="tool" data-k="${k}">${TOOL[k]}</button>`).join("")}</div><div class="say"></div>`;
      UI.card(html, [], {
        cls: "mg", onMount: (c, done) => {
          const tr = c.querySelector(".trays"), say = c.querySelector(".say");
          const draw = () => {
            tr.innerHTML = "";
            [0, 1, 2].forEach((i) => {
              const t = G.trays[i];
              const d = el("div", "trayc" + (i === sel ? " sel" : "") + (t.fixed ? " ok" : ""), `<div class="pi">${t.fixed ? "✅" : ICON[t.problem]}</div><div class="pl">${t.fixed ? "🌿🌿🌿" : "🥀🌿🥀"}</div><div style="font-size:.7em">Tray ${i + 1}</div>`);
              d.onclick = () => { if (!t.fixed) { sel = i; Sound.play("click"); draw(); } };
              tr.appendChild(d);
            });
          };
          mgSay(say, "layla", "Which tray first? Look at the little signs!");
          draw();
          c.querySelectorAll(".tool").forEach((b) => b.onclick = () => {
            const t = G.trays[sel]; if (t.fixed) return;
            if (b.dataset.k === t.problem) {
              t.fixed = true; t.lightOff = false; Sound.play("good"); Particles.sparkle(propById["tray" + (sel + 1)].x + 24, propById["tray" + (sel + 1)].y - 8);
              mgSay(say, "layla", SAY[t.problem]);
              const next = [0, 1, 2].find((i) => !G.trays[i].fixed);
              if (next === undefined) { draw(); Sound.play("success"); setTimeout(() => { done("ok"); Sound.setMood("calm"); resolve(); }, 2600); return; }
              sel = next; draw();
            } else { Sound.play("error"); mgSay(say, "layla", "Not that one. Look at the sign above the tray."); c.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 200 }); }
          });
        },
      });
    });
  },

  // ------------------------------------------------------------ clean the panels (in the world)
  panels() {
    const B = BALANCE.panels;
    return new Promise((resolve) => {
      let time = B.time, cleaned = 0, tripped = false;
      G.panels = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
      UI.objective(`Clean the solar panels! Walk to a panel and press ${document.body.classList.contains("touch") ? "A" : "Space"}`);
      UI.toast(`☀️ Clean as many panels as you can — <b>${B.time - B.tripAt} seconds!</b> Each panel has a different job.`, 3500);
      const ids = [];
      for (let n = 0; n < 6; n++) {
        const p = propById["panel" + n]; const id = "scrub" + n; ids.push(id);
        const job = PANEL_JOBS[n % PANEL_JOBS.length];
        Game.addInteract({ id, x: p.x + p.pw / 2, y: p.y + p.ph + 8, r: 30, label: job === "brush" ? "Brush" : job === "pebbles" ? "Clear rocks" : "Tilt", name: `Panel ${n + 1}`, marker: () => "!", use: async () => {
          if (tripped || G.panels[n] === 0) return;
          const res = await Minigames.panelJob(n, () => Math.max(0, time - B.tripAt));
          if (res && res.ok && !tripped) {
            G.panels[n] = 0; cleaned++; Sound.play("good"); Particles.sparkle(p.x + 24, p.y + 8); Game.removeInteract(id);
            UI.toast(`✨ Panel ${n + 1} done! ${cleaned}/6`);
            if (cleaned === 6) time = Math.min(time, B.tripAt + 0.01);
          }
        } });
      }
      Game.setTarget(null);
      const N = Game.npc;
      Story.panelsMission = (dt) => {
        if (tripped) return;
        if (UI.busy() && !Minigames.cancelCurrent) return; // dialogue pauses the clock, panel jobs don't
        time -= dt; UI.timer(Math.max(0, time - B.tripAt), time < B.tripAt + 8);
        G.storm = 0.3 + (1 - time / B.time) * 0.6;
        if (Math.random() < dt * 0.6) Cam.shake = 0.15;
        if (time <= B.tripAt) {
          tripped = true; Story.panelsMission = null; UI.timer(null);
          (async () => {
            if (Minigames.cancelCurrent) { Minigames.cancelCurrent(); await sleep(350); }
            N.diego.follow = null; Sound.play("thud"); Cam.shake = 0.5; N.diego.hurt = true; Particles.dust(N.diego.x, N.diego.y, 14);
            await UI.say("diego", "Ow! I tripped! My glove is torn!");
            await UI.say("lead", "Back inside! Now!");
            ids.forEach((i) => Game.removeInteract(i));
            resolve({ cleaned, good: cleaned >= B.good });
          })();
        }
      };
      // early warning line (a toast if a panel job is open)
      setTimeout(() => { if (tripped) return; if (Minigames.cancelCurrent || UI.busy()) UI.toast("🧑‍🔧 Diego: Faster, Commander! I can barely see anything!", 3000); else UI.say("diego", "Faster, {lead}! I can barely see anything!"); }, Math.max(8, (B.time - B.tripAt) * 0.55) * 1000);
    });
  },

  // ------------------------------------------------------------ share the power
  power() {
    Sound.setMood("task");
    const B = BALANCE.power;
    const DEV = [
      { k: "oxygen", n: "Oxygen Machine", i: "🫧", need: 2, eff: { safety: -20 }, msg: "No oxygen! Safety −20" },
      { k: "crew", n: "Crew Heaters", i: "🔥", need: 2, eff: { safety: -10 }, msg: "Crew is freezing! Safety −10" },
      { k: "gheat", n: "Garden Heaters", i: "🌡️", need: 2, eff: { mission: -15 }, msg: "Plants freeze! Mission −15" },
      { k: "glight", n: "Garden Lights", i: "💡", need: 1, eff: { mission: -5 }, msg: "Plants in the dark. Mission −5" },
      { k: "radio", n: "Radio to Earth", i: "📡", need: 2, eff: {}, msg: "Earth can't hear us (no effect now)" },
    ];
    return new Promise((resolve) => {
      const alloc = DEV.map(() => 0);
      let time = B.time, ended = false, iv;
      const html = `<div class="head"><div><h3>MINI-TASK</h3><h1>Share the Power</h1></div><div class="tmr">⏱ <span class="t">${B.time}</span></div></div>
        <div class="pool">Power units left: <span class="slots"></span></div>
        <div class="power"></div><div class="say"></div><div class="btnrow"><button class="btn go lock">Lock in power ⚡</button></div>`;
      UI.card(html, [], {
        cls: "mg wide", onMount: (c, done) => {
          const pw = c.querySelector(".power"), pool = c.querySelector(".pool .slots"), say = c.querySelector(".say"), tEl = c.querySelector(".t");
          mgSay(say, "marcus", "We only have 6 units, and the machines need 9. We can't run everything. Think: what matters most?");
          const left = () => B.units - alloc.reduce((a, b) => a + b, 0);
          const draw = () => {
            pool.innerHTML = Array.from({ length: B.units }, (_, i) => `<div class="slot ${i < left() ? "on" : ""}" style="display:inline-block"></div>`).join("");
            pw.innerHTML = "";
            DEV.forEach((d, i) => {
              const full = alloc[i] >= d.need;
              const e = el("div", "dev" + (full ? " full" : ""), `<div class="di">${d.i}</div><div class="dn">${d.n}</div><div class="slots">${Array.from({ length: d.need }, (_, j) => `<div class="slot ${j < alloc[i] ? "on" : ""}"></div>`).join("")}</div><div class="eff">${full ? "✅ ON" : "needs " + d.need}</div>`);
              e.onclick = () => {
                if (ended) return;
                if (alloc[i] < d.need && left() > 0) { alloc[i]++; Sound.play("wire"); }
                else if (alloc[i] > 0) { alloc[i]--; Sound.play("click"); }
                else { Sound.play("error"); mgSay(say, "marcus", "No power left. Take some from another machine first."); }
                draw();
              };
              pw.appendChild(e);
            });
          };
          draw();
          const finish = (auto) => {
            if (ended) return; ended = true; clearInterval(iv);
            if (auto) { alloc.fill(0); alloc[0] = 2; alloc[1] = 2; alloc[2] = 2; draw(); mgSay(say, "marcus", "No time! I'll do it myself."); Sound.play("error"); }
            const total = { safety: 0, mission: 0, team: 0 }; const lost = [];
            DEV.forEach((d, i) => { if (alloc[i] < d.need) { for (const k in d.eff) total[k] += d.eff[k]; lost.push(d.msg); } });
            Sound.play("power"); G.power = 0.5;
            setTimeout(() => { done("ok"); Sound.setMood("tension"); if (total.safety || total.mission) meter(total, "⚡ " + lost.join(" · ")); else UI.toast("⚡ Power shared!"); resolve({ alloc, total, auto }); }, auto ? 2200 : 900);
          };
          c.querySelector(".lock").onclick = () => { if (left() > 0) { mgSay(say, "marcus", "We still have power left. Use every unit!"); Sound.play("error"); return; } finish(false); };
          iv = setInterval(() => { time -= 0.1; tEl.textContent = Math.ceil(time); if (time <= 0) finish(true); }, 100);
        },
      });
    });
  },

  // ------------------------------------------------------------ restart rosie (wires)
  wires({ time, hints }) {
    Sound.setMood("task");
    const W = [
      { c: "#ff4a4a", n: "Power", i: "⚡", hint: "Red first: power. Without it, nothing works." },
      { c: "#4a8aff", n: "Fan", i: "🌀", hint: "Blue second: the fan pulls Mars air inside." },
      { c: "#ffd040", n: "Filter", i: "🧹", hint: "Yellow third: the filter keeps the dust out." },
      { c: "#5dd06a", n: "Start", i: "▶️", hint: "And green last: start!" },
    ];
    return new Promise((resolve) => {
      const leftOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5), rightOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      let next = 0, tLeft = time, ended = false, iv;
      const html = `<div class="head"><div><h3>MINI-TASK</h3><h1>Restart Rosie</h1></div><div class="tmr">${time ? `⏱ <span class="t">${time}</span>` : "No timer — take your time"}</div></div>
        <div style="font-size:.75em">🫧 Oxygen</div><div class="o2bar"><div style="width:100%"></div></div>
        <p style="font-size:.8em;margin:.3em 0">Drag each wire to the plug with the same color. The ORDER matters!</p>
        <div class="wires"><svg></svg></div><div class="say"></div>`;
      UI.card(html, [], {
        cls: "mg", onMount: (c, done) => {
          const box = c.querySelector(".wires"), svg = c.querySelector("svg"), say = c.querySelector(".say"), o2 = c.querySelector(".o2bar div"), tEl = c.querySelector(".t");
          const showHint = () => { if (hints && next < 4) mgSay(say, "marcus", W[next].hint); else if (!hints) mgSay(say, "diego", next === 0 ? "I don't know the right order... think about it, Commander!" : "Keep going!"); };
          showHint();
          const L = [], Rr = [];
          leftOrder.forEach((wi, row) => { const e = el("div", "wend", "●"); e.style.left = "4%"; e.style.top = (14 + row * 24) + "%"; e.style.background = W[wi].c; box.appendChild(e); L[wi] = e; e.dataset.w = wi; });
          rightOrder.forEach((wi, row) => { const e = el("div", "wend right", W[wi].i); e.style.right = "4%"; e.style.top = (14 + row * 24) + "%"; e.style.background = W[wi].c; e.title = W[wi].n; box.appendChild(e); Rr[wi] = e; e.insertAdjacentHTML("beforeend", `<span style="position:absolute;right:110%;font-size:.65em;color:#fff;white-space:nowrap">${W[wi].n}</span>`); });
          const center = (e) => { const b = box.getBoundingClientRect(), r = e.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }; };
          const line = (a, b, col, id) => { let p = svg.querySelector("#" + id); if (!p) { p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.id = id; svg.appendChild(p); } const mx = (a.x + b.x) / 2; p.setAttribute("d", `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`); p.setAttribute("stroke", col); p.setAttribute("stroke-width", 10); p.setAttribute("fill", "none"); p.setAttribute("stroke-linecap", "round"); return p; };
          let drag = null;
          box.addEventListener("pointerdown", (e) => {
            const t = e.target.closest(".wend:not(.right)"); if (!t || ended) return;
            const wi = +t.dataset.w; if (t.dataset.done) return;
            drag = { wi, start: center(t) }; try { box.setPointerCapture(e.pointerId); } catch (er) {} Sound.play("click");
          });
          box.addEventListener("pointermove", (e) => { if (!drag) return; const b = box.getBoundingClientRect(); line(drag.start, { x: e.clientX - b.left, y: e.clientY - b.top }, W[drag.wi].c, "drag"); });
          const up = (e) => {
            if (!drag) return; const d = drag; drag = null; const dl = svg.querySelector("#drag"); if (dl) dl.remove();
            const b = box.getBoundingClientRect(); const pt = { x: e.clientX - b.left, y: e.clientY - b.top };
            let hit = null; for (let i = 0; i < 4; i++) { const cc = center(Rr[i]); if (Math.hypot(cc.x - pt.x, cc.y - pt.y) < 40) hit = i; }
            if (hit === null) return;
            if (hit === d.wi && d.wi === next) {
              line(d.start, center(Rr[hit]), W[d.wi].c, "w" + d.wi); L[d.wi].dataset.done = 1; L[d.wi].style.opacity = 0.6; Sound.play("wire"); next++;
              if (next >= 4) { ended = true; clearInterval(iv); Sound.play("success"); mgSay(say, "diego", "I can hear Rosie! She's working!"); setTimeout(() => { done("ok"); Sound.setMood("tension"); resolve(true); }, 1600); return; }
              showHint();
            } else {
              Sound.play("zap"); box.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 200 });
              if (time) { tLeft -= BALANCE.rosie.wrongPenalty; mgSay(say, hints ? "marcus" : "diego", hit !== d.wi ? "Wrong plug! Match the colors. (−5 seconds)" : "Wrong order! The wire jumped back. (−5 seconds)"); }
              else mgSay(say, "marcus", hit !== d.wi ? "Match the colors." : "Not yet — " + W[next].hint);
            }
          };
          box.addEventListener("pointerup", up); box.addEventListener("pointercancel", () => { drag = null; const dl = svg.querySelector("#drag"); if (dl) dl.remove(); });
          if (time) iv = setInterval(() => {
            tLeft -= 0.1; if (tEl) tEl.textContent = Math.max(0, Math.ceil(tLeft)); o2.style.width = Math.max(0, tLeft / time * 100) + "%";
            if (tLeft < 10 && ((tLeft * 10) | 0) % 10 === 0) Sound.play("heart");
            if (tLeft <= 0 && !ended) { ended = true; clearInterval(iv); done("x"); resolve(false); }
          }, 100);
        },
      });
    });
  },
};
