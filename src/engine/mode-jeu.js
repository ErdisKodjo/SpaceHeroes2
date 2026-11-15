// Campagne, Défi, Découverte. Le réglage est lu au départ d'une mission.
// Campagne : les chapitres se suivent, le score est gardé.
// Défi : la masse perd 20 %, la durée de mission perd 30 %.
// Découverte : le parcours n'est pas classé et n'ouvre pas le chapitre suivant.

import { settingsStore } from './settings-store.js';

const NOMS = {
  campagne: ['Campagne', 'Campaign'],
  defi: ['Défi', 'Challenge'],
  decouverte: ['Découverte', 'Discovery']
};

export function modeCourant() {
  return settingsStore.get('gameMode') || 'campagne';
}

export function appliquerMode(resources) {
  const id = modeCourant();
  if (id === 'campagne' || !resources?.max) return;
  if (id === 'defi') {
    if (resources.max.masse != null) resources.max.masse = Math.round(resources.max.masse * 80) / 100;
    if (resources.max.duree != null) resources.max.duree = Math.round(resources.max.duree * 70) / 100;
  }
  const nom = NOMS[id] || NOMS.campagne;
  resources.modeNote = { id, label: nom[0], labelEn: nom[1] };
}

export function pressionScore() {
  return modeCourant() !== 'decouverte';
}

export function chapitresOuverts() {
  return modeCourant() === 'decouverte';
}
