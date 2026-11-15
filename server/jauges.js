// Jauges et réserve de veto d'une partie à 4.
// Le serveur est la seule copie. Les navigateurs affichent cet état.

import { readFileSync } from 'node:fs';

export const CLES_JAUGE = [
  'budget',
  'masse',
  'puissance',
  'donnees',
  'communications',
  'duree'
];

const PRIX_VETO = 2;

function nombre(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

export function creerJauges(contraintes = {}) {
  const max = {};
  const used = {};
  for (const cle of CLES_JAUGE) {
    max[cle] = Math.max(0, nombre(contraintes[cle]) ?? 0);
    used[cle] = 0;
  }
  const etat = {
    max,
    used,
    reserveVeto: PRIX_VETO,
    vetoUtilise: false
  };

  function copie() {
    return {
      max: { ...etat.max },
      used: { ...etat.used },
      reserveVeto: etat.reserveVeto,
      vetoUtilise: etat.vetoUtilise
    };
  }

  return {
    etat: copie,
    depense(cle, montant) {
      const n = nombre(montant);
      if (!CLES_JAUGE.includes(cle) || n === null || Math.abs(n) > 1000) {
        return { ok: false, raison: 'jauge' };
      }
      etat.used[cle] += n;
      return { ok: true, etat: copie() };
    },
    usage(valeurs) {
      if (!valeurs || typeof valeurs !== 'object') return { ok: false, raison: 'jauge' };
      for (const cle of CLES_JAUGE) {
        const n = nombre(valeurs[cle]);
        if (n === null || n < 0 || n > 100000) return { ok: false, raison: 'jauge' };
      }
      for (const cle of CLES_JAUGE) etat.used[cle] = nombre(valeurs[cle]);
      return { ok: true, etat: copie() };
    },
    plafond(cle, delta) {
      const n = nombre(delta);
      if (!CLES_JAUGE.includes(cle) || n === null || Math.abs(n) > 1000) {
        return { ok: false, raison: 'jauge' };
      }
      etat.max[cle] += n;
      return { ok: true, etat: copie() };
    },
    veto(roleId) {
      if (roleId !== 'directeur') return { ok: false, raison: 'role' };
      if (etat.vetoUtilise || etat.reserveVeto < PRIX_VETO) return { ok: false, raison: 'reserve' };
      etat.reserveVeto -= PRIX_VETO;
      etat.vetoUtilise = true;
      return { ok: true, etat: copie() };
    }
  };
}

export function contraintesChapitre(chapterId) {
  const fichier = new URL(`../src/data/chapters/${chapterId}.json`, import.meta.url);
  const chapitre = JSON.parse(readFileSync(fichier, 'utf8'));
  return chapitre.contraintes || {};
}
