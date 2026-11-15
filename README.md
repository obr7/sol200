# SOL 200 — Junior Astronaut Mission Trainer

▶ **Play:** https://obr7.github.io/sol200/

The playable game is `index.html` + `audio/` at the root of this repo (GitHub Pages). Edit files in `src/`, then run `python3 build.py`.

A browser game for kids ages 7–12, built for the **NASA Space Apps Challenge 2026** (*Junior Astronaut Mission Trainer*).
You play the commander of a 4-person Mars base on Sol 200, the day a dust storm hits. You balance **Safety**, **Mission** and **Team**: every choice has a cost.

## Play / deploy

- `dist/` = `index.html` + the `audio/` folder (narrator voices and recorded sound effects). Upload **both** together, keeping the folder layout.
- The game also runs without the `audio/` folder: the browser's voice and the sounds generated in code take over.
- **GitHub Pages:** create a repo → upload `dist/index.html` to the root as `index.html` → Settings → Pages → Deploy from branch `main` / root. Your link will be `https://<user>.github.io/<repo>/`.
- **Netlify:** drag the `dist` folder onto https://app.netlify.com/drop.
- Works on desktop (keyboard and mouse). On phones it uses a touch joystick and an **A** button; hold the phone in landscape.

## Editing (no coding needed for most changes)

| What | File |
|---|---|
| All dialogue, character cards, intro narration, learning screen | `src/story.js` (`STORY` + the `Story` scenes) |
| Character names (e.g. renaming "Elon") | `src/config.js` → `CONFIG.NAMES` / `FULL_NAMES` |
| Meter points, timers, power units (game-balance assumptions) | `src/config.js` → `BALANCE` |
| Real NASA facts + source links | `src/data.js` → `FACTS`, `SOURCES` |
| Intro shot times, beats, on-screen texts | `src/config.js` → `INTRO_TIMING` (`shots`, `beats`, `texts`) |
| How slow the intro plays | `INTRO_TIMING.PACE` (1.0 = the script's exact table at about 65 s; 1.2 = 20% slower at about 76 s, the current setting) |
| Gaps between n4a / n4b / n4c | `INTRO_TIMING.N4_GAPS` = `[0.8, 0.8]` |
| Narration files + measured silence | `CONFIG.NARRATION_FILES` (N1, N2, N3, N4A, N4B, N4C) and `CONFIG.NARRATION_META` (dur / lead / trail) |
| Recorded sound effects + volumes | `CONFIG.SFX_FILES`, `CONFIG.SFX_VOLUME` |
| "Sol 200 on Mars." wait / typing / dissolve | `INTRO_TIMING.finalWait`, `finalType`, `finalHold`, `dissolveLen` |
| The intro's shots (drawing code) | `src/intro.js` (one function per shot: `shot_argument`, `shot_title`, `shot_ceremony`, `shot_launch`, `shot_space`, `shot_mars`, `shot_arrival`, `shot_control`) |
| Character look (colors, hair, accessories) | `src/sprites.js` → `CHAR_SPECS` |

After editing `src/`, run `python3 build.py` to rebuild `dist/index.html`.

## The intro (script-01-intro v2)

- Click to start, then about 64.5 s that can't be skipped. It ends with a dither dissolve into the game.
- Every time lives in `INTRO_TIMING`. The real lengths of the narration files set the timing: when N1–N4 exist, the intro reads how long each one is and shifts every shot after it to match. When a file is missing, the browser's voice reads that line and the estimated time is used. Subtitles always show.
- Debug: add `?intro=4` to the URL to jump straight to shot 4 (`?intro=1.5` jumps to the title). Add `?debug=1` to show the timeline clock and where each shot starts and ends.
- Shot 7's screen shows `SOLAR ACTIVITY TODAY: <level>` from the live DONKI call, with `(ARCHIVED)` when it falls back. The intro never waits for the network.
- ElevenLabs files only load from a web server (GitHub Pages / Netlify). They don't load when you open `index.html` straight from your computer, so there you'll hear the browser voice.

## Where the NASA data comes from

- **NASA DONKI (live):** the Space Weather console calls `https://api.nasa.gov/DONKI/FLR` to get solar flares from the last 30 days. Before the player goes outside (choice A), the real flare level adds an extra radiation cost to SAFETY.
  - If the API can't be reached, the game uses an **archived** real record: the X8.7 flare of 2024‑05‑14. The screen labels it ARCHIVED; archived data is never shown as live.
  - Put your own key from api.nasa.gov in `CONFIG.NASA_API_KEY`. `DEMO_KEY` is rate-limited.
- **Curiosity RAD, May 20 2024 Mars solar storm:** 8,100 micrograys, equal to about 30 chest X-rays (NASA/JPL).
- **MOXIE:** made 122 g of oxygen in total, and up to 12 g per hour (NASA).
- **Veggie:** lettuce grown and eaten on the ISS in 2015. **Space Crops** program (NASA).
- **Mars facts:** gravity about 38% of Earth's, a sol is about 24 h 37 min, the air is about 95% CO₂ and less than 1% as thick as Earth's (NASA Science).
- **Dust storms:** Opportunity in 2018, and InSight's power levels (NASA).
- **Partner agencies:** ESA (signal delay of about 4–24 min) and CSA (Interplanetary Farming, food production toolkit).

The full list with links is in the in-game **NASA Data & Credits** screen and in `src/data.js`.

## AI disclosure (for the submission form)

Game code, the pixel art (drawn in code), the music and the sound effects (generated live with the Web Audio API) were made with help from **Claude (Anthropic)**. The story, characters and dialogue are by the team. The intro narrator uses the browser's built-in text-to-speech voice. If you add ElevenLabs or Google Flow files, disclose them too. The game uses no NASA logos or mission insignia.

## Source layout

`config.js` · `data.js` (facts and DONKI) · `audio.js` (music and SFX) · `sprites.js` (characters) · `world.js` (map) · `render.js` (lighting, props) · `ui.js` (dialogue and cards) · `main.js` (loop, input) · `story.js` (Chapter 1) · `minigames.js` · `scenes.js` (title, intro, end) · `boot.js`
