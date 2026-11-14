// HUD orbital (Phase 4) : altitude, vitesse, periode + facteur de temps.
// Overlay DOM dans #vue3d (lisible sur mobile, boutons cliquables).

const SCALES = [1, 100, 1000];

const fmt = (x, d = 1) => Number(x).toFixed(d).replace('.', ',');

export function createOrbitHud(container) {
  const root = document.createElement('div');
  root.className = 'vis-hud';
  root.hidden = true;
  root.innerHTML = `
    <div class="vis-hud-stats" role="status">
      <span data-k="alt"><b>ALT</b> —</span>
      <span data-k="vit"><b>VIT</b> —</span>
      <span data-k="per"><b>PÉR</b> —</span>
      <span data-k="range"><b>PÉRI / APO</b> —</span>
    </div>
    <div class="vis-hud-scales" role="group" aria-label="Vitesse de simulation">
      ${SCALES.map(
        (s) =>
          `<button type="button" class="vis-hud-scale" data-scale="${s}" aria-pressed="false">${
            s === 1 ? '×1 réel' : `×${s}`
          }</button>`
      ).join('')}
    </div>
  `;
  container.appendChild(root);

  const el = {
    alt: root.querySelector('[data-k="alt"]'),
    vit: root.querySelector('[data-k="vit"]'),
    per: root.querySelector('[data-k="per"]'),
    range: root.querySelector('[data-k="range"]')
  };
  const buttons = [...root.querySelectorAll('.vis-hud-scale')];
  let scale = 1000;
  let onScale = null;

  function paintButtons() {
    for (const btn of buttons) {
      const active = Number(btn.dataset.scale) === scale;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
  }

  root.addEventListener('click', (event) => {
    const btn = event.target.closest('.vis-hud-scale');
    if (!btn) return;
    scale = Number(btn.dataset.scale);
    paintButtons();
    onScale?.(scale);
  });

  paintButtons();

  return {
    show() {
      root.hidden = false;
      root.classList.add('is-visible');
    },
    hide() {
      root.classList.remove('is-visible');
      root.hidden = true;
    },
    setTimeScale(value) {
      scale = value;
      paintButtons();
    },
    onTimeScale(fn) {
      onScale = fn;
    },
    update(t) {
      if (!t) return;
      el.alt.innerHTML = `<b>ALT</b> ${fmt(t.altitudeKm, 0)} km`;
      el.vit.innerHTML = `<b>VIT</b> ${fmt(t.speedKms, 2)} km/s`;
      el.per.innerHTML = `<b>PÉR</b> ${fmt(t.periodMin, 1)} min`;
      el.range.innerHTML = `<b>PÉRI / APO</b> ${fmt(t.periapsisKm, 0)} / ${fmt(t.apoapsisKm, 0)} km`;
    },
    dispose() {
      root.remove();
    }
  };
}
