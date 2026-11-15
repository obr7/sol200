// =====================================================================
//  EMOTIONS — portraits show how the speaker feels.
//  Moods: calm, happy, worried, scared, sad, angry, hurt.
//  • Team portraits get their mouth + eyebrows redrawn per mood.
//  • Every style gets a small animated emote (sweat drop, anger mark…).
//  • The mood is picked from the line (or set explicitly with {mood}).
// =====================================================================
const MOODS = ["calm", "happy", "worried", "scared", "sad", "angry", "hurt"];
// face landmarks in the 40x40 team portrait (drawn at +1,+1 in a 42 canvas)
const TEAM_FACE = {
  lead:   { skin: [20, 28], mouth: [18, 21, 31, 32], brow: [[12, 17], [23, 28]], by: 21, browC: "#7a5420", smile: false },
  layla:  { skin: [20, 27], mouth: [16, 21, 29, 30], brow: [[13, 17], [23, 27]], by: 18, browC: "#4a2e22", smile: true },
  marcus: { skin: [20, 27], mouth: [17, 24, 33, 33], brow: [[12, 17], [24, 29]], by: 18, browC: "#1e1612", smile: false },
  diego:  { skin: [20, 29], mouth: null, under: [18, 25, 33], brow: [[12, 17], [23, 28]], by: 22, browC: "#1e1612", smile: false },
};
const _moodCache = {};
function moodPortrait(id, blink, talk, mood) {
  mood = MOODS.includes(mood) ? mood : mood === 1 ? "angry" : "calm";
  if (!(CHAR_STYLE === "team" && TeamSheets[id] && TeamSheets[id].porCanvas && TEAM_FACE[id])) {
    // code-drawn portraits: mood 1 = serious face (no smile); smile only when happy
    return getPortrait(id, blink, talk, mood === "happy" ? 0 : 1);
  }
  const key = id + mood;
  if (_moodCache[key]) return _moodCache[key];
  const base = TeamSheets[id].porCanvas, F = TEAM_FACE[id];
  const c = mkCanvas(42, 42), g = c.getContext("2d"); g.drawImage(base, 0, 0);
  const px = g.getImageData(F.skin[0] + 1, F.skin[1] + 1, 1, 1).data, skin = `rgb(${px[0]},${px[1]},${px[2]})`;
  const dark = "#2a1410", P = (x, y, w = 1, h = 1, col = dark) => { g.fillStyle = col; g.fillRect(x + 1, y + 1, w, h); };
  // ---- mouth
  const shape = { calm: "flat", happy: "smile", worried: "wavy", scared: "open", sad: "frown", angry: "frown", hurt: "teeth" }[mood];
  if (F.mouth && !(shape === "smile" && F.smile)) {
    const [x0, x1, y0, y1] = F.mouth, cx = Math.round((x0 + x1) / 2), y = y0;
    P(x0 - 1, y0 - 1, x1 - x0 + 3, y1 - y0 + 3, skin);
    const w = Math.max(3, x1 - x0 - 1), L = cx - (w >> 1);
    if (shape === "flat") P(L, y, w, 1);
    else if (shape === "smile") { P(L + 1, y + 1, w - 2, 1); P(L, y, 1, 1); P(L + w - 1, y, 1, 1); }
    else if (shape === "frown") { P(L + 1, y, w - 2, 1); P(L, y + 1, 1, 1); P(L + w - 1, y + 1, 1, 1); }
    else if (shape === "wavy") { for (let i = 0; i < w; i++) P(L + i, y + (i % 2), 1, 1); }
    else if (shape === "open") { P(cx - 1, y - 1, 3, 1); P(cx - 2, y, 1, 2); P(cx + 2, y, 1, 2); P(cx - 1, y + 2, 3, 1); P(cx - 1, y, 3, 2, "#5a1a1a"); }
    else if (shape === "teeth") { P(L, y - 1, w, 3); P(L + 1, y, w - 2, 1, "#f0ece4"); }
  } else if (F.under && (shape === "open" || shape === "teeth" || shape === "frown")) {
    const [x0, x1, y] = F.under, cx = Math.round((x0 + x1) / 2);
    if (shape === "open") { P(cx - 1, y, 3, 2, "#5a1a1a"); }
    else if (shape === "teeth") { P(cx - 2, y, 5, 1, "#f0ece4"); }
  }
  // ---- eyebrows: angry = inner ends down, worried/sad/scared/hurt = inner ends up
  const tilt = mood === "angry" ? 1 : ["worried", "sad", "scared", "hurt"].includes(mood) ? -1 : 0;
  if (tilt) {
    F.brow.forEach(([a, b], side) => {
      const n = b - a;
      for (let i = 0; i <= n; i++) {
        const k = side === 0 ? i / n : 1 - i / n; // 0 = outer, 1 = inner
        const yy = Math.round(F.by - 1 + tilt * (k * 2 - 1));
        P(a + i, yy, 1, 1, F.browC); P(a + i, yy - 1, 1, 1, F.browC);
      }
    });
  }
  return (_moodCache[key] = c);
}
// small animated emote drawn over a 42x42 portrait
function drawEmote(g, mood, t) {
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
  if (mood === "worried" || mood === "scared" || mood === "hurt") {
    const y = 6 + ((t * 9) % 8);
    P(34, y, 2, 1, "#bfe8ff"); P(33, y + 1, 4, 3, "#6fc4ff"); P(34, y + 4, 2, 1, "#6fc4ff"); P(34, y + 1, 1, 1, "#ffffff");
  }
  if (mood === "scared" || mood === "sad") {
    g.fillStyle = `rgba(80,110,200,${mood === "sad" ? 0.35 : 0.45})`;
    for (let i = 0; i < 4; i++) g.fillRect(13 + i * 4, 7, 1, 5 + (i % 2) * 2);
  }
  if (mood === "angry") {
    const c = ((t * 4) | 0) % 2 ? "#ff3a3a" : "#ff7a5a";
    for (const [x, y, dx, dy] of [[31, 6, 1, -1], [36, 6, -1, -1], [31, 9, 1, 1], [36, 9, -1, 1]]) { P(x, y, 2, 1, c); P(x + (dx > 0 ? 1 : 0), y + dy, 1, 1, c); }
  }
  if (mood === "hurt") { const on = ((t * 5) | 0) % 2; P(6, 8, 1, 1, on ? "#ffd34a" : "#fff"); P(5, 9, 3, 1, "#ffd34a"); P(6, 10, 1, 1, "#ffd34a"); }
  if (mood === "happy") { const on = ((t * 3) | 0) % 2; if (on) { P(34, 6, 1, 3, "#fff6b0"); P(33, 7, 3, 1, "#fff6b0"); } }
}
// hand-picked moods for story lines (matched by a piece of the text)
const MOOD_LINES = [
  ["Earth is waiting for good news", "calm"], ["Everything okay?", "calm"], ["But look at this screen", "worried"], ["It's just dust. Relax", "happy"],
  ["Meet Rosie, our oxygen machine", "happy"], ["soft like flour", "calm"], ["You two, again?", "happy"], ["The first leaves are here", "happy"],
  ["some plants look sick", "worried"], ["I named this one Hope", "happy"], ["Control room, now!", "scared"], ["The storm changed direction", "scared"],
  ["Dust is covering the solar panels", "worried"], ["time is running out", "worried"], ["the garden heaters stop", "worried"], ["Are you okay?", "scared"],
  ["Good call. Come to the power panel", "calm"], ["why do I feel like I lost", "sad"], ["Enough, if we start now", "worried"], ["Listen carefully", "calm"],
  ["I'll be in my room if you need me", "sad"], ["waiting for you to ask", "sad"], ["You never asked me for anything", "calm"], ["I should have. In training too", "sad"],
  ["The danger is over", "calm"], ["we worked as one team", "happy"], ["It shouldn't be the last", "happy"], ["Wake me up when everyone makes peace", "sad"],
  ["A message from Earth", "worried"], ["Hope has a new leaf. Bravest", "happy"], ["No time! I'll do it myself", "angry"], ["We only have 6 units", "worried"],
  ["Pressure holds at", "happy"], ["Last step: the leak check", "calm"], ["We passed by luck", "angry"], ["Training is over", "calm"],
];
// pick a mood from the words in the line
function inferMood(who, text, opts = {}) {
  if (typeof opts.mood === "string") return opts.mood;
  { const s0 = String(text || ""); if (s0.trim() === "..." || s0.trim() === "I...") return "worried"; for (const [k, m] of MOOD_LINES) if (s0.includes(k)) return m; }
  if (opts.mood === 1) return "angry";
  const s = String(text || "");
  if (opts.think) return /did it|right choice|shouldn't be the last/i.test(s) ? "calm" : "worried";
  if (/\bow\b|hurts|my hand|glove is torn|can't work fast/i.test(s)) return "hurt";
  if (/alarm|oxygen (is )?(dropping|running)|emergency|back inside|storm is on top|stopped!|ran low|stopped\b/i.test(s)) return "scared";
  if (/we lost|months of work|nobody is talking|paid for it|sorry|i feel like i lost/i.test(s)) return "sad";
  if (/on you|luck won't|got lucky|like he's the commander|fine\. but/i.test(s)) return "angry";
  if (/careful|too much|too close|hurry|faster|barely|not yet|oh no|danger|storm|how much time|don't know|i can't|try again|watch out|wrong|too hot|easy,/i.test(s)) return "worried";
  if (/great|yes!|we did it|working|new leaf|bravest|shiny|perfect|all clear|well done|nice|healthy|welcome|that's the team|i can hear rosie|locked|sealed|done!|good job|hooray|wow|beautiful|amazing|happy/i.test(s)) return "happy";
  return G.alarm || (G.storm || 0) > 0.5 ? "worried" : "calm";
}
