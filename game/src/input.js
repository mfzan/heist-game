// input.js — keyboard (WASD/arrows, E to crack, 1/Q/F tools) and mouse
// (clickable HUD tool buttons, title/shop/victory buttons).

export function createInput(canvas) {
  const keys = {};
  const pressed = {}; // edge-triggered keys, consumed once per frame
  const mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };

  function keyName(e) {
    return e.key.length === 1 ? e.key.toLowerCase() : e.key;
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
  });
  window.addEventListener('keyup', (e) => { keys[keyName(e)] = false; });

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.clickX = (e.clientX - r.left) * (canvas.width / r.width);
    mouse.clickY = (e.clientY - r.top) * (canvas.height / r.height);
    mouse.clicked = true;
  });

  return {
    keys, pressed, mouse,
    // Movement vector, normalised.
    moveVec() {
      let x = 0, y = 0;
      if (keys['a'] || keys['ArrowLeft']) x -= 1;
      if (keys['d'] || keys['ArrowRight']) x += 1;
      if (keys['w'] || keys['ArrowUp']) y -= 1;
      if (keys['s'] || keys['ArrowDown']) y += 1;
      if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
    cracking() { return !!(keys['e']); },
    consumePressed(k) { const v = !!pressed[k]; if (v) pressed[k] = false; return v; },
    consumeClick() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return { x: mouse.clickX, y: mouse.clickY };
    },
    endFrame() { for (const k in pressed) pressed[k] = false; },
  };
}

// True when a click point falls inside a rectangle.
export function hitRect(click, r) {
  return click && click.x >= r.x && click.x <= r.x + r.w && click.y >= r.y && click.y <= r.y + r.h;
}
