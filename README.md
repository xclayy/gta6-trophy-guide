# Leonida Trophy Guide

[![GTA 6 trophy guide bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/xclayy/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/xclayy/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 trophies** of Grand Theft Auto VI on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with a real guide.** Each of the 55 trophies shows its official name, description and grade as PlayStation publishes it, plus a guide written for this entry in our own words — what to do, where, and when it can be missed — with its sources named beside it (Push Square, KeenGamer, games.gg, EGamers.io, GTA Zone, GamerBlurb). Sources are cited, never copied.
- **A tracker that saves.** Tick trophies off and the checklist is saved in the browser (localStorage). Export progress to a `.json` file and import it back on any machine.
- **Filters that match the bounty.** Filter by grade and by kind — story, missable, collectibles, activities, side missions, crime & combat, money, exploration — plus an online filter that is honestly empty: all 55 trophies are offline, so there is nothing to show there.
- **Spoiler-free mode.** Story trophies stay hidden — name, description and guide — until you earn them. Turn it off to see everything.
- **A roadmap to the platinum.** Six stages in the order to earn them: story first (with the one missable meditation done in Chapter 1), side characters, activities and races, collectibles, crime and money, then 100% clean-up.
- **One missable, flagged clearly.** Positive Mental Attitude (meditate at every spot) is the only trophy flagged as possibly missable — the Chapter 1 balcony meditation is reported to disappear after that chapter — and the guide says so up front, with timing notes for the side chains, bank vaults and the Snap Gun.

## How to use it

Serve `app/` with any static file server and open `index.html` in desktop Chrome. It works with the network off: every file it loads lives under `app/`, and it fetches only its own data files (`app/data/trophies.json`, `app/data/roadmap.json`).

```sh
node serve.ts
# then open http://localhost:8080
```

## Layout

- `app/index.html` — the page: header with progress, three views (Checklist, Roadmap to Platinum, Missable & timing).
- `app/app.js` — the tracker: rendering, filters, spoiler mode, localStorage, export/import.
- `app/style.css` — the look: an original dusk-plum design. No Rockstar logo, artwork or game screenshots anywhere.
- `app/data/trophies.json` — the official 55 trophies with guides, kinds, roadmap stages, missable flags and sources.
- `app/data/roadmap.json` — the six-stage roadmap to the platinum.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — four screenshots of the guide running in a browser (1280×800 JPEG).

## Verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
