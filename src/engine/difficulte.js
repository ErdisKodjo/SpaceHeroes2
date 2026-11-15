// Ce que le réglage Difficulté change dans une mission.
// Cadet : plafonds plus larges, CML 1 et 2 déjà verts, pas d'aléa.
// Ingénieur : la mission telle quelle, l'aléa suit le réglage des événements.
// Directeur : plafonds plus serrés, l'aléa est toujours là, CML 3 puis 4 exigés.
// Bac à sable : les portes CML ne retiennent pas l'épisode.

import { settingsStore } from './settings-store.js';

const MARGES = {
  cadet: 1.15,
  ingenieur: 1,
  directeur: 0.85,
  bac_sable: 1
};

const NOMS = {
  cadet: ['Cadet', 'Cadet'],
  ingenieur: ['Ingénieur', 'Engineer'],
  directeur: ['Directeur', 'Director'],
  bac_sable: ['Bac à sable', 'Sandbox']
};

const PLAFONDS = ['masse', 'budget', 'puissance', 'duree'];

export function difficulteCourante() {
  return settingsStore.get('difficulty') || 'ingenieur';
}

export function appliquerMarge(resources) {
  const id = difficulteCourante();
  const facteur = MARGES[id] ?? 1;
  if (!resources?.max || facteur === 1) return;
  for (const cle of PLAFONDS) {
    if (resources.max[cle] == null) continue;
    resources.max[cle] *= facteur;
  }
  const nom = NOMS[id] || NOMS.ingenieur;
  resources.margeNote = { difficulte: id, facteur, label: nom[0], labelEn: nom[1] };
}

// ASTRA coche les critères. Le joueur ne le fait pas.
export function prevaliderCml(astra) {
  if (difficulteCourante() !== 'cadet' || !astra?.cml) return;
  for (const critere of astra.cml.criteria) {
    if (critere.niveau === 1 || critere.niveau === 2) {
      astra.evaluerCritereCml(critere.id, 'vert');
    }
  }
}

export function evenementAutorise() {
  const id = difficulteCourante();
  if (id === 'cadet') return false;
  if (id === 'directeur') return true;
  return settingsStore.get('randomEvents') !== false;
}

export function porteOuverte() {
  return difficulteCourante() === 'bac_sable';
}

// 0 si rien de plus ne bloque. Sinon le numéro du CML manquant.
export function niveauxDirecteur(episode, cml) {
  if (difficulteCourante() !== 'directeur' || !cml) return 0;
  if (episode?.type === 'atelier' && !cml.isLevelValidated(3)) return 3;
  if (episode?.type === 'essais' && !cml.isLevelValidated(4)) return 4;
  return 0;
}
