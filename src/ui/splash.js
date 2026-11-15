// Splash screen — Space Heroes (Sprint 5).
// Affiché au démarrage pendant le chargement des 4 textures NASA.
// Disparaît en fondu une fois tout chargé, ou après 6 s max (timeout sécurité).
//
// API :
//   const splash = createSplash()
//   splash.onProgress(loaded, total)   ← appelée depuis earth.js
//   splash.dismiss()                   ← forcer la disparition
//   await splash.ready                 ← Promise résolue quand le splash est retiré

import { t } from '../i18n.js';

function steps() {
  return [
    t('Chargement de la surface terrestre…', 'Loading the Earth surface…'),
    t('Chargement des lumières nocturnes…', 'Loading the night lights…'),
    t('Chargement du relief océanique…', 'Loading the ocean relief…'),
    t('Chargement de la couverture nuageuse…', 'Loading the cloud cover…')
  ];
}

export function createSplash() {
  let resolveReady;
  const ready = new Promise(res => { resolveReady = res; });

  let loaded = 0;
  const total = 4;
  let dismissed = false;
  let timeoutId = null;

  // ── DOM ──────────────────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'sh-splash';
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.setAttribute('aria-label', t('Chargement de Space Heroes', 'Loading Space Heroes'));

  root.innerHTML = `
    <div class="sh-splash-bg"></div>
    <div class="sh-splash-stars" aria-hidden="true">
      ${Array.from({ length: 60 }, (_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const s = 0.5 + Math.random() * 1.5;
        const d = (Math.random() * 3).toFixed(1);
        return `<span style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></span>`;
      }).join('')}
    </div>
    <div class="sh-splash-content">
      <div class="sh-splash-logo">
        <img src="/logo.png" alt="Space Heroes" width="819" height="819">
      </div>
      <div class="sh-splash-brand">
        <span class="sh-splash-kicker">NASA SPACE APPS CHALLENGE</span>
        <span class="sh-splash-sub">${t('Conception de mission spatiale', 'Spacecraft mission design')}</span>
      </div>
      <div class="sh-splash-loader">
        <div class="sh-splash-bar-track" role="progressbar"
          aria-valuemin="0" aria-valuemax="4" aria-valuenow="0" id="sh-splash-bar-role">
          <div class="sh-splash-bar-fill" id="sh-splash-bar"></div>
          <div class="sh-splash-bar-glow" id="sh-splash-glow"></div>
        </div>
        <p class="sh-splash-step" id="sh-splash-step">${t('Initialisation…', 'Starting…')}</p>
        <p class="sh-splash-pct" id="sh-splash-pct">0 %</p>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // Timeout de sécurité — 7 s max quelle que soit la connexion
  timeoutId = setTimeout(() => dismiss(), 7000);

  // ── Mise à jour de la barre ───────────────────────────────────────────────
  function update() {
    const pct = Math.round((loaded / total) * 100);
    const bar    = root.querySelector('#sh-splash-bar');
    const glow   = root.querySelector('#sh-splash-glow');
    const step   = root.querySelector('#sh-splash-step');
    const pctEl  = root.querySelector('#sh-splash-pct');
    const role   = root.querySelector('#sh-splash-bar-role');

    if (bar)   bar.style.width   = `${pct}%`;
    if (glow)  glow.style.left   = `${pct}%`;
    if (step)  step.textContent  = steps()[Math.min(loaded, steps().length - 1)];
    if (pctEl) pctEl.textContent = `${pct} %`;
    if (role)  role.setAttribute('aria-valuenow', String(loaded));

    if (loaded >= total) {
      // Petit délai pour que l'animation de barre arrive à 100 % avant le fondu
      setTimeout(() => dismiss(), 350);
    }
  }

  // ── Disparition ───────────────────────────────────────────────────────────
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timeoutId);
    root.classList.add('is-out');
    // Retirer du DOM après la transition CSS (600 ms)
    setTimeout(() => {
      root.remove();
      resolveReady();
    }, 650);
  }

  return {
    ready,
    /** Appelée par earth.js à chaque texture chargée. */
    onProgress(n) {
      loaded = Math.min(n, total);
      update();
    },
    dismiss
  };
}
