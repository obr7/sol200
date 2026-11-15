<div align="center">

# 🔴 SOL 200
### Junior Astronaut Mission Trainer

**A story game about surviving, leading and growing food on Mars, for kids aged 7 to 12.**

[▶ **Play now**](https://obr7.github.io/sol200/) · [📖 The story](docs/STORY.md) · [🎬 Game script](full-game-script-en.md) · [🛠 Documentation](docs/DOCUMENTATION.md)

![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-0b3d91) ![Live NASA data](https://img.shields.io/badge/data-NASA%20DONKI%20%C2%B7%20Mars%20Trek-c1440e) ![Runs in any browser](https://img.shields.io/badge/runs%20in-any%20browser-2ea44f) ![Vibe coded](https://img.shields.io/badge/built%20with-vibe%20coding-8a2be2)

</div>

---

SOL 200 is a free browser game made for the **NASA Space Apps Challenge 2026** challenge *Junior Astronaut Mission Trainer*.

You play **Commander Damon Carter** on Sol 200 (day 200) of the first mission to grow food on Mars. A giant dust storm is coming, and the crew does not agree on what to do. You explore the base, play short hands-on mini-games built on real science, and make hard choices. Every choice has a price on three meters: **Safety**, **Mission** and **Team**.

> ### 🎧 Vibe coded from start to finish
> **This whole project is vibe coding.** Our team did not write the code by hand. We described what we wanted in plain language (the story, the scenes, the mini-games, how things should look and feel), and AI tools wrote all of the code. We played every version, said what to change, and checked every result. The story, characters, game design and science choices are ours. See [AI use](#ai-use) below.

## Contents
[The story](#the-story) · [Chapter 1](#whats-in-chapter-1) · [Real NASA data](#real-nasa-data-used-while-you-play) · [AI use](#ai-use) · [Run it](#run-it) · [Build](#build) · [Credits](#credits)

## The story

> Four astronauts who know each other from Earth face crises on Mars while a shared secret from their past surfaces. **The central question: does Damon deserve to lead?**

| # | Chapter | You play | The choice | Lesson | Status |
|---|---|---|---|---|---|
| 1 | The Commander | Damon | Clean the panels outside (A) or stay in and share power (B) | Leaders listen; asking for help is not weakness | ✅ Playable |
| 2 | Damon's Past | Damon | Claim the credit (A) or share it with Marcus (B) | Shortcuts have a cost | 📝 Planned |
| 3 | Marcus | Marcus | Send the full honest report (A) or hide the painful parts (B) | Silence isn't innocent | 📝 Planned |
| 4 | Diego | Diego | Admit the water leak and repair fully (A) or keep the quick patch (B) | Half-solutions only delay problems | 📝 Planned |
| 5 | Layla | Layla | Save Hope (A) or protect the crew's water (B) | Honesty can be kind | 📝 Planned |
| 6 | The Sun | All four | Build a radiation shelter together during a solar flare | Teamwork decides what survives | 📝 Planned |

- **Threads:** Earth's question "who made the decisions?", the secret of a past training accident, and the Team meter that decides the ending.
- **Endings:** with Team trust at 50 or more, the crew opens up and sends one honest report; below 50, accusations fly and they part ways, never speaking again.
- **Foreshadowing:** radiation from a solar flare is Chapter 6's climax, and Chapter 1 already reads live NASA DONKI data to show today's real Sun.

Full outline with every chapter: **[docs/STORY.md](docs/STORY.md)** · Full game script (all 6 chapters): **[full-game-script-en.md](full-game-script-en.md)**

## What's in Chapter 1

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
