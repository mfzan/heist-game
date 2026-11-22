// main.js — SHADOW HEIST: slip past the guards, crack the vaults and vanish.
// The surprising thing about this entry is the heist never ends at the vault —
// cracking a vault trips the lockdown, the Head of Security hunts you
// personally, and you must escape with the loot through the same guards you
// just slipped past.
//
// Game loop + state machine: title -> playing (3 levels, Black Market between
// them) -> win / lose. Screenshot scenes via ?scene=title|game|boss|win.

import { createInput, hitRect } from './input.js';
import { buildLevel, moveWithWalls, circleHitsWall, LEVEL_TIME, PLAY } from './levels.js';
import { updateEnemy, updateCamera, spotGain, touchingPlayer, inBush, VISION } from './guard.js';
import { updateBoss, bossSpotsYou, BOSS_NAME } from './boss.js';
import { collectLootAt, lootRemaining, LOOT_TYPES, RELICS, freshMods } from './loot.js';
import { freshTools, useTool, allEnemies, tickTools, TOOL_DEFS } from './tools.js';
import { drawWorld } from './render.js';
import { drawHUD, drawTitle, drawShop, drawWin, drawLose, toolButtonRects, rankFor, HUD_H } from './hud.js';
import { sfx } from './audio.js';

export const TITLE = 'SHADOW HEIST: slip past the guards, crack the vaults and vanish — 3 vaults, 3 guard kinds, 3 tools, 1 boss, 15 loot';

const DIFFICULTIES = {
  easy: { guardMul: 0.85, visionMul: 0.9, suspicionMul: 0.8 },
  normal: { guardMul: 1, visionMul: 1, suspicionMul: 1 },
  hard: { guardMul: 1.2, visionMul: 1.15, suspicionMul: 1.3 },
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const params = new URLSearchParams(location.search);

// --- game state ---------------------------------------------------------------
const G = {
  state: 'title', // title | playing | shop | win | lose
  difficultyId: 'normal',
  difficulty: DIFFICULTIES.normal,
  level: null,
  player: { x: 480, y: 640, angle: -Math.PI / 2, r: 13 },
  suspicion: 0,
  alarm: false,
  alarmT: 0,
  timeLeft: LEVEL_TIME,
  lives: 3,
  lootTotal: 0,
  lootStolen: 0,
  lootLeft: 15,
  relics: [],
  mods: freshMods(),
  tools: freshTools(),
  hiddenNow: false,
  timeLeftTotal: 0,
  loseReason: '',
  bestRank: localStorage.getItem('shadowHeistBest') || '',
  finalRank: '',
  titleButtons: [], startButton: null,
  shopButtons: [], shopContinue: null,
  againButton: null,
  crackSoundT: 0,
};

function startLevel(index) {
  G.level = buildLevel(index);
  const def = G.level.def;
  G.player.x = def.playerStart.x;
  G.player.y = def.playerStart.y;
  G.player.angle = -Math.PI / 2;
  G.suspicion = 0;
  G.alarm = false;
  G.alarmT = 0;
  G.timeLeft = LEVEL_TIME;
  G.tools = freshTools(G.mods.extraSmoke);
  G.lootLeft = 15 - G.lootStolen;
  G.state = 'playing';
}

function startGame() {
  G.lives = 3;
  G.lootTotal = 0;
  G.lootStolen = 0;
  G.relics = [];
  G.mods = freshMods();
  G.timeLeftTotal = 0;
  startLevel(0);
  sfx.init();
  sfx.click();
}

function applyUpgrade(id) {
  if (id === 'boots') { G.mods.speedMul *= 1.10; G.lootTotal -= 300; }
  if (id === 'smoke') { G.mods.extraSmoke += 1; G.lootTotal -= 250; }
  if (id === 'cool') { G.mods.suspicionMul *= 0.75; G.lootTotal -= 250; }
  sfx.buy();
}

function levelCleared() {
  G.timeLeftTotal += G.timeLeft;
  if (G.level.index === 2) {
    G.state = 'win';
    sfx.win();
    const rank = rankFor(G.lootTotal, G.timeLeftTotal);
    G.finalRank = rank;
    if (!G.bestRank || rank < G.bestRank) {
      G.bestRank = rank;
      try { localStorage.setItem('shadowHeistBest', rank); } catch (e) {}
    }
    return;
  }
  G.state = 'shop';
  sfx.vaultOpen();
}

function busted(reason) {
  G.lives -= 1;
  sfx.busted();
  if (G.lives <= 0) {
    G.loseReason = reason;
    G.state = 'lose';
    return;
  }
  // Restart the level: this level's loot is lost, relics are kept.
  const stolenThisLevel = G.level.loot.filter((i) => i.taken).length;
  G.lootStolen -= stolenThisLevel;
  G.lootTotal -= G.level.loot.filter((i) => i.taken)
    .reduce((s, i) => s + LOOT_TYPES[i.type].value, 0);
  startLevel(G.level.index);
}

// --- per-frame update ---------------------------------------------------------

function updatePlaying(dt) {
  const L = G.level;
  const def = L.def;
  const p = G.player;

  // movement
  const mv = input.moveVec();
  const disguised = G.tools.disguiseT > 0;
  let speed = 175 * G.mods.speedMul * (disguised ? 0.5 : 1);
  if (mv.x || mv.y) p.angle = Math.atan2(mv.y, mv.x);
  moveWithWalls(p, mv.x * speed * dt, mv.y * speed * dt, p.r, def.walls);
  // keep inside the play area
  p.x = Math.max(PLAY.x + p.r, Math.min(PLAY.x + PLAY.w - p.r, p.x));
  p.y = Math.max(PLAY.y + p.r, Math.min(PLAY.y + PLAY.h - p.r, p.y));

  tickTools(G, dt);

  // loot pickup
  const gained = collectLootAt(L, p.x, p.y, (item) => {
    if (item.type === 'gem' || item.type === 'necklace') sfx.gem(); else sfx.coin();
  });
  if (gained > 0) {
    G.lootTotal += gained;
    G.lootStolen += 1;
    G.lootLeft = 15 - G.lootStolen;
  }

  // vault cracking (hold E near the vault)
  const vd = Math.hypot(p.x - def.vault.x, p.y - def.vault.y);
  if (!L.vaultCracked && vd < 62 && input.cracking()) {
    const rate = 26 * G.mods.crackMul * (G.tools.lockpickArmed ? 2 : 1);
    L.vaultProgress += rate * dt;
    G.crackSoundT -= dt;
    if (G.crackSoundT <= 0) { sfx.crackTick(); G.crackSoundT = 0.12; }
    if (L.vaultProgress >= 100) {
      L.vaultProgress = 100;
      L.vaultCracked = true;
      L.escape = true;
      G.tools.lockpickArmed = false;
      G.lootTotal += 500;
      // relic from this vault
      const relicId = def.relic;
      G.relics.push(relicId);
      RELICS[relicId].apply(G.mods);
      // lockdown: alarm trips, everyone hunts
      G.alarm = true;
      G.alarmT = 999;
      for (const e of allEnemies(G)) { e.state = 'chase'; e.chaseT = 999; }
      if (L.boss) L.boss.state = 'hunt';
      sfx.vaultOpen();
      sfx.alarm();
    }
  } else if (!L.vaultCracked) {
    L.vaultProgress = Math.max(0, L.vaultProgress - 12 * dt);
  }

  // enemies
  for (const g of L.guards) updateEnemy(g, dt, G);
  for (const d of L.dogs) updateEnemy(d, dt, G);
  for (const c of L.cameras) updateCamera(c, dt);
  if (L.boss) updateBoss(L.boss, dt, G);

  // vision + suspicion
  G.hiddenNow = inBush(p.x, p.y, def.bushes);
  const unseen = G.tools.smokeT > 0;
  let anySeeing = false;
  for (const e of allEnemies(G)) {
    const gain = unseen ? 0 : spotGain(e, dt, G);
    e.seeing = gain > 0;
    if (gain > 0) anySeeing = true;
    G.suspicion += gain;
  }
  // the boss spotting you trips the alarm instantly
  if (L.boss && !unseen && bossSpotsYou(L.boss, G)) {
    L.boss.seeing = true;
    G.suspicion = 100;
  }
  if (!anySeeing && !(L.boss && L.boss.seeing)) {
    G.suspicion = Math.max(0, G.suspicion - 9 * dt);
  }
  if (G.suspicion >= 100 && !G.alarm) {
    G.suspicion = 100;
    G.alarm = true;
    G.alarmT = 6;
    for (const e of allEnemies(G)) { if (e.kind !== 'camera') { e.state = 'chase'; e.chaseT = 6; } }
    sfx.alarm();
  }
  if (G.alarm && G.alarmT < 900) {
    G.alarmT -= dt;
    if (G.alarmT <= 0) {
      G.alarm = false;
      G.suspicion = 45;
      for (const e of allEnemies(G)) e.state = 'patrol';
    }
  }

  // caught?
  for (const e of allEnemies(G)) {
    if (touchingPlayer(e, p.x, p.y)) {
      busted('A guard grabbed you in ' + def.name + '.');
      return;
    }
  }

  // exit (only after the vault is cracked)
  if (L.escape) {
    const ed = Math.hypot(p.x - def.exit.x, p.y - def.exit.y);
    if (ed < 30) levelCleared();
  }

  // timer
  G.timeLeft -= dt;
  if (G.timeLeft <= 0) {
    G.timeLeft = 0;
    busted('Out of time — the ' + def.name + ' heist went cold.');
  }

  // tools by keyboard
  if (input.consumePressed('1') && useTool(G, 'lockpick')) sfx.click();
  if ((input.consumePressed('2') || input.consumePressed('q')) && useTool(G, 'smoke')) sfx.smoke();
  if ((input.consumePressed('3') || input.consumePressed('f')) && useTool(G, 'disguise')) sfx.disguise();

  // tools by clicking HUD buttons
  const click = input.consumeClick();
  if (click) {
    for (const r of toolButtonRects()) {
      if (hitRect(click, r)) {
        if (useTool(G, r.id)) {
          if (r.id === 'smoke') sfx.smoke();
          else if (r.id === 'disguise') sfx.disguise();
          else sfx.click();
        }
      }
    }
  }
}

function updateTitle(dt) {
  const click = input.consumeClick();
  if (click) {
    for (const b of G.titleButtons || []) {
      if (hitRect(click, b)) {
        G.difficultyId = b.id;
        G.difficulty = DIFFICULTIES[b.id];
        sfx.click();
      }
    }
    if (G.startButton && hitRect(click, G.startButton)) startGame();
  }
  if (input.consumePressed('Enter') || input.consumePressed(' ')) startGame();
}

function updateShop() {
  const click = input.consumeClick();
  if (!click) return;
  for (const b of G.shopButtons || []) {
    const price = b.id === 'boots' ? 300 : 250;
    if (hitRect(click, b) && G.lootTotal >= price) {
      applyUpgrade(b.id);
      startLevel(G.level.index + 1);
      return;
    }
  }
  if (G.shopContinue && hitRect(click, G.shopContinue)) {
    sfx.click();
    startLevel(G.level.index + 1);
  }
}

function updateEnd() {
  const click = input.consumeClick();
  if ((click && G.againButton && hitRect(click, G.againButton)) || input.consumePressed('r')) {
    startGame();
  }
}

// --- screenshot scenes (deterministic states, real game code) ------------------

function applyScene(name) {
  if (name === 'game') {
    // Level 2 mid-play: guard + cone + camera + dog + loot + full HUD.
    startGame();
    startLevel(1);
    G.player.x = 470; G.player.y = 480; G.player.angle = -Math.PI / 2;
    G.lootTotal = 1240; G.lootStolen = 4; G.lootLeft = 11;
    G.suspicion = 42; G.timeLeft = 98;
    G.tools.lockpick = 1; G.tools.smoke = 1; G.tools.disguise = 2;
    G.relics = ['idol'];
    G.level.loot[0].taken = true; G.level.loot[1].taken = true;
    // pose the enemies close to the player for a busy frame
    G.level.guards[0].x = 560; G.level.guards[0].y = 380; G.level.guards[0].angle = Math.PI * 0.75;
    G.level.guards[1].x = 700; G.level.guards[1].y = 560; G.level.guards[1].angle = -Math.PI / 2;
    G.level.dogs[0].x = 330; G.level.dogs[0].y = 430; G.level.dogs[0].angle = 0.3;
    G.level.cameras[0].angle = Math.PI * 0.6;
    G.level.cameras[1].angle = Math.PI;
  } else if (name === 'boss') {
    // Level 3, lockdown escape, boss hunting, alarm blazing.
    startGame();
    startLevel(2);
    G.player.x = 480; G.player.y = 620; G.player.angle = -Math.PI / 2;
    G.lootTotal = 2310; G.lootStolen = 11; G.lootLeft = 4;
    G.suspicion = 96; G.timeLeft = 61;
    G.tools.lockpick = 0; G.tools.smoke = 0; G.tools.disguise = 1;
    G.relics = ['idol', 'diamond'];
    G.level.vaultCracked = true;
    G.level.escape = true;
    G.alarm = true; G.alarmT = 999;
    G.level.loot.forEach((i, k) => { if (k < 3) i.taken = true; });
    const b = G.level.boss;
    b.x = 480; b.y = 320; b.angle = Math.PI / 2; b.state = 'hunt'; b.seeing = true;
    G.level.guards[0].x = 300; G.level.guards[0].y = 480; G.level.guards[0].state = 'chase';
    G.level.guards[1].x = 700; G.level.guards[1].y = 500; G.level.guards[1].state = 'chase';
    G.level.dogs[0].x = 760; G.level.dogs[0].y = 380; G.level.dogs[0].state = 'chase';
  } else if (name === 'win') {
    startGame();
    G.lootTotal = 2870; G.lootStolen = 15; G.lootLeft = 0;
    G.timeLeftTotal = 87; G.lives = 2;
    G.relics = ['idol', 'diamond', 'vaultkey'];
    G.level = buildLevel(2);
    G.state = 'win';
    drawWin(ctx, G); // compute finalRank now
    G.bestRank = G.finalRank;
  } else {
    G.state = 'title';
  }
}

// --- render + loop --------------------------------------------------------------

function render() {
  if (G.state === 'title') {
    drawTitle(ctx, G);
  } else if (G.state === 'playing') {
    drawHUD(ctx, G);
    drawWorld(ctx, G);
  } else if (G.state === 'shop') {
    drawHUD(ctx, G);
    drawWorld(ctx, G);
    drawShop(ctx, G);
  } else if (G.state === 'win') {
    drawWin(ctx, G);
  } else if (G.state === 'lose') {
    drawHUD(ctx, G);
    drawWorld(ctx, G);
    drawLose(ctx, G);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (G.state === 'playing') updatePlaying(dt);
  else if (G.state === 'title') updateTitle(dt);
  else if (G.state === 'shop') updateShop();
  else if (G.state === 'win' || G.state === 'lose') updateEnd();
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

// Boot: a plain level-0 game is ready for real play; ?scene= picks a
// deterministic showcase state for screenshots.
const scene = params.get('scene');
if (scene) {
  applyScene(scene);
} else {
  startGame();
  G.state = 'title';
}
document.title = TITLE;
requestAnimationFrame(frame);
