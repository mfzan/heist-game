// boss.js — the Head of Security, the final level's boss.
// Fast patrol with a bigger vision cone than any guard. The moment he spots
// you the alarm trips instantly, and during the lockdown escape he hunts you
// personally instead of wandering. He is the reason level 3 is a different
// game from levels 1 and 2.

import { moveWithWalls } from './levels.js';
import { VISION } from './guard.js';
import { losBlocked } from './levels.js';

export const BOSS_NAME = 'HEAD OF SECURITY';

export function updateBoss(boss, dt, G) {
  const L = G.level;
  const diff = G.difficulty;
  if (!boss) return;

  if (boss.state === 'hunt') {
    // Hunt: run the player down, cutting corners through the room.
    const dx = G.player.x - boss.x, dy = G.player.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    boss.angle = Math.atan2(dy, dx);
    const sp = boss.speed * 1.5 * diff.guardMul * dt;
    moveWithWalls(boss, (dx / dist) * sp, (dy / dist) * sp, 16, L.def.walls);
    return;
  }

  // Patrol: brisk walk between waypoints.
  const t = boss.waypoints[boss.wp];
  const dx = t.x - boss.x, dy = t.y - boss.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 8) {
    boss.wp = (boss.wp + 1) % boss.waypoints.length;
  } else {
    boss.angle = Math.atan2(dy, dx);
    const sp = boss.speed * diff.guardMul * dt;
    boss.x += (dx / dist) * sp;
    boss.y += (dy / dist) * sp;
  }

  // During the lockdown escape the boss stops patrolling and hunts.
  if (L.escape) boss.state = 'hunt';
}

// The boss sees you: instant alarm, no slow suspicion build-up.
export function bossSpotsYou(boss, G) {
  if (!boss) return false;
  const L = G.level;
  const v = VISION.boss;
  const dx = G.player.x - boss.x, dy = G.player.y - boss.y;
  const dist = Math.hypot(dx, dy);
  if (dist > v.range) return false;
  if (G.tools.disguiseT > 0 && dist > 34) return false;
  let d = Math.atan2(dy, dx) - boss.angle;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  if (Math.abs(d) > v.half) return false;
  if (losBlocked(boss.x, boss.y, G.player.x, G.player.y, L.def.walls)) return false;
  // Bushes hide you from the boss too.
  for (const b of L.def.bushes) {
    const bx = G.player.x - b.x, by = G.player.y - b.y;
    if (bx * bx + by * by < (b.r - 4) * (b.r - 4)) return false;
  }
  return true;
}
