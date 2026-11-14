// Ecran Parametres — accessible depuis le QG (bouton ⚙️) et depuis la pause en jeu.
// Toutes les options sont groupees en 6 sections. Chaque changement est persiste
// immediatement via settingsStore.

import { settingsStore } from '../engine/settings-store.js';

const DIFFICULTIES = [
  { id: 'cadet',      label: 'Cadet',               desc: 'Marges larges, CML 1-2 pré-validés, 0 imprévu' },
  { id: 'ingenieur',  label: 'Ingénieur',            desc: 'Marges standard, quelques imprévus' },
  { id: 'directeur',  label: 'Directeur de mission', desc: '4 niveaux CML intégraux, imprévus fréquents' },
  { id: 'bac_sable',  label: 'Bac à sable',          desc: 'Exploration libre, toutes technologies débloquées' }
];

const GAME_MODES = [
  { id: 'campagne',   label: 'Campagne',   desc: 'Progression chapitre par chapitre' },
  { id: 'defi',       label: 'Défi',       desc: 'Masse -20 %, fenêtre -30 %' },
  { id: 'decouverte', label: 'Découverte', desc: 'Exploration sans pression de score' }
];

const COLOR_BLIND_MODES = [
  { id: 'none',          label: 'Désactivé' },
  { id: 'deuteranopie',  label: 'Deutéranopie' },
  { id: 'protanopie',    label: 'Protanopie' },
  { id: 'tritanopie',    label: 'Tritanopie' }
];

const FONT_SIZES = [
  { id: 'normale',      label: 'Normale' },
  { id: 'grande',       label: 'Grande' },
  { id: 'tres_grande',  label: 'Très grande' }
];

// ---- helpers ---------------------------------------------------------------

function radio(name, options, currentVal, onChange) {
  return options.map(opt => `
    <label class="sh-radio ${opt.id === currentVal ? 'is-active' : ''}">
      <input type="radio" name="${name}" value="${opt.id}"
        ${opt.id === currentVal ? 'checked' : ''}>
      <span class="sh-radio-label">${opt.label}</span>
      ${opt.desc ? `<span class="sh-radio-desc">${opt.desc}</span>` : ''}
    </label>
  `).join('');
}

function toggle(key, label, currentVal) {
  return `
    <label class="sh-toggle">
      <span class="sh-toggle-label">${label}</span>
      <button type="button" class="sh-toggle-btn ${currentVal ? 'is-on' : ''}"
        data-key="${key}" role="switch" aria-checked="${currentVal}">
        <span class="sh-toggle-knob"></span>
      </button>
    </label>
  `;
}

function slider(key, label, val, min, max, step) {
  return `
    <label class="sh-slider">
      <span class="sh-slider-label">${label}</span>
      <div class="sh-slider-row">
        <input type="range" data-key="${key}" min="${min}" max="${max}"
          step="${step}" value="${val}">
        <span class="sh-slider-val" data-for="${key}">${Math.round(val * 100)}%</span>
      </div>
    </label>
  `;
}

function select(key, label, options, currentVal) {
  const opts = options.map(o =>
    `<option value="${o.id}" ${o.id === currentVal ? 'selected' : ''}>${o.label}</option>`
  ).join('');
  return `
    <label class="sh-select">
      <span class="sh-select-label">${label}</span>
      <select data-key="${key}">${opts}</select>
    </label>
  `;
}

// ---- rendu principal -------------------------------------------------------

function buildHTML(s) {
  return `
    <div class="sh-settings-overlay" role="dialog" aria-modal="true" aria-label="Paramètres">
      <div class="sh-settings-panel">

        <div class="sh-settings-header">
          <span class="sh-settings-title">⚙️ PARAMÈTRES</span>
          <button type="button" class="sh-settings-close" aria-label="Fermer">✕</button>
        </div>

        <div class="sh-settings-body">

          <!-- SECTION MODE DE JEU -->
          <section class="sh-section">
            <h2 class="sh-section-title">Mode de jeu</h2>

            <div class="sh-field">
              <div class="sh-field-label">Difficulté</div>
              <div class="sh-radios" data-group="difficulty">
                ${radio('difficulty', DIFFICULTIES, s.difficulty)}
              </div>
            </div>

            <div class="sh-field">
              <div class="sh-field-label">Mode</div>
              <div class="sh-radios" data-group="gameMode">
                ${radio('gameMode', GAME_MODES, s.gameMode)}
              </div>
            </div>

            ${toggle('tutorial',      'Tutoriel guidé',          s.tutorial)}
            ${toggle('randomEvents',  'Événements aléatoires',   s.randomEvents)}

            <label class="sh-select">
              <span class="sh-select-label">Vitesse de simulation par défaut</span>
              <select data-key="defaultTimeScale">
                <option value="1"    ${s.defaultTimeScale===1    ? 'selected':''}>×1 — Temps réel</option>
                <option value="100"  ${s.defaultTimeScale===100  ? 'selected':''}>×100</option>
                <option value="1000" ${s.defaultTimeScale===1000 ? 'selected':''}>×1000</option>
              </select>
            </label>
          </section>

          <!-- SECTION AUDIO -->
          <section class="sh-section">
            <h2 class="sh-section-title">Audio</h2>
            ${slider('volume',        'Volume général',    s.volume,        0, 1, 0.05)}
            ${slider('sfxVolume',     'Effets sonores',    s.sfxVolume,     0, 1, 0.05)}
            ${slider('ambientVolume', 'Musique d\'ambiance', s.ambientVolume, 0, 1, 0.05)}
            ${toggle('voiceEnabled',  'Voix ASTRA',        s.voiceEnabled)}
          </section>

          <!-- SECTION AFFICHAGE -->
          <section class="sh-section">
            <h2 class="sh-section-title">Affichage</h2>

            <div class="sh-field">
              <div class="sh-field-label">Qualité graphique</div>
              <div class="sh-radios" data-group="graphicsQuality">
                ${radio('graphicsQuality', [
                  { id: 'basse',   label: 'Basse' },
                  { id: 'moyenne', label: 'Moyenne' },
                  { id: 'haute',   label: 'Haute' },
                  { id: 'ultra',   label: 'Ultra' }
                ], s.graphicsQuality)}
              </div>
            </div>

            ${toggle('fullscreen',    'Plein écran',          s.fullscreen)}
            ${toggle('reduceMotion',  'Réduction de mouvement', s.reduceMotion)}
            ${toggle('highContrast',  'Contrastes élevés',    s.highContrast)}

            ${select('colorBlind', 'Mode daltonien', COLOR_BLIND_MODES, s.colorBlind)}
            ${select('fontSize',   'Taille de police', FONT_SIZES, s.fontSize)}
          </section>

          <!-- SECTION ACCESSIBILITE -->
          <section class="sh-section">
            <h2 class="sh-section-title">Accessibilité</h2>
            ${toggle('subtitles', 'Sous-titres ASTRA', s.subtitles)}
            ${select('readingSpeed', 'Vitesse de lecture', [
              { id: 'normale', label: 'Normale' },
              { id: 'lente',   label: 'Lente' }
            ], s.readingSpeed)}
          </section>

          <!-- SECTION LANGUE -->
          <section class="sh-section">
            <h2 class="sh-section-title">Langue</h2>
            <div class="sh-radios" data-group="language">
              ${radio('language', [
                { id: 'fr', label: 'Français' },
                { id: 'en', label: 'English' }
              ], s.language)}
            </div>
          </section>

          <!-- SECTION DONNEES -->
          <section class="sh-section">
            <h2 class="sh-section-title">Données</h2>
            <div class="sh-data-actions">
              <button type="button" class="sh-btn sh-btn--danger" data-action="reset-save">
                🗑 Effacer la sauvegarde
              </button>
              <button type="button" class="sh-btn" data-action="export-save">
                ⬇ Exporter la progression
              </button>
              <label class="sh-btn sh-btn--import">
                ⬆ Importer une sauvegarde
                <input type="file" accept=".json" style="display:none" data-action="import-save">
              </label>
            </div>
          </section>

        </div><!-- /.sh-settings-body -->
      </div><!-- /.sh-settings-panel -->
    </div><!-- /.sh-settings-overlay -->
  `;
}

// ---- logique ----------------------------------------------------------------

export function createSettings({ onClose } = {}) {
  const container = document.createElement('div');
  container.id = 'sh-settings-root';
  document.body.appendChild(container);

  function refresh() {
    container.innerHTML = buildHTML(settingsStore.getAll());
    bindEvents();
  }

  function bindEvents() {
    // Fermeture
    container.querySelector('.sh-settings-close')
      .addEventListener('click', close);
    container.querySelector('.sh-settings-overlay')
      .addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

    // Radios
    container.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        const val = input.name === 'defaultTimeScale' ? Number(input.value) : input.value;
        settingsStore.set(input.name, val);
        // Mettre a jour la classe active dans le groupe
        const group = input.closest('.sh-radios');
        group?.querySelectorAll('.sh-radio').forEach(l => l.classList.remove('is-active'));
        input.closest('.sh-radio')?.classList.add('is-active');
      });
    });

    // Toggles
    container.querySelectorAll('.sh-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const newVal = !settingsStore.get(key);
        settingsStore.set(key, newVal);
        btn.classList.toggle('is-on', newVal);
        btn.setAttribute('aria-checked', String(newVal));
        applyImmediate(key, newVal);
      });
    });

    // Sliders
    container.querySelectorAll('input[type="range"]').forEach(input => {
      const display = container.querySelector(`[data-for="${input.dataset.key}"]`);
      input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        settingsStore.set(input.dataset.key, val);
        if (display) display.textContent = `${Math.round(val * 100)}%`;
        applyImmediate(input.dataset.key, val);
      });
    });

    // Selects
    container.querySelectorAll('select[data-key]').forEach(sel => {
      sel.addEventListener('change', () => {
        const val = sel.dataset.key === 'defaultTimeScale' ? Number(sel.value) : sel.value;
        settingsStore.set(sel.dataset.key, val);
        applyImmediate(sel.dataset.key, val);
      });
    });

    // Actions données
    container.querySelector('[data-action="reset-save"]')?.addEventListener('click', () => {
      if (confirm('Effacer toute la progression ? Cette action est irréversible.')) {
        localStorage.removeItem('sh-save');
        settingsStore.reset();
        refresh();
      }
    });

    container.querySelector('[data-action="export-save"]')?.addEventListener('click', () => {
      const data = {
        settings: settingsStore.getAll(),
        save: localStorage.getItem('sh-save')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'spaceheroes-save.json';
      a.click();
    });

    container.querySelector('[data-action="import-save"]')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.save) localStorage.setItem('sh-save', data.save);
          if (data.settings) Object.entries(data.settings).forEach(([k, v]) => settingsStore.set(k, v));
          refresh();
          alert('Sauvegarde importée avec succès.');
        } catch {
          alert('Fichier invalide.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Applique certains réglages immédiatement sans rechargement de page
  function applyImmediate(key, value) {
    if (key === 'reduceMotion' || key === 'highContrast' || key === 'colorBlind' || key === 'fontSize') {
      applyDocumentSettings();
    }
    if (key === 'fullscreen') {
      if (value && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!value && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function close() {
    container.remove();
    onClose?.();
  }

  refresh();
  // Fermeture clavier Escape
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey, { once: true });

  return { close };
}

// Applique les réglages visuels sur <html> au démarrage et à chaque changement
export function applyDocumentSettings() {
  const s = settingsStore.getAll();
  const html = document.documentElement;

  // Taille de police
  html.dataset.fontSize = s.fontSize;

  // Contrastes élevés
  html.classList.toggle('high-contrast', s.highContrast);

  // Réduction de mouvement
  html.classList.toggle('reduce-motion', s.reduceMotion);

  // Mode daltonien : filtre SVG sur <body>
  const FILTERS = {
    none:         '',
    deuteranopie: 'url(#sh-deuteranopia)',
    protanopie:   'url(#sh-protanopia)',
    tritanopie:   'url(#sh-tritanopia)'
  };
  document.body.style.filter = FILTERS[s.colorBlind] || '';
}
