// hud.js — the top HUD bar, drawn on every frame so every screenshot shows
// the numbers: loot $, suspicion meter, timer, lives, tool counts, level name
// and relic icons. Also draws the title, shop, victory and defeat screens.

import { RELICS } from './loot.js';
import { TOOL_DEFS } from './tools.js';

export const HUD_H = 64;

export function toolButtonRects() {
  // Returns the clickable rects for the three tool buttons (canvas coords).
  return TOOL_DEFS.map((t, i) => ({ id: t.id, x: 560 + i * 108, y: 10, w: 100, h: 44 }));
}

export function drawHUD(ctx, G) {
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, 960, HUD_H);
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(0, HUD_H - 3, 960, 3);

  // level name
  ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(G.level.def.name, 14, 20);
  ctx.fillStyle = '#9fb3c8'; ctx.font = '12px sans-serif';
  ctx.fillText(G.level.def.sub, 14, 42);

  // loot $
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText('$' + G.lootTotal.toLocaleString('en-US'), 210, 22);
  ctx.fillStyle = '#9fb3c8'; ctx.font = '11px sans-serif';
  ctx.fillText('LOOT  •  ' + G.lootLeft + ' left', 210, 44);

  // suspicion meter
  const sx = 330, sw = 150;
  ctx.fillStyle = '#222'; ctx.fillRect(sx, 12, sw, 16);
  const susp = Math.max(0, Math.min(100, G.suspicion));
  ctx.fillStyle = susp < 50 ? '#ffd94a' : susp < 80 ? '#ff8c2e' : '#ff4040';
  ctx.fillRect(sx, 12, (sw * susp) / 100, 16);
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(sx, 12, sw, 16);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SUSPICION ' + Math.floor(susp) + '%', sx + sw / 2, 20);
  ctx.textAlign = 'left';
  // timer + lives under it
  ctx.fillStyle = G.timeLeft < 30 ? '#ff4040' : '#fff'; ctx.font = 'bold 15px sans-serif';
  ctx.fillText('⏱ ' + Math.ceil(G.timeLeft) + 's', sx, 46);
  ctx.fillStyle = '#ff6b81'; ctx.font = '15px sans-serif';
  ctx.fillText('♥'.repeat(G.lives) + '♡'.repeat(Math.max(0, 3 - G.lives)), sx + 72, 46);

  // tool buttons
  for (const r of toolButtonRects()) {
    const def = TOOL_DEFS.find((t) => t.id === r.id);
    const count = G.tools[r.id];
    ctx.fillStyle = count > 0 ? '#1c2433' : '#14181f';
    ctx.strokeStyle = count > 0 ? def.color : '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = def.color; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('[' + def.key + '] ' + def.short, r.x + r.w / 2, r.y + 16);
    ctx.fillStyle = count > 0 ? '#fff' : '#666'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('x' + count, r.x + r.w / 2, r.y + 34);
  }
  ctx.textAlign = 'left';

  // relic icons (top right)
  let rx = 900;
  for (const id of G.relics) {
    const rel = RELICS[id];
    ctx.fillStyle = rel.color; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(rel.icon, rx, 26);
    rx -= 26;
  }
  if (G.relics.length) {
    ctx.fillStyle = '#9fb3c8'; ctx.font = '10px sans-serif';
    ctx.fillText('RELICS', 915, 48);
  }
  ctx.textAlign = 'left';
}

// --- full screens ------------------------------------------------------------

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8,10,16,0.92)';
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke();
}

export function drawTitle(ctx, G) {
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, 960, 704);
  // gold vault-door backdrop
  ctx.strokeStyle = '#2a2f3d'; ctx.lineWidth = 3;
  for (let r = 40; r < 320; r += 44) {
    ctx.beginPath(); ctx.arc(480, 330, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#8a6d1f';
  ctx.beginPath(); ctx.arc(480, 330, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(480, 330, 34, 0, Math.PI * 2); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 44px sans-serif';
  ctx.fillText('SHADOW HEIST', 480, 120);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 19px sans-serif';
  ctx.fillText('slip past the guards, crack the vaults and vanish', 480, 152);
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 17px sans-serif';
  ctx.fillText('— 3 vaults, 3 guard kinds, 3 tools, 1 boss, 15 loot —', 480, 182);
  ctx.fillStyle = '#9fb3c8'; ctx.font = '14px sans-serif';
  ctx.fillText('3 levels  •  3 relics  •  Black Market between heists  •  3 difficulties', 480, 208);

  // difficulty buttons
  const diffs = [
    { id: 'easy', label: 'EASY', desc: 'slow guards, calm nerves' },
    { id: 'normal', label: 'NORMAL', desc: 'the classic heist' },
    { id: 'hard', label: 'HARD', desc: 'fast guards, sharp eyes' },
  ];
  G.titleButtons = diffs.map((d, i) => {
    const r = { id: d.id, x: 180 + i * 210, y: 250, w: 190, h: 64 };
    ctx.fillStyle = G.difficultyId === d.id ? '#ffd94a' : '#1c2433';
    ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = G.difficultyId === d.id ? '#111' : '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(d.label, r.x + r.w / 2, r.y + 24);
    ctx.font = '12px sans-serif';
    ctx.fillText(d.desc, r.x + r.w / 2, r.y + 46);
    return r;
  });

  ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif';
  ctx.fillText('WASD / arrows — move    •    E (hold) — crack the vault    •    1 / 2 / 3 — tools', 480, 360);
  ctx.fillText('Hide in bushes  •  Dodge the cones  •  Crack the vault, then RUN to the EXIT', 480, 386);
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 15px sans-serif';
  ctx.fillText('The vault trips the lockdown — the Head of Security hunts you personally.', 480, 414);

  // start button
  const sb = { x: 360, y: 450, w: 240, h: 56 };
  G.startButton = sb;
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.roundRect(sb.x, sb.y, sb.w, sb.h, 10); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = 'bold 22px sans-serif';
  ctx.fillText('▶  START THE HEIST', 480, sb.y + 35);

  if (G.bestRank) {
    ctx.fillStyle = '#7ee787'; ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Best rank so far: ' + G.bestRank, 480, 550);
  }
  ctx.fillStyle = '#666'; ctx.font = '12px sans-serif';
  ctx.fillText('A complete offline heist game — no network, no downloads.  Made for make.fun.', 480, 660);
  ctx.textAlign = 'left';
}

export function drawShop(ctx, G) {
  ctx.fillStyle = 'rgba(5,6,10,0.88)';
  ctx.fillRect(0, 0, 960, 704);
  panel(ctx, 130, 90, 700, 480);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText('🕶 BLACK MARKET', 480, 140);
  ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif';
  ctx.fillText(`Level ${G.level.index + 1} cleared!  Your loot: $${G.lootTotal.toLocaleString('en-US')}  — spend it on ONE upgrade.`, 480, 172);

  const ups = [
    { id: 'boots', name: 'Swift Boots', price: 300, desc: '+10% move speed, forever', icon: '🥾' },
    { id: 'smoke', name: 'Extra Smoke', price: 250, desc: '+1 Smoke Bomb every level', icon: '💨' },
    { id: 'cool', name: 'Cool Head', price: 250, desc: '−25% suspicion gain, forever', icon: '🧊' },
  ];
  G.shopButtons = ups.map((u, i) => {
    const r = { id: u.id, x: 170 + i * 220, y: 210, w: 200, h: 150 };
    const afford = G.lootTotal >= u.price;
    ctx.fillStyle = afford ? '#1c2433' : '#14181f';
    ctx.strokeStyle = afford ? '#ffd94a' : '#444'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.stroke();
    ctx.font = '34px sans-serif'; ctx.fillText(u.icon, r.x + r.w / 2, r.y + 48);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText(u.name, r.x + r.w / 2, r.y + 84);
    ctx.fillStyle = afford ? '#ffd94a' : '#888'; ctx.font = 'bold 15px sans-serif';
    ctx.fillText('$' + u.price, r.x + r.w / 2, r.y + 110);
    ctx.fillStyle = '#9fb3c8'; ctx.font = '12px sans-serif';
    ctx.fillText(u.desc, r.x + r.w / 2, r.y + 132);
    return r;
  });

  const cb = { x: 360, y: 420, w: 240, h: 52 };
  G.shopContinue = cb;
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.roundRect(cb.x, cb.y, cb.w, cb.h, 10); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = 'bold 19px sans-serif';
  ctx.fillText('CONTINUE →', 480, cb.y + 33);
  ctx.fillStyle = '#9fb3c8'; ctx.font = '13px sans-serif';
  ctx.fillText('Relics so far: ' + (G.relics.map((id) => RELICS[id].name).join('  •  ') || 'none yet'), 480, 510);
  ctx.textAlign = 'left';
}

export function rankFor(loot, timeLeft) {
  const score = loot + timeLeft * 5;
  if (score >= 3000) return 'S';
  if (score >= 2400) return 'A';
  if (score >= 1800) return 'B';
  return 'C';
}

export function drawWin(ctx, G) {
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 0, 960, 704);
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 2;
  for (let r = 30; r < 260; r += 40) {
    ctx.beginPath(); ctx.arc(480, 300, r, 0, Math.PI * 2); ctx.stroke();
  }
  const rank = rankFor(G.lootTotal, G.timeLeftTotal);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 40px sans-serif';
  ctx.fillText('🏆 CLEAN GETAWAY!', 480, 120);
  ctx.fillStyle = '#fff'; ctx.font = '19px sans-serif';
  ctx.fillText('All 3 vaults cracked. The Head of Security never stood a chance.', 480, 152);

  panel(ctx, 230, 190, 500, 300);
  ctx.fillStyle = '#ffd94a'; ctx.font = 'bold 64px sans-serif';
  ctx.fillText('RANK ' + rank, 480, 270);
  const rows = [
    ['Total loot', '$' + G.lootTotal.toLocaleString('en-US')],
    ['Time left', Math.ceil(G.timeLeftTotal) + 's across the heist'],
    ['Loot stolen', G.lootStolen + ' / 15 items'],
    ['Relics', G.relics.map((id) => RELICS[id].name).join(', ') || 'none'],
    ['Difficulty', G.difficultyId.toUpperCase()],
    ['Lives left', '♥'.repeat(G.lives)],
  ];
  ctx.font = '16px sans-serif';
  rows.forEach((row, i) => {
    const y = 310 + i * 28;
    ctx.fillStyle = '#9fb3c8'; ctx.textAlign = 'right';
    ctx.fillText(row[0], 460, y);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(row[1], 480, y);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7ee787'; ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Press R or click to play again', 480, 530);
  const rb = { x: 360, y: 550, w: 240, h: 52 };
  G.againButton = rb;
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.roundRect(rb.x, rb.y, rb.w, rb.h, 10); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = 'bold 19px sans-serif';
  ctx.fillText('↻  PLAY AGAIN', 480, rb.y + 33);
  ctx.textAlign = 'left';
  G.finalRank = rank;
}

export function drawLose(ctx, G) {
  ctx.fillStyle = 'rgba(10,4,4,0.94)';
  ctx.fillRect(0, 0, 960, 704);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5252'; ctx.font = 'bold 44px sans-serif';
  ctx.fillText('🚨 BUSTED!', 480, 200);
  ctx.fillStyle = '#fff'; ctx.font = '19px sans-serif';
  ctx.fillText(G.loseReason || 'The guards caught you red-handed.', 480, 244);
  ctx.fillStyle = '#9fb3c8'; ctx.font = '16px sans-serif';
  ctx.fillText(`Level ${G.level.index + 1} — ${G.level.def.name}   •   Loot kept: $${G.lootTotal.toLocaleString('en-US')}`, 480, 280);
  const rb = { x: 360, y: 330, w: 240, h: 52 };
  G.againButton = rb;
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.roundRect(rb.x, rb.y, rb.w, rb.h, 10); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = 'bold 19px sans-serif';
  ctx.fillText('↻  RETRY (R)', 480, rb.y + 33);
  ctx.textAlign = 'left';
}
