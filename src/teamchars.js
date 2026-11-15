// =====================================================================
//  TEAM CHARACTERS — the team's own sprite sheets (teamsprites.js).
//  Default character style. Walk frames follow distance walked; idle
//  characters breathe; the outside helmet is drawn on top in code.
// =====================================================================
const TeamSheets = {};
(function loadTeamSheets() {
  for (const id in TEAM_SPRITES) {
    const d = TEAM_SPRITES[id], img = new Image(), por = new Image();
    TeamSheets[id] = { img, por, w: d.w, h: d.h, ready: false, porCanvas: null };
    img.onload = () => { TeamSheets[id].ready = true; };
    por.onload = () => { const c = mkCanvas(42, 42); c.getContext("2d").drawImage(por, 1, 1); TeamSheets[id].porCanvas = c; };
    img.src = d.atlas; por.src = d.portrait;
  }
})();
const TEAM_ROW = [0, 3, 1, 2]; // game dir (down, up, left, right) -> sheet row

function drawCharacterTeam(g, c, t) {
  const S = TeamSheets[c.sprite]; if (!S || !S.ready) return drawCharacterV2(g, c, t);
  const row = TEAM_ROW[c.dir] ?? 0;
  const col = c.moving ? Math.floor((c.walkDist || 0) / 6) % 4 : (row === 1 || row === 2 ? 3 : 0); // side rows: column 3 is the closest to standing
  const x = Math.round(c.x - S.w / 2), y = Math.round(c.y - S.h + 1);
  // shadow
  g.fillStyle = "rgba(0,0,0,0.32)"; g.beginPath(); g.ellipse(Math.round(c.x), Math.round(c.y) - 1, 8, 3, 0, 0, 7); g.fill();
  // idle breathing: the upper body rises 1 px now and then
  const breathe = !c.moving && Math.sin(t * 2.2 + c.blinkOff) > 0.4;
  if (breathe) {
    const cut = Math.round(S.h * 0.62);
    g.drawImage(S.img, col * S.w, row * S.h + cut, S.w, S.h - cut, x, y + cut, S.w, S.h - cut);
    g.drawImage(S.img, col * S.w, row * S.h, S.w, cut, x, y - 1, S.w, cut + 1);
  } else g.drawImage(S.img, col * S.w, row * S.h, S.w, S.h, x, y, S.w, S.h);
  if (c.helmet) {
    const hx = Math.round(c.x), hy = y + 9;
    g.fillStyle = "rgba(170,220,255,0.24)"; g.beginPath(); g.ellipse(hx, hy, 10, 10, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#e6eef8"; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy, 10, 10, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#1b1d2b"; g.beginPath(); g.ellipse(hx, hy, 11, 11, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(hx - 7, hy - 6, 3, 1); g.fillRect(hx - 8, hy - 5, 1, 3);
  }
  if (c.hurt) { const hx = Math.round(c.x) + 5, hy = Math.round(c.y) - 16; g.fillStyle = "#fff"; g.fillRect(hx, hy, 3, 3); g.fillStyle = "#e04040"; g.fillRect(hx + 1, hy, 1, 3); g.fillRect(hx, hy + 1, 3, 1); }
}
// portrait for dialogue / cards (team art when that style is on)
function portraitFor(id, blink, talk, mood) {
  if (CHAR_STYLE === "team" && TeamSheets[id] && TeamSheets[id].porCanvas) return TeamSheets[id].porCanvas;
  return getPortrait(id, blink, talk, mood);
}
function charHeadOffset() { return CHAR_STYLE === "team" ? 46 : CHAR_STYLE === "v2" ? 43 : 34; }
