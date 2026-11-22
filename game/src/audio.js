// audio.js — all sound is WebAudio oscillators, no audio files, no network.
// Every call is guarded so the game still runs (and screenshots) headless.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.08, when = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = c.currentTime + when;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) { /* audio is cosmetic */ }
}

export const sfx = {
  init() { ac(); },
  toggleMute() { muted = !muted; return muted; },
  coin() { tone(880, 0.09, 'sine', 0.07); tone(1320, 0.12, 'sine', 0.05, 0.06); },
  gem() { tone(660, 0.1, 'triangle', 0.08); tone(990, 0.14, 'triangle', 0.06, 0.07); },
  crackTick() { tone(240, 0.05, 'square', 0.03); },
  vaultOpen() { tone(330, 0.15, 'triangle', 0.09); tone(495, 0.2, 'triangle', 0.09, 0.1); tone(660, 0.3, 'triangle', 0.08, 0.2); },
  alarm() { tone(520, 0.18, 'sawtooth', 0.06); tone(390, 0.18, 'sawtooth', 0.06, 0.18); },
  smoke() { tone(180, 0.3, 'sine', 0.06); },
  disguise() { tone(440, 0.12, 'sine', 0.05); tone(554, 0.12, 'sine', 0.05, 0.1); },
  busted() { tone(220, 0.25, 'sawtooth', 0.09); tone(110, 0.5, 'sawtooth', 0.09, 0.2); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.08, i * 0.13));
  },
  click() { tone(700, 0.05, 'sine', 0.05); },
  buy() { tone(520, 0.1, 'triangle', 0.08); tone(780, 0.18, 'triangle', 0.08, 0.08); },
};
