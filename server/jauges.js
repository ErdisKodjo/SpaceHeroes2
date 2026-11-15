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
  const moments = [];
  const rapports = [];
  const deja = new Set();

  function marquer() {
    for (const cle of CLES_JAUGE) {
      const plafond = etat.max[cle];
      if (!plafond) continue;
      const ratio = etat.used[cle] / plafond;
      const niveau = ratio >= 1 ? 'rouge' : ratio >= 0.8 ? 'orange' : null;
      if (!niveau) continue;
      const clef = `${cle}:${niveau}`;
      if (deja.has(clef)) continue;
      deja.add(clef);
      moments.push({ type: 'jauge', cle, niveau });
    }
  }

  function copie() {
    return {
      max: { ...etat.max },
      used: { ...etat.used },
      reserveVeto: etat.reserveVeto,
      vetoUtilise: etat.vetoUtilise,
      moments: moments.map((m) => ({ ...m })),
      rapports: rapports.map((r) => ({ ...r }))
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
      marquer();
      return { ok: true, etat: copie() };
    },
    usage(valeurs) {
      if (!valeurs || typeof valeurs !== 'object') return { ok: false, raison: 'jauge' };
      for (const cle of CLES_JAUGE) {
        const n = nombre(valeurs[cle]);
        if (n === null || n < 0 || n > 100000) return { ok: false, raison: 'jauge' };
      }
      for (const cle of CLES_JAUGE) etat.used[cle] = nombre(valeurs[cle]);
      marquer();
      return { ok: true, etat: copie() };
    },
    plafond(cle, delta) {
      const n = nombre(delta);
      if (!CLES_JAUGE.includes(cle) || n === null || Math.abs(n) > 1000) {
        return { ok: false, raison: 'jauge' };
      }
      etat.max[cle] += n;
      marquer();
      return { ok: true, etat: copie() };
    },
    veto(roleId) {
      if (roleId !== 'directeur') return { ok: false, raison: 'role' };
      if (etat.vetoUtilise || etat.reserveVeto < PRIX_VETO) return { ok: false, raison: 'reserve' };
      etat.reserveVeto -= PRIX_VETO;
      etat.vetoUtilise = true;
      if (!deja.has('veto')) {
        deja.add('veto');
        moments.push({ type: 'veto' });
      }
      return { ok: true, etat: copie() };
    },
    noterScore(ligne) {
      const score = Math.max(0, Math.min(100, Math.round(Number(ligne.score) || 0)));
      const medaille = ['or', 'argent', 'bronze', 'aucune'].includes(ligne.medaille) ? ligne.medaille : 'aucune';
      const propre = {
        id: ligne.id,
        nom: String(ligne.nom || 'Commandant').slice(0, 24),
        roleId: ligne.roleId || null,
        score,
        medaille
      };
      const index = rapports.findIndex((r) => r.id === propre.id);
      if (index >= 0) rapports[index] = propre;
      else rapports.push(propre);
      return { ok: true, etat: copie() };
    }
  };
}

export function contraintesChapitre(chapterId) {
  const fichier = new URL(`../src/data/chapters/${chapterId}.json`, import.meta.url);
  const chapitre = JSON.parse(readFileSync(fichier, 'utf8'));
  return chapitre.contraintes || {};
}
