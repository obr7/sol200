// =====================================================================
//  SOL 200 — Junior Astronaut Mission Trainer (NASA Space Apps 2026)
//  CONFIG: everything the team may want to tweak lives in this file,
//  story.js (all dialogue) and data.js (all NASA facts + sources).
// =====================================================================
const CONFIG = {
  GAME_TITLE: "SOL 200",
  SUBTITLE: "Junior Astronaut Mission Trainer",
  // Character names (change here once the team decides)
  NAMES: { lead: "Damon", marcus: "Marcus", diego: "Diego", layla: "Layla" },
  FULL_NAMES: { lead: "Damon Carter", marcus: "Marcus Bell", diego: "Diego Ramírez", layla: "Layla Haddad" },
  // NASA Open APIs key (https://api.nasa.gov). DEMO_KEY works but is rate-limited.
  NASA_API_KEY: "DEMO_KEY",
  // ElevenLabs narration (copied from "200 sol voices/narrator sounds" into dist/audio/).
  // Any missing file -> the browser's voice reads that line with the estimated length below.
  NARRATION_FILES: { N1: "audio/n1.mp3", N2: "audio/n2.mp3", N3: "audio/n3.mp3", N4A: "audio/n4a.mp3", N4B: "audio/n4b.mp3", N4C: "audio/n4c.mp3" },
  // Measured from the files (seconds): total length, silence at the start and at the end.
  // The intro re-measures the length when the file loads; leading silence over 0.15 s is skipped at playback.
  NARRATION_META: {
    N1:  { dur: 2.926, lead: 0.189, trail: 0.151 },
    N2:  { dur: 6.766, lead: 0.133, trail: 0.159 },
    N3:  { dur: 5.642, lead: 0.191, trail: 0.244 },
    N4A: { dur: 8.986, lead: 0.173, trail: 0.275 },
    N4B: { dur: 2.116, lead: 0.175, trail: 0.265 },
    N4C: { dur: 4.127, lead: 0.189, trail: 0.272 },
  },
  // Recorded sound effects (from "200 sol voices/Sound Effects", copied into dist/audio/sfx/).
  // Missing files fall back to the sounds generated in code.
  SFX_FILES: {
    alarm: "audio/sfx/alarm_loop.mp3", applause: "audio/sfx/applause_hall.mp3", argument: "audio/sfx/argument_muffled.mp3",
    entry: "audio/sfx/entry_roar.mp3", launch: "audio/sfx/launch.mp3", hum: "audio/sfx/room_hum.mp3", separation: "audio/sfx/stage_sep.mp3",
    storm: "audio/sfx/storm_rumble.mp3", wind: "audio/sfx/wind_mars.mp3", airlock: "audio/sfx/airlock.mp3",
  },
  // argument_muffled.mp3 is recorded very quietly (about -44 dB), so it gets a big boost.
  SFX_VOLUME: { alarm: 0.35, applause: 0.55, argument: 4.5, entry: 0.7, launch: 0.85, hum: 0.35, separation: 0.8, storm: 1.8, wind: 0.45, airlock: 0.7 },
  // Intro music: one pre-rendered track per shot group (copied from "200 sol voices/music" into dist/audio/music/).
  // Each starts when its shot starts, plays once, and ducks 6 dB under the narrator. Missing file = silence for that shot.
  INTRO_MUSIC_FILES: {
    music_01: "audio/music/music_01_argument.mp3", music_02: "audio/music/music_02_ceremony.mp3", music_03: "audio/music/music_03_launch.mp3",
    music_04: "audio/music/music_04_space_approach.mp3", music_05: "audio/music/music_05_arrival.mp3", music_06: "audio/music/music_06_control_room.mp3",
  },
  // Measured length (s) and loudness-matching gain for each track (tracks were mastered at different levels).
  INTRO_MUSIC_META: {
    music_01: { shot: "argument", dur: 8.046, gain: 1.25 }, music_02: { shot: "ceremony", dur: 8.986, gain: 3.8 },
    music_03: { shot: "launch", dur: 10.031, gain: 0.65 }, music_04: { shot: "space", dur: 14.028, gain: 2.0 },
    music_05: { shot: "arrival", dur: 11.050, gain: 2.9 }, music_06: { shot: "control", dur: 13.035, gain: 1.8 },
  },
};

// =====================================================================
//  INTRO TIMELINE (seconds). Source of truth: script-01-intro.md (v2).
//  Change any number here; everything in the intro follows it.
// =====================================================================
const INTRO_TIMING = {
  // PACE slows the whole intro down. 1.0 = exactly the script table (about 65 s).
  // 1.2 = every shot 20% slower and more time to read (about 78 s). Narration anchors scale too (n1 at 10.0 x PACE).
  PACE: 1.2,
  // Gap after n4a and after n4b (seconds of real time). n4b starts at n4a end + gap, n4c at n4b end + gap.
  N4_GAPS: [0.8, 0.8],
  // After n4c ends: wait, then type "Sol 200 on Mars." (script seconds)
  finalWait: 0.4, finalType: 2.5, finalHold: 0.6, dissolveLen: 1.0,
  shots: [
    { id: "argument", n: 1, start: 0.0, end: 5.0 },
    { id: "title",    n: 1.5, start: 5.0, end: 8.0 },   // 2.5 s title + 0.5 s silent black
    { id: "ceremony", n: 2, start: 8.0, end: 17.0 },
    { id: "launch",   n: 3, start: 17.0, end: 27.0 },
    { id: "space",    n: 4, start: 27.0, end: 33.0 },
    { id: "mars",     n: 5, start: 33.0, end: 41.0 },
    { id: "arrival",  n: 6, start: 41.0, end: 52.0 },
    { id: "control",  n: 7, start: 52.0, end: 64.5 },
  ],
  // Narrator lines: anchor time (script seconds), estimated length (used only if the file is missing)
  narration: {
    N1:  { at: 10.0, est: 2.5, text: "One of them was chosen to lead." },
    N2:  { at: 20.0, est: 6.5, text: "More than a year ago, four astronauts left Earth to grow the first food on another planet." },
    N3:  { at: 34.0, est: 5.0, text: "Mars. The air is too thin to breathe, and it is freezing cold." },
    N4A: { at: 46.0, est: 8.0, text: ["Mars is far from home.", "Messages to Earth take many minutes, so when danger comes, the crew must decide on their own."] },
    N4B: { after: "N4A", est: 1.5, text: "A storm is coming." },
    N4C: { after: "N4B", est: 3.5, text: "And the real question is... can they face it together?" },
  },
  // Key beats (script times)
  beats: {
    argPushEnd: 4.4, argPoint: 2.5, argStep: 3.0, argFreeze: 4.4, argBlack: 4.9, alarmTail: 0.8,
    titleIn: 5.5, titleHoldEnd: 7.0, titleOut: 7.5,
    cerGlideEnd: 10.0, cerHand: 10.0, cerPin: 11.0, cerTypeStart: 12.6, cerTypeEnd: 14.6, cerLook: 14.8, cerBreak: 15.5, cerFlash: 16.6,
    ignition: 19.0, liftoff: 20.5, skyDark: 23.0, separation: 25.0,
    spaceText: [28.0, 30.0], windowCut: [29.0, 30.2], dotLine: 30.5, matchCut: 32.2,
    retro: 35.0, entry: 36.0, tempText: [36.5, 38.5], touchdown: 38.5, dustWipe: 40.5,
    laylaGlove: 42.5, camSlide: 44.5, atDoor: 46.0, doorOpen: 50.0, doorToWindow: 51.5,
    insideCut: 54.5, damonLook: 55.5, starTouch: 57.0, breath: 58.5, finalText: [61.0, 63.5], dissolve: 63.5,
  },
  // On-screen code text
  texts: {
    report1: "TRAINING REPORT", report2: "COMMANDER DAMON CARTER", report3: "SAVED THE TRAINING.",
    space: "SEVEN MONTHS IN SPACE...", temp: "AVERAGE TEMPERATURE: ABOUT -60 C", final: "SOL 200 ON MARS.",
  },
};

// Game-balance numbers. These are EDUCATIONAL ASSUMPTIONS for gameplay, not real data.
const BALANCE = {
  start: { safety: 50, mission: 50, team: 50 },
  gardenCheck: { mission: +10 },
  d1A: { safety: -15, team: -10 },            // go outside
  d1B: { safety: +10, mission: -10 },         // stay inside
  panels: { time: 70, tripAt: 10, good: 5, goodMission: +15, poorMission: +5 },
  // Extra outdoor radiation cost from REAL space weather (DONKI): quiet / M-class / X-class
  radiation: { quiet: 0, M: -3, X: -6 },
  power: { time: 30, units: 6 },
  d2A: { team: -10, time: 40 },
  d2B: { team: +20, time: 60 },
  d1APenaltyOnRosie: 10,                      // seconds lost if Diego is hurt
  rosie: { wrongPenalty: 5, success: { safety: +15 }, fail: { safety: -15 } },
  happyEndingTeam: 50,
};
