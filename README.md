# SOL 200 — Junior Astronaut Mission Trainer

**Play now:** https://obr7.github.io/sol200/

SOL 200 is a free browser game for children aged 7 to 12, made for the **NASA Space Apps Challenge 2026** challenge *Junior Astronaut Mission Trainer*.

You play **Commander Damon Carter** on Sol 200 (day 200) of the first mission to grow food on Mars. A giant dust storm is coming, and the crew does not agree on what to do. You explore the base, play short hands-on mini-games built on real science, and make hard choices. Every choice has a price on three meters: **Safety**, **Mission** and **Team**.

> ### 🎧 Vibe coded from start to finish
> **This whole project is vibe coding.** Our team did not write the code by hand. We described what we wanted in plain language (the story, the scenes, the mini-games, how things should look and feel), and AI tools wrote all of the code. We played every version, said what to change, and checked every result. The story, characters, game design and science choices are ours. See [AI use](#ai-use) below.

---

## What is in the game

- **A narrated intro film** (about 78 seconds, with a Skip button): the crew argues, the rocket launches, the crew lands on Mars.
- **A Mars base to explore**: 5 rooms (Crew Quarters, Control Room, Workshop, Greenhouse, Airlock) and the Mars surface outside, with Among Us-style room lighting and a minimap.
- **13 discovery cards**: objects with a small "?" bubble open a real science card with its source link. All cards are collected in the Discovery Journal.
- **5 mini-games**, each based on real science:

| Mini-game | What you do | The real science |
|---|---|---|
| Garden Check | Use water, a grow lamp and a heater to keep 3 plants healthy. Too much damages the leaves. | NASA's Veggie plant chamber on the ISS |
| Clean the Panels | 3 jobs on 3 pairs of solar panels: brush the dust, flick off pebbles, tilt toward the Sun | Dust lowers solar power on Mars (InSight, Opportunity) |
| Suit Up | A spacesuit briefing card and a card about a real Jordanian spacesuit engineer, then dress the astronaut in checklist order and do a leak check | Spacesuits are small pressurized spaceships |
| Storm Night | Share 6 power units between oxygen, heat, garden, lights and radio until sunrise. Wind gusts cut power, overloading trips the breaker | Power is limited on Mars |
| Restart Rosie | Reconnect the oxygen machine's wires and watch CO₂ become O₂ | NASA's MOXIE made oxygen from Mars air |

- **Two big decisions**: go outside in the storm or stay safe inside; fix the oxygen machine alone or ask Marcus for help. Choosing to go alone makes the Rosie puzzle harder, and Marcus steps in if you fail.
- **Characters with feelings**: faces change with what they say (calm, happy, worried, scared, sad, angry, hurt).
- **An ending** chosen by the Team meter, a message from Earth, and a "what did you learn?" screen.

## Real NASA data used while you play

| Data | Where it appears in the game |
|---|---|
| [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) solar flares, read live through [NASA Open APIs](https://api.nasa.gov/) | Space Weather console and the "Clean the Panels" brief: a Calm / Busy / Stormy Sun meter decides how much Safety going outside costs. If the API cannot be reached, a real archived DONKI record is shown and labelled. |
| [NASA Mars Trek](https://trek.nasa.gov/mars/) map tiles (Viking MDIM 2.1 colour mosaic) | The 3D Mars globe on the Control Room hologram table, with 6 places to visit (Olympus Mons, Valles Marineris, Gale, Jezero, Hellas, North Polar Cap) |
| [NASA Image and Video Library, PIA20843](https://images.nasa.gov/details/PIA20843) (Curiosity) | The view from the Crew Quarters window |
| NASA, ESA and CSA science pages | The 13 discovery cards and the mini-game cards. Full list: [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md#sources) |

Game numbers (meter points, timers, power units) are **game balance**, not real measurements.

## AI use

All code in this repository was produced through **vibe coding** with AI tools. We used only these four:

| Tool | What it did |
|---|---|
| **Claude Code** (Anthropic) | Wrote and fixed most of the game code (JavaScript, Canvas, Web Audio, CSS, the build script), drew the maps, furniture, effects, the intro film and two of the three character styles in code, and wrote this documentation |
| **Codex** (OpenAI) | Wrote and fixed game code |
| **ChatGPT** (OpenAI) | Polished the English text. Image generation made the default character sprite sheets and portraits, the 4 crew photos in the photo album (watermarked "AI-GENERATED") and the engineer portrait on the Suit Up card |
| **ElevenLabs** | The intro narration voice, the intro music and the recorded sound effects |

The story, characters, game design and choice of science were written and decided by the team, and a person reviewed every AI output. No AI-generated content uses NASA logos, flags or mission insignia. The in-game credits screen (Settings → NASA data & credits) says the same.

## Run it

- **Online:** https://obr7.github.io/sol200/ (nothing to install, no account).
- **Locally:** serve the folder with any web server, for example `python3 -m http.server`, then open `http://localhost:8000/`. Opening `index.html` straight from disk works too, but the recorded voices and music only load from a web server.
- Works with keyboard (arrows / WASD, Space), mouse, or touch (joystick + A button, landscape).

## Build

The game is plain HTML, CSS and JavaScript with no engine and no dependencies.

```bash
python3 build.py   # joins src/*.js + src/style.css into one index.html (root) and dist/index.html
```

Edit files in `src/`, then run the build. See **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** for the file map, how the story and mini-games work, settings, developer mode and testing.

## NASA API key

`src/config.js` → `CONFIG.NASA_API_KEY` is set to `DEMO_KEY`, which allows only 30 requests per hour and 50 per day per IP address. For heavier use, get a free key at https://api.nasa.gov and put it there.

## Credits

- Story, characters, game design: the team.
- Font: [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (Google Fonts, open license).
- Real person featured: Salam Abu Alhayjaa, Jordanian mechanical engineer (used with her approval). Source: [Al Jazeera](https://www.ajnet.me/family/2025/6/15/%D8%A3%D9%88%D9%84-%D8%A3%D8%B1%D8%AF%D9%86%D9%8A%D8%A9-%D8%AA%D8%B1%D8%B4%D8%AD-%D9%84%D8%B1%D8%AD%D9%84%D8%A9-%D9%81%D8%B6%D8%A7%D8%A6%D9%8A%D8%A9-%D8%B3%D9%84%D8%A7%D9%85).
- NASA, ESA and CSA for open data and science pages. This project is not endorsed by NASA.
