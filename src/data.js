// =====================================================================
//  REAL NASA DATA + SOURCES
//  Every fact shown in the game points to a source in SOURCES.
//  Numbers marked "assumption" in BALANCE (config.js) are game-only.
// =====================================================================
const SOURCES = {
  marsTrek: { name: "NASA Mars Trek — Viking MDIM 2.1 colour mosaic (live map tiles)", url: "https://trek.nasa.gov/mars/", agency: "NASA / JPL" },
  donki: { name: "NASA DONKI — Space Weather Database Of Notifications, Knowledge, Information", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", agency: "NASA" },
  donkiApi: { name: "NASA Open APIs — DONKI Solar Flare (FLR) endpoint", url: "https://api.nasa.gov/", agency: "NASA" },
  marsStorm2024: { name: "NASA — NASA Watches Mars Light Up During Epic Solar Storm (June 2024)", url: "https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/", agency: "NASA" },
  moxie: { name: "NASA — Oxygen-Generating Experiment MOXIE Completes Mars Mission (2023)", url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/", agency: "NASA" },
  veggie: { name: "NASA — Veggie Fact Sheet", url: "https://www.nasa.gov/wp-content/uploads/2019/04/veggie_fact_sheet_508.pdf", agency: "NASA" },
  spaceCrops: { name: "NASA Science — Space Crops", url: "https://science.nasa.gov/biological-physical/space-crops/", agency: "NASA" },
  insightDust: { name: "NASA — InSight Sees Power Levels Stabilize After Dust Storm", url: "https://www.nasa.gov/solar-system/nasas-insight-sees-power-levels-stabilize-after-dust-storm/", agency: "NASA" },
  oppy: { name: "NASA APOD — Opportunity and the 2018 Mars dust storm", url: "https://apod.nasa.gov/apod/ap181004.html", agency: "NASA" },
  redPlanet: { name: "NASA Red Planet Dispatch blog (Mars soil & perchlorates)", url: "https://blogs.nasa.gov/redplanetdispatch/", agency: "NASA" },
  marsFacts: { name: "NASA Science — Mars Facts", url: "https://science.nasa.gov/mars/facts/", agency: "NASA" },
  esaDelay: { name: "ESA Mars Express blog — Spacecraft event time vs. Earth receive time", url: "https://blogs.esa.int/mex/?p=257", agency: "ESA (partner agency)" },
  csaFarming: { name: "Canadian Space Agency — Interplanetary Farming activity", url: "https://www.csa-asc.gc.ca/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.asp", agency: "CSA (partner agency)" },
  csaFood: { name: "Canadian Space Agency — Food production toolkit", url: "https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/", agency: "CSA (partner agency)" },
};

// Archived real space-weather records used when the live DONKI call is not available.
// (Shown in-game as ARCHIVED, never as live.)
const ARCHIVED_SPACE_WEATHER = {
  flares: [
    { classType: "X8.7", peakTime: "2024-05-14T16:51Z", note: "Biggest flare of Solar Cycle 25 at the time (seen by NASA SDO).", src: "donki" },
  ],
  marsEvent: {
    date: "2024-05-20",
    flare: "about X12 (estimated with Solar Orbiter)",
    doseMicroGray: 8100,
    chestXrays: 30,
    src: "marsStorm2024",
  },
};

// Discoverable facts ("Discovery Journal"). key -> card
const FACTS = {
  dust: {
    title: "Mars Dust Storms", icon: "🌪️", src: ["oppy", "insightDust"],
    text: "Mars has dust storms that can grow to cover the WHOLE planet. Dust in the air blocks sunlight, and dust that lands on solar panels makes them weaker.",
    real: "In 2018 a planet-wide storm blocked so much sunlight that NASA lost contact with the solar-powered Opportunity rover.",
  },
  delay: {
    title: "Talking to Earth", icon: "📡", src: ["esaDelay"],
    text: "Radio messages travel at the speed of light, but Mars is SO far away that a message takes minutes to arrive.",
    real: "One-way delay is about 4 minutes when the planets are close, and about 24 minutes when they are far apart. That's why the crew must make their own decisions!",
  },
  power: {
    title: "Solar Power on Mars", icon: "☀️", src: ["marsFacts", "insightDust"],
    text: "Mars is farther from the Sun than Earth, so sunlight there is weaker — less than half as strong. Every watt of power is precious.",
    real: "Power has to be split between air, heat, plants and radio. You can't run everything at once!",
  },
  gravity: {
    title: "Mars Gravity", icon: "🪐", src: ["marsFacts"], calc: "weight",
    text: "Gravity on Mars is only about 38% of Earth's. You could jump much higher there!",
    real: "Try it: type your weight and see what a scale on Mars would show.",
  },
  sol: {
    title: "A Day on Mars = a 'Sol'", icon: "🕐", src: ["marsFacts"],
    text: "A sol is one day on Mars — a little longer than an Earth day. One sol lasts about 24 hours and 40 minutes.",
    real: "We say 'sol' instead of 'day' so nobody mixes up Mars days and Earth days. Our crew is on Sol 200!",
  },
  air: {
    title: "Mars Air", icon: "🌬️", src: ["marsFacts"],
    text: "Mars air is about 95% carbon dioxide and very, very thin — less than 1% as thick as Earth's air. It's also freezing: around −60 °C on average.",
    real: "That's why astronauts need spacesuits, airlocks and heaters to stay alive.",
  },
  red: {
    title: "Why is Mars Red?", icon: "🔴", src: ["marsFacts"],
    text: "Mars dust and rocks have lots of iron in them. When iron rusts, it turns reddish — so Mars is literally a rusty planet!",
    real: "Mars dust is super fine, like flour, and gets into everything.",
  },
  moxie: {
    title: "Making Oxygen on Mars", icon: "🫧", src: ["moxie"],
    text: "Rosie works like a real NASA machine called MOXIE. MOXIE flew to Mars on the Perseverance rover and turned carbon dioxide from Mars air into oxygen!",
    real: "MOXIE made 122 grams of oxygen in total — about what a small dog breathes in 10 hours. At its best it made 12 grams every hour.",
  },
  veggie: {
    title: "Food Grown in Space", icon: "🥬", src: ["veggie", "spaceCrops"],
    text: "Astronauts have already grown food in space! In 2015, the crew of the International Space Station grew red lettuce in a plant chamber called Veggie — and ate it.",
    real: "NASA is now testing which crops could grow on the Moon and Mars.",
  },
  soil: {
    title: "Can Plants Grow in Mars Soil?", icon: "🧪", src: ["redPlanet", "csaFarming"],
    text: "Mars soil has harmful salts called perchlorates. So in our garden, roots grow in water mixed with plant food instead. This is called hydroponics.",
    real: "Red and blue lamps give plants the colors they use most — that's why the garden glows purple!",
  },
  radiation: {
    title: "Solar Storms Reach Mars", icon: "☢️", src: ["marsStorm2024", "donki"],
    text: "Mars has no global magnetic shield and its air is thin, so radiation from the Sun can reach the ground. Walls, rock and shelters help protect astronauts.",
    real: "On May 20, 2024 a huge solar storm hit Mars. NASA's Curiosity rover measured 8,100 micrograys — like getting 30 chest X-rays at once!",
  },
  spaceweather: {
    title: "Space Weather Forecast", icon: "🌞", src: ["donki", "donkiApi"], live: true,
    text: "NASA watches the Sun every day. Flares are rated A, B, C, M and X — X is the strongest. Each letter is 10 times stronger than the one before!",
    real: "This console reads NASA's DONKI database — the same kind of data flight controllers use to decide when astronauts need extra shielding.",
  },
  water: {
    title: "Every Drop Counts", icon: "💧", src: ["csaFarming", "spaceCrops"],
    text: "Water is very hard to bring from Earth. On a space base, water is cleaned and reused again and again — for drinking, for plants, and even from the air the crew breathes out!",
    real: "Plants also 'breathe out' water vapor that can be collected.",
  },
};

// ---------------------------------------------------------------------
// Live DONKI fetch (NASA Open APIs). Falls back to ARCHIVED data.
// ---------------------------------------------------------------------
const SpaceWeather = {
  status: "idle", // idle | loading | live | archived
  flares: [],
  strongest: null,
  fetchedAt: null,
  async load() {
    if (this.status === "loading" || this.status === "live") return;
    this.status = "loading";
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 86400000);
    const f = (d) => d.toISOString().slice(0, 10);
    const url = `https://api.nasa.gov/DONKI/FLR?startDate=${f(start)}&endDate=${f(end)}&api_key=${CONFIG.NASA_API_KEY}`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("bad data");
      this.flares = data
        .filter((x) => x && x.classType)
        .map((x) => ({ classType: x.classType, peakTime: x.peakTime || x.beginTime, link: x.link }))
        .sort((a, b) => (a.peakTime < b.peakTime ? 1 : -1));
      this.status = "live";
      this.fetchedAt = new Date();
    } catch (e) {
      this.flares = ARCHIVED_SPACE_WEATHER.flares.slice();
      this.status = "archived";
    }
    this.strongest = this.flares.reduce((best, x) => (!best || flareValue(x.classType) > flareValue(best.classType) ? x : best), null);
  },
  // risk level from the last 7 days (live) or the archived record
  risk() {
    let list = this.flares;
    if (this.status === "live") {
      const cut = Date.now() - 7 * 86400000;
      list = list.filter((x) => new Date(x.peakTime).getTime() >= cut);
    }
    const s = list.reduce((b, x) => Math.max(b, flareValue(x.classType)), 0);
    if (s >= 1e-4) return "X";
    if (s >= 1e-5) return "M";
    return "quiet";
  },
};
function flareValue(c) {
  if (!c) return 0;
  const m = { A: 1e-8, B: 1e-7, C: 1e-6, M: 1e-5, X: 1e-4 }[c[0]] || 0;
  return m * (parseFloat(c.slice(1)) || 1);
}
