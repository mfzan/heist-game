// loot.js — everything the thief can steal: the 5 loot kinds (15 total, 5 per
// level) and the 3 permanent relics, one hidden in each vault.

export const LOOT_TYPES = {
  coin:     { label: 'Coin',      value: 50,  color: '#ffd94a', shape: 'coin' },
  gem:      { label: 'Gem',       value: 150, color: '#4ad7ff', shape: 'gem' },
  gold:     { label: 'Gold Bar',  value: 200, color: '#ffb52e', shape: 'bar' },
  painting: { label: 'Painting',  value: 300, color: '#ff7a59', shape: 'painting' },
  necklace: { label: 'Necklace',  value: 250, color: '#e07bff', shape: 'necklace' },
};

export const RELICS = {
  idol: {
    name: 'Golden Idol', icon: '◈', color: '#ffd94a',
    desc: '+10% move speed, forever',
    apply: (mods) => { mods.speedMul *= 1.10; },
  },
  diamond: {
    name: 'Diamond', icon: '◆', color: '#4ad7ff',
    desc: '+1 Smoke Bomb every level',
    apply: (mods) => { mods.extraSmoke += 1; },
  },
  vaultkey: {
    name: 'Vault Key', icon: '⚿', color: '#e8b923',
    desc: 'Vaults crack 25% faster',
    apply: (mods) => { mods.crackMul *= 1.25; },
  },
};

export function freshMods() {
  return { speedMul: 1, crackMul: 1, extraSmoke: 0, suspicionMul: 1 };
}

// Pick up any loot the player is standing on. Returns the $ gained.
export function collectLootAt(level, px, py, onCollect) {
  let gained = 0;
  for (const item of level.loot) {
    if (item.taken) continue;
    const dx = px - item.x, dy = py - item.y;
    if (dx * dx + dy * dy < 30 * 30) {
      item.taken = true;
      gained += LOOT_TYPES[item.type].value;
      if (onCollect) onCollect(item);
    }
  }
  return gained;
}

export function lootRemaining(level) {
  return level.loot.filter((i) => !i.taken).length;
}

export function lootValue(level) {
  return level.loot.filter((i) => !i.taken)
    .reduce((s, i) => s + LOOT_TYPES[i.type].value, 0);
}
