// =====================================================================
//  AUDIO — 100% generated in the browser (Web Audio API). No files.
//  Generative space music with moods + all sound effects.
// =====================================================================
const Sound = (() => {
  let ctx = null, master, musicBus, sfxBus, revIn, delayIn;
  const S = { music: 0.5, sfx: 0.8, voice: true, muted: false };
  try { Object.assign(S, JSON.parse(localStorage.getItem("sol200_audio") || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem("sol200_audio", JSON.stringify(S)); } catch (e) {} };

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const N = (name) => { // "A3" -> midi
    const m = name.match(/^([A-G])(#|b)?(-?\d)$/);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
    return base + (parseInt(m[3]) + 1) * 12;
  };

  function init() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = S.muted ? 0 : 1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = S.music; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = S.sfx; sfxBus.connect(master);
    // reverb
    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    conv.buffer = ir; revIn = ctx.createGain(); revIn.gain.value = 0.9; revIn.connect(conv); const rg = ctx.createGain(); rg.gain.value = 0.55; conv.connect(rg).connect(master);
    // echo
    delayIn = ctx.createGain(); const dl = ctx.createDelay(1.5); dl.delayTime.value = 0.42; const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dlf = ctx.createBiquadFilter(); dlf.type = "lowpass"; dlf.frequency.value = 2200;
    delayIn.connect(dl); dl.connect(dlf).connect(fb).connect(dl); dlf.connect(revIn); const dg = ctx.createGain(); dg.gain.value = 0.5; dlf.connect(dg).connect(musicBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    startScheduler();
  }
  let noiseBuf;

  // ------------------------------------------------------------ helpers
  function env(g, t, a, peak, d, sus, rel, len) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
    g.gain.setValueAtTime(Math.max(sus, 0.0001), t + Math.max(a + d, len));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, len) + rel);
  }
  function osc(type, freq, t, dur, vol, dest, opts = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(opts.slide, t + (opts.slideT || dur));
    if (opts.detune) o.detune.value = opts.detune;
    const g = ctx.createGain();
    env(g, t, opts.a ?? 0.005, vol, opts.d ?? dur * 0.3, opts.s ?? vol * 0.4, opts.r ?? 0.08, dur);
    let node = o;
    if (opts.filter) { const f = ctx.createBiquadFilter(); f.type = opts.filter.type || "lowpass"; f.frequency.value = opts.filter.f; f.Q.value = opts.filter.q || 0.7; o.connect(f); node = f; }
    node.connect(g); g.connect(dest);
    if (opts.rev) { const s = ctx.createGain(); s.gain.value = opts.rev; g.connect(s).connect(revIn); }
    if (opts.echo) { const s = ctx.createGain(); s.gain.value = opts.echo; g.connect(s).connect(delayIn); }
    o.start(t); o.stop(t + dur + (opts.r ?? 0.08) + 0.05);
    return o;
  }
  function noise(t, dur, vol, dest, f = { type: "bandpass", f: 1000, q: 1 }, opts = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = f.type; fl.frequency.setValueAtTime(f.f, t); fl.Q.value = f.q || 1;
    if (f.to) fl.frequency.exponentialRampToValueAtTime(f.to, t + dur);
    const g = ctx.createGain(); env(g, t, opts.a ?? 0.003, vol, opts.d ?? dur * 0.5, opts.s ?? vol * 0.3, opts.r ?? 0.05, dur);
    s.connect(fl).connect(g).connect(dest);
    if (opts.rev) { const r = ctx.createGain(); r.gain.value = opts.rev; g.connect(r).connect(revIn); }
    s.start(t, Math.random()); s.stop(t + dur + 0.3);
  }

  // ------------------------------------------------------------ music
  const MOODS = {
    title:   { bpm: 64, prog: [["A2","E3","B3","C4","E4"],["F2","C3","G3","A3","E4"],["C3","G3","B3","D4","E4"],["G2","D3","A3","B3","D4"]], arp: 0.35, bells: 0.5, pulse: 0, pad: 0.05, cut: 1100, scale: ["A4","B4","C5","E5","G5","A5"] },
    calm:    { bpm: 76, prog: [["A2","E3","G3","B3","C4"],["F2","C3","E3","A3","C4"],["C3","G3","B3","E4"],["G2","D3","F#3","B3","D4"]], arp: 0.6, bells: 0.25, pulse: 0, pad: 0.045, cut: 1300, scale: ["E4","G4","A4","B4","D5","E5"] },
    tension: { bpm: 104, prog: [["D2","A2","D3","F3","A3"],["Bb1","F2","D3","F3","A3"],["A1","E2","C3","E3","G3"],["A1","E2","C#3","E3","G#3"]], arp: 0.5, bells: 0.08, pulse: 1, pad: 0.04, cut: 800, scale: ["D5","E5","F5","A5"] },
    task:    { bpm: 118, prog: [["A2","E3","A3","C4"],["F2","C3","F3","A3"],["C3","G3","C4","E4"],["G2","D3","G3","B3"]], arp: 0.9, bells: 0.05, pulse: 0.7, pad: 0.03, cut: 1600, scale: ["A4","C5","E5"] },
    outside: { bpm: 96, prog: [["E2","B2","E3","G3"],["C2","G2","E3","G3"],["D2","A2","D3","F#3"],["B1","F#2","D3","F#3"]], arp: 0.4, bells: 0.05, pulse: 0.9, pad: 0.035, cut: 650, scale: ["E5","G5","B5"] },
    happy:   { bpm: 80, prog: [["C3","G3","B3","E4"],["F2","C3","A3","E4"],["A2","E3","G3","C4"],["G2","D3","B3","D4"]], arp: 0.7, bells: 0.5, pulse: 0, pad: 0.05, cut: 1800, scale: ["C5","D5","E5","G5","A5"] },
    hope:    { bpm: 70, prog: [["C3","G3","E4","G4"],["A2","E3","C4","E4"],["F2","C3","A3","C4"],["G2","D3","B3","D4"]], arp: 0.55, bells: 0.6, pulse: 0, pad: 0.04, cut: 2000, scale: ["C5","D5","E5","G5","A5","C6"] },
    single:  { bpm: 60, prog: [["E4"]], arp: 0, bells: 0, pulse: 0, pad: 0.05, cut: 1400, scale: ["E5"] },
    majestic:{ bpm: 84, prog: [["C2","G2","C3","E3","G3","C4"],["G1","D2","B2","D3","G3","B3"],["A1","E2","A2","C3","E3","A3"],["F1","C2","F2","A2","C3","F3"]], arp: 0.8, bells: 0.3, pulse: 0.6, pad: 0.05, cut: 1700, scale: ["G5","C6","E6"] },
    spacepad:{ bpm: 58, prog: [["D3","A3","E4","F#4"],["B2","F#3","D4","A4"],["G2","D3","B3","F#4"],["A2","E3","C#4","E4"]], arp: 0.45, bells: 0.5, pulse: 0, pad: 0.045, cut: 1200, scale: ["F#5","A5","C#6","E6"] },
    mystery: { bpm: 66, prog: [["E2","B2","G3","C4"],["F2","C3","G#3","C4"],["E2","B2","G3","D4"],["D2","A2","F#3","C4"]], arp: 0.35, bells: 0.35, pulse: 0.2, pad: 0.045, cut: 900, scale: ["B4","C5","D#5","F#5"] },
    arrival: { bpm: 90, prog: [["A2","E3","A3","C4"],["G2","D3","G3","B3"],["F2","C3","F3","A3"],["E2","B2","E3","G#3"]], arp: 0.5, bells: 0.15, pulse: 0.5, pad: 0.035, cut: 900, scale: ["E5","A5"] },
    sad:     { bpm: 62, prog: [["A2","E3","C4"],["F2","C3","A3"],["D2","A2","F3"],["E2","B2","G#3"]], arp: 0.3, bells: 0.2, pulse: 0, pad: 0.045, cut: 900, scale: ["A4","C5","E5"] },
  };
  let mood = null, moodGain = {}, step = 0, nextT = 0, timer = null;
  function setMood(m) {
    if (!ctx) { pendingMood = m; return; }
    if (m === mood) return;
    const t = ctx.currentTime;
    if (mood && moodGain[mood]) { moodGain[mood].gain.cancelScheduledValues(t); moodGain[mood].gain.setValueAtTime(moodGain[mood].gain.value, t); moodGain[mood].gain.linearRampToValueAtTime(0, t + 1.5); }
    mood = m;
    if (!m) return;
    if (!moodGain[m]) { moodGain[m] = ctx.createGain(); moodGain[m].gain.value = 0; moodGain[m].connect(musicBus); }
    moodGain[m].gain.cancelScheduledValues(t); moodGain[m].gain.setValueAtTime(moodGain[m].gain.value, t); moodGain[m].gain.linearRampToValueAtTime(1, t + 1.5);
    step = 0; nextT = t + 0.1;
  }
  let pendingMood = null;
  function startScheduler() {
    if (timer) return;
    timer = setInterval(tick, 30);
    if (pendingMood) { const p = pendingMood; pendingMood = null; setMood(p); }
  }
  function tick() {
    if (!mood || !ctx) return;
    const M = MOODS[mood], dest = moodGain[mood];
    const sixteenth = 60 / M.bpm / 4;
    while (nextT < ctx.currentTime + 0.15) {
      const t = nextT, bar = Math.floor(step / 16), s = step % 16;
      const chord = M.prog[bar % M.prog.length].map(N);
      if (s === 0) {
        const barLen = sixteenth * 16;
        chord.forEach((n, i) => {
          osc("sawtooth", mtof(n), t, barLen, M.pad * (i === 0 ? 0.8 : 0.55), dest, { a: 0.9, d: 0.5, s: M.pad * 0.5, r: 1.6, detune: -7, filter: { f: M.cut, q: 0.6 }, rev: 0.6 });
          osc("sawtooth", mtof(n), t, barLen, M.pad * 0.4, dest, { a: 1.1, d: 0.5, s: M.pad * 0.3, r: 1.6, detune: 8, filter: { f: M.cut * 0.8 }, rev: 0.6 });
        });
        osc("sine", mtof(chord[0] - 12 >= 28 ? chord[0] - 12 : chord[0]), t, barLen * 0.9, 0.16, dest, { a: 0.3, d: 0.6, s: 0.1, r: 0.8 });
        if (Math.random() < M.bells) { const b = N(M.scale[(Math.random() * M.scale.length) | 0]); osc("sine", mtof(b), t + sixteenth * ((Math.random() * 8) | 0), 0.05, 0.07, dest, { a: 0.005, d: 0.05, s: 0.04, r: 2.8, rev: 1, echo: 0.6 }); osc("sine", mtof(b + 19), t, 0.03, 0.015, dest, { r: 1.5, rev: 1 }); }
      }
      // arpeggio
      if (s % 2 === 0 && Math.random() < M.arp) {
        const pat = [0, 1, 2, 3, 2, 1, 3, 4];
        const idx = pat[(s / 2) % pat.length] % chord.length;
        const n = chord[Math.max(1, idx)] + 12;
        osc("triangle", mtof(n), t, 0.06, 0.05, dest, { a: 0.004, d: 0.12, s: 0.01, r: 0.25, echo: 0.5, rev: 0.4 });
      }
      // tension pulse / bass
      if (M.pulse && s % 2 === 0) {
        const n = chord[0];
        osc("sawtooth", mtof(n), t, sixteenth * 1.4, 0.07 * M.pulse, dest, { a: 0.004, d: 0.08, s: 0.02, r: 0.05, filter: { f: 380 + (s % 8 === 0 ? 500 : 0), q: 4 } });
        if (s % 4 === 2) noise(t, 0.03, 0.025 * M.pulse, dest, { type: "highpass", f: 7000 }, { r: 0.03 });
        if (s % 8 === 0) osc("sine", 120, t, 0.12, 0.18 * M.pulse, dest, { slide: 45, slideT: 0.12, a: 0.002, d: 0.1, s: 0.01, r: 0.05 });
      }
      step++; nextT += sixteenth;
    }
  }

  // ------------------------------------------------------------ recorded files (optional)
  const fileBufs = {};
  async function loadFiles(map, timeoutMs = 6000) {
    if (!ctx) return;
    await Promise.all(Object.entries(map || {}).map(async ([k, url]) => {
      if (!url || fileBufs[k]) return;
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), timeoutMs);
        const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to);
        if (!r.ok) throw 0;
        fileBufs[k] = await ctx.decodeAudioData(await r.arrayBuffer());
      } catch (e) {}
    }));
  }
  function playFile(k, o = {}) {
    const b = fileBufs[k]; if (!b || !ctx) return null;
    const vol = o.vol ?? ((CONFIG.SFX_VOLUME || {})[k] ?? 0.7);
    const src = ctx.createBufferSource(); src.buffer = b; src.loop = !!o.loop;
    const g = ctx.createGain(); const t = ctx.currentTime;
    if (o.fade) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + o.fade); } else g.gain.value = vol;
    src.connect(g).connect(o.bus || sfxBus); src.start(o.when || 0, o.offset || 0);
    return { src, stop(f = 0.4) { const tt = ctx.currentTime; g.gain.cancelScheduledValues(tt); g.gain.setValueAtTime(g.gain.value, tt); g.gain.linearRampToValueAtTime(0, tt + f); try { src.stop(tt + f + 0.05); } catch (e) {} } };
  }
  const FILE_LOOPS = { alarm: "alarm", wind: "wind", hum: "hum", storm: "storm" };

  // ------------------------------------------------------------ loops
  const loops = {};
  function startLoop(name) {
    if (!ctx || loops[name]) return;
    const t = ctx.currentTime;
    if (FILE_LOOPS[name] && fileBufs[FILE_LOOPS[name]]) { const h = playFile(FILE_LOOPS[name], { loop: true, fade: name === "alarm" ? 0.05 : 1.2 }); loops[name] = { stop: (fast) => h.stop(fast ? 0.1 : 1.0) }; return; }
    if (name === "storm") return;
    if (name === "wind") {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 500; f.Q.value = 0.8;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15; const lg = ctx.createGain(); lg.gain.value = 300; lfo.connect(lg).connect(f.frequency); lfo.start();
      const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.25, t + 2);
      s.connect(f).connect(g).connect(sfxBus); s.start();
      loops[name] = { stop: () => { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2); setTimeout(() => { s.stop(); lfo.stop(); }, 2200); }, g };
    } else if (name === "alarm") {
      let on = true; const beep = () => { if (!on) return; const t = ctx.currentTime; osc("square", 880, t, 0.22, 0.05, sfxBus, { slide: 660, slideT: 0.22, filter: { f: 2000 } }); osc("square", 660, t + 0.3, 0.22, 0.045, sfxBus, { slide: 880, slideT: 0.22, filter: { f: 2000 } }); };
      beep(); const iv = setInterval(beep, 1100);
      loops[name] = { stop: () => { on = false; clearInterval(iv); } };
    } else if (name === "engine" || name === "crackle" || name === "steam") {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter();
      if (name === "engine") { f.type = "lowpass"; f.frequency.value = 160; } else if (name === "crackle") { f.type = "bandpass"; f.frequency.value = 2500; f.Q.value = 0.6; } else { f.type = "highpass"; f.frequency.value = 3000; }
      const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(name === "engine" ? 0.35 : name === "crackle" ? 0.12 : 0.08, t + 0.6);
      let o; if (name === "engine") { o = ctx.createOscillator(); o.frequency.value = 48; const og = ctx.createGain(); og.gain.value = 0.08; o.connect(og).connect(g); o.start(); }
      let am; if (name === "crackle") { am = ctx.createOscillator(); am.type = "square"; am.frequency.value = 23; const ag = ctx.createGain(); ag.gain.value = 0.5; am.connect(ag).connect(g.gain); am.start(); }
      s.connect(f).connect(g).connect(sfxBus); s.start();
      loops[name] = { stop: (fast) => { const tt = ctx.currentTime; g.gain.cancelScheduledValues(tt); g.gain.setValueAtTime(g.gain.value, tt); g.gain.linearRampToValueAtTime(0, tt + (fast ? 0.08 : 1.2)); setTimeout(() => { s.stop(); o && o.stop(); am && am.stop(); }, 1400); } };
    } else if (name === "hum") {
      const o = ctx.createOscillator(); o.frequency.value = 55; const o2 = ctx.createOscillator(); o2.frequency.value = 110.5;
      const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.03, t + 2);
      const f = ctx.createBiquadFilter(); f.frequency.value = 300;
      o.connect(f); o2.connect(f); f.connect(g).connect(sfxBus); o.start(); o2.start();
      loops[name] = { stop: () => { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); setTimeout(() => { o.stop(); o2.stop(); }, 1200); } };
    }
  }
  function stopLoop(name, fast) { if (loops[name]) { loops[name].stop(fast); delete loops[name]; } }

  // ------------------------------------------------------------ sfx
  const VOICES = { lead: 1.0, marcus: 0.72, diego: 1.15, layla: 1.4, narrator: 0.9, earth: 1.25, sys: 1.6 };
  let lastStep = 0;
  const sfx = {
    blip(who = "sys", vol = 1) { const t = ctx.currentTime, p = VOICES[who] || 1; const f = 260 * p * (0.9 + Math.random() * 0.25); osc("square", f, t, 0.04, 0.055 * vol, sfxBus, { a: 0.002, d: 0.035, s: 0.012, r: 0.025, filter: { f: 2200 } }); osc("triangle", f * 2, t, 0.025, 0.02 * vol, sfxBus, { r: 0.02 }); },
    step(surface = "metal") { const t = ctx.currentTime; if (t - lastStep < 0.12) return; lastStep = t; if (surface === "sand") noise(t, 0.06, 0.05, sfxBus, { type: "lowpass", f: 900 }, { r: 0.05 }); else { noise(t, 0.025, 0.04, sfxBus, { type: "bandpass", f: 2400 + Math.random() * 600, q: 3 }, { r: 0.03 }); osc("sine", 140, t, 0.03, 0.03, sfxBus, { r: 0.03 }); } },
    click() { const t = ctx.currentTime; osc("square", 1200, t, 0.02, 0.04, sfxBus, { r: 0.02, filter: { f: 3000 } }); },
    hover() { const t = ctx.currentTime; osc("sine", 900, t, 0.02, 0.02, sfxBus, { r: 0.02 }); },
    open() { const t = ctx.currentTime; [523, 659, 784].forEach((f, i) => osc("triangle", f, t + i * 0.05, 0.06, 0.06, sfxBus, { r: 0.15, rev: 0.3 })); },
    close() { const t = ctx.currentTime; [784, 523].forEach((f, i) => osc("triangle", f, t + i * 0.05, 0.05, 0.05, sfxBus, { r: 0.12 })); },
    discover() { const t = ctx.currentTime; [784, 988, 1175, 1568].forEach((f, i) => osc("sine", f, t + i * 0.07, 0.08, 0.07, sfxBus, { r: 0.6, rev: 0.6, echo: 0.3 })); },
    success() { const t = ctx.currentTime; [523, 659, 784, 1047].forEach((f, i) => osc("square", f, t + i * 0.09, 0.12, 0.05, sfxBus, { r: 0.3, filter: { f: 2500 }, rev: 0.4 })); osc("sine", 1568, t + 0.4, 0.3, 0.05, sfxBus, { r: 1, rev: 0.8 }); },
    good() { const t = ctx.currentTime; osc("triangle", 880, t, 0.06, 0.07, sfxBus, { r: 0.1 }); osc("triangle", 1320, t + 0.07, 0.1, 0.07, sfxBus, { r: 0.25, rev: 0.4 }); },
    error() { const t = ctx.currentTime; osc("sawtooth", 150, t, 0.18, 0.08, sfxBus, { filter: { f: 700 }, r: 0.05 }); osc("sawtooth", 142, t, 0.18, 0.06, sfxBus, { filter: { f: 700 }, r: 0.05 }); },
    fail() { const t = ctx.currentTime; [392, 330, 262].forEach((f, i) => osc("triangle", f, t + i * 0.16, 0.18, 0.07, sfxBus, { r: 0.3, rev: 0.4 })); },
    meterUp() { const t = ctx.currentTime; osc("sine", 660, t, 0.08, 0.06, sfxBus, { slide: 1320, slideT: 0.1, r: 0.15, rev: 0.3 }); },
    meterDown() { const t = ctx.currentTime; osc("sine", 520, t, 0.12, 0.06, sfxBus, { slide: 200, slideT: 0.15, r: 0.15 }); },
    scrub() { const t = ctx.currentTime; noise(t, 0.1, 0.09, sfxBus, { type: "bandpass", f: 1800, to: 3500, q: 2 }, { r: 0.05 }); },
    wire() { const t = ctx.currentTime; osc("square", 200, t, 0.03, 0.06, sfxBus, { r: 0.02, filter: { f: 1500 } }); noise(t, 0.05, 0.06, sfxBus, { type: "highpass", f: 4000 }); osc("sine", 1200, t + 0.04, 0.1, 0.05, sfxBus, { r: 0.2, rev: 0.3 }); },
    zap() { const t = ctx.currentTime; noise(t, 0.15, 0.08, sfxBus, { type: "bandpass", f: 3000, to: 800, q: 4 }); },
    power() { const t = ctx.currentTime; osc("sawtooth", 80, t, 0.6, 0.06, sfxBus, { slide: 320, slideT: 0.6, filter: { f: 900 }, r: 0.2 }); },
    powerDown() { const t = ctx.currentTime; osc("sawtooth", 320, t, 0.8, 0.06, sfxBus, { slide: 50, slideT: 0.8, filter: { f: 900 }, r: 0.2 }); },
    ping() { const t = ctx.currentTime; osc("sine", 1318, t, 0.05, 0.08, sfxBus, { r: 0.8, rev: 0.6, echo: 0.4 }); osc("sine", 1760, t + 0.12, 0.05, 0.06, sfxBus, { r: 0.8, rev: 0.6 }); },
    door() { const t = ctx.currentTime; noise(t, 0.35, 0.08, sfxBus, { type: "lowpass", f: 400, to: 2000 }, { r: 0.1 }); osc("sine", 90, t, 0.3, 0.06, sfxBus, { r: 0.1 }); },
    thud() { const t = ctx.currentTime; osc("sine", 110, t, 0.15, 0.2, sfxBus, { slide: 40, slideT: 0.15, r: 0.1 }); noise(t, 0.1, 0.06, sfxBus, { type: "lowpass", f: 500 }); },
    whoosh() { const t = ctx.currentTime; noise(t, 0.6, 0.08, sfxBus, { type: "bandpass", f: 300, to: 3000, q: 1 }, { a: 0.2, r: 0.3, rev: 0.5 }); },
    rumble(d = 3) { const t = ctx.currentTime; noise(t, d, 0.25, sfxBus, { type: "lowpass", f: 140, to: 400 }, { a: 0.6, d: d * 0.5, s: 0.15, r: 1.5 }); },
    garble(who = "lead") { const t = ctx.currentTime, p = VOICES[who] || 1; for (let i = 0; i < 6; i++) osc("sawtooth", 140 * p * (0.8 + Math.random() * 0.5), t + i * 0.07, 0.06, 0.04, sfxBus, { filter: { f: 900, q: 3 }, r: 0.03 }); },
    heart() { const t = ctx.currentTime; osc("sine", 60, t, 0.08, 0.2, sfxBus, { r: 0.08 }); osc("sine", 55, t + 0.18, 0.08, 0.15, sfxBus, { r: 0.08 }); },
    applause(d = 2) { const t = ctx.currentTime; for (let i = 0; i < d * 45; i++) noise(t + Math.random() * d, 0.02, 0.05 + Math.random() * 0.04, sfxBus, { type: "bandpass", f: 1200 + Math.random() * 1800, q: 1.2 }, { r: 0.04, rev: 0.6 }); },
    flash() { const t = ctx.currentTime; noise(t, 0.02, 0.1, sfxBus, { type: "highpass", f: 5000 }); osc("sine", 3200, t + 0.02, 0.25, 0.02, sfxBus, { slide: 4200, r: 0.1 }); },
    pin() { const t = ctx.currentTime; osc("square", 1800, t, 0.015, 0.05, sfxBus, { r: 0.02, filter: { f: 4000 } }); noise(t, 0.02, 0.06, sfxBus, { type: "highpass", f: 6000 }); },
    glint() { const t = ctx.currentTime; [2093, 2637, 3136].forEach((f, i) => osc("sine", f, t + i * 0.05, 0.05, 0.05, sfxBus, { r: 0.8, rev: 0.7, echo: 0.3 })); },
    ignition() { const t = ctx.currentTime; osc("sine", 70, t, 1.5, 0.5, sfxBus, { slide: 30, slideT: 1.5, r: 0.8 }); noise(t, 2.5, 0.4, sfxBus, { type: "lowpass", f: 900, to: 200 }, { a: 0.01, d: 1, s: 0.2, r: 1, rev: 0.5 }); },
    birds() { const t = ctx.currentTime; for (let i = 0; i < 9; i++) { const st = t + Math.random() * 0.8, f = 2500 + Math.random() * 1500; osc("sine", f, st, 0.05, 0.03, sfxBus, { slide: f * 1.4, slideT: 0.05, r: 0.03 }); osc("sine", f * 1.1, st + 0.07, 0.04, 0.025, sfxBus, { slide: f * 0.8, slideT: 0.04, r: 0.03 }); } },
    separation() { const t = ctx.currentTime; osc("square", 90, t, 0.08, 0.15, sfxBus, { filter: { f: 600 }, r: 0.1 }); noise(t, 0.3, 0.12, sfxBus, { type: "bandpass", f: 700, q: 2 }, { r: 0.4, rev: 0.6 }); },
    retro() { const t = ctx.currentTime; noise(t, 1.2, 0.18, sfxBus, { type: "lowpass", f: 500, to: 900 }, { a: 0.05, r: 0.4 }); },
    entry() { const t = ctx.currentTime; noise(t, 2.4, 0.3, sfxBus, { type: "bandpass", f: 300, to: 1600, q: 0.7 }, { a: 0.4, d: 1.5, s: 0.25, r: 0.6 }); },
    airlock() { const t = ctx.currentTime; noise(t, 0.9, 0.12, sfxBus, { type: "highpass", f: 2500, to: 6000 }, { a: 0.05, r: 0.3 }); osc("square", 110, t + 0.95, 0.05, 0.12, sfxBus, { filter: { f: 800 }, r: 0.08 }); },
    type() { const t = ctx.currentTime; osc("square", 1400 + Math.random() * 300, t, 0.012, 0.025, sfxBus, { r: 0.015, filter: { f: 3000 } }); },
    sparkle() { const t = ctx.currentTime; for (let i = 0; i < 5; i++) osc("sine", 1500 + Math.random() * 1500, t + i * 0.04, 0.03, 0.03, sfxBus, { r: 0.3, rev: 0.5 }); },
  };

  // ------------------------------------------------------------ narrator voice (browser TTS fallback)
  function speak(text, onend) {
    if (!S.voice || S.muted || !("speechSynthesis" in window)) { onend && onend(false); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\.\.\./g, ","));
      const vs = speechSynthesis.getVoices();
      const pick = vs.find((v) => /en-GB/.test(v.lang) && /Male|Daniel|George|Arthur/i.test(v.name)) || vs.find((v) => /Google UK English Male/.test(v.name)) || vs.find((v) => /^en/.test(v.lang));
      if (pick) u.voice = pick;
      u.rate = 0.9; u.pitch = 0.85; u.volume = 1;
      u.onend = () => onend && onend(true); u.onerror = () => onend && onend(false);
      speechSynthesis.speak(u);
    } catch (e) { onend && onend(false); }
  }

  const FILE_SFX = { airlock: "airlock", separation: "separation", entry: "entry", argument: "argument", launch: "launch", applauseRec: "applause" };
  function duck(on) { if (!ctx) return; const t = ctx.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t); musicBus.gain.linearRampToValueAtTime(S.music * (on ? 0.5 : 1), t + 0.25); }
  return {
    init, setMood, startLoop, stopLoop, speak, duck,
    get musicBus() { return musicBus; }, get sfxBus() { return sfxBus; },
    play(name, ...a) { if (!ctx || S.muted) return; if (FILE_SFX[name] && fileBufs[FILE_SFX[name]]) { playFile(FILE_SFX[name]); return; } try { sfx[name] && sfx[name](...a); } catch (e) {} },
    loadFiles, playFile, hasFile: (k) => !!fileBufs[k], fileDur: (k) => (fileBufs[k] ? fileBufs[k].duration : 0), get fileBufs() { return fileBufs; },
    get settings() { return S; },
    setMusic(v) { S.music = v; if (musicBus) musicBus.gain.value = v; save(); },
    setSfx(v) { S.sfx = v; if (sfxBus) sfxBus.gain.value = v; save(); },
    setVoice(v) { S.voice = v; save(); if (!v && "speechSynthesis" in window) speechSynthesis.cancel(); },
    toggleMute() { S.muted = !S.muted; if (master) master.gain.value = S.muted ? 0 : 1; if (S.muted && "speechSynthesis" in window) speechSynthesis.cancel(); save(); return S.muted; },
    get ctx() { return ctx; },
  };
})();
