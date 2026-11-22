# SHADOW HEIST: slip past the guards, crack the vaults and vanish — 3 vaults, 3 guard kinds, 3 tools, 1 boss, 15 loot

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/mfzan/heist-game/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/mfzan/heist-game/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

**The surprising thing about this entry is the heist never ends at the vault** — cracking a vault trips the lockdown, the Head of Security hunts you personally, and you must escape with the loot through the same guards you just slipped past.

A complete top-down stealth heist game for the desktop browser. No network, no downloads, no build step — just static files under `game/`. Open `game/index.html` (or serve `game/` with any static server) and play.

## How to play

- **WASD / arrow keys** — move the thief
- **E (hold)** — crack the vault (stand next to it)
- **1 / 2 / 3** (or click the HUD buttons) — use a tool
- **Hide in bushes** — enemies cannot see you inside one
- **R** — retry after getting busted

Steal the loot, crack the vault, then **RUN to the green EXIT** while the whole building is on alarm. Lose all 3 lives and the heist is over.

## What is inside

- **3 vaults, 3 levels** — Museum, Bank, Casino Vault — each bigger, faster and more heavily guarded than the last
- **3 guard kinds** — patrolling Guards with vision cones, rotating security Cameras, and fast Dogs with short vision
- **1 boss** — the Head of Security (level 3): bigger vision, instant alarm on sight, and he hunts you personally during the lockdown escape
- **3 tools** — Lockpick (vault cracks 2x faster), Smoke Bomb (suspicion to 0, unseen 3s), Disguise (guards ignore you for 5s)
- **15 loot** — coins, gems, gold bars, paintings and necklaces, 5 per level
- **3 relics** — one hidden in each vault, permanent for the whole run: Golden Idol (+10% speed), Diamond (+1 Smoke Bomb per level), Vault Key (vaults crack 25% faster)
- **Black Market** — spend your loot between levels on exactly one upgrade: Swift Boots, Extra Smoke, or Cool Head
- **3 difficulties** — Easy, Normal, Hard (guard speed, vision range, suspicion rate)
- **Suspicion + alarm system** — get spotted and the meter climbs; at 100% the alarm trips and every guard chases you
- **Lockdown escape phase** — every vault crack turns the level into a chase
- **Timer (150s per level), 3 lives, ranks S/A/B/C** on the victory screen
- **Original canvas art + WebAudio sound** — zero external assets

## Layout

```
game/
  index.html        — the page (canvas 960x704)
  src/
    main.js         — game loop, states, scenes, difficulty
    input.js        — keyboard + mouse
    render.js       — all canvas drawing (world, enemies, player)
    levels.js       — the 3 level layouts + collision + line of sight
    guard.js        — patrol guards, cameras, dogs, vision, suspicion
    boss.js         — the Head of Security
    loot.js         — 5 loot kinds + 3 relics
    tools.js        — lockpick, smoke bomb, disguise
    hud.js          — HUD bar + title / shop / victory / defeat screens
    audio.js        — WebAudio bleeps (no audio files)
screenshots/        — 4 real browser renders of the game
main.ts             — hands the game in (copies game/ + screenshots/, writes dossier.json)
vendor/
  makefun-game.ts   — the kit's dossier library, unchanged
```

## Screenshot scenes

Open the game with `?scene=` to jump to a deterministic showcase state:

- `?scene=title` — title screen with difficulty select
- `?scene=game` — level 2 mid-play: guard, camera, dog, loot, full HUD
- `?scene=boss` — level 3 lockdown: the boss hunting you under full alarm
- `?scene=win` — victory screen with loot, time, rank and relics

## License

MIT — see `LICENSE`.
