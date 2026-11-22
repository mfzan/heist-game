// guard.js — the three enemy kinds and how they see you.
// Patrol Guard: walks waypoints, vision cone, suspicion rises on sight.
// Camera: static, cone sweeps back and forth, spots you fast.
// Dog: fast patrol, short vision, barking raises suspicion quickly.
// All vision is blocked by walls (line of sight) and by bushes (hiding).

import { losBlocked, moveWithWalls, PLAY } from './levels.js';

export const VISION = {
  patrol: { range: 165, half: 0.62, spotRate: 42, touch: 26 },
  camera: { range: 190, half: 0.5, spotRate: 68, touch: 0 },
  dog: { range: 115, half: 0.7, spotRate: 55, touch: 26 },
  boss: { range: 210, half: 0.6, spotRate: 120, touch: 28 },
};

function angleTo(e, x, y) { return Math.atan2(y - e.y, x - e.x); }

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Can this enemy see the player right now?
export function canSee(e, px, py, walls, bushes, hidden, disguised) {
  if (hidden) return false;
  const v = VISION[e.kind];
  const dx = px - e.x, dy = py - e.y;
  const dist = Math.hypot(dx, dy);
  if (dist > v.range) return false;
  // Disguise: ignored unless very close.
  if (disguised && dist > 34) return false;
  const a = angleTo(e, px, py);
  if (Math.abs(angleDiff(a, e.angle)) > v.half) return false;
  if (losBlocked(e.x, e.y, px, py, walls)) return false;
  return true;
}

// Is the player inside a bush (hidden from all vision)?
export function inBush(px, py, bushes) {
  for (const b of bushes) {
    const dx = px - b.x, dy = py - b.y;
    if (dx * dx + dy * dy < (b.r - 4) * (b.r - 4)) return true;
  }
  return false;
}

// Walk toward the current waypoint; returns true when arrived.
function stepPatrol(e, dt, speedMul) {
  const t = e.waypoints[e.wp];
  const dx = t.x - e.x, dy = t.y - e.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) {
    e.wp = (e.wp + 1) % e.waypoints.length;
    return true;
  }
  const sp = e.speed * speedMul * dt;
  e.angle = Math.atan2(dy, dx);
  e.x += (dx / dist) * sp;
  e.y += (dy / dist) * sp;
  return false;
}

// Chase the player directly (alarm / escape phase).
function chase(e, dt, px, py, walls, speedMul) {
  const dx = px - e.x, dy = py - e.y;
  const dist = Math.hypot(dx, dy) || 1;
  e.angle = Math.atan2(dy, dx);
  const sp = e.speed * 1.45 * speedMul * dt;
  moveWithWalls(e, (dx / dist) * sp, (dy / dist) * sp, 14, walls);
}

// One patrol guard or dog per frame.
export function updateEnemy(e, dt, G) {
  const L = G.level;
  const diff = G.difficulty;
  if (e.state === 'chase') {
    chase(e, dt, G.player.x, G.player.y, L.def.walls, diff.guardMul);
    e.chaseT -= dt;
    if (e.chaseT <= 0) e.state = 'patrol';
    return;
  }
  stepPatrol(e, dt, diff.guardMul);
  // During alarm or lockdown escape, patrols switch to chase.
  if (G.alarm || L.escape) {
    e.state = 'chase';
    e.chaseT = 6;
  }
}

// A camera sweeps its cone back and forth around its base angle.
export function updateCamera(c, dt) {
  c.t += dt;
  c.angle = c.baseAngle + Math.sin(c.t * 0.7) * c.sweep;
}

// How much suspicion this enemy adds this frame (0 when it cannot see you).
export function spotGain(e, dt, G) {
  const L = G.level;
  const hidden = inBush(G.player.x, G.player.y, L.def.bushes);
  const disguised = G.tools.disguiseT > 0;
  if (!canSee(e, G.player.x, G.player.y, L.def.walls, L.def.bushes, hidden, disguised)) return 0;
  const v = VISION[e.kind];
  const dist = Math.hypot(G.player.x - e.x, G.player.y - e.y);
  const closeness = 1 + (1 - dist / v.range) * 0.8; // closer = spotted faster
  return v.spotRate * closeness * G.difficulty.suspicionMul * G.mods.suspicionMul * dt;
}

// Touching an enemy (not a camera) busts the player.
export function touchingPlayer(e, px, py) {
  const v = VISION[e.kind];
  if (!v.touch) return false;
  const dx = px - e.x, dy = py - e.y;
  return dx * dx + dy * dy < v.touch * v.touch;
}

export { PLAY };
