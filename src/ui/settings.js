// Ecran Parametres.
// Les options restent en brouillon jusqu'au bouton Enregistrer.
// Fermer, Annuler ou Echap abandonne le brouillon.

import { settingsStore } from '../engine/settings-store.js';
import { t } from '../i18n.js';

function radio(name, options, currentVal) {
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

function clone(settings) {
  return { ...settings };
}

function buildHTML(s, dirty) {
  const difficulties = [
    { id: 'cadet', label: t('Cadet', 'Cadet'), desc: t('Marges larges, CML 1-2 pré-validés, 0 imprévu', 'Wide margins, CML 1-2 pre-validated, no surprise') },
    { id: 'ingenieur', label: t('Ingénieur', 'Engineer'), desc: t('Marges standard, quelques imprévus', 'Standard margins, a few surprises') },
    { id: 'directeur', label: t('Directeur de mission', 'Mission director'), desc: t('4 niveaux CML intégraux, imprévus fréquents', 'All 4 CML levels, frequent surprises') },
    { id: 'bac_sable', label: t('Bac à sable', 'Sandbox'), desc: t('Exploration libre, toutes technologies débloquées', 'Free exploration, every technology unlocked') }
  ];
  const modes = [
    { id: 'campagne', label: t('Campagne', 'Campaign'), desc: t('Progression chapitre par chapitre', 'Chapter by chapter') },
    { id: 'defi', label: t('Défi', 'Challenge'), desc: t('Masse -20 %, fenêtre -30 %', 'Mass −20%, window −30%') },
    { id: 'decouverte', label: t('Découverte', 'Discovery'), desc: t('Exploration sans pression de score', 'Explore without score pressure') }
  ];
  const graphics = [
    { id: 'basse', label: t('Basse', 'Low') },
    { id: 'moyenne', label: t('Moyenne', 'Medium') },
    { id: 'haute', label: t('Haute', 'High') },
    { id: 'ultra', label: 'Ultra' }
  ];
  const colorBlind = [
    { id: 'none', label: t('Désactivé', 'Off') },
    { id: 'deuteranopie', label: t('Deutéranopie', 'Deuteranopia') },
    { id: 'protanopie', label: t('Protanopie', 'Protanopia') },
    { id: 'tritanopie', label: t('Tritanopie', 'Tritanopia') }
  ];
  const fonts = [
    { id: 'normale', label: t('Normale', 'Normal') },
    { id: 'grande', label: t('Grande', 'Large') },
    { id: 'tres_grande', label: t('Très grande', 'Extra large') }
  ];

  return `
    <div class="sh-settings-overlay" role="dialog" aria-modal="true" aria-label="${t('Paramètres', 'Settings')}">
      <div class="sh-settings-panel">

        <div class="sh-settings-header">
          <span class="sh-settings-title">${t('PARAMÈTRES', 'SETTINGS')}</span>
          <button type="button" class="sh-settings-close" aria-label="${t('Fermer', 'Close')}">✕</button>
        </div>

        <div class="sh-settings-body">

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Mode de jeu', 'Game mode')}</h2>

            <div class="sh-field">
              <div class="sh-field-label">${t('Difficulté', 'Difficulty')}</div>
              <div class="sh-radios" data-group="difficulty">
                ${radio('difficulty', difficulties, s.difficulty)}
              </div>
            </div>

            <div class="sh-field">
              <div class="sh-field-label">${t('Mode', 'Mode')}</div>
              <div class="sh-radios" data-group="gameMode">
                ${radio('gameMode', modes, s.gameMode)}
              </div>
            </div>

            ${toggle('tutorial', t('Tutoriel guidé', 'Guided tutorial'), s.tutorial)}
            ${toggle('randomEvents', t('Événements aléatoires', 'Random events'), s.randomEvents)}

            <label class="sh-select">
              <span class="sh-select-label">${t('Vitesse de simulation par défaut', 'Default simulation speed')}</span>
              <select data-key="defaultTimeScale">
                <option value="1" ${Number(s.defaultTimeScale) === 1 ? 'selected' : ''}>${t('×1 — Temps réel', '×1 — Real time')}</option>
                <option value="100" ${Number(s.defaultTimeScale) === 100 ? 'selected' : ''}>×100</option>
                <option value="1000" ${Number(s.defaultTimeScale) === 1000 ? 'selected' : ''}>×1000</option>
              </select>
            </label>
          </section>

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Audio', 'Audio')}</h2>
            ${slider('volume', t('Volume général', 'Master volume'), s.volume, 0, 1, 0.05)}
            ${slider('sfxVolume', t('Effets sonores', 'Sound effects'), s.sfxVolume, 0, 1, 0.05)}
            ${slider('ambientVolume', t('Musique d\'ambiance', 'Ambient music'), s.ambientVolume, 0, 1, 0.05)}
            ${toggle('voiceEnabled', t('Voix ASTRA', 'ASTRA voice'), s.voiceEnabled)}
          </section>

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Affichage', 'Display')}</h2>

            <div class="sh-field">
              <div class="sh-field-label">${t('Qualité graphique', 'Graphics quality')}</div>
              <div class="sh-radios" data-group="graphicsQuality">
                ${radio('graphicsQuality', graphics, s.graphicsQuality)}
              </div>
            </div>

            ${toggle('fullscreen', t('Plein écran', 'Fullscreen'), s.fullscreen)}
            ${toggle('reduceMotion', t('Réduction de mouvement', 'Reduce motion'), s.reduceMotion)}
            ${toggle('highContrast', t('Contrastes élevés', 'High contrast'), s.highContrast)}

            ${select('colorBlind', t('Mode daltonien', 'Color-blind mode'), colorBlind, s.colorBlind)}
            ${select('fontSize', t('Taille de police', 'Font size'), fonts, s.fontSize)}
          </section>

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Accessibilité', 'Accessibility')}</h2>
            ${toggle('subtitles', t('Sous-titres ASTRA', 'ASTRA subtitles'), s.subtitles)}
            ${select('readingSpeed', t('Vitesse de lecture', 'Reading speed'), [
              { id: 'normale', label: t('Normale', 'Normal') },
              { id: 'lente', label: t('Lente', 'Slow') }
            ], s.readingSpeed)}
          </section>

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Langue', 'Language')}</h2>
            <div class="sh-radios" data-group="language">
              ${radio('language', [
                { id: 'fr', label: 'Français' },
                { id: 'en', label: 'English' }
              ], s.language)}
            </div>
            <p class="sh-field-label">${t('La langue s\'applique à l\'enregistrement.', 'Language applies when you save.')}</p>
          </section>

          <section class="sh-section">
            <h2 class="sh-section-title">${t('Données', 'Data')}</h2>
            <div class="sh-data-actions">
              <button type="button" class="sh-btn sh-btn--danger" data-action="reset-save">
                ${t('Effacer la sauvegarde', 'Erase save')}
              </button>
              <button type="button" class="sh-btn" data-action="export-save">
                ${t('Exporter la progression', 'Export progress')}
              </button>
              <label class="sh-btn sh-btn--import">
                ${t('Importer une sauvegarde', 'Import a save')}
                <input type="file" accept=".json" style="display:none" data-action="import-save">
              </label>
            </div>
          </section>

        </div>

        <footer class="sh-settings-footer">
          <button type="button" class="sh-btn" data-action="cancel">${t('Annuler', 'Cancel')}</button>
          <button type="button" class="sh-btn sh-btn--primary" data-action="save" ${dirty ? '' : 'disabled'}>
            ${t('Enregistrer', 'Save')}
          </button>
        </footer>
      </div>
    </div>
  `;
}

function applyFullscreen(value) {
  if (value && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else if (!value && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

export function createSettings({ onClose, onSaved } = {}) {
  const container = document.createElement('div');
  container.id = 'sh-settings-root';
  document.body.appendChild(container);

  let saved = clone(settingsStore.getAll());
  let draft = clone(saved);

  function isDirty() {
    return Object.keys(saved).some((key) => draft[key] !== saved[key]);
  }

  function refresh() {
    const body = container.querySelector('.sh-settings-body');
    const scroll = body ? body.scrollTop : 0;
    container.innerHTML = buildHTML(draft, isDirty());
    bindEvents();
    const nextBody = container.querySelector('.sh-settings-body');
    if (nextBody) nextBody.scrollTop = scroll;
  }

  function close() {
    document.removeEventListener('keydown', onKey);
    container.remove();
    onClose?.();
  }

  function commit() {
    if (!isDirty()) return;
    const prev = saved;
    settingsStore.replaceAll(draft);
    saved = clone(settingsStore.getAll());
    draft = clone(saved);
    if (Boolean(prev.fullscreen) !== Boolean(saved.fullscreen)) {
      applyFullscreen(Boolean(saved.fullscreen));
    }
    refresh();
    onSaved?.();
  }

  function bindEvents() {
    container.querySelector('.sh-settings-close').addEventListener('click', close);
    container.querySelector('.sh-settings-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) close();
    });
    container.querySelector('[data-action="cancel"]').addEventListener('click', close);
    container.querySelector('[data-action="save"]').addEventListener('click', commit);

    container.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        draft[input.name] = input.name === 'defaultTimeScale' ? Number(input.value) : input.value;
        const group = input.closest('.sh-radios');
        group?.querySelectorAll('.sh-radio').forEach((label) => label.classList.remove('is-active'));
        input.closest('.sh-radio')?.classList.add('is-active');
        container.querySelector('[data-action="save"]').disabled = !isDirty();
      });
    });

    container.querySelectorAll('.sh-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        draft[key] = !draft[key];
        btn.classList.toggle('is-on', draft[key]);
        btn.setAttribute('aria-checked', String(draft[key]));
        container.querySelector('[data-action="save"]').disabled = !isDirty();
      });
    });

    container.querySelectorAll('input[type="range"]').forEach((input) => {
      const display = container.querySelector(`[data-for="${input.dataset.key}"]`);
      input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        draft[input.dataset.key] = val;
        if (display) display.textContent = `${Math.round(val * 100)}%`;
        container.querySelector('[data-action="save"]').disabled = !isDirty();
      });
    });

    container.querySelectorAll('select[data-key]').forEach((sel) => {
      sel.addEventListener('change', () => {
        draft[sel.dataset.key] = sel.dataset.key === 'defaultTimeScale'
          ? Number(sel.value)
          : sel.value;
        container.querySelector('[data-action="save"]').disabled = !isDirty();
      });
    });

    container.querySelector('[data-action="reset-save"]')?.addEventListener('click', () => {
      const ok = confirm(t(
        'Effacer toute la progression ? Cette action est irréversible.',
        'Erase all progress? This cannot be undone.'
      ));
      if (!ok) return;
      localStorage.removeItem('sh-save');
      settingsStore.reset();
      saved = clone(settingsStore.getAll());
      draft = clone(saved);
      refresh();
      onSaved?.();
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
      URL.revokeObjectURL(a.href);
    });

    container.querySelector('[data-action="import-save"]')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.save) localStorage.setItem('sh-save', data.save);
          if (data.settings) settingsStore.replaceAll(data.settings);
          saved = clone(settingsStore.getAll());
          draft = clone(saved);
          refresh();
          onSaved?.();
          alert(t('Sauvegarde importée avec succès.', 'Save imported.'));
        } catch {
          alert(t('Fichier invalide.', 'Invalid file.'));
        }
      };
      reader.readAsText(file);
    });
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  document.addEventListener('keydown', onKey);
  refresh();

  return { close };
}

export function applyDocumentSettings() {
  const s = settingsStore.getAll();
  const html = document.documentElement;

  html.lang = s.language === 'en' ? 'en' : 'fr';
  html.dataset.fontSize = s.fontSize;
  html.classList.toggle('high-contrast', s.highContrast);
  html.classList.toggle('reduce-motion', s.reduceMotion);

  const FILTERS = {
    none: '',
    deuteranopie: 'url(#sh-deuteranopia)',
    protanopie: 'url(#sh-protanopia)',
    tritanopie: 'url(#sh-tritanopia)'
  };
  document.body.style.filter = FILTERS[s.colorBlind] || '';
}
