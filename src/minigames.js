// =====================================================================
//  MINI-GAMES — Garden Check, Clean the Panels, Share the Power,
//  Restart Rosie, and the flip cards.
// =====================================================================
function miniPortrait(id, mood = "calm") { const c = mkCanvas(42, 42); const g = c.getContext("2d"); g.drawImage(moodPortrait(id, false, false, mood), 0, 0); drawEmote(g, mood, 0.1); c.style.background = shade(CHAR_SPECS[id].stripe, 0.4); c.style.borderRadius = ".3em"; return c; }
function mgSay(box, id, text) { box.innerHTML = ""; box.appendChild(miniPortrait(id, inferMood(id, text))); box.appendChild(el("span", "", fill(text))); box.animate([{ transform: "scale(1.04)" }, { transform: "scale(1)" }], { duration: 250 }); }

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
      UI.toast(`☀️ Clean as many panels as you can — <b>${B.time - B.tripAt} seconds!</b> Panels are joined in pairs — one job cleans two!`, 3500);
      const ids = [];
      for (let k = 0; k < 3; k++) {
        const a = propById["panel" + k * 2], b = propById["panel" + (k * 2 + 1)]; const id = "scrub" + k; ids.push(id);
        const job = PANEL_JOBS[k];
        Game.addInteract({ id, x: (a.x + b.x + b.pw) / 2, y: a.y + a.ph + 8, r: 34, label: job === "brush" ? "Brush" : job === "pebbles" ? "Clear rocks" : "Tilt", name: `Panels ${k * 2 + 1} + ${k * 2 + 2}`, marker: () => "!", use: async () => {
          if (tripped || G.panels[k * 2] === 0) return;
          const res = await Minigames.panelJob(k, () => Math.max(0, time - B.tripAt));
          if (res && res.ok && !tripped) {
            G.panels[k * 2] = 0; G.panels[k * 2 + 1] = 0; cleaned += 2; Sound.play("good"); Particles.sparkle(a.x + 24, a.y + 8); Particles.sparkle(b.x + 24, b.y + 8); Game.removeInteract(id);
            UI.toast(`✨ Panels ${k * 2 + 1} + ${k * 2 + 2} clean! ${cleaned}/6`);
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


  // ------------------------------------------------------------ restart rosie (wires)

};
