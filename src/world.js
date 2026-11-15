// =====================================================================
//  WORLD — the Mars base map (Among-Us style rooms + corridors),
//  tiles, props and collision. All art is drawn in code.
// =====================================================================
const T = 16, MW = 80, MH = 40;
const FLOOR = { none: 0, corridor: 1, control: 2, workshop: 3, garden: 4, quarters: 5, airlock: 6, sand: 7 };
const ROOMS = {
  quarters: { x: 3, y: 4, w: 12, h: 8, name: "CREW QUARTERS", floor: "quarters", wall: "#6b5a7a" },
  control:  { x: 21, y: 3, w: 17, h: 9, name: "CONTROL ROOM", floor: "control", wall: "#4b5f86" },
  workshop: { x: 3, y: 22, w: 14, h: 9, name: "WORKSHOP", floor: "workshop", wall: "#7a6250" },
  garden:   { x: 23, y: 21, w: 19, h: 11, name: "GREENHOUSE", floor: "garden", wall: "#4f7a62" },
  airlock:  { x: 45, y: 6, w: 6, h: 5, name: "AIRLOCK", floor: "airlock", wall: "#7a7a62" },
  outside:  { x: 55, y: 1, w: 24, h: 22, name: "MARS SURFACE", floor: "sand", wall: "#8a4a2a", outside: true },
};
const CORRIDORS = [
  [6, 16, 39, 2], [8, 12, 2, 4], [28, 12, 2, 4], [9, 18, 2, 4], [31, 18, 2, 3], [38, 8, 7, 2], [51, 8, 4, 2],
];
const floorMap = new Uint8Array(MW * MH);
const roomMap = new Array(MW * MH).fill(null);
const dynSolid = new Set(); // tile indices blocked at runtime (e.g. locked hatch)
const idx = (x, y) => y * MW + x;
const isFloor = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && floorMap[idx(x, y)] > 0;

function buildMap() {
  for (const id in ROOMS) {
    const r = ROOMS[id];
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { floorMap[idx(x, y)] = FLOOR[r.floor]; roomMap[idx(x, y)] = id; }
  }
  for (const [x0, y0, w, h] of CORRIDORS) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (!floorMap[idx(x, y)]) floorMap[idx(x, y)] = FLOOR.corridor;
  // hatch to outside (locked until the mission needs it)
  dynSolid.add(idx(53, 8)); dynSolid.add(idx(53, 9));
}
function roomAt(px, py) { const x = Math.floor(px / T), y = Math.floor(py / T); if (x < 0 || y < 0 || x >= MW || y >= MH) return null; return roomMap[idx(x, y)] || (floorMap[idx(x, y)] ? "corridor" : null); }

// ---------------------------------------------------------------- props
// type, tile x/y, size in tiles, solid?, fact (discovery key)
const PROPS = [
  // control room
  { id: "sw_console", type: "console", tx: 22, ty: 3, w: 3, h: 1, screen: "sun", fact: "spaceweather", label: "Space Weather" },
  { id: "weather_console", type: "console", tx: 26, ty: 3, w: 5, h: 1, screen: "radar", fact: "dust", label: "Weather Radar" },
  { id: "comms_console", type: "console", tx: 32, ty: 3, w: 3, h: 1, screen: "comms", fact: "delay", label: "Radio to Earth" },
  { id: "power_panel", type: "power", tx: 36, ty: 3, w: 2, h: 1, fact: "power", label: "Power Panel" },
  { id: "holo_table", type: "holotable", tx: 27, ty: 7, w: 4, h: 2, label: "Base Map" },
  { id: "chair1", type: "chair", tx: 23, ty: 5, w: 1, h: 1, solid: false },
  { id: "chair2", type: "chair", tx: 33, ty: 5, w: 1, h: 1, solid: false },
  { id: "plant_c", type: "potplant", tx: 21, ty: 10, w: 1, h: 1 },
  { id: "plant_c2", type: "potplant", tx: 37, ty: 10, w: 1, h: 1 },
  // workshop
  { id: "rosie", type: "rosie", tx: 11, ty: 22, w: 3, h: 2, fact: "moxie", label: "Rosie (Oxygen Maker)" },
  { id: "bench", type: "bench", tx: 14, ty: 22, w: 3, h: 1, fact: "red", label: "Dust Sample Jar" },
  { id: "shelf_w", type: "shelf", tx: 3, ty: 22, w: 2, h: 1 },
  { id: "crates", type: "crates", tx: 14, ty: 28, w: 2, h: 2 },
  { id: "crates2", type: "crates", tx: 3, ty: 29, w: 2, h: 2 },
  { id: "pipes", type: "tank", tx: 5, ty: 22, w: 1, h: 1 },
  // garden
  { id: "tray1", type: "tray", tx: 26, ty: 24, w: 3, h: 1, n: 0 },
  { id: "tray2", type: "tray", tx: 31, ty: 24, w: 3, h: 1, n: 1 },
  { id: "tray3", type: "tray", tx: 36, ty: 24, w: 3, h: 1, n: 2 },
  { id: "tray4", type: "tray", tx: 26, ty: 28, w: 3, h: 1, n: 3 },
  { id: "tray5", type: "tray", tx: 31, ty: 28, w: 3, h: 1, n: 4 },
  { id: "tray6", type: "tray", tx: 36, ty: 28, w: 3, h: 1, n: 5 },
  { id: "hope", type: "hope", tx: 35, ty: 21, w: 1, h: 1, label: "Hope" },
  { id: "veggie", type: "veggie", tx: 24, ty: 21, w: 2, h: 1, fact: "veggie", label: "Veggie Plant Chamber" },
  { id: "soil", type: "soil", tx: 39, ty: 21, w: 2, h: 1, fact: "soil", label: "Mars Soil Sample" },
  { id: "watertank", type: "watertank", tx: 41, ty: 26, w: 1, h: 2, fact: "water", label: "Water Recycler" },
  // quarters
  { id: "bunk_lead", type: "bunk", tx: 3, ty: 4, w: 2, h: 2, color: "#e04848" },
  { id: "bunk_marcus", type: "bunk", tx: 6, ty: 4, w: 2, h: 2, color: "#3b7dd8" },
  { id: "bunk_diego", type: "bunk", tx: 9, ty: 4, w: 2, h: 2, color: "#f08a2a" },
  { id: "bunk_layla", type: "bunk", tx: 12, ty: 4, w: 2, h: 2, color: "#4fb35e" },
  { id: "photo_table", type: "table", tx: 7, ty: 8, w: 2, h: 1, label: "Crew Photo" },
  { id: "scale", type: "scale", tx: 13, ty: 10, w: 1, h: 1, fact: "gravity", label: "Weighing Scale" },
  { id: "clock", type: "clock", tx: 3, ty: 10, w: 1, h: 1, fact: "sol", label: "Mars Clock" },
  { id: "window_q", type: "viewport", tx: 14, ty: 6, w: 1, h: 2, fact: "air", label: "Window" },
  // airlock
  { id: "suits", type: "suits", tx: 45, ty: 6, w: 2, h: 1, fact: "radiation", label: "Spacesuits" },
  { id: "hatch", type: "hatch", tx: 53, ty: 8, w: 1, h: 2, solid: false, label: "Outer Hatch" },
  // outside panels
  { id: "panel0", type: "panel", tx: 59, ty: 4, w: 3, h: 2, n: 0 },
  { id: "panel1", type: "panel", tx: 65, ty: 4, w: 3, h: 2, n: 1 },
  { id: "panel2", type: "panel", tx: 71, ty: 4, w: 3, h: 2, n: 2 },
  { id: "panel3", type: "panel", tx: 59, ty: 13, w: 3, h: 2, n: 3 },
  { id: "panel4", type: "panel", tx: 65, ty: 13, w: 3, h: 2, n: 4 },
  { id: "panel5", type: "panel", tx: 71, ty: 13, w: 3, h: 2, n: 5 },
  { id: "rock1", type: "rock", tx: 63, ty: 9, w: 1, h: 1 }, { id: "rock2", type: "rock", tx: 76, ty: 10, w: 1, h: 1 }, { id: "rock3", type: "rock", tx: 57, ty: 18, w: 2, h: 1 },
  { id: "rock4", type: "rock", tx: 69, ty: 19, w: 1, h: 1 }, { id: "rock5", type: "rock", tx: 75, ty: 2, w: 1, h: 1 },
];
const propById = {};
function initProps() {
  for (const p of PROPS) {
    p.x = p.tx * T; p.y = p.ty * T; p.pw = p.w * T; p.ph = p.h * T;
    if (p.solid === undefined) p.solid = true;
    p.room = roomAt(p.x + 2, p.y + 2);
    p.state = {};
    propById[p.id] = p;
  }
}
function solidAt(px, py) {
  const tx = Math.floor(px / T), ty = Math.floor(py / T);
  if (!isFloor(tx, ty) || dynSolid.has(idx(tx, ty))) return true;
  for (const p of PROPS) if (p.solid && px >= p.x && px < p.x + p.pw && py >= p.y + (p.type === "tray" || p.type === "panel" ? 0 : 0) && py < p.y + p.ph) return true;
  return false;
}
function boxFree(x, y, hw = 4, hh = 3) {
  return !solidAt(x - hw, y - hh) && !solidAt(x + hw, y - hh) && !solidAt(x - hw, y) && !solidAt(x + hw, y);
}

// ---------------------------------------------------------------- deterministic hash for tile variation
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

// ---------------------------------------------------------------- static map art
let MapCanvas = null;
function renderStaticMap() {
  MapCanvas = mkCanvas(MW * T, MH * T);
  const g = MapCanvas.getContext("2d");
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // background (base exterior / ground under the void)
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const X = x * T, Y = y * T, f = floorMap[idx(x, y)];
    if (x >= 54) { // Mars surface region
      const v = hash(x, y);
      R(X, Y, T, T, v < 0.3 ? "#b85f33" : v < 0.6 ? "#c06838" : "#b9622f");
      for (let k = 0; k < 4; k++) { const a = hash(x * 7 + k, y * 3 + k); R(X + ((a * 15) | 0), Y + ((hash(y + k, x) * 15) | 0), 1, 1, a > 0.5 ? "#d98a55" : "#8f4626"); }
      if (!f) { // cliffs / boulders bounding the area
        R(X, Y, T, T, "#7a3a20"); R(X + 1, Y + 1, T - 2, T - 4, "#9a4c2a"); R(X + 3, Y + 2, 5, 3, "#b56236");
      }
      continue;
    }
    if (f) continue;
    R(X, Y, T, T, "#0b0c16");
    if (hash(x, y) > 0.93) R(X + ((hash(y, x) * 14) | 0), Y + ((hash(x + 3, y) * 14) | 0), 1, 1, "#262a40");
  }
  // floors
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const f = floorMap[idx(x, y)]; if (!f) continue;
    const X = x * T, Y = y * T, v = hash(x, y);
    switch (f) {
      case FLOOR.corridor:
        R(X, Y, T, T, "#454c63"); R(X, Y, T, 1, "#565e78"); R(X, Y + 15, T, 1, "#363c50"); R(X + 15, Y, 1, T, "#3a4054");
        R(X + 2, Y + 2, 1, 1, "#6a7390"); R(X + 13, Y + 13, 1, 1, "#6a7390");
        if (!isFloor(x, y - 1) && isFloor(x, y + 1) && !isFloor(x, y + 2)) {} // narrow
        break;
      case FLOOR.control:
        R(X, Y, T, T, (x + y) % 2 ? "#33415e" : "#2f3c58"); R(X, Y, T, 1, "#3e4d6e"); R(X, Y, 1, T, "#3a4868");
        if (v > 0.85) R(X + 4, Y + 6, 8, 1, "#3b4a6a");
        break;
      case FLOOR.workshop:
        R(X, Y, T, T, "#56595f"); for (let i = 1; i < 16; i += 3) R(X + 1, Y + i, T - 2, 1, "#45484e"); R(X, Y, T, 1, "#6a6d74"); R(X, Y, 1, T, "#3d4045"); R(X + 15, Y, 1, T, "#3d4045");
        if (v > 0.96) { g.fillStyle = "rgba(20,15,10,0.35)"; g.beginPath(); g.ellipse(X + 8, Y + 9, 5, 3, 0, 0, 7); g.fill(); }
        break;
      case FLOOR.garden:
        R(X, Y, T, T, "#a7b9aa"); R(X, Y, T, 1, "#bdcdbf"); R(X, Y, 1, T, "#bdcdbf"); R(X + 15, Y, 1, T, "#8fa293"); R(X, Y + 15, T, 1, "#8fa293");
        if (v > 0.9) R(X + 5, Y + 5, 2, 2, "#8bb08f");
        break;
      case FLOOR.quarters:
        R(X, Y, T, T, "#7d5a40"); R(X, Y + ((x % 2) ? 7 : 3), T, 1, "#6a4a33"); R(X, Y + 15, T, 1, "#5e412d"); R(X + ((v * 12) | 0), Y + 2, 1, 1, "#946c4f");
        break;
      case FLOOR.airlock:
        R(X, Y, T, T, "#55565e"); R(X, Y, T, 1, "#66676f");
        if (y === 6 || y === 10) for (let i = 0; i < 16; i += 4) { R(X + i, Y + (y === 6 ? 0 : 13), 2, 3, "#e8c040"); R(X + i + 2, Y + (y === 6 ? 0 : 13), 2, 3, "#222"); }
        break;
      case FLOOR.sand: break;
    }
  }
  // rugs / decals
  const rug = (x, y, w, h, c1, c2) => { R(x * T + 4, y * T + 4, w * T - 8, h * T - 8, c1); R(x * T + 7, y * T + 7, w * T - 14, h * T - 14, c2); };
  rug(6, 7, 5, 3, "#3d5a8a", "#4f6fa3");
  // corridor guide stripes
  for (let x = 6; x < 45; x++) { R(x * T, 16 * T + 15, T, 2, x % 2 ? "#c9a536" : "#2b2b2b"); }
  // walls
  for (let y = 0; y < MH; y++) for (let x = 0; x < 54; x++) {
    if (isFloor(x, y)) continue;
    const X = x * T, Y = y * T;
    const below = isFloor(x, y + 1);
    const near = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]].some(([dx, dy]) => isFloor(x + dx, y + dy));
    const near2 = isFloor(x, y + 2);
    const rid = below ? roomMap[idx(x, y + 1)] : null;
    const wc = rid && ROOMS[rid] ? ROOMS[rid].wall : "#4a5068";
    if (below) { // wall face
      R(X, Y, T, T, wc); R(X, Y, T, 2, shade(wc, 0.25)); R(X, Y + 13, T, 3, shade(wc, -0.35)); R(X, Y + 12, T, 1, shade(wc, -0.15));
      R(X + 15, Y + 2, 1, 10, shade(wc, -0.12));
      if (rid === "garden" && x % 3 === 0) { R(X + 2, Y + 2, 12, 9, "#3a3f55"); const sky = g.createLinearGradient(0, Y + 3, 0, Y + 10); sky.addColorStop(0, "#e0a070"); sky.addColorStop(1, "#c86a3a"); g.fillStyle = sky; g.fillRect(X + 3, Y + 3, 10, 7); R(X + 3, Y + 8, 10, 2, "#9a4a2a"); R(X + 5, Y + 7, 4, 1, "#9a4a2a"); R(X + 3, Y + 3, 2, 1, "rgba(255,255,255,0.5)"); }
      else if (rid === "control" && x % 4 === 1) { R(X + 3, Y + 3, 10, 7, "#11182a"); R(X + 4, Y + 4, 8, 5, "#1a3a5a"); R(X + 5, Y + 5, (hash(x, 1) * 6 | 0) + 1, 1, "#5dd0ff"); R(X + 5, Y + 7, (hash(x, 2) * 6 | 0) + 1, 1, "#5dff8a"); }
      else if (rid === "workshop") { R(X, Y + 4, T, 3, "#8a7a6a"); R(X, Y + 5, T, 1, "#a89888"); if (x % 4 === 2) { R(X + 6, Y + 2, 4, 7, "#c04a3a"); R(X + 7, Y + 3, 2, 1, "#e07060"); } if (x % 5 === 0) R(X + 2, Y + 8, 3, 4, "#ffd34a"); }
      else if (rid === "quarters" && (x === 5 || x === 11)) { R(X + 2, Y + 1, 12, 10, "#f0e6d0"); R(X + 3, Y + 2, 10, 8, "#1a2a5a"); g.fillStyle = "#3a8ad0"; g.beginPath(); g.arc(X + 8, Y + 6, 3, 0, 7); g.fill(); R(X + 7, Y + 5, 2, 1, "#4ab05a"); }
      else if (rid === "airlock" && x % 2 === 0) { R(X + 1, Y + 2, 14, 2, "#e8c040"); R(X + 3, Y + 2, 3, 2, "#222"); R(X + 10, Y + 2, 3, 2, "#222"); }
      else if (!rid && x % 6 === 0) { R(X + 4, Y + 3, 8, 2, "#ffe9a0"); R(X + 3, Y + 5, 10, 1, "rgba(255,233,160,0.3)"); }
      else if (hash(x, y) > 0.7) { R(X + 5, Y + 5, 6, 3, shade(wc, -0.2)); R(X + 6, Y + 6, 1, 1, "#7cf7a0"); }
    } else if (near || near2) {
      R(X, Y, T, T, "#232738"); R(X + 1, Y + 1, T - 2, T - 2, "#2c3146");
      if (isFloor(x - 1, y)) R(X, Y, 2, T, "#3a4060"); if (isFloor(x + 1, y)) R(X + 14, Y, 2, T, "#3a4060");
      if (isFloor(x, y - 1)) R(X, Y, T, 3, "#3a4060");
      if (near2 && !near) R(X, Y + 13, T, 3, "#3a4060");
    }
  }
  // ink lines (team sprite style): dark edge where floor meets wall, darker grout, bevels
  for (let y = 0; y < MH; y++) for (let x = 0; x < 54; x++) {
    const X = x * T, Y = y * T;
    if (isFloor(x, y)) {
      const f = floorMap[idx(x, y)];
      if (f !== FLOOR.sand) { R(X, Y + 15, T, 1, "rgba(8,6,14,0.35)"); R(X + 15, Y, 1, T, "rgba(8,6,14,0.35)"); R(X, Y, T, 1, "rgba(255,255,255,0.06)"); }
      if (!isFloor(x, y - 1)) { R(X, Y, T, 2, "#0d0b12"); R(X, Y + 2, T, 3, "rgba(0,0,0,0.28)"); }
      if (!isFloor(x - 1, y)) { R(X, Y, 1, T, "#0d0b12"); R(X + 1, Y, 2, T, "rgba(0,0,0,0.2)"); }
      if (!isFloor(x + 1, y)) { R(X + 15, Y, 1, T, "#0d0b12"); R(X + 13, Y, 2, T, "rgba(0,0,0,0.2)"); }
      if (!isFloor(x, y + 1)) R(X, Y + 15, T, 1, "#0d0b12");
    } else {
      const below = isFloor(x, y + 1);
      if (below && !isFloor(x, y - 1)) R(X, Y, T, 1, "#0d0b12"); // top of a wall face
      if (below) { if (!isFloor(x - 1, y) && !isFloor(x - 1, y + 1)) R(X, Y, 1, T, "#0d0b12"); if (!isFloor(x + 1, y) && !isFloor(x + 1, y + 1)) R(X + 15, Y, 1, T, "#0d0b12"); }
      else if (isFloor(x, y + 2)) R(X, Y + 15, T, 1, "#0d0b12"); // cap above a wall face
    }
  }
  // base hull edge outside
  for (let y = 0; y < MH; y++) { if (y === 8 || y === 9) continue; R(54 * T, y * T, T, T, "#2c3146"); R(54 * T + 12, y * T, 4, T, "#3a4060"); }
}
function shade(hex, amt) { const [r, g, b] = hexToRgb(hex); const f = (c) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)))); return `rgb(${f(r)},${f(g)},${f(b)})`; }
