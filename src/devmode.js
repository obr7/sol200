// =====================================================================
//  DEVELOPER MODE (Settings → Developer mode). For fast testing:
//  • ⏭ Skip: ends the current dialogue, card, choice or mini-game.
//  • ⏩ Auto-skip dialogue: every line advances by itself.
//  • Jump to any point in the story (with the decisions you pick).
//  • Open any mini-game or card on its own.
//  Shortcut while on: N = skip.
// =====================================================================
const Dev = {
  on: false, auto: false,
  init() {
    try { this.on = localStorage.getItem("sol200_dev") === "1"; } catch (e) {}
    const b = el("button", "", "🛠"); b.id = "devBtn"; b.title = "Developer mode"; b.onclick = (e) => { e.stopPropagation(); this.toggle(); };
    document.body.appendChild(b);
    const p = el("div"); p.id = "devPanel"; p.className = "hidden"; document.body.appendChild(p); this.panel = p; ["pointerdown", "click", "mousedown", "touchstart"].forEach((ev) => p.addEventListener(ev, (e) => e.stopPropagation()));
    this.render(); this.show();
    window.addEventListener("keydown", (e) => { if (this.on && (e.key === "n" || e.key === "N") && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); this.skip(); } });
    setInterval(() => { if (this.on && this.auto) this.skip(true); }, 120);
    // ?jump=<point>&d1=A&d2=B → start right there (used by the Jump buttons)
    const q = new URLSearchParams(location.search);
    if (q.get("jump")) setTimeout(() => this.startAt(q.get("jump"), q.get("d1"), q.get("d2")), 300);
  },
  set(on) { this.on = on; try { localStorage.setItem("sol200_dev", on ? "1" : "0"); } catch (e) {} this.show(); },
  show() { $("#devBtn").style.display = this.on ? "block" : "none"; if (!this.on) this.panel.classList.add("hidden"); },
  toggle() { this.panel.classList.toggle("hidden"); },
  POINTS: [
    ["scene1", "1 · Quarters (start)"], ["marcus", "2 · Marcus (control)"], ["scene2", "3 · Diego (workshop)"], ["scene3", "4 · Layla + Garden"],
    ["scene4", "5 · Storm · decision 1"], ["pathA", "6A · Go outside (suit + panels)"], ["pathB", "6B · Stay inside (power)"],
    ["scene5", "7 · Rosie · decision 2"], ["ending", "8 · Ending + results"],
  ],
  GAMES: [
    ["garden", "Garden Check"], ["brush", "Panels: brush"], ["pebbles", "Panels: pebbles"], ["tilt", "Panels: tilt"], ["cards", "Suit cards"], ["suit", "Suit Up"],
    ["power", "Storm Night (power)"], ["wiresE", "Rosie (easy)"], ["wiresH", "Rosie (hard)"], ["globe", "Mars globe"], ["album", "Photo album"], ["window", "Mars window"],
  ],
  render() {
    const sel = (id, opts) => `<select id="${id}">${opts.map((o) => `<option>${o}</option>`).join("")}</select>`;
    this.panel.innerHTML = `<div class="dvHead">🛠 Developer mode <button class="dvX">✕</button></div>
      <div class="dvRow"><button class="dvB" data-a="skip">⏭ Skip (N)</button><label><input type="checkbox" class="dvAuto"> ⏩ Auto-skip dialogue</label></div>
      <div class="dvRow">Decision 1 ${sel("dvD1", ["A", "B"])} Decision 2 ${sel("dvD2", ["A", "B"])}</div>
      <div class="dvT">Jump to</div><div class="dvGrid">${this.POINTS.map(([k, n]) => `<button class="dvB" data-j="${k}">${n}</button>`).join("")}</div>
      <div class="dvT">Open a mini-game / card</div><div class="dvGrid">${this.GAMES.map(([k, n]) => `<button class="dvB" data-g="${k}">${n}</button>`).join("")}</div>
      <div class="dvRow"><button class="dvB" data-a="meters">Meters 50/50/50</button><button class="dvB" data-a="journal">Unlock journal</button></div>`;
    const P = this.panel;
    P.querySelector(".dvX").onclick = () => this.toggle();
    P.querySelector(".dvAuto").onchange = (e) => { this.auto = e.target.checked; };
    P.querySelectorAll("select").forEach((s) => { s.onkeydown = (e) => e.stopPropagation(); });
    P.querySelectorAll("[data-a]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const a = b.dataset.a; if (a === "skip") this.skip(); if (a === "meters") { G.meters = { ...BALANCE.start }; UI.buildMeters(); } if (a === "journal") { for (const k in FACTS) G.discovered.add(k); UI.toast("📖 All discoveries unlocked"); } }));
    P.querySelectorAll("[data-j]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const u = new URL(location.href); u.searchParams.set("jump", b.dataset.j); u.searchParams.set("d1", P.querySelector("#dvD1").value); u.searchParams.set("d2", P.querySelector("#dvD2").value); location.href = u.toString(); }));
    P.querySelectorAll("[data-g]").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); this.openGame(b.dataset.g); }));
  },
  // finish whatever is on screen right now
  skip(onlyTalk) {
    const a = UI.active;
    if (a && a.type === "say") { a.onAction(); a.onAction && UI.active === a && a.onAction(); return; }
    if (onlyTalk) return;
    if (Minigames.cancelCurrent) { Minigames.cancelCurrent({ ok: true, damage: 0, mistakes: 0, total: {}, lost: [], failed: {}, trips: 0, delay: 0 }); return; }
    if (a && a.type === "choice") { const o = document.querySelector(".choiceBtn"); if (o) o.click(); return; }
    const m = $("#modal");
    if (m) {
      m.querySelectorAll(".flip:not(.on)").forEach((f) => f.click());
      const lg = m.querySelector(".lgCard"); if (lg && !lg.classList.contains("flipped")) { lg.click(); setTimeout(() => m.querySelector(".lgGo")?.click(), 400); return; }
      const go = m.querySelector(".lgGo"); if (go) { go.click(); return; }
      setTimeout(() => { const btns = [...m.querySelectorAll(".btn")].filter((x) => !x.disabled); if (btns.length) btns[btns.length - 1].click(); else if (a && a.onAction) a.onAction(); }, 50);
      return;
    }
    // in the world: go to the target / use the "!" object
    const P = Game.player, it = Game.interactables.find((i) => i.enabled() && i.marker && i.marker() === "!");
    if (it) { P.x = it.x; P.y = it.y - 2; Game.useInteractable(it); return; }
    if (Game.target) { P.x = Game.target.x; P.y = Game.target.y; }
  },
  // start the story at a given point
  async startAt(k, d1, d2) {
    if (typeof Intro !== "undefined" && Intro.running) Intro.finish = () => {};
    UI.clear(); Story.setup(); Game.introSeen = true;
    Game.mode = "play"; $("#hud").classList.remove("off"); Sound.init && Sound.init();
    const N = Game.npc, P = Game.player;
    G.d1 = d1 || "A"; G.d2 = d2 || "B";
    const inControl = () => { Game.place(P, 29, 9, 1); Game.place(N.marcus, 27, 5, 0); Game.place(N.diego, 33, 7, 2); Game.place(N.layla, 25, 7, 3); };
    Sound.setMood("calm"); Sound.startLoop("hum");
    UI.toast(`🛠 Dev jump: ${k}${["pathA", "pathB", "scene5", "ending"].includes(k) ? ` (d1 ${G.d1}${k === "ending" ? `, d2 ${G.d2}` : ""})` : ""}`, 2500);
    switch (k) {
      case "scene1": return Story.scene1();
      case "marcus": Game.place(P, 29, 9, 1); G.flags.holo = true; Story.onHolo = null; UI.objective("Talk to {marcus} at the weather screen"); Game.setTarget({ x: N.marcus.x, y: N.marcus.y }); await Game.waitTalk("talk_marcus", N.marcus); Game.setTarget(null); return Story.scene2();
      case "scene2": Game.place(P, 10, 17, 0); return Story.scene2();
      case "scene3": Game.place(P, 31, 19, 0); return Story.scene3();
      case "scene4": inControl(); return Story.scene4();
      case "pathA": inControl(); G.d1 = "A"; await Story.pathA(); return Story.scene5();
      case "pathB": inControl(); G.d1 = "B"; await Story.pathB(); return Story.scene5();
      case "scene5": inControl(); if (G.d1 === "A") G.flags.diegoHurt = true; return Story.scene5();
      case "ending": Game.place(P, 12, 26, 1); Game.place(N.diego, 10, 25, 3); Game.place(N.marcus, 14, 25, 2); Game.place(N.layla, 12, 28, 1); return Story.ending();
    }
  },
  openGame(k) {
    if (Minigames.cancelCurrent) Minigames.cancelCurrent();
    if (!G.trays[0].problem) ["water", "light", "heat"].forEach((p, i) => { G.trays[i] = { problem: p }; });
    const run = {
      garden: () => Minigames.garden(), brush: () => Minigames.panel_brush(0), pebbles: () => Minigames.panel_pebbles(1), tilt: () => Minigames.panel_tilt(2),
      cards: () => SuitCards.open(), suit: () => Minigames.suitUp(), power: () => Minigames.power(), wiresE: () => Minigames.wires({ time: 60, hints: true }),
      wiresH: () => Minigames.wires({ time: 30, hints: false, hard: true }), globe: () => MarsGlobe.open(), album: () => PhotoAlbum.open(), window: () => MarsWindow.open(),
    }[k];
    if (run) Promise.resolve(run()).then((r) => console.log("[dev]", k, r));
  },
};
