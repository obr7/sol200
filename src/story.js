// =====================================================================
//  STORY — Chapter 1 "The Commander". ALL dialogue lives here so the
//  writer can edit lines without touching game code.
//  {lead} {marcus} {diego} {layla} are replaced by CONFIG.NAMES.
// =====================================================================
const STORY = {
  chapterTitle: "Chapter One: The Commander",
  nextChapter: "Chapter Two: Marcus — Coming Soon",
  meters: {
    safety: { label: "SAFETY", icon: "🛡️", color: "#4fa8ff", help: "Is the crew okay?" },
    mission: { label: "MISSION", icon: "🌱", color: "#5dd06a", help: "Are we growing the first food on Mars?" },
    team: { label: "TEAM", icon: "🤝", color: "#ffb84a", help: "Are we working together — or fighting?" },
  },
  characters: {
    lead: { role: "Mission Commander", good: "Brave, decides fast, cheers up the team", from: "USA" },
    marcus: { role: "Deputy Commander", good: "Planning — he knows every machine and map in the base", from: "USA" },
    diego: { role: "Mechanical Engineer", good: "Fixing ANY machine, and making everyone laugh", from: "Mexico" },
    layla: { role: "Plant Scientist — in charge of food", good: "Patient, notices tiny details, cares for the team", from: "Jordan" },
  },
  INTRO_LINES: [
    "A year and a half ago, four astronauts left Earth on a mission no one had ever done before: to grow the first food on another planet.",
    "Seven months in space... until they reached their new home.",
    "Mars. The red planet. Its air is too thin to breathe, and it's colder than anywhere on Earth.",
    "Messages to Earth take many minutes to arrive. So when danger comes, the crew must decide on their own.",
    "But can they work together... when the storm comes?",
  ],
  gardenCards: [
    { q: "Why grow food on Mars?", a: "Food from Earth takes months to arrive. If we grow our own, we can stay longer.", i: "🚀" },
    { q: "Why no Mars soil?", a: "Mars soil has harmful chemicals. So the roots grow in water mixed with plant food.", i: "🧪" },
    { q: "Why is the light purple?", a: "Red and blue lamps together. Plants use these colors the most to make their food.", i: "💜" },
    { q: "Why is the garden closed and warm?", a: "Mars is very cold and the air is thin. Outside, plants would freeze. Heaters need power.", i: "🌡️" },
    { q: "Has anyone grown food in space?", a: "Yes! Astronauts grew lettuce on the International Space Station and ate it.", i: "🥬" },
  ],
  learn: [
    "Power on Mars is limited. It can't run everything at once.",
    "Plants and oxygen machines help us live far from Earth.",
    "A good leader listens to the team. Asking for help is not weakness.",
  ],
};

// ---------------------------------------------------------------------
const Story = {
  phase: "", panelsMission: null,
  // place everyone, reset meters (used by the intro hand-off and by "Play again")
  setup() {
    resetState(); UI.buildMeters();
    const N = Game.npc, P = Game.player;
    Game.place(P, 29, 9, 1); Game.place(N.marcus, 28, 4, 1); Game.place(N.diego, 12, 25, 1); Game.place(N.layla, 34, 22, 0);
    N.diego.follow = null; N.layla.follow = null; N.diego.hurt = false; P.helmet = false; for (const n of Object.values(N)) n.helmet = false;
    for (const c of Game.chars) c.visible = true;
    dynSolid.add(idx(53, 8)); dynSolid.add(idx(53, 9));
    Cam.x = P.x - VW / 2; Cam.y = P.y - 12 - VH / 2; Game.room = null; Game.setTarget(null);
    SpaceWeather.load();
  },
  // start playing (after the intro's dither dissolve, or after a fade)
  async begin() {
    Game.mode = "play"; $("#hud").classList.remove("off");
    Sound.setMood("calm"); Sound.startLoop("hum");
    await this.scene1();
  },
  async start() {
    this.setup();
    Game.mode = "play"; $("#hud").classList.remove("off");
    await UI.fade(false);
    await this.begin();
  },

  // ------------------------------------------------------------ SCENE 1 — control room
  async scene1() {
    const N = Game.npc;
    UI.banner("SOL 200 · CONTROL ROOM");
    await sleep(900);
    await UI.charCard("lead", "That's YOU! Every choice you make changes the story.");
    await UI.say("lead", "Sol 200. Earth is waiting for good news. I won't let them down.", { think: true });
    UI.toast("☀️ A <b>sol</b> is one day on Mars — a little longer than an Earth day.", 5000);
    setTimeout(() => UI.toast(document.body.classList.contains("touch") ? "Use the joystick to move. Press A to talk." : "Use the <b>arrows</b> (or WASD) to move. Press <b>Space</b> to talk.", 5000), 5200);
    UI.objective("Talk to {marcus} at the weather screen");
    Game.setTarget({ x: N.marcus.x, y: N.marcus.y });
    await Game.waitTalk("talk_marcus", N.marcus);
    Game.setTarget(null);
    await UI.charCard("marcus");
    await UI.talk([
      ["lead", "Morning, {marcus}. Everything okay?"],
      ["marcus", "Systems are fine. But look at this screen. Dust is building up in the south."],
      ["lead", "It's just dust. Relax. I've got this."],
      ["marcus", "You've got this? Like you had it in training?", { mood: 1 }],
      ["lead", "Training is over, {marcus}. And we passed."],
      ["marcus", "We passed by luck. Luck doesn't always come back.", { mood: 1 }],
    ]);
    G.storm = 0.05;
    UI.toast("💡 Tip: things with a <b>?</b> hold real NASA science. Collect them in your 📖 journal!", 4500);
    await this.scene2();
  },

  // ------------------------------------------------------------ SCENE 2 — workshop
  async scene2() {
    const N = Game.npc;
    UI.objective("Go to the Workshop and find {diego}");
    Game.setTarget({ x: N.diego.x, y: N.diego.y });
    await Game.waitTalk("talk_diego", N.diego);
    Game.setTarget(null);
    await UI.charCard("diego");
    await UI.talk([
      ["diego", "Hey, Commander! Meet Rosie, our oxygen machine. I just cleaned her."],
      ["diego", "Mars dust is soft like flour, and it gets into everything. No Rosie, no air!"],
      ["lead", "Great job. {marcus} is worried about the dust too."],
      ["diego", "You two, again? Nope. I fix machines, not people."],
      ["diego", "Go see {layla}. She has news about the plants."],
    ]);
    await this.scene3();
  },

  // ------------------------------------------------------------ SCENE 3 — garden
  async scene3() {
    const N = Game.npc;
    UI.objective("Go to the Greenhouse and find {layla}");
    Game.setTarget({ x: N.layla.x, y: N.layla.y });
    await Game.waitTalk("talk_layla", N.layla);
    Game.setTarget(null);
    await UI.charCard("layla");
    await UI.talk([
      ["layla", "{lead}! The first leaves are here!"],
      ["layla", "But some plants look sick. Can you help me check them?"],
    ]);
    await UI.choose("", ["Of course. Let's go!"]);
    await Minigames.flipCards();
    // Garden Check
    const probs = ["water", "light", "heat"].sort(() => Math.random() - 0.5);
    probs.forEach((p, i) => { G.trays[i] = { problem: p }; if (p === "light") G.trays[i].lightOff = true; });
    UI.objective("Garden Check: fix the 3 sick trays");
    const gres = await Minigames.garden();
    const lost = (gres && gres.damage) || 0;
    meter({ mission: Math.max(2, BALANCE.gardenCheck.mission - lost * 3) }, lost ? `🌱 Trays healthy — but ${lost} ${lost > 1 ? "leaves" : "leaf"} lost.` : "🌱 All three trays are healthy!");
    await UI.talk([
      ["layla", "Thank you! I named this one Hope. If it grows, it will be the first food grown on Mars."],
      ["layla", "{lead}... {marcus} says the dust storm is getting bigger. You're listening to him, right?"],
      ["lead", "I..."],
    ]);
    // ALARM
    G.alarm = true; Sound.setMood("tension"); Cam.shake = 0.6; G.storm = 0.25;
    await sleep(700);
    await UI.say("marcus", "{lead}! Control room, now!", { radio: true });

    UI.objective("Hurry to the Control Room!");
    Game.setTarget({ x: 29 * T + 8, y: 7 * T });
    N.layla.follow = Game.player;
    Game.place(N.diego, 33, 7, 2); Game.place(N.marcus, 27, 5, 0);
    await Game.waitRoom("control");
    Game.setTarget(null);
    await this.scene4();
  },

  // ------------------------------------------------------------ SCENE 4 — the storm (decision 1)
  async scene4() {
    const N = Game.npc, P = Game.player;
    N.layla.follow = null; await sleep(300);
    Game.freeze = true;
    await Game.walkNpc(P, 29 * T + 8, 7 * T + 4); P.dir = 1;
    Game.place(N.layla, 25, 7, 3); N.marcus.dir = 0; N.diego.dir = 2;
    Game.freeze = false;
    G.alarm = true;
    await UI.talk([
      ["marcus", "The storm changed direction. It will hit us in one hour."],
      ["marcus", "Dust is covering the solar panels. Our power is dropping."],
      () => { G.power = 0.55; Sound.play("powerDown"); },
      ["lead", "Then we go out now and clean the panels!"],
      ["marcus", "Going out now is dangerous! We stay inside and share the little power we have.", { mood: 1 }],
      ["lead", "I'm the commander here, {marcus}!", { mood: 1 }],
      ["marcus", "And that's the whole problem!", { mood: 1 }],
      ["diego", "Guys... time is running out."],
      ["layla", "If the power drops too low, the garden heaters stop... and Hope won't survive."],
    ]);
    G.alarm = false; // decision time: sound and red light stop together
    const c = await UI.choose("You are {lead}. What will you do?", ["Let's go out and clean the panels. {diego}, with me!", "Fine... we stay inside and share the power."]);
    G.d1 = c === 0 ? "A" : "B";
    if (G.d1 === "A") await this.pathA(); else await this.pathB();
    await this.scene5();
  },

  // ------------------------------------------------------------ PATH A — go outside
  async pathA() {
    const N = Game.npc, P = Game.player;
    await UI.say("marcus", "If something happens out there, that's on you.", { mood: 1 });
    meter(BALANCE.d1A, "You chose speed over safety.");
    // real space-weather check before going out
    await SpaceWeather.load();
    const risk = SpaceWeather.risk();
    const radCost = BALANCE.radiation[risk];
    await UI.card(`<h3>MISSION BRIEF</h3><div class="big">☀️</div><h1>Clean the Panels</h1><p>The base gets its power from the Sun through solar panels. When dust covers them, light can't reach them, and power drops. If we clean them before the storm, we keep more power. But outside is dangerous: you can't see well, and time is short.</p>
      <div class="real"><span class="tag">REAL NASA SPACE WEATHER CHECK</span><br>Outside, the base walls can't protect you from radiation from the Sun.${UI.spaceWeatherHtml()}<br><b>${radCost ? `Sun is active → going outside costs ${radCost} extra SAFETY.` : "The Sun is calm right now → no extra radiation cost."}</b></div>${UI.srcHtml(["donki", "marsStorm2024"])}`,
      [{ id: "go", label: "Suit up! 🧑‍🚀", cls: "go" }], { cls: "wide" });
    if (radCost) meter({ safety: radCost }, "☢️ Real solar activity: extra radiation outside!");
    UI.objective("Go to the Airlock with {diego}");
    N.diego.follow = P;
    Game.setTarget({ x: 48 * T, y: 8 * T + 8 });
    await Game.waitRoom("airlock");
    Game.setTarget(null);
    const suit = await Minigames.suitUp();
    if (suit && !suit.mistakes) meter({ safety: 3 }, "🧑‍🚀 Perfect suit check — careful work!");
    Sound.setMood("tension");
    Sound.play("door"); P.helmet = true; N.diego.helmet = true; Particles.sparkle(P.x, P.y - 10);
    G.hatchOpen = true; dynSolid.delete(idx(53, 8)); dynSolid.delete(idx(53, 9));
    UI.toast("🧑‍🚀 Helmets on! The outer hatch is open.");
    UI.objective("Go outside to the solar panels");
    Game.setTarget({ x: 60 * T, y: 9 * T });
    await Game.waitRoom("outside");
    Game.setTarget(null);
    Sound.setMood("outside"); Sound.startLoop("wind"); Sound.startLoop("storm");
    const res = await Minigames.panels();
    // back inside
    await UI.fade(true);
    Sound.stopLoop("wind"); Sound.stopLoop("storm");
    P.helmet = false; N.diego.helmet = false; N.diego.follow = null; N.diego.hurt = true;
    G.hatchOpen = false; dynSolid.add(idx(53, 8)); dynSolid.add(idx(53, 9));
    Game.place(P, 47, 8, 2); Game.place(N.diego, 49, 9, 2); Game.place(N.layla, 46, 9, 3); Game.place(N.marcus, 48, 7, 0);
    Cam.x = P.x - VW / 2; Cam.y = P.y - VH / 2;
    Sound.setMood("tension");
    await UI.fade(false);
    await UI.talk([
      ["layla", "{diego}! Are you okay?"],
      ["diego", "I'm fine... but my hand hurts. That was too close."],
      ["lead", "But the panels are clean, and the garden is warm. We did it."],
      ["marcus", "You got lucky again. And this time, {diego} paid for it.", { mood: 1 }],
    ]);
    G.flags.diegoHurt = true;
    meter({ mission: res.good ? BALANCE.panels.goodMission : BALANCE.panels.poorMission }, res.good ? `☀️ ${res.cleaned}/6 panels clean — power saved!` : `☀️ Only ${res.cleaned}/6 panels clean.`);
    G.power = 0.4 + res.cleaned * 0.08;
  },

  // ------------------------------------------------------------ PATH B — stay inside
  async pathB() {
    const N = Game.npc;
    await UI.say("marcus", "Good call. Come to the power panel.");
    await UI.say("lead", "\"Good call\"... He says it like he's the commander.", { think: true });
    meter(BALANCE.d1B, "You chose safety. But the garden will get less power.");
    UI.objective("Use the Power Panel");
    const pp = propById.power_panel;
    Game.setTarget({ x: pp.x + pp.pw / 2, y: pp.y + pp.ph + 8 });
    await Game.walkNpc(N.marcus, pp.x - 6, pp.y + pp.ph + 10);
    await new Promise((res) => Game.addInteract({ id: "use_power", x: pp.x + pp.pw / 2, y: pp.y + pp.ph + 8, label: "Use", name: "Power Panel", marker: () => "!", use: async () => { Game.removeInteract("use_power"); res(); } }));
    Game.setTarget(null);
    await UI.card(`<h3>MISSION BRIEF</h3><div class="big">⚡</div><h1>Share the Power</h1><p>There isn't enough power for every machine. Oxygen and crew heaters keep us alive, so they come first. If we cut power to part of the garden, we stay safe, but some plants may die.</p>${UI.srcHtml(["marsFacts", "insightDust"])}`, [{ id: "go", label: "Let's do it!", cls: "go" }]);
    const res = await Minigames.power();
    G.trays[3].dead = true; G.trays[4].dead = true;
    await UI.talk([
      ["layla", "We lost two trays... months of work. But Hope is still alive."],
      ["diego", "And we're all alive too. That's what matters."],
      ["lead", "It was the right choice... so why do I feel like I lost?", { think: true }],
    ]);
  },

  // ------------------------------------------------------------ SCENE 5 — Rosie (decision 2)
  async scene5() {
    const N = Game.npc, P = Game.player;
    // the storm hits
    G.storm = 0.8; G.alarm = true; Sound.startLoop("wind"); Sound.startLoop("storm"); Cam.shake = 1.2; Sound.play("rumble", 3);
    G.rosieBroken = true;
    UI.toast("🚨 ALARM: the oxygen machine stopped!", 3500);
    await sleep(1800);

    UI.objective("Get to the Workshop — Rosie stopped!");
    Game.place(N.diego, 10, 25, 3); Game.place(N.marcus, 14, 25, 2); Game.place(N.layla, 12, 28, 1);
    Game.setTarget({ x: 12 * T + 8, y: 26 * T });
    await Game.waitRoom("workshop");
    Game.setTarget(null); G.alarm = false;
    Game.freeze = true; await Game.walkNpc(P, 12 * T + 8, 26 * T + 4); P.dir = 1; Game.freeze = false;
    N.diego.dir = 3; N.marcus.dir = 2; N.layla.dir = 1;
    UI.toast("🫧 OXYGEN IS DROPPING", 2500);
    const lines = [
      ["marcus", "The storm is on top of us. Rosie stopped!"],
      ["diego", "Dust got inside and cut the wires. I can change the parts, but I don't know the right order."],
    ];
    if (G.d1 === "A") lines.push(["diego", "And my hand is hurt... I can't work fast."]);
    lines.push(["layla", "How much time do we have?"], ["marcus", "Enough, if we start now. I've studied Rosie's map many times."], ["lead", "If I ask for his help now... everyone will know I don't deserve to lead.", { think: true }]);
    await UI.talk(lines);
    const c = await UI.choose("You are {lead}. Who leads the repair?", ["I'm the commander. I'll fix it myself.", "{marcus}... you know this machine better than me. Help me."]);
    G.d2 = c === 0 ? "A" : "B";
    if (G.d2 === "A") { await UI.say("marcus", "Fine. But luck won't save you this time.", { mood: 1 }); meter({ team: BALANCE.d2A.team }, "You didn't ask for help."); }
    else { await UI.say("marcus", "...Okay. Listen carefully, and do exactly what I say."); await UI.say("layla", "Now that's the team I know."); meter({ team: BALANCE.d2B.team }, "🤝 You asked for help — the team pulls together!"); }
    await UI.card(`<h3>MISSION BRIEF</h3><div class="big">🫧</div><h1>Restart Rosie</h1><p>Mars air is mostly carbon dioxide, and we can't breathe it. The oxygen machine turns this air into oxygen we can breathe.</p><div class="real"><span class="tag">REAL NASA SCIENCE</span><br>This is real: NASA sent a small machine called <b>MOXIE</b> to Mars, and it really made oxygen from Mars air — 122 grams in total, about what a small dog breathes in 10 hours.</div>${UI.srcHtml(["moxie"])}`, [{ id: "go", label: "Fix Rosie!", cls: "go" }]);
    let time = G.d2 === "A" ? BALANCE.d2A.time : BALANCE.d2B.time;
    if (G.flags.diegoHurt) time -= BALANCE.d1APenaltyOnRosie;
    let ok = await Minigames.wires({ time, hints: G.d2 === "B" });
    if (!ok) {
      Sound.play("fail"); G.alarm = true;
      await UI.say("layla", "Oxygen is running out! Emergency helmets on!");
      P.helmet = true; for (const n of Object.values(N)) n.helmet = true;
      meter(BALANCE.rosie.fail, "🫧 Oxygen ran low — helmets on.");
      await UI.say("marcus", "Breathe slowly. We try again, together this time.");
      G.alarm = false;
      ok = await Minigames.wires({ time: 0, hints: true });
    }
    G.rosieBroken = false; Sound.play("power"); Particles.sparkle(propById.rosie.x + 24, propById.rosie.y);
    await UI.say("diego", "I can hear Rosie! She's working!");
    meter(BALANCE.rosie.success, "🫧 Rosie is making oxygen again!");
    P.helmet = false; for (const n of Object.values(N)) n.helmet = false;
    if (G.d2 === "A") await UI.talk([["marcus", "Rosie is working. I'll be in my room if you need me."], () => { Game.walkNpc(N.marcus, 9 * T, 17 * T); }, ["diego", "{lead}... I think he was waiting for you to ask."]]);
    else await UI.talk([["marcus", "You never asked me for anything before, {lead}."], ["lead", "I should have. In training too."]]);
    await this.ending();
  },

  // ------------------------------------------------------------ ENDING
  async ending() {
    const N = Game.npc;
    Sound.stopLoop("wind"); Sound.stopLoop("storm"); G.alarm = false;
    for (let s = G.storm; s >= 0; s -= 0.05) { G.storm = Math.max(0, s); await sleep(60); }
    G.storm = 0; G.power = Math.max(G.power, 0.6);
    await UI.say("marcus", "The storm is moving away. The danger is over... for today.");
    const happy = G.meters.team >= BALANCE.happyEndingTeam;
    Sound.setMood(happy ? "happy" : "sad");
    if (happy) { G.hopeNewLeaf = true; await UI.talk([["layla", "I just checked on Hope. She has a new leaf."], ["diego", "One new leaf, on a day like this? Bravest plant in the universe."], ["marcus", "Today, we worked as one team. First time in a long time."], ["lead", "It shouldn't be the last."]]); }
    else await UI.talk([["layla", "We survived... but nobody is talking to each other."], ["diego", "I'm going to sleep. Wake me up when everyone makes peace."], ["marcus", "I'll write a report to Earth. A full report.", { mood: 1 }], ["lead", "A full report... what will he say about me?", { think: true }]]);
    Sound.play("ping");
    await UI.say("diego", "A message from Earth! They sent it twenty minutes ago.");
    await UI.card(`<h3>📡 INCOMING TRANSMISSION</h3><div class="earthmsg"><div class="meta">FROM: MISSION CONTROL, EARTH · SENT 20 MIN AGO · DISTANCE: ~360 MILLION KM</div><br>We saw the storm from our satellites. Send a report now. We need to know: <b>who made the decisions?</b></div><p style="font-size:.75em">Radio waves travel at the speed of light, but Mars is so far away that messages take about 4 to 24 minutes to arrive, depending on where the planets are.</p>${UI.srcHtml(["esaDelay"])}`, [{ id: "ok", label: "...", cls: "alt" }], { cls: "dark" });
    await UI.say("lead", "...");
    Game.mode = "cutscene"; $("#hud").classList.add("off"); UI.objective(null);
    await this.results();
  },

  async results() {
    const rec = {
      safety: G.d1 === "A" ? `${CONFIG.NAMES.diego} got hurt outside, but the garden stayed warm.` : "No one got hurt, but you lost two garden trays.",
      mission: G.d1 === "A" ? "Clean panels kept the garden heaters running." : "Sharing power kept everyone safe, but cost some plants.",
      team: G.d2 === "A" ? `You fixed it alone, and ${CONFIG.NAMES.marcus} moved further away.` : "You asked for help, and the team worked together.",
    };
    const row = (k) => { const d = STORY.meters[k]; return `<div class="row"><div class="meter" style="font-size:1.1em"><div class="lbl"><span>${d.icon} ${d.label}</span><span>${G.meters[k]}</span></div><div class="bar"><div class="fill" style="width:${G.meters[k]}%;background-color:${d.color}"></div></div></div><p>${rec[k]}</p></div>`; };
    await UI.card(`<h3>MISSION REPORT · SOL 200</h3><h1>${G.meters.team >= BALANCE.happyEndingTeam ? "🌱 The team holds together" : "🌪️ You survived... apart"}</h1><div class="results">${row("safety")}${row("mission")}${row("team")}</div><p style="font-size:.75em;opacity:.8">Every choice had a cost. Try again and choose differently — see what changes!</p>`, [{ id: "ok", label: "What did I learn?", cls: "go" }], { cls: "wide" });
    await UI.card(`<h1>What did you learn today?</h1>${STORY.learn.map((l, i) => `<p>${["⚡", "🌱", "🤝"][i]} ${l}</p>`).join("")}<p style="font-size:.85em">📖 You discovered <b>${G.discovered.size} / ${Object.keys(FACTS).length}</b> real NASA facts. Explore more next time!</p>`, [{ id: "ok", label: "Continue", cls: "go" }]);
    await UI.fade(true);
    Scenes.show("chapterEnd");
    await UI.fade(false);
  },

  // ------------------------------------------------------------ side interactions
  async photo() {
    G.flags.photo = true;
    await UI.card(`<h3>CREW PHOTO</h3><h1>Training Base, Earth</h1><p>A photo from three years ago, at the desert training base. Everyone is smiling for the camera...</p><p><i>...except ${CONFIG.NAMES.marcus}. And ${CONFIG.NAMES.diego} and ${CONFIG.NAMES.layla} are looking away from ${CONFIG.NAMES.lead}.</i></p><p style="font-size:.8em">Written on the back: <b>"Commander ${CONFIG.NAMES.lead} — he saved the training!"</b></p>`, [{ id: "ok", label: "Hmm...", cls: "alt" }], { closable: true });
  },
  async hope() {
    if (G.hopeNewLeaf) await UI.say("lead", "Hope has a new leaf. Bravest plant in the universe.", { think: true });
    else if (G.trays[0] && G.trays[0].fixed) await UI.say("lead", "Hope. The first food grown on Mars... if she makes it.", { think: true });
    else await UI.say("lead", "A tiny plant with a name tag: \"Hope\". {layla} must have named it.", { think: true });
  },
  onRoom(room) {},
  update(dt) { if (this.panelsMission) this.panelsMission(dt); },
};
