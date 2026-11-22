# SOL 200 — Technical Documentation

SOL 200 is a single-page HTML5 game. It has no engine, no framework and no runtime dependencies: the files in `src/` are joined by `build.py` into one `index.html`, which GitHub Pages serves at https://obr7.github.io/sol200/.

> **How this was built: vibe coding.** Every line of code in this repository was written by AI tools (mostly Claude Code, plus Codex) from plain-language requests by our team. The team wrote the story and design, described each feature and change, played every build, and asked for fixes until it worked. ChatGPT made the default character art and crew photos, and ElevenLabs made the voice, music and recorded sounds. Nothing was hand-coded.

**See also:** [The story](STORY.md) · [README](../README.md)

**Contents:** [How it was made](#how-it-was-made) · [Project structure](#project-structure) · [How the game runs](#how-the-game-runs) · [Story flow](#story-flow) · [Mini-games](#mini-games) · [Real data](#real-data) · [Art and sound](#art-and-sound) · [Settings and saving](#settings-and-saving) · [Developer mode](#developer-mode) · [Editing guide](#editing-guide) · [Build, test, deploy](#build-test-deploy) · [Sources](#sources)

---

## How it was made

1. **Story first.** The team wrote the story, the 4 characters, the intro script and the Chapter 1 gameplay script (two decisions, three meters, five mini-games).
2. **Vibe coding.** We described each scene and feature to Claude Code in plain language (often in Arabic), for example "make Garden Check interactive: the camera inside the greenhouse, 3 tools at the bottom, too much heat burns the plant". The AI wrote the code, built the game, ran automated play-tests and published it.
3. **Play, react, repeat.** We played every version on the live site and sent screenshots with what felt wrong ("the text is too small", "the arrow points the wrong way", "make it more fun"). The AI changed the code until it matched.
4. **Our assets.** The team generated the character sprite sheets and crew photos with ChatGPT, and the narration, music and sound effects with ElevenLabs, and gave them to the AI to wire into the game.

The AI also produced the environment art (drawn in code with Canvas), the backup sound effects (generated in code with Web Audio) and this documentation.

## Project structure

```
index.html          the built game (served by GitHub Pages)
build.py            joins src/ into index.html and dist/index.html
src/                source files (edit these)
audio/              narration (n1–n4c.mp3), music/ (6 intro tracks), sfx/ (recorded sound effects)
img/crew/           the 4 crew photos for the photo album
img/salam.jpg       portrait for the Suit Up engineer card
art/                the team's original character sprite sheets + slice/pack scripts
```

Files in `src/`, in build order:

| File | What it holds |
|---|---|
| `config.js` | Names, NASA API key, audio file lists and volumes, **BALANCE** (all game numbers), intro timing |
| `data.js` | **SOURCES** (every link), **FACTS** (13 discovery cards), archived DONKI record, live DONKI loader (`SpaceWeather`) |
| `audio.js` | Web Audio engine: music moods, loops, generated sound effects, loading of the recorded files |
| `sprites.js`, `sprites2.js` | Two code-drawn character styles ("Classic" and "v2") and their portraits |
| `teamsprites.js`, `teamchars.js` | The team's ChatGPT sprite sheets (embedded) and how they are drawn and animated |
| `emotions.js` | Facial expressions (7 moods), small emotes, and which mood each line of dialogue uses |
| `world.js` | The map: 80 × 40 tiles of 16 px, rooms, corridors, props and collision |
| `render.js`, `props2.js` | Drawing the world, props, room lighting, dust storm, alarm light |
| `ui.js` | Dialogue box, choices, cards, meters, journal, map, settings, credits |
| `main.js` | Game loop, input, player movement, path-finding, interaction bubbles, minimap |
| `story.js` | All dialogue and the scene-by-scene story |
| `minigames.js`, `minigames2.js` | Flip cards, panels mission, and the canvas mini-games |
| `mars3d.js` | 3D Mars globe from Mars Trek tiles (hologram + explorer) |
| `album.js` | Crew photo album and the Mars window |
| `suitcards.js` | The Suit Up briefing card (two faces) |
| `devmode.js` | Developer mode (skip and jump, for testing) |
| `scenes.js`, `introfx.js`, `intro.js` | Title screen and the intro film |
| `boot.js` | Starts everything |

## How the game runs

- The world is drawn on a 384 × 216 pixel canvas and scaled up with no smoothing, so it stays sharp pixel art.
- The camera follows the player. The room you stand in is lit and the other rooms are dark, like Among Us.
- The story is a chain of `async` scenes in `story.js`. Each scene waits for the player (`waitTalk`, `waitRoom`, a choice, or a mini-game) and then moves on. Game time pauses during dialogue and cards.
- Objects you can use show a small chat bubble: **?** for something to discover, **!** for the current task. Walk close and press **Space** (or **A** on touch).
- The three meters live in `G.meters` and change through `meter(...)` calls, which also show a toast under the objective.

## Story flow

```
Intro film → Crew Quarters (optional: explore 5 things) → Mars hologram → Marcus (Control Room)
→ Diego (Workshop) → Layla (Greenhouse) → Garden Check → ALARM → Control Room
→ DECISION 1
   A: go outside → Suit Up card + Suit Up → Clean the Panels → Diego trips
   B: stay inside → Storm Night (power)
→ Rosie stops → DECISION 2
   A: fix it alone → hard Restart Rosie (if you fail, Marcus steps in, then the easy version)
   B: ask Marcus  → Restart Rosie with his hints
→ Ending (Team meter ≥ 50 = happy ending) → message from Earth → results → what did you learn
```

## Mini-games

All canvas mini-games share one helper (`canvasGame` in `minigames2.js`). It opens a card with a 480 × 270 pixel canvas, handles mouse, touch and keys, fits the card to the screen without a scrollbar, and closes with a result.

| Mini-game | Function | Result |
|---|---|---|
| Garden Check | `Minigames.garden()` | `{ damage }`: Mission reward drops by 3 per lost leaf |
| Clean the Panels | `Minigames.panels()` → `panelJob(0..2)` (brush, pebbles, tilt) | Panels cleaned before the storm timer, then Diego trips |
| Suit Up card | `SuitCards.open()` | Shown before Suit Up |
| Suit Up | `Minigames.suitUp()` | `{ mistakes }`: +3 Safety for a perfect suit check |
| Storm Night | `Minigames.power()` | Any machine that reaches 0 costs Safety, Mission or Team |
| Restart Rosie | `Minigames.wires({ time, hints, hard })` | `true` / `false`; `hard` is used after the selfish choice |

## Real data

- **DONKI (live):** `SpaceWeather.load()` in `data.js` asks `https://api.nasa.gov/DONKI/FLR` for the last 30 days of solar flares, once per visit, with a 6 second timeout. The strongest flare class sets the risk: X = Stormy Sun (−6 Safety outside), M = Busy Sun (−3), otherwise Calm Sun (0). If the request fails or is rate-limited, the game shows a real archived record (`ARCHIVED_SPACE_WEATHER`) and labels it.
- **API key:** `CONFIG.NASA_API_KEY` in `config.js` holds the team's registered key (1,000 requests per hour). `DEMO_KEY` would be limited to 30 per hour and 50 per day per IP address. Forks should use their own free key from https://api.nasa.gov.
- **Mars Trek (live):** `mars3d.js` loads Viking MDIM 2.1 colour-mosaic tiles from `trek.nasa.gov/tiles/Mars/EQ/...` and wraps them on a sphere drawn pixel by pixel. If the tiles cannot load, a painted Mars is used.
- **Curiosity photo (live):** the window loads `images-assets.nasa.gov/image/PIA20843/PIA20843~medium.jpg`, shown in large pixels with a light warm tint so it matches the art.

## Art and sound

- **Characters:** 3 styles, switchable in Settings → Character style. *Team art* (default) is the team's ChatGPT sprite sheets: 4 directions × 4 walk frames, about 24 × 39 px, plus 40 × 40 portraits. *Code-drawn v2* and *Classic* are drawn in code.
- **Expressions:** `emotions.js` redraws the mouth and eyebrows of each portrait for 7 moods and adds a small animated emote. Each dialogue line gets a mood from a hand-picked list or from its words.
- **Environment:** all tiles, furniture, devices, the hologram, panels and effects are drawn in code. A 1 px dark outline is added to every prop so it matches the sprite style.
- **Sound:** ElevenLabs narration (`audio/n*.mp3`), 6 intro music tracks (`audio/music/`) and recorded effects (`audio/sfx/`). Gameplay music, dialogue blips and backup effects are generated in code with the Web Audio API, so the game still has sound if a file is missing.

## Settings and saving

Settings (⚙️): music and effects volume, narrator voice, mute, character style, **Reset the whole game**, developer mode, and the NASA data & credits screen.

Progress (journal discoveries, places explored, intro seen) is saved in the browser's `localStorage` under `sol200_progress`. "Reset the whole game" clears it and reloads from the intro.

## Developer mode

Settings → **Developer mode** shows a 🛠 button at the top of the screen:

- **Skip (N key):** finishes the current dialogue, card, choice or mini-game; in the world it walks to the current task.
- **Auto-skip dialogue.**
- **Jump to** any story point with chosen decisions (1 Quarters … 8 Ending). The jump runs once and is removed from the URL.
- **Open any mini-game or card** on its own, reset the meters, unlock the journal.

Other test URLs: `?intro=4` starts the intro at shot 4, `?debug=1` shows the intro timeline.

## Editing guide

| To change | Edit |
|---|---|
| Dialogue and story | `src/story.js` |
| Names | `src/config.js` → `CONFIG.NAMES` |
| Meter points, timers, power units | `src/config.js` → `BALANCE` |
| Science cards and source links | `src/data.js` → `FACTS`, `SOURCES` |
| Suit Up card text | `src/suitcards.js` → `SUIT_CARDS` |
| Crew photo album | `src/album.js` → `ALBUM` (images in `img/crew/`) |
| Mars window photo | `src/album.js` → `MARS_VIEW` |
| Mars globe places | `src/mars3d.js` → `MARS_SITES` |
| Map, rooms, furniture positions | `src/world.js` → `ROOMS`, `CORRIDORS`, `PROPS` |
| Intro speed and timing | `src/config.js` → `INTRO_TIMING` (`PACE` 1.2 ≈ 78 s) |
| Mood of a dialogue line | `src/emotions.js` → `MOOD_LINES`, or `{ mood: "worried" }` in `story.js` |

Then run `python3 build.py`.

## Build, test, deploy

```bash
python3 build.py                 # writes index.html and dist/index.html
python3 -m http.server 8000      # play at http://localhost:8000/
```

- **Tests:** we used Playwright with a script that plays the whole story automatically on every path (both decisions, success and failure) and reports errors and final meters.
- **Deploy:** push to `main`. GitHub Pages serves `index.html` and the `audio/` and `img/` folders from the repository root about a minute later.

## Sources

**NASA data and science**

| Source | Used for |
|---|---|
| [NASA DONKI — Space Weather Database Of Notifications, Knowledge, Information](https://ccmc.gsfc.nasa.gov/tools/DONKI/) | Live solar flares, Sun meter, cards |
| [NASA Open APIs (DONKI FLR endpoint)](https://api.nasa.gov/) | Live data access |
| [NASA Mars Trek](https://trek.nasa.gov/mars/) | 3D Mars globe tiles |
| [NASA Image and Video Library — PIA20843](https://images.nasa.gov/details/PIA20843) | Mars window photo |
| [NASA — MOXIE Completes Mars Mission](https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) | Restart Rosie, "Making Oxygen on Mars" |
| [NASA — Veggie Fact Sheet](https://www.nasa.gov/wp-content/uploads/2019/04/veggie_fact_sheet_508.pdf) | Garden, "Food Grown in Space" |
| [NASA Science — Space Crops](https://science.nasa.gov/biological-physical/space-crops/) | Garden cards |
| [NASA — InSight Sees Power Levels Stabilize After Dust Storm](https://www.nasa.gov/solar-system/nasas-insight-sees-power-levels-stabilize-after-dust-storm/) | Dust and solar power |
| [NASA APOD — Opportunity and the 2018 Mars dust storm](https://apod.nasa.gov/apod/ap181004.html) | "Mars Dust Storms" |
| [NASA — NASA Watches Mars Light Up During Epic Solar Storm](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/) | "Solar Storms Reach Mars" |
| [NASA Science — Mars Facts](https://science.nasa.gov/mars/facts/) | Gravity, sol, air, red colour, power |
| [NASA Red Planet Dispatch blog](https://blogs.nasa.gov/redplanetdispatch/) | "Can Plants Grow in Mars Soil?" |

**Partner agencies and other**

| Source | Used for |
|---|---|
| [ESA Mars Express blog — signal delay](https://blogs.esa.int/mex/?p=257) | "Talking to Earth" |
| [Canadian Space Agency — Interplanetary Farming](https://www.csa-asc.gc.ca/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.asp) | Soil and water cards |
| [Canadian Space Agency — Food production toolkit](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) | Garden flip cards |
| [Al Jazeera — Salam Abu Alhayjaa](https://www.ajnet.me/family/2025/6/15/%D8%A3%D9%88%D9%84-%D8%A3%D8%B1%D8%AF%D9%86%D9%8A%D8%A9-%D8%AA%D8%B1%D8%B4%D8%AD-%D9%84%D8%B1%D8%AD%D9%84%D8%A9-%D9%81%D8%B6%D8%A7%D8%A6%D9%8A%D8%A9-%D8%B3%D9%84%D8%A7%D9%85) | Suit Up engineer card (used with her approval) |
| [Pixelify Sans — Google Fonts](https://fonts.google.com/specimen/Pixelify+Sans) | Game font |
| [Playwright](https://playwright.dev/) | Automated play-tests |
| [GitHub Pages](https://pages.github.com/) | Hosting |

**AI tools (vibe coding):** [Claude Code](https://www.anthropic.com/claude-code) · [Codex](https://openai.com/codex/) · [ChatGPT](https://chatgpt.com/) · [ElevenLabs](https://elevenlabs.io/)

No NASA logos, flags or mission insignia are used. This project is not endorsed by NASA.
