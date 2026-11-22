// render.js — all canvas drawing of the world: floor, walls, bushes, loot,
// vault, exit, enemies with their vision cones, the player, and overlays
// (alarm vignette, crack progress ring). No external images, ever.

import { PLAY } from './levels.js';
import { LOOT_TYPES } from './loot.js';
import { VISION } from './guard.js';
import { BOSS_NAME } from './boss.js';

function conePath(ctx, e, range, half) {
  ctx.beginPath();
  ctx.moveTo(e.x, e.y);
  ctx.arc(e.x, e.y, range, e.angle - half, e.angle + half);
  ctx.closePath();
}

function drawCone(ctx, e) {
  const v = VISION[e.kind];
  const hot = e.kind === 'boss' || e.state === 'chase';
  ctx.fillStyle = hot ? 'rgba(255,60,60,0.20)' : 'rgba(255,220,80,0.13)';
  conePath(ctx, e, v.range, v.half);
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(255,80,80,0.35)' : 'rgba(255,220,80,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawLootShape(ctx, item) {
  const t = LOOT_TYPES[item.type];
  const bob = Math.sin(Date.now() / 300 + item.x) * 2;
  ctx.save();
  ctx.translate(item.x, item.y + bob);
  ctx.fillStyle = t.color;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 2;
  if (t.shape === 'coin') {
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a6d00'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 1);
  } else if (t.shape === 'gem') {
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(9, -2); ctx.lineTo(0, 11); ctx.lineTo(-9, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (t.shape === 'bar') {
    ctx.fillRect(-11, -6, 22, 12); ctx.strokeRect(-11, -6, 22, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-11, -1, 22, 2);
  } else if (t.shape === 'painting') {
    ctx.fillRect(-11, -8, 22, 16); ctx.strokeRect(-11, -8, 22, 16);
    ctx.fillStyle = '#fff'; ctx.fillRect(-7, -4, 14, 8);
    ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
  } else { // necklace
    ctx.beginPath(); ctx.arc(0, 1, 9, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 3; ctx.strokeStyle = t.color; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 8, 4, 0, Math.PI * 2); ctx.fillStyle = t.color; ctx.fill();
  }
  ctx.restore();
}

function drawGuard(ctx, e) {
  drawCone(ctx, e);
  ctx.save();
  ctx.translate(e.x, e.y);
  // body
  ctx.fillStyle = e.kind === 'dog' ? '#8a6d4b' : '#2f6fb2';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, e.kind === 'dog' ? 11 : 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (e.kind === 'dog') {
    // ears + snout
    ctx.fillStyle = '#6b543a';
    ctx.beginPath(); ctx.arc(-6, -8, 4, 0, Math.PI * 2); ctx.arc(6, -8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(e.angle);
    ctx.fillStyle = '#6b543a'; ctx.beginPath(); ctx.arc(11, 0, 5, 0, Math.PI * 2); ctx.fill();
  } else {
    // cap + facing tick
    ctx.fillStyle = '#1d4e89';
    ctx.beginPath(); ctx.arc(0, -3, 8, Math.PI, 0); ctx.fill();
    ctx.rotate(e.angle);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(13, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // "!" when this enemy currently sees you
  if (e.seeing) {
    ctx.fillStyle = '#ff5252'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', e.x, e.y - 20);
  }
}

function drawCamera(ctx, c) {
  drawCone(ctx, c);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = '#5a6b7d';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2;
  ctx.fillRect(-9, -9, 18, 18); ctx.strokeRect(-9, -9, 18, 18);
  ctx.rotate(c.angle);
  ctx.fillStyle = c.seeing ? '#ff4040' : '#ff4040';
  ctx.beginPath(); ctx.arc(10, 0, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c.seeing ? '#ff2020' : '#7dff9a';
  ctx.beginPath(); ctx.arc(10, 0, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (c.seeing) {
    ctx.fillStyle = '#ff5252'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', c.x, c.y - 20);
  }
}

function drawBoss(ctx, b) {
  drawCone(ctx, b);
  ctx.save();
  ctx.translate(b.x, b.y);
  // big red-suited boss with gold epaulettes
  ctx.fillStyle = '#b02020';
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(-16, -6, 6, 4); ctx.fillRect(10, -6, 6, 4);
  ctx.rotate(b.angle);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(17, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ff5252'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(BOSS_NAME, b.x, b.y - 26);
  if (b.seeing) {
    ctx.fillStyle = '#ff2020'; ctx.font = 'bold 22px sans-serif';
    ctx.fillText('!!', b.x, b.y - 40);
  }
}

function drawPlayer(ctx, p, tools, hidden) {
  ctx.save();
  ctx.translate(p.x, p.y);
  if (tools.smokeT > 0) ctx.globalAlpha = 0.55;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(0, 12, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  // body: black hoodie thief
  ctx.fillStyle = '#17181c';
  ctx.strokeStyle = hidden ? '#7ee787' : '#3a3f4a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // mask + eyes
  ctx.fillStyle = '#0b0b0e';
  ctx.fillRect(-8, -6, 16, 7);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-3.5, -2.5, 1.8, 0, Math.PI * 2); ctx.arc(3.5, -2.5, 1.8, 0, Math.PI * 2); ctx.fill();
  // disguise: a little hat
  if (tools.disguiseT > 0) {
    ctx.fillStyle = '#c9a227';
    ctx.beginPath(); ctx.arc(0, -6, 9, Math.PI, 0); ctx.fill();
    ctx.fillRect(-10, -7, 20, 3);
  }
  ctx.restore();
  // facing tick
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0);
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(9, -4); ctx.lineTo(9, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function drawWorld(ctx, G) {
  const L = G.level;
  const def = L.def;
  const theme = def.theme;

  // floor tiles
  ctx.fillStyle = theme.floor;
  ctx.fillRect(PLAY.x, PLAY.y, PLAY.w, PLAY.h);
  ctx.fillStyle = theme.floorAlt;
  const ts = 40;
  for (let y = PLAY.y; y < PLAY.y + PLAY.h; y += ts) {
    for (let x = PLAY.x + ((y / ts) % 2) * ts / 2; x < PLAY.x + PLAY.w; x += ts) {
      ctx.fillRect(x, y, ts / 2, ts / 2);
    }
  }

  // bushes (hiding spots)
  for (const b of def.bushes) {
    ctx.fillStyle = '#2e6b34';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f8a46';
    ctx.beginPath(); ctx.arc(b.x - 8, b.y - 6, b.r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(b.x + 10, b.y + 6, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('HIDE', b.x, b.y + 3);
  }

  // walls
  for (const w of def.walls) {
    ctx.fillStyle = theme.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  // exit door (locked until the vault is cracked)
  const ex = def.exit;
  ctx.save();
  ctx.translate(ex.x, ex.y);
  ctx.fillStyle = L.escape ? '#27c24a' : '#555';
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(L.escape ? 'EXIT' : 'LOCKED', 0, 4);
  if (L.escape) {
    ctx.strokeStyle = 'rgba(39,194,74,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  // vault
  const v = def.vault;
  ctx.save();
  ctx.translate(v.x, v.y);
  ctx.fillStyle = L.vaultCracked ? '#3a2f10' : '#8a6d1f';
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d4af37';
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a4310';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#111'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(L.vaultCracked ? 'OPEN' : 'VAULT', 0, 44);
  ctx.restore();
  // crack progress ring
  if (L.vaultProgress > 0 && !L.vaultCracked) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(v.x, v.y, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#ffd94a';
    ctx.beginPath(); ctx.arc(v.x, v.y, 40, -Math.PI / 2, -Math.PI / 2 + (L.vaultProgress / 100) * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CRACKING ' + Math.floor(L.vaultProgress) + '%', v.x, v.y - 48);
  }

  // loot
  for (const item of L.loot) if (!item.taken) drawLootShape(ctx, item);

  // enemies (cones first, then bodies, so cones never cover loot)
  for (const g of L.guards) drawGuard(ctx, g);
  for (const d of L.dogs) drawGuard(ctx, d);
  for (const c of L.cameras) drawCamera(ctx, c);
  if (L.boss) drawBoss(ctx, L.boss);

  // player
  const hidden = G.hiddenNow;
  drawPlayer(ctx, G.player, G.tools, hidden);

  // alarm vignette + banner
  if (G.alarm || L.escape) {
    const pulse = 0.10 + 0.05 * Math.sin(Date.now() / 120);
    ctx.fillStyle = `rgba(255,30,30,${pulse})`;
    ctx.fillRect(PLAY.x, PLAY.y, PLAY.w, PLAY.h);
    ctx.fillStyle = '#ff4040'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(L.escape ? '⚠ LOCKDOWN — GET TO THE EXIT! ⚠' : '⚠ ALARM! ⚠', 480, PLAY.y + 44);
  }

  // objective line at the bottom of the play area
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(PLAY.x, PLAY.y + PLAY.h - 26, PLAY.w, 26);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  const obj = L.vaultCracked
    ? 'VAULT OPEN — grab the relic and RUN to the green EXIT!'
    : `Steal the loot, then hold E at the VAULT to crack it  •  ${G.lootLeft} loot left`;
  ctx.fillText(obj, 480, PLAY.y + PLAY.h - 8);
}
