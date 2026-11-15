// Langue d'interface. Le français est la valeur par défaut.
// Une chaîne anglaise absente reste en français.

import { settingsStore } from './engine/settings-store.js';

export function lang() {
  return settingsStore.get('language') === 'en' ? 'en' : 'fr';
}

export function t(fr, en) {
  if (lang() === 'en' && en) return en;
  return fr;
}

export function tf(fr, en, vars) {
  let text = t(fr, en);
  if (!vars) return text;
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${key}}`, String(value ?? ''));
  }
  return text;
}

export function pick(obj, key) {
  if (!obj) return '';
  return t(obj[key], obj[`${key}En`]);
}
