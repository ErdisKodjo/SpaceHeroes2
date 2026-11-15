// Stockage et lecture des paramètres du jeu (localStorage clé 'sh-settings').
// Fusionne les valeurs sauvegardées avec les defaults pour garantir la compatibilité
// après une mise à jour qui ajoute de nouvelles options.

import defaults from '../data/settings-defaults.json';

const KEY = 'sh-settings';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

function save(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // quota localStorage dépassé — pas bloquant
  }
}

// Instance singleton partagée dans toute l'app.
let _settings = load();

export const settingsStore = {
  get(key) {
    return _settings[key];
  },
  set(key, value) {
    _settings[key] = value;
    save(_settings);
    window.dispatchEvent(new CustomEvent('settings-change', { detail: { key, value } }));
  },
  replaceAll(next) {
    _settings = { ...defaults, ...next };
    save(_settings);
    window.dispatchEvent(new CustomEvent('settings-change', { detail: { key: '*', value: { ..._settings } } }));
  },
  getAll() {
    return { ..._settings };
  },
  reset() {
    _settings = { ...defaults };
    save(_settings);
    window.dispatchEvent(new CustomEvent('settings-change', { detail: { key: '*', value: _settings } }));
  }
};
