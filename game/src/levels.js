// levels.js — the three heist locations: layout, walls, loot spots, enemy
// patrols, vault and exit for each level. All coordinates are absolute canvas
// pixels; the play area is x 0..960, y 64..704 (a 64px HUD bar sits on top).

export const PLAY = { x: 0, y: 64, w: 960, h: 640 };
export const LEVEL_TIME = 150; // seconds per level

// One wall is {x, y, w, h}. Walls block movement and block enemy sight.
export const LEVELS = [
  {
    name: 'MUSEUM',
    sub: 'Level 1 — The Midnight Gallery',
    theme: { floor: '#1d2b45', floorAlt: '#1a263e', wall: '#3d4a63', accent: '#c9a227' },
    playerStart: { x: 480, y: 640 },
    vault: { x: 880, y: 110 },
    exit: { x: 60, y: 640 },
    walls: [
      { x: 150, y: 180, w: 120, h: 26 },
      { x: 420, y: 150, w: 26, h: 130 },
      { x: 640, y: 300, w: 150, h: 26 },
      { x: 220, y: 420, w: 26, h: 130 },
      { x: 520, y: 470, w: 180, h: 26 },
      { x: 800, y: 380, w: 26, h: 130 },
    ],
    bushes: [
      { x: 320, y: 300, r: 34 },
      { x: 700, y: 560, r: 34 },
      { x: 120, y: 480, r: 30 },
    ],
    // 5 loot: [type, x, y]
    loot: [
      ['painting', 210, 130],
      ['coin', 350, 220],
      ['gem', 620, 210],
      ['necklace', 760, 470],
      ['gold', 480, 580],
    ],
    guards: [
      { waypoints: [{ x: 300, y: 160 }, { x: 300, y: 520 }, { x: 700, y: 520 }, { x: 700, y: 160 }], speed: 62 },
      { waypoints: [{ x: 850, y: 300 }, { x: 560, y: 300 }, { x: 560, y: 600 }, { x: 850, y: 600 }], speed: 58 },
    ],
    cameras: [
      { x: 480, y: 96, baseAngle: Math.PI / 2, sweep: 1.1 },
    ],
    dogs: [],
    relic: 'idol',
  },
  {
    name: 'BANK',
    sub: 'Level 2 — The Iron Vault Bank',
    theme: { floor: '#2b2b22', floorAlt: '#26261f', wall: '#4a4a3a', accent: '#d4af37' },
    playerStart: { x: 90, y: 640 },
    vault: { x: 480, y: 110 },
    exit: { x: 890, y: 640 },
    walls: [
      { x: 180, y: 160, w: 26, h: 150 },
      { x: 330, y: 300, w: 160, h: 26 },
      { x: 700, y: 160, w: 26, h: 150 },
      { x: 560, y: 420, w: 26, h: 140 },
      { x: 250, y: 480, w: 170, h: 26 },
      { x: 760, y: 470, w: 150, h: 26 },
    ],
    bushes: [
      { x: 120, y: 300, r: 34 },
      { x: 480, y: 560, r: 36 },
      { x: 850, y: 300, r: 30 },
    ],
    loot: [
      ['gold', 250, 130],
      ['coin', 420, 200],
      ['gem', 640, 130],
      ['painting', 860, 560],
      ['necklace', 340, 600],
    ],
    guards: [
      { waypoints: [{ x: 200, y: 130 }, { x: 760, y: 130 }, { x: 760, y: 380 }, { x: 200, y: 380 }], speed: 72 },
      { waypoints: [{ x: 620, y: 560 }, { x: 620, y: 220 }, { x: 880, y: 220 }, { x: 880, y: 560 }], speed: 68 },
    ],
    cameras: [
      { x: 480, y: 96, baseAngle: Math.PI / 2, sweep: 1.3 },
      { x: 920, y: 380, baseAngle: Math.PI, sweep: 1.0 },
    ],
    dogs: [
      { waypoints: [{ x: 120, y: 420 }, { x: 420, y: 420 }, { x: 420, y: 620 }, { x: 120, y: 620 }], speed: 118 },
    ],
    relic: 'diamond',
  },
  {
    name: 'CASINO VAULT',
    sub: 'Level 3 — The Golden Cage Casino',
    theme: { floor: '#3a1f2e', floorAlt: '#331b28', wall: '#5a3049', accent: '#e8b923' },
    playerStart: { x: 480, y: 640 },
    vault: { x: 80, y: 110 },
    exit: { x: 480, y: 660 },
    walls: [
      { x: 200, y: 180, w: 150, h: 26 },
      { x: 560, y: 150, w: 26, h: 150 },
      { x: 700, y: 330, w: 180, h: 26 },
      { x: 300, y: 420, w: 26, h: 130 },
      { x: 620, y: 480, w: 26, h: 140 },
      { x: 120, y: 520, w: 150, h: 26 },
    ],
    bushes: [
      { x: 250, y: 330, r: 34 },
      { x: 760, y: 180, r: 34 },
      { x: 480, y: 480, r: 36 },
    ],
    loot: [
      ['painting', 300, 130],
      ['gem', 660, 130],
      ['gold', 840, 420],
      ['coin', 180, 620],
      ['necklace', 700, 600],
    ],
    guards: [
      { waypoints: [{ x: 240, y: 130 }, { x: 880, y: 130 }, { x: 880, y: 460 }, { x: 240, y: 460 }], speed: 82 },
      { waypoints: [{ x: 480, y: 300 }, { x: 880, y: 300 }, { x: 880, y: 620 }, { x: 480, y: 620 }], speed: 78 },
    ],
    cameras: [
      { x: 480, y: 96, baseAngle: Math.PI / 2, sweep: 1.4 },
      { x: 40, y: 380, baseAngle: 0, sweep: 1.1 },
    ],
    dogs: [
      { waypoints: [{ x: 140, y: 300 }, { x: 420, y: 300 }, { x: 420, y: 620 }, { x: 140, y: 620 }], speed: 132 },
    ],
    relic: 'vaultkey',
    boss: true,
  },
];

// Build a fresh runtime copy of a level (loot instances, enemies, timers).
export function buildLevel(index) {
  const def = LEVELS[index];
  return {
    index,
    def,
    vaultCracked: false,
    vaultProgress: 0,
    escape: false,
    loot: def.loot.map(([type, x, y]) => ({ type, x, y, taken: false })),
    guards: def.guards.map((g) => ({
      kind: 'patrol',
      x: g.waypoints[0].x, y: g.waypoints[0].y,
      waypoints: g.waypoints, wp: 1, speed: g.speed,
      angle: 0, state: 'patrol', chaseT: 0, stuckT: 0,
    })),
    cameras: def.cameras.map((c) => ({
      kind: 'camera', x: c.x, y: c.y,
      baseAngle: c.baseAngle, sweep: c.sweep, t: Math.random() * 6,
      angle: c.baseAngle, state: 'sweep',
    })),
    dogs: def.dogs.map((d) => ({
      kind: 'dog',
      x: d.waypoints[0].x, y: d.waypoints[0].y,
      waypoints: d.waypoints, wp: 1, speed: d.speed,
      angle: 0, state: 'patrol', chaseT: 0,
    })),
    boss: def.boss ? {
      kind: 'boss', x: 880, y: 130,
      waypoints: [{ x: 880, y: 130 }, { x: 480, y: 130 }, { x: 480, y: 560 }, { x: 880, y: 560 }],
      wp: 1, speed: 96, angle: Math.PI, state: 'patrol', chaseT: 0,
    } : null,
  };
}

// --- collision helpers -------------------------------------------------------

export function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

// Move a circle, sliding along walls (axis-separated, simple and robust).
export function moveWithWalls(e, dx, dy, r, walls) {
  const nx = e.x + dx;
  if (!circleHitsWall(nx, e.y, r, walls) && nx > PLAY.x + r && nx < PLAY.x + PLAY.w - r) e.x = nx;
  const ny = e.y + dy;
  if (!circleHitsWall(e.x, ny, r, walls) && ny > PLAY.y + r && ny < PLAY.y + PLAY.h - r) e.y = ny;
}

// Segment (x1,y1)-(x2,y2) blocked by any wall? Used for line of sight.
export function losBlocked(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segmentRect(x1, y1, x2, y2, w)) return true;
  }
  return false;
}

function segmentRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  let tmin = 0, tmax = 1;
  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx, t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy, t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}
