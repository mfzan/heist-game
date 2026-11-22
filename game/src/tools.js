// tools.js — the thief's three tools, shown in the HUD with key + count,
// usable by keyboard or by clicking the HUD button.
//  1 Lockpick — the next vault crack runs 2x faster (2 per level)
//  2 Smoke Bomb — suspicion drops to 0 and you are unseen for 3s (1 per level)
//  3 Disguise — walk slow for 5s while guards ignore you (2 per level)

export const TOOL_DEFS = [
  { id: 'lockpick', key: '1', label: 'Lockpick', short: 'LOCKPICK', desc: 'Next vault crack 2x faster', color: '#ffd94a' },
  { id: 'smoke', key: '2', label: 'Smoke Bomb', short: 'SMOKE', desc: 'Suspicion → 0, unseen 3s', color: '#9fb3c8' },
  { id: 'disguise', key: '3', label: 'Disguise', short: 'DISGUISE', desc: 'Guards ignore you 5s (slow walk)', color: '#7ee787' },
];

export function freshTools(extraSmoke = 0) {
  return {
    lockpick: 2,
    smoke: 1 + extraSmoke,
    disguise: 2,
    lockpickArmed: false, // consumed on the next crack
    smokeT: 0,            // seconds of invisibility left
    disguiseT: 0,         // seconds of disguise left
  };
}

export function useTool(G, id) {
  const t = G.tools;
  if (id === 'lockpick') {
    if (t.lockpick <= 0 || t.lockpickArmed) return false;
    t.lockpick -= 1;
    t.lockpickArmed = true;
    return true;
  }
  if (id === 'smoke') {
    if (t.smoke <= 0) return false;
    t.smoke -= 1;
    t.smokeT = 3;
    G.suspicion = 0;
    G.alarm = false;
    for (const e of allEnemies(G)) e.state = 'patrol';
    return true;
  }
  if (id === 'disguise') {
    if (t.disguise <= 0 || t.disguiseT > 0) return false;
    t.disguise -= 1;
    t.disguiseT = 5;
    return true;
  }
  return false;
}

export function allEnemies(G) {
  const L = G.level;
  const list = [...L.guards, ...L.cameras, ...L.dogs];
  if (L.boss) list.push(L.boss);
  return list;
}

export function tickTools(G, dt) {
  if (G.tools.smokeT > 0) G.tools.smokeT = Math.max(0, G.tools.smokeT - dt);
  if (G.tools.disguiseT > 0) G.tools.disguiseT = Math.max(0, G.tools.disguiseT - dt);
}
