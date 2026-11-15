// =====================================================================
//  UI — dialogue boxes, choices, cards, journal, map, settings, HUD.
// =====================================================================
const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const fill = (s) => s.replace(/\{lead\}/g, CONFIG.NAMES.lead).replace(/\{marcus\}/g, CONFIG.NAMES.marcus).replace(/\{diego\}/g, CONFIG.NAMES.diego).replace(/\{layla\}/g, CONFIG.NAMES.layla);
const SPEAKER_COLOR = { lead: "#e04848", marcus: "#3b7dd8", diego: "#f08a2a", layla: "#4fb35e" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const UI = {
  root: null, active: null, // active = {type, onAction, onKey}
  init() { this.root = $("#ui"); },
  clear() { this.root.innerHTML = ""; this.active = null; },
  busy() { return !!this.active; },
  action() { if (this.active && this.active.onAction) { this.active.onAction(); return true; } return !!this.active; },
  key(k) { if (this.active && this.active.onKey) return this.active.onKey(k); return false; },

  // ------------------------------------------------------------ dialogue
  say(who, text, opts = {}) {
    return new Promise((resolve) => {
      text = fill(text);
      const name = who === "narrator" ? "Narrator" : who === "earth" ? "Mission Control" : who === "sys" ? "" : CONFIG.NAMES[who];
      const wrap = el("div"); wrap.id = "dialog";
      const box = el("div"); box.id = "dlgBox"; if (opts.think) box.classList.add("think"); if (opts.radio) box.classList.add("radio");
      const tag = opts.think ? "💭 THINKING" : opts.radio ? "📻 RADIO" : "";
      box.innerHTML = (tag ? `<div id="dlgTag">${tag}</div>` : "") + `<div id="dlgText"></div><div id="dlgNext" class="hidden">▼</div>`;
      wrap.appendChild(box);
      let port = null;
      if (CHAR_SPECS[who]) {
        const side = el("div"); side.id = "dlgSide";
        port = el("canvas"); port.id = "dlgPort"; port.width = 42; port.height = 42;
        port.style.background = `radial-gradient(circle at 50% 40%, ${shade(CHAR_SPECS[who].stripe, 0.55)}, ${shade(CHAR_SPECS[who].stripe, 0.15)})`;
        const nm = el("div", "", name); nm.id = "dlgName"; nm.style.borderColor = SPEAKER_COLOR[who];
        side.appendChild(port); side.appendChild(nm); wrap.appendChild(side);
      } else if (name) { box.insertAdjacentHTML("afterbegin", `<div id="dlgTag">${name.toUpperCase()}</div>`); }
      this.root.appendChild(wrap);
      const tEl = box.querySelector("#dlgText"), nEl = box.querySelector("#dlgNext");
      let i = 0, done = false, last = 0;
      const plain = text;
      const finish = () => { done = true; tEl.innerHTML = plain; nEl.classList.remove("hidden"); };
      const step = () => {
        if (done) return;
        i += 1;
        tEl.textContent = plain.slice(0, i);
        if (i % 2 === 0 && /\w/.test(plain[i] || "")) Sound.play("blip", opts.think ? "sys" : who);
        if (i >= plain.length) finish(); else setTimeout(step, /[.,!?]/.test(plain[i - 1]) ? 90 : 24);
      };
      step();
      const anim = () => { if (!wrap.isConnected) return; if (port) { const g = port.getContext("2d"); g.clearRect(0, 0, 42, 42); const tt = performance.now() / 1000; g.drawImage(getPortrait(who, tt % 3.5 < 0.13, !done && (tt * 8 | 0) % 2 === 0, opts.mood || (opts.think ? 1 : 0)), 0, 0); } requestAnimationFrame(anim); };
      anim();
      const advance = () => { if (!done) { finish(); return; } Sound.play("click"); wrap.remove(); this.active = null; resolve(); };
      wrap.onclick = (e) => { e.stopPropagation(); advance(); };
      this.active = { type: "say", onAction: advance };
    });
  },
  async talk(lines) { for (const l of lines) { if (typeof l === "function") { await l(); continue; } await this.say(l[0], l[1], l[2] || {}); } },

  // ------------------------------------------------------------ choice
  choose(prompt, options) {
    return new Promise((resolve) => {
      Sound.play("open");
      const c = el("div"); c.id = "choice";
      c.appendChild(el("h2", "", fill(prompt)));
      let sel = 0; const btns = [];
      options.forEach((o, i) => {
        const b = el("button", "choiceBtn", `<span class="key">${"AB"[i]}</span><span>${fill(o)}</span>`);
        b.onclick = (e) => { e.stopPropagation(); pick(i); };
        b.onmouseenter = () => { sel = i; upd(); Sound.play("hover"); };
        c.appendChild(b); btns.push(b);
      });
      const upd = () => btns.forEach((b, i) => b.classList.toggle("sel", i === sel));
      upd();
      const pick = (i) => { Sound.play("good"); c.remove(); this.active = null; resolve(i); };
      this.root.appendChild(c);
      this.active = { type: "choice", onAction: () => pick(sel), onKey: (k) => { if (k === "1" || k === "a") pick(0); else if (k === "2" || k === "b") pick(1); else if (/Arrow(Up|Left)|w/.test(k)) { sel = 0; upd(); } else if (/Arrow(Down|Right)|s/.test(k)) { sel = 1; upd(); } return true; } };
    });
  },

  // ------------------------------------------------------------ generic card
  card(html, buttons = [{ id: "ok", label: "OK", cls: "go" }], opts = {}) {
    return new Promise((resolve) => {
      Sound.play("open");
      const m = el("div"); m.id = "modal";
      const c = el("div", "card " + (opts.cls || ""), html);
      const row = el("div", "btnrow");
      const done = (id) => { Sound.play("close"); m.remove(); if (this.active === act) this.active = prev; resolve(id); };
      buttons.forEach((b) => { const btn = el("button", "btn " + (b.cls || ""), b.label); btn.onclick = (e) => { e.stopPropagation(); Sound.play("click"); done(b.id); }; row.appendChild(btn); });
      if (buttons.length) c.appendChild(row);
      if (opts.closable) { const x = el("button", "close", "✕"); x.onclick = () => done("close"); c.appendChild(x); }
      m.appendChild(c);
      m.onclick = (e) => { if (e.target === m && opts.closable) done("close"); };
      this.root.appendChild(m);
      const prev = this.active;
      const act = { type: "card", onAction: () => { if (buttons.length && !opts.noKey) done(buttons[buttons.length - 1].id); }, onKey: (k) => { if (k === "Escape" && opts.closable) done("close"); return true; } };
      this.active = act;
      if (opts.onMount) opts.onMount(c, done);
    });
  },

  charCard(id, extra) {
    const s = STORY.characters[id];
    const cv = mkCanvas(42, 42); const g = cv.getContext("2d"); g.drawImage(getPortrait(id, false, false), 0, 0);
    cv.style.background = `radial-gradient(circle at 50% 40%, ${shade(CHAR_SPECS[id].stripe, 0.55)}, ${shade(CHAR_SPECS[id].stripe, 0.15)})`;
    const html = `<h3>CREW MEMBER</h3><div class="charcard"><div class="pc"></div><div><h1 style="color:${SPEAKER_COLOR[id]}">${CONFIG.FULL_NAMES[id]}</h1><dl><dt>ROLE</dt><dd>${s.role}</dd><dt>GOOD AT</dt><dd>${s.good}</dd><dt>FROM</dt><dd>${s.from}</dd>${extra ? `<dt>NOTE</dt><dd>${extra}</dd>` : ""}</dl></div></div>`;
    return this.card(html, [{ id: "ok", label: "Nice to meet you!", cls: "go" }], { onMount: (c) => c.querySelector(".pc").appendChild(cv) });
  },

  // ------------------------------------------------------------ toast + banner
  toast(msg, ms = 2200) { const t = $("#toast"); t.innerHTML = msg; t.classList.add("show"); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove("show"), ms); },
  banner(txt) { const b = $("#roomBanner"); b.textContent = txt; b.classList.add("show"); clearTimeout(this._bt); this._bt = setTimeout(() => b.classList.remove("show"), 1800); },
  objective(txt) { const o = $("#objective"); if (!txt) { o.classList.add("hidden"); return; } o.classList.remove("hidden"); o.querySelector("span").textContent = fill(txt); o.animate([{ transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 400 }); },
  timer(v, low) { const t = $("#timer"); if (v === null) { t.classList.add("hidden"); return; } t.classList.remove("hidden"); t.textContent = "⏱ " + Math.ceil(v); t.classList.toggle("low", !!low); },
  fade(on) { $("#fader").classList.toggle("on", on); return sleep(650); },

  // ------------------------------------------------------------ meters
  buildMeters() {
    const m = $("#meters"); m.innerHTML = "";
    for (const k of ["safety", "mission", "team"]) {
      const d = STORY.meters[k];
      const e = el("div", "meter", `<div class="lbl"><span>${d.icon} ${d.label}</span><span class="v">50</span></div><div class="bar"><div class="fill" style="background-color:${d.color}"></div></div>`);
      e.id = "m_" + k; e.title = d.help; m.appendChild(e);
    }
    this.updateMeters();
  },
  updateMeters() { for (const k of ["safety", "mission", "team"]) { const e = $("#m_" + k); if (!e) continue; e.querySelector(".fill").style.width = G.meters[k] + "%"; e.querySelector(".v").textContent = G.meters[k]; } },
  meterDelta(k, d) {
    const e = $("#m_" + k); if (!e || !d) return;
    e.classList.remove("pulse-up", "pulse-down"); void e.offsetWidth; e.classList.add(d > 0 ? "pulse-up" : "pulse-down");
    const dl = el("div", "delta", (d > 0 ? "+" : "") + d); dl.style.color = d > 0 ? "#5dff8a" : "#ff6a5a"; e.appendChild(dl); setTimeout(() => dl.remove(), 1700);
    this.updateMeters();
  },

  // ------------------------------------------------------------ fact cards (real NASA data)
  srcHtml(keys) { return `<div class="src">📚 Source${keys.length > 1 ? "s" : ""}: ${keys.map((k) => `<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].name}</a> <i>(${SOURCES[k].agency})</i>`).join("<br>")}</div>`; },
  async fact(key) {
    const f = FACTS[key]; if (!f) return;
    const isNew = !G.discovered.has(key);
    G.discovered.add(key); Game.saveProgress(); Game.updateJournal();
    if (isNew) { Sound.play("discover"); }
    let extra = "";
    if (f.calc === "weight") extra = `<div class="weightcalc">On Earth I weigh <input id="wIn" type="number" min="5" max="200" value="30"> kg → on Mars the scale shows <b id="wOut">11.4</b> kg!</div>`;
    if (f.live) extra = `<div id="swBox">Loading NASA DONKI data…</div>`;
    const html = `${isNew ? '<h3>✨ NEW DISCOVERY</h3>' : '<h3>DISCOVERY</h3>'}<div class="big">${f.icon}</div><h1>${f.title}</h1><p>${f.text}</p><div class="real"><span class="tag">REAL NASA SCIENCE</span><br>${f.real}${extra}</div>${this.srcHtml(f.src)}`;
    await this.card(html, [{ id: "ok", label: "Cool!", cls: "go" }], {
      closable: true, noKey: !!f.calc,
      onMount: (c) => {
        if (f.calc === "weight") { const i = c.querySelector("#wIn"), o = c.querySelector("#wOut"); i.oninput = () => { o.textContent = ((parseFloat(i.value) || 0) * 0.38).toFixed(1); }; i.onkeydown = (e) => e.stopPropagation(); }
        if (f.live) SpaceWeather.load().then(() => { const b = c.querySelector("#swBox"); if (b) b.innerHTML = this.spaceWeatherHtml(); });
      },
    });
  },
  spaceWeatherHtml() {
    const SW = SpaceWeather, risk = SW.risk();
    const badge = SW.status === "live" ? `<b style="color:#0a8a3a">● LIVE from NASA DONKI</b> (last 30 days, updated ${SW.fetchedAt.toLocaleString()})` : `<b style="color:#b06a00">● ARCHIVED NASA record</b> (live data not reachable right now)`;
    const top = SW.flares.slice(0, 5).map((x) => `<div><span><span class="cls ${x.classType[0]}">${x.classType}</span> flare</span><span>${(x.peakTime || "").replace("T", " ").replace("Z", " UTC")}</span></div>`).join("") || "<div>No flares listed — the Sun is quiet!</div>";
    const lv = { quiet: 0, M: 1, X: 2 }[risk];
    const M = ARCHIVED_SPACE_WEATHER.marsEvent;
    return `<div style="margin-top:.4em">${badge}</div><div class="flarelist">${top}</div>
      <div><b>Radiation risk for a walk outside${SW.status === "live" ? " this week" : ""}:</b></div>
      <div class="sun-meter"><div class="${lv === 0 ? "on" : ""}" style="${lv === 0 ? "background:#7dff9a" : ""}">LOW</div><div class="${lv === 1 ? "on" : ""}" style="${lv === 1 ? "background:#ffb020" : ""}">MEDIUM (M)</div><div class="${lv === 2 ? "on" : ""}" style="${lv === 2 ? "background:#ff4a4a" : ""}">HIGH (X)</div></div>
      <div style="font-size:.8em">🔴 Real Mars event: on ${M.date} a flare of ${M.flare} hit Mars. Curiosity measured <b>${M.doseMicroGray.toLocaleString()} micrograys</b> ≈ <b>${M.chestXrays} chest X-rays</b>.</div>
      <div style="font-size:.65em;opacity:.8;margin-top:.3em">Note: DONKI lists flares seen from Earth's side of the Sun. Mars sees the Sun from a different angle — in this game we use it as a classroom stand-in for "how stormy is the Sun right now".</div>`;
  },

  // ------------------------------------------------------------ journal / map / settings
  journal() {
    const keys = Object.keys(FACTS);
    const html = `<h1>📖 Discovery Journal</h1><p>Explore the base and press <b>Space</b> on things with a <b>?</b> to discover real NASA science. Found <b>${G.discovered.size} / ${keys.length}</b>.</p><div class="jgrid">${keys.map((k) => G.discovered.has(k) ? `<div class="jitem" data-k="${k}"><span>${FACTS[k].icon}</span>${FACTS[k].title}</div>` : `<div class="jitem locked"><span>❔</span>???</div>`).join("")}</div>`;
    return this.card(html, [{ id: "ok", label: "Close", cls: "alt" }], { closable: true, onMount: (c, done) => c.querySelectorAll(".jitem[data-k]").forEach((d) => d.onclick = async () => { done("x"); await this.fact(d.dataset.k); }) });
  },
  map() {
    const P = Game.player;
    const rooms = Object.entries(ROOMS).map(([id, r]) => `<div style="left:${r.x / MW * 100}%;top:${r.y / MH * 100}%;width:${r.w / MW * 100}%;height:${r.h / MH * 100}%;background:${id === "outside" ? "#6a3018" : shade(r.wall, -0.3)};border:.12em solid ${r.wall}">${r.name}</div>`).join("");
    const cors = CORRIDORS.map(([x, y, w, h]) => `<div style="left:${x / MW * 100}%;top:${y / MH * 100}%;width:${w / MW * 100}%;height:${h / MH * 100}%;background:#3a4060"></div>`).join("");
    const html = `<h1>🗺️ Base Map</h1><div class="minimap">${cors}${rooms}<div class="me" style="left:${P.x / (MW * T) * 100}%;top:${P.y / (MH * T) * 100}%"></div></div>`;
    return this.card(html, [{ id: "ok", label: "Close", cls: "alt" }], { closable: true, cls: "dark wide" });
  },
  settings() {
    const S = Sound.settings;
    const html = `<h1>⚙️ Settings</h1>
      <div class="slider">🎵 Music <input id="sMus" type="range" min="0" max="1" step="0.05" value="${S.music}"></div>
      <div class="slider">🔊 Sound effects <input id="sSfx" type="range" min="0" max="1" step="0.05" value="${S.sfx}"></div>
      <div class="slider"><label><input id="sVoice" type="checkbox" ${S.voice ? "checked" : ""}> 🗣️ Narrator voice in the intro</label></div>
      <div class="slider"><label><input id="sMute" type="checkbox" ${S.muted ? "checked" : ""}> 🔇 Mute everything</label></div>
      <div class="slider">🧑‍🚀 Character style <select id="sChar" style="font-family:inherit;font-size:1em"><option value="v2" ${CHAR_STYLE === "v2" ? "selected" : ""}>New (detailed)</option><option value="v1" ${CHAR_STYLE !== "v2" ? "selected" : ""}>Classic</option></select></div>
      <p style="font-size:.8em">Controls: <b>Arrows / WASD</b> to move · <b>Space / E</b> to talk & use · <b>Click</b> anywhere to walk there · <b>M</b> map · <b>J</b> journal</p>`;
    return this.card(html, [{ id: "src", label: "NASA data & credits", cls: "alt" }, { id: "ok", label: "Done", cls: "go" }], {
      closable: true, onMount: (c) => {
        c.querySelector("#sMus").oninput = (e) => Sound.setMusic(+e.target.value);
        c.querySelector("#sSfx").oninput = (e) => { Sound.setSfx(+e.target.value); Sound.play("click"); };
        c.querySelector("#sVoice").onchange = (e) => Sound.setVoice(e.target.checked);
        c.querySelector("#sMute").onchange = () => Sound.toggleMute();
        c.querySelector("#sChar").onchange = (e) => { e.stopPropagation(); setCharStyle(e.target.value); };
        c.querySelector("#sChar").onkeydown = (e) => e.stopPropagation();
      },
    }).then((id) => { if (id === "src") return this.credits(); });
  },
  credits() {
    const used = Object.keys(SOURCES).map((k) => `<li><a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].name}</a> — <i>${SOURCES[k].agency}</i></li>`).join("");
    const html = `<h1>NASA Data, Sources & Credits</h1>
      <h3>REAL DATA IN THIS GAME</h3>
      <p>• <b>Space Weather console</b> calls NASA's <b>DONKI</b> solar-flare API live (via api.nasa.gov). If it can't connect, it shows an <b>archived</b> real record and says so.<br>• Every <b>?</b> discovery card shows real facts with the NASA / ESA / CSA page they come from.<br>• Meter points, timers and power units are <b>game-balance assumptions</b>, not real measurements.</p>
      <h3>SOURCES</h3><ul style="font-size:.7em;line-height:1.5">${used}</ul>
      <h3>MADE BY</h3><p style="font-size:.85em">NASA Space Apps Challenge 2026 team — Junior Astronaut Mission Trainer. Story & characters by the team.</p>
      <h3>AI DISCLOSURE</h3><p style="font-size:.8em">Game code, pixel art (drawn in code), music and sound effects (generated in code with the Web Audio API) were created with help from <b>Claude (Anthropic)</b>. The intro narrator uses your browser's built-in text-to-speech voice. No NASA logos or mission insignia are used.</p>`;
    return this.card(html, [{ id: "ok", label: "Close", cls: "alt" }], { closable: true, cls: "wide" });
  },
};
